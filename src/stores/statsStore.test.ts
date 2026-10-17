// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useStatsStore as store} from './statsStore';
import {localDay} from '../lib/learning';
import {regularityStreak} from '../lib/regularity';
let storage:Storage;
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date(2026,9,13,23,50));storage=createMemoryStorage();store.persist.setOptions({storage:createJSONStorage(()=>storage)});store.setState({activeDays:{},countedPages:{},readingStreak:0,lastReadDate:null,activityHistory:{},todayPagesRead:0,totalPagesRead:0});});
afterEach(()=>vi.useRealTimers());
it('counts local days once and increments on the next active day',()=>{store.getState().recordActivity();store.getState().recordActivity();expect(store.getState().readingStreak).toBe(1);expect(Object.keys(store.getState().activeDays)).toEqual(['2026-10-13']);vi.setSystemTime(new Date(2026,9,14,0,10));store.getState().checkAndUpdateStreak();expect(store.getState().readingStreak).toBe(1);store.getState().recordActivity();expect(store.getState().readingStreak).toBe(2);});
it('expires after an inactive day and starts at one on return',()=>{store.getState().recordActivity();vi.setSystemTime(new Date(2026,9,15,12));store.getState().checkAndUpdateStreak();expect(store.getState().readingStreak).toBe(0);store.getState().recordActivity();expect(store.getState().readingStreak).toBe(1);});
it('restores evidenced days without inventing missing history or pages',async()=>{store.setState({activityHistory:{'2026-10-11':2},readingStreak:1});store.getState().restoreActivityDays(['2026-10-12','2026-10-13']);expect(store.getState().readingStreak).toBe(3);expect(store.getState().totalPagesRead).toBe(0);const saved=storage.getItem('quran-coach-stats');store.setState({activeDays:{},activityHistory:{}});storage.setItem('quran-coach-stats',saved!);await store.persist.rehydrate();store.getState().checkAndUpdateStreak();expect(store.getState().readingStreak).toBe(3);});
it('deduplicates qualified pages per day while retaining daily goals separately',()=>{store.getState().setDailyGoal(5);store.getState().recordQualifiedPage(4);store.getState().recordQualifiedPage(4);expect(store.getState().totalPagesRead).toBe(1);expect(store.getState().readingStreak).toBe(1);vi.setSystemTime(new Date(2026,9,14,12));store.getState().recordQualifiedPage(4);expect(store.getState().readingStreak).toBe(2);expect(store.getState().todayPagesRead).toBe(1);});
it('handles the autumn daylight-saving transition by calendar date',()=>{const now=new Date(2026,9,26,0,15);expect(localDay(now)).toBe('2026-10-26');expect(regularityStreak(['2026-10-24','2026-10-25','2026-10-26'],now)).toBe(3);});
