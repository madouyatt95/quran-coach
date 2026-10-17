import {it,expect} from 'vitest';
import {similarCandidates} from './similarRecitation';
it('finds shared Quranic phrases without inventing or duplicating text',()=>{
 const a={surah:23,ayah:1,words:['قد','أفلح','المؤمنون']};
 const b={surah:87,ayah:14,words:['قد','أفلح','من','تزكى']};
 const other={surah:112,ayah:1,words:['قل','هو','الله','أحد']};
 expect(similarCandidates(a,[a,b,other])).toEqual([b]);
});
it('does not propose identical verses as a difference exercise or pairs sharing only a common word',()=>{
 const a={surah:1,ayah:1,words:['بسم','الله','الرحمن','الرحيم']};
 expect(similarCandidates(a,[{...a,surah:2},{surah:112,ayah:1,words:['قل','هو','الله','أحد']}])).toEqual([]);
});
