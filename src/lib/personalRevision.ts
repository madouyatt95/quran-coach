import {academyModules} from './academyModules';
import type {NarrativeBook} from './narrativeBooks';
import type {ModuleProgress} from '../stores/academyStore';
export interface PersonalRevision {id:string;title:string;question:string;answer:string;href:string;options?:string[];correct?:number;firstDue:number;source:string}
export function revisionCandidates(progress:Record<string,ModuleProgress>,reading:Record<string,number>,books:NarrativeBook[]):PersonalRevision[]{
 const courses=academyModules.flatMap(m=>!progress[m.id]?.lastVisitedAt&&!progress[m.id]?.completed?[]:m.content.flatMap((c,ci)=>c.type==='quiz'?c.questions.map((q,qi)=>({id:`course:${m.id}:${ci}:${qi}`,title:m.title,question:q.q,answer:q.explanation,options:q.options,correct:q.answer,href:`/academy?module=${m.id}`,firstDue:(progress[m.id].completedAt||progress[m.id].lastVisitedAt||Date.now())+86400000,source:'Question du cours · explication de l’Académie'})):[]));
 const stories=books.filter(b=>reading[b.id]).map(b=>({id:`book:${b.id}:${b.version}`,title:b.title,question:b.epilogue.question,answer:b.epilogue.lessons.join('\n\n'),href:`/books/${b.id}?chapter=${b.chapters.at(-1)!.id}`,firstDue:reading[b.id]+86400000,source:b.sources.map(s=>s.type==='quran'?`Coran ${s.surah}:${s.first}-${s.last}`:s.type==='hadith'?`${s.collection} ${s.number}`:`${s.author} · ${s.work}`).join(' · ')}));
 return [...courses,...stories];
}
