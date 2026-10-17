// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({cancel:vi.fn(async()=>{}),schedule:vi.fn(async()=>{}),pending:vi.fn(async()=>({notifications:[{id:1000},{id:7000},{id:9000}]}))}));
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>true}}));
vi.mock('@capacitor/local-notifications',()=>({LocalNotifications:{getPending:mocks.pending,cancel:mocks.cancel,schedule:mocks.schedule}}));
vi.mock('./supabase',()=>({supabase:{}}));
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {updatePushPreferences} from './notificationService';
import {useNotificationStore} from '../stores/notificationStore';
import {usePrayerStore} from '../stores/prayerStore';
beforeEach(()=>{useNotificationStore.persist.setOptions({storage:createJSONStorage(createMemoryStorage)});usePrayerStore.persist.setOptions({storage:createJSONStorage(createMemoryStorage)});vi.clearAllMocks();vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));useNotificationStore.setState({enabled:true,prayerEnabled:true,adhanEnabled:false,prayerMinutesConfig:{fajr:10,dhuhr:10,asr:10,maghrib:10,isha:10}});usePrayerStore.setState({lat:48.85,lng:2.35});});
afterEach(()=>vi.useRealTimers());
it('rescheduling reminders preserves adhan and unrelated IDs and excludes past times',async()=>{
 await updatePushPreferences({});expect(mocks.cancel).toHaveBeenCalledWith({notifications:[{id:1000}]});
 expect(mocks.schedule).toHaveBeenCalledWith({notifications:expect.arrayContaining([expect.objectContaining({id:1000,sound:'default'})])});
 const call=vi.mocked(mocks.schedule).mock.calls as unknown as [{notifications:{id:number;schedule:{at:Date}}[]}][];
 expect(call[0][0].notifications.every(n=>n.id<2000&&n.schedule.at.getTime()>Date.now())).toBe(true);
});
it('does not duplicate a zero-offset reminder when adhan is enabled',async()=>{useNotificationStore.setState({adhanEnabled:true,prayerMinutesConfig:{fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0}});await updatePushPreferences({});expect(mocks.schedule).not.toHaveBeenCalled();});
it('keeps reminders disabled when updating another preference',async()=>{useNotificationStore.setState({prayerEnabled:false});await updatePushPreferences({hadithEnabled:true});expect(mocks.schedule).not.toHaveBeenCalled();});
