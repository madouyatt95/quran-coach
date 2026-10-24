import {usePupitreMode} from '../../components/Pupitre/Pupitre';
import {useMemo,useState,useImperativeHandle,type Ref} from 'react';
import {Play,Pause,RotateCcw} from 'lucide-react';
import {courseJourney} from '../courseExperience';
import {useJourneyAudio} from '../../components/Journeys/useJourneyAudio';
import {useEditorialJourneyStore} from '../../stores/editorialJourneyStore';
import {narrationSentences} from '../../lib/narrationText';
export interface CourseAudioHandle {play:(index:number)=>void}
export function CourseAudio({id,ref,onRead,onQuestion}:{id:string;ref:Ref<CourseAudioHandle>;onRead:(index:number)=>void;onQuestion:()=>void}){
 const split=usePupitreMode()!=='plain';
 const journey=useMemo(()=>courseJourney(id),[id]);
 const [index,setIndex]=useState(()=>{const saved=useEditorialJourneyStore.getState().progress[journey.id];return Math.max(0,journey.steps.findIndex(step=>step.id===saved?.step));});
 const audio=useJourneyAudio(journey,setIndex,{recordedOnly:true});
 const [expanded,setExpanded]=useState(false);
 useImperativeHandle(ref,()=>({play:(index:number)=>{setExpanded(true);void audio.play(index,0);}}));
 const step=journey.steps[index],sentence=narrationSentences(step.text)[Math.max(0,audio.spoken)];
 return <section className={`course-audio ${audio.playing?'is-playing':''}`} aria-label="Narration du cours"><div className="course-audio-bar"><button onClick={()=>audio.playing?audio.pause():void audio.play(index)} aria-label={audio.playing?'Mettre le cours en pause':'Écouter le cours raconté'}>{audio.playing?<Pause size={20}/>:<Play size={20}/>}</button><div><strong>{audio.playing?step.title:'Le cours raconté'}</strong><small>Voix française · {index+1}/3</small></div><button className="pupitre-classic-only" onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}>{expanded?'Réduire':'Ouvrir'}</button></div>{(expanded||split)&&<div className="course-audio-expanded"><p className="course-audio-spoken">{sentence}</p><div className="course-audio-controls"><button onClick={()=>audio.seek(-15,true)} disabled={!audio.duration}><RotateCcw size={15}/> 15 s</button><button onClick={()=>void audio.play(index,0)}>Réécouter cette partie</button><button onClick={()=>onRead(index)}>Retrouver le passage écrit</button><button onClick={()=>{audio.pause();onQuestion();}}>Garder une question</button></div><label>Partie du cours<select aria-label="Partie du cours" value={index} onChange={event=>{const next=Number(event.target.value);audio.selectStep(next);setIndex(next);}}>{journey.steps.map((step,n)=><option key={step.id} value={n}>{n+1}. {step.title}</option>)}</select></label><label>Vitesse<select aria-label="Vitesse" value={audio.rate} onChange={event=>audio.setSpeed(Number(event.target.value))}>{[.75,1,1.25,1.5].map(rate=><option key={rate} value={rate}>{rate}×</option>)}</select></label>{audio.duration>0&&<label>Position · {Math.floor(audio.position/60)}:{String(Math.floor(audio.position%60)).padStart(2,'0')}<input aria-label="Position de la narration" type="range" min={0} max={audio.duration} value={Math.min(audio.position,audio.duration)} onChange={event=>audio.seek(Number(event.target.value))}/></label>}<small>Narration française de synthèse. Les commandes de l’écran verrouillé sont disponibles sur les appareils compatibles.</small></div>}{audio.error&&<p role="alert">{audio.error}</p>}</section>;
}
