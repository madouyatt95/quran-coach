import { mosqueDate, safeMosqueUrl, validCoordinates, type Mosque } from './mosques.js';
export const SALATS = ['fajr','dhuhr','asr','maghrib','isha'] as const;
export type Salat = typeof SALATS[number];
export const SALAT_LABELS: Record<Salat,string> = {fajr:'Fajr',dhuhr:'Dhouhr',asr:'Asr',maghrib:'Maghrib',isha:'Isha'};
export interface MosquePrayer { start:string; adhan:string; iqama:string; mode:'fixed'|'offset'; offset:number; }
export interface FridaySession { khutba:string; prayer:string; }
export interface MosquePlan {
 mosque:Mosque; timezone:string; from:string; until:string; source:string; sourceUrl:string;
 prayers:Record<Salat,MosquePrayer>; friday:FridaySession[]; travel:number|null; margin:number; remind:boolean; confirmedAt:number;
}
export interface MosqueEvent { id:string; plan:MosquePlan; date:string; key:Salat|'friday'; label:string; at:number; target:number; depart:number|null; khutba?:number; published?:boolean; }
export const validTime=(s:unknown):s is string=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function validDate(s:unknown):s is string { if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(`${s}T12:00:00Z`);return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s; }
export function addDays(date:string,days:number){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export const isFriday=(date:string)=>new Date(`${date}T12:00:00Z`).getUTCDay()===5;
export function nextFriday(date:string){return addDays(date,(5-new Date(`${date}T12:00:00Z`).getUTCDay()+7)%7);}
export const timeLabel=(at:number,zone:string)=>new Intl.DateTimeFormat('fr-FR',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(at);
// Resolve a wall-clock value in its IANA timezone. Reject DST gaps and ambiguous repeated times.
const zonedCache=new Map<string,number|null>();
export function zonedTime(date:string,time:string,zone:string):number|null {
 const cacheKey=`${date}|${time}|${zone}`;if(zonedCache.has(cacheKey))return zonedCache.get(cacheKey)!;
 if(!validDate(date)||!validTime(time))return null;
 try {
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const wall=(at:number)=>{const p=fmt.formatToParts(at);const v=(k:string)=>p.find(x=>x.type===k)!.value;return `${v('year')}-${v('month')}-${v('day')}T${v('hour')}:${v('minute')}`;};
  const desired=`${date}T${time}`,base=Date.parse(`${desired}:00Z`);let guess=base;
  for(let i=0;i<3;i++)guess+=base-Date.parse(`${wall(guess)}:00Z`);
  const matches=[guess-3600000,guess-1800000,guess,guess+1800000,guess+3600000].filter(n=>wall(n)===desired);
  const result=matches.length===1?matches[0]:null;if(zonedCache.size>1024)zonedCache.clear();zonedCache.set(cacheKey,result);return result;
 }catch{return null;}
}
export function emptyPlan(mosque:Mosque,timezone=Intl.DateTimeFormat().resolvedOptions().timeZone):MosquePlan {
 const today=mosqueDate(timezone);
 return {mosque,timezone,from:today,until:today,source:'',sourceUrl:'',prayers:Object.fromEntries(SALATS.map(k=>[k,{start:'',adhan:'',iqama:'',mode:'fixed',offset:k==='maghrib'?5:10}])) as Record<Salat,MosquePrayer>,friday:[],travel:null,margin:5,remind:true,confirmedAt:0};
}
export function prayerInstants(plan:MosquePlan,date:string,key:Salat){
 const p=plan.prayers[key],start=p.start?zonedTime(date,p.start,plan.timezone):null,adhan=p.adhan?zonedTime(date,p.adhan,plan.timezone):null;
 let iqama=p.mode==='offset'?(adhan===null?null:adhan+p.offset*60000):(p.iqama?zonedTime(date,p.iqama,plan.timezone):null);
 if(key==='isha'&&p.mode==='fixed'&&iqama!==null&&p.iqama<'06:00'&&((adhan!==null&&iqama<adhan)||(start!==null&&iqama<start)))iqama=zonedTime(addDays(date,1),p.iqama,plan.timezone);
 return {start,adhan,iqama};
}
export function planErrors(p:MosquePlan):string[] {
 const errors:string[]=[];
 if(!p.mosque||!validCoordinates(p.mosque.lat,p.mosque.lng)||!p.mosque.id||!p.mosque.name||!safeMosqueUrl(p.mosque.sourceUrl))errors.push('Mosquée invalide.');
 if(!validDate(p.from)||!validDate(p.until)||p.until<p.from||p.until>addDays(p.from,62))errors.push('Choisissez une période de 63 jours maximum, avec une fin après le début.');
 try{new Intl.DateTimeFormat('fr',{timeZone:p.timezone}).format();}catch{errors.push('Choisissez un fuseau horaire valide (ex. Europe/Paris).');}
 if(!p.source.trim()||p.source.length>180)errors.push('Indiquez la source des horaires (affiche, calendrier ou site).');
 if(p.sourceUrl&&!safeMosqueUrl(p.sourceUrl))errors.push('Le lien de la source doit être une adresse HTTPS valide.');
 if(p.travel!==null&&(!Number.isInteger(p.travel)||p.travel<0||p.travel>240))errors.push('Le trajet doit être compris entre 0 et 240 minutes.');
 if(!Number.isInteger(p.margin)||p.margin<0||p.margin>60)errors.push('La marge doit être comprise entre 0 et 60 minutes.');
 let count=0;
 for(const key of SALATS){const r=p.prayers[key];if(!r){errors.push('Tableau incomplet.');continue;}
  if(!['fixed','offset'].includes(r.mode)||![r.start,r.adhan,r.iqama].every(t=>t===''||validTime(t))||!Number.isInteger(r.offset)||r.offset<0||r.offset>120){errors.push(`${SALAT_LABELS[key]} : vérifiez les heures et le délai (0 à 120 min).`);continue;}
  if(r.mode==='offset'&&!r.adhan)errors.push(`${SALAT_LABELS[key]} : renseignez l’adhan pour appliquer un délai.`);
  if(r.start||r.adhan||r.iqama||r.mode==='offset')count++;
  if(validDate(p.from)) {const t=prayerInstants(p,p.from,key);if(t.start!==null&&t.adhan!==null&&t.adhan<t.start)errors.push(`${SALAT_LABELS[key]} : l’adhan précède l’entrée de l’heure.`);if(t.iqama!==null&&(t.adhan!==null&&t.iqama<t.adhan||t.start!==null&&t.iqama<t.start))errors.push(`${SALAT_LABELS[key]} : l’iqama précède l’heure de référence.`);}
 }
 if(p.friday.length>3)errors.push('Trois sessions du vendredi au maximum.');
 for(const f of p.friday)if(!validTime(f.khutba)||!validTime(f.prayer)||f.prayer<f.khutba)errors.push('Vendredi : renseignez la khutba et une prière à la même heure ou après.');
 if(!errors.length){
  for(let date=p.from;date<=p.until;date=addDays(date,1)){
   const times=SALATS.flatMap(k=>{const r=p.prayers[k];return [r.start,r.adhan,r.mode==='fixed'?r.iqama:''];}).filter(Boolean);
   if(isFriday(date))times.push(...p.friday.flatMap(f=>[f.khutba,f.prayer]));
   if(times.some(t=>zonedTime(date,t,p.timezone)===null)){errors.push(`Le ${date}, une heure saisie est inexistante ou ambiguë avec le changement d’heure. Limitez la période et vérifiez les horaires de ce jour.`);break;}
  }
 }
 if(!count&&!p.friday.length)errors.push('Renseignez au moins un horaire ou une session du vendredi.');
 return errors;
}
export const planValidOn=(p:MosquePlan,date:string)=>p.confirmedAt>0&&date>=p.from&&date<=p.until;
export function eventsForDate(plan:MosquePlan,date:string):MosqueEvent[]{
 if(!planValidOn(plan,date))return [];
 const make=(key:Salat|'friday',at:number,target:number,label:string,index='',khutba?:number):MosqueEvent=>({id:`${plan.mosque.id}:${date}:${key}${index}`,plan,date,key,label,at,target,depart:plan.travel===null?null:target-(plan.travel+plan.margin)*60000,khutba});
 const events:MosqueEvent[]= [];
 for(const key of SALATS){if(key==='dhuhr'&&isFriday(date)&&plan.friday.length)continue;const {iqama}=prayerInstants(plan,date,key);if(iqama!==null)events.push(make(key,iqama,iqama,SALAT_LABELS[key]));}
 if(isFriday(date))plan.friday.forEach((f,i)=>{const at=zonedTime(date,f.prayer,plan.timezone),khutba=zonedTime(date,f.khutba,plan.timezone);if(at!==null&&khutba!==null)events.push(make('friday',at,khutba,`Vendredi · session ${i+1}`,String(i),khutba));});
 return events.sort((a,b)=>a.at-b.at);
}
export function upcomingEvents(plans:MosquePlan[],now:number,horizon=24):MosqueEvent[]{
 return plans.flatMap(p=>{const today=mosqueDate(p.timezone,new Date(now));return [-1,0,1].flatMap(d=>eventsForDate(p,addDays(today,d)));}).filter(e=>e.at>now&&e.at<=now+horizon*3600000).sort((a,b)=>a.at-b.at);
}
export function reachability(e:MosqueEvent,now:number):'unknown'|'comfortable'|'tight'|'late'{
 if(e.plan.travel===null||e.depart===null)return 'unknown';
 if(now<=e.depart)return 'comfortable';
 return now+e.plan.travel*60000<=e.target?'tight':'late';
}
export function parsePlan(raw:unknown):MosquePlan|null {
 try{const p=raw as MosquePlan;if(!p||typeof p!=='object'||typeof p.timezone!=='string'||typeof p.source!=='string'||typeof p.sourceUrl!=='string'||!Array.isArray(p.friday)||!p.prayers||typeof p.remind!=='boolean'||!Number.isFinite(p.confirmedAt)||!p.confirmedAt||planErrors(p).length)return null;return {...p,sourceUrl:safeMosqueUrl(p.sourceUrl)||''};}catch{return null;}
}
const escapeIcs=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const utc=(n:number)=>new Date(n).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
export function departureCalendar(event:MosqueEvent,now=Date.now()):string {
 if(event.depart===null||event.depart<=now)throw new Error('Le départ doit être à venir et le trajet renseigné.');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Quran Coach//Departs//FR','BEGIN:VEVENT',`UID:${event.id.replace(/[^\w:.-]/g,'_')}@quran-coach.fr`,`DTSTAMP:${utc(now)}`,`DTSTART:${utc(event.depart)}`,`DTEND:${utc(event.at+15*60000)}`,`SUMMARY:${escapeIcs(`Départ · ${event.label} · ${event.plan.mosque.name}`)}`,`LOCATION:${escapeIcs(event.plan.mosque.address||event.plan.mosque.name)}`,`DESCRIPTION:${escapeIcs(`Horaires ${event.published?'publiés par':'saisis depuis'} : ${event.plan.source}. ${event.khutba?`Khutba : ${timeLabel(event.khutba,event.plan.timezone)}. `:''}Iqama : ${timeLabel(event.at,event.plan.timezone)} (${event.plan.timezone}). Trajet estimé : ${event.plan.travel} min. Vérifiez auprès de la mosquée. Cet événement ne se met pas à jour automatiquement.`)}`,'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0S',`DESCRIPTION:${escapeIcs(`Départ pour ${event.plan.mosque.name}${event.khutba?' · khutba':''}`)}`,'END:VALARM','END:VEVENT','END:VCALENDAR'];
 // RFC 5545: fold at 75 octets without splitting a UTF-8 character.
 return lines.map(line=>{let out='',length=0;for(const char of line){const bytes=new TextEncoder().encode(char).length;if(length+bytes>75){out+='\r\n ';length=1;}out+=char;length+=bytes;}return out;}).join('\r\n')+'\r\n';
}
