import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Intervention} from './invisibleCoachStore';
import type {ViewMode} from '../types';
export type ReaderCoachTask='practice'|'repeat'|'understand';
export interface ReaderReturnPoint {surah:number;ayah:number;page:number;view:ViewMode}
export interface ReaderSuggestion extends Intervention {at:number;surah:number;ayah:number;page:number}
export const useReaderCoachStore=create<{
    suggestions:ReaderSuggestion[];returnPoint:ReaderReturnPoint|null;
    enqueue:(item:ReaderSuggestion)=>void;remove:(id:string)=>void;
    remember:(point:ReaderReturnPoint)=>void;clearReturn:()=>void;
}>()(persist(set=>({
    suggestions:[],returnPoint:null,
    enqueue:item=>set(s=>({suggestions:[item,...s.suggestions.filter(v=>v.id!==item.id&&v.at>item.at-7*86400000)].slice(0,20)})),
    remove:id=>set(s=>({suggestions:s.suggestions.filter(v=>v.id!==id)})),
    remember:point=>set(s=>({returnPoint:s.returnPoint||point})),clearReturn:()=>set({returnPoint:null}),
}),{name:'quran-coach-reader-coach-v1'}));
