import chapters from '../../lib/interactiveMushaf/chapters.json';
import {it,expect,vi,afterEach} from 'vitest';
import {courseEvidenceReferences,evidenceTeaching,evidenceSourceContext,evidenceHighlight,hadithArabic,loadEvidenceVerses} from './courseEvidence';
import {COURSE_LEVELS} from './courseLibrary';
import {chapterReferences,referenceKey} from '../courseReferences';
import {courseNarration,narrationBlocks} from '../courseReading';
import {fetchAyah,fetchSurahTranslation} from '../../lib/quranApi';
vi.mock('../../lib/quranApi',()=>({fetchAyah:vi.fn(),fetchSurahTranslation:vi.fn()}));
afterEach(()=>vi.resetAllMocks());

it('ties every curated Quran study to a reference actually found in its supplied chapter',()=>{
 for(const level of COURSE_LEVELS)for(const module of level.modules){
  const cited=new Set(chapterReferences(module.id).map(referenceKey));
  for(const reference of courseEvidenceReferences(module.id)){
   expect(cited.has(referenceKey(reference)),`${module.id} / ${referenceKey(reference)}`).toBe(true);
   const teaching=evidenceTeaching(module.id,reference);
   expect(teaching?.explanation.length).toBeGreaterThan(50);
   if(reference.kind==='verse')expect(evidenceSourceContext(module.id,reference)?.page).toBeGreaterThan(0);
  }
 }
 expect(courseEvidenceReferences('sabirin-tawhid-1',1)).toEqual([{kind:'verse',surah:2,ayah:285}]);
 expect(evidenceTeaching('sabirin-tawhid-1',{kind:'verse',surah:30,ayah:30})).toBeNull();
});
it('marks only words present in the source and preserves the full original text',()=>{
 const text='« Qu’il jure par Allah ou qu’il se taise. »';
 const match=evidenceHighlight(text,"qu'il jure par Allah")!;
 expect(match.before+match.match+match.after).toBe(text);
 expect(evidenceHighlight(text,'une phrase absente')).toBeNull();
 for(let chapter=1;chapter<=20;chapter++){
  const narration=narrationBlocks(courseNarration(`sabirin-hadith-${chapter}`)!).map(block=>block.text).join(' ');
  const teaching=evidenceTeaching(`sabirin-hadith-${chapter}`,{kind:'hadith',chapter})!;
  expect(evidenceHighlight(narration,teaching.expression),`hadith ${chapter} / ${teaching.expression}`).not.toBeNull();
 }
});
it('identifies the Arabic extracts exactly and keeps Umar as speaker without creating Arabic',()=>{
 expect(hadithArabic(1)?.id).toBe(903);
 expect(hadithArabic(2)?.id).toBe(902);
 expect(hadithArabic(2)?.label).toContain('Jibrîl');expect(hadithArabic(2)?.arabic).toContain('الإِحْسَانِ');
 expect(hadithArabic(3)?.id).toBe(901);
 expect(hadithArabic(12)?.source).toBe('Al-Bukhâri 1597');expect(hadithArabic(12)?.note).toContain('celle de Umar');
 expect(courseNarration('sabirin-hadith-12')).toContain('PAROLE DE UMAR');
});
it('rejects mismatched Arabic coordinates while preserving available translations and adjacent verses',async()=>{
 vi.mocked(fetchAyah).mockImplementation(async(surah,ayah)=>({number:chapters[surah-1].offset+ayah,surah:ayah===35?99:surah,numberInSurah:ayah,text:'عربي',juz:1,page:1,hizbQuarter:1}));
 vi.mocked(fetchSurahTranslation).mockResolvedValue(new Map([[chapters[51].offset+35,'Français 35'],[chapters[51].offset+36,'Français 36']]));
 const result=await loadEvidenceVerses({kind:'verse',surah:52,ayah:35,end:36});
 expect(result).toEqual([{surah:52,ayah:35,translation:'Français 35'},{surah:52,ayah:36,arabic:'عربي',number:chapters[51].offset+36,translation:'Français 36'}]);
 vi.mocked(fetchSurahTranslation).mockRejectedValue(new Error('offline'));
 expect((await loadEvidenceVerses({kind:'verse',surah:52,ayah:36}))[0]).toEqual({surah:52,ayah:36,arabic:'عربي',number:chapters[51].offset+36});
});

it('uses global translation keys for 2:285 instead of displaying the earlier verse 2:278',async()=>{
 vi.mocked(fetchAyah).mockResolvedValue({number:292,surah:2,numberInSurah:285,text:'آمن الرسول',juz:3,page:49,hizbQuarter:0});vi.mocked(fetchSurahTranslation).mockResolvedValue(new Map([[285,'Intérêt usuraire (2:278)'],[292,'Le Messager croit, les anges (2:285)']]));expect((await loadEvidenceVerses({kind:'verse',surah:2,ayah:285}))[0]).toMatchObject({arabic:'آمن الرسول',translation:'Le Messager croit, les anges (2:285)'});
});

it('covers all twenty exact narrative identities and keeps separately cited variants',()=>{
 for(let chapter=1;chapter<=20;chapter++){const entry=hadithArabic(chapter)!;expect(entry,`chapter ${chapter}`).not.toBeNull();expect(entry.arabic).toMatch(/[\u0600-\u06ff]/);expect(entry.arabic).not.toContain('\\u200f');expect(entry.url).toMatch(/^https:\/\/sunnah\.com\//);}
 expect(hadithArabic(6)?.variants?.[0].url).toBe('https://sunnah.com/abudawud:4722');expect(hadithArabic(19)?.url).toBe('https://sunnah.com/mishkat:166');expect(hadithArabic(19)?.note).toContain('6:153');
});
