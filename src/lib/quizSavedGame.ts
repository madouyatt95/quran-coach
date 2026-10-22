import {createGame,GAME_EDITION,type SavedGame} from './quizGames';
import {FAMILY_BOARDS,MEMORY_PACKS,DESCRIBE_CARDS,escapeSteps} from '../data/quizGames';
import {chapterBooks} from '../data/storyChapters';
import {SENTENCES} from '../arabic/sentenceData';
import {EXPEDITIONS,SENTENCE_PACKS} from '../data/quizExploration';
import {mysteryBank} from './quizGames';
const indexes=(v:unknown,n:number):v is number[]=>Array.isArray(v)&&v.every(i=>Number.isInteger(i)&&i>=0&&i<n)&&new Set(v).size===v.length;
const permutation=(v:unknown,n:number)=>indexes(v,n)&&v.length===n;
/** A damaged or obsolete individual game cannot make all other games inaccessible. */
export function validSavedGame(value:unknown):value is SavedGame {
 try{
 const g=value as SavedGame;
 if(!g||g.edition!==GAME_EDITION||!createGame(g.kind,g.id)||typeof g.finished!=='boolean'||typeof g.message!=='string'||![g.attempts,g.hints].every(n=>Number.isInteger(n)&&n>=0))return false;
 switch(g.kind){
 case 'families':{const b=FAMILY_BOARDS.find(b=>b.id===g.id)!,ids=b.groups.flatMap(g=>g.ids);return Array.isArray(g.cards)&&g.cards.length===16&&new Set(g.cards).size===16&&g.cards.every(id=>ids.includes(id))&&indexes(g.solved,4)&&indexes(g.hinted,4)&&Array.isArray(g.selected)&&g.selected.length<=4&&new Set(g.selected).size===g.selected.length&&g.selected.every(id=>ids.includes(id));}
 case 'memory':{const ids=MEMORY_PACKS.find(p=>p.id===g.id)!.ids;return Array.isArray(g.cards)&&g.cards.length===12&&g.cards.every(c=>ids.includes(c.word)&&['ar','fr'].includes(c.side))&&new Set(g.cards.map(c=>`${c.word}:${c.side}`)).size===12&&indexes(g.open,12)&&g.open.length<=2&&Array.isArray(g.matched)&&new Set(g.matched).size===g.matched.length&&g.matched.every(id=>ids.includes(id));}
 case 'story':{const chapters=chapterBooks[g.id].chapters;return permutation(g.cards,chapters.length)&&indexes(g.order,chapters.length)&&indexes([g.index],chapters.length)&&['order','meaning'].includes(g.stage)&&Array.isArray(g.choices)&&g.choices.length===chapters.length&&g.choices.every((c,i)=>permutation(c,chapters[i].options.length));}
 case 'escape':{const steps=escapeSteps(g.id);return permutation(g.cards,steps.length)&&indexes(g.order,steps.length)&&indexes([g.index],steps.length+1)&&Array.isArray(g.choices)&&g.choices.length===steps.length&&g.choices.every((c,i)=>permutation(c,steps[i].choices.length));}
 case 'mystery':return indexes(g.rounds,mysteryBank().length)&&g.rounds.length===5&&indexes([g.index],5)&&indexes([g.level],3)&&indexes(g.guesses.map(n=>n-1),114)&&g.guesses.length<=3&&Array.isArray(g.results)&&g.results.every(r=>indexes([r.surah-1],114))&&Array.isArray(g.choices)&&g.choices.length===5&&g.choices.every(c=>Array.isArray(c)&&indexes(c.map(n=>n-1),114)&&c.length===4);
 case 'describe':return indexes(g.deck,DESCRIBE_CARDS.length)&&g.deck.length===10&&indexes([g.index],10)&&['handoff','active','review'].includes(g.phase)&&Array.isArray(g.results)&&g.results.every(r=>indexes([r.card],DESCRIBE_CARDS.length))&&[0,60,90].includes(g.seconds)&&(g.remaining===null||Number.isFinite(g.remaining)&&g.remaining>=0);
 case 'roots':return permutation(g.cards,6)&&Array.isArray(g.chain)&&indexes(g.chain.map(c=>c.tile),6)&&g.chain.every(c=>typeof c.flipped==='boolean');
 case 'sentences':{const tasks=SENTENCE_PACKS.find(p=>p.id===g.id)!.ids;const task=SENTENCES.find(t=>t.id===tasks[g.index]);return !!task&&JSON.stringify(g.tasks)===JSON.stringify(tasks)&&Array.isArray(g.placed)&&g.placed.length===task.slots.length&&g.placed.every(id=>id===null||task.words.some(w=>w.id===id))&&new Set(g.placed.filter(Boolean)).size===g.placed.filter(Boolean).length&&indexes([g.active],task.slots.length)&&Array.isArray(g.results)&&g.results.every(r=>tasks.includes(r.id))&&Array.isArray(g.cards)&&g.cards.length===tasks.length&&g.cards.every((c,i)=>permutation(c,SENTENCES.find(t=>t.id===tasks[i])!.words.length));}
 case 'expedition':{const pack=EXPEDITIONS.find(p=>p.id===g.id)!;return indexes([g.index],pack.stages.length)&&(g.branch===null||[0,1].includes(g.branch))&&Array.isArray(g.results)&&g.results.every(r=>[0,1].includes(r.branch)&&typeof r.correct==='boolean')&&Array.isArray(g.choices)&&g.choices.length===pack.stages.length&&g.choices.every((paths,i)=>Array.isArray(paths)&&paths.length===2&&paths.every((c,j)=>permutation(c,pack.stages[i].paths[j].question.choices.length)));}
 }
 }catch{return false;}
 return false;
}
