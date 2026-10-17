import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {usePracticeState} from '../stores/arabicPracticeStore';
import {useAudioPlayerStore} from '../stores/audioPlayerStore';
import {quranWordAudioUrl} from '../lib/interactiveMushaf/model';
import corpus from '../lib/fahm/context-corpus.json';
import {LISTENING_TASKS} from './listeningData';
export function ListeningPractice(){
 const [index,setIndex]=usePracticeState('listening:index',0);
 const task=LISTENING_TASKS[index]||LISTENING_TASKS[0];
 return <><h1>Reconnaître à l’oreille</h1><p>Écoutez avant de lire, puis retrouvez le sens.</p><details className="arabic-help"><summary>À propos des enregistrements</summary><p>Audio mot à mot Quran.com. Le ralenti conserve la hauteur de voix lorsque le navigateur le permet.</p></details><div className="arabic-options">{LISTENING_TASKS.map((t,i)=><button key={t.id} aria-pressed={i===index} onClick={()=>setIndex(i)}>Écoute {i+1}</button>)}</div><ListeningItem key={task.id} task={task}/></>;
}
function ListeningItem({task}:{task:typeof LISTENING_TASKS[number]}){
 const [draft,setDraft]=usePracticeState<{choice:number|null;revealed:boolean}>(`listening:${task.id}`,{choice:null,revealed:false});
 const [heard,setHeard]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState('');
 const audio=useRef<HTMLAudioElement>(null),session=useRef(0);
 useEffect(()=>{const el=audio.current;const stop=()=>{session.current++;el?.pause();};window.addEventListener('quran-stop-playback',stop);return()=>{stop();window.removeEventListener('quran-stop-playback',stop);};},[]);
 function play(rate:number,item=task){
  const el=audio.current,url=quranWordAudioUrl(item.verse,item.position);if(!el||!url)return;
  window.dispatchEvent(new Event('quran-stop-playback'));useAudioPlayerStore.getState().stop();
  const request=++session.current;setError('');el.src=url;el.playbackRate=rate;el.preservesPitch=true;
  void el.play().then(()=>{if(request===session.current&&item.id===task.id)setHeard(true);}).catch(()=>{if(request===session.current)setError('L’enregistrement n’a pas pu être chargé. Vérifiez votre connexion puis réessayez.');});
 }
 const revealed=draft.revealed||draft.choice!==null;
 const text=(corpus as Record<string,string[]>)[task.verse]?.[task.position-1];
 const pair=task.pair===null?null:LISTENING_TASKS[task.pair];
 return <section className="arabic-workshop"><span className="fahm-eyebrow">ÉCOUTER · DISTINGUER · COMPRENDRE</span><h2>{task.prompt}</h2><div className="arabic-actions"><button onClick={()=>play(1)}>▶ Écouter</button><button onClick={()=>play(.75)}>Écouter à 0,75×</button>{playing&&<button onClick={()=>audio.current?.pause()}>Arrêter</button>}</div>
 <audio ref={audio} preload="none" onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError('L’enregistrement est indisponible. Vous pouvez réessayer.');}}/>{error&&<p role="alert">{error}</p>}
 {!heard&&!revealed&&<p>Écoutez une première fois pour répondre.</p>}
 <div className="arabic-options">{task.options.map((o,i)=><button key={o} disabled={!heard||draft.choice!==null} aria-pressed={draft.choice===i} onClick={()=>setDraft(d=>({...d,choice:i}))}>{o}</button>)}</div>
 {!revealed&&<button className="arabic-next-reason" onClick={()=>setDraft(d=>({...d,revealed:true}))}>Voir l’écriture pour m’aider</button>}
 {revealed&&<div className="grammar-insight"><p className="arabic-example" lang="ar" dir="rtl">{text}</p>{draft.choice!==null&&<strong>{draft.choice===task.answer?'Bien reconnu.':'Écoutez à nouveau le repère.'}</strong>}<p>{task.explanation}</p><small>{draft.revealed?'Exercice effectué avec l’aide du texte.':'Retrouvé à l’écoute.'}</small>{pair&&<div className="arabic-actions"><button onClick={()=>play(1)}>Réécouter ce mot</button><button onClick={()=>play(1,pair)}>Comparer avec <span lang="ar" dir="rtl">{(corpus as Record<string,string[]>)[pair.verse][pair.position-1]}</span></button></div>}<div className="arabic-actions"><Link to={`/fahm?surah=${task.verse.split(':')[0]}&ayah=${task.verse.split(':')[1]}`}>Écouter dans le verset</Link><a href={`https://corpus.quran.com/wordmorphology.jsp?location=(${task.verse}:${task.position})`} target="_blank" rel="noreferrer">Analyse du mot ↗</a></div><button className="arabic-next-reason" onClick={()=>{setDraft({choice:null,revealed:false});setHeard(false);audio.current?.pause();}}>Réécouter sans le texte</button></div>}
 </section>;
}
