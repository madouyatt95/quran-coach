import {migrateMoralLibrary} from '../lib/moralEditionMigration';
import type {BookReadingPoint} from '../lib/bookResume';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export const useAudioLibraryStore=create<{
 autoNextBook:boolean;setAutoNextBook:(enabled:boolean)=>void;
 bookReadingPoints:Record<string,BookReadingPoint>;saveBookReadingPoint:(book:string,point:BookReadingPoint)=>void;
 bookReading:Record<string,string>;bookReadingUpdatedAt:Record<string,number>;bookNotes:Record<string,string>;saveBookReading:(book:string,chapter:string)=>void;saveBookNote:(book:string,text:string)=>void;
 favorites:string[];positions:Record<string,{seconds:number;updatedAt:number}>;
 toggleFavorite:(id:string)=>void;savePosition:(id:string,seconds:number)=>void;
}>()(persist((set)=>({autoNextBook:true,setAutoNextBook:autoNextBook=>set({autoNextBook}),bookReadingPoints:{},saveBookReadingPoint:(book,point)=>set(s=>({bookReadingPoints:{...s.bookReadingPoints,[book]:point},bookReading:{...s.bookReading,[book]:point.chapterId},bookReadingUpdatedAt:{...s.bookReadingUpdatedAt,[book]:point.updatedAt}})),bookReading:{},bookReadingUpdatedAt:{},bookNotes:{},saveBookReading:(book,chapter)=>set(s=>({bookReading:{...s.bookReading,[book]:chapter},bookReadingUpdatedAt:{...s.bookReadingUpdatedAt,[book]:Date.now()}})),saveBookNote:(book,text)=>set(s=>({bookNotes:{...s.bookNotes,[book]:text.slice(0,2000)}})),favorites:[],positions:{},
 toggleFavorite:id=>set(s=>({favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]})),
 savePosition:(id,seconds)=>{if(Number.isFinite(seconds)&&seconds>=0)set(s=>({positions:{...s.positions,[id]:{seconds,updatedAt:Date.now()}}}));}
}),{name:'qc-audio-library-v1',version:2,migrate:state=>migrateMoralLibrary(state as Parameters<typeof migrateMoralLibrary>[0])}));
