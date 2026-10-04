// @vitest-environment jsdom
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {useDailyAdhkarStore,localAdhkarDay} from './dailyAdhkarStore';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());useDailyAdhkarStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});});
afterEach(()=>vi.useRealTimers());
it('persists counts, caps them and resets at the local day boundary',async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date(2026,9,4,10));
 useDailyAdhkarStore.setState({day:localAdhkarDay(),counts:{}});
 for(let n=0;n<5;n++)useDailyAdhkarStore.getState().increment('morning-103',3);
 useDailyAdhkarStore.getState().increment('daily-10096',100);
 await useDailyAdhkarStore.persist.rehydrate();
 expect(useDailyAdhkarStore.getState().counts).toEqual({'morning-103':3,'daily-10096':1});
 vi.setSystemTime(new Date(2026,9,5,1));useDailyAdhkarStore.getState().increment('evening-103',3);
 expect(useDailyAdhkarStore.getState().counts).toEqual({'evening-103':1});
});
