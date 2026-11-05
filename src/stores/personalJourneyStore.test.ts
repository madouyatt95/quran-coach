// @vitest-environment jsdom
import {describe,it,expect,beforeEach,vi} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
import {nextRevision,usePersonalJourneyStore as store} from './personalJourneyStore';
describe('personal journey',()=>{
 beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());store.setState({session:null,reviews:{},savedCourses:{}});});
 it('brings forgotten material back tomorrow and spaces successful recalls',()=>{
  const first=nextRevision(undefined,true,1000);
  expect(first.interval).toBe(3);
  const second=nextRevision(first,true,1000);
  expect(second.interval).toBe(6);
  expect(nextRevision(second,false,1000)).toEqual({due:86401000,interval:1,attempts:3,correct:false});
  expect(nextRevision({...second,interval:60},true,1000).interval).toBe(60);
 });
 it('does not complete other steps and restores the saved session',async()=>{
  store.getState().start(5,[{id:'read',title:'Lire',href:'/read?page=4',minutes:3,done:false},{id:'review',title:'Revoir',href:'/learning/review',minutes:2,done:false}]);
  store.getState().complete('read');
  await store.persist.rehydrate();
  expect(store.getState().session?.activities.map(a=>a.done)).toEqual([true,false]);
  expect(store.getState().session?.activities[0].href).toBe('/read?page=4');
 });
 it('removes a saved course without clearing revisions or the session',()=>{
  store.getState().review('course:test:1',false);
  store.getState().toggleCourse('test');
  expect(store.getState().savedCourses.test).toBeGreaterThan(0);
  store.getState().toggleCourse('test');
  expect(store.getState().savedCourses).toEqual({});
  expect(store.getState().reviews['course:test:1'].attempts).toBe(1);
 });
});
