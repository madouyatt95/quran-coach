import { profileKey } from '../../lib/profileStorage';
import { useEffect, useRef, useState } from 'react';
import { get, update } from 'idb-keyval';
import { createMediaRecorder } from '../../lib/audioUnlock';
import type { Ayah } from '../../types';

interface Take {
  id: string;
  at: number;
  blob: Blob;
  help: boolean;
  remark: string;
}
type SavedTakes = Blob | Take[] | undefined;
function takesOf(value: SavedTakes): Take[] {
  return value instanceof Blob
    ? [{ id: 'legacy', at: 0, blob: value, help: false, remark: '' }]
    : value || [];
}
function label(t: Take) {
  return t.at
    ? new Date(t.at).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : 'Ancienne prise';
}
export function VerseStudio({
  ayah,
  reference,
  stopMain,
  observations = [],
  dismiss,
}: {
  ayah: Ayah;
  reference: string;
  stopMain: () => void;
  observations?: [string, { expected: string; spoken: string }][];
  dismiss?: (id: string) => void;
}) {
  const key = profileKey('hifdh-voice:' + ayah.number);
  const [takes, setTakes] = useState<Take[]>([]),
    [selected, setSelected] = useState(''),
    [help, setHelp] = useState(false),
    [phase, setPhase] = useState<'idle' | 'request' | 'record' | 'save'>(
      'idle',
    ),
    [error, setError] = useState('');
  const current = takes.find((t) => t.id === selected) || takes.at(-1);
  const previous = takes[current ? takes.indexOf(current) - 1 : -1];
  async function edit(change: (saved: Take[]) => Take[]) {
    let next: Take[] = [];
    await update<SavedTakes>(key, (old) => {
      next = change(takesOf(old));
      return next;
    });
    if (alive.current) setTakes(next);
  }
  const player = useRef<HTMLAudioElement>(null),
    recorder = useRef<MediaRecorder | null>(null);
  const serial = useRef(0),
    alive = useRef(false),
    objectUrl = useRef(''),
    captureTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stop = () => {
    clearTimeout(captureTimer.current);
    const rec = recorder.current;
    if (rec?.state === 'recording') rec.stop();
  };
  useEffect(() => {
    alive.current = true;
    const token = serial.current;
    if (typeof indexedDB !== 'undefined')
      void Promise.resolve()
        .then(() => get<SavedTakes>(key))
        .then((value) => {
          if (alive.current && serial.current === token)
            setTakes(takesOf(value));
        })
        .catch(() => {
          if (alive.current) setError('Stockage local indisponible.');
        });
    const silence = () => {
      serial.current++;
      player.current?.pause();
      stop();
      if (alive.current) setPhase((p) => (p === 'request' ? 'idle' : p));
    };
    const hide = () => {
      if (document.hidden) silence();
    };
    window.addEventListener('quran-stop-playback', silence);
    document.addEventListener('visibilitychange', hide);
    return () => {
      alive.current = false;
      silence();
      URL.revokeObjectURL(objectUrl.current);
      window.removeEventListener('quran-stop-playback', silence);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [key]);
  async function record() {
    stopMain();
    window.dispatchEvent(new Event('quran-stop-playback'));
    player.current?.pause();
    setError('');
    setPhase('request');
    const token = ++serial.current;
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (token !== serial.current || !alive.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const rec = createMediaRecorder(stream);
      recorder.current = rec;
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = async () => {
        stream?.getTracks().forEach((t) => t.stop());
        clearTimeout(captureTimer.current);
        if (!alive.current) return;
        const blob = new Blob(chunks, { type: rec.mimeType });
        if (!blob.size) {
          setPhase('idle');
          setError('La prise est vide.');
          return;
        }
        const take = {
          id: crypto.randomUUID(),
          at: Date.now(),
          blob,
          help,
          remark: '',
        };
        setPhase('save');
        try {
          await edit((saved) => [...saved, take]);
          if (alive.current) setSelected(take.id);
        } catch {
          if (alive.current) {
            setTakes((saved) => [...saved, take]);
            setSelected(take.id);
            setError('La prise est disponible pour cette session uniquement.');
          }
        } finally {
          if (alive.current) setPhase('idle');
        }
      };
      rec.onerror = () => {
        stop();
        if (alive.current) setError('Enregistrement interrompu.');
      };
      rec.start();
      setPhase('record');
      captureTimer.current = setTimeout(stop, 180000);
    } catch {
      stream?.getTracks().forEach((t) => t.stop());
      if (alive.current) {
        setPhase('idle');
        setError('Microphone indisponible. Vérifiez son autorisation.');
      }
    }
  }
  async function listen(take?: Take, following?: Take) {
    const audio = player.current;
    if (!audio) return;
    stopMain();
    window.dispatchEvent(new Event('quran-stop-playback'));
    setError('');
    URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = take ? URL.createObjectURL(take.blob) : '';
    audio.src = objectUrl.current || reference;
    audio.onended = following
      ? () => {
          void listen(following);
        }
      : null;
    try {
      await audio.play();
    } catch {
      if (alive.current) setError('Lecture indisponible.');
    }
  }
  return (
    <details
      className="verse-studio"
      onToggle={(e) => {
        if (!e.currentTarget.open) {
          serial.current++;
          player.current?.pause();
          stop();
          setPhase((p) => (p === 'request' ? 'idle' : p));
        }
      }}
    >
      <summary>
        Studio de récitation · {ayah.surah}:{ayah.numberInSurah}
      </summary>
      <div className="pupitre-study-actions">
        <button disabled={phase !== 'idle'} onClick={() => void listen()}>
          Le récitateur
        </button>
        {current && (
          <label>
            Prise{' '}
            <select
              value={current.id}
              onChange={(e) => {
                player.current?.pause();
                setSelected(e.target.value);
              }}
            >
              {takes.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {i + 1} · {label(t)}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          disabled={!current || phase !== 'idle'}
          onClick={() => void listen(current)}
        >
          Écouter ma prise
        </button>
        {previous && (
          <button
            disabled={phase !== 'idle'}
            onClick={() => void listen(previous, current)}
          >
            Comparer · prise du {label(previous)}, puis prise sélectionnée
          </button>
        )}
        <label>
          <input
            type="checkbox"
            disabled={phase !== 'idle'}
            checked={help}
            onChange={(e) => setHelp(e.target.checked)}
          />{' '}
          J’utilise un indice pour cette prise
        </label>
        <button
          disabled={phase === 'request' || phase === 'save'}
          onClick={() => (phase === 'record' ? stop() : void record())}
        >
          {phase === 'record'
            ? 'Terminer la prise'
            : 'Enregistrer ma récitation'}
        </button>
        <button onClick={() => player.current?.pause()}>Pause</button>
        {current && (
          <>
            <small>
              {current.at === 0
                ? 'Aide non renseignée'
                : current.help
                  ? 'Indice utilisé'
                  : 'Sans indice déclaré'}
            </small>
            <label>
              Mon bilan{' '}
              <select
                value={current.remark}
                onChange={(e) => {
                  const remark = e.target.value;
                  void edit((saved) =>
                    saved.map((t) =>
                      t.id === current.id ? { ...t, remark } : t,
                    ),
                  ).catch(() => setError('Bilan non enregistré.'));
                }}
              >
                <option value="">À renseigner</option>
                <option>À retravailler</option>
                <option>Plus fluide</option>
                <option>Récité avec assurance</option>
              </select>
            </label>
            <button
              disabled={phase !== 'idle'}
              onClick={async () => {
                player.current?.pause();
                try {
                  await edit((saved) =>
                    saved.filter((t) => t.id !== current.id),
                  );
                } catch {
                  setError('Suppression impossible.');
                }
              }}
            >
              Effacer cette prise
            </button>
          </>
        )}
        {observations.map(([id, o]) => (
          <button key={id} onClick={() => dismiss?.(id)}>
            Écarter le signalement du coach · {o.expected}
          </button>
        ))}
      </div>
      <audio ref={player} preload="none" />
      <small>La prise reste sur cet appareil.</small>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
