import {it,expect} from 'vitest';
import {chapterBooks} from '../data/storyChapters';
import {getJourney,storiesForVerse,referenceVerses,orderedJourneyVerses,readingMinutes} from './editorialJourneys';
it('provides 44 substantive chapters and valid source-bound questions across 14 books',()=>{
 expect(Object.keys(chapterBooks)).toHaveLength(14);expect(Object.values(chapterBooks).flatMap(b=>b.chapters)).toHaveLength(44);
 for(const [key,b] of Object.entries(chapterBooks)){const [kind,id]=key.split(':');expect(getJourney(kind,id)).not.toBeNull();expect(new Set(b.chapters.map(c=>c.id)).size).toBe(b.chapters.length);for(const c of b.chapters){expect(c.text.split(/\s+/).length).toBeGreaterThan(65);expect(c.options).toHaveLength(3);expect(new Set(c.options).size).toBe(3);expect(c.answer).toBeGreaterThanOrEqual(0);expect(c.answer).toBeLessThan(3);const source=referenceVerses(c.reference);expect(source.length).toBeGreaterThan(0);expect(referenceVerses(c.reading).length).toBeGreaterThan(0);for(const v of referenceVerses(c.reading))expect(source).toContainEqual(v);}}
});
it('interleaves each authored chapter with its own selected verses and preserves ids for resumed Quran audio',()=>{
 for(const [key,b] of Object.entries(chapterBooks)){const [kind,id]=key.split(':'),j=getJourney(kind,id)!;for(const c of b.chapters){const i=j.steps.findIndex(s=>s.id===`chapter-${c.id}`);expect(i).toBeGreaterThanOrEqual(0);const refs=referenceVerses(c.reading);expect(j.steps.slice(i+1,i+1+refs.length).map(v=>[v.surah,v.ayah])).toEqual(refs.map(v=>[v.surah,v.ayah]));}expect(readingMinutes(j)).toBeGreaterThan(1);}
});
it('routes a verse to only the explicitly matching chapter and supports several perspectives',()=>{
 expect(storiesForVerse(12,92).map(m=>[m.key,m.chapter.id])).toEqual([['prophet:yusuf','reunion']]);expect(storiesForVerse(27,40).map(m=>m.key)).toEqual(['prophet:sulayman','story:bilqis']);expect(storiesForVerse(1,1)).toEqual([]);expect(storiesForVerse(12,0)).toEqual([]);expect(storiesForVerse(999,1)).toEqual([]);
});
it('changes Quran ordering without changing, dropping or duplicating any verse',()=>{
 const j=getJourney('prophet:nuh'.split(':')[0],'nuh')!;const story=orderedJourneyVerses(j,'story'),quran=orderedJourneyVerses(j,'quran');expect(story[0].surah).toBe(71);expect(quran[0].surah).toBe(11);expect(new Set(quran.map(v=>v.id))).toEqual(new Set(story.map(v=>v.id)));expect(quran.every((v,i)=>i===0||v.surah!*1000+v.ayah!>=quran[i-1].surah!*1000+quran[i-1].ayah!)).toBe(true);
});
