// @vitest-environment jsdom
import {act,useEffect} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../test/memoryStorage';
import {useEditorialJourneyStore as store} from '../../stores/editorialJourneyStore';
import {useJourneyAudio} from './useJourneyAudio';
import type {EditorialJourney} from '../../lib/editorialJourneys';
const mocks=vi.hoisted(()=>({tts:vi.fn(),stop:vi.fn(),clip:vi.fn(),toggle:vi.fn(),recording:vi.fn()}));
vi.mock('../../lib/recordedNarration',()=>({getRecordedNarration:mocks.recording,narrationSentenceAt:(_entry:unknown,time:number)=>time<4?0:1}));
vi.mock('../../lib/ttsService',()=>({playTts:mocks.tts,stopTts:mocks.stop}));
vi.mock('../../lib/mediaPlayback',()=>({playMediaClip:mocks.clip}));
vi.mock('../../lib/quranApi',()=>({getAudioUrl:(_r:string,id:number)=>`audio/${id}`}));
vi.mock('../../stores/audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({isPlaying:false,togglePlay:mocks.toggle})}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const journey:EditorialJourney={id:'test:journey',title:'Parcours',kind:'story',icon:'',lessons:[],steps:[{id:'n',kind:'narrative',title:'Récit',text:'Première phrase. Deuxième phrase.'},{id:'v',kind:'verse',title:'Coran',text:'',surah:2,ayah:1},{id:'r',kind:'reflection',title:'Réflexion',text:''}]};
let root:Root,host:HTMLDivElement,api:ReturnType<typeof useJourneyAudio>;const step=vi.fn();
function Harness({recordedOnly=false}:{recordedOnly?:boolean}){const value=useJourneyAudio(journey,step,{recordedOnly});useEffect(()=>{api=value;});return <span>{value.playing?'playing':'paused'}</span>;}
beforeEach(async()=>{vi.clearAllMocks();mocks.recording.mockResolvedValue(null);vi.stubGlobal('localStorage',createMemoryStorage());store.persist.setOptions({storage:createJSONStorage(()=>localStorage)});store.setState({progress:{},notes:{}});vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});mocks.tts.mockResolvedValue(undefined);mocks.clip.mockResolvedValue(true);host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<Harness/>));});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('plays narration then the exact Quran verse, stopping at reflection without completing it',async()=>{
 await act(async()=>api.play(0));expect(mocks.tts.mock.calls.map(c=>c[0])).toEqual(['Première phrase.','Deuxième phrase.']);expect(mocks.clip.mock.calls[0][1]).toBe('audio/8');expect(step.mock.calls.map(c=>c[0])).toEqual([0,1,2]);expect(store.getState().progress[journey.id]).toMatchObject({step:'r',completed:['n','v']});expect(api.playing).toBe(false);
});
it('resumes at the saved narration sentence and cancels before advancing on pause',async()=>{
 store.getState().saveProgress(journey.id,{step:'n',sentence:1,seconds:0,completed:[]});mocks.tts.mockImplementation((_t,options)=>new Promise(resolve=>options.signal.addEventListener('abort',resolve,{once:true})));
 let running:Promise<void>;await act(async()=>{running=api.play(0);});expect(mocks.tts.mock.calls[0][0]).toBe('Deuxième phrase.');await act(async()=>{api.pause();await running;});expect(mocks.clip).not.toHaveBeenCalled();expect(store.getState().progress[journey.id].completed).toEqual([]);expect(store.getState().progress[journey.id].sentence).toBe(1);
});
it('seeks to the saved Quran time and records updated time without completing failed playback',async()=>{
 store.getState().saveProgress(journey.id,{step:'v',sentence:0,seconds:4.2,completed:['n']});mocks.clip.mockImplementation(async(player)=>{player.currentTime=7.8;player.ontimeupdate();return false;});await act(async()=>api.play(1));expect(mocks.clip.mock.calls[0][2].start).toBe(4.2);expect(store.getState().progress[journey.id]).toMatchObject({step:'v',seconds:7.8,completed:['n']});expect(api.error).toContain('Réessayez');expect(step).not.toHaveBeenCalledWith(2);
});
it('aborts its pending narration on unmount',async()=>{
 let signal:AbortSignal;mocks.tts.mockImplementation((_t,options)=>{signal=options.signal;return new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));});let running:Promise<void>;await act(async()=>{running=api.play(0);});await act(async()=>root.render(null));await running!;expect(signal!.aborted).toBe(true);expect(mocks.clip).not.toHaveBeenCalled();
});
it('starts at a tapped sentence and highlights only after actual narration start',async()=>{
 let start:(()=>void)|undefined;mocks.tts.mockImplementation((_t,options)=>{start=options.onStart;return new Promise(resolve=>options.signal.addEventListener('abort',resolve,{once:true}));});let running:Promise<void>;await act(async()=>{running=api.play(0,1);});expect(mocks.tts.mock.calls[0][0]).toBe('Deuxième phrase.');expect(api.spoken).toBe(-1);await act(async()=>start?.());expect(api.spoken).toBe(1);await act(async()=>{api.pause();await running;});expect(mocks.clip).not.toHaveBeenCalled();
});
it('uses the recorded whole chapter, seeks to exact saved seconds and tracks its real sentence markers',async()=>{
 mocks.recording.mockResolvedValue({url:'/chapter.mp3',duration:15,sentences:[{sentence:0,start:0,end:4},{sentence:1,start:4,end:15}]});
 store.getState().saveProgress(journey.id,{step:'n',sentence:1,seconds:6.2,completed:[]});
 mocks.clip.mockImplementationOnce(async(player)=>{player.currentTime=8.5;player.ontimeupdate();return false;});
 await act(async()=>api.play(0));expect(mocks.clip.mock.calls[0][1]).toBe('/chapter.mp3');expect(mocks.clip.mock.calls[0][2].start).toBe(6.2);expect(mocks.tts).not.toHaveBeenCalled();expect(store.getState().progress[journey.id]).toMatchObject({sentence:1,seconds:8.5,completed:[]});
});
it('starts a selected sentence at its measured position in the chapter recording',async()=>{
 mocks.recording.mockResolvedValue({url:'/chapter.mp3',duration:15,sentences:[{sentence:0,start:0,end:4},{sentence:1,start:4,end:15}]});mocks.clip.mockResolvedValueOnce(false);
 await act(async()=>api.play(0,1));expect(mocks.clip.mock.calls[0][2].start).toBe(4);expect(mocks.tts).not.toHaveBeenCalled();
});
it('keeps narration running when the document becomes hidden',async()=>{
 let signal:AbortSignal;mocks.tts.mockImplementation((_t,options)=>{signal=options.signal;return new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));});let running:Promise<void>;await act(async()=>{running=api.play(0);});await act(async()=>document.dispatchEvent(new Event('visibilitychange')));expect(signal!.aborted).toBe(false);await act(async()=>{api.pause();await running;});
});
it('stops after the chapter and leaves the next step ready without playing it',async()=>{
 await act(async()=>api.setStopAfter('chapter'));await act(async()=>api.play(0));expect(mocks.clip).not.toHaveBeenCalled();expect(store.getState().progress[journey.id]).toMatchObject({step:'v',completed:['n'],seconds:0});expect(api.stopAfter).toBe('none');
});
it('uses the selected rate and reuses the same audio element for chapter and verse',async()=>{
 mocks.recording.mockResolvedValue({url:'/chapter.mp3',duration:15,sentences:[{sentence:0,start:0,end:4},{sentence:1,start:4,end:15}]});await act(async()=>api.setSpeed(1.25));await act(async()=>api.play(0));expect(mocks.clip.mock.calls).toHaveLength(2);expect(mocks.clip.mock.calls[0][0]).toBe(mocks.clip.mock.calls[1][0]);expect(mocks.clip.mock.calls[0][2].rate).toBe(1.25);
});
it('honors a sleep deadline without relying on a visible page',async()=>{
 vi.useFakeTimers();mocks.tts.mockImplementation((_t,options)=>new Promise(resolve=>options.signal.addEventListener('abort',resolve,{once:true})));let running:Promise<void>;await act(async()=>{api.setStopAfter('5');running=api.play(0);});await act(async()=>{await vi.advanceTimersByTimeAsync(300000);await running;});expect(api.playing).toBe(false);expect(api.stopAfter).toBe('none');expect(mocks.clip).not.toHaveBeenCalled();vi.useRealTimers();
});
it('persists a seek while paused so resume does not discard it',async()=>{
 mocks.recording.mockResolvedValue({url:'/chapter.mp3',duration:20,sentences:[{sentence:0,start:0,end:4},{sentence:1,start:4,end:20}]});
 mocks.clip.mockImplementationOnce((player,_,options)=>{Object.defineProperty(player,'duration',{configurable:true,value:20});return new Promise(resolve=>options.signal.addEventListener('abort',()=>resolve(false),{once:true}));});
 let running:Promise<void>;await act(async()=>{running=api.play(0);});await act(async()=>{api.pause();await running;api.seek(9);});expect(store.getState().progress[journey.id]).toMatchObject({sentence:1,seconds:9});mocks.clip.mockResolvedValueOnce(false);await act(async()=>api.play(0));expect(mocks.clip.mock.calls[1][2].start).toBe(9);
});

it('keeps academy narration silent with a clear error when its prepared recording is missing',async()=>{
 await act(async()=>root.render(<Harness recordedOnly/>));await act(async()=>api.play(0));expect(mocks.tts).not.toHaveBeenCalled();expect(mocks.clip).not.toHaveBeenCalled();expect(api.error).toContain("n’a pas pu être chargée");expect(api.playing).toBe(false);
});
