// @vitest-environment jsdom
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createJSONStorage } from 'zustand/middleware';
import { beforeEach, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../test/memoryStorage';
import { useAutomaticMosque } from './useAutomaticMosque';
import { locateMosqueSearch, syncPrayerPosition } from '../lib/locationService';
import { loadDirectory, useMosqueDirectoryStore } from '../stores/mosqueDirectoryStore';
import { SALATS } from '../lib/mosquePlanning';
import { mosqueDate } from '../lib/mosques';
import type { PublishedTimetable } from '../lib/mosqueTimetables';
import { useMosqueStore } from '../stores/mosqueStore';
vi.mock('../lib/locationService',()=>({locateMosqueSearch:vi.fn(),syncPrayerPosition:vi.fn().mockResolvedValue(undefined)}));
vi.mock('../stores/mosqueDirectoryStore',async importOriginal=>({...await importOriginal<typeof import('../stores/mosqueDirectoryStore')>(),loadDirectory:vi.fn()}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const mosque={id:'near',name:'Mosquée proche',city:'Paris',lat:48.85,lng:2.35,sourceUrl:'https://mawaqit.net/fr/near'};
let state:ReturnType<typeof useAutomaticMosque>;
function Probe(){const current=useAutomaticMosque();useEffect(()=>{state=current;},[current]);return <p>{current.error}</p>;}
beforeEach(()=>{
 vi.resetAllMocks();
 vi.mocked(syncPrayerPosition).mockResolvedValue(undefined);
 useMosqueStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});useMosqueDirectoryStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 useMosqueStore.setState({selectionMode:'nearby',nearby:null,favorite:null});
 useMosqueDirectoryStore.setState({automatic:{},links:{},published:{},discover:vi.fn().mockResolvedValue(undefined)});
});
it('never substitutes a saved city after denied GPS',async()=>{
 vi.mocked(locateMosqueSearch).mockRejectedValue(new Error('Localisation refusée'));
 const root=createRoot(document.createElement('div'));
 await act(async()=>root.render(<Probe/>));
 expect(state.error).toContain('refusée');expect(loadDirectory).not.toHaveBeenCalled();expect(useMosqueStore.getState().nearby).toBeNull();
 await act(async()=>root.unmount());
});
it('ignores a late GPS answer once a mosque has been manually locked',async()=>{
 let resolve!:(value:{lat:number;lng:number})=>void;
 vi.mocked(locateMosqueSearch).mockReturnValue(new Promise(r=>{resolve=r;}));
 const root=createRoot(document.createElement('div'));
 await act(async()=>root.render(<Probe/>));
 await act(async()=>useMosqueStore.getState().setFavorite(mosque));
 await act(async()=>resolve(mosque));
 expect(useMosqueStore.getState().favorite).toEqual(mosque);expect(loadDirectory).not.toHaveBeenCalled();
 await act(async()=>root.unmount());
});
it('selects the nearest place while bounding requests for alternative calendars',async()=>{
 vi.mocked(locateMosqueSearch).mockResolvedValue(mosque);
 vi.mocked(loadDirectory).mockResolvedValue({mosques:[mosque,...Array.from({length:20},(_,i)=>({...mosque,id:`other-${i}`,lat:mosque.lat+.005*(i+1),website:'https://example.org'}))],fetchedAt:Date.now(),unavailable:[],mawaqit:'public-map'});
 const root=createRoot(document.createElement('div'));
 await act(async()=>root.render(<Probe/>));
 expect(useMosqueStore.getState().nearby).toBeNull();expect(useMosqueDirectoryStore.getState().discover).toHaveBeenCalledTimes(10);expect(state.alternative).toBeNull();
 await act(async()=>root.unmount());
});

it('rejects a coarse GPS location instead of selecting a misleading nearest mosque',async()=>{
 vi.mocked(locateMosqueSearch).mockResolvedValue({...mosque,accuracy:5000});
 const root=createRoot(document.createElement('div'));
 await act(async()=>root.render(<Probe/>));
 expect(state.error).toContain('approximative');expect(loadDirectory).not.toHaveBeenCalled();expect(useMosqueStore.getState().nearby).toBeNull();
 await act(async()=>root.unmount());
});

function calendar(id:string):PublishedTimetable{return {mosque:{...mosque,id},mosqueId:id,source:'MAWAQIT',sourceUrl:mosque.sourceUrl,timezone:'Europe/Paris',fetchedAt:Date.now(),days:[{date:mosqueDate('Europe/Paris'),prayers:SALATS.map((key,i)=>({key,adhan:'12:00',adhanAt:Date.now()+i*3600000,iqama:null,iqamaAt:null})),jumua:[]}]};}
it('automatically picks the next nearest complete published calendar, preserving the favorite',async()=>{
 const second={...mosque,id:'second',lat:mosque.lat+.001},third={...mosque,id:'third',lat:mosque.lat+.002};
 vi.mocked(locateMosqueSearch).mockResolvedValue(mosque);
 vi.mocked(loadDirectory).mockResolvedValue({mosques:[third,mosque,second],fetchedAt:Date.now(),unavailable:[],mawaqit:'public-map'});
 useMosqueStore.setState({favorite:third});
 const discover=vi.fn(async m=>{if(m.id==='second')useMosqueDirectoryStore.setState({automatic:{second:{status:'found',checkedAt:Date.now(),slug:'second'}},published:{second:calendar('second')}});});
 useMosqueDirectoryStore.setState({discover});
 const root=createRoot(document.createElement('div'));await act(async()=>root.render(<Probe/>));
 expect(discover.mock.calls.map(args=>args[0].id)).toEqual(['near','second']);expect(useMosqueStore.getState().nearby?.id).toBe('second');expect(useMosqueStore.getState().favorite?.id).toBe('third');expect(state.alternative?.id).toBe('near');
 await act(async()=>root.unmount());
});
it('expands to 15 km when nearby mosques have no schedules',async()=>{
 const far={...mosque,id:'far',lat:mosque.lat+.06};
 vi.mocked(locateMosqueSearch).mockResolvedValue(mosque);
 vi.mocked(loadDirectory).mockImplementation(async(_lat,_lng,radius)=>({mosques:radius===5000?[mosque]:[mosque,far],fetchedAt:Date.now(),unavailable:[],mawaqit:'public-map'}));
 useMosqueDirectoryStore.setState({discover:vi.fn(async m=>{if(m.id==='far')useMosqueDirectoryStore.setState({automatic:{far:{status:'found',checkedAt:Date.now(),slug:'far'}},published:{far:calendar('far')}});})});
 const root=createRoot(document.createElement('div'));await act(async()=>root.render(<Probe/>));
 expect(loadDirectory).toHaveBeenCalledTimes(2);expect(useMosqueStore.getState().nearby?.id).toBe('far');
 await act(async()=>root.unmount());
});
