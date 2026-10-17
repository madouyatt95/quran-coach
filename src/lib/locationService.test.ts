// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>false}}));
let store:typeof import('../stores/prayerStore').usePrayerStore;
let service:typeof import('./locationService');
let gps:ReturnType<typeof vi.fn>;
const lyon={latitude:45.764,longitude:4.8357,accuracy:25};
beforeEach(async()=>{
 vi.resetModules();
 store=(await import('../stores/prayerStore')).usePrayerStore;
 store.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 store.setState({lat:48.8566,lng:2.3522,cityName:'Paris',countryName:'France',locationMode:'auto',locationRevision:0,locationError:'',locationUpdatedAt:0});
 gps=vi.fn(success=>success({coords:lyon}));
 Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition:gps}});
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({city:'Lyon',countryName:'France'})}));
 service=await import('./locationService');
});
afterEach(()=>vi.unstubAllGlobals());
it('refreshes saved coordinates and invalidates the old prayer cache',async()=>{
 store.setState({cache:{old:{} as never},cacheCoordsHash:'48.8566,2.3522'});
 expect(await service.resolveCoords()).toEqual({lat:45.764,lng:4.8357});
 expect(store.getState().cityName).toBe('Lyon');expect(store.getState().cache).toEqual({});
 expect(store.getState().locationUpdatedAt).toBeGreaterThan(0);
});
it('shares the same GPS fix between mosque search and main prayer times',async()=>{
 await Promise.all([service.locateMosqueSearch(),service.refreshPrayerLocation()]);
 await service.resolveCoords();
 expect(gps).toHaveBeenCalledTimes(1);expect(store.getState().lat).toBe(45.764);
});
it('preserves an explicitly fixed city without requesting GPS',async()=>{
 store.getState().setLocationMode('fixed');
 expect(await service.resolveCoords()).toEqual({lat:48.8566,lng:2.3522});expect(gps).not.toHaveBeenCalled();
});
it('keeps the last city and exposes GPS failure instead of presenting it as current',async()=>{
 gps.mockImplementation((_success,error)=>error({code:1}));
 await service.resolveCoords();
 expect(store.getState().lat).toBe(48.8566);expect(store.getState().locationError).toContain('refusée');expect(fetch).not.toHaveBeenCalled();
});
it('rejects an imprecise fix before replacing coordinates',async()=>{
 gps.mockImplementation(success=>success({coords:{...lyon,accuracy:5000}}));
 await service.refreshPrayerLocation();
 expect(store.getState().lat).toBe(48.8566);expect(store.getState().locationError).toContain('approximative');
});
it('discards an old GPS answer after a manual city selection',async()=>{
 let answer!:(p:{coords:typeof lyon})=>void;
 gps.mockImplementation(success=>{answer=success;});
 const request=service.refreshPrayerLocation();
 store.getState().setLocationMode('fixed');store.getState().updateCoords(43.3,5.4,'Marseille','France');
 answer({coords:lyon});await request;
 expect(store.getState().cityName).toBe('Marseille');expect(store.getState().lat).toBe(43.3);
});
it('does not let delayed place-name lookup overwrite a fixed city',async()=>{
 let answer!:(value:unknown)=>void;
 vi.mocked(fetch).mockReturnValue(new Promise(resolve=>{answer=resolve as typeof answer;}));
 const request=service.refreshPrayerLocation();
 await vi.waitFor(()=>expect(fetch).toHaveBeenCalledTimes(1));
 store.getState().setLocationMode('fixed');store.getState().updateCoords(43.3,5.4,'Marseille','France');
 answer({ok:true,json:async()=>({city:'Lyon'})});await request;
 expect(store.getState().cityName).toBe('Marseille');
});
