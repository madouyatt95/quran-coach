// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const mocks=vi.hoisted(()=>({url:vi.fn(),timings:vi.fn(),tts:vi.fn(),stopTts:vi.fn()}));
vi.mock('./quranApi',()=>({fetchAyahAudioUrl:mocks.url,fetchRabbanaTimings:mocks.timings}));
vi.mock('./ttsService',()=>({playTts:mocks.tts,stopTts:mocks.stopTts}));
class FakeAudio extends EventTarget {
 static instances:FakeAudio[]=[];
 src='';preload='';currentTime=0;playbackRate=1;
 play=vi.fn().mockResolvedValue(undefined);pause=vi.fn();
 constructor(){super();FakeAudio.instances.push(this);}
}
let service:typeof import('./adhkarAudioService');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
beforeEach(async()=>{
 vi.useFakeTimers();vi.resetModules();vi.clearAllMocks();FakeAudio.instances=[];vi.stubGlobal('Audio',FakeAudio);
 mocks.tts.mockResolvedValue(undefined);mocks.url.mockResolvedValue('/verse.mp3');mocks.timings.mockResolvedValue([1000,2000]);
 service=await import('./adhkarAudioService');
});
afterEach(()=>{service.stopAdhkarAudio();vi.useRealTimers();vi.unstubAllGlobals();});
it('plays exactly three repetitions with pauses and one final callback',async()=>{
 const loop=vi.fn(),end=vi.fn();const done=service.playAdhkarAudioLoop('test',1,'hisn_1',3,undefined,{onLoop:loop,onEnd:end,pauseMs:600});await flush();
 const audio=FakeAudio.instances[0];
 for(let i=0;i<3;i++){
  expect(audio.play).toHaveBeenCalledTimes(i+1);audio.dispatchEvent(new Event('ended'));await flush();
  if(i<2){await vi.advanceTimersByTimeAsync(599);expect(audio.play).toHaveBeenCalledTimes(i+1);await vi.advanceTimersByTimeAsync(1);}
 }
 await done;expect(loop.mock.calls.map(c=>c[0])).toEqual([0,1,2]);expect(end).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
});
it.each(['playing','pause'])('cancels during %s without counting a finished loop or leaving a pending promise',async phase=>{
 const end=vi.fn();const done=service.playAdhkarAudioLoop('test',1,'hisn_1',3,undefined,{onEnd:end});await flush();const audio=FakeAudio.instances[0];
 if(phase==='pause'){audio.dispatchEvent(new Event('ended'));await flush();}
 service.stopAdhkarAudio();await done;await vi.runAllTimersAsync();expect(audio.play).toHaveBeenCalledOnce();expect(end).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
it('ignores a delayed Quran URL after stop and restart',async()=>{
 let resolve!:(url:string)=>void;mocks.url.mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));
 const oldEnd=vi.fn();const old=service.playAdhkarAudio('text',1,'rabanna','2:127',{onEnd:oldEnd});await flush();
 const freshEnd=vi.fn();const fresh=service.playAdhkarAudio('new',2,'hisn_1',undefined,{onEnd:freshEnd});await flush();
 resolve('/old.mp3');await old;const audio=FakeAudio.instances[0];expect(audio.src).toContain('dua_2.mp3');expect(audio.play).toHaveBeenCalledOnce();expect(oldEnd).not.toHaveBeenCalled();
 audio.dispatchEvent(new Event('ended'));await fresh;expect(freshEnd).toHaveBeenCalledOnce();
});
it('plays a Quran verse range fully even outside repetition mode',async()=>{
 const end=vi.fn();const done=service.playAdhkarAudio('test',1,'rabanna','2:127-128',{onEnd:end});await flush();
 const audio=FakeAudio.instances[0];expect(audio.currentTime).toBe(1);audio.dispatchEvent(new Event('ended'));await flush();
 expect(mocks.url).toHaveBeenNthCalledWith(2,2,128);expect(audio.currentTime).toBe(0);audio.dispatchEvent(new Event('ended'));await done;expect(end).toHaveBeenCalledOnce();
});
it('finishes a sliced verse only once despite timeupdate and ended events',async()=>{
 const end=vi.fn();const done=service.playAdhkarAudio('test',1,'rabanna','2:127',{onEnd:end});await flush();const audio=FakeAudio.instances[0];
 audio.currentTime=2;audio.dispatchEvent(new Event('timeupdate'));audio.dispatchEvent(new Event('ended'));await done;await vi.runAllTimersAsync();expect(end).toHaveBeenCalledOnce();
});
it('repeats the TTS fallback after missing MP3s',async()=>{
 const done=service.playAdhkarAudioLoop('test',1,'hisn_1',2,undefined,{pauseMs:0});await flush();
 FakeAudio.instances[0].dispatchEvent(new Event('error'));await flush();await vi.advanceTimersByTimeAsync(0);
 FakeAudio.instances[0].dispatchEvent(new Event('error'));await done;expect(mocks.tts).toHaveBeenCalledTimes(2);
});
it('pauses a recording at its exact position and resumes without restarting the clip',async()=>{
 const end=vi.fn();const done=service.playAdhkarAudio('test',14,'hisn_chap_1',undefined,{onEnd:end});await flush();const a=FakeAudio.instances[0];a.currentTime=2.4;service.pauseAdhkarAudio();await vi.advanceTimersByTimeAsync(20000);expect(end).not.toHaveBeenCalled();service.resumeAdhkarAudio();await flush();expect(a.currentTime).toBe(2.4);expect(a.play).toHaveBeenCalledTimes(2);a.dispatchEvent(new Event('ended'));await done;expect(end).toHaveBeenCalledOnce();
});
it('pauses the gap between repetitions and cancellation resolves a paused session',async()=>{
 const end=vi.fn();const done=service.playAdhkarAudioLoop('test',14,'hisn_chap_1',2,undefined,{pauseMs:1000,onEnd:end});await flush();const a=FakeAudio.instances[0];a.dispatchEvent(new Event('ended'));await flush();await vi.advanceTimersByTimeAsync(200);service.pauseAdhkarAudio();await vi.advanceTimersByTimeAsync(2000);expect(a.play).toHaveBeenCalledOnce();service.resumeAdhkarAudio();await vi.advanceTimersByTimeAsync(799);expect(a.play).toHaveBeenCalledOnce();await vi.advanceTimersByTimeAsync(1);expect(a.play).toHaveBeenCalledTimes(2);service.pauseAdhkarAudio();service.stopAdhkarAudio();await done;expect(end).not.toHaveBeenCalled();
});
it('learning alternates the supplied phrases and a repeat interval without any recitation counting',async()=>{
 const onPart=vi.fn();const done=service.learnAdhkar(['one','two'],{rate:0.75,repeats:1,gap:4,onPart});await flush();expect(mocks.tts).toHaveBeenCalledWith('one',expect.objectContaining({rate:0.75}));await vi.advanceTimersByTimeAsync(4000);expect(mocks.tts).toHaveBeenLastCalledWith('two',expect.anything());await vi.advanceTimersByTimeAsync(4000);await done;expect(onPart.mock.calls.filter(c=>c[1]==='repeat').map(c=>c[0])).toEqual([0,1]);
});
it('does not reuse the ambiguous recording for the two formerly identical IDs',()=>{
 expect(service.getAdhkarAudioUrl('hisn_chap_130',276)).not.toBe('/audio/hisn/dua_276.mp3');expect(service.getAdhkarAudioUrl('hisn_chap_130',100276)).not.toBe('/audio/hisn/dua_276.mp3');
});
it.each(['morning','evening','hisn_chap_27'])('plays both opening Quran invocations from complete human recordings in %s',async category=>{
 for(const [id,file] of [[94,'OD-075.mp3'],[95,'OD-076.mp3']] as const){
  const end=vi.fn();const done=service.playAdhkarAudio('Arabic',id,category,undefined,{onEnd:end});await flush();
  const a=FakeAudio.instances[0];expect(a.src).toContain(file);expect(a.currentTime).toBe(0);
  a.dispatchEvent(new Event('ended'));await done;expect(end).toHaveBeenCalledOnce();
 }
 expect(mocks.tts).not.toHaveBeenCalled();
});
it('learning reuses human audio ranges, then French, without synthesizing Arabic',async()=>{
 const onPart=vi.fn(),onPhase=vi.fn();const done=service.learnAdhkar(['unused'],{rate:1,repeats:1,gap:2,onPart,recording:{url:'/human.mp3',ranges:[[0,3],[3,6]]},understanding:{arabic:true,french:true,silence:true,translation:'Le sens.',gap:2,onPhase}});await flush();
 const a=FakeAudio.instances[0];expect(a.src).toBe('/human.mp3');a.currentTime=3;a.dispatchEvent(new Event('timeupdate'));await flush();await vi.advanceTimersByTimeAsync(2000);expect(a.currentTime).toBe(3);a.currentTime=6;a.dispatchEvent(new Event('timeupdate'));await flush();await vi.advanceTimersByTimeAsync(2000);await done;
 expect(mocks.tts).toHaveBeenCalledExactlyOnceWith('Le sens.',expect.objectContaining({lang:'fr'}));expect(onPhase).toHaveBeenCalledWith('french');
});
it('allows French alone and cancellation during the following silent interval',async()=>{
 const end=vi.fn(),onPhase=vi.fn();const done=service.playAdhkarAudioLoop('Arabic',14,'hisn_chap_1',1,undefined,{onEnd:end,understanding:{arabic:false,french:true,silence:true,translation:'Le sens.',gap:4,onPhase}});await flush();expect(FakeAudio.instances).toHaveLength(0);expect(mocks.tts).toHaveBeenCalledWith('Le sens.',expect.objectContaining({lang:'fr'}));expect(onPhase).toHaveBeenCalledWith('silence');service.stopAdhkarAudio();await done;expect(end).not.toHaveBeenCalled();
});
it('waits for the actual passage duration in adaptive learning, accounting for speed',async()=>{
 const part=vi.fn();const done=service.learnAdhkar(['x','y'],{rate:.5,repeats:1,gap:4,onPart:part,recording:{url:'/human.mp3',ranges:[[0,5],[5,8]]},understanding:{arabic:true,french:false,silence:true,gap:4,gapMode:'auto',translation:''}});await flush();const a=FakeAudio.instances[0];a.currentTime=5;a.dispatchEvent(new Event('timeupdate'));await flush();await vi.advanceTimersByTimeAsync(11999);expect(a.play).toHaveBeenCalledTimes(1);await vi.advanceTimersByTimeAsync(1);expect(a.play).toHaveBeenCalledTimes(2);service.stopAdhkarAudio();await done;
});
