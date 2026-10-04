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
