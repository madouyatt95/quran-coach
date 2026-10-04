// @vitest-environment jsdom
import {act,useRef} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {useQuranStore} from '../../../stores/quranStore';
import {useKhatmStore} from '../../../stores/khatmStore';
import {useVisibleReadingPosition,verseAtReadingLine} from './useVisibleReadingPosition';
import {useKhatmReading} from './useKhatmReading';
vi.mock('../../../stores/challengesStore',()=>({useChallengesStore:{getState:()=>({markPageRead:vi.fn()})}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let callback:IntersectionObserverCallback,observed:HTMLElement[],root:Root,host:HTMLDivElement,constructs=0;
let positions=[{top:0,bottom:500},{top:500,bottom:1000}];
const rect=(top:number,bottom:number)=>({top,bottom,height:bottom-top,left:0,right:300,width:300,x:0,y:top,toJSON:()=>({})});
function Harness(){
 const ref=useRef<HTMLDivElement>(null),silent=useRef(false);
 const page=useQuranStore(s=>s.currentPage),ayah=useQuranStore(s=>s.currentAyah);
 useVisibleReadingPosition(ref,3,2,false,silent);useKhatmReading({page,surah:3,ayah,ready:true});
 return <div ref={ref}>{[50,51].map((p,i)=><span key={p} className="mih-ayah" data-surah="3" data-page={p} data-ayah={i+1}/>)}</div>;
}
beforeEach(async()=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','performance','requestAnimationFrame','cancelAnimationFrame']});
 vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 vi.spyOn(document,'hasFocus').mockReturnValue(true);Object.defineProperty(document,'hidden',{configurable:true,value:false});
 observed=[];constructs=0;positions=[{top:0,bottom:500},{top:500,bottom:1000}];
 vi.stubGlobal('IntersectionObserver',class{constructor(cb:IntersectionObserverCallback){callback=cb;constructs++;}observe(el:HTMLElement){observed.push(el);}disconnect(){}});
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(()=>rect(0,600));
 vi.spyOn(HTMLElement.prototype,'getClientRects').mockImplementation(function(this:HTMLElement){const pos=positions[Number(this.dataset.ayah)-1];return [rect(pos.top,pos.bottom)] as unknown as DOMRectList;});
 useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useKhatmStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useQuranStore.setState({currentSurah:3,currentPage:50,currentAyah:1,khatmJumpSignal:0,progress:null,isKhatmMode:false,isExploring:false});useKhatmStore.getState().reset();useKhatmStore.getState().activate('2026-10-04','2026-11-04');
 host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>));
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
async function observe(){await act(async()=>{callback(observed.map(target=>({target,isIntersecting:true})) as unknown as IntersectionObserverEntry[],{} as IntersectionObserver);await vi.advanceTimersByTimeAsync(20);});}
it('keeps the current page when the next page is only partly visible, then credits a vertical transition',async()=>{
 await observe();expect(useQuranStore.getState().currentPage).toBe(50);
 await act(async()=>vi.advanceTimersByTimeAsync(15000));positions=[{top:-500,bottom:0},{top:0,bottom:500}];
 await act(async()=>{host.firstElementChild!.dispatchEvent(new Event('scroll'));await vi.advanceTimersByTimeAsync(20);});
 expect(useQuranStore.getState().currentPage).toBe(51);expect(useKhatmStore.getState().validatedPages).toEqual([50]);expect(constructs).toBe(1);
});
it('does not turn an explicit jump into a reading transition',async()=>{
 await observe();await act(async()=>vi.advanceTimersByTimeAsync(15000));sessionStorage.setItem('isSilentJump','true');positions=[{top:-500,bottom:0},{top:0,bottom:500}];await observe();expect(useQuranStore.getState().currentPage).toBe(50);expect(useKhatmStore.getState().validatedPages).toEqual([]);
});
it('selects the same line independently of partially visible next-page verses',async()=>{
 await observe();expect(verseAtReadingLine(observed,0,600)).toBe(observed[0]);
 positions=[{top:-100,bottom:100},{top:100,bottom:600}];expect(verseAtReadingLine(observed,0,600)).toBe(observed[1]);
});
