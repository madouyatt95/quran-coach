import {companionPortraits,companionHref} from '../data/companionPortraits';
import { COURSE_LEVELS } from '../academy/data/courseLibrary';
import { LEVEL_1_FONDATIONS } from '../academy/data/level1-fondations';
import { LEVEL_2_PRATIQUE } from '../academy/data/level2-pratique';
import { chapterTeaching } from '../academy/data/courseExplanations';
import { ARABIC_LESSONS } from '../arabic/data';
import { prophets } from '../data/prophets';
import { stories } from '../data/storiesData';
import { getJourney, journeyUrl } from './editorialJourneys';
import { useAcademyStore } from '../stores/academyStore';
import { useAcademyKnowledgeStore } from '../stores/academyKnowledgeStore';
import { useArabicLearningStore } from '../stores/arabicLearningStore';
import { useReaderNotesStore } from '../stores/readerNotesStore';
import { useEditorialJourneyStore } from '../stores/editorialJourneyStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useListeningNotebookStore } from '../stores/listeningNotebookStore';
import { useFahmLearningStore } from '../stores/fahmLearningStore';
import { rankSearch } from './searchText';
import type { SearchResult } from './coachSearch';
const modules=[LEVEL_1_FONDATIONS,LEVEL_2_PRATIQUE,...COURSE_LEVELS].flatMap(l=>l.modules);
const moduleTitle=(id:string)=>modules.find(m=>m.id===id)?.title||'Mon cours';
type Entry=Omit<SearchResult,'score'>;
// Index existing explanations, not answer keys or generated religious content.
const publicEntries:Entry[]=[
 ...companionPortraits.map(p=>({id:`companion:${p.id}`,type:'story' as const,title:p.nameFr,textAr:p.nameAr,textFr:[p.aliases,p.title,...p.paragraphs,...p.references.map(r=>r.label)].join('\n'),source:'Compagnons et compagnes',link:companionHref(p.id),emoji:'🕯️'})),
 ...modules.map(m=>{const teaching=chapterTeaching(m.id);return {id:`course:${m.id}`,type:'course' as const,title:m.title,textAr:m.titleAr,textFr:[m.description,...m.content.flatMap(c=>c.type==='lesson'?c.sections.map(s=>`${s.title}\n${s.body}`):[]),teaching?.introduction,...(teaching?.developments||[]),teaching?.takeaway].filter(Boolean).join('\n'),source:'Académie · cours et explications',link:`/academy?module=${encodeURIComponent(m.id)}`,emoji:m.icon};}),
 ...ARABIC_LESSONS.map(l=>({id:`arabic:${l.id}`,type:'arabic' as const,title:l.title,textAr:l.arabic,textFr:[l.track,l.goal,...l.paragraphs,l.advanced,l.takeaway,l.translation,...l.example.map(e=>`${e.text} ${e.label} ${e.detail}`)].join('\n'),source:`Arabe · ${l.track}`,link:`/academy/arabic/${encodeURIComponent(l.id)}?view=read`,emoji:'✍️'})),
 ...[...prophets.map(p=>({kind:'prophet' as const,id:p.id})),...stories.map(s=>({kind:'story' as const,id:s.id}))].flatMap(({kind,id})=>{const j=getJourney(kind,id);return j?[{id:`story:${j.id}`,type:'story' as const,title:j.title,textAr:'',textFr:[j.intro,...j.steps.filter(s=>s.kind==='narrative').map(s=>`${s.title}\n${s.text}`),...j.lessons].filter(Boolean).join('\n'),source:kind==='prophet'?'Prophètes · parcours':'Histoires et moralités',link:journeyUrl(kind,id),emoji:j.icon}]:[];})
];
export function searchKnowledge(query:string):SearchResult[]{
 const academy=useAcademyStore.getState(),journeys=useEditorialJourneyStore.getState(),arabic=useArabicLearningStore.getState();
 const notes:Entry[]=[];
 const addNote=(id:string,title:string,textFr:string,link:string,source:string)=>{if(textFr.trim())notes.push({id:`note:${id}`,type:'note',title,textAr:'',textFr,link,source,emoji:'📝',studied:true});};
 for(const [key,n] of Object.entries(useReaderNotesStore.getState().notes))addNote(`reader:${key}`,`Ma note · Coran ${key}`,n.text,`/read?surah=${n.surah}&ayah=${n.ayah}`,'Mushaf · note personnelle');
 for(const [key,n] of Object.entries(journeys.notes)){const [kind,id]=key.split(':');const j=getJourney(kind,id);if(j)addNote(`journey:${key}`,j.title,[n.text,n.lesson,n.action].filter(Boolean).join('\n'),journeyUrl(j.kind,id,'reflection'),'Carnet · réflexion personnelle');}
 for(const [id,n] of Object.entries(academy.notebook))addNote(`academy:${id}`,moduleTitle(id),[n.understood,n.distinction,n.example,n.review].filter(Boolean).join('\n'),`/academy?module=${encodeURIComponent(id)}`,'Académie · mon carnet');
 for(const [id,n] of Object.entries(academy.notes)){const m=modules.find(m=>id===m.id||id.startsWith(m.id+':'));if(m)addNote(`academy-note:${id}`,m.title,n,`/academy?module=${encodeURIComponent(m.id)}`,'Académie · ma note');}
 for(const [key,n] of Object.entries(useAcademyKnowledgeStore.getState().concepts)){const id=key.split(':notion:')[0];addNote(`concept:${key}`,moduleTitle(id),[n.explanation,n.proofNote].filter(Boolean).join('\n'),`/academy?module=${encodeURIComponent(id)}`,'Académie · ma reformulation');}
 for(const [key,n] of Object.entries(useFahmLearningStore.getState().records))if(n.note)addNote(`fahm:${key}`,`Fahm · ${key}`,n.note,`/fahm/surah/${n.surah}`,'Fahm · ma note');
 for(const n of useListeningNotebookStore.getState().notes)addNote(`listen:${n.id}`,`Écoute · ${n.item.surahNumber}:${n.item.verse?.number}`,n.note,`/read?surah=${n.item.surahNumber}&ayah=${n.item.verse?.number||1}`,'Écoute · mon carnet');
 const favorites=useFavoritesStore.getState();
 for(const [key,n] of Object.entries(favorites.annotations))if(n.note)addNote(`favorite:${key}`,'Ma note dans la bibliothèque',n.note,`/favorites?q=${encodeURIComponent(n.note.slice(0,60))}`,'Bibliothèque · annotation personnelle');
 return [...publicEntries,...notes].flatMap(entry=>{
  const score=rankSearch(query,entry.title,`${entry.textAr}\n${entry.textFr}\n${entry.source}`);if(!score)return [];
  const id=entry.id.slice(entry.id.indexOf(':')+1);
  const studied=entry.type==='course'?!!academy.progress[id]:entry.type==='arabic'?!!arabic.drafts[id]:entry.type==='story'?!!journeys.progress[id]:entry.studied;
  return [{...entry,score,studied}];
 });
}
