import {companionPortraits,companionHref} from '../data/companionPortraits';
import {narrationSentences} from './narrationText';
import catalog from '../data/bookCatalog.json';
import type {LibraryAudio} from './audioProduction';
import {chapterNarrative,type NarrativeBook,type NarrativeChapter} from './narrativeBooks';
export type BookScene='dawn'|'desert'|'water'|'garden'|'night'|'cave';
export type BookAmbience='silence'|'wind'|'water'|'rain';
export const books=catalog;
export type BookSummary=typeof books[number];
const P=(id:string)=>`/prophets?prophet=${id}`;
const S=(id:string)=>`/stories?story=${id}`;
/** Explicit editorial links, never fuzzy name matching. Arrays correspond to chapters. */
export const bookOrigins:Record<string,string[]>={
 adam:[P('adam')],nuh:[P('nuh')],ibrahim:[P('ibrahim')],yusuf:[P('yusuf')],musa:[P('musa')],
 'maryam-isa':[P('zakariyya'),S('maryam'),S('maryam'),P('isa')],
 sulayman:[P('dawud'),S('fourmi'),S('huppe'),S('bilqis'),P('sulayman')],
 khidr:[S('khidr')],cave:[S('ashab-al-kahf')],
 'biens-et-coeur':[S('qarun'),S('deux-jardins'),S('jardin-avares')],
 'musa-apres-la-mer':[P('musa'),P('musa'),S('vache-baqara'),P('musa')],
 'royaumes-et-justice':[S('talut-jalut'),S('talut-jalut'),S('dhul-qarnayn'),S('dhul-qarnayn')],
 'appels-et-mesure':[P('hud'),P('salih'),P('shuayb')],
 'sira-confiance':[P('muhammad'),S('badr'),S('uhud'),S('khandaq'),S('hudaybiyya')],
 'voix-epreuve':[P('yunus'),P('ayyub'),'/read?surah=36&ayah=13'],
 'luqman-conseils':[S('luqman')],'parole-juste':['/read?surah=49&ayah=6','/read?surah=49&ayah=11','/read?surah=49&ayah=9'],
 lut:[P('lut')],'kaab-verite':[S('tabuk')],'aicha-innocence':[S('ifk')],
 'garcon-et-roi':[S('ashab-al-ukhdud')],
 'trois-et-rocher':['https://sunnah.com/bukhari:2272'],
 'trois-bienfaits':['https://sunnah.com/bukhari:3464'],
 'route-du-retour':['https://sunnah.com/muslim:2766a'],
 'hajar-zamzam':[P('ismail')],'hijra-route':[P('muhammad')],
 'ascension-priere':[S('isra-miraj')],'hudaybiyya-pacte':[S('hudaybiyya')],
 'revelation-lettre':[P('muhammad')],
 'abou-dharr-recherche':['https://sunnah.com/muslim:2473a'],
 'equilibre-droits':['https://sunnah.com/bukhari:1968','https://sunnah.com/bukhari:5199','https://sunnah.com/bukhari:5063'],
 'portes-hospitalite':['https://sunnah.com/bukhari:3798','https://sunnah.com/bukhari:6452','https://sunnah.com/muslim:2038a'],
 'jourayj-apparences':['https://sunnah.com/bukhari:3436'],
 'gestes-qui-comptent':['https://sunnah.com/bukhari:2363','https://sunnah.com/muslim:1914c','https://sunnah.com/muslim:2984a'],
 'jabir-attention':['https://sunnah.com/bukhari:2097','https://sunnah.com/bukhari:2718','https://sunnah.com/bukhari:2396'],
 'bois-confie-mer':['https://sunnah.com/bukhari:2291'],
};
for(const p of companionPortraits){if(p.bookId&&books.some(b=>b.id===p.bookId)){const links=bookOrigins[p.bookId]||=[];const url=companionHref(p.id);if(!links.includes(url))links.push(url);}}
const companions:Record<string,string[]>={musa:['khidr','musa-apres-la-mer'],sulayman:['sulayman'],isa:['maryam-isa'],muhammad:['sira-confiance','hijra-route','revelation-lettre','ascension-priere','hudaybiyya-pacte'],dawud:['sulayman','royaumes-et-justice'],ibrahim:['hajar-zamzam']};
export function originForChapter(bookId:string,chapter:number){
 const person=companionPortraits.find(p=>p.bookId===bookId);
 if(person)return companionHref(person.id);
 const links=bookOrigins[bookId]||[];return links[chapter]||links[0]||'/stories';
}
export function booksForOrigin(kind:'prophet'|'story'|'companion',id:string){const url=kind==='companion'?companionHref(id):kind==='prophet'?P(id):S(id);return books.filter(b=>bookOrigins[b.id]?.includes(url)||(kind==='prophet'&&companions[id]?.includes(b.id)));}
export function bookForAudio(item:Pick<LibraryAudio,'reference'|'title'>){
 const title=item.title.replace(/^Édition chronologique · /u,'');
 return books.find(b=>item.reference?.includes(`Manuscrit ${b.version}, chapitre `)&&title.startsWith(`${b.title} · `));
}
export function chapterForAudio(item:Pick<LibraryAudio,'reference'|'title'>,book=bookForAudio(item)){
 return book?.chapters.findIndex(c=>item.reference.includes(`, chapitre ${c.id}, segment `))??-1;
}
export function recordingsForBook(items:LibraryAudio[],book:BookSummary){
 return items.filter(item=>bookForAudio(item)?.id===book.id&&chapterForAudio(item,book)>=0).sort((a,b)=>chapterForAudio(a,book)-chapterForAudio(b,book)||segmentNumber(a)-segmentNumber(b));
}
export function segmentNumber(item:Pick<LibraryAudio,'reference'>){return Number(item.reference?.match(/, segment (\d+)\/\d+/)?.[1]||1);}
export function audioOrigin(item:LibraryAudio){const book=bookForAudio(item);return book?originForChapter(book.id,chapterForAudio(item,book)):item.sourceUrl;}
export function bookHref(bookId:string,chapter?:string){return `/books/${bookId}${chapter?`?chapter=${encodeURIComponent(chapter)}`:''}`;}
export function resumeRecording(items:LibraryAudio[],positions:Record<string,{seconds:number;updatedAt:number}>){
 const recent=[...items].filter(i=>positions[i.id]?.seconds>0).sort((a,b)=>positions[b.id].updatedAt-positions[a.id].updatedAt)[0];
 if(!recent)return items[0];
 return positions[recent.id].seconds>=recent.duration-2?items[items.indexOf(recent)+1]||items[0]:recent;
}
const sceneDefaults:Record<string,BookScene>={adam:'dawn',nuh:'water',ibrahim:'desert',yusuf:'night',musa:'water','maryam-isa':'garden',sulayman:'desert',khidr:'water',cave:'cave','biens-et-coeur':'garden','musa-apres-la-mer':'desert','royaumes-et-justice':'desert','appels-et-mesure':'desert','sira-confiance':'night','voix-epreuve':'night','luqman-conseils':'garden','parole-juste':'dawn',
 lut:'night','kaab-verite':'night','aicha-innocence':'dawn','garcon-et-roi':'dawn','trois-et-rocher':'cave','trois-bienfaits':'garden','route-du-retour':'desert','hajar-zamzam':'water','hijra-route':'desert','ascension-priere':'night','hudaybiyya-pacte':'desert','revelation-lettre':'cave','abou-dharr-recherche':'water','equilibre-droits':'dawn','portes-hospitalite':'night','jourayj-apparences':'dawn','gestes-qui-comptent':'garden','jabir-attention':'garden','bois-confie-mer':'water'};
export function coverScene(id:string):BookScene{return sceneDefaults[id]||companionPortraits.find(p=>p.bookId===id)?.scene||'dawn';}
/** Scene cues are editorial atmospheres, never reconstructions of unseen events. */
export function sceneTreatment(bookId:string,chapter:number,scene:number):{decor:BookScene;ambience:BookAmbience}{
 if(bookId==='adam')return chapter===0?{decor:'dawn',ambience:'silence'}:chapter===1?{decor:'garden',ambience:scene===0?'wind':'silence'}:{decor:'dawn',ambience:'wind'};
 if(bookId==='biens-et-coeur')return chapter===0?{decor:'desert',ambience:scene===0?'wind':'silence'}:chapter===1?{decor:'garden',ambience:scene===0?'water':'wind'}:{decor:scene===0?'night':'dawn',ambience:scene===0?'silence':'wind'};
 const treatments:Record<string,[BookScene,BookAmbience][]>={
  nuh:[['desert','wind'],['dawn','wind'],['water','rain'],['water','wind']],
  ibrahim:[['desert','wind'],['desert','silence'],['dawn','silence'],['desert','wind'],['desert','wind']],
  yusuf:[['night','silence'],['cave','wind'],['dawn','silence'],['garden','wind'],['desert','wind'],['night','silence'],['dawn','wind']],
  musa:[['water','water'],['desert','wind'],['night','silence'],['desert','silence'],['water','wind']],
  'maryam-isa':[['garden','silence'],['dawn','silence'],['garden','wind'],['dawn','silence']],
  sulayman:[['dawn','silence'],['desert','wind'],['desert','wind'],['garden','wind'],['dawn','silence']],
  khidr:[['water','water'],['desert','wind'],['dawn','silence']],cave:[['cave','wind'],['night','silence'],['dawn','wind']],
  'musa-apres-la-mer':[['desert','wind'],['dawn','silence'],['garden','wind'],['desert','wind']],
  'royaumes-et-justice':[['desert','wind'],['water','water'],['desert','wind'],['desert','wind']],
  'appels-et-mesure':[['desert','wind'],['cave','wind'],['desert','wind']],
  'sira-confiance':[['cave','wind'],['desert','wind'],['dawn','silence'],['night','wind'],['dawn','wind']],
  'voix-epreuve':[['water','water'],['dawn','silence'],['desert','wind']],
  'luqman-conseils':[['garden','wind'],['dawn','silence'],['garden','wind']],
  'parole-juste':[['dawn','silence'],['garden','wind'],['dawn','silence']],
  lut:[['desert','wind'],['night','silence'],['dawn','wind']],
  'kaab-verite':[['desert','wind'],['dawn','silence'],['night','silence'],['night','silence'],['dawn','wind']],
  'aicha-innocence':[['desert','wind'],['night','silence'],['dawn','silence'],['night','silence'],['dawn','silence']],
  'garcon-et-roi':[['desert','wind'],['dawn','silence'],['water','wind'],['dawn','silence']],
  'trois-et-rocher':[['cave','wind'],['cave','silence'],['dawn','wind']],
  'trois-bienfaits':[['garden','wind'],['desert','wind'],['dawn','silence']],
  'route-du-retour':[['night','silence'],['desert','wind'],['dawn','silence']],
  'hajar-zamzam':[['desert','wind'],['water','water'],['garden','wind'],['desert','wind']],
  'hijra-route':[['night','silence'],['dawn','silence'],['cave','wind'],['desert','wind'],['dawn','wind']],
  // Abstract night, no reconstruction or sound depiction of the unseen.
  'ascension-priere':[['night','silence'],['night','silence'],['dawn','silence']],
  'hudaybiyya-pacte':[['desert','wind'],['desert','wind'],['dawn','silence'],['night','silence'],['dawn','wind']],
  'revelation-lettre':[['cave','wind'],['dawn','silence'],['desert','wind'],['dawn','silence'],['night','silence']],
  'abou-dharr-recherche':[['desert','wind'],['water','water'],['dawn','wind']],
  'equilibre-droits':[['night','silence'],['dawn','silence'],['dawn','silence']],
  'portes-hospitalite':[['night','silence'],['dawn','silence'],['garden','wind']],
  'jourayj-apparences':[['dawn','silence'],['desert','wind'],['dawn','silence']],
  'gestes-qui-comptent':[['water','water'],['desert','wind'],['garden','rain']],
  'jabir-attention':[['desert','wind'],['dawn','silence'],['garden','wind']],
  'bois-confie-mer':[['desert','wind'],['water','water'],['dawn','wind']],
 };
 const cue=treatments[bookId]?.[chapter];return cue?{decor:cue[0],ambience:scene%2===1?'silence':cue[1]}:{decor:coverScene(bookId),ambience:'silence'};
}
/** Match the exact recorded slice; do not estimate timing from narration speed. */
export function activeBookScene(book:NarrativeBook,chapter:NarrativeChapter,item:LibraryAudio|null,position:number){
 if(!item||bookForAudio(item)?.id!==book.id||chapterForAudio(item)!==book.chapters.indexOf(chapter))return 0;
 const text=narratedChapterText(book,chapter);
 const partStart=text.indexOf(item.text);if(partStart<0)return 0;
 const sentences=narrationSentences(item.text);let cursor=0;const offsets=sentences.map(sentence=>{const index=item.text.indexOf(sentence,cursor);cursor=index+sentence.length;return Math.max(0,index);});
 const marker=item.sentences.filter(s=>position>=s.start).at(-1);
 const offset=partStart+(marker===undefined?0:(offsets[marker.sentence]||0));
 let start=0,result=0;chapter.scenes.forEach((s,i)=>{if(offset>=start)result=i;start+=s.paragraphs.map(p=>p.text).join('\n\n').length+2;});return result;
}
/** Legacy entry points resolve to the canonical manuscript, with its matching chapter. */
export function bookEntryForOrigin(kind:'prophet'|'story'|'companion',id:string){
 const preferred=kind==='story'?({hudaybiyya:'hudaybiyya-pacte'} as Record<string,string>)[id]:undefined;
 const related=booksForOrigin(kind,id),primary=related.find(b=>b.id===(preferred||id))||related[0];if(!primary)return null;
 const origin=kind==='companion'?companionHref(id):kind==='prophet'?P(id):S(id),chapter=kind==='companion'?0:Math.max(0,(bookOrigins[primary.id]||[]).indexOf(origin));
 return {book:primary,chapter:primary.chapters[chapter]?.id||primary.chapters[0].id};
}

export function narratedChapterText(book:NarrativeBook,chapter:NarrativeChapter){return chapterNarrative(chapter)+(book.chapters.at(-1)?.id===chapter.id?'\n\n'+book.epilogue.text:'');}
export function chapterPlayback(item:LibraryAudio,queue:LibraryAudio[],position:number){
 const book=bookForAudio(item),index=chapterForAudio(item,book),parts=book&&index>=0?queue.filter(p=>bookForAudio(p)?.id===book.id&&chapterForAudio(p,book)===index):[item];
 if(!parts.some(p=>p.id===item.id))parts.push(item);
 const at=parts.findIndex(p=>p.id===item.id);
 return {title:book&&index>=0?`${book.title} · ${index+1}. ${book.chapters[index].title}`:item.title,parts,seconds:parts.slice(0,at).reduce((sum,p)=>sum+p.duration,0)+position,duration:parts.reduce((sum,p)=>sum+p.duration,0)};
}

export function canonicalBookForSource(sourceUrl:string){
 try{
  const url=new URL(sourceUrl,'https://www.quran-coach.fr');
  if(!['www.quran-coach.fr','quran-coach.fr'].includes(url.hostname))return null;
  const kind=url.pathname==='/companions'?'companion':url.pathname==='/prophets'?(url.searchParams.has('companion')?'companion':'prophet'):url.pathname==='/stories'?'story':null;
  if(kind)return bookEntryForOrigin(kind,url.searchParams.get(kind)||'');
  const legacy=url.pathname.match(/^\/journeys\/(prophet|story)\/([^/]+)$/);
  return legacy?bookEntryForOrigin(legacy[1] as 'prophet'|'story',decodeURIComponent(legacy[2])):null;
 }catch{return null;}
}

/** Superseded manuscript versions must never appear as unrelated standalone audios. */
export function isSupersededBookAudio(item:Pick<LibraryAudio,'reference'|'title'>){
 return !bookForAudio(item)&&books.some(b=>item.reference?.includes(`Manuscrit ${b.id}-`));
}
export function isCompanionBook(book:BookSummary){return companionPortraits.some(p=>p.bookId===book.id);}

/** Stay in the current collection and rotate the shelf, keeping related lives together. */
export function recommendedBooks(bookId:string,items:LibraryAudio[],preferAudio=false,limit=6){
 const at=books.findIndex(b=>b.id===bookId),current=books[at];
 if(!current)return [];
 const collection=(book:BookSummary)=>isCompanionBook(book)?'companions':book.category;
 const origins=new Set(bookOrigins[bookId]||[]);
 const candidates=[...books.slice(at+1),...books.slice(0,at)].filter(b=>collection(b)===collection(current));
 const related=(book:BookSummary)=>Number(bookOrigins[book.id]?.some(url=>origins.has(url))||false);
 const playable=(book:BookSummary)=>Number(recordingsForBook(items,book).length>0);
 return candidates.sort((a,b)=>(preferAudio?playable(b)-playable(a):0)||related(b)-related(a)).slice(0,limit);
}
