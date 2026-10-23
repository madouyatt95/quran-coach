// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const auth=vi.hoisted(()=>({changed:undefined as undefined|(()=>void),unsubscribe:vi.fn()}));
vi.mock('../lib/progressVault',()=>({progressClient:()=>({auth:{onAuthStateChange:(callback:()=>void)=>{auth.changed=callback;return {data:{subscription:{unsubscribe:auth.unsubscribe}}};}}})}));
vi.mock('../lib/audioLibrary',()=>({AUDIO_API:'https://audio.test'}));
vi.mock('../lib/audioAdmin',()=>({audioAdmin:vi.fn()}));
import {audioAdmin} from '../lib/audioAdmin';
import {useAudioStudioAccess} from './useAudioStudioAccess';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,div:HTMLDivElement;
function Entry({open=true}:{open?:boolean}){return useAudioStudioAccess(open)?<a href="/admin/audio?tab=review">Studio audio</a>:null;}
beforeEach(()=>{vi.mocked(audioAdmin).mockReset();auth.unsubscribe.mockClear();auth.changed=undefined;div=document.createElement('div');document.body.append(div);root=createRoot(div);});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
it('hides the entry for anonymous sessions, denied accounts and unavailable services',async()=>{
 for(const error of ['Connectez-vous.','Compte non autorisé.','Réseau indisponible.']){
  vi.mocked(audioAdmin).mockRejectedValueOnce(new Error(error));
  await act(async()=>{root.render(<Entry/>);auth.changed?.();});
  expect(div.querySelector('a')).toBeNull();
 }
});
it('shows the review shortcut only after the server confirms access and hides it on sign out',async()=>{
 vi.mocked(audioAdmin).mockResolvedValueOnce({audioStudio:true});
 await act(async()=>root.render(<Entry/>));
 expect(div.querySelector('a')?.getAttribute('href')).toBe('/admin/audio?tab=review');
 vi.mocked(audioAdmin).mockRejectedValueOnce(new Error('Session absente.'));
 await act(async()=>auth.changed?.());
 expect(div.querySelector('a')).toBeNull();
 expect(audioAdmin).toHaveBeenLastCalledWith('access',undefined,expect.any(AbortSignal));
});
it('ignores a late authorization response after the authenticated account changes',async()=>{
 let resolve!:(value:{audioStudio:boolean})=>void;
 vi.mocked(audioAdmin).mockImplementationOnce(()=>new Promise(done=>{resolve=done;})).mockResolvedValueOnce({audioStudio:false});
 await act(async()=>root.render(<Entry/>));
 await act(async()=>auth.changed?.());
 await act(async()=>resolve({audioStudio:true}));
 expect(div.querySelector('a')).toBeNull();
});
it('does not query the service for a closed menu and aborts when it closes',async()=>{
 vi.mocked(audioAdmin).mockImplementation(()=>new Promise(()=>{}));
 await act(async()=>root.render(<Entry open={false}/>));
 expect(audioAdmin).not.toHaveBeenCalled();
 await act(async()=>root.render(<Entry/>));
 const signal=vi.mocked(audioAdmin).mock.calls[0][2];
 await act(async()=>root.render(<Entry open={false}/>));
 expect(signal?.aborted).toBe(true);expect(div.querySelector('a')).toBeNull();
});
