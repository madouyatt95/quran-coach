/** Account-independent backups. Only the explicit progress registry is transferable. */
export type Json = null|boolean|number|string|Json[]|{[key:string]:Json};
export type ObjectValue = {[key:string]:Json};
export interface BackupSection { state:ObjectValue; version:number }
export interface ProgressBackup { format:'quran-coach-progress'; version:1; createdAt:string; sections:Record<string,BackupSection> }
export interface BackupStore { key:string; label:string; version:number; defaults:Record<string,unknown>; rehydrate:()=>Promise<void>|void; reset?:()=>void }
export const BACKUP_LIMIT=24*1024*1024;
export const RECOVERY_KEY='qc-backup-recovery-v1';
export const BACKUP_LABELS:Record<string,string>={
 'qc-book-notebook-v1':'Carnet des livres racontés',
 'qc-audio-library-v1':'Bibliothèque audio, favoris et reprises',
 'quran-coach-quran':'Position de lecture', 'quran-coach-reading-bookmark':'Signets du Mushaf',
 'quran-coach-favorites':'Favoris, collections et annotations', 'quran-coach-reader-notes':'Notes du Mushaf',
 'quran-coach-khatm':'Progression du Khatm', 'quran-coach-stats':'Activité et régularité',
 'quran-coach-srs':'Révisions espacées', 'quran-coach-progress':'Mémorisation et signets historiques',
 'quran-coach-hifdh-journey-v1':'Parcours de mémorisation', 'quran-coach-memory-tests-v1':'Tests de mémorisation',
 'quran-coach-learning-v1':'Séances et apprentissages', 'quran-coach-fahm':'Parcours Fahm',
 'quran-coach-fahm-learning-v1':'Compréhension et notes Fahm', 'academy-store':'Académie, cours et carnet',
 'qc-academy-notions-v1':'Notions de l’Académie', 'qc-academy-experience-v1':'Ateliers de l’Académie',
 'qc-arabic-learning-v1':'Leçons d’arabe', 'qc-arabic-practice-v1':'Pratique de l’arabe',
 'qc-arabic-adventure-v1':'Aventures en arabe', 'quran-coach-editorial-journeys':'Récits et carnet personnel',
 'quran-coach-story-library':'Bibliothèque des récits', 'quran-coach-quiz-learning-v1':'Apprentissages du quiz',
 'quran-coach-listen':'Écoutes, favoris et reprises', 'quran-coach-listening-notebook':'Carnet d’écoute',
 'quran-coach-listening-journeys-v1':'Parcours d’écoute', 'quran-coach-listening-evidence-v1':'Historique d’écoute',
 'quran-coach-playlists':'Listes d’écoute', 'quran-coach-mushaf-study':'Mots à revoir',
 'quran-coach-daily-adhkar':'Invocations quotidiennes', 'quran-coach-adhkar-experience':'Parcours d’invocations',
 'quran-coach-challenges':'Défis personnels', 'quran-coach-settings':'Préférences de lecture',
 'quran-coach-interactive-reader':'Préférences du Mushaf', 'quran-coach-reader-coach-v1':'Accompagnement de lecture'
};
const modules=import.meta.glob(["../stores/bookNotebookStore.ts","../stores/audioLibraryStore.ts","../stores/academyStore.ts", "../stores/mushafStudyStore.ts", "../stores/listeningJourneyStore.ts", "../stores/editorialJourneyStore.ts", "../stores/settingsStore.ts", "../stores/memorizationTestStore.ts", "../stores/listeningNotebookStore.ts", "../stores/fahmStore.ts", "../stores/learningStore.ts", "../stores/playlistsStore.ts", "../stores/challengesStore.ts", "../stores/listeningEvidenceStore.ts", "../stores/adhkarExperienceStore.ts", "../stores/readingBookmarkStore.ts", "../stores/arabicAdventureStore.ts", "../stores/khatmStore.ts", "../stores/academyExperienceStore.ts", "../stores/progressStore.ts", "../stores/dailyAdhkarStore.ts", "../stores/arabicLearningStore.ts", "../stores/statsStore.ts", "../stores/quizLearningStore.ts", "../stores/academyKnowledgeStore.ts", "../stores/favoritesStore.ts", "../stores/readerCoachStore.ts", "../stores/fahmLearningStore.ts", "../stores/hifdhJourneyStore.ts", "../stores/listenStore.ts", "../stores/readerNotesStore.ts", "../stores/interactiveReaderStore.ts", "../stores/srsStore.ts", "../stores/storyLibraryStore.ts", "../stores/quranStore.ts", "../stores/arabicPracticeStore.ts"]);
let registryPromise:Promise<BackupStore[]>|undefined;
export function backupRegistry():Promise<BackupStore[]>{
 return registryPromise??=Promise.all(Object.values(modules).map(load=>load())).then(loaded=>{
  const result:BackupStore[]=[];
  for(const module of loaded)for(const candidate of Object.values(module as Record<string,unknown>)){
   const store=candidate as {persist?:{getOptions:()=>{name:string;version?:number};rehydrate:()=>Promise<void>|void};setState?:(state:Record<string,unknown>)=>void;getInitialState?:()=>Record<string,unknown>};
   if(!store?.persist||!store.getInitialState)continue;
   const {name,version=0}=store.persist.getOptions();if(!BACKUP_LABELS[name])continue;
   result.push({key:name,label:BACKUP_LABELS[name],version,defaults:store.getInitialState(),rehydrate:()=>store.persist!.rehydrate(),reset:()=>store.setState?.(store.getInitialState!())});
  }
  return result.sort((a,b)=>a.label.localeCompare(b.label,'fr'));
 });
}
const omitted=new Set(['reciters','fetchedAt','sessionStartTime','celebrationPending']);
const forbidden=new Set(['__proto__','prototype','constructor']);
const record=(v:unknown):v is ObjectValue=>!!v&&typeof v==='object'&&!Array.isArray(v);
function validateJson(value:unknown,depth=0,budget={left:250000}):asserts value is Json{
 if(--budget.left<0||depth>30)throw new Error('Sauvegarde trop complexe.');
 if(value===null||typeof value==='boolean')return;
 if(typeof value==='string'){if(value.length>200000)throw new Error('Texte trop long dans la sauvegarde.');return;}
 if(typeof value==='number'&&Number.isFinite(value))return;
 if(Array.isArray(value)){if(value.length>20000)throw new Error('Liste trop longue.');for(const item of value)validateJson(item,depth+1,budget);return;}
 if(record(value)){for(const [key,item] of Object.entries(value)){if(forbidden.has(key))throw new Error('Clé non autorisée.');validateJson(item,depth+1,budget);}return;}
 throw new Error('Données invalides.');
}
function sameType(a:unknown,b:unknown){return a===null||a===undefined?true:Array.isArray(a)?Array.isArray(b):typeof a==='object'?record(b):typeof a===typeof b;}
function cleanSection(section:unknown,store:BackupStore):BackupSection{
 if(!record(section)||!record(section.state)||section.version!==store.version)throw new Error(`${store.label} : format incompatible. Mettez l’application à jour sur les deux appareils.`);
 const state:ObjectValue={};
 for(const [key,value] of Object.entries(section.state)){
  if(omitted.has(key))continue;
  if(!Object.hasOwn(store.defaults,key)||typeof store.defaults[key]==='function'||!sameType(store.defaults[key],value))throw new Error(`${store.label} : champ invalide (${key}).`);
  state[key]=value;
 }
 // In particular, refuse malformed reader positions and arrays that could break the reader.
 for(const key of ['currentPage','lastKhatmPage'])if(key in state&&(!Number.isInteger(state[key])||Number(state[key])<1||Number(state[key])>604))throw new Error('Numéro de page invalide.');
 for(const key of ['currentSurah','lastKhatmSurah'])if(key in state&&(!Number.isInteger(state[key])||Number(state[key])<1||Number(state[key])>114))throw new Error('Numéro de sourate invalide.');
 for(const key of ['validatedPages','autoExcludedPages'])if(Array.isArray(state[key])&&state[key].some(p=>!Number.isInteger(p)||Number(p)<1||Number(p)>604))throw new Error('Progression du Khatm invalide.');
 if(store.key==='quran-coach-favorites'){
  for(const key of ['favorites','favoriteHadiths','favoriteDuas','collections'])if(Array.isArray(state[key])&&state[key].some(v=>!record(v)))throw new Error('Favori invalide.');
 }
 validateProgressRecords(store.key,state);
 return {state,version:store.version};
}
function validateProgressRecords(key:string,state:ObjectValue){
 const fail=()=>{throw new Error(`${BACKUP_LABELS[key]||key} : une entrée est invalide.`);};
 const fields=(value:Json,shape:Record<string,string>)=>record(value)&&Object.entries(shape).every(([k,t])=>typeof value[k]===t);
 const eachMap=(name:string,check:(v:Json)=>boolean)=>{if(state[name]!==undefined&&(!record(state[name])||Object.values(state[name]).some(v=>!check(v))))fail();};
 const eachArray=(name:string,check:(v:Json)=>boolean)=>{if(state[name]!==undefined&&(!Array.isArray(state[name])||state[name].some(v=>!check(v))))fail();};
 const position=(v:Json)=>record(v)&&Number.isInteger(v.surah)&&Number(v.surah)>=1&&Number(v.surah)<=114&&Number.isInteger(v.ayah)&&Number(v.ayah)>=1&&Number(v.ayah)<=286;
 if(key==='qc-book-notebook-v1')eachArray('entries',v=>fields(v,{id:'string',bookId:'string',version:'string',chapterId:'string',passageId:'string',text:'string',note:'string',createdAt:'number'})&&record(v)&&Array.isArray(v.sources)&&v.sources.every(x=>typeof x==='string')&&(v.audioId===undefined||typeof v.audioId==='string')&&(v.seconds===undefined||(typeof v.seconds==='number'&&v.seconds>=0)));
 if(key==='qc-audio-library-v1'){eachMap('bookReadingPoints',v=>fields(v,{chapterId:'string',passageId:'string',version:'string',updatedAt:'number'})&&record(v)&&(v.previousPassageId===undefined||typeof v.previousPassageId==='string'));eachArray('favorites',v=>typeof v==='string');eachMap('positions',v=>fields(v,{seconds:'number',updatedAt:'number'})&&Number((v as ObjectValue).seconds)>=0);}
 if(key==='quran-coach-reader-notes')eachMap('notes',v=>position(v)&&fields(v,{text:'string',kind:'string',updatedAt:'number',page:'number'}));
 if(key==='quran-coach-reading-bookmark'){
  const valid=(v:Json)=>position(v)&&fields(v,{view:'string',precision:'string',savedAt:'number',page:'number'})&&Number((v as ObjectValue).page)>=1&&Number((v as ObjectValue).page)<=604;
  if(state.bookmark!==undefined&&state.bookmark!==null&&!valid(state.bookmark))fail();eachArray('bookmarks',valid);
 }
 if(key==='quran-coach-favorites'){
  eachArray('favorites',v=>fields(v,{number:'number',surah:'number',numberInSurah:'number',text:'string',addedAt:'number'}));
  eachArray('favoriteHadiths',v=>fields(v,{id:'number',ar:'string',fr:'string',src:'string',nar:'string',cat:'string',addedAt:'number'}));
  eachArray('favoriteDuas',v=>fields(v,{chapterId:'string',duaId:'number',arabic:'string',translation:'string',source:'string',chapterTitle:'string',addedAt:'number'}));
  eachArray('collections',v=>fields(v,{id:'string',name:'string',createdAt:'number'}));
  eachMap('annotations',v=>fields(v,{note:'string'})&&Array.isArray((v as ObjectValue).collectionIds)&&((v as ObjectValue).collectionIds as Json[]).every(x=>typeof x==='string'));
 }
 if(key==='quran-coach-srs')eachMap('cards',v=>position(v)&&fields(v,{id:'string',easeFactor:'number',interval:'number',repetitions:'number',nextReviewDate:'string',addedDate:'string'}));
 if(key==='academy-store'){
  eachMap('notes',v=>typeof v==='string');
  eachMap('progress',v=>fields(v,{completed:'boolean',score:'number'}));
  eachMap('notebook',v=>fields(v,{understood:'string',distinction:'string',example:'string',review:'string',updatedAt:'number'}));
 }
 if(key==='qc-arabic-learning-v1')eachMap('drafts',v=>fields(v,{stage:'number',complete:'boolean',application:'boolean'})&&record((v as ObjectValue).answers));
 if(key==='quran-coach-editorial-journeys'){
  eachMap('notes',v=>fields(v,{text:'string',lesson:'string',action:'string',done:'boolean',updatedAt:'number'}));
  eachMap('progress',v=>fields(v,{step:'string',sentence:'number',seconds:'number',updatedAt:'number'})&&Array.isArray((v as ObjectValue).completed));
 }
}
export function createBackup(stores:BackupStore[],storage:Storage=localStorage):ProgressBackup{
 const sections:Record<string,BackupSection>={};
 for(const store of stores){const raw=storage.getItem(store.key);if(!raw)continue;const section=JSON.parse(raw);validateJson(section);sections[store.key]=cleanSection(section,store);}
 return {format:'quran-coach-progress',version:1,createdAt:new Date().toISOString(),sections};
}
export function parseBackup(text:string,stores:BackupStore[],allowEmpty=false):ProgressBackup{
 if(new Blob([text]).size>BACKUP_LIMIT)throw new Error('Ce fichier dépasse la taille maximale de 24 Mio.');
 const raw:unknown=JSON.parse(text);validateJson(raw);
 if(!record(raw)||raw.format!=='quran-coach-progress'||raw.version!==1||typeof raw.createdAt!=='string'||!Number.isFinite(Date.parse(raw.createdAt))||!record(raw.sections))throw new Error('Ce fichier n’est pas une sauvegarde Quran Coach compatible.');
 const sections:Record<string,BackupSection>={};
 for(const [key,value] of Object.entries(raw.sections)){const store=stores.find(s=>s.key===key);if(!store)throw new Error('Cette sauvegarde contient une rubrique inconnue. Mettez l’application à jour.');sections[key]=cleanSection(value,store);}
 if(!allowEmpty&&!Object.keys(sections).length)throw new Error('Cette sauvegarde est vide.');
 return {format:'quran-coach-progress',version:1,createdAt:raw.createdAt,sections};
}
const equal=(a:Json|undefined,b:Json|undefined)=>JSON.stringify(a)===JSON.stringify(b);
const unionFields=new Set(['favorites','favoriteHadiths','favoriteDuas','collections','bookmarks','attempts','entries','history','notes','unlockedModules','validatedPages','autoExcludedPages','activeDays','done','completed','later']);
function itemId(v:Json):string|undefined{
 if(!record(v))return typeof v==='string'||typeof v==='number'?`${typeof v}:${v}`:undefined;
 if('duaId'in v&&'chapterId'in v)return `dua:${v.chapterId}:${v.duaId}`;
 for(const k of ['id','key','number'])if(typeof v[k]==='string'||typeof v[k]==='number')return `${k}:${v[k]}`;
 return undefined;
}
/** Keep independent entries; conflicting values are resolved by an explicit section preference. */
export function mergeProgress(a:Json,b:Json,prefer:'device'|'file',field=''):Json{
 if(equal(a,b))return a;
 if(record(a)&&record(b)){
  // Structured attempts/cards are atomic: do not combine their score, due date and answers.
  if(['id','updatedAt','savedAt','at','completedAt','due','nextReviewDate'].some(k=>k in a||k in b))return prefer==='file'?b:a;
  const out:ObjectValue={...a};for(const [key,value] of Object.entries(b))out[key]=Object.hasOwn(a,key)?mergeProgress(a[key],value,prefer,key):value;return out;
 }
 if(Array.isArray(a)&&Array.isArray(b)&&unionFields.has(field)){
  const ids=[...a,...b].map(itemId);if(ids.every(Boolean)){
   const values=new Map<string,Json>();for(const item of (prefer==='file'?[...a,...b]:[...b,...a]))values.set(itemId(item)!,item);return [...values.values()];
  }
 }
 return prefer==='file'?b:a;
}
export function mergedSection(key:string,a:BackupSection|undefined,b:BackupSection,prefer:'device'|'file'):BackupSection{
 if(!a)return b;
 // Different Khatm cycles cannot be unioned; retain both originals in the recovery file.
 if(key==='quran-coach-khatm'&&(a.state.startDate!==b.state.startDate||a.state.endDate!==b.state.endDate))return prefer==='file'?b:a;
 const state=mergeProgress(a.state,b.state,prefer) as ObjectValue;
 if(key==='quran-coach-khatm'){
  const excluded=new Set((prefer==='file'?b:a).state.autoExcludedPages as number[]||[]);
  state.validatedPages=(state.validatedPages as number[]||[]).filter(p=>!excluded.has(p)).sort((x,y)=>x-y);
  state.autoExcludedPages=[...excluded];
  if((state.validatedPages as number[]).length!==604)state.completedAt=null;
 }
 return {version:b.version,state};
}
export function backupPreview(backup:ProgressBackup,stores:BackupStore[],storage:Storage=localStorage){
 const current=createBackup(stores,storage);
 return Object.entries(backup.sections).map(([key,value])=>({key,label:BACKUP_LABELS[key],fields:Object.keys(value.state).length,conflict:!!current.sections[key]&&!equal(current.sections[key].state,value.state),same:!!current.sections[key]&&equal(current.sections[key].state,value.state)}));
}
export async function restoreBackup(backup:ProgressBackup,stores:BackupStore[],choices:Record<string,'device'|'file'|'skip'>,storage:Storage=localStorage){
 // Revalidate immediately before the write, not just at file selection.
 const valid=parseBackup(JSON.stringify(backup),stores),current=createBackup(stores,storage);
 const keys=Object.keys(valid.sections).filter(k=>choices[k]!=='skip');
 if(!keys.length)throw new Error('Sélectionnez au moins une rubrique.');
 const before=Object.fromEntries(keys.map(k=>[k,storage.getItem(k)]));
 // A copy of BOTH inputs remains available, including non-selected conflicting values.
 storage.setItem(RECOVERY_KEY,JSON.stringify({before,received:valid,createdAt:new Date().toISOString()}));
 try{
  for(const key of keys)storage.setItem(key,JSON.stringify(mergedSection(key,current.sections[key],valid.sections[key],choices[key]==='file'?'file':'device')));
 }catch(error){for(const [key,value] of Object.entries(before))value===null?storage.removeItem(key):storage.setItem(key,value);throw error;}
 for(const store of stores.filter(s=>keys.includes(s.key)))await store.rehydrate();
}
export async function undoRestore(stores:BackupStore[],storage:Storage=localStorage){
 const raw=storage.getItem(RECOVERY_KEY);if(!raw)throw new Error('Aucune importation à annuler.');
 const {before}=JSON.parse(raw) as {before:Record<string,string|null>};
 for(const [key,value] of Object.entries(before))if(stores.some(s=>s.key===key))value===null?storage.removeItem(key):storage.setItem(key,value);
 for(const store of stores.filter(s=>Object.hasOwn(before,s.key))){if(before[store.key]===null){store.reset?.();storage.removeItem(store.key);}else await store.rehydrate();}
}
export function downloadBackup(backup:ProgressBackup){
 const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=`quran-coach-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
