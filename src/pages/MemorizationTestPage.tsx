import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSurah, fetchSurahs, getAudioUrl } from '../lib/quranApi';
import { fetchWordTimings } from '../lib/wordTimings';
import { tilawaService } from '../lib/tilawa/service';
import { tilawaPackStatus, downloadTilawaPack } from '../lib/tilawa/assets';
import { cueEndSeconds, cueWordCount, drawTestQuestions, testWords, type TestAnswer, type TestOutcome } from '../lib/memorizationTest';
import { useMemorizationTestStore } from '../stores/memorizationTestStore';
import { useQuranStore } from '../stores/quranStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useSRSStore } from '../stores/srsStore';
import type { Ayah } from '../types';
import '../components/Learning/Learning.css';
import './MemorizationTest.css';

export function MemorizationTestPage() {
  const {knownSurahs,setKnown,save,history} = useMemorizationTestStore();
  const {surahs,setSurahs} = useQuranStore();
  const [filter,setFilter] = useState('');
  const [count,setCount] = useState(3);
  const [questions,setQuestions] = useState<Ayah[]>([]);
  const [answers,setAnswers] = useState<TestAnswer[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [added,setAdded] = useState(false);
  const request = useRef(0);
  useEffect(()=>()=>{++request.current;},[]);
  const loadSurahs = () => {void fetchSurahs().then(setSurahs).catch(()=>setError('La liste des sourates est indisponible. Réessayez avec une connexion.'));};
  useEffect(()=>{if(!surahs.length) void fetchSurahs().then(setSurahs).catch(()=>setError('La liste des sourates est indisponible. Réessayez avec une connexion.'));},[surahs.length,setSurahs]);
  async function begin() {
    const id=++request.current;setLoading(true);setError('');
    try {
      const chapters = await Promise.all(knownSurahs.map(fetchSurah));
      if(id!==request.current)return;
      const picked=drawTestQuestions(chapters.flatMap(c=>c.ayahs),count);
      if(!picked.length)throw new Error('Aucun départ disponible dans cette sélection. Choisissez une autre sourate.');
      setQuestions(picked);setAnswers([]);setAdded(false);
    } catch(e){if(id===request.current)setError(e instanceof Error?e.message:'Chargement impossible. Réessayez.');}
    finally{if(id===request.current)setLoading(false);}
  }
  function answer(outcome:TestOutcome) {
    const q=questions[answers.length];if(!q)return;
    const next=[...answers,{surah:q.surah,ayah:q.numberInSurah,outcome}];
    setAnswers(next);if(next.length===questions.length)save(next);
  }
  const finished=questions.length>0&&answers.length===questions.length;
  const restart=()=>{++request.current;setQuestions([]);setAnswers([]);setError('');setLoading(false);};
  return <div className="learning-page">
    <Link className="learning-btn" to="/">← Accueil</Link>
    <h1>Teste-moi</h1><p className="learning-muted">Des départs au hasard dans les sourates que vous connaissez. Complétez chaque verset de mémoire.</p>
    {!questions.length ? <>
      <section className="learning-card">
        <h2>Quelles sourates connaissez-vous ?</h2>
        <p className="learning-muted">Sélectionnez uniquement les sourates que vous avez apprises entièrement.</p>
        <label>Rechercher une sourate<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Nom ou numéro"/></label>
        <div className="test-surahs">{surahs.filter(s=>`${s.number} ${s.name} ${s.englishName}`.toLowerCase().includes(filter.toLowerCase())).map(s=><label key={s.number}><input type="checkbox" checked={knownSurahs.includes(s.number)} disabled={loading} onChange={e=>setKnown(e.target.checked?[...knownSurahs,s.number]:knownSurahs.filter(n=>n!==s.number))}/><span>{s.number}. {s.englishName}</span><span lang="ar">{s.name}</span></label>)}</div>
        {!surahs.length&&<button className="learning-btn" onClick={loadSurahs}>Recharger les sourates</button>}
        <p>{knownSurahs.length} sourate{knownSurahs.length>1?'s':''} sélectionnée{knownSurahs.length>1?'s':''}</p>
        <label>Nombre de départs<select value={count} disabled={loading} onChange={e=>setCount(Number(e.target.value))}>{[3,5,10].map(n=><option key={n}>{n}</option>)}</select></label>
        <button className="learning-btn primary" disabled={!knownSurahs.length||loading} onClick={()=>void begin()}>{loading?'Préparation…':'Commencer le test'}</button>
        {error&&<p role="alert">{error}</p>}
      </section>
      {!!history.length&&<section className="learning-card"><h2>Dernier test</h2><p>{new Date(history[0].date).toLocaleDateString('fr-FR')} · {history[0].answers.filter(a=>a.outcome==='independent').length} / {history[0].answers.length} rappels déclarés sans aide</p></section>}
    </> : finished ? <section className="learning-card">
      <h2>Votre bilan</h2><p className="learning-muted">Bilan confirmé par vous après comparaison. Ce n’est pas une évaluation du tajwid.</p>
      <div className="test-totals">{([['independent','Sans aide'],['assisted','Avec indice'],['review','À retravailler']] as const).map(([key,label])=><div key={key}><strong>{answers.filter(a=>a.outcome===key).length}</strong><span>{label}</span></div>)}</div>
      {answers.map(a=><div className="test-result" key={`${a.surah}:${a.ayah}`}><span>{a.surah}:{a.ayah} · {a.outcome==='independent'?'Sans aide':a.outcome==='assisted'?'Avec indice':'À retravailler'}</span><Link to={`/hifdh?surah=${a.surah}&ayah=${a.ayah}`}>Retravailler</Link></div>)}
      {answers.some(a=>a.outcome!=='independent')&&<button className="learning-btn" disabled={added} onClick={()=>{answers.filter(a=>a.outcome!=='independent').forEach(a=>useSRSStore.getState().addCard(a.surah,a.ayah));setAdded(true);}}>{added?'Ajoutés aux révisions':'Ajouter les passages fragiles aux révisions'}</button>}
      <button className="learning-btn primary" onClick={restart}>Nouveau test</button>
    </section> : <><p>Départ {answers.length+1} / {questions.length}</p><TestQuestion key={`${questions[answers.length].surah}:${questions[answers.length].numberInSurah}`} ayah={questions[answers.length]} onAnswer={answer}/><button className="learning-btn" onClick={restart}>Quitter le test</button></>}
  </div>;
}

export function TestQuestion({ayah,onAnswer}:{ayah:Ayah;onAnswer:(outcome:TestOutcome)=>void}) {
  const {words,offset}=testWords(ayah);const cueCount=cueWordCount(words.length);
  const [cueVisible,setCueVisible]=useState(false);
  const [cueReady,setCueReady]=useState(false);
  const [hint,setHint]=useState(false);
  const [review,setReview]=useState(false);
  const [busy,setBusy]=useState(false);
  const [listening,setListening]=useState(false);
  const [message,setMessage]=useState('Écoutez le début, puis récitez la suite.');
  const [heard,setHeard]=useState(0);
  const [errors,setErrors]=useState(0);
  const session=useRef(0);const controller=useRef<AbortController|null>(null);
  const audio=useRef<HTMLAudioElement|null>(null);const cueTimer=useRef<ReturnType<typeof setInterval>|null>(null);const endTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const used=useRef(false);const grading=useRef(new Map<number,boolean>());
  function stopAudio(){audio.current?.pause();if(cueTimer.current)clearInterval(cueTimer.current);cueTimer.current=null;}
  function stop(){++session.current;controller.current?.abort();stopAudio();if(endTimer.current)clearTimeout(endTimer.current);void tilawaService.stop();setBusy(false);setListening(false);}
  useEffect(()=>{
    const generation=session;const abort=controller;const player=audio;const timer=cueTimer;const end=endTimer;
    const suspend=()=>{if(document.hidden){++generation.current;abort.current?.abort();player.current?.pause();if(timer.current)clearInterval(timer.current);if(end.current)clearTimeout(end.current);void tilawaService.stop();setBusy(false);setListening(false);setMessage('Test en pause. Reprenez quand vous êtes prêt.');}};
    document.addEventListener('visibilitychange',suspend);
    return()=>{++generation.current;abort.current?.abort();player.current?.pause();if(timer.current)clearInterval(timer.current);if(end.current)clearTimeout(end.current);void tilawaService.stop();document.removeEventListener('visibilitychange',suspend);};
  },[]);
  async function playCue(){
    if(busy||listening)return;
    const id=++session.current;stopAudio();setBusy(true);setMessage('Préparation du début audio…');
    const player=useAudioPlayerStore.getState();if(player.isPlaying)player.togglePlay();window.dispatchEvent(new Event('quran-stop-playback'));
    try{
      const timings=await fetchWordTimings(ayah.surah,ayah.numberInSurah,7);
      if(id!==session.current)return;
      const end=cueEndSeconds(timings,cueCount);
      if(end===null)throw new Error('Le début audio est indisponible. Utilisez « Voir le début ».');
      const sound=new Audio(getAudioUrl('ar.alafasy',ayah.number));audio.current=sound;
      const done=()=>{if(id!==session.current)return;stopAudio();setBusy(false);setCueReady(true);setMessage('À vous : récitez la suite jusqu’à la fin du verset.');};
      sound.onended=done;sound.onerror=()=>{done();setMessage('Audio indisponible. Utilisez « Voir le début ».');};
      sound.ontimeupdate=()=>{if(sound.currentTime>=end)done();};
      cueTimer.current=setInterval(()=>{if(sound.currentTime>=end)done();},30);
      await sound.play();
    }catch(e){if(id===session.current){stopAudio();setBusy(false);setMessage(e instanceof Error?e.message:'Audio indisponible.');}}
  }
  async function record(){
    if(busy||listening)return;stopAudio();const id=++session.current;const current=()=>id===session.current;
    controller.current=new AbortController();setBusy(true);setMessage('Préparation du microphone…');
    grading.current.clear();setHeard(0);setErrors(0);used.current=false;
    const player=useAudioPlayerStore.getState();if(player.isPlaying)player.togglePlay();window.dispatchEvent(new Event('quran-stop-playback'));
    let failed=false;
    const update=()=>{setHeard([...grading.current.values()].filter(Boolean).length);setErrors([...grading.current.values()].filter(v=>!v).length);};
    try{
      if(!(await tilawaPackStatus()).ready){if(!current())return;await downloadTilawaPack(n=>{if(current())setMessage(`Préparation du pack vocal · ${Math.floor(n)} %`);},controller.current.signal);}
      if(!current())return;
      const ok=await tilawaService.start(ayah.text,{
        onWordMatch:(index,correct)=>{if(current()){grading.current.set(index,correct);update();}},
        onWordReset:index=>{if(current()){grading.current.delete(index);update();}},
        onCurrentWord:index=>{if(current()&&index>=words.length+offset)void tilawaService.finish();},
        onInterimResult:()=>{},
        onError:m=>{if(current()){failed=true;setMessage(m);}},
        onEnd:()=>{if(current()){if(endTimer.current)clearTimeout(endTimer.current);setListening(false);setBusy(false);if(!failed)setReview(true);}},
      },cueCount+offset,{surah:ayah.surah,ayah:ayah.numberInSurah});
      if(!current())return;setBusy(false);
      if(ok){used.current=true;setListening(true);setMessage('Récitez la suite. Le texte reste masqué.');endTimer.current=setTimeout(()=>{if(current())void tilawaService.finish();},60000);}
    }catch(e){if(current()){setBusy(false);setMessage(e instanceof Error?e.message:'Microphone indisponible. Comparez votre récitation sans micro.');}}
  }
  function compare(){stop();setReview(true);}
  return <section className="learning-card test-question">
    <h2>Sourate {ayah.surah}</h2>
    {!review ? <>
      <p role="status">{message}</p>
      <div className="learning-actions"><button className="learning-btn" disabled={busy||listening} onClick={()=>void playCue()}>Écouter le début</button><button className="learning-btn" disabled={busy||listening} onClick={()=>{setCueVisible(true);setCueReady(true);}}>Voir le début</button></div>
      {cueVisible&&<p className="learning-arabic" lang="ar" dir="rtl">{words.slice(0,cueCount).join(' ')} …</p>}
      {hint&&<p className="learning-arabic" lang="ar" dir="rtl">{words.slice(cueCount,cueCount+2).join(' ')} …</p>}
      <div className="test-hidden" aria-label="Suite du verset masquée">La suite reste masquée</div>
      <div className="learning-actions">{busy?<button className="learning-btn" onClick={stop}>Annuler</button>:listening?<button className="learning-btn primary" onClick={()=>void tilawaService.finish()}>Terminer ma récitation</button>:<button className="learning-btn primary" disabled={!cueReady} onClick={()=>void record()}>Réciter au micro</button>}<button className="learning-btn" disabled={busy} onClick={()=>setHint(true)}>Un indice</button><button className="learning-btn" onClick={compare}>Comparer ma récitation</button></div>
    </>:<>
      <p>Verset {ayah.numberInSurah}</p><p className="learning-arabic" lang="ar" dir="rtl">{words.join(' ')}</p>
      {used.current&&<p>{heard} / {words.length-cueCount} mots de la suite reconnus · {errors} signalement{errors>1?'s':''} à vérifier. Les mots non reconnus restent non évalués.</p>}
      <p>Après comparaison, comment avez-vous rappelé ce passage ?</p>
      <div className="learning-actions"><button className="learning-btn" disabled={hint} onClick={()=>onAnswer('independent')}>Sans aide</button><button className="learning-btn" onClick={()=>onAnswer('assisted')}>Avec indice</button><button className="learning-btn" onClick={()=>onAnswer('review')}>À retravailler</button></div>
    </>}
  </section>;
}
