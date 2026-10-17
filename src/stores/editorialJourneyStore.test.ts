import {beforeEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useEditorialJourneyStore as store} from './editorialJourneyStore';
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());store.persist.setOptions({storage:createJSONStorage(()=>localStorage)});store.setState({progress:{},notes:{}});});
it('restores progress and private notes from persistence, and persists removal',async()=>{
 store.getState().saveProgress('prophet:adam',{step:'verse-2-30',sentence:0,seconds:3.6,completed:['story-0']});store.getState().saveNote('prophet:adam',{text:'Une réflexion',action:'Remercier',lesson:'Apprendre',done:true});
 const raw=localStorage.getItem('quran-coach-editorial-journeys')!;store.setState({progress:{},notes:{}});localStorage.setItem('quran-coach-editorial-journeys',raw);await store.persist.rehydrate();
 expect(store.getState().progress['prophet:adam'].seconds).toBe(3.6);expect(store.getState().notes['prophet:adam'].text).toBe('Une réflexion');store.getState().removeNote('prophet:adam');await store.persist.rehydrate();expect(store.getState().notes).toEqual({});expect(store.getState().progress['prophet:adam']).toBeDefined();
});
it('discards malformed persisted records without dropping valid ones',async()=>{
 localStorage.setItem('quran-coach-editorial-journeys',JSON.stringify({version:1,state:{progress:{bad:null,good:{step:'story-0',sentence:0,seconds:0,completed:[],updatedAt:1}},notes:{bad:{text:3},bad2:null}}}));await store.persist.rehydrate();expect(Object.keys(store.getState().progress)).toEqual(['good']);expect(store.getState().notes).toEqual({});
});
it('rejects negative offsets and oversized notes',()=>{store.getState().saveProgress('x',{step:'x',sentence:0,seconds:-1,completed:[]});store.getState().saveNote('x',{text:'x'.repeat(2001),lesson:'',action:'',done:false});expect(store.getState().progress).toEqual({});expect(store.getState().notes).toEqual({});});
