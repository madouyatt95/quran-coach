import type { Mosque } from './mosques.js';
import { mosqueDate } from './mosques.js';
import { SALATS, SALAT_LABELS, eventsForDate, planValidOn, prayerInstants, timeLabel, upcomingEvents, type MosquePlan, type Salat } from './mosquePlanning.js';
export interface PublishedPrayer { key: Salat; adhan: string|null; iqama: string|null; adhanAt: number|null; iqamaAt: number|null; }
export interface PublishedDay { date: string; prayers: PublishedPrayer[]; jumua: { time:string; at:number }[]; }
export interface PublishedTimetable { mosque: Mosque; mosqueId: string; source: 'MAWAQIT'; sourceUrl: string; timezone: string; fetchedAt: number; days: PublishedDay[]; }
export interface IqamaSummary { key: Salat|'friday'; label:string; time:string; at:number; timezone:string; personal:boolean; }
export function personalPlan(m: Mosque, plans: Record<string,MosquePlan>) { return plans[m.id] || m.aliases?.map(id=>plans[id]).find(Boolean); }
export function timetableFresh(t:PublishedTimetable,now:number){return Number.isFinite(t.fetchedAt)&&now>=t.fetchedAt-60000&&now-t.fetchedAt<3600000;}
export function nextKnownIqama(m:Mosque,plans:Record<string,MosquePlan>,published:Record<string,PublishedTimetable>,now:number,key='all'):IqamaSummary|undefined {
 const t=m.refs?.mawaqit?published[m.refs.mawaqit]:undefined;
 if(!t||!timetableFresh(t,now)){
  const plan=personalPlan(m,plans);
  const event=plan?upcomingEvents([plan],now).find(e=>key==='all'||key==='next'||e.key===key):undefined;
  if(event&&plan)return {key:event.key,label:event.label,time:timeLabel(event.at,plan.timezone),at:event.at,timezone:plan.timezone,personal:true};
  return;
 }
 return t.days.flatMap(d=>[
  ...d.prayers.filter(p=>!(p.key==='dhuhr'&&d.jumua.length)).map(p=>({key:p.key,label:SALAT_LABELS[p.key],time:p.iqama||'',at:p.iqamaAt??0,timezone:t.timezone,personal:false})),
  ...d.jumua.map(p=>({key:'friday' as const,label:'Jumu’a',time:p.time,at:p.at,timezone:t.timezone,personal:false}))
 ]).filter(p=>p.at>now&&p.at<=now+86400000&&(key==='all'||key==='next'||p.key===key)).sort((a,b)=>a.at-b.at)[0];
}
export function personalDay(plan:MosquePlan,now:number):PublishedDay|null {
 const date=mosqueDate(plan.timezone,new Date(now));if(!planValidOn(plan,date))return null;
 return {date,prayers:SALATS.map(key=>{const t=prayerInstants(plan,date,key);return {key,adhan:plan.prayers[key].adhan||null,iqama:t.iqama===null?null:timeLabel(t.iqama,plan.timezone),adhanAt:t.adhan,iqamaAt:t.iqama};}),jumua:eventsForDate(plan,date).filter(e=>e.key==='friday').map(e=>({time:timeLabel(e.at,plan.timezone),at:e.at}))};
}
