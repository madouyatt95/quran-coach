import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {applicationQuestion} from './applicationQuestions';
export function ApplicationCheck({lessonId}:{lessonId:string}){
 const choice=useArabicLearningStore(s=>s.drafts[lessonId]?.applicationAnswer);
 const verify=useArabicLearningStore(s=>s.verifyApplication);
 const q=applicationQuestion(lessonId);
 if(!q)return null;
 return <section className="fahm-card"><h3>À vous, sur un autre exemple</h3><p>{q.prompt}</p><div className="arabic-options">{q.options.map((option,i)=><button key={option} aria-pressed={choice===i} disabled={choice===q.answer} onClick={()=>verify(lessonId,i)}>{option}</button>)}</div>{choice!==undefined&&<p role="status">{choice===q.answer?'Bien compris.':'Reprenons : '}{q.explanation}</p>}</section>;
}
