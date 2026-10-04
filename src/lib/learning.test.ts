import {describe,it,expect} from 'vitest';
import {buildDailySession,masteryLabel,parsePassage,differingWordIndices,localDay} from './learning';
import type {SRSCard} from '../stores/srsStore';
const card=(id:string,date:string):SRSCard=>{const [surah,ayah]=id.split(':').map(Number);return {id,surah,ayah,nextReviewDate:date,repetitions:0,interval:0,easeFactor:2.5,lastReviewDate:null,addedDate:date};};
describe('daily learning plan',()=>{
 it('prioritizes overdue cards and uses the same chosen verse for comprehension, listening and recall',()=>{
 const cards={'1:2':card('1:2','2026-10-03'),'2:1':card('2:1','2026-10-01'),'1:3':card('1:3','2026-10-05')};
 const steps=buildDailySession(10,cards,{surah:112,ayah:1},'2026-10-04');
 expect(steps.map(s=>s.id)).toEqual(['review-2:1','review-1:2','understand','listen','recite']);
 expect(steps.slice(2).every(s=>s.surah===112&&s.ayah===1)).toBe(true);
 });
 it('keeps short sessions bounded and excludes future cards',()=>{
 const cards=Object.fromEntries(Array.from({length:8},(_,i)=>{const c=card(`1:${i+1}`,'2026-10-01');return[c.id,c];}));
 expect(buildDailySession(5,cards,{surah:1,ayah:1},'2026-10-04')).toHaveLength(4);
 expect(buildDailySession(20,cards,{surah:1,ayah:1},'2026-10-04')).toHaveLength(7);
 });
 it('does not call an assisted or isolated successful recall stable',()=>{
 const stable={...card('1:1','2026-11-01'),interval:8,repetitions:3};
 expect(masteryLabel({recall:'assisted',attempts:3,lastPracticed:''},stable,'2026-10-04')).toBe('Récité avec aide');
 expect(masteryLabel({recall:'independent',attempts:1,lastPracticed:''},{...stable,repetitions:1},'2026-10-04')).toBe('Rappelé sans aide');
 expect(masteryLabel({recall:'independent',attempts:3,lastPracticed:''},stable,'2026-10-04')).toBe('Stable selon vos révisions');
 expect(masteryLabel(undefined,card('1:1','2026-10-01'),'2026-10-04')).toBe('À réviser');
 });
 it('rejects invalid passage numbers',()=>{expect(parsePassage(new URLSearchParams('surah=999&ayah=-1'))).toEqual({surah:1,ayah:1});});
 it('aligns repeated words without highlighting unchanged words',()=>{expect([...differingWordIndices(['a','b','a','c'],['a','b','d','a','c'])]).toEqual([]);expect([...differingWordIndices(['a','b','c'],['a','x','c'])]).toEqual([1]);});
 it('uses the calendar date local to the device',()=>{expect(localDay(new Date(2026,9,4,0,5))).toBe('2026-10-04');});
});
