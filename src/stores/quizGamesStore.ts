import {validSavedGame} from '../lib/quizSavedGame';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {createGame,reduceGame,type SavedGame,type GameAction} from '../lib/quizGames';
import type {GameKind} from '../data/quizGames';
interface State {games:Partial<Record<GameKind,SavedGame>>;start:(kind:GameKind,id:string,options?:{advanced?:boolean;seconds?:number})=>void;act:(kind:GameKind,action:GameAction)=>void}
export const useQuizGamesStore=create<State>()(persist((set)=>({
 games:{},start:(kind,id,options)=>{const game=createGame(kind,id,options);if(game)set(s=>({games:{...s.games,[kind]:game}}));},
 act:(kind,action)=>set(s=>{const g=s.games[kind];return g?{games:{...s.games,[kind]:reduceGame(g,action)}}:s;}),
}),{name:'quran-coach-games-v1',version:1,merge:(persisted,current)=>{
 const saved=(persisted as Partial<State>|undefined)?.games||{};const games:State['games']={};
 for(const [kind,g] of Object.entries(saved))if(validSavedGame(g)&&g.kind===kind){
  // A reload must never reveal the family card or silently run its timer.
  games[g.kind]=g.kind==='describe'&&g.phase==='active'?{...g,phase:'handoff',lastTick:null}:g;
 }
 return {...current,games};
}}));
