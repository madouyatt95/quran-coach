import {NarrationReport} from '../components/Journeys/NarrationReport';
import {JourneyInvocationBridge} from '../components/Journeys/JourneyInvocationBridge';
import {EditorialDownload} from '../components/Journeys/EditorialDownload';
import { StoryReview } from '../components/Journeys/StoryReview';
import { StoryVerseMap } from '../components/Journeys/StoryVerseMap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { getJourney,narrativeSentences,type EditorialJourney, type JourneyStep } from '../lib/editorialJourneys';
import { useEditorialJourneyStore } from '../stores/editorialJourneyStore';
import { useJourneyAudio } from '../components/Journeys/useJourneyAudio';
import { fetchSurah,fetchSurahTranslation } from '../lib/quranApi';
import { useOpenReader } from '../hooks/useOpenReader';
import { JourneyReflection } from '../components/Journeys/JourneyReflection';
import '../components/Journeys/Journeys.css';
export function EditorialJourneyPage(){const {kind,id}=useParams();const [params]=useSearchParams();const journey=useMemo(()=>getJourney(kind||'',id||''),[kind,id]);return journey?<JourneyReader key={`${journey.id}:${params.get('mode')}`} journey={journey} mode={params.get('mode')||'story'} entry={params.get('step')||''} from={params.get('from')||''}/>:<main className="journey-page"><h1>Ce parcours n’est pas disponible</h1><Link to="/stories">Retrouver les histoires</Link></main>;}
function JourneyReader({journey,mode,entry,from}:{journey:EditorialJourney;mode:string;entry:string;from:string}){
 const [routeParams,setRouteParams]=useSearchParams();
 const [immersive,setImmersive]=useState(false),[showText,setShowText]=useState(false);
 useEffect(()=>{document.body.classList.toggle('story-immersive-active',immersive);const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setImmersive(false);};document.addEventListener('keydown',escape);return()=>{document.body.classList.remove('story-immersive-active');document.removeEventListener('keydown',escape);};},[immersive]);
 const saved=useEditorialJourneyStore(s=>s.progress[journey.id]);
 const episodeRef=useRef<HTMLElement>(null);
 const previousIndex=useRef<number|null>(null);
 const [index,setIndex]=useState(()=>{const target=journey.steps.findIndex(s=>s.id===entry);if(target>=0)return target;if(mode==='reflection'||mode==='review')return journey.steps.length-1;if(mode==='quran')return Math.max(0,journey.steps.findIndex(s=>s.kind==='verse'));const n=journey.steps.findIndex(s=>s.id===saved?.step);return n>=0?n:0;});
 const step=journey.steps[index],audio=useJourneyAudio(journey,setIndex),openReader=useOpenReader(journey.title);
 const save=(next:number,complete=false)=>{audio.selectStep(next);const store=useEditorialJourneyStore.getState(),old=store.progress[journey.id];store.saveProgress(journey.id,{step:journey.steps[next].id,sentence:0,seconds:0,completed:[...new Set([...(old?.completed||[]),...(complete?[step.id]:[])])]});setIndex(next);};
 useEffect(()=>{if(previousIndex.current!==null&&previousIndex.current!==index)episodeRef.current?.scrollIntoView({block:'start',behavior:'smooth'});previousIndex.current=index;},[index]);
 useEffect(()=>{if(routeParams.get('step')!==step.id)setRouteParams(previous=>{const next=new URLSearchParams(previous);next.set('step',step.id);return next;},{replace:true});},[step.id,routeParams,setRouteParams]);
 const completed=journey.steps.filter(s=>saved?.completed.includes(s.id)).length;
 const activeSentence=audio.spoken>=0?audio.spoken:audio.playing?0:saved?.step===step.id?saved.sentence:0;
 const back=journey.kind==='prophet'?`/prophets?prophet=${journey.id.split(':')[1]}`:`/stories?story=${journey.id.split(':')[1]}`;
 return <main className={`journey-page ${immersive?'story-immersive':''}`}><header className="journey-header"><Link to={back} aria-label="Retour à la fiche"><ArrowLeft size={21}/></Link><span>{journey.icon} {journey.title}</span>{immersive&&<button onClick={()=>setImmersive(false)}>Quitter l’immersion</button>}</header>
 <div className="journey-heading"><span className="journey-kicker">UN RÉCIT, UN CHEMIN</span><h1>{journey.title}</h1>{journey.intro&&<p>{journey.intro}</p>}{/^\/read\?/.test(from)&&<Link className="story-return" to={from}>← Retour au Mushaf à mon verset</Link>}<div className="journey-heading-meta"><p>{completed} / {journey.steps.length} étapes parcourues</p><Link to="/journeys/notebook">📓 Mon carnet</Link></div><progress value={completed} max={journey.steps.length} aria-label="Progression du parcours"/></div>
 <div className="story-reader-controls"><button aria-pressed={immersive} onClick={()=>setImmersive(!immersive)}>{immersive?'Quitter l’immersion':'Lecture immersive'}</button></div>
 <EditorialDownload journey={journey}/>
 <StoryVerseMap journey={journey} onSelect={id=>{const n=journey.steps.findIndex(s=>s.id===id);if(n>=0)save(n);}}/>
 <details className="journey-contents"><summary>Sommaire · étape {index+1}/{journey.steps.length}</summary><ol>{journey.steps.map((s,i)=><li key={s.id}><button aria-current={i===index?'step':undefined} onClick={()=>save(i)}>{saved?.completed.includes(s.id)?'✓ ':''}{s.title}</button></li>)}</ol></details>
 <article ref={episodeRef} className="journey-episode" key={step.id}><span className="journey-kicker">{step.kind==='verse'?'LE TEXTE CORANIQUE':step.kind==='reflection'?'MA RÉFLEXION':'LE RÉCIT'}</span><h2>{step.title}</h2>
 {step.kind==='narrative'?<>{immersive&&!showText?<div className="story-spoken"><span className="journey-kicker">{activeSentence+1} / {narrativeSentences(step.text).length}</span><p key={`${step.id}:${activeSentence}`} aria-live="off">{narrativeSentences(step.text)[activeSentence]||narrativeSentences(step.text)[0]}</p><button onClick={()=>setShowText(true)}>Afficher tout le chapitre</button></div>:<div className="journey-narrative journey-sentences">{narrativeSentences(step.text).map((sentence,n)=><button key={n} data-spoken={audio.playing&&audio.spoken===n||undefined} aria-label={`Écouter à partir de : ${sentence}`} onClick={()=>void audio.play(index,n)}>{sentence} </button>)}{immersive&&<button onClick={()=>setShowText(false)}>Revenir au texte suivi</button>}</div>}{step.insight&&<aside className="story-insight"><strong>Le fil du récit</strong><p>{step.insight}</p></aside>}<p className="journey-source">{step.reference&&<><a href={`https://quran.com/${step.reference.replace(':','/')}`} target="_blank" rel="noopener noreferrer">Passage source · {step.reference} ↗</a><br/></>}Synthèse pédagogique · {step.reference?'récit fondé sur le passage indiqué.':'passages associés à retrouver dans la suite du parcours.'}</p></>:step.kind==='verse'?<JourneyVerse key={step.id} step={step} onOpen={()=>{audio.pause();openReader({surah:step.surah!,ayah:step.ayah!});}}/>:<><StoryReview journey={journey} onRevisit={id=>{const n=journey.steps.findIndex(s=>s.id===id);if(n>=0)save(n);}}/><JourneyReflection journey={journey}/></>}
 </article>
 {step.kind==='narrative'&&<NarrationReport key={`report-${step.id}`} journeyId={journey.id} title={`${journey.title} - ${step.title}`} text={step.text} sentence={activeSentence}/>}
 <JourneyInvocationBridge journeyId={journey.id} onPause={audio.pause}/>
 <nav className="journey-next"><button disabled={index===0} onClick={()=>save(index-1)}><ChevronLeft size={18}/>Précédent</button><button onClick={()=>save(Math.min(index+1,journey.steps.length-1),true)}>{index===journey.steps.length-1?'Terminer le parcours':'J’ai lu · continuer'}<ChevronRight size={18}/></button></nav>
 {index===journey.steps.length-1&&saved?.completed.includes(step.id)&&<p role="status" className="journey-finished">Parcours terminé. Votre carnet reste à votre disposition.</p>}
 <div className="journey-audio-dock" role="region" aria-label="Lecteur du parcours"><button disabled={step.kind==='reflection'} onClick={()=>audio.playing?audio.pause():void audio.play(index)}>{audio.playing?<Pause size={19}/>:<Play size={19}/>} {audio.playing?'Pause':'Écouter la suite'}</button><div><strong>{step.kind==='verse'?`Coran ${step.surah}:${step.ayah}`:step.kind==='reflection'?'Pause de réflexion':`Chapitre ${Math.max(1,journey.steps.slice(0,index+1).filter(s=>s.kind==='narrative').length)}`}</strong><small>{step.kind==='verse'?'Mishary Alafasy':step.kind==='reflection'?'Votre carnet personnel':'Narration française · reprise exacte'}</small></div><button aria-label="Reculer de 15 secondes" disabled={!audio.duration} onClick={()=>audio.seek(-15,true)}>↶ 15 s</button>
 <details className="journey-player-options"><summary>Réglages d’écoute</summary><div>
 <label>Vitesse <select aria-label="Vitesse de narration" value={audio.rate} onChange={e=>audio.setSpeed(Number(e.target.value))}>{[.75,1,1.25,1.5].map(v=><option key={v} value={v}>{v}×</option>)}</select></label>
 <label>Arrêter <select aria-label="Arrêt automatique du récit" value={audio.stopAfter} onChange={e=>audio.setStopAfter(e.target.value)}><option value="none">À la fin du récit</option><option value="chapter">À la fin du chapitre</option>{[5,10,15,30].map(n=><option key={n} value={n}>Dans {n} minutes</option>)}</select></label>
 {audio.duration>0&&<label>Position · {Math.floor(audio.position/60)}:{String(Math.floor(audio.position%60)).padStart(2,'0')}<input type="range" aria-label="Position dans le chapitre" min={0} max={audio.duration} step={1} value={Math.min(audio.position,audio.duration)} onChange={e=>audio.seek(Number(e.target.value))}/></label>}
 </div></details>{audio.error&&<p role="alert">{audio.error}</p>}</div>
 </main>;
}
function JourneyVerse({step,onOpen}:{step:JourneyStep;onOpen:()=>void}){
 const [content,setContent]=useState<{ar:string;fr:string}|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let cancelled=false;void fetchSurah(step.surah!).then(async data=>{const v=data.ayahs.find(a=>a.numberInSurah===step.ayah);if(!v)throw new Error('absent');let fr='';try{fr=(await fetchSurahTranslation(step.surah!,'fr')).get(v.number)||'';}catch{/* Arabic remains available. */}if(!cancelled)setContent({ar:v.text,fr});}).catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};},[step.surah,step.ayah,retry]);
 return <>{step.chapterId&&<p className="story-verse-context">{step.text}</p>}{content?<><p className="journey-arabic" dir="rtl" lang="ar">{content.ar}</p><p>{content.fr||'Traduction indisponible pour le moment.'}</p></>:<p role="status">{error?<button onClick={()=>{setError(false);setRetry(n=>n+1);}}>Réessayer le chargement</button>:'Chargement du verset…'}</p>}<div className="journey-verse-actions"><button onClick={onOpen}><BookOpen size={17}/>Lire dans le Mushaf</button><a href={`https://quran.com/${step.surah}/${step.ayah}`} target="_blank" rel="noopener noreferrer">Source · {step.surah}:{step.ayah} ↗</a></div></>;
}
