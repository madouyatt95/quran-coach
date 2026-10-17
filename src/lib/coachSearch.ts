import { HADITHS } from '../data/hadiths';
import { normalizeSearch, rankSearch, searchExcerpt } from './searchText';
export type SearchKind = 'hadith'|'invocation'|'verse'|'surah'|'course'|'arabic'|'story'|'note';
export interface SearchResult {
 id:string; type:SearchKind; title:string; textAr:string; textFr:string;
 source?:string; link?:string; score:number; emoji:string; studied?:boolean;
}
export interface SearchResponse { results:SearchResult[]; unavailable:string[] }
const TAG_SYNONYMS: Record<string, string[]> = {
    priere: ['prière', 'salat', 'prières', 'salah', 'prosternation', 'prier'],
    patience: ['patient', 'épreuve', 'épreuves', 'sabr', 'difficile', 'souffrance'],
    repentir: ['tawba', 'pardon', 'péché', 'péchés', 'demander pardon', 'se repentir'],
    jeune: ['jeûne', 'jeûner', 'ramadan', 'siyam', 'iftar'],
    ramadan: ['ramadhan', 'tarawih', 'laylat al qadr', 'nuit du destin'],
    coran: ['quran', 'lecture', 'lire', 'récitation', 'sourate', 'verset'],
    dhikr: ['dikr', 'invocation', 'rappel', 'subhanallah', 'alhamdulillah'],
    charite: ['charité', 'aumône', 'sadaqa', 'zakat', 'donner', 'don'],
    paradis: ['jannah', 'jannat', 'au-delà'],
    mort: ['mourir', 'tombe', 'décès', 'akhirah'],
    parents: ['mère', 'père', 'famille', 'enfants'],
    science: ['savoir', 'connaissance', 'apprendre', 'étudier'],
    dua: ['invocation', 'invoquer', 'supplique', 'supplication', 'doua'],
    hajj: ['pèlerinage', 'omra', 'arafat', 'mecque'],
    prophete: ['prophète', 'muhammad', 'mohammed', 'messager', 'salawat'],
    bon_comportement: ['comportement', 'caractère', 'akhlaq', 'manières', 'douceur'],
    fraternie: ['fraternité', 'frère', 'frères', 'amitié', 'entraide'],
    vendredi: ['jumu\'a', 'joumoua', 'al-kahf'],
    matin: ['aube', 'fajr', 'protections du matin'],
    soir: ['nuit', 'coucher', 'protections du soir'],
    general: [],
};


export function searchHadiths(query:string):SearchResult[]{
 return HADITHS.flatMap(h=>{
  const synonyms=h.tags.flatMap(tag=>[tag,...(TAG_SYNONYMS[tag]||[])]).join(' ');
  const score=rankSearch(query,h.source,`${h.textAr} ${h.textFr} ${h.narrator} ${synonyms}`);
  return score?[{id:`hadith:${h.id}`,type:'hadith' as const,title:`Hadith — ${h.source}`,textAr:h.textAr,textFr:h.textFr,source:`${h.source} — ${h.narrator}`,link:`/hadiths?search=${encodeURIComponent(h.textFr.slice(0,40))}`,score,emoji:'📜'}]:[];
 });
}
export async function searchAllInvocations(query:string):Promise<SearchResult[]>{
 const {searchInvocations,invocationTitle}=await import('./adhkarExperience');
 return searchInvocations(query).map(d=>({id:`dua:${d.key}`,type:'invocation',title:invocationTitle(d),textAr:d.arabic,textFr:d.translation,source:d.source||d.categoryName,link:`/adhkar?cat=${encodeURIComponent(d.categoryId)}&dua=${encodeURIComponent(d.key)}`,score:rankSearch(query,d.categoryName,`${d.arabic} ${d.translation} ${d.transliteration||''}`)||10,emoji:'🤲'}));
}
async function searchQuran(query:string,signal?:AbortSignal):Promise<SearchResult[]>{
 const arabic=/[\u0600-\u06ff]/.test(query),edition=arabic?'ar.quran-uthmani':'fr.hamidullah';
 const response=await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${edition}`,{signal});
 const data=await response.json();
 // The provider also uses 404 with this precise message for a successful empty search.
 if(response.status===404&&data.code===404&&data.data==='Nothing matching your search was found..')return [];
 if(!response.ok||data.code!==200||!Array.isArray(data.data?.matches))throw new Error('Coran indisponible');
 return data.data.matches.filter((m:{surah?:{number:number};numberInSurah:number;text:string})=>m.surah&&Number.isInteger(m.surah.number)&&Number.isInteger(m.numberInSurah)&&typeof m.text==='string').map((m:{surah:{number:number;englishName:string};numberInSurah:number;text:string})=>({id:`verse:${m.surah.number}:${m.numberInSurah}`,type:'verse',title:`${m.surah.englishName} — Verset ${m.numberInSurah}`,textAr:arabic?m.text:'',textFr:arabic?'':m.text,source:`Coran ${m.surah.number}:${m.numberInSurah}`,link:`/read?surah=${m.surah.number}&ayah=${m.numberInSurah}`,score:50,emoji:'📖'}));
}
export async function coachSearch(query:string,options:{signal?:AbortSignal;localOnly?:boolean}={}):Promise<SearchResponse>{
 if(normalizeSearch(query).length<2)return {results:[],unavailable:[]};
 const controller=new AbortController();
 const abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});
 if(options.signal?.aborted)controller.abort();
 const timeout=setTimeout(abort,9000);
 try{
  const sources:{name:string;load:()=>Promise<SearchResult[]>}[]=[
   {name:'Hadiths',load:async()=>searchHadiths(query)},
   {name:'Invocations',load:()=>searchAllInvocations(query)},
   {name:'Cours, récits et notes',load:async()=> (await import('./knowledgeSearch')).searchKnowledge(query)},
   ...(!options.localOnly?[{name:'Coran en ligne',load:()=>searchQuran(query,controller.signal)}]:[])
  ];
  const settled=await Promise.allSettled(sources.map(s=>s.load()));
  const unavailable=settled.flatMap((r,i)=>r.status==='rejected'?[sources[i].name]:[]);
  const seen=new Set<string>();
  const results=settled.flatMap(r=>r.status==='fulfilled'?r.value:[]).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true;});
  return {results:results.map(r=>({...r,textFr:searchExcerpt(r.textFr,query,420)})),unavailable};
 }finally{clearTimeout(timeout);options.signal?.removeEventListener('abort',abort);}
}
export const QUICK_TAGS = [
    { label: 'Patience', query: 'patience', emoji: '🪨' },
    { label: 'Prière', query: 'prière', emoji: '🕌' },
    { label: 'Repentir', query: 'repentir', emoji: '💜' },
    { label: 'Coran', query: 'coran', emoji: '📖' },
    { label: 'Parents', query: 'parents', emoji: '❤️' },
    { label: 'Paradis', query: 'paradis', emoji: '🌿' },
    { label: 'Dhikr', query: 'dhikr', emoji: '📿' },
    { label: 'Charité', query: 'charité', emoji: '🤝' },
    { label: 'Jeûne', query: 'jeûne', emoji: '🌙' },
    { label: 'Prophète ﷺ', query: 'prophète', emoji: '⭐' },
    { label: 'Voyage', query: 'voyage', emoji: '✈️' },
    { label: 'Matin', query: 'matin', emoji: '🌅' },
    { label: 'Soir', query: 'soir', emoji: '🌆' },
    { label: 'Mort', query: 'mort', emoji: '💀' },
    { label: 'Hajj', query: 'hajj', emoji: '🕋' },
];
