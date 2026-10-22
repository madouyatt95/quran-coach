import {createExploration,reduceExploration,type ExplorationGame,type ExplorationAction} from './quizExploration';
import {FAMILY_BOARDS,MEMORY_PACKS,DESCRIBE_CARDS,STORY_GAMES,escapeSteps,type GameKind} from '../data/quizGames';
import {chapterBooks} from '../data/storyChapters';
import {generateAudioQuestions} from './quizEngine';
import {shuffledIndices} from './quizPedagogy';
import {CHAPTERS} from './interactiveMushaf/model';
const mix=<T,>(items:T[],random=Math.random)=>shuffledIndices(items.length,random).map(i=>items[i]);
export const GAME_EDITION=1;
interface Base {edition:number;kind:GameKind;id:string;finished:boolean;attempts:number;hints:number;message:string}
export interface FamiliesGame extends Base {kind:'families';cards:number[];selected:number[];solved:number[];hinted:number[]}
export interface MemoryGame extends Base {kind:'memory';cards:{word:number;side:'ar'|'fr'}[];open:number[];matched:number[]}
export interface StoryGame extends Base {kind:'story';cards:number[];order:number[];stage:'order'|'meaning';index:number;choice:number|null;unlocked:boolean;choices:number[][]}
export interface EscapeGame extends Base {kind:'escape';order:number[];cards:number[];index:number;choice:number|null;unlocked:boolean;hinted:boolean;choices:number[][]}
export const mysteryBank=generateAudioQuestions;
export interface MysteryGame extends Base {kind:'mystery';rounds:number[];index:number;level:number;heard:boolean;guesses:number[];solved:boolean;revealed:boolean;results:{surah:number;correct:boolean;attempts:number;hints:number}[];advanced:boolean;choices:number[][]}
export interface DescribeGame extends Base {kind:'describe';deck:number[];index:number;phase:'handoff'|'active'|'review';remaining:number|null;lastTick:number|null;found:boolean;results:{card:number;found:boolean;reason:string}[];seconds:number}
export type SavedGame=ExplorationGame|FamiliesGame|MemoryGame|StoryGame|EscapeGame|MysteryGame|DescribeGame;
export type GameAction=ExplorationAction
 |{type:'toggle';index:number}|{type:'check'}|{type:'hint'}|{type:'reset-selection'}
 |{type:'answer';index:number}|{type:'next'}|{type:'reveal'}|{type:'heard'}
 |{type:'ready';now:number}|{type:'tick';now:number}|{type:'pause';now:number}|{type:'describe-result';found:boolean;reason:string;now:number};
function base(kind:GameKind,id:string):Base{return {edition:GAME_EDITION,kind,id,finished:false,attempts:0,hints:0,message:''};}
export function createGame(kind:GameKind,id:string,options:{advanced?:boolean;seconds?:number}={},random=Math.random):SavedGame|null{
 const b=base(kind,id);
 switch(kind){
 case 'roots':case 'sentences':case 'expedition':return createExploration(kind,id,random);
 case 'families':{const board=FAMILY_BOARDS.find(b=>b.id===id);return board?{...b,kind,cards:mix(board.groups.flatMap(g=>g.ids),random),selected:[],solved:[],hinted:[]}:null;}
 case 'memory':{const pack=MEMORY_PACKS.find(p=>p.id===id);return pack?{...b,kind,cards:mix(pack.ids.flatMap(word=>[{word,side:'ar' as const},{word,side:'fr' as const}]),random),open:[],matched:[]}:null;}
 case 'story':{const book=chapterBooks[id];return book&&STORY_GAMES.some(g=>g.id===id)?{...b,kind,cards:mix(book.chapters.map((_,i)=>i),random),order:[],stage:'order',index:0,choice:null,unlocked:false,choices:book.chapters.map(c=>shuffledIndices(c.options.length,random))}:null;}
 case 'escape':{const steps=escapeSteps(id);return steps.length?{...b,kind,order:[],cards:shuffledIndices(steps.length,random),index:0,choice:null,unlocked:false,hinted:false,choices:steps.map(q=>shuffledIndices(q.choices.length,random))}:null;}
 case 'mystery':{const bank=mysteryBank();const rounds=mix(bank.map((_,i)=>i),random).slice(0,5);return {...b,kind,id:'session',rounds,index:0,level:0,heard:false,guesses:[],solved:false,revealed:false,results:[],advanced:!!options.advanced,choices:rounds.map(i=>{const q=bank[i];const others=mix(bank.filter(o=>o.verseRef!.surah!==q.verseRef!.surah),random).slice(0,3);return mix([q,...others].map(q=>q.verseRef!.surah),random);})};}
 case 'describe':return {...b,kind,id:'session',deck:mix(DESCRIBE_CARDS.map((_,i)=>i),random).slice(0,10),index:0,phase:'handoff',remaining:null,lastTick:null,seconds:[60,90].includes(options.seconds||0)?options.seconds!:0,found:false,results:[]};
 }
}
export function mysteryTarget(g:MysteryGame){const ref=mysteryBank()[g.rounds[g.index]].verseRef!;return {surah:ref.surah,ayah:Math.min(CHAPTERS[ref.surah-1].count,ref.ayah+g.level)};}
/** Same direct Alafasy CDN as the existing audio quiz; global IDs follow canonical chapter counts. */
export function mysteryAudioUrl(g:MysteryGame){const target=mysteryTarget(g);const global=CHAPTERS.slice(0,target.surah-1).reduce((sum,c)=>sum+c.count,0)+target.ayah;return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${global}.mp3`;}
export function mysteryMaxLevel(g:MysteryGame){const ref=mysteryBank()[g.rounds[g.index]].verseRef!;return Math.min(2,CHAPTERS[ref.surah-1].count-ref.ayah);}
const validIndex=(n:number,count:number)=>Number.isInteger(n)&&n>=0&&n<count;
function describeTick(g:DescribeGame,now:number):DescribeGame{
 if(g.phase!=='active'||g.lastTick===null||g.remaining===null)return g;
 const remaining=Math.max(0,g.remaining-Math.max(0,now-g.lastTick));
 return remaining===0?{...g,remaining:0,lastTick:null,phase:'review',found:false,message:'Temps écoulé. Découvrez le mot et son sens.'}:{...g,remaining,lastTick:now};
}
/** Every game transition validates its input; answers are graded against the immutable local content. */
export function reduceGame(game:SavedGame,action:GameAction):SavedGame{
 if(game.finished||game.edition!==GAME_EDITION)return game;
 switch(game.kind){
 case 'roots':case 'sentences':case 'expedition':return reduceExploration(game,action);
 case 'families':{
  const g=game,board=FAMILY_BOARDS.find(b=>b.id===g.id)!;
  if(action.type==='toggle'&&g.cards.includes(action.index)&&!g.solved.some(i=>board.groups[i].ids.includes(action.index))){const selected=g.selected.includes(action.index)?g.selected.filter(i=>i!==action.index):g.selected.length<4?[...g.selected,action.index]:g.selected;return {...g,selected,message:''};}
  if(action.type==='reset-selection')return {...g,selected:[],message:''};
  if(action.type==='hint'){const i=board.groups.findIndex((_,i)=>!g.solved.includes(i)&&!g.hinted.includes(i));return i<0?g:{...g,hints:g.hints+1,hinted:[...g.hinted,i],message:`Cherche une famille : ${board.groups[i].title}.`};}
  if(action.type==='check'&&g.selected.length===4){const i=board.groups.findIndex(group=>g.selected.every(id=>group.ids.includes(id)));if(i>=0&&!g.solved.includes(i)){const solved=[...g.solved,i];return {...g,solved,selected:[],attempts:g.attempts+1,finished:solved.length===4,message:board.groups[i].why};}const close=board.groups.some(group=>g.selected.filter(id=>group.ids.includes(id)).length===3);return {...g,attempts:g.attempts+1,message:close?'Trois cartes vont ensemble. Laquelle changer ?':'Ces quatre cartes ne forment pas une famille de cette grille. Réessaie.'};}return g;
 }
 case 'memory':{
  const g=game;
  if(action.type==='next'&&g.open.length===2)return {...g,open:[],message:''};
  if(action.type!=='toggle'||g.open.length===2||!validIndex(action.index,g.cards.length)||g.open.includes(action.index)||g.matched.includes(g.cards[action.index].word))return g;
  const open=[...g.open,action.index];if(open.length<2)return {...g,open};
  const [a,b]=open.map(i=>g.cards[i]);const match=a.word===b.word&&a.side!==b.side;const matched=match?[...g.matched,a.word]:g.matched;
  return {...g,open,matched,attempts:g.attempts+1,finished:matched.length===g.cards.length/2,message:match?'Une paire retrouvée ! Découvre le mot avant de continuer.':'Deux sens différents. Observe les cartes avant de les retourner.'};
 }
 case 'story':{
  const g=game,chapters=chapterBooks[g.id].chapters;
  if(g.stage==='order'){
   if(action.type==='toggle'&&validIndex(action.index,chapters.length))return {...g,order:g.order.includes(action.index)?g.order.filter(i=>i!==action.index):[...g.order,action.index],message:''};
   if(action.type==='reset-selection')return {...g,order:[],message:''};
   if(action.type==='hint'&&g.hints===0)return {...g,hints:g.hints+1,message:`Le parcours commence par : ${chapters[0].title}.`};
   if(action.type==='check'&&g.order.length===chapters.length){const correct=g.order.every((v,i)=>v===i);return {...g,attempts:g.attempts+1,stage:correct?'meaning':'order',message:correct?'Le fil du récit est retrouvé. Relie maintenant chaque scène à son enseignement.':`Une étape est déplacée. Relis les titres ou consulte le récit.`};}return g;
  }
  if(action.type==='answer'&&!g.unlocked&&validIndex(action.index,chapters[g.index].options.length)){const correct=action.index===chapters[g.index].answer;return {...g,choice:action.index,attempts:g.attempts+1,unlocked:correct,message:correct?chapters[g.index].explanation:'Ce choix ne correspond pas à la scène. Relis le passage ci-dessus.'};}
  if(action.type==='next'&&g.unlocked)return {...g,index:Math.min(chapters.length-1,g.index+1),finished:g.index+1===chapters.length,choice:null,unlocked:false,message:''};return g;
 }
 case 'escape':{
  const g=game,steps=escapeSteps(g.id),q=steps[g.index];
  if(g.index===steps.length){
   if(action.type==='toggle'&&validIndex(action.index,steps.length))return {...g,order:g.order.includes(action.index)?g.order.filter(i=>i!==action.index):[...g.order,action.index],message:''};
   if(action.type==='reset-selection')return {...g,order:[],message:''};
   if(action.type==='hint'&&!g.hinted)return {...g,hinted:true,hints:g.hints+1,message:'Le chemin est : observer les faits, trouver l’indice, puis justifier la conclusion.'};
   if(action.type==='check'&&g.order.length===steps.length){const correct=g.order.every((v,i)=>v===i);return {...g,attempts:g.attempts+1,finished:correct,message:correct?'Le raisonnement est reconstitué. Les quatre portes sont ouvertes.':'Repars des faits, puis de l’indice qui éclaire ta conclusion.'};}return g;
  }
  if(action.type==='hint'&&!g.hinted)return {...g,hinted:true,hints:g.hints+1,message:'Un indice est ouvert sous la question.'};
  if(action.type==='answer'&&!g.unlocked&&validIndex(action.index,q.choices.length)){const correct=action.index===q.correctIndex;return {...g,choice:action.index,unlocked:correct,attempts:g.attempts+1,message:correct?'La porte est ouverte. Lis la preuve avant de poursuivre.':'La porte reste fermée. Compare ton choix avec les indices.'};}
  if(action.type==='next'&&g.unlocked)return {...g,index:g.index+1,finished:false,choice:null,unlocked:false,hinted:false,message:''};return g;
 }
 case 'mystery':{
  const g=game,q=mysteryBank()[g.rounds[g.index]],done=g.solved||g.revealed;
  if(action.type==='heard'&&!done)return {...g,heard:true};
  if(action.type==='hint'&&!done&&g.level<mysteryMaxLevel(g))return {...g,level:g.level+1,hints:g.hints+1,heard:false,message:'Écoute le verset suivant en entier.'};
  if(action.type==='reveal'&&!done)return {...g,revealed:true,message:'Découvre la sourate, puis réécoute ce passage.'};
  if(action.type==='answer'&&g.heard&&!done&&validIndex(action.index-1,114)&&!g.guesses.includes(action.index)&&(g.advanced||g.choices[g.index].includes(action.index))){const correct=action.index===q.verseRef!.surah;const guesses=[...g.guesses,action.index];const advance=!correct&&g.level<mysteryMaxLevel(g);return {...g,guesses,attempts:g.attempts+1,solved:correct,revealed:!correct&&guesses.length>=3,level:advance?g.level+1:g.level,heard:advance?false:g.heard,message:correct?'Tu as reconnu la sourate !':guesses.length>=3?'Trois essais : découvrons ce passage.':advance?'Ce n’est pas cette sourate. Un nouveau verset est disponible.':'Ce n’est pas cette sourate. Tu peux réécouter le dernier verset.'};}
  if(action.type==='next'&&done)return {...g,results:[...g.results,{surah:q.verseRef!.surah,correct:g.solved,attempts:g.guesses.length,hints:g.level}],index:Math.min(g.rounds.length-1,g.index+1),finished:g.index+1===g.rounds.length,level:0,heard:false,guesses:[],solved:false,revealed:false,hints:0,message:''};return g;
 }
 case 'describe':{
  let g=game;
  if(action.type==='tick')return describeTick(g,action.now);
  if(action.type==='ready'&&g.phase==='handoff')return {...g,phase:'active',remaining:g.remaining??(g.seconds?g.seconds*1000:null),lastTick:g.seconds?action.now:null,message:''};
  if(action.type==='pause'&&g.phase==='active'){g=describeTick(g,action.now);return g.phase==='review'?g:{...g,phase:'handoff',lastTick:null,message:'La carte est masquée. Reprends quand vous êtes prêts.'};}
  if(action.type==='describe-result'&&g.phase==='active'){g=describeTick(g,action.now);return g.phase==='review'?g:{...g,phase:'review',found:action.found,lastTick:null,message:action.reason,attempts:g.attempts+1};}
  if(action.type==='next'&&g.phase==='review')return {...g,results:[...g.results,{card:g.deck[g.index],found:g.found,reason:g.message}],index:Math.min(g.deck.length-1,g.index+1),finished:g.index+1===g.deck.length,phase:'handoff',remaining:null,lastTick:null,found:false,message:''};return g;
 }
 }
}
