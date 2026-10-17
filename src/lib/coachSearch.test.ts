// @vitest-environment jsdom
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {coachSearch,searchAllInvocations,searchHadiths} from './coachSearch';
import {normalizeSearch} from './searchText';
import {HISNUL_MUSLIM_DATA} from '../data/hisnulMuslim';
import {HADITHS} from '../data/hadiths';
import {invocationByKey,normalizeInvocation} from './adhkarExperience';
vi.mock('./knowledgeSearch',()=>({searchKnowledge:()=>[{id:'note:private',type:'note',title:'Ma note',textAr:'',textFr:'Patience dans mon cours',score:70,emoji:'📝',studied:true}]}));
beforeEach(()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({code:200,data:{matches:[]}})}));});
afterEach(()=>vi.unstubAllGlobals());
it('preserves Arabic letters and normalizes diacritics and French accents',()=>{expect(normalizeSearch('أَعُوذُ إِلَى الصَّبْرِ')).toBe('اعوذ الي الصبر');expect(normalizeSearch('Épreuve')).toBe('epreuve');});
it('finds hadith Arabic without diacritics and keeps original display text',()=>{const h=HADITHS.find(h=>h.textAr.length>30)!;const q=normalizeSearch(h.textAr).split(' ').slice(0,4).join(' ');expect(searchHadiths(q).find(r=>r.id===`hadith:${h.id}`)?.textAr).toBe(h.textAr);});
it('finds invocations beyond the first three and opens the matching invocation',async()=>{
 const chapter=HISNUL_MUSLIM_DATA.flatMap(m=>m.chapters).find(c=>c.duas.length>4)!;
 const dua=chapter.duas[4];const results=await searchAllInvocations(dua.translation);
 const match=results.find(r=>normalizeInvocation(r.textAr)===normalizeInvocation(dua.arabic));expect(match).toBeDefined();
 const url=new URL(match!.link!,'https://example.test');const key=url.searchParams.get('dua')!;expect(invocationByKey.get(key)?.arabic).toBe(match!.textAr);expect(url.searchParams.get('cat')).toBe(invocationByKey.get(key)?.categoryId);
});
it('keeps local results and reports Quran failure, distinct from zero matches',async()=>{
 vi.mocked(fetch).mockRejectedValue(new Error('offline'));const result=await coachSearch('patience');expect(result.unavailable).toContain('Coran en ligne');expect(result.results.some(r=>r.type==='note')).toBe(true);
});
it('does not report a successful empty response as a network error',async()=>{expect((await coachSearch('zzzzxx')).unavailable).toEqual([]);});
it('never sends a notes-only search to a remote service',async()=>{await coachSearch('ma note privée',{localOnly:true});expect(fetch).not.toHaveBeenCalled();});
it('uses one Arabic endpoint and retains exact verse navigation',async()=>{
 vi.mocked(fetch).mockResolvedValue({ok:true,json:async()=>({code:200,data:{matches:[{surah:{number:2,englishName:'Al-Baqarah'},numberInSurah:153,text:'النص'}]}})} as Response);
 const result=await coachSearch('الصبر');expect(fetch).toHaveBeenCalledTimes(1);expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain('ar.quran-uthmani');expect(result.results.find(r=>r.type==='verse')?.link).toBe('/read?surah=2&ayah=153');
});

it('recognizes the provider real 404 no-match response without hiding other 404 failures',async()=>{
 vi.mocked(fetch).mockResolvedValue({ok:false,status:404,json:async()=>({code:404,data:'Nothing matching your search was found..'})} as Response);expect((await coachSearch('zzzzqcchecknomatch')).unavailable).toEqual([]);
 vi.mocked(fetch).mockResolvedValue({ok:false,status:404,json:async()=>({code:404,data:'Route not found'})} as Response);expect((await coachSearch('zzzzqcchecknomatch')).unavailable).toContain('Coran en ligne');
});
