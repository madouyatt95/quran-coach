// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const mounts:Root[]=[];
function renderHook<P>(hook:(p:P)=>ReturnType<typeof useBookPageTurn>,options?:{initialProps:P}){
 const host=document.createElement('div');document.body.append(host);const mount=createRoot(host);mounts.push(mount);
 const result={} as {current:ReturnType<typeof useBookPageTurn>};
 function Harness({value}:{value:P}){result.current=hook(value);return null;}
 const rerender=(value:P)=>act(()=>mount.render(<Harness value={value}/>));rerender(options?.initialProps as P);
 return {result,rerender,unmount:()=>act(()=>mount.unmount())};
}
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {useBookPageTurn} from './useBookPageTurn';
let root:HTMLDivElement,source:HTMLDivElement;
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('requestAnimationFrame',(fn:FrameRequestCallback)=>setTimeout(()=>fn(Date.now()),16));vi.stubGlobal('cancelAnimationFrame',clearTimeout);root=document.createElement('div');source=document.createElement('div');source.dataset.activeSheet='true';source.className='iq-scaled-page';source.innerHTML='<article class="iq-paper"><svg><pattern id="vine"></pattern><rect fill="url(#vine)"></rect></svg><span>test</span></article>';root.append(source);document.body.append(root);source.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:600,bottom:860,width:600,height:860,toJSON:()=>{}});root.getBoundingClientRect=source.getBoundingClientRect;
for(let page=1;page<=7;page++){const holder=document.createElement('div');holder.dataset.bookVerso=String(page);const verso=source.cloneNode(true) as HTMLElement;verso.removeAttribute('data-active-sheet');verso.dataset.pageReady='true';verso.querySelector('span')!.textContent=`Real page ${page}`;holder.append(verso);document.body.append(holder);}
});
afterEach(()=>{mounts.splice(0).forEach(m=>act(()=>m.unmount()));document.body.innerHTML='';vi.useRealTimers();vi.unstubAllGlobals();});
it('allows a partial curl then cancels without navigating and restores the original',()=>{const {result}=renderHook(()=>useBookPageTurn({current:root},4,true));act(()=>result.current.scrub(5,1,.45));expect(result.current.dragging).toBe(true);expect(result.current.preview?.page).toBe(5);expect(source.style.visibility).toBe('hidden');expect(document.querySelectorAll('.iq-book-strip')).toHaveLength(16);act(()=>result.current.cancel());act(()=>vi.advanceTimersByTime(1000));expect(source.style.visibility).toBe('');expect(document.querySelector('.iq-book-turn')).toBeNull();expect(result.current.turning).toBe(false);});
it('holds the curl until the destination is ready, then completes',()=>{const {result,rerender}=renderHook(({page,ready})=>useBookPageTurn({current:root},page,ready),{initialProps:{page:4,ready:true}});act(()=>result.current.scrub(5,1,.6));act(()=>{expect(result.current.begin(5,1)).toBe(true);});rerender({page:5,ready:false});act(()=>vi.advanceTimersByTime(1000));expect(result.current.turning).toBe(true);rerender({page:5,ready:true});act(()=>vi.advanceTimersByTime(1000));expect(result.current.turning).toBe(false);expect(document.querySelector('.iq-book-turn')).toBeNull();});
it('respects reduced motion and cleans up on unmount',()=>{vi.stubGlobal('matchMedia',()=>({matches:true}));const {result,unmount}=renderHook(()=>useBookPageTurn({current:root},4,true));act(()=>{expect(result.current.begin(5,1,true)).toBe(false);expect(result.current.begin(5,1)).toBe(true);});expect(document.querySelector('.iq-book-turn')).toBeNull();unmount();});

it.each([-1,1])('takes time to settle after a long drag in direction %s',direction=>{
 const target=4+direction;
 const {result,rerender}=renderHook(({page})=>useBookPageTurn({current:root},page,true),{initialProps:{page:4}});
 act(()=>result.current.scrub(target,direction,.9));
 const shadow=document.querySelector<HTMLElement>('.iq-book-shadow')!;
 expect(shadow.style.transformOrigin).toBe(direction>0?'right center':'left center');
 act(()=>{result.current.begin(target,direction);});rerender({page:target});
 act(()=>vi.advanceTimersByTime(350));expect(result.current.turning).toBe(true);
 act(()=>vi.advanceTimersByTime(400));expect(result.current.turning).toBe(false);
});
it.each([-1,1])('uses a complete gradual turn from a button in direction %s',direction=>{
 const {result,rerender}=renderHook(({page})=>useBookPageTurn({current:root},page,true),{initialProps:{page:4}});
 act(()=>{result.current.begin(4+direction,direction);});rerender({page:4+direction});
 act(()=>vi.advanceTimersByTime(1000));expect(result.current.turning).toBe(true);
 act(()=>vi.advanceTimersByTime(500));expect(result.current.turning).toBe(false);
});
it('does not swallow a corner click when there was no drag',()=>{
 const {result}=renderHook(()=>useBookPageTurn({current:root},4,true));
 act(()=>result.current.scrub(5,1,0));act(()=>result.current.cancel());
 expect(result.current.turning).toBe(false);
 act(()=>{expect(result.current.begin(5,1)).toBe(true);});
});

it('puts the correct real page on each reverse face, with diagonal crop transforms',()=>{
 const {result}=renderHook(()=>useBookPageTurn({current:root},4,true));
 act(()=>result.current.scrub(3,-1,.55,.35));
 const backs=Array.from(document.querySelectorAll('.iq-book-back'));
 expect(backs).toHaveLength(16);
 backs.forEach(back=>{expect(back.textContent).toContain('Real page 3');expect(back.textContent).not.toContain('Real page 5');});
 const strip=document.querySelector<HTMLElement>('.iq-book-strip')!;
 expect(strip.style.transform).toContain('matrix3d(');
 const matrix=strip.style.transform.slice(9,-1).split(',').map(Number);
 expect(matrix[13]).toBeCloseTo(0); // first edge is attached to the left spine
 expect(matrix[1]).not.toBe(0); // free edge responds to the diagonal drag
 const cloneIds=Array.from(document.querySelectorAll('.iq-book-turn [id]')).map(n=>n.id);
 expect(new Set(cloneIds).size).toBe(cloneIds.length);
});
it('does not expose an empty verso while resources are missing, and recovers on timeout',()=>{
 document.querySelectorAll('[data-book-verso]').forEach(e=>e.remove());
 const {result,rerender}=renderHook(({page})=>useBookPageTurn({current:root},page,true),{initialProps:{page:4}});
 act(()=>result.current.scrub(5,1,.9,.2));
 expect(document.querySelectorAll('.iq-book-back .iq-scaled-page')).toHaveLength(0);
 // The front is still facing the reader while the reverse is unavailable.
 const transform=document.querySelector<HTMLElement>('.iq-book-strip')!.style.transform;
 const matrix=transform.slice(9,-1).split(',').map(Number);
 expect(matrix[0]).toBeGreaterThan(0); // positive cosine: front still faces the reader
 act(()=>{result.current.begin(5,1);});rerender({page:5});
 act(()=>vi.advanceTimersByTime(5100));expect(result.current.turning).toBe(false);
});
it('attaches a late-loading verso before completing the pending turn',async()=>{
 const holder=document.querySelector('[data-book-verso="5"]')!;
 const late=holder.firstElementChild as HTMLElement;late.removeAttribute('data-page-ready');
 const {result,rerender}=renderHook(({page})=>useBookPageTurn({current:root},page,true),{initialProps:{page:4}});
 act(()=>result.current.scrub(5,1,.6));act(()=>{result.current.begin(5,1);});rerender({page:5});
 act(()=>vi.advanceTimersByTime(800));expect(result.current.turning).toBe(true);
 await act(async()=>{late.dataset.pageReady='true';await Promise.resolve();});
 expect(document.querySelector('.iq-book-back')?.textContent).toContain('Real page 5');
 act(()=>vi.advanceTimersByTime(1600));expect(result.current.turning).toBe(false);
});

it.each([-1,1])('finds the verso across pupitre panes and completes the turn in direction %s',async direction=>{
 const reader=document.createElement('div');reader.className='iq-reader';
 const upper=document.createElement('section'),lower=document.createElement('section');
 upper.className='pupitre-upper';lower.className='pupitre-lower';
 upper.append(root);document.querySelectorAll('[data-book-verso]').forEach(node=>lower.append(node));
 reader.append(upper,lower);document.body.append(reader);
 const target=4+direction,late=lower.querySelector<HTMLElement>(`[data-book-verso="${target}"] .iq-scaled-page`)!;
 late.removeAttribute('data-page-ready');
 const {result,rerender}=renderHook(({page})=>useBookPageTurn({current:root},page,true),{initialProps:{page:4}});
 act(()=>result.current.scrub(target,direction,.6));
 expect(reader.querySelector('.iq-book-turn')?.parentElement).toBe(reader);
 expect(upper.querySelector('.iq-book-turn')).toBeNull();
 act(()=>{result.current.begin(target,direction);});rerender({page:target});
 await act(async()=>{late.dataset.pageReady='true';await Promise.resolve();});
 expect(reader.querySelector('.iq-book-back')?.textContent).toContain(`Real page ${target}`);
 act(()=>vi.advanceTimersByTime(1600));
 expect(result.current.turning).toBe(false);expect(reader.querySelector('.iq-book-turn')).toBeNull();
});
