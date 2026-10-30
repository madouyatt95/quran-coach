// @vitest-environment jsdom
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {useReadingBookmarkStore} from '../../../stores/readingBookmarkStore';
import {useReadingSession,sessionTarget} from './readingSession';
import {PagePreview,PageBrowseButton} from './PagePreview';
vi.mock('./FacingPage',()=>({FacingPage:({page}:{page:number})=><div>Preview {page}</div>}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;
beforeEach(()=>{useReadingBookmarkStore.persist.setOptions({storage:createJSONStorage(createMemoryStorage)});useReadingSession.persist.setOptions({storage:createJSONStorage(createMemoryStorage)});vi.useFakeTimers();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.useRealTimers();});
it('previews without navigation and commits only the chosen page',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 const next=[...host.querySelectorAll('button')].find(b=>b.textContent==='Suivante')!;
 act(()=>next.click());expect(host.querySelector('output')?.textContent).toContain('Page 5');expect(commit).not.toHaveBeenCalled();
 act(()=>vi.advanceTimersByTime(250));expect(host.textContent).toContain('Preview 6');
 act(()=>host.querySelector('input')!.dispatchEvent(new Event('pointerup',{bubbles:true})));
 expect(commit).not.toHaveBeenCalled();
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Ouvrir la page 5')!.click());
 expect(commit).toHaveBeenCalledWith(5);
});
it('cancels a pointer gesture without committing',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Suivante')!.click());
 act(()=>host.querySelector('input')!.dispatchEvent(new Event('pointercancel',{bubbles:true})));
 expect(commit).not.toHaveBeenCalled();expect(host.querySelector('output')?.textContent).toContain('Page 5');
});
it('keeps simple clicks and consumes long presses without reopening page search',()=>{
 const click=vi.fn(),browse=vi.fn();act(()=>root.render(<PageBrowseButton page={4} onClick={click} onBrowse={browse}/>));
 const button=host.querySelector('button')!;act(()=>button.click());expect(click).toHaveBeenCalledTimes(1);
 act(()=>{button.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0}));vi.advanceTimersByTime(460);});
 expect(browse).toHaveBeenCalledTimes(1);
 act(()=>{button.dispatchEvent(new Event('pointerup',{bubbles:true}));button.click();});
 expect(click).toHaveBeenCalledTimes(1);
});

it('lets adjacent pages centre before opening, and returns to the reading origin',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 act(()=>host.querySelector<HTMLButtonElement>('[aria-label="Prévisualiser la page 5"]')!.click());
 act(()=>vi.advanceTimersByTime(150));expect(commit).not.toHaveBeenCalled();
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Revenir ici')!.click());
 expect(host.querySelector('output')?.textContent).toContain('Page 4');expect(commit).not.toHaveBeenCalled();
});
function pointer(el:Element,type:string,x:number,y=10){el.dispatchEvent(new MouseEvent(type,{bubbles:true,button:0,clientX:x,clientY:y}));}
it('swipes on the pages without navigating or activating the following click',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 const stage=host.querySelector('[aria-label="Pages à feuilleter"]')!;
 act(()=>pointer(stage,'pointerdown',100));act(()=>pointer(stage,'pointermove',200));act(()=>pointer(stage,'pointerup',200));
 act(()=>vi.advanceTimersByTime(150));expect(host.querySelector('output')?.textContent).toContain('Page 5');
 act(()=>host.querySelector<HTMLButtonElement>('[aria-label="Ouvrir la page 5"]')!.click());expect(commit).not.toHaveBeenCalled();
});
it('keeps cancellation and boundary swipes in the valid range',()=>{
 const commit=vi.fn();act(()=>root.render(<PagePreview page={604} paper="sepia" onCommit={commit}/>));
 const stage=host.querySelector('[aria-label="Pages à feuilleter"]')!;
 act(()=>pointer(stage,'pointerdown',100));act(()=>pointer(stage,'pointermove',200));act(()=>pointer(stage,'pointerup',200));
 expect(host.querySelector('output')?.textContent).toContain('Page 604');
 act(()=>pointer(stage,'pointerdown',200));act(()=>pointer(stage,'pointermove',100));act(()=>pointer(stage,'pointercancel',100));
 expect(host.querySelector('output')?.textContent).toContain('Page 604');expect(commit).not.toHaveBeenCalled();
});

it('offers saved bookmarks and the session endpoint as previews without committing',()=>{
 useReadingBookmarkStore.setState({bookmark:null,bookmarks:[{id:'test',label:'Mon passage',page:8,surah:2,ayah:49,view:'tajweed-interactive',precision:'verse',savedAt:1}]});
 useReadingSession.setState({session:sessionTarget(4,'pages',2)});
 const commit=vi.fn();act(()=>root.render(<PagePreview page={4} paper="sepia" onCommit={commit}/>));
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent?.startsWith('Signet · p. 8'))!.click());
 expect(host.querySelector('output')?.textContent).toContain('Page 8');expect(commit).not.toHaveBeenCalled();
 expect(host.textContent).toContain('Fin de séance · p. 8');
 act(()=>{useReadingBookmarkStore.setState({bookmarks:[]});useReadingSession.setState({session:null});});
});
