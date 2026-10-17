import {fetchSurah,fetchSurahTranslation,fetchSurahTransliteration} from '../quranApi';
import {fetchTafsir,type TafsirContent} from '../tafsirApi';
import {compatibleWords} from '../tilawa/feedback';
import {loadHifdhStudyWords} from '../hifdhWordStudy';
import {validTarget,type VerseTarget} from './learning';
import type {Ayah} from '../../types';
export interface FahmVerse {ayah:Ayah;translation:string;phonetic:string}
export async function loadFahmVerse(v:VerseTarget):Promise<FahmVerse> {
    if(!validTarget(v.surah,v.ayah))throw new Error('Référence invalide.');
    const [surah,fr,phonetic]=await Promise.all([fetchSurah(v.surah),fetchSurahTranslation(v.surah,'fr').catch(()=>new Map<number,string>()),fetchSurahTransliteration(v.surah).catch(()=>new Map<number,string>())]);
    const ayah=surah.ayahs.find(a=>a.numberInSurah===v.ayah);
    if(!ayah||ayah.surah!==v.surah)throw new Error('Verset indisponible.');
    return {ayah,translation:fr.get(ayah.number)||'',phonetic:phonetic.get(ayah.number)||''};
}
const explanations=new Map<string,Promise<TafsirContent|null>>();
export function fahmExplanation(v:VerseTarget){
    const key=`${v.surah}:${v.ayah}`;
    if(!explanations.has(key)){const request=fetchTafsir('french_mokhtasar',v.surah,v.ayah).then(result=>{if(!result)explanations.delete(key);return result;}).catch(()=>{explanations.delete(key);return null;});explanations.set(key,request);}
    return explanations.get(key)!;
}
/** The unnumbered opening is separate from the first verse in the word source.
 * The existing loader still verifies every remaining token against canonical words. */
export function fahmVerseTokens(ayah:Pick<Ayah,'surah'|'numberInSurah'|'text'>){
 const words=ayah.text.trim().split(/\s+/);
 const opening=ayah.numberInSurah===1&&ayah.surah!==1&&ayah.surah!==9&&words.length>4&&compatibleWords(words.slice(0,4),['بسم','الله','الرحمن','الرحيم']);
 return opening?words.slice(4):words;
}
export const fahmWords=(verse:FahmVerse)=>loadHifdhStudyWords(`${verse.ayah.surah}:${verse.ayah.numberInSurah}`,fahmVerseTokens(verse.ayah)).then(items=>items.map(item=>item.word));
