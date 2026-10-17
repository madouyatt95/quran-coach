import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mosqueApiUrl, validCoordinates, safeMosqueUrl } from '../lib/mosques';
import type { DirectoryResult } from '../lib/mosqueDirectory';
import type { Mosque } from '../lib/mosques';
import type { PublishedTimetable } from '../lib/mosqueTimetables';
export interface AutomaticSchedule {status:'found'|'missing'|'uncertain'|'unavailable';checkedAt:number;slug?:string;}
interface State { automatic:Record<string,AutomaticSchedule>; discover:(mosque:Mosque)=>Promise<void>; links:Record<string,string>; link:(id:string,slug:string)=>void; unlink:(id:string)=>void; published:Record<string,PublishedTimetable>; loadPublished:(uuid:string)=>Promise<PublishedTimetable|null>; }
const pending=new Map<string,Promise<unknown>>();
async function request<T>(query:string):Promise<T>{const response=await fetch(await mosqueApiUrl(query),{signal:AbortSignal.timeout(query.startsWith('action=automatic')?32000:16000)});if(!response.ok)throw new Error(response.status===429?'Trop de recherches. Réessayez dans une minute.':'Le service est momentanément indisponible.');return response.json();}
export const useMosqueDirectoryStore=create<State>()(persist((set,get)=>({automatic:{},discover:async mosque=>{
 const cached=get().automatic[mosque.id];if(cached&&!(mosque.refs?.mawaqit&&cached.status==='missing')&&Date.now()-cached.checkedAt<(cached.status==='unavailable'?60000:15*60000))return;
 const key=`automatic:${mosque.id}`;if(pending.has(key)){await pending.get(key);return;}
 const task=request<{status:AutomaticSchedule['status'];checkedAt:number;timetable?:PublishedTimetable}>(`action=automatic&mosqueId=${encodeURIComponent(mosque.id)}&latitude=${(mosque.directoryArea?.lat??mosque.lat).toFixed(2)}&longitude=${(mosque.directoryArea?.lng??mosque.lng).toFixed(2)}&radius=${mosque.directoryArea?.radius===15000?15000:5000}`).then(result=>{
  const t=result.timetable;set(s=>({automatic:{...Object.fromEntries(Object.entries(s.automatic).slice(-99)),[mosque.id]:{status:result.status,checkedAt:result.checkedAt,slug:t?.mosqueId}},...(t?{published:{...Object.fromEntries(Object.entries(s.published).slice(-49)),[t.mosqueId]:t}}:{})}));
 }).catch(()=>{set(s=>({automatic:{...s.automatic,[mosque.id]:{status:'unavailable',checkedAt:Date.now()}}}));}).finally(()=>pending.delete(key));pending.set(key,task);await task;
},links:{},link:(id,slug)=>set(s=>({links:{...s.links,[id]:slug}})),unlink:id=>set(s=>({links:Object.fromEntries(Object.entries(s.links).filter(([k])=>k!==id))})),published:{},loadPublished:async uuid=>{
 const cached=get().published[uuid];if(cached&&Date.now()-cached.fetchedAt<15*60000)return cached;
 const key=`published:${uuid}`;if(pending.has(key))return pending.get(key) as Promise<PublishedTimetable|null>;
 const task=request<{timetable:PublishedTimetable|null}>(`action=published&slug=${encodeURIComponent(uuid)}`).then(({timetable})=>{if(timetable)set(s=>({published:{...Object.fromEntries(Object.entries(s.published).slice(-49)),[uuid]:timetable}}));return timetable;}).finally(()=>pending.delete(key));pending.set(key,task);return task;
}}),{name:'quran-coach-mosque-directory-v2',partialize:s=>({links:s.links,published:s.published,automatic:s.automatic})}));
async function readDirectory(lat:number,lng:number,radius:number):Promise<DirectoryResult&{offline?:boolean}>{
 const query=`action=directory&v=3&latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&radius=${radius===15000?15000:5000}`,key=`mosque-directory-v3:${query}`;
 let saved:DirectoryResult|null=null;
 try{const value=JSON.parse(localStorage.getItem(key)||'null') as DirectoryResult|null;if(value&&Array.isArray(value.mosques)&&Number.isFinite(value.fetchedAt)&&value.mosques.every(m=>typeof m.id==='string'&&typeof m.name==='string'&&validCoordinates(m.lat,m.lng)&&safeMosqueUrl(m.sourceUrl)))saved=value;}catch{/* Optional cache. */}
 if(saved&&Date.now()-saved.fetchedAt<15*60000)return saved;
 if(pending.has(key))return pending.get(key) as Promise<DirectoryResult>;
 const task=request<DirectoryResult>(query).then(value=>{try{const keys=Object.keys(localStorage).filter(k=>k.startsWith('mosque-directory-v3:'));if(keys.length>=12)localStorage.removeItem(keys[0]);localStorage.setItem(key,JSON.stringify(value));}catch{/* Optional persistence. */}return value;}).catch(error=>{if(saved&&Date.now()-saved.fetchedAt<7*86400000)return {...saved,offline:true};throw error;}).finally(()=>pending.delete(key));pending.set(key,task);return task;
}

export async function loadDirectory(lat:number,lng:number,radius:number):Promise<DirectoryResult&{offline?:boolean}>{
 const value=await readDirectory(lat,lng,radius);
 return {...value,mosques:value.mosques.map(m=>({...m,directoryArea:{lat,lng,radius}}))};
}
