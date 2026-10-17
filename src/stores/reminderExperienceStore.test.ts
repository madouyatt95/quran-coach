// @vitest-environment jsdom
import {beforeEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useReminderExperienceStore as store} from './reminderExperienceStore';
import type {CompanionCard} from '../lib/companion';
const card:CompanionCard={id:'reading',topic:'al-kahf',origin:'sentinel',title:'Al-Kahf',emoji:'📖',message:'',reason:'',minutes:5,route:'/read?surah=18&ayah=24',action:'Reprendre',kind:'Coran',priority:80};
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());store.persist.setOptions({storage:createJSONStorage(()=>localStorage)});store.setState({groups:{},cooldowns:{},moments:[]});});
it('keeps exact passage across persistence and replaces a slot without duplication',async()=>{
 const at=Date.now()+3600000;store.getState().keep(card,at);store.getState().keep(card,at+3600000);
 expect(store.getState().moments).toHaveLength(1);store.setState({groups:{reading:false}});
 const saved=localStorage.getItem('quran-coach-reminder-experience-v1')!;
 store.setState({moments:[],groups:{}});localStorage.setItem('quran-coach-reminder-experience-v1',saved);await store.persist.rehydrate();
 expect(store.getState().moments[0].card.route).toBe(card.route);expect(store.getState().groups.reading).toBe(false);
});
it('rejects past, invalid and expired prayer slots without changing existing moments',()=>{
 const now=Date.now();expect(store.getState().keep(card,now-1)).toBeNull();expect(store.getState().keep(card,NaN)).toBeNull();expect(store.getState().keep({...card,expiresAt:now+1000},now+2000)).toBeNull();expect(store.getState().moments).toEqual([]);
});
