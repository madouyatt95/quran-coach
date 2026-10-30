// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {PagePreview,PageBrowseButton} from './PagePreview';
vi.mock('./FacingPage',()=>({FacingPage:({page}:{page:number})=><div>Preview {page}</div>}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;
beforeEach(()=>{vi.useFakeTimers();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.useRealTimers();});
it('previews without navigation and commits only the chosen page',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 const next=[...host.querySelectorAll('button')].find(b=>b.textContent==='Suivante')!;
 act(()=>next.click());expect(host.querySelector('output')?.textContent).toContain('Page 5');expect(commit).not.toHaveBeenCalled();
 act(()=>vi.advanceTimersByTime(250));expect(host.textContent).toContain('Preview 6');
 act(()=>host.querySelector('input')!.dispatchEvent(new Event('pointerup',{bubbles:true})));
 expect(commit).toHaveBeenCalledWith(5);
});
it('cancels a pointer gesture without committing',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Suivante')!.click());
 act(()=>host.querySelector('input')!.dispatchEvent(new Event('pointercancel',{bubbles:true})));
 expect(commit).not.toHaveBeenCalled();expect(host.querySelector('output')?.textContent).toContain('Page 4');
});
it('keeps simple clicks and consumes long presses without reopening page search',()=>{
 const click=vi.fn(),browse=vi.fn();act(()=>root.render(<PageBrowseButton page={4} onClick={click} onBrowse={browse}/>));
 const button=host.querySelector('button')!;act(()=>button.click());expect(click).toHaveBeenCalledTimes(1);
 act(()=>{button.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0}));vi.advanceTimersByTime(460);});
 expect(browse).toHaveBeenCalledTimes(1);
 act(()=>{button.dispatchEvent(new Event('pointerup',{bubbles:true}));button.click();});
 expect(click).toHaveBeenCalledTimes(1);
});
