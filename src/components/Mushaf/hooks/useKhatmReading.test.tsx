// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {useKhatmReading} from './useKhatmReading';
import {useKhatmStore} from '../../../stores/khatmStore';
import {useQuranStore} from '../../../stores/quranStore';
vi.mock('../../../hooks/useCompanionReading',()=>({useCompanionReading:()=>{}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let page=1,ready=true,root:Root,div:HTMLDivElement;
function Harness(){useKhatmReading({page,ready,surah:page===1?1:2,ayah:1});return null;}
const render=()=>act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>));
beforeEach(async()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 useKhatmStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','Date','performance']});
 useKhatmStore.setState({isActive:true,completedAt:null,validatedPages:[],autoExcludedPages:[],validationDetails:{}});
 useQuranStore.setState({khatmJumpSignal:0});page=1;ready=true;
 div=document.createElement('div');document.body.append(div);root=createRoot(div);await render();
});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.useRealTimers();vi.unstubAllGlobals();});
it('validates the previous page through a loading transition, but never a rapid swipe',async()=>{
 await act(async()=>vi.advanceTimersByTime(16000));page=2;ready=false;await render();
 expect(useKhatmStore.getState().validatedPages).toEqual([1]);
 ready=true;await render();await act(async()=>vi.advanceTimersByTime(1000));page=3;ready=false;await render();
 expect(useKhatmStore.getState().validatedPages).toEqual([1]);
});
it('does not validate pages skipped by search or while a modal obscures reading',async()=>{
 await act(async()=>vi.advanceTimersByTime(16000));await act(async()=>useQuranStore.setState({khatmJumpSignal:1}));page=4;await render();
 expect(useKhatmStore.getState().validatedPages).toEqual([]);
 const dialog=document.createElement('dialog');await act(async()=>{dialog.setAttribute('open','');document.body.append(dialog);});
 await act(async()=>vi.advanceTimersByTime(20000));page=5;await render();expect(useKhatmStore.getState().validatedPages).toEqual([]);await act(async()=>dialog.remove());
});
