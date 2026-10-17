import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
import { expect,it,beforeEach } from 'vitest';
import {useMosqueStore} from './mosqueStore';
const mosque={id:'test',name:'Mosquée test',lat:48.85,lng:2.35,city:'Paris',sourceUrl:'https://pray.zone'};
beforeEach(()=>{ useMosqueStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())}); useMosqueStore.setState({favorite:null,timetableUrl:''}); });
it('keeps a timetable attached to its mosque and clears it on replacement or removal',()=>{
 const s=useMosqueStore.getState();s.setFavorite(mosque);s.setTimetableUrl('https://mawaqit.net/fr/test');s.setFavorite({...mosque,address:'Adresse'});
 expect(useMosqueStore.getState().timetableUrl).toContain('mawaqit');s.setFavorite({...mosque,id:'another'});expect(useMosqueStore.getState().timetableUrl).toBe('');s.setTimetableUrl('javascript:alert(1)');expect(useMosqueStore.getState().timetableUrl).toBe('');s.setFavorite(null);expect(useMosqueStore.getState().favorite).toBeNull();
});
