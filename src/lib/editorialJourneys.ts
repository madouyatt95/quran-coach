import { chapterBooks, type StoryChapter } from '../data/storyChapters';
import { prophetEpisodes } from '../data/editorialExpansion';
import { prophets } from '../data/prophets';
import { stories } from '../data/storiesData';
import chapters from './interactiveMushaf/chapters.json';
export type JourneyKind = 'prophet' | 'story';
export interface JourneyStep { id:string; title:string; kind:'narrative'|'verse'|'reflection'; text:string; reference?:string; chapterId?:string; insight?:string; surah?:number; ayah?:number }
export interface EditorialJourney { id:string; kind:JourneyKind; title:string; icon:string; steps:JourneyStep[]; lessons:string[]; chapters?:StoryChapter[]; intro?:string }
export function referenceVerses(reference:string): {surah:number;ayah:number}[] {
 const match=/(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?/.exec(reference);if(!match)return [];
 const surah=+match[1],first=+match[2],last=+(match[3]||match[2]);
 if(!chapters[surah-1]||first<1||last<first||last>chapters[surah-1].count)return [];
 return Array.from({length:last-first+1},(_,i)=>({surah,ayah:first+i}));
}
export function narrativeSentences(text:string) { return text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean); }
export function getJourney(kind:string,id:string):EditorialJourney|null {
 const person=kind==='prophet'?prophets.find(p=>p.id===id):null;
 const story=kind==='story'?stories.find(s=>s.id===id):null;
 if(!person&&!story)return null;
 const item=person||story!,title=person?.nameIslamic||story!.title;
 const book=chapterBooks[`${kind}:${id}`];
 if(book){const steps:JourneyStep[]=[];for(const c of book.chapters){steps.push({id:`chapter-${c.id}`,chapterId:c.id,title:c.title,kind:'narrative',text:c.text,reference:c.reference,insight:c.insight});for(const v of referenceVerses(c.reading))steps.push({id:`verse-${v.surah}-${v.ayah}`,chapterId:c.id,title:`${chapters[v.surah-1].latin} · ${v.surah}:${v.ayah}`,kind:'verse',text:c.insight,reference:c.reference,...v});}steps.push({id:'reflection',title:'Ce que je retiens',kind:'reflection',text:''});return {id:`${kind}:${id}`,kind:kind as JourneyKind,title,icon:item.icon,steps,lessons:person?.lessons||story!.morals,chapters:book.chapters,intro:book.intro};}
 const sentences=narrativeSentences(item.summary), groups:string[][]=[];
 // Preserve the existing editorial text verbatim, grouping at sentence boundaries.
 for(const sentence of sentences){const last=groups.at(-1);if(!last||last.join(' ').split(/\s+/).length>=75)groups.push([sentence]);else last.push(sentence);}
 const extra=person?prophetEpisodes[person.id]||[]:[];
 const refs=person?[...person.keyVerses,...(person.duas||[])].flatMap(v=>referenceVerses(v.reference)):(story?.sourceRefs||[]).flatMap(referenceVerses);
 for(const episode of extra)refs.push(...referenceVerses(episode.reference));
 for(const ref of item.surahs){if(ref.startAyah)refs.push(...referenceVerses(`${ref.number}:${ref.startAyah}`));}
 const seen=new Set<string>();const verses=refs.filter(p=>{const key=`${p.surah}:${p.ayah}`;if(seen.has(key))return false;seen.add(key);return true;});
 const lessons=person?.lessons||story!.morals;
 const steps:JourneyStep[]=[...groups.map((group,i)=>({id:`story-${i}`,title:groups.length===1?'Le récit':`Épisode ${i+1} · ${i===0?'Le contexte':i===groups.length-1?'Le dénouement':'La suite du récit'}`,kind:'narrative' as const,text:group.join(' ')})),...extra.map(e=>({id:`extra-${e.id}`,title:e.title,kind:'narrative' as const,text:e.text,reference:e.reference})),...verses.map(p=>({id:`verse-${p.surah}-${p.ayah}`,title:`${chapters[p.surah-1].latin} · ${p.surah}:${p.ayah}`,kind:'verse' as const,text:'Retrouvez ce passage associé au récit, dans son contexte coranique.',...p})),{id:'reflection',title:'Ce que je retiens',kind:'reflection',text:'Quel enseignement me parle aujourd’hui ? Quelle petite action aimerais-je essayer ?'}];
 return {id:`${kind}:${id}`,kind:kind as JourneyKind,title,icon:item.icon,steps,lessons};
}
export const LIFE_THEMES=[
 {id:'hope',label:'Retrouver espoir',icon:'🌱',description:'Des récits pour réfléchir à l’attente et à la confiance.',stories:['ashab-al-kahf','dua-yunus','maryam','trois-repentir'],question:'Qu’est-ce qui m’aide à garder confiance ?',action:'Noter une petite étape possible aujourd’hui.'},
 {id:'anger',label:'Apaiser la colère',icon:'🕊️',description:'Prendre du recul sur les tensions et nos réactions.',stories:['habil-qabil','luqman','bonne-parole'],question:'Quelle réaction aimerais-je rendre plus paisible ?',action:'Faire une pause avant une réponse difficile.'},
 {id:'forgive',label:'Pardonner',icon:'🤍',description:'Explorer le pardon et la manière de préserver les liens.',stories:['ifk','fath-makkah'],question:'Quel lien aimerais-je réparer, à mon rythme ?',action:'Choisir un geste d’apaisement qui respecte mes limites.'},
 {id:'gratitude',label:'Cultiver la gratitude',icon:'✨',description:'Réfléchir à ce que nous recevons et à ce que nous en faisons.',stories:['deux-jardins','qarun','manna-salwa'],question:'Quel bienfait ai-je tendance à oublier ?',action:'Écrire trois choses pour lesquelles je suis reconnaissant.'},
 {id:'justice',label:'Face à l’injustice',icon:'⚖️',description:'Des récits autour du courage, de l’équité et de la responsabilité.',stories:['croyant-pharaon','ashab-al-ukhdud','madyan','plainte-entendue','plaideurs-dawud'],question:'Quel geste juste est à ma portée ?',action:'Identifier une personne de confiance à qui demander conseil.'},
 {id:'share',label:'Apprendre à donner',icon:'🤲',description:'Questionner le partage, la générosité et l’attachement aux biens.',stories:['jardin-avares','qarun','luqman','grain-generosite'],question:'Que puis-je partager sans me mettre en difficulté ?',action:'Choisir une attention utile pour quelqu’un.'},
] as const;
export function journeyUrl(kind:JourneyKind,id:string,mode='story'){return `/journeys/${kind}/${id}?mode=${mode}`;}

/** Explicit editorial ranges only: no name matching or guessed context. */
export function storiesForVerse(surah:number,ayah:number){
 return Object.entries(chapterBooks).flatMap(([key,book])=>book.chapters.filter(c=>referenceVerses(c.reference).some(v=>v.surah===surah&&v.ayah===ayah)).map(c=>{const [kind,id]=key.split(':');const j=getJourney(kind,id)!;return {key,kind:kind as JourneyKind,id,title:j.title,chapter:c,icon:j.icon};}));
}
export function orderedJourneyVerses(journey:EditorialJourney,order:'story'|'quran'){
 const seen=new Set<string>();const verses=journey.steps.filter(s=>s.kind==='verse').filter(s=>{const key=`${s.surah}:${s.ayah}`;if(seen.has(key))return false;seen.add(key);return true;});
 return order==='quran'?[...verses].sort((a,b)=>a.surah!-b.surah!||a.ayah!-b.ayah!):verses;
}
export function readingMinutes(journey:EditorialJourney){return Math.max(1,Math.ceil(journey.steps.filter(s=>s.kind==='narrative').map(s=>s.text).join(' ').split(/\s+/).length/180));}
