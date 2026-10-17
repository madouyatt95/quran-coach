import {useRef,useState} from 'react';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {useArabicPracticeStore} from '../stores/arabicPracticeStore';
import {reviewVariant} from './reviewVariants';
import {AdaptiveQuestion} from './AdaptiveQuestion';
import {Link} from 'react-router-dom';
import {grammarCheckId} from './data';
import {ARABIC_QUESTIONS,arabicReviewItems} from './reviewData';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
export function ArabicReview(){
 const learning=useFahmLearningStore();
 const [queue]=useState(()=>arabicReviewItems(learning.checks,Date.now())),[index,setIndex]=useState(0);
 const q=queue[index];
 return <main className="fahm-shell arabic-page"><Link to="/academy/arabic">← Mon parcours d’arabe</Link><h1>Retrouver sans aide</h1><p>Une notion déjà travaillée, dans une nouvelle séance. Essayez avant de rouvrir le cours.</p>{q?<RecallItem key={q.id} q={q} count={`${index+1} / ${queue.length}`} next={()=>setIndex(n=>n+1)}/>:<section className="fahm-card"><h2>{queue.length?'Révisions terminées':'Aucune révision arrivée à échéance'}</h2><Link to="/academy/arabic">Revenir au programme →</Link></section>}</main>;
}
function RecallItem({q,count,next}:{q:typeof ARABIC_QUESTIONS[number];count:string;next:()=>void}){
 const learning=useFahmLearningStore(),[choice,setChoice]=useState<number|undefined>(),[remedy,setRemedy]=useState<number|undefined>();
 const answered=useRef(false);
 const [seen]=useState(()=>useArabicPracticeStore.getState().evidence[q.id]?.seen||[]);
 const [question]=useState(()=>reviewVariant(q,seen));
 const fresh=question.id!==q.id&&!seen.includes(question.id);
 return <section className="fahm-card"><span>{count} · {fresh?"Un autre exemple, non encore essayé":"Un exemple déjà rencontré"}</span><AdaptiveQuestion question={question} choice={choice} remedyChoice={remedy} onRemedy={setRemedy} onAnswer={value=>{setChoice(value);setRemedy(undefined);if(!answered.current){answered.current=true;learning.check(grammarCheckId(q.id),q.target,value===question.answer);useArabicPracticeStore.getState().attempt(q.id,question.id,value===question.answer,false,true);}}}/>{choice!==undefined&&<><p>Seule votre première réponse compte pour cette révision. Les essais suivants vous aident à comprendre.</p><button className="fahm-primary" onClick={next}>Question suivante →</button></>}<Link to={`/academy/arabic/${q.lesson}?view=read`} onClick={()=>{useArabicLearningStore.getState().move(q.lesson,0);if(!answered.current){answered.current=true;learning.check(grammarCheckId(q.id),q.target,false,true);useArabicPracticeStore.getState().attempt(q.id,question.id,false,true,true);}}}>J’ai besoin de revoir la leçon</Link></section>;
}
