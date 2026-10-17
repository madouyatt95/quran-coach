import {usePracticeState} from '../stores/arabicPracticeStore';
import {LessonScene} from './LessonScene';
import {GUIDES} from './pedagogy';
export function GuidedExplanation({lessonId}:{lessonId:string}) {
 const guide=GUIDES[lessonId];
 const [step,setStep]=usePracticeState(`guide:${lessonId}`,0);
 if(!guide)return null;
 return <section className="arabic-guided" aria-label="Raisonnement pas à pas">
  <span className="fahm-eyebrow">PARTONS D’UNE QUESTION</span><h2>{guide.opening}</h2>
  <LessonScene key={lessonId} lessonId={lessonId}/><ol className="arabic-reasoning">{guide.steps.map((s,i)=><li key={s.title}><button aria-expanded={step===i} onClick={()=>setStep(i)}><span>{i+1}</span>{s.title}</button>{step===i&&<p>{s.body}</p>}</li>)}</ol>
  {step<guide.steps.length-1&&<button className="arabic-next-reason" onClick={()=>setStep(n=>n+1)}>Poursuivre le raisonnement →</button>}
  <details><summary>Pourquoi ? · {guide.why}</summary><p>{guide.reason}</p></details>
  <details><summary>Un autre exemple</summary><p className="arabic-example" lang="ar" dir="rtl">{guide.another.arabic}</p><p>{guide.another.explanation}</p></details>
  <aside className="arabic-trap"><strong>L’erreur à éviter</strong><p>{guide.trap}</p></aside>
 </section>;
}
