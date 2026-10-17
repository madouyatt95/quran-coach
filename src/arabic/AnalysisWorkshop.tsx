import {Link} from 'react-router-dom';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {ANALYSES,ENDINGS,emptyAnalysis,analysisCorrect,analysisOptions,type AnalysisTask} from './analysisData';
import {usePracticeState} from '../stores/arabicPracticeStore';
export function AnalysisWorkshop({task,endings=false,onSuccess}:{task:AnalysisTask;endings?:boolean;onSuccess?:()=>void}){
 const [answer,setAnswer]=usePracticeState(`analysis:${endings?'endings':'proof'}:${task.id}`,emptyAnalysis());
 const correct=analysisCorrect(task,answer,endings);
 const change=(field:string,value:string|number)=>setAnswer(a=>({...a,[field]:value,checked:false}));
 return <section className="arabic-workshop"><span className="fahm-eyebrow">PHRASE D’ENTRAÎNEMENT · HORS VERSET</span><h2>{endings?'Pourquoi cette terminaison ?':'À vous d’expliquer'}</h2><p>{task.translation}</p><p>Choisissez <b lang="ar" dir="rtl">{task.words[task.target]}</b>, puis construisez votre analyse.</p><div className="grammar-words" dir="rtl">{task.words.map((word,i)=><button key={i} lang="ar" aria-pressed={answer.word===i} onClick={()=>change('word',i)}>{word}</button>)}</div>
 <label>1. Sa nature<select value={answer.nature} onChange={e=>change('nature',e.target.value)}><option value="">Choisir</option>{['Nom','Verbe','Particule','Plusieurs segments'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>2. Sa fonction ou sa construction<select value={answer.role} onChange={e=>change('role',e.target.value)}><option value="">Choisir</option>{analysisOptions(task,'role').map(x=><option key={x}>{x}</option>)}</select></label>
 <label>3. L’indice qui le justifie<select value={answer.evidence} onChange={e=>change('evidence',e.target.value)}><option value="">Choisir</option>{analysisOptions(task,'evidence').map(x=><option key={x}>{x}</option>)}</select></label>
 {endings&&<label>4. La terminaison et son statut<select value={answer.ending} onChange={e=>change('ending',e.target.value)}><option value="">Choisir</option>{ENDINGS.map(x=><option key={x}>{x}</option>)}</select></label>}
 <div className="arabic-actions"><button className="fahm-primary" disabled={answer.word<0||!answer.nature||!answer.role||!answer.evidence||(endings&&!answer.ending)} onClick={()=>{setAnswer(a=>({...a,checked:true}));if(correct)onSuccess?.();}}>Vérifier mon raisonnement</button><button onClick={()=>setAnswer(a=>({...a,help:true}))}>Voir une explication</button></div>
 {answer.checked&&<div role="status"><strong>{correct?'Votre raisonnement est cohérent.':'Reprenons les étapes à ajuster.'}</strong>{!correct&&<ul>{answer.word!==task.target&&<li>Repérez le mot demandé.</li>}{answer.nature!==task.nature&&<li>Nature : {task.nature}.</li>}{answer.role!==task.role&&<li>Fonction : {task.role}.</li>}{answer.evidence!==task.evidence&&<li>Indice : {task.evidence}</li>}{endings&&answer.ending!==task.ending&&<li>Terminaison : {task.ending}.</li>}</ul>}<p>{task.explanation}</p></div>}
 {answer.help&&<p>{task.explanation} Vous pouvez maintenant reconstruire l’analyse avec cette aide.</p>}
 <div className="arabic-actions"><Link to={`/academy/arabic/${task.lesson}?view=read`} onClick={()=>useArabicLearningStore.getState().move(task.lesson,0)}>Revoir le cours</Link><a href={task.source} target="_blank" rel="noreferrer">Référence grammaticale ↗</a></div></section>;
}
export function AnalysisPractice({endings=false}:{endings?:boolean}){
 const [id,setId]=usePracticeState(endings?'analysis:ending-selection':'analysis:proof-selection',ANALYSES[0].id);
 const task=ANALYSES.find(t=>t.id===id)||ANALYSES[0];
 return <><h1>{endings?'Comprendre les terminaisons':'Construire mon analyse'}</h1><p>Nature → fonction → preuve. Les exemples restent accessibles et votre travail est conservé.</p><label className="arabic-tool-select">Choisir une construction<select value={task.id} onChange={e=>setId(e.target.value)}>{ANALYSES.map((t,i)=><option value={t.id} key={t.id}>{i+1}. {t.translation}</option>)}</select></label><AnalysisWorkshop key={task.id} task={task} endings={endings}/></>;
}
