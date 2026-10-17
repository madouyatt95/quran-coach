import { SALATS, SALAT_LABELS } from './mosquePlanning';
import { mosqueDate } from './mosques';
import { timetableFresh, type PublishedTimetable } from './mosqueTimetables';

/** A complete published Adhan day is required; never mix different mosques or invent missing Iqamas. */
export function publishedDay(t:PublishedTimetable|undefined,now:number,date?:string){
 if(!t||!timetableFresh(t,now))return undefined;
 const day=t.days.find(d=>d.date===(date||mosqueDate(t.timezone,new Date(now))));
 return day&&SALATS.every(key=>day.prayers.some(p=>p.key===key&&p.adhan&&p.adhanAt!=null&&Number.isFinite(p.adhanAt)))?day:undefined;
}
export function publishedNext(t:PublishedTimetable|undefined,now:number){
 if(!publishedDay(t,now)||!t)return undefined;
 return t.days.flatMap(day=>[
  ...day.prayers.filter(p=>!(p.key==='dhuhr'&&day.jumua.length)).flatMap(p=>[
   ...(p.adhan&&p.adhanAt!=null?[{key:p.key,label:SALAT_LABELS[p.key],kind:'Adhan',at:p.adhanAt,time:p.adhan,adhan:p.adhan,iqama:p.iqama}]:[]),
   ...(p.iqama&&p.iqamaAt!=null?[{key:p.key,label:SALAT_LABELS[p.key],kind:'Iqama',at:p.iqamaAt,time:p.iqama,adhan:p.adhan,iqama:p.iqama}]:[])
  ]),
  ...day.jumua.map(p=>({key:'friday',label:'Jumu’a',kind:'Jumu’a',at:p.at,time:p.time,adhan:null,iqama:null}))
 ]).filter(e=>e.at>now&&e.at<now+36*3600000).sort((a,b)=>a.at-b.at||(a.kind==='Iqama'?-1:1))[0];
}
export function prayerCountdown(at:number,now:number){
 const seconds=Math.max(0,Math.floor((at-now)/1000));
 const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);
 return `${hours?`${hours}h `:''}${minutes}m ${seconds%60}s`;
}
