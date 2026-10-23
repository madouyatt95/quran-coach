import {useCallback,useState,type SetStateAction} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';

/** Only UI preferences, never credentials or form submissions. Scoped to this tab. */
export function usePageState<T>(name:string,initial:T|(()=>T)) {
 const {pathname}=useLocation(),key=`qc-page:${pathname}:${name}`;
 const read=()=>{const fallback=typeof initial==='function'?(initial as ()=>T)():initial;try{const raw=sessionStorage.getItem(key);if(raw!==null){const parsed=JSON.parse(raw);if(fallback===null||(parsed!==null&&typeof parsed===typeof fallback&&Array.isArray(parsed)===Array.isArray(fallback)))return parsed as T;}}catch{/* Private browsing or a stale record. */}return fallback;};
 const [saved,setSaved]=useState(()=>({key,value:read()}));
 let value=saved.value;
 if(saved.key!==key){value=read();setSaved({key,value});}
 const update=useCallback((next:SetStateAction<T>)=>setSaved(previous=>{const result=typeof next==='function'?(next as (p:T)=>T)(previous.value):next;try{sessionStorage.setItem(key,JSON.stringify(result));}catch{/* State remains available in memory. */}return {key,value:result};}),[key]);
 return [value,update] as const;
}
export function useSmartBack(fallback:string){
 const navigate=useNavigate();
 return ()=>{if(typeof window.history.state?.idx==='number'&&window.history.state.idx>0)navigate(-1);else navigate(fallback,{replace:true});};
}
