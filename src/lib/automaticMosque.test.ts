import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
import { expect,it } from 'vitest';
import { closestStableMosque } from './automaticMosque';
import { activeMosque, useMosqueStore } from '../stores/mosqueStore';
import type { Mosque } from './mosques';
const a:Mosque={id:'a',name:'A',city:'Paris',lat:48.85,lng:2.35,sourceUrl:'https://mawaqit.net/fr/a'};
const b:Mosque={...a,id:'b',name:'B',lat:48.851};
it('keeps the current mosque through small GPS shifts but changes when the user travels',()=>{
 expect(closestStableMosque([a,b],b,a)?.id).toBe('a');
 const far={...b,lat:49};expect(closestStableMosque([a,far],far,a)?.id).toBe('b');
});
it('does not auto-select an uncertain identity or silently prefer calendars over proximity',()=>{
 expect(closestStableMosque([{...a,matchUncertain:true},b],a,null)?.id).toBe('b');
 expect(closestStableMosque([a,{...b,refs:{mawaqit:'b'}}],a,null)?.id).toBe('a');
 expect(closestStableMosque([],a,a)).toBeNull();
});
it('keeps the saved favorite independent from automatic location and locks a manual choice',()=>{
 useMosqueStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 const store=useMosqueStore.getState();store.setFavorite(a);store.setSelectionMode('nearby');store.setNearby(b);
 expect(useMosqueStore.getState().favorite?.id).toBe('a');expect(activeMosque(useMosqueStore.getState())?.id).toBe('b');
 store.setFavorite(b);expect(useMosqueStore.getState().selectionMode).toBe('favorite');
 store.setSelectionMode('nearby');store.setNearby(null);expect(activeMosque(useMosqueStore.getState())).toBeNull();
});
