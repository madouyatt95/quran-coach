import { emptyPlan, eventsForDate, SALATS, SALAT_LABELS, type MosqueEvent, type MosquePlan } from './mosquePlanning';
import { personalPlan, timetableFresh, type PublishedTimetable } from './mosqueTimetables';
import type { Mosque } from './mosques';
export function scheduleSlug(m:Mosque,links:Record<string,string>,automatic:Record<string,{slug?:string}>){
 const ids=[m.id,...m.aliases||[]];
 return ids.map(id=>links[id]).find(Boolean)||m.refs?.mawaqit||ids.map(id=>automatic[id]?.slug).find(Boolean);
}
/** Published instants are authoritative; no inferred khutba or iqama. Personal travel preferences still apply. */
export function mosqueScheduleEvents(m:Mosque,plans:Record<string,MosquePlan>,t:PublishedTimetable|undefined,now:number,date?:string):MosqueEvent[]{
 const personal=personalPlan(m,plans);
 if(t&&timetableFresh(t,now))return t.days.filter(d=>!date||d.date===date).flatMap(d=>{
  const plan: MosquePlan={...emptyPlan(m,t.timezone),from:d.date,until:d.date,source:'MAWAQIT',sourceUrl:t.sourceUrl,confirmedAt:t.fetchedAt,travel:personal?.travel??null,margin:personal?.margin??5};
  for(const key of SALATS){const p=d.prayers.find(p=>p.key===key);plan.prayers[key]={start:'',adhan:p?.adhan||'',iqama:p?.iqama||'',mode:'fixed',offset:0};}
  const make=(key:MosqueEvent['key'],at:number,label:string,index=0):MosqueEvent=>({id:`${m.id}:${d.date}:${key}:${index}`,plan,date:d.date,key,label,at,target:at,depart:plan.travel===null?null:at-(plan.travel+plan.margin)*60000,published:true});
  return [...d.prayers.filter(p=>p.iqamaAt!==null&&!(p.key==='dhuhr'&&d.jumua.length)).map(p=>make(p.key,p.iqamaAt!,SALAT_LABELS[p.key])),...d.jumua.map((p,i)=>make('friday',p.at,`Jumu’a${d.jumua.length>1?` · ${i+1}`:''}`,i))];
 }).sort((a,b)=>a.at-b.at);
 if(!personal)return [];
 if(date)return eventsForDate(personal,date);
 // Personal plans can span multiple days; callers choose the desired horizon.
 const dates=Array.from({length:9},(_,i)=>new Date(now+(i-1)*86400000));
 return [...new Set(dates.map(d=>new Intl.DateTimeFormat('en-CA',{timeZone:personal.timezone}).format(d)))].flatMap(d=>eventsForDate(personal,d)).sort((a,b)=>a.at-b.at);
}
