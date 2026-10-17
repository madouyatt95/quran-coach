import { useEffect } from 'react';
import { refreshPrayerLocation } from '../lib/locationService';
import { usePrayerStore } from '../stores/prayerStore';

/** Foreground only, shared by the home and prayer routes. */
export function usePrayerLocation(enabled:boolean) {
 const mode=usePrayerStore(s=>s.locationMode);
 useEffect(()=>{
  if(!enabled||mode!=='auto')return;
  const refresh=()=>{if(document.visibilityState==='visible')void refreshPrayerLocation();};
  refresh();
  const timer=window.setInterval(refresh,120000);
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[enabled,mode]);
}
