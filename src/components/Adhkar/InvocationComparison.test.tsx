// @vitest-environment jsdom
import {act} from 'react';import {createRoot,type Root} from 'react-dom/client';import {it,expect,beforeEach,afterEach,vi} from 'vitest';
import {InvocationComparison} from './InvocationComparison';import {invocationByKey} from '../../lib/adhkarExperience';
const primary=vi.hoisted(()=>({toggle:vi.fn()}));
vi.mock('../../stores/audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({isPlaying:true,isLoading:false,togglePlay:primary.toggle})}}));
vi.mock('../../lib/adhkarAudioService',()=>({stopAdhkarAudio:vi.fn(),playAdhkarAudio:vi.fn()}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let host:HTMLDivElement,root:Root,mic:ReturnType<typeof vi.fn>;
beforeEach(async()=>{primary.toggle.mockClear();host=document.createElement('div');document.body.append(host);root=createRoot(host);mic=vi.fn();Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:mic}});vi.stubGlobal('MediaRecorder',class {static isTypeSupported(){return true;}});vi.stubGlobal('URL',{revokeObjectURL:vi.fn()});await act(async()=>root.render(<InvocationComparison invocation={invocationByKey.get('hisn_chap_1:14')!}/>));});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
const record=()=>{const button=[...host.querySelectorAll('button')].find(b=>b.textContent==='M’enregistrer')!;button.click();};
it('never requests a microphone before an explicit tap',()=>{expect(mic).not.toHaveBeenCalled();});
it('releases a late permission result after the reader was closed',async()=>{
 let resolve!:(stream:unknown)=>void;mic.mockReturnValue(new Promise(r=>{resolve=r;}));await act(async()=>record());expect(primary.toggle).toHaveBeenCalledOnce();await act(async()=>root.render(null));const stop=vi.fn();await act(async()=>resolve({getTracks:()=>[{stop}]}));expect(stop).toHaveBeenCalledOnce();
});
it('explains a denied permission and allows retry without claiming to record',async()=>{
 mic.mockRejectedValue(new DOMException('denied','NotAllowedError'));await act(async()=>record());expect(host.textContent).toContain('Microphone non autorisé');expect(host.textContent).not.toContain('Enregistrement en cours');expect(host.textContent).toContain('M’enregistrer');
});

it('does not start a late microphone permission after the page becomes hidden',async()=>{
 let resolve!:(stream:unknown)=>void;mic.mockReturnValue(new Promise(r=>{resolve=r;}));await act(async()=>record());vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>document.dispatchEvent(new Event('visibilitychange')));const stop=vi.fn();await act(async()=>resolve({getTracks:()=>[{stop}]}));expect(stop).toHaveBeenCalledOnce();expect(host.textContent).not.toContain('Enregistrement en cours');
});
