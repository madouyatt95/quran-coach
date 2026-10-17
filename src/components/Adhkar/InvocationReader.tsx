import {useEffect,useEffectEvent,useRef,useState} from 'react';
import {InvocationComparison} from './InvocationComparison';
import {InvocationReview} from './InvocationReview';
import {InvocationJourneyLinks} from '../Journeys/JourneyInvocationBridge';
import {ChevronLeft,ChevronRight,Heart,Pause,Play,Square,Undo2} from 'lucide-react';
import {countEvidence,invocationCountKey,invocationPhrases,invocationTitle,isDailyInvocation,type Invocation} from '../../lib/adhkarExperience';
import {useDailyAdhkarStore,localAdhkarDay} from '../../stores/dailyAdhkarStore';
import {useAdhkarExperienceStore} from '../../stores/adhkarExperienceStore';
import {useFavoritesStore} from '../../stores/favoritesStore';
import {playAdhkarAudioLoop,pauseAdhkarAudio,resumeAdhkarAudio,stopAdhkarAudio,learnAdhkar,getAdhkarAudioUrl} from '../../lib/adhkarAudioService';
import {humanInvocationAudio} from '../../lib/humanInvocationAudio';
import {invocationRecording,isRecallHidden,type RecallStage} from '../../lib/invocationLearning';
import {InvocationUnderstanding} from './InvocationUnderstanding';
import {InvocationCollections} from './InvocationCollections';
export function InvocationReader({items,index,session,onSelect,onBack,autoStart,onAdvance}:{items:Invocation[];index:number;session:string;onSelect:(n:number)=>void;onBack:()=>void;autoStart:boolean;onAdvance:()=>void}){
 const d=items[index],experience=useAdhkarExperienceStore(),daily=useDailyAdhkarStore(),favorites=useFavoritesStore();
 const pref=experience.preferences; const setResume=experience.setResume;
 const [audio,setAudio]=useState<'idle'|'loading'|'playing'|'paused'>('idle'),[error,setError]=useState(''),[phase,setPhase]=useState(''),[part,setPart]=useState(-1),[loop,setLoop]=useState(0),[notice,setNotice]=useState('');
 const [recall,setRecall]=useState<RecallStage>('read'),[revealed,setRevealed]=useState<number[]>([]);
 const human=invocationRecording(d),reciter=humanInvocationAudio(d.categoryId,d.id);
 const sequence=useRef(0),paused=useRef(false);
 const stop=()=>{sequence.current++;paused.current=false;stopAdhkarAudio();setAudio('idle');setPhase('');setPart(-1);};
 useEffect(()=>{
  setResume(session,d.key);
  // Keep old reader keys usable for links and previous app versions.
  localStorage.setItem('adhkar_category_id',d.categoryId);localStorage.setItem('adhkar_dhikr_index',String(index));localStorage.setItem('adhkar_view_state','player');
  const cancel=()=>{sequence.current++;stopAdhkarAudio();setAudio('idle');setPart(-1);setPhase('');paused.current=false;};
  window.addEventListener('quran-stop-playback',cancel);
  return()=>{cancel();window.removeEventListener('quran-stop-playback',cancel);};
 },[d.key,d.categoryId,index,session,setResume]);
 const evidence=countEvidence(d),key=invocationCountKey(d),target=evidence?d.count:experience.targets[d.key]||d.count||1;
 const today=localAdhkarDay();
 const count=isDailyInvocation(d)?daily.day===today?daily.counts[key]||0:0:experience.counts[key]||0;
 const change=(delta:number)=>{if(isDailyInvocation(d)){if(delta>0)daily.increment(key,target);else daily.decrement(key);}else experience.count(key,delta,target);};
 const play=async()=>{
  if(audio==='paused'){paused.current=false;resumeAdhkarAudio();setAudio('playing');return;}
  if(audio==='playing'||audio==='loading'){paused.current=true;pauseAdhkarAudio();setAudio('paused');return;}
  window.dispatchEvent(new Event('quran-stop-playback'));
  const id=++sequence.current;setError('');setAudio('loading');paused.current=false;
  const understanding={gapMode:pref.gapMode,referenceDuration:human?.duration||Math.max(2,d.arabic.split(/\s+/).length/1.8),arabic:pref.arabicAudio,french:pref.frenchAudio,silence:pref.repeatSilence,translation:d.translation,gap:pref.gap,onPhase:(p:'arabic'|'french'|'silence')=>{if(id===sequence.current){setPart(-1);setPhase(p==='french'?'Écoutez le sens en français':p==='silence'?'À vous de réciter':'');if(!paused.current)setAudio('playing');}}};
  try{
   if(pref.mode==='learn')await learnAdhkar(invocationPhrases(d.arabic),{rate:pref.rate,repeats:pref.repeats,gap:pref.gap,recording:human,understanding,onPart:(n,p)=>{if(id===sequence.current){setPart(n);setPhase(p==='repeat'?'À vous de répéter':p==='listen'?human?`Écoutez le passage ${n+1}/${human.ranges.length}`:'Écoutez la phrase':'Préparation de la voix…');if(!paused.current)setAudio(p==='loading'?'loading':'playing');}}});
   else await playAdhkarAudioLoop(d.arabic,d.id,d.categoryId,pref.repeats,d.source,{rate:pref.rate,understanding,onLoop:n=>{if(id===sequence.current)setLoop(n+1);},onStarted:()=>{if(id===sequence.current&&!paused.current)setAudio('playing');}});
   if(id===sequence.current&&pref.continuous&&index<items.length-1)onAdvance();
  }catch{if(id===sequence.current)setError('La lecture n’a pas pu démarrer. Réessayez ou utilisez une voix disponible sur votre appareil.');}
  finally{if(id===sequence.current){setAudio('idle');setPart(-1);setPhase('');}}
 };
 const configure=(value:Parameters<typeof experience.configure>[0])=>{stop();experience.configure(value);};
 const autoPlay=useEffectEvent(()=>{void play();});
 useEffect(()=>{if(autoStart){const timer=setTimeout(()=>autoPlay(),0);return()=>clearTimeout(timer);}},[autoStart]);
 useEffect(()=>{if(part>=0)document.querySelector('.inv-spoken')?.scrollIntoView({block:'center',behavior:'smooth'});},[part]);
 const share=async()=>{const url=`${location.origin}/adhkar?cat=${encodeURIComponent(d.categoryId)}&dua=${d.id}`;const text=`${d.arabic}\n\n${d.translation}\n\n${d.source||''}\n${url}`;try{if(navigator.share)await navigator.share({title:invocationTitle(d),text});else {await navigator.clipboard.writeText(text);setNotice('Invocation et lien copiés.');}}catch{/* Native cancellation needs no error toast. */}};
 const favorite=favorites.isFavoriteDua(d.categoryId,d.id);
 return <section className="inv-reader">
 <div className="inv-reader-heading"><button onClick={onBack}>← Voir la liste</button><span>{index+1} / {items.length}</span><button aria-label={favorite?'Retirer des favoris':'Ajouter aux favoris'} aria-pressed={favorite} onClick={()=>favorites.toggleFavoriteDua({chapterId:d.categoryId,duaId:d.id,arabic:d.arabic,translation:d.translation,source:d.source||'',chapterTitle:d.categoryName})}><Heart size={20} fill={favorite?'currentColor':'none'}/></button></div>
 <div className="inv-mode"><button aria-pressed={pref.mode==='recite'} onClick={()=>configure({mode:'recite'})}>Je récite</button><button aria-pressed={pref.mode==='learn'} onClick={()=>configure({mode:'learn'})}>J’apprends</button></div>
 <article className="inv-sheet"><span className="inv-eyebrow">{d.categoryName}</span><h2>{invocationTitle(d)}</h2>
 {pref.mode==='learn'&&<div className="inv-recall-controls" aria-label="Étapes de mémorisation">{([['read','1 · Avec le texte'],['clues','2 · Quelques indices'],['memory','3 · De mémoire']] as const).map(([stage,label])=><button key={stage} aria-pressed={recall===stage} onClick={()=>{setRecall(stage);setRevealed([]);}}>{label}</button>)}</div>}
 <div className="inv-arabic" dir="rtl" lang="ar">{pref.mode==='learn'&&recall!=='read'?d.arabic.split(/(\s+)/).map((text,n)=>{
  if(/^\s+$/.test(text))return text;
  const hidden=isRecallHidden(recall,Math.floor(n/2))&&!revealed.includes(n);
  return hidden?<button className="inv-hidden-word" key={n} aria-label={`Révéler le mot ${Math.floor(n/2)+1}`} onClick={()=>setRevealed(previous=>[...previous,n])}>•••</button>:<span key={n}>{text}</span>;
 }):pref.mode==='learn'&&!human?invocationPhrases(d.arabic).map((text,n)=><span key={n} className={part===n?'inv-spoken':''}>{text}{' '}</span>):d.arabic}</div>
 {pref.mode==='learn'&&recall!=='read'&&<p className="inv-muted">Touchez un emplacement pour retrouver un mot.{revealed.length>0?` ${revealed.length} aide(s) utilisée(s).`:''}</p>}
 {pref.mode==='learn'&&recall==='memory'&&<button className="inv-learned" onClick={()=>{experience.markLearned(d.key);setNotice('Votre réussite a été enregistrée. Elle ne modifie pas le compteur de récitations.');}}>✓ J’ai réussi à la réciter de mémoire</button>}
 {experience.learned[d.key]&&<p className="inv-muted">Dernière réussite déclarée : {new Date(experience.learned[d.key]).toLocaleDateString('fr-FR')}</p>}
 {pref.mode==='learn'&&recall!=='read'?<details className="inv-details" key={recall}><summary>Afficher la phonétique et la traduction</summary><div className="inv-details-body"><p className="inv-phonetic">{d.transliteration||'Phonétique non renseignée.'}</p><p>{d.translation}</p></div></details>:<div className="inv-reveal"><button aria-expanded={pref.phonetic} onClick={()=>experience.configure({phonetic:!pref.phonetic})}>Phonétique {pref.phonetic?'−':'+'}</button>{pref.phonetic&&<p className="inv-phonetic">{d.transliteration||'Phonétique non renseignée pour cette invocation.'}</p>}<button aria-expanded={pref.translation} onClick={()=>experience.configure({translation:!pref.translation})}>Traduction {pref.translation?'−':'+'}</button>{pref.translation&&<p>{d.translation}</p>}</div>}
 {d.note&&<p className="inv-note">{d.note}</p>}
 <p className="inv-count-origin">{evidence?`${evidence.label} · ${target} ${target===1?'lecture':'fois'}${d.daily?' sur la journée':''}`:`Objectif personnel · ${target} ${target===1?'lecture':'répétitions'}`}</p>
 {!evidence&&<label className="inv-target">Mon objectif <input type="number" min={1} max={1000} value={target} onChange={e=>experience.setTarget(d.key,e.target.valueAsNumber)}/></label>}
 {count>=target&&<p role="status" className="inv-complete">✓ Compteur terminé pour cette invocation.{index<items.length-1?' Vous pouvez passer à la suivante.':' Vous êtes à la fin de la liste.'}</p>}
 </article>
 <details className="inv-details inv-listening-options"><summary>🎧 Composer mon écoute</summary><div className="inv-details-body">
 <p>Choisissez les étapes de votre écoute.</p>
 <label className="inv-check"><input type="checkbox" checked={pref.arabicAudio} disabled={!pref.frenchAudio} onChange={e=>configure({arabicAudio:e.target.checked})}/>Invocation en arabe</label>
 <label className="inv-check"><input type="checkbox" checked={pref.frenchAudio} disabled={!pref.arabicAudio} onChange={e=>configure({frenchAudio:e.target.checked})}/>Puis le sens en français</label>
 <label className="inv-check"><input type="checkbox" checked={pref.repeatSilence} onChange={e=>configure({repeatSilence:e.target.checked})}/>Un silence pour réciter</label>
 <label className="inv-target">Temps pour répéter <select aria-label="Rythme du silence" value={pref.gapMode} onChange={e=>configure({gapMode:e.target.value as 'auto'|'slow'|'fixed'})}><option value="auto">Adapté au passage</option><option value="slow">Plus de temps</option><option value="fixed">Durée fixe</option></select></label>
 {pref.gapMode==='fixed'&&<label className="inv-target">Durée du silence <select aria-label="Silence pour réciter" value={pref.gap} onChange={e=>configure({gap:Number(e.target.value)})}>{[2,4,6,10,15].map(n=><option key={n} value={n}>{n} secondes</option>)}</select></label>}
 {pref.mode==='learn'&&human&&<p className="inv-muted">{human.ranges.length>1?'L’enregistrement est repris par passages, à ses pauses naturelles.':'Cette invocation courte est répétée en entier.'} Le texte reste visible sans alignement mot à mot.</p>}
 </div></details>
 {reciter&&<p className="inv-muted">Récitation : {reciter.reciter} · <a href={reciter.source} target="_blank" rel="noopener noreferrer">OpenDua ↗</a></p>}
 {reciter?.audioNote&&<p className="inv-muted">{reciter.audioNote}</p>}
 <InvocationComparison invocation={d}/><InvocationReview invocationKey={d.key}/><InvocationJourneyLinks invocationKey={d.key}/>
 <InvocationUnderstanding invocation={d}/><InvocationCollections invocation={d}/>
 <details className="inv-details"><summary>••• Plus d’options</summary><div className="inv-details-body"><label className="inv-check"><input type="checkbox" checked={pref.continuous} onChange={e=>configure({continuous:e.target.checked})}/>Enchaîner les invocations à l’écoute</label><p className="inv-muted">L’écoute ne valide jamais vos récitations.</p><button onClick={()=>void share()}>Partager cette invocation</button>{!isDailyInvocation(d)&&<button onClick={()=>{if(window.confirm('Remettre ce compteur à zéro ?'))experience.reset([key]);}}>Recommencer ce compteur</button>}</div></details>
 {notice&&<p role="status">{notice}</p>}
 <div className="inv-dock" role="region" aria-label="Lecteur des invocations">
 <div className="inv-dock-top"><button aria-label="Invocation précédente" disabled={index===0} onClick={()=>{stop();onSelect(index-1);}}><ChevronLeft size={20}/></button>
 <button className="inv-play" onClick={()=>void play()} aria-label={audio==='paused'?'Reprendre l’audio':audio==='idle'?'Écouter': 'Mettre en pause'}>{audio==='idle'||audio==='paused'?<Play size={18}/>:<Pause size={18}/>}<span>{audio==='idle'?'Écouter':audio==='paused'?'Reprendre':audio==='loading'?'Préparation…':'Pause'}</span></button>
 <button aria-label="Arrêter l’audio" disabled={audio==='idle'} onClick={stop}><Square size={16}/></button>
 <button className="inv-counter" disabled={count>=target} onClick={()=>change(1)} aria-label={`Valider une récitation, ${count} sur ${target}`}><strong>{count} / {target}</strong><small>J’ai récité +1</small></button>
 <button aria-label="Annuler le dernier comptage" disabled={count===0} onClick={()=>change(-1)}><Undo2 size={18}/></button>
 <button aria-label="Invocation suivante" disabled={index===items.length-1} onClick={()=>{stop();onSelect(index+1);}}><ChevronRight size={20}/></button></div>
 <div className="inv-dock-settings"><label>Vitesse <select aria-label="Vitesse audio" value={pref.rate} onChange={e=>configure({rate:Number(e.target.value)})}>{[0.5,0.75,1,1.25,1.5].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><label>Écoutes <select aria-label="Répétitions audio" value={pref.repeats} onChange={e=>configure({repeats:Number(e.target.value)})}>{[1,2,3,5,10].map(n=><option key={n}>{n}</option>)}</select></label>{pref.mode==='learn'&&pref.gapMode==='fixed'&&<label>À moi <select aria-label="Temps pour répéter" value={pref.gap} onChange={e=>configure({gap:Number(e.target.value)})}>{[2,4,6,10,15].map(n=><option key={n} value={n}>{n}s</option>)}</select></label>}</div>
 <small className="inv-audio-status" role="status">{audio==='paused'?'Audio en pause':phase|| (audio==='playing'?`Écoute ${loop}/${pref.repeats}`:pref.mode==='learn'?human?reciter?'Passages · Muhammad Jumah':'Passages enregistrés':'Phrase par phrase · voix de synthèse':reciter?'Récitation · Muhammad Jumah':getAdhkarAudioUrl(d.categoryId,d.id)?'Enregistrement · voix de synthèse si indisponible':d.categoryId==='rabanna'?'Récitation · voix de synthèse si indisponible':'Voix de synthèse')} · compteur manuel</small>
 {error&&<p role="alert">{error}</p>}
 </div></section>;
}
