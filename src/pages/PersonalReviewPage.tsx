import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {useAcademyStore} from '../stores/academyStore';
import {useAudioLibraryStore} from '../stores/audioLibraryStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {usePersonalJourneyStore} from '../stores/personalJourneyStore';
import {revisionCandidates,type PersonalRevision} from '../lib/personalRevision';
import type {NarrativeBook} from '../lib/narrativeBooks';
import '../components/Learning/Learning.css';
function ReviewCard({item,onAnswer}:{item:PersonalRevision;onAnswer:(correct:boolean)=>void}){
 const [revealed,setRevealed]=useState(false),[choice,setChoice]=useState<number|null>(null);
 return <section className="learning-card"><span className="learning-kicker">{item.title}</span><h2>{item.question}</h2>
 {item.options?<div className="learning-actions">{item.options.map((option,i)=><button key={i} className="learning-btn" disabled={choice!==null} aria-pressed={choice===i} onClick={()=>{setChoice(i);setRevealed(true);}}>{option}</button>)}</div>:<><p>Prenez un instant pour retrouver l’idée avant d’ouvrir les repères.</p><button className="learning-btn primary" onClick={()=>setRevealed(true)}>Voir les repères</button></>}
 {revealed&&<><div className="learning-reveal" role="status">{choice!==null&&<strong>{choice===item.correct?'Bien retrouvé.':`À retenir : ${item.options?.[item.correct!]}`}</strong>}<p style={{whiteSpace:'pre-line'}}>{item.answer}</p><small>{item.source}</small></div><div className="learning-actions"><Link className="learning-btn" to={item.href}>Relire avec les sources</Link>{item.options?<button className="learning-btn primary" onClick={()=>onAnswer(choice===item.correct)}>Garder mon résultat et continuer</button>:<><button className="learning-btn" onClick={()=>onAnswer(false)}>À revoir demain</button><button className="learning-btn primary" onClick={()=>onAnswer(true)}>J’avais retrouvé cette idée</button></>}</div>{!item.options&&<small>Autoévaluation personnelle, sans note ni certification.</small>}</>}
 </section>;
}
export function PersonalReviewPage(){
 const academy=useAcademyStore(s=>s.progress),reading=useAudioLibraryStore(s=>s.bookReadingUpdatedAt),fahm=useFahmLearningStore(s=>s.records),store=usePersonalJourneyStore();
 const [books,setBooks]=useState<NarrativeBook[]|null>(null),[error,setError]=useState(''),[count,setCount]=useState(0);
 useEffect(()=>{let live=true;void import('../data/narrativeBooks').then(m=>{if(live)setBooks(m.narrativeBooks);}).catch(()=>setError('Les livres n’ont pas pu être chargés. Réessayez avec une connexion.'));return()=>{live=false;};},[]);
 const cards=useMemo(()=>revisionCandidates(academy,reading,books||[]),[academy,reading,books]);
 const now=Date.now();const due=cards.filter(c=>(store.reviews[c.id]?.due??c.firstDue)<=now).sort((a,b)=>(store.reviews[a.id]?.due??a.firstDue)-(store.reviews[b.id]?.due??b.firstDue));
 const item=count<5?due[0]:undefined,words=Object.values(fahm).filter(r=>r.at&&r.due<=now).length;
 return <div className="learning-page"><Link className="learning-btn" to="/learning">← Ma séance</Link><h1>Ce que je retiens</h1><p>Jusqu’à cinq questions. Les idées difficiles reviennent demain, les autres après un délai plus long.</p><p>{count} réponse{count>1?'s':''} aujourd’hui dans cette séance · {due.length} question{due.length>1?'s':''} à revoir</p>{error&&<p role="alert">{error}</p>}{!books&&!error&&<p role="status">Préparation des repères…</p>}
 {item?<ReviewCard key={item.id} item={item} onAnswer={correct=>{store.review(item.id,correct);setCount(n=>n+1);}}/>:books&&<section className="learning-card"><h2>{count?'Votre pause de révision est terminée':'Vous êtes à jour'}</h2><p>Les questions des cours consultés et les repères des livres lus apparaissent à partir du lendemain.</p>{count>=5&&due.length>0&&<button className="learning-btn" onClick={()=>setCount(0)}>Encore cinq questions</button>}</section>}
 {words>0&&<Link className="learning-btn primary" to="/fahm/review">Fahm · {words} verset{words>1?'s':''} à revoir</Link>}
 </div>;
}
