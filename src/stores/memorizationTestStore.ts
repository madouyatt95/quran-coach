import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestAnswer } from '../lib/memorizationTest';
interface TestSummary {date:string;answers:TestAnswer[]}
interface TestState {knownSurahs:number[];history:TestSummary[];setKnown:(ids:number[])=>void;save:(answers:TestAnswer[])=>void}
export const useMemorizationTestStore = create<TestState>()(persist(set=>({
  knownSurahs:[],history:[],
  setKnown:ids=>set({knownSurahs:[...new Set(ids.filter(n=>Number.isInteger(n)&&n>=1&&n<=114))]}),
  save:answers=>set(s=>({history:[{date:new Date().toISOString(),answers},...s.history].slice(0,20)})),
}),{name:'quran-coach-memory-tests-v1'}));
