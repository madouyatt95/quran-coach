import type {Ayah} from '../types';
import type {WordRecitationStart} from './verseRecitation';
export type AudioStopBoundary='none'|'verse'|'page'|'surah';
export interface PassageCuts {start:WordRecitationStart;end:WordRecitationStart;endTime:number}
export interface ReaderAudioSession {
 sourceMatched?:boolean;verse:Ayah;reciter:string;url:string;offset:number;speed:number;stopAt:number|null;
 queue:Ayah[]|null;range:{surah:number;startAyah:number;endAyah:number;repetitions:number;iteration:number}|null;
 cuts:PassageCuts|null;timings:WordRecitationStart['timings'];savedAt:number;
}
export const AUDIO_SESSION_KEY='quran-coach-reader-audio-v1';
export function loadReaderAudioSession():ReaderAudioSession|null{
 try{const s=JSON.parse(localStorage.getItem(AUDIO_SESSION_KEY)||'null') as ReaderAudioSession|null;
 if(!s||!Number.isFinite(s.offset)||s.offset<0||!Number.isFinite(s.speed)||s.speed<.5||s.speed>2||!s.reciter||!s.verse||!Number.isInteger(s.verse.page)||s.verse.page<1||s.verse.page>604||!s.url.startsWith('https://'))return null;return s;}catch{return null;}
}
export function saveReaderAudioSession(s:ReaderAudioSession){try{localStorage.setItem(AUDIO_SESSION_KEY,JSON.stringify(s));}catch{/* Private mode or full storage does not interrupt audio. */}}
