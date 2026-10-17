import {useState} from 'react';
import {useAcademyStore} from '../../stores/academyStore';
import type {AcademyModule,QuizQuestion} from '../data/types';
import {moduleQuestions} from '../learning';
import {courseChallenge} from '../data/courseChallenges';
import {masteryDue,transferQuestion} from '../mastery';
type ReviewCard={kind:'question'|'mastery'|'practice';module:string;key:string;label:string;question:QuizQuestion};
export function AcademyReview({modules,onBack}:{modules:AcademyModule[];onBack:()=>void}){
 const store=useAcademyStore();
 const [queue]=useState<ReviewCard[]>(()=>{
  const now=Date.now();
  const mastery=modules.filter(m=>m.sourceDocument&&masteryDue(store.progress[m.id],store.mastery[m.id],now)).flatMap(m=>{const challenge=courseChallenge(m.id);return challenge?[{kind:'mastery' as const,module:m.id,key:`${m.id}:mastery`,label:`Consolider · ${m.title}`,question:transferQuestion(challenge)}]:[];});
  const questions=modules.flatMap(m=>moduleQuestions(m).filter(q=>store.reviews[q.key]?.due<=now).map(q=>({kind:'question' as const,module:m.id,key:q.key,label:m.title,question:q}))).sort((a,b)=>(store.reviews[b.key]?.mistakes||0)-(store.reviews[a.key]?.mistakes||0));
  const practice=modules.flatMap(m=>{const key=`${m.id}:practice`,challenge=courseChallenge(m.id);return challenge&&!masteryDue(store.progress[m.id],store.mastery[m.id],now)&&store.reviews[key]?.due<=now?[{kind:'practice' as const,module:m.id,key,label:`À retravailler · ${m.title}`,question:transferQuestion(challenge)}]:[];});
  return [...mastery,...questions,...practice].slice(0,5);
 });
 const [index,setIndex]=useState(0),[answer,setAnswer]=useState<number|null>(null);const card=queue[index],q=card?.question;
 return <section className="academy-hub academy-workspace"><button onClick={onBack}>← Académie</button><h2>Mes points à consolider</h2>{q?<><small>{card.label} · {index+1}/{queue.length}</small><h3>{q.q}</h3><div className="academy-quiz__options">{q.options.map((option,n)=><button key={n} disabled={answer!==null} className={`academy-quiz__option ${answer!==null&&n===q.answer?'correct':answer===n?'wrong':''}`} onClick={()=>{setAnswer(n);if(card.kind==='mastery')store.answerMastery(card.module,n===q.answer);else store.reviewAnswer(card.key,n===q.answer);}}>{option}</button>)}</div>{answer!==null&&<><p role="status">{answer===q.answer?(card.kind==='mastery'?'✓ Notion consolidée.':'✓ Bien retrouvé.'):'Ce point reviendra lors d’une prochaine révision.'} {q.feedbacks?.[answer]||q.explanation}</p><button onClick={()=>{setIndex(n=>n+1);setAnswer(null);}}>Continuer →</button></>}</>:<><p>{queue.length?'La séance est terminée. Les points encore fragiles reviendront plus tard.':'Aucune révision prévue aujourd’hui. Les notions étudiées reviendront ici après un délai.'}</p><button onClick={onBack}>Revenir à mon parcours</button></>}</section>;
}
