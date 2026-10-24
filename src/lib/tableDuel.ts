import {QURAN_VOCABULARY} from '../data/quranVocabulary';
import {MEMORY_PACKS} from '../data/quizGames';
import {learningBank} from './quizLearning';
export type TableMode='vocabulary'|'association'|'true-false'|'academy';
export interface TableRound {id:string;prompt:string;arabic?:string;choices:string[];correct:number[];pairs?:string[];explanation:string;source?:{label:string;href:string}}
export interface TableDuel {version:1;mode:TableMode;names:[string,string];rounds:TableRound[];index:number;answers:[number[]|null,number[]|null];scores:[number,number];ready:[boolean,boolean];phase:'answer'|'reveal'|'finished';paused:boolean}
const shuffle=<T,>(items:T[],random:()=>number)=>{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
export function tableRounds(mode:TableMode,count=6,random:()=>number=Math.random):TableRound[]{
 if(mode==='academy')return shuffle(learningBank().filter(q=>q.context?.type==='academy'&&q.format==='choice'&&q.choices.length>=2),random).slice(0,count).map(q=>({id:q.id,prompt:q.questionFr,arabic:q.questionAr,choices:q.choices,correct:[q.correctIndex],explanation:q.explanation||'',source:q.sourceLink}));
 const ids=new Set(MEMORY_PACKS.flatMap(p=>p.ids));
 const words=[...new Map(QURAN_VOCABULARY.filter(w=>ids.has(w.id)&&w.examples.length).map(w=>[w.meaningFr,w])).values()];
 return shuffle(words,random).slice(0,count).map((word,index)=>{
  const ref=word.examples[0],source={label:`Exemple coranique · ${ref.surah}:${ref.ayah}`,href:`/read?surah=${ref.surah}&ayah=${ref.ayah}`};
  const others=shuffle(words.filter(w=>w.id!==word.id),random);
  if(mode==='association'){
   const group=[word,...others.slice(0,2)],choices=shuffle(group.map(w=>w.meaningFr),random);
   return {id:`pairs-${word.id}`,prompt:'Reliez chacun des trois mots à son sens.',pairs:group.map(w=>w.arabic),choices,correct:group.map(w=>choices.indexOf(w.meaningFr)),explanation:group.map(w=>`${w.arabic} : ${w.meaningFr}`).join('\n'),source};
  }
  if(mode==='true-false'){
   const correct=random()>=.5,meaning=correct?word.meaningFr:others[0].meaningFr;
   return {id:`truth-${word.id}-${index}`,prompt:`Ce mot peut signifier « ${meaning} ».`,arabic:word.arabic,choices:['Vrai','Faux'],correct:[correct?0:1],explanation:`${word.arabic} : ${word.meaningFr}.`,source};
  }
  const choices=shuffle([word.meaningFr,...others.slice(0,3).map(w=>w.meaningFr)],random);
  return {id:`word-${word.id}`,prompt:'Quel sens correspond à ce mot ?',arabic:word.arabic,choices,correct:[choices.indexOf(word.meaningFr)],explanation:`${word.arabic} : ${word.meaningFr}.`,source};
 });
}
export function startTableDuel(mode:TableMode,names:[string,string],rounds=tableRounds(mode)):TableDuel {
 return {version:1,mode,names:names.map((n,i)=>n.trim().slice(0,24)||`Joueur ${i+1}`) as [string,string],rounds,index:0,answers:[null,null],scores:[0,0],ready:[false,false],phase:rounds.length?'answer':'finished',paused:false};
}
export type TableAction={type:'submit';player:0|1;answer:number[]}|{type:'ready';player:0|1}|{type:'pause'}|{type:'resume'};
export function tableDuelReducer(state:TableDuel,action:TableAction):TableDuel {
 if(action.type==='pause')return {...state,paused:true};
 if(action.type==='resume')return {...state,paused:false};
 if(state.paused||state.phase==='finished')return state;
 if(action.type==='ready'){
  if(state.phase!=='reveal')return state;
  const ready=[...state.ready] as [boolean,boolean];ready[action.player]=true;
  if(!ready.every(Boolean))return {...state,ready};
  return state.index+1===state.rounds.length?{...state,ready,phase:'finished'}:{...state,index:state.index+1,answers:[null,null],ready:[false,false],phase:'answer'};
 }
 const round=state.rounds[state.index];
 if(state.phase!=='answer'||state.answers[action.player]!==null||action.answer.length!==round.correct.length||action.answer.some(n=>!Number.isInteger(n)||n<0||n>=round.choices.length)||round.pairs&&new Set(action.answer).size!==action.answer.length)return state;
 const answers=[...state.answers] as TableDuel['answers'];answers[action.player]=[...action.answer];
 if(answers.some(a=>a===null))return {...state,answers};
 const scores=state.scores.map((score,p)=>score+(round.correct.every((correct,i)=>answers[p]![i]===correct)?1:0)) as [number,number];
 return {...state,answers,scores,phase:'reveal'};
}
export function readTableDuel(raw:string|null):TableDuel|null {
 try{
  const state=JSON.parse(raw||'null') as TableDuel|null;
  if(!state||state.version!==1||!['vocabulary','association','true-false','academy'].includes(state.mode)||!Array.isArray(state.names)||state.names.length!==2||state.names.some(n=>typeof n!=='string')||!Array.isArray(state.rounds)||state.rounds.length<1||state.rounds.length>12||!Number.isInteger(state.index)||state.index<0||state.index>=state.rounds.length||!['answer','reveal','finished'].includes(state.phase))return null;
  if(state.rounds.some(r=>!r||typeof r.prompt!=='string'||!Array.isArray(r.choices)||r.choices.length<2||r.choices.some(c=>typeof c!=='string')||!Array.isArray(r.correct)||r.correct.length!==(r.pairs?.length||1)||r.correct.some(n=>!Number.isInteger(n)||n<0||n>=r.choices.length)))return null;
  if(!Array.isArray(state.answers)||state.answers.length!==2||state.answers.some(a=>a!==null&&(!Array.isArray(a)||a.some(n=>!Number.isInteger(n))))||!Array.isArray(state.scores)||state.scores.length!==2||state.scores.some(s=>!Number.isInteger(s)||s<0)||!Array.isArray(state.ready)||state.ready.length!==2||state.ready.some(r=>typeof r!=='boolean'))return null;
  return {...state,paused:true};
 }catch{return null;}
}
