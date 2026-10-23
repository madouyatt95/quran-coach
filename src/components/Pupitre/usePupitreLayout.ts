import {useEffect,useState} from 'react';
import {create} from 'zustand';
import {persist,createJSONStorage} from 'zustand/middleware';
import {resolveLayout,type LayoutChoice,type Posture,type ReadingLayout} from './posture';
const useLayoutPreference=create(persist<{choice:LayoutChoice;choose:(choice:LayoutChoice)=>void}>(set=>({choice:'auto',choose:choice=>set({choice})}),{name:'qc-reading-layout-v1',storage:createJSONStorage(()=>window.localStorage)}));
const matches=(query:string)=>typeof window.matchMedia==='function'&&window.matchMedia(query).matches;
const readPosture=():Posture=>({folded:matches('(device-posture: folded)'),vertical:matches('(vertical-viewport-segments: 2)'),horizontal:matches('(horizontal-viewport-segments: 2)'),width:innerWidth,height:innerHeight});
export function usePupitreLayout(enabled=true){
 const {choice,choose}=useLayoutPreference();const [device,setDevice]=useState<Posture>(()=>typeof window==='undefined'?{folded:false,vertical:false,horizontal:false,width:0,height:0}:readPosture());
 useEffect(()=>{const update=()=>setDevice(readPosture());const queries=['(device-posture: folded)','(vertical-viewport-segments: 2)','(horizontal-viewport-segments: 2)'].flatMap(q=>typeof window.matchMedia==='function'?[window.matchMedia(q)]:[]);queries.forEach(q=>q.addEventListener('change',update));window.addEventListener('resize',update);return()=>{queries.forEach(q=>q.removeEventListener('change',update));window.removeEventListener('resize',update);};},[]);
 return {layout:enabled?resolveLayout(choice,device):'plain' as ReadingLayout,choice,choose,device};
}
