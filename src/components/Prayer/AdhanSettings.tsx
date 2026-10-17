import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ADHAN_RECORDINGS, ADHAN_SOURCE, adhanRecording } from '../../lib/adhanCatalog';
import { playAdhan, stopAdhan, useAdhanPlayback } from '../../lib/adhanPlayback';
import { useNotificationStore } from '../../stores/notificationStore';
import './AdhanPlayer.css';
export function AdhanSettings() {
  const prefs = useNotificationStore();
  const playback = useAdhanPlayback();
  useEffect(() => () => { if (useAdhanPlayback.getState().title === 'Préécoute de l’adhan') stopAdhan(); }, []);
  return <section className="ps-section">
    <h2 className="ps-section__title">🔊 L’adhan</h2>
    <p className="ps-section__desc">Écoutez les enregistrements, puis choisissez votre appel pour Dhuhr, Asr, Maghrib et Isha. Fajr possède son enregistrement dédié.</p>
    <div className="adhan-recordings">{ADHAN_RECORDINGS.map(recording => {
      const selected = !recording.fajr && adhanRecording(prefs.adhanSound).id === recording.id;
      const playing = playback.id === recording.id && ['loading', 'playing'].includes(playback.status);
      return <div className={`adhan-recording ${selected ? 'adhan-recording--selected' : ''}`} key={recording.id}>
        {recording.fajr ? <span><strong>{recording.label}</strong><small>Pour la prière de Fajr</small></span> : <button className="adhan-choice" aria-pressed={selected} onClick={() => prefs.setAdhanSound(recording.id)}><strong>{recording.label}</strong><small>{selected ? 'Sélectionné' : 'Choisir cet adhan'}</small></button>}
        <button className="adhan-preview" aria-label={`${playing ? 'Arrêter' : 'Écouter'} ${recording.label}`} onClick={() => playing ? stopAdhan() : void playAdhan(recording.id, 'Préécoute de l’adhan')}>{playing ? '■ Arrêter' : '▶ Écouter'}</button>
      </div>;
    })}</div>
    <label className="ps-checkbox-label adhan-enable"><input type="checkbox" checked={prefs.adhanEnabled} onChange={e => { prefs.setAdhanEnabled(e.target.checked); if (!e.target.checked) stopAdhan(); }}/><span>Activer l’adhan à l’heure de la prière</span></label>
    <p className="ps-section__desc">{Capacitor.getPlatform() === 'ios' ? 'Avec les notifications de prières activées, un extrait de 28 secondes retentit à l’heure de la prière. Le mode silencieux et Concentration restent prioritaires.' : 'L’adhan complet peut se lancer tant que Quran Coach reste ouvert à l’écran, après une première écoute. Écran verrouillé ou application fermée, les notifications utilisent le son du téléphone.'}</p>
    {Capacitor.isNativePlatform() && (!prefs.enabled || !prefs.prayerEnabled) && <p role="status">Activez aussi les notifications de prières dans les réglages pour recevoir les alertes.</p>}
    <details className="adhan-credits"><summary>Enregistrements et crédits</summary><p>Ahmed Khalaf · <a href={ADHAN_SOURCE} target="_blank" rel="noreferrer">Source et licence CC BY 4.0</a>. Audios intégraux, extraits de 28 secondes pour les notifications iOS. Disponibles hors ligne après la mise à jour complète de l’application.</p></details>
  </section>;
}
