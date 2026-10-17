import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Dispatch,SetStateAction} from 'react';
interface Evidence {seen:string[];transferAt:number;delayedAt:number}
interface PracticeState {
 workshops:Record<string,unknown>;
 evidence:Record<string,Evidence>;
 save:(key:string,value:unknown)=>void;
 attempt:(concept:string,variant:string,correct:boolean,assisted:boolean,delayed:boolean,at?:number)=>void;
}
export const useArabicPracticeStore=create<PracticeState>()(persist((set)=>({
 workshops:{},evidence:{},
 save:(key,value)=>set(s=>({workshops:{...s.workshops,[key]:value}})),
 attempt:(concept,variant,correct,assisted,delayed,at=Date.now())=>set(s=>{const old=s.evidence[concept]||{seen:[],transferAt:0,delayedAt:0};const fresh=!old.seen.includes(variant);return{evidence:{...s.evidence,[concept]:{seen:fresh?[...old.seen,variant]:old.seen,transferAt:correct&&!assisted&&fresh?at:old.transferAt,delayedAt:correct&&!assisted&&delayed?at:old.delayedAt}}};}),
}),{name:'qc-arabic-practice-v1'}));
/** Additive store: legacy completion/recall keys are never replaced. */
export function usePracticeState<T>(key:string,initial:T):[T,Dispatch<SetStateAction<T>>]{
 const saved=useArabicPracticeStore(s=>s.workshops[key]);
 return [(saved===undefined?initial:saved) as T,value=>{const s=useArabicPracticeStore.getState();const previous=(s.workshops[key]===undefined?initial:s.workshops[key]) as T;s.save(key,typeof value==='function'?(value as (p:T)=>T)(previous):value);}];
}
