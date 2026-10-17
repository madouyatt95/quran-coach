import { mosqueDate, validCoordinates } from '../src/lib/mosques.js';
import { addDays, isFriday, SALATS, timeLabel, validTime, zonedTime } from '../src/lib/mosquePlanning.js';
import type { PublishedTimetable } from '../src/lib/mosqueTimetables.js';
/** Read inert JSON only. Never execute a script from a provider page. */
export function extractConfData(html:string):Record<string,unknown>{
 if(html.length>1500000)throw new Error('Page too large');
 const match=/(?:var|let|const)\s+confData\s*=\s*(?=\{)/.exec(html);if(!match)throw new Error('Published data missing');
 const start=match.index+match[0].length;let depth=0,inString=false,escaped=false;
 for(let i=start;i<html.length;i++){const c=html[i];if(inString){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')inString=false;}else if(c==='"')inString=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0)return JSON.parse(html.slice(start,i+1)) as Record<string,unknown>;}
 throw new Error('Invalid published data');
}
function row(calendar:unknown,date:string):unknown[]|null {if(!Array.isArray(calendar))return null;const month=calendar[Number(date.slice(5,7))-1],r=month?.[String(Number(date.slice(8,10)))];return Array.isArray(r)?r:null;}
export function adaptPublicTimetable(raw:Record<string,unknown>,slug:string,now=Date.now()):PublishedTimetable {
 if(typeof raw.timezone!=='string'||typeof raw.name!=='string'||!validCoordinates(raw.latitude,raw.longitude))throw new Error('Incomplete mosque identity');
 const zone=raw.timezone,today=mosqueDate(zone,new Date(now));
 const days=[-1,0,1,2,3,4,5,6,7].flatMap(offset=>{
  const date=addDays(today,offset),times=row(raw.calendar,date),iqamas=row(raw.iqamaCalendar,date);
  if(!times||![6,7].includes(times.length))return [];
  const imsak=times.length===7?1:0;
  const prayers=SALATS.map((key,index)=>{
   const value=times[[0,2,3,4,5][index]+imsak],adhan=validTime(value)?value:null;
   let adhanAt=adhan?zonedTime(date,adhan,zone):null;
   if(key==='isha'&&adhan&&adhan<'06:00')adhanAt=zonedTime(addDays(date,1),adhan,zone);
   const iq=raw.iqamaEnabled===true?iqamas?.[index]:null;
   let iqamaAt:number|null=null;
   if(validTime(iq)) {iqamaAt=zonedTime(date,iq,zone);if(key==='isha'&&iq<'06:00'&&(adhanAt===null||iqamaAt!==null&&iqamaAt<adhanAt))iqamaAt=zonedTime(addDays(date,1),iq,zone);}
   else if(typeof iq==='string'&&/^\+\d{1,3}$/.test(iq)&&Number(iq)<=180&&adhanAt!==null)iqamaAt=adhanAt+Number(iq)*60000;
   if(iqamaAt!==null&&adhanAt!==null&&(iqamaAt<adhanAt||iqamaAt-adhanAt>12*3600000))iqamaAt=null;
   return {key,adhan:adhanAt===null?null:adhan,adhanAt,iqama:iqamaAt===null?null:timeLabel(iqamaAt,zone),iqamaAt};
  });
  const jumua=isFriday(date)?[raw.jumuaAsDuhr===true?prayers[1].adhan:raw.jumua,raw.jumua2,raw.jumua3].flatMap(value=>{const time=validTime(value)?value:null,at=time?zonedTime(date,time,zone):null;return at===null?[]:[{time:time!,at}];}):[];
  return [{date,prayers,jumua}];
 });
 if(!days.length)throw new Error('Calendar unavailable');
 return {mosqueId:slug,source:'MAWAQIT',sourceUrl:`https://mawaqit.net/fr/${slug}`,timezone:zone,fetchedAt:now,days,mosque:{id:`mawaqit-${slug}`,name:raw.name.slice(0,180),city:'',lat:raw.latitude as number,lng:raw.longitude as number,sourceUrl:`https://mawaqit.net/fr/${slug}`,refs:{mawaqit:slug}}};
}
export async function readPublicTimetable(slug:string):Promise<PublishedTimetable>{
 if(!/^[a-z0-9][a-z0-9_-]{1,179}$/i.test(slug))throw new Error('Invalid slug');
 const response=await fetch(`https://mawaqit.net/fr/${slug}`,{headers:{Accept:'text/html','User-Agent':'QuranCoach/1.0 (+https://www.quran-coach.fr)'},redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw new Error('Published page unavailable');
 const reader=response.body?.getReader();if(!reader)throw new Error('Page unavailable');
 let size=0,html='';const decoder=new TextDecoder();
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>1500000)throw new Error('Page too large');html+=decoder.decode(value,{stream:true});}html+=decoder.decode();}finally{await reader.cancel();}
 return adaptPublicTimetable(extractConfData(html),slug);
}
