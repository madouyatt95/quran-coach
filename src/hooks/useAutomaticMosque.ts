import { usePrayerStore } from '../stores/prayerStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { locateMosqueSearch, syncPrayerPosition } from '../lib/locationService';
import { distanceKm, type Mosque } from '../lib/mosques';
import { publishedDay } from '../lib/publishedPrayerClock';
import { scheduleSlug } from '../lib/mosqueScheduleEvents';
import { useMosqueStore } from '../stores/mosqueStore';
import { loadDirectory, useMosqueDirectoryStore } from '../stores/mosqueDirectoryStore';

export function useAutomaticMosque(enabled=true) {
 const mode=useMosqueStore(s=>s.selectionMode);
 const [position,setPosition]=useState<{lat:number;lng:number}|null>(null);
 const [alternative,setAlternative]=useState<Mosque|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const runId=useRef(0),running=useRef(false),last=useRef<{lat:number;lng:number;at:number}|null>(null);
 const refresh=useCallback(async(force=false)=>{
  if(running.current)return;
  running.current=true;const id=++runId.current;setBusy(true);setError('');
  const active=()=>id===runId.current&&useMosqueStore.getState().selectionMode==='nearby';
  try {
   const point=await locateMosqueSearch();if(!active())return;
   if(point.accuracy&&point.accuracy>1500){useMosqueStore.getState().setNearby(null);throw new Error('Position trop approximative pour choisir une mosquée. Activez la position précise ou choisissez sur la carte.');}
   setPosition(point);
   void syncPrayerPosition(point).catch(()=>{});
   if(!force&&last.current&&Date.now()-last.current.at<15*60000&&distanceKm(point,last.current)<.5)return;
   setAlternative(null);
   // Remove an old area's selection immediately when travelling, even if the new directory fails.
   const old=useMosqueStore.getState().nearby;
   if(old&&distanceKm(point,old)>15)useMosqueStore.getState().setNearby(null);
   const checked=new Set<string>();
   let found:Mosque|null=null;
   let closest:Mosque|null=null;
   let limited=false;
   for(const radius of [5000,15000]){
    const result=await loadDirectory(point.lat,point.lng,radius);if(!active())return;
    if(result.offline)setError('Connexion indisponible : lieux enregistrés. Les horaires doivent être actualisés.');
    const candidates=result.mosques.filter(m=>!m.matchUncertain&&distanceKm(point,m)<=radius/1000).sort((a,b)=>distanceKm(point,a)-distanceKm(point,b));
    closest ||= candidates[0]||null;
    for(const m of candidates){
     if(checked.has(m.id))continue;
     // Ten sequential lookups per refresh; cached directory/provider responses are reused.
     if(checked.size>=10){limited=true;break;}
     if(!active())return;checked.add(m.id);
     const store=useMosqueDirectoryStore.getState(),slug=scheduleSlug(m,store.links,store.automatic);
     try{if(slug)await store.loadPublished(slug);else await store.discover(m);}catch{continue;}
     if(!active())return;
     const updated=useMosqueDirectoryStore.getState(),key=scheduleSlug(m,updated.links,updated.automatic);
     if(publishedDay(key?updated.published[key]:undefined,Date.now())){found=m;break;}
    }
    if(found||limited)break;
   }
   if(!active())return;
   useMosqueStore.getState().setNearby(found);
   setAlternative(found&&closest&&found.id!==closest.id?closest:null);
   if(!found)setError(limited?'Aucun horaire complet parmi les dix mosquées les plus proches vérifiées. Horaires calculés affichés.':'Aucun horaire publié complet trouvé à moins de 15 km. Horaires calculés affichés.');
   if(active())last.current={...point,at:Date.now()};
  }catch(e){if(active())setError(e instanceof Error?e.message:'Recherche indisponible. Réessayez.');}
  finally{if(id===runId.current){running.current=false;setBusy(false);}}
 },[]);
 useEffect(()=>{
  if(!enabled||mode!=='nearby')return;
  void refresh(true);
  const resume=()=>{if(document.visibilityState==='visible')void refresh();};
  const timer=window.setInterval(resume,120000);
  document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);
  // This ref is a request-generation counter, intentionally invalidated at cleanup.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return()=>{runId.current++;running.current=false;window.clearInterval(timer);document.removeEventListener('visibilitychange',resume);window.removeEventListener('focus',resume);};
 },[mode,refresh,enabled]);
 const enable=()=>{usePrayerStore.getState().setLocationMode('auto');if(mode==='nearby')void refresh(true);else useMosqueStore.getState().setSelectionMode('nearby');};
 const lock=(mosque:Mosque)=>useMosqueStore.getState().setFavorite(mosque);
 return {mode,position,alternative,busy:mode==='nearby'&&busy,error:mode==='nearby'?error:'',enable,lock};
}
