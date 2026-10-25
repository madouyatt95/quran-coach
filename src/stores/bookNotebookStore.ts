import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export interface BookMemory {id:string;bookId:string;version:string;chapterId:string;passageId:string;text:string;sources:string[];audioId?:string;seconds?:number;note:string;createdAt:number}
export const useBookNotebook=create<{bookmarks:BookMemory[];saveBookmark:(entry:Omit<BookMemory,'id'|'note'|'createdAt'>)=>void;annotateBookmark:(id:string,note:string)=>void;removeBookmark:(id:string)=>void;entries:BookMemory[];remember:(entry:Omit<BookMemory,'id'|'note'|'createdAt'>)=>void;annotate:(id:string,note:string)=>void;remove:(id:string)=>void}>()(persist(set=>({bookmarks:[],
 saveBookmark:entry=>set(s=>{const id=`${entry.bookId}:${entry.version}:${entry.passageId}`;return s.bookmarks.some(e=>e.id===id)?s:{bookmarks:[{...entry,id,note:'',createdAt:Date.now()},...s.bookmarks]};}),
 annotateBookmark:(id,note)=>set(s=>({bookmarks:s.bookmarks.map(e=>e.id===id?{...e,note:note.slice(0,2000)}:e)})),
 removeBookmark:id=>set(s=>({bookmarks:s.bookmarks.filter(e=>e.id!==id)})),
 entries:[],
 remember:entry=>set(s=>{const id=`${entry.bookId}:${entry.version}:${entry.passageId}`;return s.entries.some(e=>e.id===id)?s:{entries:[{...entry,id,note:'',createdAt:Date.now()},...s.entries]};}),
 annotate:(id,note)=>set(s=>({entries:s.entries.map(e=>e.id===id?{...e,note:note.slice(0,2000)}:e)})),
 remove:id=>set(s=>({entries:s.entries.filter(e=>e.id!==id)})),
}),{name:'qc-book-notebook-v1'}));
