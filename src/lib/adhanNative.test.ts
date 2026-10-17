import { beforeEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({pending:vi.fn(),cancel:vi.fn(async()=>{}),schedule:vi.fn(async()=>{}),permission:vi.fn(async()=>({display:'granted'})),native:vi.fn(()=>true)}));
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:mocks.native,getPlatform:()=> 'ios'}}));
vi.mock('@capacitor/local-notifications',()=>({LocalNotifications:{getPending:mocks.pending,cancel:mocks.cancel,schedule:mocks.schedule,checkPermissions:mocks.permission}}));
import {syncNativeAdhan} from './adhanNative';
beforeEach(()=>{vi.clearAllMocks();mocks.native.mockReturnValue(true);mocks.pending.mockResolvedValue({notifications:[{id:1000},{id:7000},{id:9000}]});mocks.permission.mockResolvedValue({display:'granted'});});
const events=()=>[{key:'fajr',prayer:'fajr',label:'Fajr',at:Date.now()+60000,recording:'ahmed-fajr'}];
it('only cancels its own IDs and schedules the actual selected bundled sound',async()=>{await syncNativeAdhan(events(),true);expect(mocks.cancel).toHaveBeenCalledWith({notifications:[{id:7000}]});expect(mocks.schedule).toHaveBeenCalledWith({notifications:[expect.objectContaining({sound:'adhan-ahmed-fajr.caf'})]});});
it('disabling cancels existing calls and never schedules',async()=>{await syncNativeAdhan(events(),false);expect(mocks.cancel).toHaveBeenCalledOnce();expect(mocks.schedule).not.toHaveBeenCalled();});
it('does not request permissions automatically or schedule without them',async()=>{mocks.permission.mockResolvedValue({display:'denied'});await syncNativeAdhan(events(),true);expect(mocks.schedule).not.toHaveBeenCalled();});
it('last selection wins when preferences change quickly',async()=>{await Promise.all([syncNativeAdhan(events(),true),syncNativeAdhan([],false)]);expect(mocks.schedule).not.toHaveBeenCalled();});
it('does not call native plugins on web',async()=>{mocks.native.mockReturnValue(false);await syncNativeAdhan(events(),true);expect(mocks.pending).not.toHaveBeenCalled();});

it('re-enabling the same plan restores notifications after disabling',async()=>{const plan=events();await syncNativeAdhan(plan,true);await syncNativeAdhan(plan,false);mocks.schedule.mockClear();await syncNativeAdhan(plan,true);expect(mocks.schedule).toHaveBeenCalledOnce();});
