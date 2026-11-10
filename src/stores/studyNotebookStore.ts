import {create} from 'zustand';
import {persist} from '../lib/profilePersist';
export interface StudyExcerpt {id:string;title:string;text:string;reference:string;href:string;note:string;createdAt:number}
export type StudyInput=Omit<StudyExcerpt,'note'|'createdAt'>;
export function safeStudyHref(href:string){return /^\/(?:read(?:\?|$)|books\/[a-z0-9-]+(?:\?|$)|academy(?:\/|\?|$))/.test(href)&&!/[\\\r\n]/.test(href);}
export const useStudyNotebook=create<{entries:StudyExcerpt[];save:(entry:StudyInput)=>void;annotate:(id:string,note:string)=>void;remove:(id:string)=>void}>()(persist(set=>({entries:[],
 save:entry=>{if(!entry.id||!entry.text.trim()||!safeStudyHref(entry.href))return;set(s=>s.entries.some(e=>e.id===entry.id)?s:{entries:[{...entry,text:entry.text.slice(0,12000),note:'',createdAt:Date.now()},...s.entries]});},
 annotate:(id,note)=>set(s=>({entries:s.entries.map(e=>e.id===id?{...e,note:note.slice(0,3000)}:e)})),remove:id=>set(s=>({entries:s.entries.filter(e=>e.id!==id)})),
}),{name:'qc-study-notebook-v1'}));
