import { syncCarPrayerSnapshot } from '../../lib/carExperience';
import { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNotificationStore } from '../../stores/notificationStore';
import { usePrayerStore } from '../../stores/prayerStore';
import { activeMosque, useMosqueStore } from '../../stores/mosqueStore';
import { useMosqueDirectoryStore } from '../../stores/mosqueDirectoryStore';
import { scheduleSlug } from '../../lib/mosqueScheduleEvents';
import { buildAdhanEvents, dueAdhan } from '../../lib/adhanSchedule';
import { syncNativeAdhan } from '../../lib/adhanNative';
import { playAdhan, stopAdhan, useAdhanPlayback } from '../../lib/adhanPlayback';
import './AdhanPlayer.css';

const SEEN_KEY = 'quran-coach-adhan-played-v1';
function seen(): string[] {
  try { const data: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); return Array.isArray(data) ? data.filter(x => typeof x === 'string') : []; } catch { return []; }
}
export function AdhanPlayer() {
  const prefs = useNotificationStore();
  const { lat, lng, settings } = usePrayerStore();
  const mosque = useMosqueStore(activeMosque);
  const { links, automatic, published } = useMosqueDirectoryStore();
  const slug = mosque ? scheduleSlug(mosque, links, automatic) : undefined;
  const timetable = slug ? published[slug] : undefined;
  const [clock, setClock] = useState(() => Date.now());
  const [nativeError, setNativeError] = useState('');
  const state = useAdhanPlayback();
  const events = useMemo(() => buildAdhanEvents({ now: clock, lat, lng, settings, sound: prefs.adhanSound, timetable }), [clock, lat, lng, settings, prefs.adhanSound, timetable]);
  useEffect(() => {
    const tick = () => setClock(Date.now());
    const timer = setInterval(tick, 60000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  useEffect(() => { void syncCarPrayerSnapshot(events); }, [events]);
  useEffect(() => {
    let active = true;
    void syncNativeAdhan(events, prefs.adhanEnabled && prefs.enabled && prefs.prayerEnabled)
      .then(() => { if (active) setNativeError(''); })
      .catch(() => { if (active) setNativeError('Les alertes d’adhan n’ont pas pu être programmées. Vérifiez les autorisations de notification.'); });
    return () => { active = false; };
  }, [events, prefs.adhanEnabled, prefs.enabled, prefs.prayerEnabled]);
  useEffect(() => {
    if (!prefs.adhanEnabled || Capacitor.isNativePlatform()) return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      const played = seen(); const due = dueAdhan(events, Date.now(), played);
      if (!due) return;
      try { localStorage.setItem(SEEN_KEY, JSON.stringify([...played, due.key].slice(-50))); } catch { /* Memory below still prevents repeats. */ }
      if (fired.has(due.key)) return;
      fired.add(due.key);
      void playAdhan(due.recording, `Adhan · ${due.label}`);
    };
    const timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [events, prefs.adhanEnabled]);
  if (state.status === 'idle' && !nativeError) return null;
  return <aside className="adhan-player" aria-label="Lecteur de l’adhan">
    <div aria-live="polite"><strong>{state.title || 'Adhan'}</strong><p>{nativeError || state.error || (state.status === 'loading' ? 'Chargement…' : 'En cours de lecture')}</p></div>
    {state.status === 'error' && state.id && <button onClick={() => void playAdhan(state.id!, state.title)}>Réessayer</button>}
    <button onClick={() => { stopAdhan(); setNativeError(''); }}>{state.status === 'error' || nativeError ? 'Fermer' : 'Arrêter'}</button>
  </aside>;
}
const fired = new Set<string>();
