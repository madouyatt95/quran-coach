import type {ReactNode} from 'react';
import {Pupitre,PupitreTop,PupitreBottom,PupitreOnly} from '../components/Pupitre/Pupitre';
import {usePracticeState} from '../stores/arabicPracticeStore';
import {SENTENCES,placeWord,sentenceCorrect,type SentenceTask} from './sentenceData';
export function SentenceBuilder({lessonId,pupitreEnabled=true}:{lessonId:string;pupitreEnabled?:boolean}) {
 const tasks=SENTENCES.filter(t=>t.lesson===lessonId);
 const [index,setIndex]=usePracticeState(`builder:${lessonId}:index`,0);
 if(!tasks.length)return null;
 return <section className="arabic-workshop arabic-builder"><span className="fahm-eyebrow">CONSTRUIRE ET COMPRENDRE · HORS VERSET</span><h3>Donner sa place à chaque mot</h3><div className="arabic-options">{tasks.map((t,i)=><button aria-pressed={index===i} key={t.id} onClick={()=>setIndex(i)}>Exemple {i+1}</button>)}</div><SentenceAssembly key={tasks[index].id} task={tasks[index]} enabled={pupitreEnabled} examples={<nav className="pupitre-study-actions" aria-label="Exemples de construction">{tasks.map((t,i)=><button aria-pressed={index===i} key={t.id} onClick={()=>setIndex(i)}>Exemple {i+1}</button>)}</nav>}/></section>;
}
function SentenceAssembly({task,enabled,examples}:{task:SentenceTask;enabled:boolean;examples:ReactNode}) {
 const [placed,setPlaced]=usePracticeState<(string|null)[]>(`assembly:${task.id}:placed`,task.slots.map(()=>null));
 const [active,setActive]=usePracticeState(`assembly:${task.id}:active`,0),[checked,setChecked]=usePracticeState(`assembly:${task.id}:checked`,false),[showHelp,setShowHelp]=usePracticeState(`assembly:${task.id}:help`,false);
 const correct=sentenceCorrect(task,placed);
 return <Pupitre activity="arabic" title="Construire en arabe" enabled={enabled}><PupitreTop aria-label="Phrase et fonctions"><p className="arabic-builder-goal">{task.meaning}</p><p>Touchez une fonction, puis le mot à y placer. Touchez une case remplie pour la modifier.</p>
 <div className="arabic-slots" dir="rtl">{task.slots.map((s,i)=><button key={s.word} aria-pressed={active===i} aria-label={`${s.label} : ${task.words.find(w=>w.id===placed[i])?.text||'vide'}`} className={checked?(placed[i]===s.word?'is-correct':'is-wrong'):''} onClick={()=>{setActive(i);setChecked(false);}}><small dir="ltr">{s.label}</small><span lang="ar">{task.words.find(w=>w.id===placed[i])?.text||'＋'}</span></button>)}</div>
 </PupitreTop><PupitreBottom aria-label="Mots à placer et correction"><PupitreOnly>{examples}</PupitreOnly><p className="arabic-muted" aria-live="polite">Case choisie : {task.slots[active].label}</p>
 <div className="grammar-words" dir="rtl" aria-label="Mots à placer">{task.words.map(w=><button key={w.id} aria-label={`Placer ${w.text}`} aria-pressed={placed.includes(w.id)} onClick={()=>{const updated=placeWord(placed,active,w.id);setPlaced(updated);setChecked(false);const next=updated.findIndex((v,i)=>i>active&&!v);if(next>=0)setActive(next);}}>{w.text}</button>)}</div>
 <div className="arabic-actions"><button className="fahm-primary" disabled={placed.some(p=>p===null)} onClick={()=>setChecked(true)}>Vérifier la construction</button><button aria-expanded={showHelp} onClick={()=>setShowHelp(!showHelp)}>Un indice</button><button onClick={()=>{setPlaced(task.slots.map(()=>null));setActive(0);setChecked(false);setShowHelp(false);}}>Recommencer</button></div>
 {showHelp&&<p role="status">{task.slots[active].hint}</p>}
 {checked&&<div role="status" className="arabic-assembly-feedback"><strong>{correct?'La construction est juste.':'Regardons les relations.'}</strong>{correct?<><p className="arabic-example" lang="ar" dir="rtl">{placed.map(id=>task.words.find(w=>w.id===id)?.text).join(' ')}</p><ol className="arabic-relations">{task.links.map(l=><li key={`${l.from}-${l.to}`}><span lang="ar">{task.words.find(w=>w.id===placed[l.from])?.text}</span><span aria-hidden="true"> ↔ </span><span lang="ar">{task.words.find(w=>w.id===placed[l.to])?.text}</span><p>{l.label}</p></li>)}</ol><p>{task.explanation}</p></>:<ul>{task.slots.map((s,i)=>placed[i]!==s.word&&<li key={s.word}>{s.label} : {s.hint}</li>)}</ul>}</div>}
 <a href={`https://corpus.quran.com/documentation/${task.source}.jsp`} target="_blank" rel="noreferrer">La construction expliquée ↗</a>
 </PupitreBottom></Pupitre>;
}
