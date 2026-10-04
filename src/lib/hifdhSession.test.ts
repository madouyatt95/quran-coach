import {it,expect} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
import {readHifdhSession,HIFDH_SESSION_KEY,difficultPassages} from './hifdhSession';
import type {CoachReviewEntry} from './coachSession';
it('restores the exact saved range, position and study settings',()=>{
 const storage=createMemoryStorage();const session={surah:2,start:70,end:75,ayah:73,speed:1.25,repeats:3,phonetics:true,focus:true,step:'recite'};
 storage.setItem(HIFDH_SESSION_KEY,JSON.stringify(session));expect(readHifdhSession(storage)).toEqual(session);
});
it('migrates the old bookmark without deleting it',()=>{
 const storage=createMemoryStorage();storage.setItem('hifdh-bookmark','{"surah":3,"ayah":20}');expect(readHifdhSession(storage)).toMatchObject({surah:3,start:20,end:20,ayah:20});expect(storage.getItem('hifdh-bookmark')).not.toBeNull();
});
it('rejects corrupt sessions without overwriting storage',()=>{
 const storage=createMemoryStorage();storage.setItem(HIFDH_SESSION_KEY,'broken');expect(readHifdhSession(storage)).toBeNull();expect(storage.getItem(HIFDH_SESSION_KEY)).toBe('broken');
});
it('groups errors at their actual verse, across ranges and surahs',()=>{
 const entries=[{scoreKey:'2:70-75',wordKey:'3-1'},{scoreKey:'2:70-75',wordKey:'3-2'},{scoreKey:'3:15-20',wordKey:'5-0'},{scoreKey:'2:70-75',wordKey:'9-0'}] as CoachReviewEntry[];
 expect(difficultPassages(entries)).toEqual([{surah:2,start:73,end:73},{surah:3,start:20,end:20}]);
});
