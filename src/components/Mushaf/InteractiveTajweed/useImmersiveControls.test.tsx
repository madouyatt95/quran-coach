// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {useImmersiveControls} from './useImmersiveControls';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,node:HTMLDivElement,result:ReturnType<typeof useImmersiveControls>;
function Harness({active,blocked}:{active:boolean;blocked:boolean}){result=useImmersiveControls(active,blocked);return <button onClick={result.wake}>{String(result.hidden)}</button>;}
const render=(active=true,blocked=false)=>act(async()=>root.render(<Harness active={active} blocked={blocked}/>));
beforeEach(()=>{vi.useFakeTimers();node=document.createElement('div');root=createRoot(node);});
afterEach(async()=>{await act(async()=>root.unmount());vi.useRealTimers();});
it('hides controls after inactivity and wakes them on interaction',async()=>{
 await render();expect(result.hidden).toBe(false);
 await act(async()=>vi.advanceTimersByTime(4000));expect(result.hidden).toBe(true);
 await act(async()=>result.wake());expect(result.hidden).toBe(false);
 await act(async()=>vi.advanceTimersByTime(3999));expect(result.hidden).toBe(false);
 await act(async()=>vi.advanceTimersByTime(1));expect(result.hidden).toBe(true);
});
it('keeps controls available outside immersion or while an action sheet is open',async()=>{
 await render(false);await act(async()=>vi.advanceTimersByTime(5000));expect(result.hidden).toBe(false);
 await render();await act(async()=>vi.advanceTimersByTime(4000));expect(result.hidden).toBe(true);
 await render(true,true);expect(result.hidden).toBe(false);
 await render();expect(result.hidden).toBe(false);
 await act(async()=>vi.advanceTimersByTime(4000));expect(result.hidden).toBe(true);
});
