import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {usePracticeState} from '../stores/arabicPracticeStore';
import {useAudioPlayerStore} from '../stores/audioPlayerStore';
import {useStatsStore} from '../stores/statsStore';
import {useSettingsStore} from '../stores/settingsStore';
import {loadFahmVerse,type FahmVerse} from '../lib/fahm/content';
import {getAudioUrl} from '../lib/quranApi';
import {SURAH_JOURNEYS,SEGMENT_TASKS,canonicalWords,type JourneyVerse} from './journeyData';
import {SegmentCard} from './SegmentStudio';
import {wordGrammarSource} from './data';
export function SurahJourney(){
 const [surah,setSurah]=usePracticeState('journey:surah',112);const journey=SURAH_JOURNEYS.find(j=>j.id===surah)||SURAH_JOURNEYS[0];
 const [index,setIndex]=usePracticeState(`journey:${journey.id}:index`,0);
 const task=journey.verses[index]||journey.verses[0];
 return <><h1>Comprendre ce que je récite</h1><p>Trois sourates, quinze étapes : écouter, observer une construction et comparer votre compréhension à la traduction.</p><div className="arabic-options">{SURAH_JOURNEYS.map(j=><button key={j.id} aria-pressed={journey.id===j.id} onClick={()=>setSurah(j.id)}>{j.title}</button>)}</div><h2>{journey.title}</h2><p>{journey.subtitle}</p><nav className="arabic-options" aria-label="Versets du parcours">{journey.verses.map((v,i)=><button key={v.key} aria-pressed={index===i} onClick={()=>setIndex(i)}>Verset {i+1}</button>)}</nav><JourneyStep key={task.key} task={task}/><div className="arabic-actions">{index>0&&<button onClick={()=>setIndex(index-1)}>← Verset précédent</button>}{index<journey.verses.length-1?<button onClick={()=>setIndex(index+1)}>Verset suivant →</button>:<Link to="/academy/arabic">Retour au programme →</Link>}</div></>;
}
export function JourneyStep({task,onComplete,storageKey}:{task:JourneyVerse;onComplete?:()=>void;storageKey?:string}){
 const [d,setD]=usePracticeState<{note:string;revealed:boolean;choice:number|null;complete:boolean;hint:boolean}>(storageKey||`journey:${task.key}`,{note:'',revealed:false,choice:null,complete:false,hint:false});
 const [verse,setVerse]=useState<FahmVerse|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[playing,setPlaying]=useState(false);
 const [surah,ayah]=task.key.split(':').map(Number);const audio=useRef<HTMLAudioElement>(null);const reciter=useSettingsStore(s=>s.selectedReciter);
 useEffect(()=>{let disposed=false;void loadFahmVerse({surah,ayah}).then(v=>{if(!disposed)setVerse(v);}).catch(()=>{if(!disposed)setError('Le passage audio et sa traduction n’ont pas pu être chargés.');});const el=audio.current;const stop=()=>el?.pause();window.addEventListener('quran-stop-playback',stop);return()=>{disposed=true;stop();window.removeEventListener('quran-stop-playback',stop);};},[surah,ayah,retry]);
 const play=()=>{const el=audio.current;if(!verse||!el)return;if(!el.paused){el.pause();return;}window.dispatchEvent(new Event('quran-stop-playback'));useAudioPlayerStore.getState().stop();el.src=getAudioUrl(reciter,verse.ayah.number);void el.play().catch(()=>setError('L’écoute n’a pas pu démarrer. Vous pouvez réessayer.'));};
 const segment=SEGMENT_TASKS.find(t=>t.key===task.key&&t.position===task.focus);
 const correct=d.choice===task.answer;
 return <section className="arabic-workshop"><span className="fahm-eyebrow">CORAN {task.key} · UNE CONSTRUCTION À COMPRENDRE</span><h2>{task.title}</h2><p className="arabic-verse" lang="ar" dir="rtl">{canonicalWords(task.key).map((w,i)=><span key={i} className={i+1===task.focus?'is-focus':''}>{w}{' '}</span>)}</p><div className="arabic-actions"><button disabled={!verse} onClick={play}>{playing?'Pause':'▶ Écouter le verset'}</button><Link to={`/read?surah=${surah}&ayah=${ayah}`}>Ouvrir dans le Mushaf →</Link></div><audio ref={audio} preload="none" onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError('L’audio est indisponible. Réessayez avec une connexion.');}}/>{error&&<p role="alert">{error} <button onClick={()=>{setError('');setRetry(n=>n+1);}}>Réessayer</button></p>}
 <label>Avant la traduction, ce que je comprends<textarea rows={3} value={d.note} onChange={e=>setD(x=>({...x,note:e.target.value.slice(0,2000)}))} placeholder="Quelques mots suffisent. Vous pouvez aussi passer directement à la comparaison."/></label><button className="arabic-next-reason" onClick={()=>setD(x=>({...x,revealed:!x.revealed}))}>{d.revealed?'Replier la traduction':'Comparer avec la traduction'}</button>
 {d.revealed&&<div className="grammar-insight">{verse?.translation?<p>{verse.translation}</p>:<p>Traduction indisponible pour le moment. <button onClick={()=>setRetry(n=>n+1)}>Réessayer</button> <Link to={`/fahm?surah=${surah}&ayah=${ayah}`}>Consulter le passage dans Fahm</Link>.</p>}<small>Votre reformulation reste personnelle : elle n’est pas notée automatiquement.</small></div>}
 <h3>{task.question}</h3><div className="arabic-options">{task.options.map((o,i)=><button key={o} aria-pressed={d.choice===i} onClick={()=>setD(x=>({...x,choice:i}))}>{o}</button>)}</div>{(d.choice!==null||d.hint)&&<p role="status">{d.choice!==null&&(correct?'Bien repéré. ':'À reprendre. ')}{task.explanation}</p>}{d.choice===null&&!d.hint&&<button className="arabic-next-reason" onClick={()=>setD(x=>({...x,hint:true}))}>Comprendre la construction avant de répondre</button>}
 {segment&&<details><summary>Décomposer le mot repéré</summary><SegmentCard task={segment}/></details>}
 <div className="arabic-actions"><Link to={`/academy/arabic/${task.lesson}`}>Retrouver la notion →</Link><Link to={`/fahm?surah=${surah}&ayah=${ayah}`}>Traduction et tafsir →</Link><a href={wordGrammarSource(task.key,task.focus)} target="_blank" rel="noreferrer">Vérifier l’analyse ↗</a></div>
 <button className="fahm-primary" disabled={!correct||!d.revealed||!verse?.translation} onClick={()=>{if(!d.complete)useStatsStore.getState().recordActivity();setD(x=>({...x,complete:true}));onComplete?.();}}>{d.complete?'Étape travaillée ✓':'J’ai comparé et compris ce repère'}</button><small>Une étape travaillée ne valide pas une maîtrise complète du verset.</small></section>;
}
