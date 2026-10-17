import { resolve4 } from 'node:dns/promises';
import { request } from 'node:https';
import { mawaqitSlug } from '../src/lib/mosqueDirectory.js';
import { distanceKm, type Mosque } from '../src/lib/mosques.js';
import type { PublishedTimetable } from '../src/lib/mosqueTimetables.js';

export type DiscoveryResult = {
 status: 'found' | 'missing' | 'uncertain' | 'unavailable';
 checkedAt: number;
 timetable?: PublishedTimetable;
};
// Pin the validated public IPv4 address to the connection (including after redirects).
export function publicIPv4(address: string): boolean {
 const p=address.split('.').map(Number);
 if(p.length!==4||p.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
 const [a,b,c]=p;
 return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);
}
export function publicWebsite(value:string):URL {
 const u=new URL(value);
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.hostname.includes(':')||u.hostname==='localhost'||!u.hostname.includes('.'))throw new Error('Unsupported website');
 return u;
}
export async function websiteHtml(value:string,redirects=0,deadline=Date.now()+7000):Promise<string>{
 const url=publicWebsite(value);
 if(Date.now()>=deadline)throw new Error('Website timeout');
 let dnsTimer:ReturnType<typeof setTimeout>|undefined;
 const addresses=await Promise.race([resolve4(url.hostname),new Promise<string[]>((_,reject)=>{dnsTimer=setTimeout(()=>reject(new Error('DNS timeout')),Math.min(2000,deadline-Date.now()));})]).finally(()=>clearTimeout(dnsTimer));
 if(!addresses.length||addresses.some(ip=>!publicIPv4(ip)))throw new Error('Non-public website');
 return new Promise((resolve,reject)=>{
  const req=request(url,{family:4,headers:{Accept:'text/html','User-Agent':'QuranCoach/1.0 (+https://www.quran-coach.fr)'},lookup:(_host,_options,cb)=>cb(null,addresses[0],4)},res=>{
   if([301,302,303,307,308].includes(res.statusCode||0)){
    res.resume();if(!res.headers.location||redirects>=2){reject(new Error('Redirect limit'));return;}
    websiteHtml(new URL(res.headers.location,url).href,redirects+1,deadline).then(resolve,reject);return;
   }
   if(res.statusCode!==200||!res.headers['content-type']?.includes('text/html')){res.resume();reject(new Error('Website unavailable'));return;}
   let size=0;const chunks:Buffer[]=[];
   res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>1500000){res.destroy();reject(new Error('Website too large'));}else chunks.push(chunk);});
   res.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));res.on('error',reject);
  });
  const timer=setTimeout(()=>req.destroy(new Error('Website timeout')),Math.max(1,deadline-Date.now()));
  req.on('close',()=>clearTimeout(timer));req.on('error',reject);req.end();
 });
}
export function publicScheduleLinks(html:string):string[]{
 const urls=html.replace(/\\\//g,'/').match(/https:\/\/(?:www\.)?mawaqit\.net\/(?:fr|en|ar)\/(?:w\/)?[a-z0-9][a-z0-9_-]{1,179}/gi)||[];
 return [...new Set(urls.map(mawaqitSlug).filter((v):v is string=>!!v))];
}
export async function discoverMosque(mosque:Mosque,load:(slug:string)=>Promise<PublishedTimetable>,read=websiteHtml):Promise<DiscoveryResult>{
 const checkedAt=Date.now();
 try{
  const direct=mosque.refs?.mawaqit||mawaqitSlug(mosque.website||'');
  if(!direct&&!mosque.website)return {status:'missing',checkedAt};
  const slugs=direct?[direct]:publicScheduleLinks(await read(mosque.website!));
  if(!slugs.length)return {status:'missing',checkedAt};
  // A page listing several mosques does not establish which one this entry is.
  if(slugs.length!==1)return {status:'uncertain',checkedAt};
  const timetable=await load(slugs[0]);
  if(distanceKm(mosque,timetable.mosque)>.3)return {status:'uncertain',checkedAt};
  return {status:'found',checkedAt,timetable};
 }catch{return {status:'unavailable',checkedAt};}
}
