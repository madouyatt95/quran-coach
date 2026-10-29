// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let reactRoot:Root|undefined;
import {followDistance,useCalmFollow} from './useCalmFollow';
afterEach(()=>{if(reactRoot)act(()=>reactRoot!.unmount());reactRoot=undefined;vi.unstubAllGlobals();document.body.innerHTML='';});
it('leaves the central lines still and advances before reaching the bottom edge',()=>{
 expect(followDistance({top:50,bottom:650},{top:200,bottom:235})).toBe(0);
 expect(followDistance({top:50,bottom:650},{top:570,bottom:605})).toBe(135);
 expect(followDistance({top:50,bottom:650},{top:25,bottom:60})).toBe(-57);
});
it('suspends on manual scrolling, not its own scroll, and resumes on demand',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:false}));
 const root=document.createElement('div');root.innerHTML='<span data-word-key="2:1:1">Mot</span>';document.body.append(root);
 root.getBoundingClientRect=()=>({top:0,bottom:500,left:0,right:390} as DOMRect);
 root.firstElementChild!.getBoundingClientRect=()=>({top:470,bottom:500,left:100,right:200} as DOMRect);
 root.scrollBy=vi.fn();const ref={current:root};let current!:ReturnType<typeof useCalmFollow>;
 function App({active}:{active:boolean}){current=useCalmFollow(ref,'2:1:1',active);return null;}
 const host=document.createElement('div');document.body.append(host);reactRoot=createRoot(host);const rerender=({active}:{active:boolean})=>act(()=>reactRoot!.render(<App active={active}/>));rerender({active:true});
 expect(root.scrollBy).toHaveBeenCalled();act(()=>root.dispatchEvent(new Event('scroll')));expect(current.paused).toBe(false);
 act(()=>root.dispatchEvent(new Event('wheel')));expect(current.paused).toBe(true);
 const before=vi.mocked(root.scrollBy).mock.calls.length;
 rerender({active:true});expect(vi.mocked(root.scrollBy).mock.calls.length).toBe(before);
 act(()=>current.resume());expect(current.paused).toBe(false);expect(vi.mocked(root.scrollBy).mock.calls.length).toBeGreaterThan(before);
 act(()=>root.dispatchEvent(new Event('wheel')));rerender({active:false});expect(current.paused).toBe(false);
});
