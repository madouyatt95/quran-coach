import {SARF_FAMILIES} from '../arabic/sarfData';
import {SENTENCES} from '../arabic/sentenceData';
import {SURAH_JOURNEYS,canonicalWords} from '../arabic/journeyData';
import {chapterBooks} from './storyChapters';
import {QURAN_VOCABULARY} from './quranVocabulary';
import type {LearningQuestion} from '../lib/quizLearning';
import {CHAPTERS} from '../lib/interactiveMushaf/model';

export const ROOT_PACKS=[
 {id:'guided',title:'Premiers liens · racines visibles',guided:true},
 {id:'independent',title:'À toi de reconnaître les racines',guided:false},
];
export const SENTENCE_PACKS=[
 {id:'nominal',title:'Décrire : la phrase nominale',ids:['door-open','student-present']},
 {id:'verbal',title:'Qui fait quoi ? La phrase verbale',ids:['student-opens','teacher-writes']},
 {id:'groups',title:'Relier : lieu et possession',ids:['in-mosque','toward-house','house-door','teacher-pen']},
 {id:'all',title:'Les huit constructions · sans les étiquettes',ids:SENTENCES.map(t=>t.id)},
];
// Distinct forms from the existing Sarf lessons. No Quran text is recomposed.
export const DOMINO_WORDS=SARF_FAMILIES.map(f=>[f.forms.find(w=>w.aspect==='past'&&w.voice==='active'&&w.person==='he')||f.forms[0],...f.participles]);
export const DOMINO_EDGES=[[0,1],[1,2],[2,0],[0,2],[2,1],[1,0]] as const;
export const dominoTile=(index:number)=>DOMINO_EDGES[index].map((family,side)=>({family,...DOMINO_WORDS[family][(index+side)%3]}));
export const verseAudio=(surah:number,ayah:number)=>`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${CHAPTERS.slice(0,surah-1).reduce((n,c)=>n+c.count,0)+ayah}.mp3`;
export interface ExpeditionStage {title:string;paths:[{label:string;question:LearningQuestion},{label:string;question:LearningQuestion}]}
export interface Expedition {id:string;title:string;description:string;stages:ExpeditionStage[]}
const yusuf=chapterBooks['prophet:yusuf'];
const vocabulary=[94,375,465,533].map(id=>QURAN_VOCABULARY.find(w=>w.id===id)!);
const qbase={theme:'verses' as const,stage:'understand' as const,format:'choice' as const};
export const EXPEDITIONS:Expedition[]=[
 {id:'yusuf',title:'Yusuf · les fils du récit',description:'Quatre étapes : choisis le récit ou les mots de la sourate.',stages:yusuf.chapters.map((c,i)=>{
  const w=vocabulary[i],ex=w.examples.find(e=>e.surah===12)!;
  const [surah,ayah]=c.reading.split(/[:-]/).map(Number);
  return {title:c.title,paths:[
   {label:'📖 Comprendre le récit',question:{...qbase,id:`exp-yusuf-story-${i}`,theme:'prophets',format:'passage',questionFr:c.question,choices:c.options,correctIndex:c.answer,passage:c.text,explanation:c.explanation,verseRef:{surah,ayah},sourceLink:{label:`Relire ${c.reference}`,href:`/read?surah=${surah}&ayah=${ayah}`}}},
   {label:'🔎 Découvrir un mot',question:{...qbase,id:`exp-yusuf-word-${i}`,questionFr:'Quel sens correspond à ce mot du lexique ?',questionAr:w.arabic,choices:vocabulary.map(v=>v.meaningFr),correctIndex:i,explanation:`${w.arabic} : ${w.meaningFr}. ${ex.contextFr}`,verseRef:{surah:12,ayah:ex.ayah},sourceLink:{label:`Le mot dans son contexte · 12:${ex.ayah}`,href:`/read?surah=12&ayah=${ex.ayah}`}}},
  ]};
 })},
 {id:'short-surahs',title:'À la découverte des dernières sourates',description:'Choisis une sourate à chaque étape, écoute et observe sa construction.',stages:SURAH_JOURNEYS[0].verses.map((_,i)=>({title:['La demande','La relation','Le verbe','Les mots liés'][i],paths:[SURAH_JOURNEYS[0],SURAH_JOURNEYS[1]].map(j=>{const v=j.verses[i];const [surah,ayah]=v.key.split(':').map(Number);return {label:`🎧 ${j.title} · ${v.key}`,question:{...qbase,id:`exp-grammar-${v.key}`,format:'audio' as const,questionFr:v.question,questionAr:canonicalWords(v.key).join(' '),choices:v.options,correctIndex:v.answer,explanation:v.explanation,verseRef:{surah,ayah},audioUrl:verseAudio(surah,ayah),sourceLink:{label:'Explorer la grammaire du passage',href:`/read?surah=${surah}&ayah=${ayah}`}}};}) as ExpeditionStage['paths']}))},
 {id:'language',title:'Les clés de la phrase arabe',description:'Quatre étapes pour passer des mots aux relations entre eux.',stages:[0,2,4,6].map((offset,i)=>({title:['Décrire','Agir','Situer','Préciser'][i],paths:SENTENCES.slice(offset,offset+2).map(t=>({label:t.meaning,question:{...qbase,id:`exp-sentence-${t.id}`,questionFr:`Dans cet exemple, quel mot remplit la fonction « ${t.slots[0].label} » ?`,questionAr:t.slots.map(s=>t.words.find(w=>w.id===s.word)!.text).join(' '),choices:t.words.map(w=>w.text),correctIndex:t.words.findIndex(w=>w.id===t.slots[0].word),explanation:t.explanation,sourceLink:{label:'Continuer dans l’Académie',href:'/academy/arabic'},passage:'Exemple pédagogique hors verset.'}})) as ExpeditionStage['paths']}))},
];
