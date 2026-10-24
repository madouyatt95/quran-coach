import {useCallback,useEffect,useState} from 'react';
import {create} from 'zustand';
import {persist,createJSONStorage} from 'zustand/middleware';
import {resolveLayout,type LayoutChoice,type Posture,type ReadingLayout,type PupitreActivity} from './posture';
export type ConsoleTab='listen'|'understand'|'settings';
export interface ActivityPreference {choice:LayoutChoice;ratio:number;tab:ConsoleTab;pins:string[]|null}
const DEFAULT:ActivityPreference={choice:'auto',ratio:50,tab:'listen',pins:null};
const choices:LayoutChoice[]=['auto','plain','desk','book'];
const activities:PupitreActivity[]=['reader','book','catalogue','memorization','quiz','course','arabic'];
export function safePreference(value:Partial<ActivityPreference>|undefined):ActivityPreference {
 return {choice:choices.includes(value?.choice as LayoutChoice)?value!.choice!:'auto',ratio:Number.isFinite(value?.ratio)?Math.min(70,Math.max(35,value!.ratio!)):50,tab:['listen','understand','settings'].includes(value?.tab||'')?value!.tab!:'listen',pins:Array.isArray(value?.pins)?[...new Set(value.pins.filter(p=>typeof p==='string'))].slice(0,4):null};
}
export function migrateLayoutPreferences(value:unknown){
 const old=value&&typeof value==='object'?value as {choice?:LayoutChoice;preferences?:Partial<Record<PupitreActivity,ActivityPreference>>}:{};
 return {preferences:Object.fromEntries(activities.map(activity=>[activity,safePreference(old.preferences?.[activity]||{choice:old.choice})]))};
}
interface LayoutPreferences {preferences:Partial<Record<PupitreActivity,ActivityPreference>>;update:(activity:PupitreActivity,patch:Partial<ActivityPreference>)=>void}
export const useLayoutPreferences=create(persist<LayoutPreferences>((set)=>({preferences:{},update:(activity,patch)=>set(state=>({preferences:{...state.preferences,[activity]:safePreference({...DEFAULT,...state.preferences[activity],...patch})}}))}),{
 name:'qc-reading-layout-v1',version:2,storage:createJSONStorage(()=>window.localStorage),migrate:value=>migrateLayoutPreferences(value) as LayoutPreferences,partialize:state=>({preferences:state.preferences}) as LayoutPreferences,
}));
const matches=(query:string)=>typeof window.matchMedia==='function'&&window.matchMedia(query).matches;
const readPosture=():Posture=>({folded:matches('(device-posture: folded)'),vertical:matches('(vertical-viewport-segments: 2)'),horizontal:matches('(horizontal-viewport-segments: 2)'),width:innerWidth,height:innerHeight});
export function usePupitreLayout(enabled=true,activity:PupitreActivity='reader'){
 const preference=useLayoutPreferences(s=>s.preferences[activity]||DEFAULT),update=useLayoutPreferences(s=>s.update);
 const [device,setDevice]=useState<Posture>(()=>typeof window==='undefined'?{folded:false,vertical:false,horizontal:false,width:0,height:0}:readPosture());
 useEffect(()=>{const change=()=>setDevice(readPosture());const queries=['(device-posture: folded)','(vertical-viewport-segments: 2)','(horizontal-viewport-segments: 2)'].flatMap(q=>typeof window.matchMedia==='function'?[window.matchMedia(q)]:[]);queries.forEach(q=>q.addEventListener('change',change));window.addEventListener('resize',change);window.visualViewport?.addEventListener('resize',change);return()=>{queries.forEach(q=>q.removeEventListener('change',change));window.removeEventListener('resize',change);window.visualViewport?.removeEventListener('resize',change);};},[]);
 const choose=useCallback((choice:LayoutChoice)=>{window.dispatchEvent(new Event('qc-pupitre-before-layout'));update(activity,{choice});},[activity,update]);
 const setRatio=useCallback((ratio:number)=>{window.dispatchEvent(new Event('qc-pupitre-before-layout'));update(activity,{ratio});},[activity,update]);
 return {layout:enabled?resolveLayout(preference.choice,device):'plain' as ReadingLayout,...preference,choose,setRatio,device,activity};
}
