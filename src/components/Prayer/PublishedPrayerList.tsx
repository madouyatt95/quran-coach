import { SALATS, SALAT_LABELS } from '../../lib/mosquePlanning';
import type { PublishedDay, PublishedTimetable } from '../../lib/mosqueTimetables';
export function PublishedPrayerList({day,timetable,nextKey}:{day:PublishedDay;timetable:PublishedTimetable;nextKey?:string}){
 return <section className="prayer-list" aria-label="Horaires publiés de la mosquée">
  <div className="prayer-list__title">🕌 {timetable.mosque.name}</div>
  {SALATS.map(key=>{const p=day.prayers.find(p=>p.key===key);return <div key={key} className={`prayer-row ${key===nextKey?'prayer-row--active':''}`}>
   <div className="prayer-row__left"><span className="prayer-row__name">{SALAT_LABELS[key]}</span></div>
   <div className="prayer-row__time-box"><span>Adhan <strong>{p?.adhan||'Non renseigné'}</strong></span><span>Iqama <strong>{p?.iqama||'Non renseignée'}</strong></span></div>
  </div>;})}
  {day.jumua.map((p,i)=><div key={`${p.at}-${i}`} className="prayer-row"><span>Jumu’a{day.jumua.length>1?` · ${i+1}`:''}</span><strong>{p.time}</strong></div>)}
  <p className="prayer-calculation-caption"><a href={timetable.sourceUrl} target="_blank" rel="noopener noreferrer">Horaires publiés · {timetable.source}</a> · Actualisés le {new Date(timetable.fetchedAt).toLocaleString('fr-FR')}</p>
 </section>;
}
