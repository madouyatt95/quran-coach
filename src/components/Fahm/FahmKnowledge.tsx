import {useHomeClock} from '../Home/useHomeClock';
import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useFahmLearningStore} from '../../stores/fahmLearningStore';
import {KNOWLEDGE_LABELS,knowledgeStatus,type KnowledgeStatus} from '../../lib/fahm/recall';
import {verseKey} from '../../lib/fahm/learning';
export function FahmKnowledge(){
 const now=useHomeClock().getTime();
 const learning=useFahmLearningStore(),navigate=useNavigate(),[filter,setFilter]=useState<KnowledgeStatus>('consolidate');
 const keys=[...new Set([...Object.values(learning.studied).flat(),...Object.keys(learning.records),...Object.values(learning.checks).map(c=>verseKey(c.target))])];
 const items=keys.map(key=>({key,checks:Object.entries(learning.checks).filter(([,c])=>verseKey(c.target)===key)})).map(item=>({...item,status:knowledgeStatus(item.checks.map(([,c])=>c))}));
 const due=Object.entries(learning.checks).filter(([,c])=>c.due<=now);
 const arabicDue=due.filter(([id])=>id.startsWith('arabic:')).length;
 const dueRecall=due.filter(([id])=>id.startsWith('word:')||id.startsWith('meaning:')||id.startsWith('transfer:')).length;
 const nextDue=Object.values(learning.checks).filter(c=>c.due>now).sort((a,b)=>a.due-b.due)[0];
 return <section className="fahm-card fahm-knowledge"><span className="fahm-eyebrow">CE QUE JE RETIENS</span><h2>De la découverte au rappel</h2><div className="fahm-knowledge-tabs">{(['discovered','retained','consolidate'] as const).map(status=><button key={status} aria-pressed={filter===status} onClick={()=>setFilter(status)}><strong>{items.filter(i=>i.status===status).length}</strong>{KNOWLEDGE_LABELS[status]}</button>)}</div><p>{filter==='retained'?'Au moins une réponse retrouvée sans aide, au moins 24 heures après la tentative précédente. Cela ne valide pas à lui seul toute la compréhension du verset.':filter==='consolidate'?'Une erreur ou une aide appelle une nouvelle tentative différée.':'Ces passages ont été abordés. Leur compréhension reste à vérifier lors d’une autre séance.'}</p>{dueRecall>0?<Link className="fahm-primary" to="/fahm/review">{dueRecall} rappel{dueRecall>1?'s':''} prêt{dueRecall>1?'s':''} →</Link>:nextDue&&<small>Prochain rappel à partir du {new Date(nextDue.due).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}.</small>}
 {arabicDue>0&&<p><Link to="/academy/arabic?review=1">{arabicDue} rappel{arabicDue>1?'s':''} de grammaire →</Link></p>}
 {items.filter(i=>i.status===filter).length===0?<small>Aucun passage dans cette catégorie pour le moment.</small>:<ul>{items.filter(i=>i.status===filter).map(item=>{const listeningDue=item.checks.some(([id,c])=>id.startsWith('listen:')&&c.due<=now);return <li key={item.key}><Link to={`/fahm?surah=${item.key.split(':')[0]}&ayah=${item.key.split(':')[1]}`}>Coran {item.key} →</Link>{listeningDue&&<button onClick={()=>{const [surah,ayah]=item.key.split(':').map(Number);learning.listenDraft(`listen:${item.key}`,{help:0,choice:null,heard:false,wrong:false,completed:false,seenText:false});learning.begin([{surah,ayah}],5,'Retrouver le sens à l’écoute');navigate('/fahm/session?mode=listen');}}>Rappel à l’écoute</button>}</li>;})}</ul>}
 {filter==='retained'&&items.some(i=>i.status==='retained')&&<p>Essayez de comprendre ces passages avant d’ouvrir leur traduction : vous avez déjà retrouvé une réponse à distance.</p>}</section>;
}
