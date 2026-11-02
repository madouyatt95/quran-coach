import type {ReaderAudioSession,PassageCuts} from './readerAudioSession';
import type {Ayah} from '../types';

export const audioTime=(seconds:number)=>!Number.isFinite(seconds)?'—:—':`${Math.floor(Math.max(0,seconds)/60)}:${String(Math.floor(Math.max(0,seconds)%60)).padStart(2,'0')}`;
export function abProblem(a:ReaderAudioSession,b:ReaderAudioSession):string|null {
    if(a.reciter!==b.reciter)return 'Gardez la même voix entre A et B.';
    if(a.verse.surah!==b.verse.surah)return 'Choisissez A et B dans la même sourate.';
    if(![a.offset,b.offset].every(Number.isFinite)||a.offset<0||b.offset<0)return 'Ce repère audio est indisponible.';
    if(b.verse.number<a.verse.number||b.verse.number===a.verse.number&&b.offset-a.offset<.3)return 'Placez B après A, avec au moins un court instant entre les deux.';
    return null;
}
export function abPassage(a:ReaderAudioSession,b:ReaderAudioSession,verses:Ayah[]):{verses:Ayah[];cuts:PassageCuts}|null {
    if(abProblem(a,b))return null;
    const selected=verses.filter(v=>v.surah===a.verse.surah&&v.numberInSurah>=a.verse.numberInSurah&&v.numberInSurah<=b.verse.numberInSurah);
    if(selected.length!==b.verse.numberInSurah-a.verse.numberInSurah+1||!selected.every((v,i)=>v.numberInSurah===a.verse.numberInSurah+i&&v.number===a.verse.number+i))return null;
    return {verses:selected,cuts:{start:{sourceMatched:a.sourceMatched,url:a.url,offset:a.offset,timings:a.timings},end:{sourceMatched:b.sourceMatched,url:b.url,offset:0,timings:b.timings},endTime:b.offset}};
}
