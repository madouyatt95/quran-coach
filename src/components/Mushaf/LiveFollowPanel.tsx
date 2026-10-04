import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Mic, Square, X } from 'lucide-react';
import { tilawaService } from '../../lib/tilawa/service';
import { tilawaPackStatus, downloadTilawaPack } from '../../lib/tilawa/assets';
import { fetchSurah } from '../../lib/quranApi';
import { useQuranStore } from '../../stores/quranStore';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { useLiveFollowStore } from '../../stores/liveFollowStore';
import './LiveFollow.css';

export function LiveFollowPanel({ host }: { host?: HTMLElement | null }) {
  const [showStatus, setShowStatus] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const active = useLiveFollowStore(s => s.active);
  const [message, setMessage] = useState('Le Mushaf avance avec la voix');
  const [progress, setProgress] = useState<number | null>(null);
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const stop = useCallback(() => {
    ++sequence.current;
    controller.current?.abort();
    void tilawaService.stop();
    useLiveFollowStore.setState({active:false,passage:null,position:null});
    setProgress(null);
  }, []);
  useEffect(() => {
    const suspend = () => { if (document.hidden) { stop(); setMessage('Suivi interrompu. Vous pouvez le reprendre.'); } };
    document.addEventListener('visibilitychange', suspend);
    return () => { document.removeEventListener('visibilitychange', suspend); stop(); };
  }, [stop]);
  const start = useCallback(async () => {
    if (useLiveFollowStore.getState().active) return;
    setShowStatus(true);
    const id = ++sequence.current;
    const current = () => id === sequence.current;
    const abort = new AbortController(); controller.current = abort;
    useLiveFollowStore.setState({active:true,passage:null,position:null});
    navigate('/read', {replace:true,state:null});
    const player = useAudioPlayerStore.getState();
    if (player.isPlaying) player.togglePlay();
    window.dispatchEvent(new Event('quran-stop-playback'));
    setMessage('Préparation de l’écoute…');
    let failed = false;
    let latest = 0;
    const surahLoads = new Map<number, ReturnType<typeof fetchSurah>>();
    try {
      if (!(await tilawaPackStatus()).ready) {
        if (!current()) return;
        await downloadTilawaPack(n => { if (current()) setProgress(n); }, abort.signal);
      }
      if (!current()) return;
      setProgress(null);
      const ok = await tilawaService.startTracking({
        onVerse: passage => {
          const update = ++latest;
          if (!current()) return;
          setMessage(`Sourate ${passage.surah} · verset ${passage.ayah}`);
          // Paint first. Already displayed text must never wait on IndexedDB or the network.
          useLiveFollowStore.setState({passage,position:null});
          const quran = useQuranStore.getState();
          const loaded = [...quran.currentSurahAyahs, ...quran.pageAyahs]
            .find(a => a.surah === passage.surah && a.numberInSurah === passage.ayah);
          if (loaded) {
            quran.goToAyah(passage.surah, passage.ayah, loaded.page, {silent:true});
            return;
          }
          let load = surahLoads.get(passage.surah);
          if (!load) {
            load = fetchSurah(passage.surah);
            surahLoads.set(passage.surah, load);
            void load.catch(() => surahLoads.delete(passage.surah));
          }
          void load.then(data => {
            if (!current() || update !== latest) return;
            const verse = data.ayahs.find(a => a.numberInSurah === passage.ayah);
            if (!verse) throw new Error('Verset indisponible');
            useQuranStore.getState().goToAyah(passage.surah, passage.ayah, verse.page, {silent:true});
          }).catch(() => { if (current() && update === latest) setMessage(`Passage ${passage.surah}:${passage.ayah} reconnu. Connectez-vous pour charger son texte.`); });
        },
        onProgress: position => {
          if (!current()) return;
          useLiveFollowStore.setState({position});
          setMessage(`Sourate ${position.surah} · verset ${position.ayah} · mot ${Math.min(position.wordIndex + 1, position.words.length)}/${position.words.length}`);
        },
        onStatus: m => { if (current()) setMessage(m); },
        onError: m => { if (current()) { failed = true; setMessage(m); } },
        onEnd: () => { if (current()) { stop(); if (!failed) setMessage('Écoute terminée. Appuyez pour reprendre.'); } },
      });
      if (current() && ok) setMessage('Récitez ou faites écouter un passage · écoute de 5 min maximum');
    } catch (e) {
      if (current()) { stop(); setMessage(e instanceof Error ? e.message : 'Écoute indisponible. Réessayez.'); }
    }
  }, [stop, navigate]);
  useEffect(() => {
    if (!location.state?.startLiveFollow) return;
    const timer = setTimeout(() => {
      navigate(location.pathname + location.search, {replace:true,state:null});
      void start();
    }, 0);
    return () => clearTimeout(timer);
  }, [location.key, location.pathname, location.search, location.state, navigate, start]);
  const control = <section className={`live-follow-panel ${active ? 'is-active' : ''} ${host ? '' : 'live-follow-panel--fallback'}`} aria-label="Suivi de récitation">
    <button className="live-follow-toggle" title={active ? 'Arrêter le suivi' : 'Suivre la voix'} aria-pressed={active}
      onClick={active ? () => {stop();setMessage('Suivi arrêté.');setShowStatus(false);} : () => void start()}
      aria-label={active ? 'Arrêter le suivi en direct' : 'Suivre une récitation en direct'}>
      {active ? <Square size={18}/> : <Mic size={19}/>}
    </button>
    {showStatus && <div className="live-follow-status">
      <span className="live-follow-status__dot" aria-hidden="true"/>
      <span role="status">{message}{progress !== null && ` · ${Math.floor(progress)} %`}</span>
      {!active && <button aria-label="Masquer le message du suivi" onClick={()=>setShowStatus(false)}><X size={16}/></button>}
    </div>}
  </section>;
  // Keep the engine mounted while switching from an image reader to the text reader.
  return host ? createPortal(control, host) : control;
}
