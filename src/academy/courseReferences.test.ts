import {it,expect} from 'vitest';
import {referenceParts,chapterReferences,referenceKey} from './courseReferences';
import {COURSE_LEVELS} from './data/courseLibrary';
import {chapterTeaching} from './data/courseExplanations';
it('links explicit verse forms and ranges without changing text',()=>{
 const text='Lire 2:177 et 2:285, Sourate 18, verset 110, puis Sourate 2, versets 1 à 5.';
 const parts=referenceParts(text);
 expect(parts.map(p=>p.text).join('')).toBe(text);
 expect(parts.filter(p=>p.reference).map(p=>p.reference)).toEqual([{kind:'verse',surah:2,ayah:177},{kind:'verse',surah:2,ayah:285},{kind:'verse',surah:18,ayah:110},{kind:'verse',surah:2,ayah:1,end:5}]);
 expect(referenceParts('114:7, 1:8, 0:1, 115:1, 2:0, 2:286–287').some(p=>p.reference)).toBe(false);
});
it('opens known named narrations but never infers a hadith from a collection or narrator alone',()=>{
 expect(referenceParts('Le hadith de Jibrîl rapporté dans Sahîh Muslim.').find(p=>p.reference)?.reference).toEqual({kind:'hadith',chapter:2});
 expect(referenceParts('Le hadith des intentions').find(p=>p.reference)?.reference).toEqual({kind:'hadith',chapter:3});
 expect(referenceParts('Muslim, Al-Bukhâri, le hadith d’Ibn Masud').some(p=>p.reference)).toBe(false);
 expect(referenceParts('Ce hadith','sabirin-hadith-12')[0].reference).toEqual({kind:'hadith',chapter:12});
 expect(referenceParts('Ce hadith','sabirin-tawhid-1').some(p=>p.reference)).toBe(false);
});
it('preserves consecutive pairs and does not expand a non-consecutive pair into a range',()=>{
 const text='Sourate 52, versets 35 et 36 ; Sourate 2, versets 2 et 4.';
 const parts=referenceParts(text);
 expect(parts.map(part=>part.text).join('')).toBe(text);
 expect(parts.flatMap(part=>part.reference?[part.reference]:[])).toEqual([{kind:'verse',surah:52,ayah:35,end:36},{kind:'verse',surah:2,ayah:2},{kind:'verse',surah:2,ayah:4}]);
 expect(referenceParts('Sourate 114, versets 6 et 7').flatMap(part=>part.reference?[part.reference]:[])).toEqual([]);
});
it('deduplicates references from explanations and sources for all 30 courses',()=>{
 for(const level of COURSE_LEVELS)for(const course of level.modules){
  const refs=chapterReferences(course.id,chapterTeaching(course.id)!.developments);
  expect(new Set(refs.map(referenceKey)).size).toBe(refs.length);
  if(course.sourceDocument==='sabirin-hadith')expect(refs[0]).toEqual({kind:'hadith',chapter:Number(course.id.split('-').at(-1))});
 }
 const refs=chapterReferences('sabirin-tawhid-1',chapterTeaching('sabirin-tawhid-1')!.developments);
 expect(refs).toContainEqual({kind:'hadith',chapter:2});
 expect(refs).toContainEqual({kind:'verse',surah:18,ayah:110});
});
