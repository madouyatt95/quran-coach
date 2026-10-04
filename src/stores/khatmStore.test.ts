// @vitest-environment jsdom
import {beforeEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useKhatmStore,hasCompleteKhatm} from './khatmStore';
const allPages=Array.from({length:604},(_,i)=>i+1);
beforeEach(()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());
 useKhatmStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useKhatmStore.getState().reset();useKhatmStore.setState({completionCount:2});
 useKhatmStore.getState().activate('2026-10-04','2026-11-04');
});
it('requires every valid page and an explicit confirmation',()=>{
 useKhatmStore.setState({lastKhatmPage:604,validatedPages:[604]});
 expect(useKhatmStore.getState().confirmCompletion()).toBe(false);
 expect(hasCompleteKhatm(Array(604).fill(604))).toBe(false);
 expect(hasCompleteKhatm([...allPages.slice(1),605])).toBe(false);
 useKhatmStore.setState({validatedPages:allPages});
 expect(useKhatmStore.getState().celebrationPending).toBe(false);
 expect(useKhatmStore.getState().confirmCompletion()).toBe(true);
 expect(useKhatmStore.getState()).toMatchObject({completionCount:3,celebrationPending:true});
});
it('counts once across repeated taps, dismissals and reloads',async()=>{
 useKhatmStore.setState({validatedPages:allPages});
 useKhatmStore.getState().confirmCompletion();useKhatmStore.getState().confirmCompletion();
 useKhatmStore.getState().dismissCelebration();await useKhatmStore.persist.rehydrate();
 expect(useKhatmStore.getState().confirmCompletion()).toBe(false);
 expect(useKhatmStore.getState()).toMatchObject({completionCount:3,celebrationPending:false});
 useKhatmStore.getState().activate('2026-11-05','2026-12-05');
 expect(useKhatmStore.getState().completionCount).toBe(3);
 expect(useKhatmStore.getState().confirmCompletion()).toBe(false);
 useKhatmStore.setState({validatedPages:allPages});useKhatmStore.getState().confirmCompletion();
 expect(useKhatmStore.getState().completionCount).toBe(4);
});
it('preserves existing reading data on upgrading persisted state',async()=>{
 localStorage.setItem('quran-coach-khatm',JSON.stringify({state:{isActive:true,validatedPages:[1,2,42],lastKhatmPage:42},version:0}));
 await useKhatmStore.persist.rehydrate();
 expect(useKhatmStore.getState()).toMatchObject({validatedPages:[1,2,42],lastKhatmPage:42,completionCount:2,completedAt:null});
});

it('uses exact pages for progress and daily targets',()=>{
 useKhatmStore.setState({validatedPages:allPages.slice(0,603)});
 expect(useKhatmStore.getState().getOverallProgress()).toEqual({read:603,total:604,pct:99});
 useKhatmStore.setState({validatedPages:allPages});
 expect(useKhatmStore.getState().getOverallProgress()).toEqual({read:604,total:604,pct:100});
 expect(useKhatmStore.getState().getDailyGoal()).toBe(0);
});

it('automatic validation is idempotent and respects a manually unchecked page',()=>{
 const store=useKhatmStore.getState();store.validatePage(42);store.validatePage(42);
 expect(useKhatmStore.getState().validatedPages).toEqual([42]);expect(useKhatmStore.getState().dailyReadCount).toBe(1);
 store.togglePage(42);store.validatePage(42);expect(useKhatmStore.getState().validatedPages).toEqual([]);
 store.togglePage(42);expect(useKhatmStore.getState().validatedPages).toEqual([42]);expect(useKhatmStore.getState().autoExcludedPages).toEqual([]);
});
