import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useMosqueStore } from '../../stores/mosqueStore';
import { directionsUrl, distanceKm, fetchMosqueSchedule, mosqueDate, safeMosqueUrl, type Mosque, type MosqueSchedule } from '../../lib/mosques';
import './PrayerExperience.css';
import { loadDirectory, useMosqueDirectoryStore } from '../../stores/mosqueDirectoryStore';
import { useMosquePlansStore } from '../../stores/mosquePlansStore';
import { locateMosqueSearch } from '../../lib/locationService';
import { normalizeMosqueName, mosqueMatchesId, type DirectoryResult } from '../../lib/mosqueDirectory';
import { nextKnownIqama } from '../../lib/mosqueTimetables';
import { SALATS, SALAT_LABELS } from '../../lib/mosquePlanning';
import { MosquePublishedSchedule } from './MosquePublishedSchedule';
import { MosquePlanPanel } from './MosquePlanning';
const MosqueMap = lazy(()=>import('./MosqueMap'));
const SOURCE = <a href="https://pray.zone/" target="_blank" rel="noopener noreferrer">Annuaire et horaires calculés : PrayerZone</a>;
export function MosqueInvocations() {
 return <div className="mosque-invocations" aria-label="Invocations de la mosquée"><Link to="/adhkar?cat=hisn_chap_12">🚶 En chemin</Link><Link to="/adhkar?cat=hisn_chap_13">🕌 En entrant</Link><Link to="/adhkar?cat=hisn_chap_14">🌿 En sortant</Link></div>;
}
export function MyMosqueCard({onOpen,onChoose}:{onOpen:(mosque:Mosque)=>void;onChoose:()=>void}) {
 const favorite=useMosqueStore(s=>s.favorite), timetable=useMosqueStore(s=>s.timetableUrl);
 return <section className="my-mosque-card">
  <div className="my-mosque-heading"><span aria-hidden="true">🕌</span><div><span className="prayer-eyebrow">MA MOSQUÉE</span><h2>{favorite?.name || 'Votre mosquée au quotidien'}</h2></div></div>
  <p>{favorite ? favorite.city : 'Choisissez votre mosquée pour retrouver ses horaires et votre itinéraire.'}</p>
  <div className="mosque-actions">{favorite ? <><button type="button" onClick={()=>onOpen(favorite)}>Voir la fiche</button>{timetable && <a href={timetable} target="_blank" rel="noopener noreferrer">Mes horaires enregistrés ↗</a>}<button type="button" className="mosque-secondary" onClick={onChoose}>Changer</button></> : <button type="button" onClick={onChoose}>Choisir ma mosquée</button>}</div>
  {favorite && <MosqueInvocations/>}
 </section>;
}
export function MosqueExplorer({lat,lng,city,onChooseCity,onOpen}:{lat:number|null;lng:number|null;city:string;onChooseCity:()=>void;onOpen:(m:Mosque)=>void}) {
 const [mosques,setMosques]=useState<Mosque[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[radius,setRadius]=useState(5000),[retry,setRetry]=useState(0),[filter,setFilter]=useState(''),[prayer,setPrayer]=useState('all');
 const [gps,setGps]=useState<{lat:number;lng:number}|null>(null),[locating,setLocating]=useState(false),[gpsError,setGpsError]=useState(''),[meta,setMeta]=useState<(DirectoryResult&{offline?:boolean})|null>(null),[now,setNow]=useState(()=>Date.now());
 const plans=useMosquePlansStore(s=>s.plans),published=useMosqueDirectoryStore(s=>s.published),links=useMosqueDirectoryStore(s=>s.links),automatic=useMosqueDirectoryStore(s=>s.automatic),discover=useMosqueDirectoryStore(s=>s.discover),favorite=useMosqueStore(s=>s.favorite);
 const listRef=useRef<HTMLDivElement>(null);
 const centerLat=gps?.lat??lat,centerLng=gps?.lng??lng;
 useEffect(()=>{setGps(null);},[lat,lng]);
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(id);},[]);
 useEffect(()=>{
  let active=true;setMosques([]);setError('');setMeta(null);setLoading(false);
  if(centerLat===null||centerLng===null)return;
  setLoading(true);
  loadDirectory(centerLat,centerLng,radius).then(result=>{if(active){setMosques(result.mosques);setMeta(result);}}).catch(err=>{if(active)setError(err instanceof Error?err.message:'Recherche indisponible.');}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[centerLat,centerLng,radius,retry]);
 // Load known calendars first, then only cards approaching the viewport. One request at a time.
 useEffect(()=>{
  let active=true,running=false;const queued=new Set<string>(),queue:Mosque[]=[];
  const enqueue=(m:Mosque)=>{if(queued.has(m.id))return;queued.add(m.id);queue.push(m);void drain();};
  const drain=async()=>{if(running)return;running=true;while(active&&queue.length){await discover(queue.shift()!);}running=false;};
  const matches=mosques.filter(m=>normalizeMosqueName(`${m.name} ${m.city} ${m.address||''}`).includes(normalizeMosqueName(filter)));
  matches.filter(m=>m.refs?.mawaqit).slice(0,prayer==='all'?8:24).forEach(enqueue);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const m=mosques.find(m=>m.id===(entry.target as HTMLElement).dataset.mosqueId);if(m&&(m.refs?.mawaqit||m.website))enqueue(m);}}, {rootMargin:'200px'});
  listRef.current?.querySelectorAll('[data-mosque-id]').forEach(el=>observer.observe(el));
  return()=>{active=false;observer.disconnect();};
 },[mosques,filter,prayer,discover]);
 const listed=mosques.map(m=>{const slug=links[m.id]||m.aliases?.map(id=>links[id]).find(Boolean)||automatic[m.id]?.slug;const linked=slug?{...m,refs:{...m.refs,mawaqit:slug}}:m;return {mosque:linked,next:nextKnownIqama(linked,plans,published,now,prayer)};});
 const visible=listed.filter(({mosque:m,next})=>normalizeMosqueName(`${m.name} ${m.city} ${m.address||''}`).includes(normalizeMosqueName(filter))&&(prayer==='all'||!!next));
 if(prayer!=='all')visible.sort((a,b)=>a.next!.at-b.next!.at);
 else if(centerLat!==null&&centerLng!==null)visible.sort((a,b)=>Number(!!b.mosque.refs?.mawaqit)-Number(!!a.mosque.refs?.mawaqit)||distanceKm({lat:centerLat,lng:centerLng},a.mosque)-distanceKm({lat:centerLat,lng:centerLng},b.mosque));
 const locate=async()=>{setLocating(true);setGpsError('');try{setGps(await locateMosqueSearch());}catch(err){setGpsError(err instanceof Error?err.message:'Position indisponible.');}finally{setLocating(false);}};
 return <section className="mosque-explorer" aria-label="Mosquées autour de la ville choisie">
  <div className="mosque-explorer-heading"><div><span className="prayer-eyebrow">{gps?'AUTOUR DE MA POSITION':`AUTOUR DE ${city||'VOTRE VILLE'}`}</span><h2>Votre prochaine prière,<br/>près de vous.</h2></div><button type="button" onClick={onChooseCity}>📍 {city||'Choisir une ville'}</button></div>
  <p className="mosque-caption">Un lieu, un itinéraire, les horaires disponibles.</p>
  <label className="mosque-filter mosque-name-search">Rechercher une mosquée<input type="search" value={filter} placeholder="Nom, adresse ou ville dans cette zone…" onChange={e=>setFilter(e.target.value)}/></label>
  <div className="mosque-discovery-tools"><button type="button" onClick={onChooseCity}>Rechercher une autre ville</button><button type="button" onClick={locate} disabled={locating}>⌖ {locating?'Localisation…':'Autour de moi'}</button></div>
  {gpsError&&<p role="alert" className="mosque-stale">{gpsError}</p>}
  {centerLat!==null&&centerLng!==null&&<Suspense fallback={<p className="mosque-loading">Ouverture de la carte…</p>}><MosqueMap mosques={visible.map(v=>v.mosque)} lat={centerLat} lng={centerLng} favoriteId={favorite?.id} onSelect={m=>onOpen(mosques.find(original=>original.id===m.id)||m)} onLocate={locate} locating={locating}/></Suspense>}
  <label className="mosque-filter">Prochaine prière avec horaire connu<select value={prayer} onChange={e=>setPrayer(e.target.value)}><option value="all">Toutes les mosquées</option><option value="next">Prochaine Iqama connue</option>{SALATS.map(k=><option key={k} value={k}>{SALAT_LABELS[k]}</option>)}<option value="friday">Jumu’a</option></select></label>
  {prayer!=='all'&&<p className="mosque-caption">Prochaines prières dont l’horaire est disponible.</p>}
  {loading&&<p role="status" className="mosque-loading">Recherche des mosquées…</p>}
  {error&&<div className="mosque-status" role="alert"><p>{error}</p><button type="button" onClick={()=>setRetry(r=>r+1)}>Réessayer</button></div>}
  {meta?.offline&&<p role="status" className="mosque-stale">Annuaire enregistré · connexion indisponible. Actualisé le {new Date(meta.fetchedAt).toLocaleDateString('fr-FR')}.</p>}
  {!!meta?.unavailable.length&&<p className="mosque-caption">Résultats partiels : {meta.unavailable.map(p=>p==='osm'?'OpenStreetMap':p==='prayerzone'?'PrayerZone':'MAWAQIT').join(', ')} indisponible.</p>}
  {!loading&&!error&&centerLat!==null&&centerLng!==null&&<>
   <p className="mosque-caption">{mosques.filter(m=>m.refs?.mawaqit).length} mosquées avec calendrier.</p>
   <div className="mosque-result-heading"><strong>{visible.length} lieu{visible.length>1?'x':''}</strong><span>À {radius/1000} km · distances à vol d’oiseau</span></div>
   {!visible.length&&<div className="mosque-empty"><strong>{prayer!=='all'?'Aucune Iqama connue pour ce filtre.':mosques.length?'Aucune mosquée ne correspond à cette recherche.':'Aucune mosquée recensée dans cette zone.'}</strong><p>{prayer!=='all'?'Les calendriers se chargent progressivement. Affichez toutes les mosquées pour en consulter davantage.':'Essayez une autre ville ou élargissez la recherche.'}</p>{(filter||prayer!=='all')&&<button type="button" onClick={()=>{setFilter('');setPrayer('all');}}>Réinitialiser les filtres</button>}</div>}
   <div className="mosque-list" ref={listRef}>{visible.map(({mosque:m,next})=><button type="button" key={m.id} data-mosque-id={m.id} onClick={()=>onOpen(mosques.find(original=>original.id===m.id)||m)}><span className="mosque-pin" aria-hidden="true">{favorite&&mosqueMatchesId(m,favorite.id)?'★':'🕌'}</span><span><strong>{m.name}</strong><small>{m.city||m.address||'Voir la fiche'} · {distanceKm({lat:centerLat,lng:centerLng},m).toFixed(1)} km</small>{next?<span className="mosque-next-iqama">{next.label} · {next.key==='friday'?'Prière':'Iqama'} {next.time}{mosqueDate(next.timezone,new Date(next.at))!==mosqueDate(next.timezone,new Date(now))?' · demain':''}<small>{next.personal?'Saisie personnelle':'MAWAQIT'} · {next.timezone}</small></span>:<small>{m.refs?.mawaqit&&!automatic[m.id]?'Chargement des horaires…':automatic[m.id]?.status==='unavailable'?'Horaires momentanément indisponibles':'Horaires d’Iqama non renseignés'}</small>}{m.matchUncertain&&<small>Lieu proche · à vérifier</small>}</span><span aria-hidden="true">↗</span></button>)}</div>
   {radius===5000&&<button type="button" className="mosque-expand" onClick={()=>setRadius(15000)}>Élargir à 15 km</button>}
  </>}
  {centerLat===null&&<button type="button" onClick={onChooseCity}>Choisir une ville</button>}
  <p className="mosque-source">Horaires : <a href="https://mawaqit.net" target="_blank" rel="noopener noreferrer">MAWAQIT</a> · Carte et lieux : <a href="https://pray.zone" target="_blank" rel="noopener noreferrer">PrayerZone</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap (ODbL)</a></p>
 </section>;
}
export function MosqueSheet({mosque,onClose}:{mosque:Mosque;onClose:()=>void}) {
 const favorite=useMosqueStore(s=>s.favorite),setFavorite=useMosqueStore(s=>s.setFavorite), savedUrl=useMosqueStore(s=>s.timetableUrl),setUrl=useMosqueStore(s=>s.setTimetableUrl);
 const selected=!!favorite&&mosqueMatchesId(mosque,favorite.id);
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
 const [schedule,setSchedule]=useState<MosqueSchedule|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0),[url,setInput]=useState(selected?savedUrl:''),[urlError,setUrlError]=useState(''),[saved,setSaved]=useState(false);
 const ref=useRef<HTMLDivElement>(null), closeRef=useRef(onClose);
 useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'){
   const controls=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,summary')||[]).filter(x=>x.getClientRects().length);
   const first=controls[0],last=controls.at(-1);
   if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }};document.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',onKey);if(previous?.isConnected)previous.focus();};
 },[]);
 // Clear the previous provider response before starting a request for this sheet.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{let active=true;setSchedule(null);setError('');const id=mosque.refs?.prayerzone||(!mosque.refs?mosque.id:null);if(!id){setLoading(false);return;}setLoading(true);fetchMosqueSchedule(id).then(value=>{if(active)setSchedule(value);}).catch(()=>{if(active)setError('Les repères horaires sont momentanément indisponibles.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[mosque.id,mosque.refs,retry]);
 const current=schedule && schedule.date===mosqueDate(schedule.timezone,new Date(now));
 return createPortal(<div className="mosque-sheet-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div ref={ref} className="mosque-sheet" role="dialog" aria-modal="true" aria-labelledby="mosque-sheet-title">
  <div className="mosque-sheet-handle" aria-hidden="true"/><header><span className="prayer-eyebrow">🕌 FICHE MOSQUÉE</span><button type="button" onClick={onClose} aria-label="Fermer la fiche mosquée">✕</button></header>
  <h2 id="mosque-sheet-title">{mosque.name}</h2><p>{schedule?.address || mosque.address || mosque.city}</p>
  <div className="mosque-actions"><button type="button" aria-pressed={selected} onClick={()=>setFavorite(selected?null:{...mosque,address:schedule?.address||mosque.address})}>{selected?'★ Ma mosquée · Retirer':'☆ Choisir ma mosquée'}</button></div>
  <div className="mosque-directions"><span>Y aller à pied</span><a href={directionsUrl(mosque,'apple')} target="_blank" rel="noopener noreferrer">Apple Plans ↗</a><a href={directionsUrl(mosque,'google')} target="_blank" rel="noopener noreferrer">Google Maps ↗</a></div>
  <MosquePublishedSchedule mosque={mosque} now={now}/>
  <MosquePlanPanel mosque={{...mosque,address:schedule?.address||mosque.address}} timezone={schedule?.timezone} now={now}/>
  <details className="mosque-timetable"><summary>Lien rapide vers les horaires de la mosquée</summary><p>L’annuaire ne fournit pas les iqamas. Retrouvez ici le lien publié par votre mosquée.</p>
   {selected && savedUrl && <a className="mosque-timetable-link" href={savedUrl} target="_blank" rel="noopener noreferrer">Ouvrir mon lien d’horaires ↗</a>}
   <form onSubmit={e=>{e.preventDefault();const clean=safeMosqueUrl(url);if(!clean){setUrlError('Saisissez un lien HTTPS complet.');return;}setFavorite({...mosque,address:schedule?.address||mosque.address});setUrl(clean);setUrlError('');setSaved(true);}}>
    <label htmlFor="mosque-timetable-url">Lien Mawaqit, Masjidbox ou site de votre mosquée</label><input id="mosque-timetable-url" type="url" inputMode="url" placeholder="https://…" value={url} onChange={e=>{setInput(e.target.value);setSaved(false);}}/>
    <button type="submit">Enregistrer pour ma mosquée</button>{urlError && <p role="alert">{urlError}</p>}{saved && <p role="status">Lien enregistré.</p>}
   </form>
  </details>
  {(mosque.refs?.prayerzone||!mosque.refs)&&<details className="mosque-calculated"><summary>Repères calculés à cette adresse</summary><p>Heures de début calculées par PrayerZone. Elles ne sont pas confirmées par la mosquée et ne représentent pas les iqamas.</p>
   {loading && <p role="status">Chargement des repères…</p>}{error && <><p role="alert">{error}</p><button type="button" onClick={()=>setRetry(n=>n+1)}>Réessayer</button></>}
   {schedule && <><p>{schedule.date.split('-').reverse().join('/')} · {schedule.timezone}</p>{!current && <p className="mosque-stale">Ces horaires ne correspondent pas à aujourd’hui.</p>}<dl>{schedule.times.map(time=><div key={time.id}><dt>{time.name}</dt><dd>{time.time}</dd></div>)}</dl></>}
  </details>
  }<h3>Accompagner votre visite</h3><MosqueInvocations/>
  <p className="mosque-source">{(mosque.refs?.prayerzone||!mosque.refs)?SOURCE:<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">Annuaire : © OpenStreetMap (ODbL)</a>} · <a href={mosque.sourceUrl} target="_blank" rel="noopener noreferrer">Voir la fiche source ↗</a></p>
 </div></div>,document.body);
}
