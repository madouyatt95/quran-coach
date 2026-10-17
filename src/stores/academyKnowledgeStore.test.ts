// @vitest-environment jsdom
import {it,expect,beforeEach,afterEach,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useAcademyKnowledgeStore as store,conceptKey} from './academyKnowledgeStore';
import {conceptStatus} from '../academy/conceptLearning';
let memory:Storage;
beforeEach(()=>{memory=createMemoryStorage();store.persist.setOptions({storage:createJSONStorage(()=>memory)});store.setState({concepts:{},session:null});vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-13T09:00:00Z'));});
afterEach(()=>vi.useRealTimers());
it('tracks an exact weak notion, then requires delayed review to consolidate it',()=>{
 const key=conceptKey('sabirin-tawhid-1',1),answer=store.getState().answer;
 answer('sabirin-tawhid-1',1,'check',0,false);expect(conceptStatus('sabirin-tawhid-1',1,store.getState().concepts)).toBe('À revoir');expect(conceptStatus('sabirin-tawhid-1',0,store.getState().concepts)).toBe('À découvrir');
 answer('sabirin-tawhid-1',1,'retry',2,true);answer('sabirin-tawhid-1',1,'review',2,true,true);expect(store.getState().concepts[key].confirmedAt).toBeUndefined();expect(conceptStatus('sabirin-tawhid-1',1,store.getState().concepts)).toBe('Compris');
 vi.advanceTimersByTime(3*86400000);answer('sabirin-tawhid-1',1,'review',2,true,true);expect(conceptStatus('sabirin-tawhid-1',1,store.getState().concepts)).toBe('Consolidé');
 answer('sabirin-tawhid-1',1,'case',0,false);expect(conceptStatus('sabirin-tawhid-1',1,store.getState().concepts)).toBe('À revoir');expect(store.getState().concepts[key].mistakes).toBe(2);
});
it('persists the review cursor and writing without replacing prior quiz answers',async()=>{
 const legacy={completed:true,score:100,answers:{'sabirin-tawhid-1:1:0':0,'sabirin-tawhid-1:1:1':0}};
 expect(conceptStatus('sabirin-tawhid-1',0,{},legacy)).toBe('Compris');expect(conceptStatus('sabirin-tawhid-1',1,{},legacy)).toBe('À revoir');
 store.getState().write('sabirin-tawhid-1',0,'explanation','Mon explication');store.getState().begin([{id:'sabirin-tawhid-1',index:0,reason:'Mon point'}]);store.getState().advance();
 const saved=memory.getItem('qc-academy-notions-v1');expect(saved).toContain('Mon explication');store.setState({concepts:{},session:null});memory.setItem('qc-academy-notions-v1',saved!);await store.persist.rehydrate();expect(store.getState().session?.stage).toBe(1);expect(store.getState().concepts[conceptKey('sabirin-tawhid-1',0)].explanation).toBe('Mon explication');
 store.getState().advance();store.getState().advance();expect(store.getState().session?.finished).toBe(true);expect(legacy.answers['sabirin-tawhid-1:1:0']).toBe(0);
});
it('reopens fresh practice after a later quiz or transfer mistake',()=>{
 const key=conceptKey('sabirin-hadith-2',0),api=store.getState();api.answer('sabirin-hadith-2',0,'check',1,true);api.answer('sabirin-hadith-2',0,'retry',0,true);api.answer('sabirin-hadith-2',0,'quiz',2,false);
 expect(store.getState().concepts[key].answers.check).toBeUndefined();expect(store.getState().concepts[key].answers.retry).toBeUndefined();expect(store.getState().concepts[key].answers.quiz).toBe(2);
});
it('keeps the last successful retry for a coherent reopened correction',()=>{
 const key=conceptKey('sabirin-tawhid-1',0),api=store.getState();api.answer('sabirin-tawhid-1',0,'check',1,false);api.answer('sabirin-tawhid-1',0,'retry',1,true);expect(store.getState().concepts[key].lastQuestion).toBe('retry');expect(store.getState().concepts[key].answers.retry).toBe(1);expect(store.getState().concepts[key].lastCorrect).toBe(true);
});
