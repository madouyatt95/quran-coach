import {useState,useEffect} from 'react';
import type {LearningQuestion} from '../../lib/quizLearning';
import {assignPair,shuffledIndices,type AnswerDetail} from '../../lib/quizPedagogy';
import {AudioPlayer} from './AudioPlayer';
import {fetchAyahAudioUrl} from '../../lib/quranApi';

export function QuestionForm({q,learning,onAnswer,support=false}:{q:LearningQuestion;learning:boolean;support?:boolean;onAnswer:(correct:boolean,certain:boolean,response:string,detail?:AnswerDetail)=>void}){
 const [heard,setHeard]=useState(false),[assisted,setAssisted]=useState(false);
 const [selected,setSelected]=useState<number|null>(null),[order,setOrder]=useState<number[]>([]),[pairs,setPairs]=useState<Record<number,number>>({}),[active,setActive]=useState<number|null>(null),[certain,setCertain]=useState(true);
 const [display]=useState(()=>shuffledIndices(q.items?.length??q.pairs?.length??q.choices.length));
 const [leftDisplay]=useState(()=>shuffledIndices(q.pairs?.length??0));
 const complete=q.format==='order'?order.length===q.items?.length:q.format==='match'?Object.keys(pairs).length===q.pairs?.length:selected!==null;
 const ready=complete&&(q.format!=='audio'||heard||assisted);
 const submit=()=>{
  if(!ready)return;
  const correct=q.format==='order'?order.every((v,i)=>v===i):q.format==='match'?q.pairs!.every((_,i)=>pairs[i]===i):selected===q.correctIndex;
  const response=q.format==='order'?order.map(i=>q.items![i]).join(' → '):q.format==='match'?q.pairs!.map(([a],i)=>`${a} : ${q.pairs![pairs[i]][1]}`).join('\n'):q.choices[selected!];
  onAnswer(correct,certain&&!assisted,response,{choice:selected??undefined,pairs:q.pairs?.map((_,i)=>pairs[i]),order:q.items?order:undefined,assisted});
 };
 return <section className="qx-card">
  <h1>{q.questionFr}</h1>{q.format==='spot'&&<p className="qx-spot-instruction">Cherche la proposition qui contient la confusion, puis valide pour comprendre la distinction.</p>}
  {q.format==='audio'&&q.verseRef&&<>{q.audioUrl?<AudioPlayer url={q.audioUrl} onListened={()=>setHeard(true)}/>:<StudyAudio target={q.verseRef} onListened={()=>setHeard(true)}/>}{learning&&q.questionAr&&<button onClick={()=>setAssisted(true)}>M’aider du texte</button>}</>}
  {q.questionAr&&(q.format!=='audio'||assisted)&&<p className="qx-ar" lang="ar" dir="rtl">{q.questionAr}</p>}
  {q.passage&&<blockquote>{q.passage}</blockquote>}
  {learning&&!q.investigation&&q.format!=='audio'&&(q.hint||q.explanation)&&<div className="qx-hint"><button aria-expanded={assisted} onClick={()=>setAssisted(true)}>{support?'Un rappel pour t’aider':'Besoin d’un indice ?'}</button>{assisted&&<p role="status">{q.hint||q.explanation}</p>}</div>}
  {q.format==='order'?<><p>Reconstruis l’ordre en touchant les étapes. Touche une étape choisie pour la retirer.</p><ol className="qx-sequence">{order.map((i,n)=><li key={i}><button onClick={()=>setOrder(order.filter((_,j)=>j!==n))}>{q.items![i]} <span aria-hidden="true">×</span></button></li>)}</ol><div className="qx-choices">{display.filter(i=>!order.includes(i)).map(i=><button key={i} onClick={()=>setOrder([...order,i])}>{q.items![i]}</button>)}</div></>
  :q.format==='match'?<>
   <p id="pair-help">Touche une notion, puis son explication. Tu peux modifier une association avant de valider.</p>
   <div className="qx-pair-board" aria-describedby="pair-help"><div aria-label="Notions">{leftDisplay.map(i=><button key={i} aria-pressed={active===i} className={pairs[i]!==undefined?'qx-paired':''} onClick={()=>setActive(i)}><small>{q.activity==='vocabulary'?'Mot':'Notion'} {i+1}{pairs[i]!==undefined?' · associée':''}</small><span className={q.activity==='vocabulary'?'qx-word':undefined} lang={q.activity==='vocabulary'?'ar':undefined} dir={q.activity==='vocabulary'?'rtl':undefined}>{q.pairs![i][0]}</span></button>)}</div><div aria-label="Explications">{display.map(i=>{const owner=Object.keys(pairs).find(key=>pairs[Number(key)]===i);return <button key={i} disabled={active===null} className={owner!==undefined?'qx-paired':''} onClick={()=>{if(active!==null){setPairs(assignPair(pairs,active,i));setActive(null);}}}><small>{owner!==undefined?`Associée à la notion ${Number(owner)+1}`:'Explication'}</small>{q.pairs![i][1]}</button>;})}</div></div>
   <p className="qx-muted" role="status">{active!==null?`Choisis l’explication de « ${q.pairs![active][0]} ».`:`${Object.keys(pairs).length} / ${q.pairs!.length} associations`}</p>
   {Object.keys(pairs).length>0&&<div className="qx-pair-summary">{leftDisplay.filter(i=>pairs[i]!==undefined).map(i=><div key={i}><strong>{q.pairs![i][0]}</strong><p>{q.pairs![pairs[i]][1]}</p><button aria-label={`Retirer l’association ${q.pairs![i][0]}`} onClick={()=>setPairs(Object.fromEntries(Object.entries(pairs).filter(([key])=>Number(key)!==i)))}>Délier</button></div>)}</div>}
  </>:<div className="qx-choices" role="group" aria-label="Réponses">{display.map((i,n)=><button key={i} aria-pressed={selected===i} onClick={()=>setSelected(i)}><b>{String.fromCharCode(65+n)}</b>{q.choices[i]}</button>)}</div>}
  {learning&&<fieldset className="qx-confidence"><legend>Avant de vérifier…</legend><label><input type="radio" name="confidence" checked={certain} onChange={()=>setCertain(true)}/> Je savais</label><label><input type="radio" name="confidence" checked={!certain} onChange={()=>setCertain(false)}/> J’ai hésité</label></fieldset>}
  <button className="qx-primary" disabled={!ready} onClick={submit}>Valider ma réponse</button>
 </section>;
}
export function StudyAudio({target,onListened}:{target:{surah:number;ayah:number};onListened?:()=>void}){
 const [url,setUrl]=useState<string|null>(null),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;void fetchAyahAudioUrl(target.surah,target.ayah).then(value=>{if(active){setUrl(value);setFailed(!value);}}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[target.surah,target.ayah,attempt]);
 return url?<AudioPlayer url={url} onListened={onListened}/>:failed?<div role="status"><p>L’extrait n’est pas accessible pour le moment.</p><button onClick={()=>{setFailed(false);setAttempt(attempt+1);}}>Réessayer</button></div>:<p role="status">Préparation de l’extrait…</p>;
}
