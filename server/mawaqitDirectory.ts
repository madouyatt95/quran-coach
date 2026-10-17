import { distanceKm, validCoordinates, type Mosque } from '../src/lib/mosques.js';

/** Public map metadata only. Calendars are fetched separately, on demand. */
export function parseMawaqitMap(value:unknown):Mosque[]{
 if(!Array.isArray(value))throw new Error('Public mosque directory unavailable');
 const seen=new Set<string>();
 return value.flatMap(row=>{
  if(!row||typeof row!=='object')return [];
  const {slug,name,lat,lng,address,city}=row;
  if(typeof slug!=='string'||!/^[a-z0-9][a-z0-9_-]{1,179}$/i.test(slug)||seen.has(slug)||typeof name!=='string'||!name.trim()||!validCoordinates(lat,lng))return [];
  seen.add(slug);
  return [{id:`mawaqit-${slug}`,name:name.slice(0,180),lat,lng,city:typeof city==='string'?city.slice(0,120):'',address:typeof address==='string'?address.slice(0,300):undefined,sourceUrl:`https://mawaqit.net/fr/${slug}`,refs:{mawaqit:slug}}];
 });
}
export function nearbyPublishedMosques(mosques:Mosque[],lat:number,lng:number,radius:number):Mosque[]{
 return mosques.filter(m=>distanceKm({lat,lng},m)<=radius/1000).sort((a,b)=>distanceKm({lat,lng},a)-distanceKm({lat,lng},b)).slice(0,150);
}
