import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export const useAudioLibraryStore=create<{
 favorites:string[];positions:Record<string,{seconds:number;updatedAt:number}>;
 toggleFavorite:(id:string)=>void;savePosition:(id:string,seconds:number)=>void;
}>()(persist((set)=>({favorites:[],positions:{},
 toggleFavorite:id=>set(s=>({favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]})),
 savePosition:(id,seconds)=>{if(Number.isFinite(seconds)&&seconds>=0)set(s=>({positions:{...s.positions,[id]:{seconds,updatedAt:Date.now()}}}));}
}),{name:'qc-audio-library-v1'}));
