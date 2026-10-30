// @vitest-environment jsdom
import {beforeEach,describe,it,expect} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {sessionTarget,useReadingSession} from './readingSession';
import {PAGE_MANIFEST} from '../../../lib/interactiveMushaf/model';
beforeEach(()=>{useReadingSession.persist.setOptions({storage:createJSONStorage(createMemoryStorage)});useReadingSession.getState().clear();});
describe('reading session, independent of Khatm',()=>{
 it('counts the current page, clamps at the end and identifies the final verse',()=>{
  expect(sessionTarget(4,'pages',2)).toMatchObject({start:4,end:8,label:'5 pages',finishedAt:null});
  expect(sessionTarget(602,'pages',112)).toMatchObject({end:604,label:'3 pages'});
 });
 it('uses the last page of a surah endpoint',()=>{
  const session=sessionTarget(4,'surah',2);
  expect(session.endVerse).toBe('2:286');
  expect(PAGE_MANIFEST[session.end].verseKeys).toContain('2:286');
  expect(session.end).toBe(49);
 });
 it('finishes only on explicit confirmation and can be removed',()=>{
  useReadingSession.getState().start(4,'pages',2);
  expect(useReadingSession.getState().session?.finishedAt).toBeNull();
  useReadingSession.getState().finish();
  expect(useReadingSession.getState().session?.finishedAt).toBeGreaterThan(0);
  useReadingSession.getState().clear();
  expect(useReadingSession.getState().session).toBeNull();
 });
});
it('restores the current goal after reopening, rejects corrupted data',async()=>{
 const memory=createMemoryStorage();useReadingSession.persist.setOptions({storage:createJSONStorage(()=>memory)});
 useReadingSession.getState().start(291,'pages',17);await useReadingSession.persist.rehydrate();
 expect(useReadingSession.getState().session).toMatchObject({start:291,end:295,finishedAt:null});
 memory.setItem('quran-coach-reading-session',JSON.stringify({state:{session:{start:1,end:999}}}));
 await useReadingSession.persist.rehydrate();expect(useReadingSession.getState().session).toBeNull();
});
