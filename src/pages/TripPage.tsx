import { useEffect, useRef, useState } from 'react';
import { BackButton } from '../components/Navigation/BackButton';
import {
  usePreparedTrip,
  biographyTrip,
  tripCursor,
  tripVerses,
  fitTripBatch,
  type Trip,
  type TripKind,
} from '../lib/preparedTrip';
import { carListeningTrack } from '../lib/carListening';
import { estimatedSeconds } from '../lib/listeningExperience';
import chapters from '../lib/interactiveMushaf/chapters.json';
import { useBookCatalog } from '../hooks/useBookCatalog';
import { useAudioLibraryStore } from '../stores/audioLibraryStore';
import { useLibraryPlayer } from '../stores/libraryPlayerStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useHifdhJourneyStore } from '../stores/hifdhJourneyStore';
import { useListenStore } from '../stores/listenStore';
import type { PlaylistItem } from '../types';
import './FahmExperience.css';
export default function TripPage() {
  const { trip, save } = usePreparedTrip(),
    [kind, setKind] = useState<TripKind>(trip?.kind || 'Récitation'),
    [minutes, setMinutes] = useState(trip?.minutes || 15),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const { items, loading } = useBookCatalog(),
    serial = useRef(0);
  useEffect(
    () => () => {
      serial.current++;
    },
    [],
  );
  async function build() {
    const token = ++serial.current;
    setBusy(true);
    setError('');
    try {
      let plan: Trip;
      if (kind === 'Biographie') {
        const positions = useAudioLibraryStore.getState().positions;
        const recent = Object.keys(positions).sort(
          (a, b) => positions[b].updatedAt - positions[a].updatedAt,
        )[0];
        plan = biographyTrip(items, minutes, recent);
      } else {
        const progress = useQuranStore.getState().progress,
          voice = useSettingsStore.getState().selectedReciter;
        const attempts = useHifdhJourneyStore.getState().attempts;
        const weak = attempts.filter(
          (a, i) =>
            a.outcome !== 'independent' &&
            a.outcome !== 'uncertain' &&
            attempts.findIndex(
              (b) => a.surah === b.surah && a.ayah === b.ayah,
            ) === i,
        );
        const verses: PlaylistItem[] = [];
        let seconds = 0;
        const start = progress?.lastSurah || 78;
        const targets =
          kind === 'Révision' && weak.length
            ? weak
                .slice(0, 80)
                .map((a) => ({ surah: a.surah, from: a.ayah, to: a.ayah }))
            : chapters
                .slice(start - 1)
                .map((c) => ({
                  surah: c.id,
                  from: c.id === start ? progress?.lastAyah || 1 : 1,
                  to: c.count,
                }));
        for (const t of targets) {
          const batch = await tripVerses(t, kind, voice);
          if (serial.current !== token) return;
          const fit = fitTripBatch(
            batch,
            minutes * 60 - seconds,
            !verses.length,
          );
          verses.push(...fit.picked);
          seconds += fit.seconds;
          if (fit.picked.length < batch.length || seconds >= minutes * 60)
            break;
        }
        plan = {
          kind,
          minutes,
          verses,
          tracks: verses.map((v) => ({
            ...carListeningTrack(v)!,
            duration: estimatedSeconds([v]),
          })),
        };
      }
      if (!plan.tracks.length)
        throw new Error(
          kind === 'Biographie'
            ? 'Aucun chapitre complet disponible pour cette durée. Essayez un trajet plus long.'
            : 'Aucun passage disponible.',
        );
      if (token === serial.current) save(plan);
    } catch (e) {
      if (token === serial.current)
        setError(
          e instanceof Error ? e.message : 'Préparation impossible. Réessayez.',
        );
    } finally {
      if (token === serial.current) setBusy(false);
    }
  }
  function start() {
    if (!trip) return;
    setError('');
    if (trip.kind === 'Biographie') {
      const queue = trip.tracks.flatMap(
        (t) => items.find((i) => i.id === t.id) || [],
      );
      if (queue.length !== trip.tracks.length) {
        setError('Le catalogue a changé. Préparez de nouveau ce trajet.');
        return;
      }
      const positions = useAudioLibraryStore.getState().positions;
      const recent = [...queue]
        .filter((i) => positions[i.id])
        .sort(
          (a, b) => positions[b.id].updatedAt - positions[a.id].updatedAt,
        )[0];
      let cursor = tripCursor(
        trip,
        recent?.id,
        recent ? positions[recent.id].seconds : 0,
      );
      if (cursor.position >= queue[cursor.index].duration - 1)
        cursor = { index: (cursor.index + 1) % queue.length, position: 0 };
      void useLibraryPlayer
        .getState()
        .play(queue[cursor.index], {
          queue,
          bounded: true,
          startAt: cursor.position,
        });
    } else {
      const last = useListenStore.getState().lastListened,
        cursor = tripCursor(trip, last?.audioUrl, last?.position || 0);
      useAudioPlayerStore.setState({ repeatMode: 'none' });
      useAudioPlayerStore
        .getState()
        .setPlaylist(
          trip.verses,
          cursor.index,
          trip.verses[0].reciterId || 'ar.alafasy',
          cursor.position,
        );
    }
  }
  return (
    <main className="fahm-shell">
      <BackButton fallback="/listen" />
      <h1>Préparer mon trajet</h1>
      <section className="fahm-card">
        <label>
          Écouter{' '}
          <select
            disabled={busy}
            value={kind}
            onChange={(e) => setKind(e.target.value as TripKind)}
          >
            {['Récitation', 'Biographie', 'Révision'].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <div className="fahm-duration">
          {[10, 15, 30, 45].map((n) => (
            <button
              disabled={busy}
              aria-pressed={minutes === n}
              key={n}
              onClick={() => setMinutes(n)}
            >
              {n} min
            </button>
          ))}
        </div>
        <button
          className="fahm-primary"
          disabled={busy || (loading && kind === 'Biographie')}
          onClick={() => void build()}
        >
          {busy ? 'Préparation…' : 'Préparer le trajet'}
        </button>
        {error && <p role="alert">{error}</p>}
      </section>
      {trip && (
        <section className="fahm-card">
          <h2>Mon trajet · {trip.kind}</h2>
          <p>
            ≈ {Math.ceil(trip.tracks.reduce((n, t) => n + t.duration, 0) / 60)}{' '}
            min ·{' '}
            {trip.kind === 'Biographie'
              ? 'chapitres complets'
              : 'versets entiers'}
          </p>
          <button className="fahm-primary" onClick={start}>
            Écouter mon trajet
          </button>
          <details>
            <summary>Au programme</summary>
            <ol>
              {trip.tracks.map((t) => (
                <li key={t.id}>
                  {t.title} · {t.artist}
                </li>
              ))}
            </ol>
          </details>
        </section>
      )}
    </main>
  );
}
