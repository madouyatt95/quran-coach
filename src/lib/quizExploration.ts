import {ROOT_PACKS,SENTENCE_PACKS,EXPEDITIONS,DOMINO_EDGES} from '../data/quizExploration';
import {SENTENCES,placeWord,sentenceCorrect} from '../arabic/sentenceData';
import {shuffledIndices} from './quizPedagogy';
import type {GameAction} from './quizGames';
interface Base {edition:number;id:string;finished:boolean;attempts:number;hints:number;message:string}
export interface RootsGame extends Base {kind:'roots';cards:number[];chain:{tile:number;flipped:boolean}[];guided:boolean;help:boolean}
export interface SentenceGame extends Base {kind:'sentences';tasks:string[];index:number;placed:(string|null)[];active:number;checked:boolean;help:boolean;guided:boolean;cards:number[][];results:{id:string;attempts:number;help:boolean}[];roundAttempts:number}
export interface ExpeditionGame extends Base {kind:'expedition';index:number;branch:number|null;choice:number|null;correct:boolean|null;heard:boolean;assisted:boolean;choices:number[][][];results:{branch:number;correct:boolean;assisted:boolean}[]}
export type ExplorationGame=RootsGame|SentenceGame|ExpeditionGame;
export type ExplorationAction={type:'undo'}|{type:'slot';index:number}|{type:'place';word:string}|{type:'branch';index:number}|{type:'text-help'};
export function createExploration(kind:ExplorationGame['kind'],id:string,random=Math.random):ExplorationGame|null {
 const b={edition:1,id,finished:false,attempts:0,hints:0,message:''};
 if(kind==='roots'){const p=ROOT_PACKS.find(p=>p.id===id);return p?{...b,kind,cards:shuffledIndices(DOMINO_EDGES.length,random),chain:[],guided:p.guided,help:false}:null;}
 if(kind==='sentences'){const p=SENTENCE_PACKS.find(p=>p.id===id);return p?{...b,kind,tasks:p.ids,index:0,placed:SENTENCES.find(t=>t.id===p.ids[0])!.slots.map(()=>null),active:0,checked:false,help:false,guided:id!=='all',cards:p.ids.map(id=>shuffledIndices(SENTENCES.find(t=>t.id===id)!.words.length,random)),results:[],roundAttempts:0}:null;}
 const p=EXPEDITIONS.find(p=>p.id===id);return p?{...b,kind,index:0,branch:null,choice:null,correct:null,heard:false,assisted:false,choices:p.stages.map(s=>s.paths.map(p=>shuffledIndices(p.question.choices.length,random))),results:[]}:null;
}
export function dominoEnd(g:RootsGame){const last=g.chain.at(-1);return last?DOMINO_EDGES[last.tile][last.flipped?0:1]:0;}
export function reduceExploration(g:ExplorationGame,a:GameAction):ExplorationGame {
 if(g.finished)return g;
 if(g.kind==='roots'){
  if(a.type==='undo')return {...g,chain:g.chain.slice(0,-1),message:'Dernier domino retiré.'};
  if(a.type==='hint')return g.help?g:{...g,help:true,hints:g.hints+1,message:'Les racines sont visibles. Relie les deux extrémités de même famille.'};
  if(a.type!=='toggle'||!g.cards.includes(a.index)||g.chain.some(c=>c.tile===a.index))return g;
  const edge=DOMINO_EDGES[a.index],end=dominoEnd(g);
  if(!edge.includes(end as never))return {...g,attempts:g.attempts+1,message:'Aucune extrémité de ce domino ne partage la racine attendue.'};
  const chain=[...g.chain,{tile:a.index,flipped:edge[0]!==end}];
  return {...g,chain,attempts:g.attempts+1,finished:chain.length===g.cards.length,message:'Lien trouvé : même racine, formes et sens à comparer.'};
 }
 if(g.kind==='sentences'){
  const task=SENTENCES.find(t=>t.id===g.tasks[g.index])!;
  if(a.type==='slot'&&Number.isInteger(a.index)&&a.index>=0&&a.index<g.placed.length&&!g.checked)return {...g,active:a.index};
  if(a.type==='hint')return g.help?g:{...g,help:true,hints:g.hints+1};
  if(a.type==='reset-selection'&&!g.checked)return {...g,placed:task.slots.map(()=>null),active:0,message:''};
  if(a.type==='place'&&task.words.some(w=>w.id===a.word)&&!g.checked){const placed=placeWord(g.placed,g.active,a.word),next=placed.findIndex(p=>p===null);return {...g,placed,active:next<0?g.active:next,message:''};}
  if(a.type==='check'&&g.placed.every(Boolean)&&!g.checked){const correct=sentenceCorrect(task,g.placed);return {...g,checked:correct,attempts:g.attempts+1,roundAttempts:g.roundAttempts+1,message:correct?task.explanation:'La construction attendue n’est pas encore retrouvée. Vérifie les fonctions et les terminaisons.'};}
  if(a.type==='next'&&g.checked){const index=g.index+1,finished=index===g.tasks.length;return {...g,index:finished?g.index:index,finished,placed:finished?g.placed:SENTENCES.find(t=>t.id===g.tasks[index])!.slots.map(()=>null),active:0,checked:false,help:false,message:'',roundAttempts:0,results:[...g.results,{id:task.id,attempts:g.roundAttempts,help:g.help}]};}
  return g;
 }
 const stage=EXPEDITIONS.find(p=>p.id===g.id)!.stages[g.index];
 if(a.type==='branch'&&g.branch===null&&[0,1].includes(a.index))return {...g,branch:a.index};
 if(g.branch===null)return g;
 const q=stage.paths[g.branch].question;
 if(a.type==='heard'&&g.correct===null)return {...g,heard:true};
 if(a.type==='text-help'&&g.correct===null&&q.format==='audio')return g.assisted?g:{...g,assisted:true,hints:g.hints+1};
 if(a.type==='answer'&&g.correct===null&&Number.isInteger(a.index)&&a.index>=0&&a.index<q.choices.length&&(q.format!=='audio'||g.heard||g.assisted))return {...g,choice:a.index,correct:a.index===q.correctIndex,attempts:g.attempts+1,message:q.explanation||''};
 if(a.type==='next'&&g.correct!==null){const finished=g.index+1===EXPEDITIONS.find(p=>p.id===g.id)!.stages.length;return {...g,finished,index:finished?g.index:g.index+1,branch:null,choice:null,correct:null,heard:false,assisted:false,message:'',results:[...g.results,{branch:g.branch,correct:g.correct,assisted:g.assisted}]};}
 return g;
}
