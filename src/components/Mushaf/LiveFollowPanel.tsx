import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Square } from 'lucide-react';
import { tilawaService } from '../../lib/tilawa/service';
import { tilawaPackStatus, downloadTilawaPack } from '../../lib/tilawa/assets';
import { fetchSurah } from '../../lib/quranApi';
import { useQuranStore } from '../../stores/quranStore';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { useLiveFollowStore } from '../../stores/liveFollowStore';
import './LiveFollow.css';

export function LiveFollowPanel() {
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
    useLiveFollowStore.setState({active:false,passage:null});
    setProgress(null);
  }, []);
  useEffect(() => {
    const suspend = () => { if (document.hidden) { stop(); setMessage('Suivi interrompu. Vous pouvez le reprendre.'); } };
    document.addEventListener('visibilitychange', suspend);
    return () => { document.removeEventListener('visibilitychange', suspend); stop(); };
  }, [stop]);
  const start = useCallback(async () => {
    if (useLiveFollowStore.getState().active) return;
    const id = ++sequence.current;
    const current = () => id === sequence.current;
    const abort = new AbortController(); controller.current = abort;
    useLiveFollowStore.setState({active:true,passage:null});
    navigate('/read', {replace:true,state:null});
    const player = useAudioPlayerStore.getState();
    if (player.isPlaying) player.togglePlay();
    window.dispatchEvent(new Event('quran-stop-playback'));
    setMessage('Préparation de l’écoute…');
    let failed = false;
    let latest = 0;
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
          void fetchSurah(passage.surah).then(data => {
            if (!current() || update !== latest) return;
            const verse = data.ayahs.find(a => a.numberInSurah === passage.ayah);
            if (!verse) throw new Error('Verset indisponible');
            useLiveFollowStore.setState({passage});
            useQuranStore.getState().goToAyah(passage.surah, passage.ayah, verse.page, {silent:true});
          }).catch(() => { if (current() && update === latest) setMessage(`Passage ${passage.surah}:${passage.ayah} reconnu. Connectez-vous pour charger son texte.`); });
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
  return <section className="live-follow-panel" aria-label="Suivi de récitation">
    <button onClick={active ? () => {stop();setMessage('Suivi arrêté.');} : () => void start()} aria-label={active ? 'Arrêter le suivi en direct' : 'Suivre une récitation en direct'}>{active ? <Square size={18}/> : <Mic size={18}/>}<span>{active ? 'Arrêter' : 'Suivre la voix'}</span></button>
    <span role="status">{message}{progress !== null && ` · ${Math.floor(progress)} %`}</span>
  </section>;
}
