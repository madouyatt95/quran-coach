import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {CHAPTERS,PAGE_MANIFEST,isInteractivePage} from '../../../lib/interactiveMushaf/model';
export interface ReadingSession {start:number;end:number;endVerse:string;label:string;startedAt:number;finishedAt:number|null}
export function sessionTarget(page:number,mode:'pages'|'surah',surah:number):ReadingSession{
    const start=isInteractivePage(page)?page:1;
    const chapter=CHAPTERS[Math.max(0,Math.min(113,surah-1))];
    const endVerse=mode==='surah'?`${chapter.id}:${chapter.count}`:null;
    // A verse may span two pages. The endpoint belongs on its last page.
    const end=endVerse?Math.max(start,...Object.entries(PAGE_MANIFEST).filter(([,m])=>m.verseKeys.includes(endVerse)).map(([p])=>Number(p))):Math.min(604,start+4);
    return {start,end,endVerse:endVerse??PAGE_MANIFEST[end].verseKeys.at(-1)!,label:mode==='surah'?`Fin de ${chapter.latin}`:`${end-start+1} pages`,startedAt:Date.now(),finishedAt:null};
}
function validSession(value:unknown):value is ReadingSession{
    const v=value as ReadingSession|undefined;
    return !!v&&isInteractivePage(v.start)&&isInteractivePage(v.end)&&v.end>=v.start&&typeof v.label==='string'&&typeof v.endVerse==='string'&&PAGE_MANIFEST[v.end].verseKeys.includes(v.endVerse)&&Number.isFinite(v.startedAt)&&(v.finishedAt===null||Number.isFinite(v.finishedAt));
}
export const useReadingSession=create<{session:ReadingSession|null;start:(page:number,mode:'pages'|'surah',surah:number)=>void;finish:()=>void;clear:()=>void}>()(persist(set=>({session:null,start:(page,mode,surah)=>set({session:sessionTarget(page,mode,surah)}),finish:()=>set(s=>s.session&&!s.session.finishedAt?{session:{...s.session,finishedAt:Date.now()}}:s),clear:()=>set({session:null})}),{name:'quran-coach-reading-session',partialize:s=>({session:s.session}),merge:(saved,current)=>({...current,session:validSession((saved as {session?:unknown})?.session)?(saved as {session:ReadingSession}).session:null})}));
