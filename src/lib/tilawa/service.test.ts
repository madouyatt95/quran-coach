import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import type {RecognitionCallbacks} from '../speechRecognition';
import type {EngineCommand,EngineResult} from './protocol';
import type {WordVerdict} from '@tilawa/core';
import {TilawaService} from './service';
const assets=vi.hoisted(()=>({tilawaPackStatus:vi.fn(),cachedTilawaFile:vi.fn()}));
vi.mock('./assets',()=>assets);
class FakeWorker {
 static all:FakeWorker[]=[];onmessage:((e:{data:EngineResult})=>void)|null=null;onerror:(()=>void)|null=null;commands:(EngineCommand&{id:number})[]=[];terminate=vi.fn();
 constructor(){FakeWorker.all.push(this);}
 postMessage(c:EngineCommand&{id:number}){this.commands.push(c);if(c.type==='begin')queueMicrotask(()=>this.reply(c.id,{words:['قل','هو']}));if(c.type==='finish')queueMicrotask(()=>this.reply(c.id,{}));}
 reply(id:number,r:Partial<EngineResult>){this.onmessage?.({data:{id,events:[],verdicts:[],...r}});}
}
class FakeCapture {
 static all:FakeCapture[]=[];disconnect=vi.fn();connect=vi.fn();
 port:{onmessage:((e:{data:Float32Array|'flushed'})=>void)|null;postMessage:(s:string)=>void}={onmessage:null,postMessage:()=>{this.port.onmessage?.({data:new Float32Array([0.25])});this.port.onmessage?.({data:'flushed'});}};
 constructor(){FakeCapture.all.push(this);}
}
class FakeAudio {
 state='running';audioWorklet={addModule:vi.fn().mockResolvedValue(undefined)};resume=vi.fn().mockResolvedValue(undefined);close=vi.fn().mockResolvedValue(undefined);destination={};
 createGain(){return {gain:{value:0},connect:vi.fn()};}createMediaStreamSource(){return {connect:vi.fn()};}
}
let service:TilawaService;let callbacks:RecognitionCallbacks;let media:ReturnType<typeof vi.fn>;let stopTrack:ReturnType<typeof vi.fn>;
const drain=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
beforeEach(()=>{
 vi.useFakeTimers();FakeWorker.all=[];FakeCapture.all=[];service=new TilawaService();stopTrack=vi.fn();media=vi.fn().mockResolvedValue({getTracks:()=>[{stop:stopTrack}]});
 vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:media}});vi.stubGlobal('Worker',FakeWorker);vi.stubGlobal('AudioContext',FakeAudio);vi.stubGlobal('AudioWorkletNode',FakeCapture);
 assets.tilawaPackStatus.mockResolvedValue({ready:true});assets.cachedTilawaFile.mockResolvedValue(new Response('//worklet'));
 callbacks={onWordMatch:vi.fn(),onWordReset:vi.fn(),onCurrentWord:vi.fn(),onInterimResult:vi.fn(),onError:vi.fn(),onEnd:vi.fn()};
});
afterEach(async()=>{await service.stop();vi.runOnlyPendingTimers();await drain();vi.useRealTimers();vi.unstubAllGlobals();});
describe('local recognition lifecycle',()=>{
 it('releases a permission granted after cancellation without starting capture',async()=>{
 let grant!:(value:unknown)=>void;media.mockImplementation(()=>new Promise(resolve=>{grant=resolve;}));const starting=service.start('قل هو',callbacks,0,{surah:112,ayah:1});await drain();await service.stop();grant({getTracks:()=>[{stop:stopTrack}]});expect(await starting).toBe(false);expect(stopTrack).toHaveBeenCalledOnce();expect(FakeCapture.all).toHaveLength(0);
 });
 it('does not request microphone access until the pack is ready',async()=>{assets.tilawaPackStatus.mockResolvedValue({ready:false});expect(await service.start('قل هو',callbacks,0,{surah:112,ayah:1})).toBe(false);expect(media).not.toHaveBeenCalled();expect(callbacks.onError).toHaveBeenCalledWith(expect.stringContaining('Téléchargez'));});
 it('retracts revised acoustic evidence and never promotes uncertainty',async()=>{
 await service.start('قل هو',callbacks,0,{surah:112,ayah:1});const worker=FakeWorker.all[0],capture=FakeCapture.all[0];
 const feed=(states:string[])=>{capture.port.onmessage!({data:new Float32Array(7680)});const id=worker.commands.at(-1)!.id;worker.reply(id,{verdicts:states.map((state,word)=>({surah:112,ayah:1,word,state})) as WordVerdict[]});};
 feed(['ok','unsure']);await drain();expect(callbacks.onWordMatch).toHaveBeenCalledWith(0,true,'قل');expect(callbacks.onWordMatch).toHaveBeenCalledTimes(1);expect(callbacks.onCurrentWord).not.toHaveBeenCalledWith(2);
 feed(['unsure','unsure']);await drain();expect(callbacks.onWordReset).toHaveBeenCalledWith(0);
 });
 it('flushes the last audio block before finish and ignores repeated finish taps',async()=>{
 await service.start('قل هو',callbacks,0,{surah:112,ayah:1});const ending=service.finish();const duplicate=service.finish();await drain();const worker=FakeWorker.all[0];expect(worker.commands.map(c=>c.type)).toEqual(['begin','audio','finish']);await Promise.all([ending,duplicate]);expect(stopTrack).toHaveBeenCalled();expect(callbacks.onEnd).toHaveBeenCalledOnce();
 });
 it('discards late words after an explicit stop',async()=>{
 await service.start('قل هو',callbacks,0,{surah:112,ayah:1});FakeCapture.all[0].port.onmessage!({data:new Float32Array(7680)});const worker=FakeWorker.all[0],id=worker.commands.at(-1)!.id;await service.stop();worker.reply(id,{verdicts:[{surah:112,ayah:1,word:0,state:'ok'}] as WordVerdict[]});await drain();expect(callbacks.onWordMatch).not.toHaveBeenCalled();
 });
});
