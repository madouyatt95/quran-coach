import {it,expect,vi} from 'vitest';
vi.mock('../quranApi',()=>({fetchSurah:vi.fn(),fetchSurahTranslation:vi.fn(),fetchSurahTransliteration:vi.fn()}));
import {fetchSurah,fetchSurahTranslation,fetchSurahTransliteration} from '../quranApi';
import {loadFahmVerse,fahmVerseTokens} from './content';
it('maps French and phonetic by global verse ID, never by local number',async()=>{
 vi.mocked(fetchSurah).mockResolvedValue({ayahs:[{number:292,numberInSurah:285,surah:2,text:'آمَنَ'}]} as Awaited<ReturnType<typeof fetchSurah>>);
 vi.mocked(fetchSurahTranslation).mockResolvedValue(new Map([[285,'Wrong verse'],[292,'Correct verse']]));vi.mocked(fetchSurahTransliteration).mockResolvedValue(new Map([[292,'Correct phonetic']]));
 const result=await loadFahmVerse({surah:2,ayah:285});expect(result.translation).toBe('Correct verse');expect(result.phonetic).toBe('Correct phonetic');
});
it('preserves Arabic when an optional French or phonetic request fails',async()=>{vi.mocked(fetchSurahTranslation).mockRejectedValue(new Error('offline'));vi.mocked(fetchSurahTransliteration).mockRejectedValue(new Error('offline'));expect((await loadFahmVerse({surah:2,ayah:285})).ayah.text).toBe('آمَنَ');});
it('rejects out-of-range verses before any request',async()=>{await expect(loadFahmVerse({surah:114,ayah:7})).rejects.toThrow('Référence invalide');});

it('separates only a verified unnumbered opening, preserving Fatiha and ordinary verse words',()=>{
 const text='بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ';
 expect(fahmVerseTokens({surah:108,numberInSurah:1,text})).toEqual(text.split(' ').slice(4));
 for(const [surah,numberInSurah] of [[1,1],[9,1],[108,2]])expect(fahmVerseTokens({surah,numberInSurah,text})).toEqual(text.split(' '));
 expect(fahmVerseTokens({surah:108,numberInSurah:1,text:'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ'})).toHaveLength(3);
});
