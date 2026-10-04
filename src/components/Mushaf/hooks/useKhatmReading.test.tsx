// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter,useNavigate} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {useKhatmStore} from '../../../stores/khatmStore';
import {useQuranStore} from '../../../stores/quranStore';
import {useLiveFollowStore} from '../../../stores/liveFollowStore';
import {useKhatmReading} from './useKhatmReading';
vi.mock('../../../stores/challengesStore',()=>({useChallengesStore:{getState:()=>({markPageRead:vi.fn()})}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,container:HTMLDivElement,ready=true;let navigate:ReturnType<typeof useNavigate>;
function Harness(){const page=useQuranStore(s=>s.currentPage);navigate=useNavigate();useKhatmReading({page,ready,surah:2,ayah:255});return null;}
const tick=async(ms:number)=>act(async()=>{await vi.advanceTimersByTimeAsync(ms);});
const move=async(page:number,reading=true)=>act(async()=>useQuranStore.getState().goToPage(page,{silent:!reading,reading}));
beforeEach(async()=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','performance']});vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 vi.spyOn(document,'hasFocus').mockReturnValue(true);Object.defineProperty(document,'hidden',{configurable:true,value:false});
 useKhatmStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useKhatmStore.getState().reset();useKhatmStore.getState().activate('2026-10-04','2026-11-04');
 useQuranStore.setState({currentPage:42,khatmJumpSignal:0});useLiveFollowStore.setState({active:false});ready=true;
 container=document.createElement('div');document.body.append(container);root=createRoot(container);
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>));
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.useRealTimers();vi.unstubAllGlobals();});
it('does not validate the displayed page; validates it once on a normal next-page transition',async()=>{
 expect(useKhatmStore.getState().validatedPages).toEqual([]);await tick(15000);
 expect(useKhatmStore.getState().validatedPages).toEqual([]);expect(useKhatmStore.getState().lastKhatmPage).toBe(42);
 await move(43);expect(useKhatmStore.getState().validatedPages).toEqual([42]);await move(44);expect(useKhatmStore.getState().validatedPages).toEqual([42]);
});
it('ignores search/bookmark/slider jumps even by one page',async()=>{
 await tick(15000);await move(43,false);expect(useKhatmStore.getState().validatedPages).toEqual([]);
 await tick(15000);await move(44);expect(useKhatmStore.getState().validatedPages).toEqual([43]);
});
it('does not count hidden time or pages changed while the persistent reader is off route',async()=>{
 await tick(10000);await act(async()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await tick(60000);await act(async()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await move(43);
 expect(useKhatmStore.getState().validatedPages).toEqual([]);
 await act(async()=>navigate('/'));await tick(60000);await move(44);expect(useKhatmStore.getState().validatedPages).toEqual([]);
});
it('excludes a loading image and an open Khatm dialog',async()=>{
 ready=false;await act(async()=>root.render(<MemoryRouter><Harness/></MemoryRouter>));await tick(60000);
 ready=true;await act(async()=>root.render(<MemoryRouter><Harness/></MemoryRouter>));await move(43);expect(useKhatmStore.getState().validatedPages).toEqual([]);
 const modal=document.createElement('div');modal.className='khatm-popup';await act(async()=>document.body.append(modal));await tick(60000);await act(async()=>modal.remove());await move(44);
 expect(useKhatmStore.getState().validatedPages).toEqual([]);
});
it('never credits voice-recognition jumps',async()=>{
 await tick(15000);await act(async()=>useLiveFollowStore.setState({active:true}));await move(43);expect(useKhatmStore.getState().validatedPages).toEqual([]);
});
