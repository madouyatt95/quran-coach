import { useId, useState, type CSSProperties } from 'react';
import type { DayResult } from '../../lib/prayerEngine';
import { skyFrame } from '../../lib/prayerSky';
import { MosqueTimelineDetail } from './MosquePlanning';
import './PrayerSunArc.css';
const KEYS=['fajr','sunrise','dhuhr','asr','maghrib','isha'] as const;
const LABELS=['Fajr','Lever','Dhouhr','Asr','Maghrib','Isha'];
const STARS=[[24,38],[72,61],[110,26],[157,72],[199,34],[245,58],[290,21],[348,66],[377,32],[52,99],[320,95]];
export function PrayerSunArc({day,now,isToday}:{day:DayResult;now:number;isToday:boolean}) {
 const id=useId().replace(/:/g,''),[selection,setSelection]=useState<{date:string;at:number;index?:number}|null>(null);
 const selected=selection?.date===day.date?selection:null;
 const at=selected?.at??(isToday?now:+day.times.dhuhr);
 const times=KEYS.map(key=>+day.times[key]),frame=skyFrame(at,times);
 if(!frame)return null;
 const active=selected?.index;
 const clock=new Date(at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 const remaining=Math.max(1,Math.ceil((+day.times.maghrib-at)/60000));
 const duration=remaining>=60?`${Math.floor(remaining/60)} h ${String(remaining%60).padStart(2,'0')}`:`${remaining} min`;
 const caption=at<+day.times.sunrise?`Lever à ${day.formattedTimes.sunrise}`:at<+day.times.maghrib?`Coucher dans ${duration}`:`Coucher à ${day.formattedTimes.maghrib}`;
 const phase=at<times[0]?'La nuit paisible':at<times[1]?'Les premières lueurs':at<times[2]?'La lumière du matin':at<times[3]?'Au cœur du jour':at<times[4]?'La lumière décline':at<times[5]?'Les dernières lueurs':'La nuit paisible';
 return <section className={`prayer-sky ${selected?'prayer-sky--exploring':''}`} aria-label="Le ciel au fil des prières" style={{'--sky-top':frame.colors[0],'--sky-mid':frame.colors[1],'--sky-horizon':frame.colors[2]} as CSSProperties}>
  <div className="prayer-sky-scene">
   <svg viewBox="0 0 400 218" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs>
     <linearGradient id={`sky-${id}`} x2="0" y2="1"><stop stopColor="var(--sky-top)"/><stop offset=".6" stopColor="var(--sky-mid)"/><stop offset="1" stopColor="var(--sky-horizon)"/></linearGradient>
     <radialGradient id={`halo-${id}`}><stop stopColor="#ffe4ac" stopOpacity=".65"/><stop offset=".35" stopColor="#ffd09a" stopOpacity=".2"/><stop offset="1" stopColor="#ffd09a" stopOpacity="0"/></radialGradient>
     <linearGradient id={`orb-${id}`} x2="0" y2="1"><stop stopColor="#fff8df"/><stop offset="1" stopColor="#ffd49e"/></linearGradient>
     <clipPath id={`horizon-${id}`}><rect width="400" height="156"/></clipPath>
     <clipPath id={`clip-${id}`}><rect width="400" height="218" rx="22"/></clipPath>
    </defs>
    <g clipPath={`url(#clip-${id})`}>
     <rect width="400" height="218" fill={`url(#sky-${id})`}/>
     <g className="prayer-sky-stars" opacity={frame.stars}>{STARS.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?1.2:.65} fill="#f9e9ff" opacity={.4+(i%3)*.2}/>)}</g>
     <g className="prayer-sky-moon" opacity={frame.stars}><path d="M327 38a13 13 0 1 0 13 19 14 14 0 0 1-13-19Z" fill="#ede0ef" opacity=".9"/></g>
     <path d="M35 156 Q200 -59 365 156" fill="none" stroke="#fff1dc" strokeWidth=".7" strokeDasharray="2 7" opacity=".18"/>
     <g clipPath={`url(#horizon-${id})`}><g className="prayer-sky-sun" style={{transform:`translate(${frame.x}px,${frame.y}px)`,opacity:frame.night?0:1}}><circle r="65" fill={`url(#halo-${id})`}/><circle r="12" fill={`url(#orb-${id})`}/></g></g>
     <path d="M-20 168 Q55 126 137 157 T292 158 Q348 137 420 158 V240 H-20Z" fill="#746187" opacity=".75"/>
     <path d="M-20 185 Q60 151 169 177 T420 170 V240 H-20Z" fill="#413859" opacity=".88"/>
     <g fill="#302b48"><path d="M265 205v-52h45v52zm3-22a19 17 0 0 1 39 0zM317 205v-75h5v75zm-2-48 5-10 5 10z"/><path d="M286 138v-6" stroke="#302b48" strokeWidth="1.5"/></g>
     <path d="M-20 201 Q77 174 170 191 T420 189 V240 H-20Z" fill="#24233e"/>
     <path d="M-20 202 Q77 175 170 192 T420 190" fill="none" stroke="#d4b6c4" strokeOpacity=".12"/>
    </g>
   </svg>
   <div className="prayer-sky-heading"><span>{selected?'EXPLORER LA JOURNÉE':isToday?'LE CIEL MAINTENANT':'LE CIEL DE CE JOUR'}</span><strong>{phase}</strong></div>
   <div className="prayer-sky-caption"><span>{caption}</span><span>{selected?'Glissez pour voyager':'Glissez pour explorer'}</span></div>
   {selected&&<span className="prayer-sky-bubble" style={{left:`${15+frame.progress*70}%`}}>{clock}</span>}
   <input className="prayer-sky-control" type="range" min={frame.start} max={frame.end} step={60000} value={Math.max(frame.start,Math.min(frame.end,at))} aria-label="Explorer le ciel et les horaires" aria-valuetext={`${clock} · ${phase}`} onChange={e=>setSelection({date:day.date,at:Number(e.target.value)})}/>
  </div>
  <div className="prayer-sky-stops" aria-label="Explorer une prière">{KEYS.map((key,i)=><button key={key} type="button" aria-pressed={active===i} onClick={()=>setSelection({date:day.date,at:+day.times[key],index:i})}><span>{LABELS[i]}</span><small>{day.formattedTimes[key]}</small></button>)}</div>
  {selected&&<div className="prayer-sky-detail"><div><strong>{active!==undefined?`${LABELS[active]} · `:''}{clock}</strong><button type="button" onClick={()=>setSelection(null)}>{isToday?'Revenir à maintenant':'Fermer'}</button></div>{active!==undefined&&KEYS[active]!=='sunrise'&&<MosqueTimelineDetail date={day.date} prayer={KEYS[active]} now={now}/>}</div>}
 </section>;
}
