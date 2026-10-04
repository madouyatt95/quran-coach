import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mic, Square } from 'lucide-react';
import { tilawaService } from '../lib/tilawa/service';
import { downloadTilawaPack, tilawaPackStatus } from '../lib/tilawa/assets';
import { type Passage } from '../lib/learning';
import { fetchSurah, fetchSurahTranslation } from '../lib/quranApi';
import { useQuranStore } from '../stores/quranStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import '../components/Learning/Learning.css';

type Phase = 'idle' | 'preparing' | 'listening' | 'finishing' | 'result' | 'error';
export function VoiceSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [returnTo] = useState(() => location.state?.returnTo || '/learning');
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Passage | null>(null);
  const request = useRef(0);
  const active = useRef(false);
  const download = useRef<AbortController | null>(null);
  const surahs = useQuranStore(s => s.surahs);
  const busy = phase === 'preparing' || phase === 'listening' || phase === 'finishing';

  function cancel() {
    request.current++;
    active.current = false;
    download.current?.abort();
    void tilawaService.stop();
    setProgress(null);
    setPhase('idle');
    setMessage('Écoute arrêtée.');
  }
  useEffect(() => {
    const sequence = request;
    const running = active;
    const controller = download;
    const suspend = () => {
      if (!document.hidden || !running.current) return;
      sequence.current++;
      running.current = false;
      controller.current?.abort();
      void tilawaService.stop();
      setProgress(null);
      setPhase('idle');
      setMessage('Recherche interrompue. Appuyez sur Réciter pour reprendre.');
    };
    document.addEventListener('visibilitychange', suspend);
    return () => {
      sequence.current++;
      running.current = false;
      controller.current?.abort();
      void tilawaService.stop();
      document.removeEventListener('visibilitychange', suspend);
    };
  }, []);

  const start = useCallback(async () => {
    if (active.current) return;
    active.current = true;
    const player = useAudioPlayerStore.getState();
    if (player.isPlaying) player.togglePlay();
    const id = ++request.current;
    const current = () => id === request.current;
    const controller = new AbortController();
    download.current = controller;
    setPhase('preparing'); setMessage('Préparation de l’écoute…'); setResult(null); setProgress(null);
    let found = false; let failed = false;
    try {
      const pack = await tilawaPackStatus();
      if (!current()) return;
      if (!pack.ready) {
        setMessage('Première utilisation : préparation de la recherche vocale…');
        setProgress(0);
        await downloadTilawaPack(n => { if (current()) setProgress(n); }, controller.signal);
        if (!current()) return;
        setProgress(null);
      }
      setMessage('Préparation du microphone…');
      const ok = await tilawaService.startSearch({
        onVerse: p => {
          if (!current() || found) return;
          found = true; active.current = false;
          setResult(p); setPhase('result'); setMessage('Voici le passage reconnu.');
        },
        onStatus: m => {
          if (!current() || found || failed) return;
          setMessage(m);
          if (m === 'Recherche du verset…') setPhase('finishing');
        },
        onError: m => {
          if (!current()) return;
          failed = true; active.current = false; setPhase('error'); setMessage(m);
        },
        onEnd: () => {
          if (!current()) return;
          active.current = false;
          if (!found && !failed) {
            setPhase('idle');
            setMessage('Je n’ai pas identifié le passage. Réessayez avec quelques mots de plus.');
          }
        },
      });
      if (!current() || found || failed) return;
      if (ok) { setPhase('listening'); setMessage('Récitez ou faites écouter quelques mots. Je m’arrête automatiquement.'); }
      else { active.current = false; setPhase('idle'); }
    } catch (e) {
      if (!current()) return;
      active.current = false; setProgress(null); setPhase('error');
      setMessage(e instanceof Error ? e.message : 'Recherche indisponible. Réessayez avec une connexion.');
    }
  }, []);

  // Only a deliberate tap on the global microphone starts listening.
  // Defer one tick so React StrictMode's effect replay cannot start two captures.
  useEffect(() => {
    if (!location.state?.startVoiceSearch) return;
    const timer = setTimeout(() => {
      navigate('/voice-search', { replace: true, state: { returnTo } });
      void start();
    }, 0);
    return () => clearTimeout(timer);
  }, [location.key, location.state, navigate, returnTo, start]);

  return <div className="learning-page">
    <Link className="learning-btn" to={returnTo}>← Retour</Link>
    <h1>Quel est ce verset ?</h1>
    <p className="learning-muted">Récitez ou faites écouter un début de verset, puis choisissez où l’ouvrir.</p>
    <section className="learning-card voice-search-card">
      <button className={`voice-search-trigger ${busy ? 'is-active' : ''}`} onClick={busy ? cancel : () => void start()}>
        {busy ? <Square size={30} aria-hidden="true"/> : <Mic size={34} aria-hidden="true"/>}
        <span>{busy ? 'Annuler' : result ? 'Réciter un autre passage' : 'Réciter'}</span>
      </button>
      <p role={phase === 'error' ? 'alert' : 'status'} aria-live="polite">{message || 'Votre voix reste sur cet appareil.'}</p>
      {progress !== null && <><progress className="learning-progress" aria-label="Préparation de la recherche vocale" max={100} value={progress}/><p>{Math.floor(progress)} %</p></>}
      {!result && <p className="learning-muted">Au premier usage, environ 83 Mo sont téléchargés automatiquement. Autorisez le microphone si le navigateur le demande.</p>}
    </section>
    {result && <section className="learning-card" aria-label="Passage reconnu">
      <h2>{surahs.find(s => s.number === result.surah)?.englishName || `Sourate ${result.surah}`} · {result.ayah}</h2>
      <RecognizedPassage key={`${result.surah}:${result.ayah}`} passage={result}/>
      <p>Où souhaitez-vous ouvrir ce verset ?</p>
      <div className="learning-actions">
        <Link className="learning-btn primary" to={`/read?surah=${result.surah}&ayah=${result.ayah}`}>Ouvrir dans le Mushaf</Link>
        <Link className="learning-btn" to={`/hifdh?surah=${result.surah}&ayah=${result.ayah}`}>Mémoriser ce verset</Link>
      </div>
    </section>}
  </div>;
}
function RecognizedPassage({passage}: {passage: Passage}) {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void fetchSurah(passage.surah).then(async data => {
      const verse = data.ayahs.find(a => a.numberInSurah === passage.ayah);
      if (!verse) throw new Error('Verset absent');
      if (cancelled) return;
      setText(verse.text);
      try {
        const translations = await fetchSurahTranslation(passage.surah, 'fr');
        if (!cancelled) setTranslation(translations.get(verse.number) || '');
      } catch { /* The recognized Arabic passage stays available without its translation. */ }
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [passage.surah, passage.ayah]);
  return <>{text ? <p className="learning-arabic" lang="ar">{text}</p> : <p role="status">{error ? 'Passage identifié. Le texte est indisponible hors ligne sans son pack.' : 'Chargement du texte…'}</p>}{translation && <p className="learning-muted">{translation}</p>}<p className="learning-muted">Vérifiez que le passage correspond à votre récitation.</p></>;
}
