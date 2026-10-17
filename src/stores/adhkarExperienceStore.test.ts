// @vitest-environment jsdom
import {beforeEach,it,expect} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useAdhkarExperienceStore as store} from './adhkarExperienceStore';
beforeEach(()=>{store.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});store.setState({counts:{},targets:{},order:{},resume:null});});
it('caps manual counts, supports undo and explicit reset without affecting others',()=>{
 const s=store.getState();for(let i=0;i<5;i++)s.count('a',1,3);s.count('b',1,2);expect(store.getState().counts.a).toBe(3);s.count('a',-1,3);expect(store.getState().counts.a).toBe(2);s.reset(['a']);expect(store.getState().counts).toEqual({b:1});
});
it('keeps ordered collections, exact resume and display choices across rehydration',async()=>{
 const s=store.getState();s.setOrder('c',['b','a','b']);s.setResume('collection:c','b');s.configure({phonetic:false,rate:0.75});s.setTarget('b',4);s.count('b',1,4);await store.persist.rehydrate();expect(store.getState().order.c).toEqual(['b','a']);expect(store.getState().resume).toEqual({session:'collection:c',key:'b'});expect(store.getState().preferences.phonetic).toBe(false);expect(store.getState().counts.b).toBe(1);
});
it('does not discard past recitations when a personal target is reduced',()=>{
 const s=store.getState();for(let i=0;i<5;i++)s.count('a',1,10);s.setTarget('a',2);s.count('a',-1,2);expect(store.getState().counts.a).toBe(4);
});
it('migrates old preferences and preserves counters while adding independent learning progress',async()=>{
 const memory=createMemoryStorage();memory.setItem('quran-coach-adhkar-experience',JSON.stringify({version:1,state:{counts:{a:2},preferences:{phonetic:false,rate:.75}}}));store.persist.setOptions({storage:createJSONStorage(()=>memory)});await store.persist.rehydrate();expect(store.getState().preferences).toMatchObject({phonetic:false,rate:.75,arabicAudio:true,frenchAudio:false,repeatSilence:true});store.getState().markLearned('a');store.getState().setTimedSession({id:'timed:test',keys:['a'],minutes:2,seconds:30});await store.persist.rehydrate();expect(store.getState().counts.a).toBe(2);expect(store.getState().learned.a).toBeTruthy();expect(store.getState().timedSession?.keys).toEqual(['a']);
});
it('keeps a stable review session, postpones without deleting progress and never increments recitations',()=>{
 store.setState({reviews:{},reviewSession:[],learned:{},counts:{a:2}});const s=store.getState();s.rateRecall('a','again');s.startReview(['a','b']);s.postponeRecall('a');expect(store.getState().reviewSession).toEqual(['a','b']);expect(store.getState().reviews.a.rating).toBe('again');expect(store.getState().reviews.a.due).toBeGreaterThan(Date.now());expect(store.getState().counts.a).toBe(2);expect(store.getState().preferences).toMatchObject({mode:'learn',continuous:false});
});
