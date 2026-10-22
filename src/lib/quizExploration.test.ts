import {it,expect} from 'vitest';
import {createGame,reduceGame,type SavedGame} from './quizGames';
import {dominoEnd,type RootsGame,type SentenceGame,type ExpeditionGame} from './quizExploration';
import {ROOT_PACKS,SENTENCE_PACKS,EXPEDITIONS,DOMINO_EDGES} from '../data/quizExploration';
import {SENTENCES} from '../arabic/sentenceData';
const act=<T extends SavedGame>(g:T,a:Parameters<typeof reduceGame>[1])=>reduceGame(g,a) as T;
it('completes both domino packs, refuses unrelated and reused tiles, and supports undo after a dead end',()=>{
 for(const pack of ROOT_PACKS){let g=createGame('roots',pack.id) as RootsGame;expect(act(g,{type:'toggle',index:1}).chain).toEqual([]);expect(act(g,{type:'toggle',index:-1})).toBe(g);
  for(const tile of [0,1,2,3,4,5]){const old=g;g=act(g,{type:'toggle',index:tile});expect(g.chain.length).toBe(old.chain.length+1);expect(act(g,{type:'toggle',index:tile})).toBe(g);}
  expect(g.finished).toBe(true);expect(dominoEnd(g)).toBe(0);expect(act(g,{type:'undo'})).toBe(g);
 }
 let g=createGame('roots','independent') as RootsGame;g=act(g,{type:'toggle',index:5});expect(g.chain[0].flipped).toBe(true);expect(dominoEnd(g)).toBe(1);g=act(g,{type:'undo'});expect(dominoEnd(g)).toBe(0);
 g=act(g,{type:'hint'});expect(act(g,{type:'hint'}).hints).toBe(1);
});
it('every domino branch can be completed or undone without losing any tile',()=>{
 let terminals=0;const visit=(g:RootsGame)=>{if(g.finished){terminals++;return;}const available=g.cards.filter(id=>!g.chain.some(c=>c.tile===id)&&DOMINO_EDGES[id].some(v=>v===dominoEnd(g)));if(!available.length){expect(g.chain.length).toBeGreaterThan(0);expect(act(g,{type:'undo'}).chain.length).toBe(g.chain.length-1);return;}for(const id of available)visit(act(g,{type:'toggle',index:id}));};visit(createGame('roots','guided') as RootsGame);expect(terminals).toBeGreaterThan(1);
});
it('all eight constructions move unique words, explain errors, and finish each saved pack once',()=>{
 for(const pack of SENTENCE_PACKS){let g=createGame('sentences',pack.id) as SentenceGame;
  for(const id of pack.ids){const t=SENTENCES.find(t=>t.id===id)!;expect(act(g,{type:'next'})).toBe(g);expect(act(g,{type:'place',word:'unknown'})).toBe(g);
   for(let i=0;i<t.slots.length;i++){g=act(g,{type:'slot',index:i});g=act(g,{type:'place',word:t.slots[(i+1)%t.slots.length].word});}g=act(g,{type:'check'});expect(g.checked).toBe(false);
   for(let i=0;i<t.slots.length;i++){g=act(g,{type:'slot',index:i});g=act(g,{type:'place',word:t.slots[i].word});expect(new Set(g.placed.filter(Boolean)).size).toBe(g.placed.filter(Boolean).length);}g=act(g,{type:'check'});expect(g.checked).toBe(true);expect(act(g,{type:'check'}).attempts).toBe(g.attempts);g=act(g,{type:'next'});
  }expect(g.finished).toBe(true);expect(g.results).toHaveLength(pack.ids.length);expect(act(g,{type:'next'})).toBe(g);
 }
});
it('all expedition paths have source links and every branch combination finishes with accurate results',()=>{
 for(const pack of EXPEDITIONS){expect(pack.stages).toHaveLength(4);
  for(let route=0;route<16;route++){let g=createGame('expedition',pack.id) as ExpeditionGame;
   for(let i=0;i<4;i++){expect(act(g,{type:'next'})).toBe(g);const branch=route>>i&1,q=pack.stages[i].paths[branch].question;expect(q.sourceLink?.href).toBeTruthy();g=act(g,{type:'branch',index:branch});expect(act(g,{type:'branch',index:1-branch})).toBe(g);
    if(q.format==='audio'){expect(act(g,{type:'answer',index:q.correctIndex})).toBe(g);g=act(g,{type:'text-help'});expect(g.assisted).toBe(true);}const answer=i%2?q.correctIndex:(q.correctIndex+1)%q.choices.length;g=act(g,{type:'answer',index:answer});expect(act(g,{type:'answer',index:q.correctIndex})).toBe(g);g=act(g,{type:'next'});
   }expect(g.finished).toBe(true);expect(g.results.filter(r=>r.correct)).toHaveLength(2);expect(act(g,{type:'next'})).toBe(g);
  }
 }
});
it('invalid pack IDs never replace a valid session',()=>{for(const kind of ['roots','sentences','expedition'] as const)expect(createGame(kind,'invalid')).toBeNull();});
