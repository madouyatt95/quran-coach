import type {CoachReviewEntry} from './coachSession';
export type HifdhStep = 'listen' | 'recite' | 'review';
export interface HifdhSession {surah:number;start:number;end:number;ayah:number;speed:number;repeats:number;phonetics:boolean;focus:boolean;step:HifdhStep}
export const HIFDH_SESSION_KEY='hifdh-session-v1';
export function readHifdhSession(storage:Pick<Storage,'getItem'>):HifdhSession|null {
 try {
  const raw=storage.getItem(HIFDH_SESSION_KEY);
  const s=raw?JSON.parse(raw):null;
  if(s && Number.isInteger(s.surah)&&s.surah>=1&&s.surah<=114&&Number.isInteger(s.start)&&s.start>=1&&Number.isInteger(s.end)&&s.end>=s.start&&s.end<=286&&Number.isInteger(s.ayah)&&s.ayah>=s.start&&s.ayah<=s.end)
   return {...s,speed:[.75,1,1.25,1.5].includes(s.speed)?s.speed:1,repeats:Math.max(1,Math.min(20,Number(s.repeats)||1)),step:['listen','recite','review'].includes(s.step)?s.step:'listen',phonetics:!!s.phonetics,focus:!!s.focus};
  const bookmark=JSON.parse(storage.getItem('hifdh-bookmark')||'null');
  if(bookmark && Number.isInteger(bookmark.surah)&&bookmark.surah>=1&&bookmark.surah<=114&&Number.isInteger(bookmark.ayah)&&bookmark.ayah>=1&&bookmark.ayah<=286)
   return {surah:bookmark.surah,start:bookmark.ayah,end:bookmark.ayah,ayah:bookmark.ayah,speed:1,repeats:1,phonetics:false,focus:false,step:'listen'};
 }catch{/* Preserve unreadable existing storage. */}
 return null;
}
export interface ReviewPassage{surah:number;start:number;end:number}
export function difficultPassages(entries:CoachReviewEntry[]):ReviewPassage[]{
 const result=new Map<string,ReviewPassage>();
 for(const entry of entries){
  const match=entry.scoreKey.match(/^(\d+):(\d+)-(\d+)$/);const word=entry.wordKey.match(/^(\d+)-\d+$/);
  if(!match||!word)continue;
  const surah=Number(match[1]),ayah=Number(match[2])+Number(word[1]);
  if(surah<1||surah>114||ayah<1||ayah>Number(match[3])||ayah>286)continue;
  result.set(`${surah}:${ayah}`,{surah,start:ayah,end:ayah});
 }
 return [...result.values()];
}
