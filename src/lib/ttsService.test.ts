// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const clips=vi.hoisted(()=>vi.fn());
const recording=vi.hoisted(()=>vi.fn());
vi.mock('./recordedNarration',()=>({getRecordedNarration:recording}));
vi.mock('./mediaPlayback',()=>({playMediaClip:clips}));
let service:typeof import('./ttsService');
beforeEach(async()=>{
 vi.resetModules();vi.clearAllMocks();recording.mockResolvedValue(null);
 vi.stubGlobal('Audio',class {preload='';currentTime=0;pause=vi.fn();});
 vi.stubGlobal('SpeechSynthesisUtterance',class {onend:(()=>void)|null=null;onerror:(()=>void)|null=null;});
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel:vi.fn(),speak:vi.fn(),getVoices:()=>[]}});
 service=await import('./ttsService');
});
afterEach(()=>{service.stopTts();vi.unstubAllGlobals();});
it('does not resume or notify completion after a cancelled delayed fetch',async()=>{
 let reject!:(error:Error)=>void;vi.stubGlobal('fetch',vi.fn(()=>new Promise((_,r)=>{reject=r;})));
 const end=vi.fn();const done=service.playTts('السلام',{onEnd:end});service.stopTts();reject(new Error('offline'));await done;
 expect(window.speechSynthesis.speak).not.toHaveBeenCalled();expect(clips).not.toHaveBeenCalled();expect(end).not.toHaveBeenCalled();expect(service.isTtsLoading()).toBe(false);
});
it('settles speech cancellation without relying on the browser firing onend',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));const controller=new AbortController(),end=vi.fn();
 const done=service.playTts('السلام',{signal:controller.signal,onEnd:end});for(let i=0;i<8;i++)await Promise.resolve();
 expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();controller.abort();await done;expect(end).not.toHaveBeenCalled();expect(service.isTtsPlaying()).toBe(false);
});
it('finishes device speech once and reports completion',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));const end=vi.fn();
 const done=service.playTts('السلام',{onEnd:end});for(let i=0;i<8;i++)await Promise.resolve();
 const utterance=vi.mocked(window.speechSynthesis.speak).mock.calls[0][0];utterance.onend?.({} as SpeechSynthesisEvent);await done;expect(end).toHaveBeenCalledOnce();
});
it('announces narration start on the device start event, not while preparing',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));const start=vi.fn();const done=service.playTts('Une phrase.',{lang:'fr',onStart:start});for(let i=0;i<8;i++)await Promise.resolve();expect(start).not.toHaveBeenCalled();const u=vi.mocked(window.speechSynthesis.speak).mock.calls[0][0];u.onstart?.({} as SpeechSynthesisEvent);expect(start).toHaveBeenCalledOnce();u.onend?.({} as SpeechSynthesisEvent);await done;
});
it('falls back to device speech when the online request times out',async()=>{
 vi.useFakeTimers();try{vi.stubGlobal('fetch',vi.fn((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('timeout')),{once:true}))));const done=service.playTts('Une phrase.',{lang:'fr'});await vi.advanceTimersByTimeAsync(8001);expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();const u=vi.mocked(window.speechSynthesis.speak).mock.calls[0][0];u.onend?.({} as SpeechSynthesisEvent);await done;}finally{vi.useRealTimers();}
});
it('pauses and resumes device speech without cancelling or creating another utterance',async()=>{
 const {PlaybackGate}=await import('./playbackGate');const gate=new PlaybackGate();window.speechSynthesis.pause=vi.fn();window.speechSynthesis.resume=vi.fn();vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));const done=service.playTts('السلام عليكم',{gate});for(let i=0;i<12;i++)await Promise.resolve();const cancel=vi.mocked(window.speechSynthesis.cancel).mock.calls.length;gate.setPaused(true);expect(window.speechSynthesis.pause).toHaveBeenCalledOnce();gate.setPaused(false);expect(window.speechSynthesis.resume).toHaveBeenCalledOnce();expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(cancel);expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();const u=vi.mocked(window.speechSynthesis.speak).mock.calls[0][0];u.onend?.({} as SpeechSynthesisEvent);await done;
});
it('plays the prepared French narration without contacting Google or device speech',async()=>{
 const fetch=vi.fn();vi.stubGlobal('fetch',fetch);recording.mockResolvedValue({url:'/narration.mp3'});clips.mockResolvedValue(true);const end=vi.fn();await service.playTts('Le sens.',{lang:'fr',onEnd:end});expect(clips).toHaveBeenCalledWith(expect.anything(),'/narration.mp3',expect.anything());expect(fetch).not.toHaveBeenCalled();expect(window.speechSynthesis.speak).not.toHaveBeenCalled();expect(end).toHaveBeenCalledOnce();
});
