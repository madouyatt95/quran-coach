import {expect,it} from 'vitest';
import {readTableDuel,startTableDuel,tableDuelReducer,tableRounds,type TableRound} from './tableDuel';
const round:TableRound={id:'test',prompt:'Sens ?',choices:['A','B'],correct:[1],explanation:'B'};
it('keeps the first answer private until both players submit and scores exactly once',()=>{
 let state=startTableDuel('vocabulary',['A','B'],[round]);
 state=tableDuelReducer(state,{type:'submit',player:0,answer:[1]});
 expect(state.phase).toBe('answer');expect(state.scores).toEqual([0,0]);
 expect(tableDuelReducer(state,{type:'submit',player:0,answer:[0]})).toBe(state);
 state=tableDuelReducer(state,{type:'submit',player:1,answer:[0]});
 expect(state.phase).toBe('reveal');expect(state.scores).toEqual([1,0]);
 expect(tableDuelReducer(state,{type:'submit',player:1,answer:[1]})).toBe(state);
 state=tableDuelReducer(state,{type:'ready',player:0});expect(state.phase).toBe('reveal');
 state=tableDuelReducer(state,{type:'ready',player:1});expect(state.phase).toBe('finished');
});
it('rejects incomplete/invalid associations and pauses without losing either answer',()=>{
 const pairs={...round,choices:['A','B','C'],correct:[2,0,1],pairs:['أ','ب','ج']};
 let state=startTableDuel('association',['A','B'],[pairs,round]);
 for(const answer of [[0],[0,0,1],[0,1,7],[NaN,1,2]])expect(tableDuelReducer(state,{type:'submit',player:0,answer})).toBe(state);
 state=tableDuelReducer(state,{type:'submit',player:0,answer:[2,0,1]});state=tableDuelReducer(state,{type:'pause'});
 expect(tableDuelReducer(state,{type:'submit',player:1,answer:[2,0,1]})).toBe(state);
 const resumed=readTableDuel(JSON.stringify(state))!;expect(resumed.answers[0]).toEqual([2,0,1]);expect(resumed.paused).toBe(true);
 state=tableDuelReducer(resumed,{type:'resume'});state=tableDuelReducer(state,{type:'submit',player:1,answer:[2,0,1]});
 expect(state.scores).toEqual([1,1]);state=tableDuelReducer(state,{type:'ready',player:1});state=tableDuelReducer(state,{type:'ready',player:0});
 expect(state.index).toBe(1);expect(state.answers).toEqual([null,null]);expect(state.scores).toEqual([1,1]);
});
it('builds valid unique rounds from existing vocabulary and course questions',()=>{
 for(const mode of ['vocabulary','association','true-false','academy'] as const){
  const rounds=tableRounds(mode,6,()=>.45);expect(rounds).toHaveLength(6);expect(new Set(rounds.map(r=>r.id)).size).toBe(6);
  for(const r of rounds){expect(r.explanation).not.toBe('');expect(r.source?.href).toMatch(/^\//);expect(r.correct.every(i=>r.choices[i])).toBe(true);expect(r.correct).toHaveLength(r.pairs?.length||1);}
 }
 expect(readTableDuel('{')).toBeNull();expect(readTableDuel(JSON.stringify({...startTableDuel('vocabulary',['a','b'],[round]),index:90}))).toBeNull();
});
