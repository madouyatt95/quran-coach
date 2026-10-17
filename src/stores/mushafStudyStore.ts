import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export interface ReviewWord {key:string;verseKey:string;text:string;page:number;addedAt:number}
export const useMushafStudyStore=create<{words:Record<string,ReviewWord>;toggle:(word:Omit<ReviewWord,'addedAt'>)=>void}>()(persist((set)=>({
    words:{},toggle:word=>set(state=>{const words={...state.words};if(words[word.key])delete words[word.key];else words[word.key]={...word,addedAt:Date.now()};return {words};})
}),{name:'quran-coach-mushaf-study',version:1}));
