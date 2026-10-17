import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {CHAPTERS,PAGE_MANIFEST} from '../lib/interactiveMushaf/model';
export type NoteKind='remember'|'explore'|'personal';
export type ReaderNote={surah:number;ayah:number;page:number;kind:NoteKind;text:string;updatedAt:number};
export const NOTE_LABELS:Record<NoteKind,string>={remember:'À retenir',explore:'À approfondir',personal:'Ma note'};
export function validReaderNote(note:unknown):note is ReaderNote{
    if(!note||typeof note!=='object')return false;const n=note as ReaderNote;
    return Number.isInteger(n.surah)&&n.surah>=1&&n.surah<=114&&Number.isInteger(n.ayah)&&n.ayah>=1&&n.ayah<=CHAPTERS[n.surah-1].count&&Number.isInteger(n.page)&&!!PAGE_MANIFEST[n.page]?.verseKeys.includes(`${n.surah}:${n.ayah}`)&&Object.hasOwn(NOTE_LABELS,n.kind)&&typeof n.text==='string'&&n.text.length<=2000&&Number.isFinite(n.updatedAt);
}
export const useReaderNotesStore=create<{notes:Record<string,ReaderNote>;save:(n:Omit<ReaderNote,'updatedAt'>)=>void;remove:(key:string)=>void}>()(persist(set=>({notes:{},save:n=>{const note={...n,text:n.text.trim(),updatedAt:Date.now()};if(validReaderNote(note))set(s=>({notes:{...s.notes,[`${note.surah}:${note.ayah}`]:note}}));},remove:key=>set(s=>{const notes={...s.notes};delete notes[key];return {notes};})}),{name:'quran-coach-reader-notes',version:1,partialize:s=>({notes:s.notes}),merge:(saved,current)=>{const raw=(saved as {notes?:Record<string,unknown>})?.notes||{};return {...current,notes:Object.fromEntries(Object.values(raw).filter(validReaderNote).map(n=>[`${n.surah}:${n.ayah}`,n]))};}}));
