import { READING_PATHS, type ReadingPath } from '../../data/readingPaths';
import { CHAPTERS } from '../interactiveMushaf/model';
import type { QuranWord } from '../../data/quranVocabulary';
export interface VerseTarget {surah:number;ayah:number}
export const verseKey = (v:VerseTarget) => `${v.surah}:${v.ayah}`;
export function validTarget(surah:number,ayah:number) {return Number.isInteger(surah)&&Number.isInteger(ayah)&&surah>0&&surah<=114&&ayah>0&&ayah<=CHAPTERS[surah-1].count;}
export function passageTargets(day:ReadingPath['days'][number]):VerseTarget[] {
    const passages=day.passages || (day.surah ? [{surah:day.surah,startAyah:day.startAyah!,endAyah:day.endAyah!}] : []);
    return passages.flatMap(p=>Array.from({length:p.endAyah-p.startAyah+1},(_,i)=>({surah:p.surah,ayah:p.startAyah+i}))).filter(v=>validTarget(v.surah,v.ayah));
}
export const normalizeFahmWord=(text:string)=>text.normalize('NFC').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'').replace(/ٱ/g,'ا');
export const exactVocabulary=(text:string,words:QuranWord[])=>{
    const tokens=new Set(text.split(/\s+/).map(normalizeFahmWord));
    return words.filter(w=>tokens.has(normalizeFahmWord(w.arabic)));
};
export const validExamples=(word:QuranWord)=>word.examples.filter(e=>validTarget(e.surah,e.ayah)&&exactVocabulary(e.contextAr,[word]).length>0);
export interface VerseKnowledge {surah:number;ayah:number;correct:boolean;attempts:number;mistakes:number;due:number;at:number;note:string;compared?:boolean}
export function personalTargets(minutes:5|10|20,records:Record<string,VerseKnowledge>,current:VerseTarget,now=Date.now(),prioritizeCurrent=false):VerseTarget[] {
    const limit=minutes===5?1:minutes===10?2:4;
    const weak=Object.values(records).filter(r=>r.attempts>0&&validTarget(r.surah,r.ayah)&&r.due<=now).sort((a,b)=>Number(a.correct)-Number(b.correct)||a.due-b.due);
    const surrounding=Array.from({length:limit-1},(_,i)=>({surah:current.surah,ayah:current.ayah+i+1}));
    const candidates=[...(prioritizeCurrent?[current]:[]),...weak,current,...Object.values(records).filter(r=>r.note),...surrounding];
    const found=new Set<string>();
    return candidates.filter(v=>validTarget(v.surah,v.ayah)&&!found.has(verseKey(v))&&!!found.add(verseKey(v))).slice(0,limit);
}
export function findPathForVerse(v:VerseTarget) {return READING_PATHS.find(p=>p.days.some(d=>passageTargets(d).some(t=>verseKey(t)===verseKey(v))));}
export function sourceUrl(v:VerseTarget) {return `https://quranenc.com/fr/browse/french_mokhtasar/${v.surah}#${v.ayah}`;}
