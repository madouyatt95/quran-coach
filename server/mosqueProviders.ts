import { parseMawaqitMap, nearbyPublishedMosques } from './mawaqitDirectory.js';
import { distanceKm, parseMosques, type Mosque } from '../src/lib/mosques.js';
import { mergeMosques, parseOverpass, type DirectoryResult, type DirectorySource } from '../src/lib/mosqueDirectory.js';
import type { PublishedTimetable } from '../src/lib/mosqueTimetables.js';
import { discoverMosque } from './mosqueDiscovery.js';
import { readPublicTimetable } from './mawaqitPublic.js';
const cache=new Map<string,{until:number;value:unknown}>(),pending=new Map<string,Promise<unknown>>();
export async function providerCache<T>(key:string,ttl:number,read:()=>Promise<T>):Promise<T>{
 const saved=cache.get(key);if(saved&&saved.until>Date.now())return saved.value as T;
 const active=pending.get(key);if(active)return active as Promise<T>;
 if(pending.size>=6)throw new Error('Provider busy');
 const task=read().then(value=>{if(cache.size>=120)cache.delete(cache.keys().next().value!);if(!(value&&typeof value==='object'&&'status' in value&&value.status==='unavailable'))cache.set(key,{until:Date.now()+ttl,value});return value;}).finally(()=>pending.delete(key));pending.set(key,task);return task;
}
async function json(url:string,body?:string){const r=await fetch(url,{method:body?'POST':'GET',headers:{Accept:'application/json','User-Agent':'QuranCoach/1.0 (+https://www.quran-coach.fr)',...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body,signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('Provider unavailable');return r.json() as Promise<unknown>;}
async function publicFranceDirectory(){
 return providerCache('mawaqit-map:FR',6*3600000,async()=>parseMawaqitMap(await json('https://mawaqit.net/api/2.0/mosque/map/FR')));
}
export async function nearbyDirectory(lat:number,lng:number,radius:number):Promise<DirectoryResult>{
 const key=`directory:${lat}:${lng}:${radius}`;
 return providerCache(key,15*60000,async()=>{
  const tasks:{source:DirectorySource;run:()=>Promise<Mosque[]>}[]=[
   {source:'mawaqit',run:async()=>nearbyPublishedMosques(await publicFranceDirectory(),lat,lng,radius)},
   {source:'prayerzone',run:async()=>parseMosques(await json(`https://pray.zone/api/mosques/nearby?latitude=${lat}&longitude=${lng}&maxDistance=${radius}`))},
   {source:'osm',run:async()=>parseOverpass(await providerCache(`osm:${lat}:${lng}:${radius}`,86400000,()=>json('https://overpass-api.de/api/interpreter',new URLSearchParams({data:`[out:json][timeout:8];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});out center tags 180;`}).toString())))},
  ];
  const results=await Promise.allSettled(tasks.map(t=>t.run()));
  if(results.every(r=>r.status==='rejected'))throw new Error('Directory unavailable');
  return {mosques:mergeMosques(results.map(r=>r.status==='fulfilled'?r.value:[])).filter(m=>distanceKm({lat,lng},m)<=radius/1000+.8).sort((a,b)=>distanceKm({lat,lng},a)-distanceKm({lat,lng},b)),fetchedAt:Date.now(),unavailable:tasks.filter((_,i)=>results[i].status==='rejected').map(t=>t.source),mawaqit:'public-map'};
 });
}
export async function publishedTimetable(slug:string):Promise<PublishedTimetable>{
 return providerCache(`published:${slug}`,15*60000,()=>readPublicTimetable(slug));
}

export async function automaticTimetable(id:string,lat:number,lng:number,radius:number){
 if(id.startsWith('mawaqit-')){
  const direct=(await publicFranceDirectory()).find(m=>m.id===id&&distanceKm({lat,lng},m)<=radius/1000+.8);
  if(direct)return providerCache(`discover:${id}`,15*60000,()=>discoverMosque(direct,publishedTimetable));
 }
 const directory=await nearbyDirectory(lat,lng,radius);
 const mosque=directory.mosques.find(m=>m.id===id||m.aliases?.includes(id));
 if(!mosque||!mosque.website&&!mosque.refs?.mawaqit)return {status:directory.unavailable.length?'unavailable' as const:'missing' as const,checkedAt:Date.now()};
 return providerCache(`discover:${id}`,15*60000,()=>discoverMosque(mosque,publishedTimetable));
}
