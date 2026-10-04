// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const clips=vi.hoisted(()=>vi.fn());
vi.mock('./mediaPlayback',()=>({playMediaClip:clips}));
let service:typeof import('./ttsService');
beforeEach(async()=>{
 vi.resetModules();vi.clearAllMocks();
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
