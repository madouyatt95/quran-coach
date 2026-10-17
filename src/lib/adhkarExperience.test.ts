import {it,expect} from 'vitest';
import {allInvocations,categoryById,countEvidence,invocationByKey,invocationCountKey,invocationPhrases,normalizeInvocation,quranReference,searchInvocations} from './adhkarExperience';
it('keeps every category addressable with unique invocation keys',()=>{
 expect(invocationByKey.size).toBe(allInvocations.length);
 for(const key of ['morning','evening','rabanna','asma_husna','hisn_chap_25','hisn_chap_28'])expect(categoryById.get(key)?.items.length).toBeGreaterThan(0);
});
it('finds exact texts in French, phonetics and Arabic without accents or diacritics',()=>{
 expect(searchInvocations('دنيا حسنة').length).toBeGreaterThan(0);
 expect(searchInvocations('deverse sur nous').some(d=>d.source==='2:250')).toBe(true);
 expect(searchInvocations('rabbi zidni').length).toBeGreaterThan(0);
 expect(normalizeInvocation('أَعُوذُ')).toBe('اعوذ');
});
it('finds situations without requiring the chapter title and deduplicates Arabic',()=>{
 for(const q of ['je voyage','je suis inquiet','remercier','demander pardon'])expect(searchInvocations(q).length).toBeGreaterThan(0);
 const result=searchInvocations('pardon');expect(new Set(result.map(d=>normalizeInvocation(d.arabic))).size).toBe(result.length);
});
it('does not attribute a number to a Quran reference or an imprecise collection name',()=>{
 expect(countEvidence(invocationByKey.get('salawat:401')!)).toBeNull();
 expect(countEvidence(invocationByKey.get('rabanna:3')!)).toBeNull();
 expect(countEvidence(categoryById.get('morning')!.items.find(d=>d.hisnReference===76)!)?.url).toBe('https://sunnah.com/hisn:76');
});
it('preserves daily shared counts and resolves exact Quran locations',()=>{
 const morning=categoryById.get('morning')!.items.find(d=>d.hisnReference===96)!;
 const evening=categoryById.get('evening')!.items.find(d=>d.hisnReference===96)!;
 expect(invocationCountKey(morning)).toBe(invocationCountKey(evening));
 expect(quranReference(invocationByKey.get('rabanna:24')!)).toEqual({surah:10,ayah:85,end:86});
 expect(quranReference(categoryById.get('morning')!.items[0])).toEqual({surah:2,ayah:255,end:undefined});
});
it('segments at punctuation without changing Arabic letters or marks',()=>{
 for(const d of allInvocations)expect(invocationPhrases(d.arabic).join('').replace(/\s/g,'')).toBe(d.arabic.replace(/\s/g,''));
});
