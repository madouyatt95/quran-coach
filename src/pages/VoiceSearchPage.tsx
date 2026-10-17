import { VoiceFilePicker, type VoiceFileExcerpt } from '../components/VoiceSearch/VoiceFilePicker';
import { IdentifiedVerseAudio } from '../components/VoiceSearch/IdentifiedVerseAudio';
import { VoiceCandidates } from '../components/VoiceSearch/VoiceCandidates';
import { decodeVoiceFile } from '../lib/voiceFile';
import { readVoiceHistory, rememberVoicePassage, saveVoiceHistory } from '../lib/voiceHistory';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, AudioLines, BookOpen, Check, ChevronRight, Eye, EyeOff, GraduationCap, LoaderCircle, Mic, Pause, RotateCcw, ShieldCheck, Square, Trash2, FileAudio } from 'lucide-react';
import { tilawaService, type TrackingPosition } from '../lib/tilawa/service';
import { downloadTilawaPack, tilawaPackStatus } from '../lib/tilawa/assets';
import { corpusWordOffset } from '../lib/tilawa/feedback';
import { recitationWords } from '../lib/recitationMatching';
import { type Passage } from '../lib/learning';
import { fetchSurah, fetchSurahTranslation } from '../lib/quranApi';
import { useQuranStore } from '../stores/quranStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import './VoiceSearchPage.css';

type Phase = 'idle' | 'preparing' | 'listening' | 'finishing' | 'paused' | 'result' | 'error';
type Mode = 'identify' | 'free';
const same = (a: Passage | null, b: Passage | null) => a?.surah === b?.surah && a?.ayah === b?.ayah;

export function VoiceSearchPage() {
  const location = useLocation();
  const [returnTo] = useState(() => {
    const path = location.state?.returnTo;
    return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/voice-search') ? path : '/';
  });
  const [mode, setMode] = useState<Mode>('identify');
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Passage | null>(null);
  const [candidate, setCandidate] = useState<Passage | null>(null);
  const [position, setPosition] = useState<TrackingPosition | null>(null);
  const [masked, setMasked] = useState(false);
  const [level, setLevel] = useState(0);
  const [history, setHistory] = useState(readVoiceHistory);
  const [historySaved, setHistorySaved] = useState(true);
  const [source, setSource] = useState<'mic' | 'file'>('mic');
  const [candidates, setCandidates] = useState<Passage[]>([]);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const [chosen, setChosen] = useState(false);
  const resultRef = useRef<HTMLElement | null>(null);
  const historyRef = useRef(history);
  const remember = useCallback((passage: Passage) => {
    const next = rememberVoicePassage(historyRef.current, passage);
    historyRef.current = next; setHistory(next); setHistorySaved(saveVoiceHistory(next));
  }, []);
  const removeHistory = (passage: Passage) => {
    const next = historyRef.current.filter(p => !same(p, passage));
    historyRef.current = next; setHistory(next); setHistorySaved(saveVoiceHistory(next));
  };
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [result]);
  const request = useRef(0);
  const active = useRef(false);
  const download = useRef<AbortController | null>(null);
  const surahs = useQuranStore(s => s.surahs);
  const busy = phase === 'preparing' || phase === 'listening' || phase === 'finishing';
  const free = mode === 'free';
  const name = (p: Passage) => surahs.find(s => s.number === p.surah)?.englishName || `Sourate ${p.surah}`;

  const cancel = useCallback(() => {
    request.current++;
    active.current = false;
    download.current?.abort();
    void tilawaService.stop();
    setProgress(null); setCandidate(null); setPosition(null); setLevel(0);
    setFileProgress(null);
    setPhase('paused'); setMessage('Écoute interrompue. Vous pouvez reprendre à tout moment.');
  }, []);
  useEffect(() => {
    const sequence = request, running = active, controller = download;
    const suspend = () => {
      if (!document.hidden || !running.current) return;
      cancel();
      setMessage('Écoute mise en pause en quittant l’écran. Appuyez pour reprendre.');
    };
    document.addEventListener('visibilitychange', suspend);
    return () => {
      sequence.current++; running.current = false; controller.current?.abort();
      void tilawaService.stop();
      document.removeEventListener('visibilitychange', suspend);
    };
  }, [cancel]);

  const start = useCallback(async (selectedMode: Mode, excerpt?: VoiceFileExcerpt) => {
    if (active.current) return;
    active.current = true;
    const player = useAudioPlayerStore.getState();
    if (player.isPlaying) player.togglePlay();
    window.dispatchEvent(new Event('quran-stop-playback'));
    const id = ++request.current;
    const current = () => id === request.current;
    const controller = new AbortController(); download.current = controller;
    setPhase('preparing'); setMessage('Préparation de l’écoute…'); setProgress(null);
    setCandidate(null); setCandidates([]); setChosen(false); setFileProgress(null); setPosition(null); setLevel(0);
    if (selectedMode === 'identify') setResult(null);
    let found = false, failed = false, ended = false;
    // Keep the choices the reader has actually seen. A later acoustic revision
    // must not remove the correct choice or silently choose another passage.
    let offered: Passage[] = [];
    try {
      const pack = await tilawaPackStatus();
      if (!current()) return;
      if (!pack.ready) {
        setMessage('Installation du pack vocal sur cet appareil…'); setProgress(0);
        await downloadTilawaPack(n => { if (current()) setProgress(n); }, controller.signal);
        if (!current()) return;
        setProgress(null);
      }
      setMessage(excerpt ? 'Préparation de votre extrait…' : 'Préparation du microphone…');
      const callbacks = {
        onLevel: (n: number) => { if (current()) setLevel(n); },
        onVerse: (p: Passage) => {
          if (!current() || (selectedMode === 'identify' && found)) return;
          if (selectedMode === 'identify' && offered.some(previous => !same(previous, p))) {
            if (!offered.some(previous => same(previous, p))) offered = [...offered, p];
            setCandidates(offered);
            request.current++; active.current = false;
            void tilawaService.stop();
            setLevel(0); setFileProgress(null); setPhase('paused');
            setMessage('Plusieurs passages ont été repérés. L’écoute est arrêtée : choisissez celui que vous reconnaissez, ou recommencez.');
            return;
          }
          found = true;
          setResult(p); setCandidate(null); setCandidates([]); setPosition(null); setChosen(false);
          remember(p);
          if (selectedMode === 'identify') {
            active.current = false; setPhase('result'); setMessage('Passage identifié. À vous de choisir la suite.');
          } else { setPhase('listening'); setMessage('Passage repéré. Continuez à votre rythme.'); }
        },
        onCandidates: (items: Passage[]) => {
          if (!current() || found || selectedMode !== 'identify') return;
          // Never remove or reorder an offered passage during the same search.
          // Bound provisional choices; a confirmed alternative is always retained.
          for (const item of items) {
            if (offered.length < 3 && !offered.some(previous => same(previous, item))) offered = [...offered, item];
          }
          if (offered.length) setCandidates(offered);
        },
        onStatus: (m: string) => {
          if (!current() || failed || (selectedMode === 'identify' && found)) return;
          setMessage(m);
          if (m === 'Recherche du verset…') setPhase('finishing');
        },
        onError: (m: string) => {
          if (!current()) return;
          failed = true; active.current = false; setPhase('error'); setLevel(0); setCandidate(null); setPosition(null); setMessage(m);
        },
        onEnd: () => {
          if (!current()) return;
          ended = true; active.current = false; setLevel(0); setCandidate(null); setPosition(null);
          if (!failed && selectedMode === 'free') { setPhase('paused'); setMessage('Écoute terminée. Vous pouvez reprendre.'); }
          else if (!found && !failed) { setPhase('idle'); setMessage(excerpt ? 'Aucun passage confirmé. Essayez un autre extrait ou consultez les propositions.' : 'Pas encore de passage identifié. Réessayez avec quelques mots de plus.'); }
        },
      };
      if (excerpt) {
        const samples = await decodeVoiceFile(excerpt.file, excerpt.start, excerpt.end, controller.signal);
        if (!current()) return;
        setPhase('finishing'); setFileProgress(0); setMessage('Analyse de votre extrait…');
        await tilawaService.searchSamples(samples, callbacks, value => { if (current()) setFileProgress(value); });
        return;
      }
      const ok = selectedMode === 'free'
        ? await tilawaService.startFreeRecitation({ ...callbacks,
          onCandidate: p => {
            if (!current()) return;
            setCandidate(old => same(old, p) ? old : p);
            if (p) { setPosition(null); setMessage('Un passage possible : poursuivez ou confirmez.'); }
          },
          onSearching: () => { if (current()) { setPosition(null); setMessage('Je recherche votre passage. Continuez quelques mots.'); } },
          onProgress: p => { if (current()) { setPosition(p); setMessage('Je suis votre récitation.'); } },
          onLevel: n => { if (current()) setLevel(n); },
        })
        : await tilawaService.startSearch(callbacks);
      if (!current() || failed || ended || (selectedMode === 'identify' && found)) return;
      if (ok) {
        setPhase('listening');
        if (!found) setMessage(selectedMode === 'free' ? 'Récitez où vous voulez. Je recherche votre passage.' : 'Récitez ou faites écouter quelques mots. Arrêt automatique.');
      } else { active.current = false; setPhase('idle'); }
    } catch (e) {
      if (!current()) return;
      active.current = false; setProgress(null); setPhase('error');
      setMessage(e instanceof Error ? e.message : 'Écoute indisponible. Réessayez avec une connexion.');
    }
  }, [remember]);

  function changeMode(next: Mode) {
    if (next === mode) return;
    cancel(); setMode(next); setSource('mic'); setCandidates([]); setMessage(''); setPhase('idle');
  }
  function choosePassage(passage: Passage) {
    cancel(); setCandidates([]); setResult(passage); setChosen(true); remember(passage); setPhase('result'); setMessage('Passage choisi.');
  }
  function confirm() {
    if (!candidate) return;
    if (!tilawaService.confirmFreePassage(candidate)) {
      setCandidate(null); setMessage('Le passage a changé. Continuez quelques mots pour le retrouver.');
    }
  }
  const buttonLabel = busy ? (phase === 'preparing' ? 'Annuler' : free ? 'Mettre en pause' : 'Annuler') : free ? (result ? 'Reprendre la récitation' : 'Commencer à réciter') : result ? 'Identifier un autre passage' : 'Réciter';
  const statusLabel = phase === 'preparing' ? 'Préparation' : phase === 'finishing' ? 'Identification' : phase === 'listening' ? 'Microphone ouvert' : phase === 'error' ? 'Écoute indisponible' : phase === 'paused' ? 'En pause' : result ? 'Passage identifié' : 'À votre rythme';

  return <div className="voice-page" data-has-passage={!!result}>
    <header className="voice-header"><Link to={returnTo} onClick={cancel} aria-label="Retour"><ArrowLeft size={18}/></Link><span>IDENTIFIER</span><span className="voice-local"><ShieldCheck size={14}/> Local</span></header>
    <div className="voice-intro"><span className="voice-eyebrow">LE CORAN, À PORTÉE DE VOIX</span><h1>{free ? <>Récitez librement.<br/><em>Gardez le fil.</em></> : <>Quelques mots.<br/><em>Retrouvez le verset.</em></>}</h1><p>{free ? 'Commencez où vous voulez. Le passage apparaît et suit votre récitation.' : 'Votre récitation ou celle que vous écoutez : laissez votre voix vous guider.'}</p></div>
    <nav className="voice-modes" aria-label="Type d’écoute"><button aria-pressed={!free} onClick={() => changeMode('identify')}><Mic size={16}/>Identifier</button><button aria-pressed={free} onClick={() => changeMode('free')}><AudioLines size={17}/>Réciter librement</button></nav>
    {free && <div className="voice-visibility"><span>Mon texte</span><button aria-pressed={masked} onClick={() => setMasked(v => !v)}>{masked ? <EyeOff size={16}/> : <Eye size={16}/>} {masked ? 'Masqué' : 'Visible'}</button></div>}
    {!free && <nav className="voice-sources" aria-label="Source à identifier"><button aria-pressed={source === 'mic'} onClick={() => { if (source !== 'mic') { cancel(); setSource('mic'); setMessage(''); setPhase('idle'); setCandidates([]); } }}><Mic size={16}/>Microphone</button><button aria-pressed={source === 'file'} onClick={() => { if (source !== 'file') { cancel(); setSource('file'); setMessage(''); setPhase('idle'); setCandidates([]); } }}><FileAudio size={16}/>Fichier audio / vidéo</button></nav>}
    {source === 'file' && !free && <div className="voice-file-area"><VoiceFilePicker busy={busy} onAnalyze={excerpt => void start('identify', excerpt)} onCancel={cancel}/><p role={phase === 'error' ? 'alert' : 'status'}>{message}</p>{progress !== null && <progress aria-label="Téléchargement du pack vocal" max={100} value={progress}/>} {fileProgress !== null && <div className="voice-file-progress"><progress aria-label="Analyse du fichier" max={100} value={fileProgress}/><span>{fileProgress} %</span></div>}</div>}
    {(source === 'mic' || free) && <section className={`voice-listener ${busy ? 'is-active' : ''} ${result ? 'has-passage' : ''}`} aria-label="Écoute vocale" style={{'--voice-level':level} as CSSProperties}>
      <span className="voice-state"><i data-listening={phase === 'listening'} aria-hidden="true"/>{statusLabel}</span>
      <div className="voice-orbit"><span className="voice-ring" aria-hidden="true"/><span className="voice-ring voice-ring--outer" aria-hidden="true"/><button className="voice-search-trigger" aria-label={buttonLabel} onClick={busy ? cancel : () => void start(mode)}>
        {phase === 'preparing' || phase === 'finishing' ? <LoaderCircle size={32} className="voice-spinner"/> : busy ? (free ? <Pause size={30}/> : <Square size={27}/>) : <Mic size={34}/>}<span className="voice-sr">{buttonLabel}</span>
      </button></div>
      <strong className="voice-main-label">{buttonLabel}</strong>
      <p className="voice-message" role={phase === 'error' ? 'alert' : 'status'}>{message || (free ? 'Une écoute continue, sans choisir de sourate.' : 'Un appui suffit. L’écoute s’arrête une fois le verset trouvé.')}</p>
      {progress !== null && <div className="voice-download"><progress aria-label="Préparation de la recherche vocale" max={100} value={progress}/><span>{Math.floor(progress)} % · pack vocal</span></div>}
      {phase === 'listening' && <div className="voice-meter" aria-label="Niveau sonore du microphone"><span style={{width:`${Math.round(level * 100)}%`}}/></div>}
    </section>}
    {!free && !result && candidates.length > 0 && <VoiceCandidates passages={candidates} listening={busy} name={name} onChoose={choosePassage}/>}
    {free && candidate && <section className="voice-candidate" aria-label="Passage à confirmer"><span className="voice-eyebrow">{result ? 'CHANGEMENT POSSIBLE' : 'PASSAGE POSSIBLE'}</span><h2>{name(candidate)} <small>{candidate.surah}:{candidate.ayah}</small></h2><p>{result ? 'Ce passage diffère du dernier repéré. Est-ce celui que vous récitez ?' : 'Les premiers mots peuvent correspondre à plusieurs passages. Continuez ou confirmez celui-ci.'}</p><RecognizedPassage key={`candidate-${candidate.surah}:${candidate.ayah}`} passage={candidate} masked={masked} compact/><div className="voice-candidate-actions"><button onClick={confirm}><Check size={16}/>C’est ce passage</button><button onClick={() => { cancel(); void start('free'); }}><RotateCcw size={15}/>Rechercher à nouveau</button></div></section>}
    {result && <section ref={resultRef} className="voice-result" aria-label="Passage reconnu">
      <div className="voice-result-heading"><div><span className="voice-eyebrow">{chosen ? 'PASSAGE CHOISI' : free ? 'VOTRE PASSAGE' : 'PASSAGE IDENTIFIÉ'}</span><h2>{name(result)}</h2></div><span className="voice-reference">{result.surah}:{result.ayah}</span></div>
      <RecognizedPassage key={`${result.surah}:${result.ayah}`} passage={result} masked={free && masked} position={position}/>
      {!(free && masked) && <IdentifiedVerseAudio key={`audio-${result.surah}:${result.ayah}`} passage={result} onBeforePlay={() => { if (busy) cancel(); }}/>}
      {free ? <p className="voice-result-note">Repérage du passage, sans validation de mémorisation ni de tajwid.</p> : <button className="voice-continue" onClick={() => {setMode('free');void start('free');}}><AudioLines size={18}/><span>Continuer à réciter ici<small>Avec le texte visible ou masqué</small></span><ChevronRight size={18}/></button>}
      <div className="voice-destinations"><Link to={`/read?surah=${result.surah}&ayah=${result.ayah}`} onClick={cancel}><BookOpen size={19}/><span>Ouvrir dans le Mushaf</span><ArrowUpRight size={15}/></Link><Link to={`/hifdh?surah=${result.surah}&ayah=${result.ayah}`} onClick={cancel}><GraduationCap size={20}/><span>Mémoriser ce verset</span><ArrowUpRight size={15}/></Link></div>
      <Link className="voice-follow-link" to={`/read?surah=${result.surah}&ayah=${result.ayah}`} state={{startLiveFollow:true}} onClick={cancel}>Suivre la récitation dans le Mushaf <ChevronRight size={14}/></Link>
    </section>}
    {history.length > 0 && <details className="voice-history"><summary>Mes dernières identifications <span>{history.length}</span></summary><div>{history.map(p => <div className="voice-history-row" key={`${p.surah}:${p.ayah}`}><button onClick={() => choosePassage(p)}><strong>{name(p)} · {p.ayah}</strong><small>{new Date(p.at).toLocaleDateString('fr-FR')}</small></button><button aria-label={`Supprimer ${p.surah}:${p.ayah} de l’historique`} onClick={() => removeHistory(p)}><Trash2 size={16}/></button></div>)}</div></details>}
    {!historySaved && <p role="alert">L’historique n’a pas pu être enregistré sur cet appareil.</p>}
    <footer className="voice-footnote"><p><ShieldCheck size={14}/> Votre voix est analysée sur cet appareil.</p><details><summary>Comment ça marche ?</summary><p>Au premier usage, environ 83 Mo sont téléchargés. Autorisez le microphone pour démarrer. Le mode Identifier s’arrête automatiquement ; la récitation libre continue jusqu’à votre pause, dans la limite de 5 minutes par écoute.</p><p>Les propositions restent disponibles pendant l’écoute. En cas de réponses contradictoires, l’écoute s’arrête pour vous laisser choisir. Le texte et sa traduction nécessitent une connexion ou leur pack hors ligne.</p><Link to="/storage" onClick={cancel}>Gérer mes téléchargements</Link></details></footer>
  </div>;
}
function RecognizedPassage({passage, masked = false, position, compact = false}: {passage: Passage; masked?: boolean; position?: TrackingPosition | null; compact?: boolean}) {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void fetchSurah(passage.surah).then(async data => {
      const verse = data.ayahs.find(a => a.numberInSurah === passage.ayah);
      if (!verse) throw new Error('Verset absent');
      if (cancelled) return;
      setText(verse.text);
      if (compact) return;
      try {
        const translations = await fetchSurahTranslation(passage.surah, 'fr');
        if (!cancelled) setTranslation(translations.get(verse.number) || '');
      } catch { /* Arabic remains usable when the translation is unavailable. */ }
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [passage.surah, passage.ayah, compact, retry]);
  if (masked) return <div className="voice-masked"><EyeOff size={24}/><strong>À vous de réciter</strong><p>Le texte reste masqué, même au verset suivant.</p></div>;
  const words = recitationWords(text);
  const offset = position && same(position, passage) ? corpusWordOffset(words, position.words, passage.surah, passage.ayah) : null;
  return <>{text ? <p className="voice-arabic" dir="rtl" lang="ar">{words.map((word, i) => <span key={i} data-current={offset !== null && position && i === position.wordIndex + offset ? true : undefined}>{word} </span>)}</p> : <div className="voice-text-loading" role="status">{error ? <>Le passage est repéré, mais le texte n’a pas pu être chargé.<button onClick={() => {setError(false);setRetry(n => n + 1);}}>Réessayer le texte</button></> : 'Chargement du passage…'}</div>}{!compact && translation && <p className="voice-translation">{translation}</p>}</>;
}
