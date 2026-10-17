import {useState} from 'react';
import type {GrammarQuestion} from './types';
import {REMEDIES} from './pedagogy';
/** Corrections are authored per distractor. The transfer check never counts as unaided recall. */
export function AdaptiveQuestion({question,choice,onAnswer,remedyChoice,onRemedy}:{question:GrammarQuestion;choice?:number;onAnswer:(value:number)=>void;remedyChoice?:number;onRemedy:(value:number)=>void}) {
 const [retry,setRetry]=useState(false);
 const remedy=REMEDIES[question.id];
 const wrong=choice!==undefined&&choice!==question.answer;
 const corrected=remedy&&remedyChoice===remedy.check.answer;
 const locked=choice===question.answer||(wrong&&!!remedy&&!retry);
 return <fieldset className="arabic-question"><legend>{question.prompt}</legend>
  <div className="arabic-options">{question.options.map((o,i)=><button key={o} aria-pressed={choice===i} disabled={locked} onClick={()=>{setRetry(false);onAnswer(i);}}>{o}</button>)}</div>
  {choice===question.answer&&<p role="status">Oui. {question.explanation}</p>}
  {wrong&&<section className="arabic-remedy" aria-label="Correction adaptée"><div role="status"><strong>Vous avez choisi : {question.options[choice]}</strong><p>{remedy?.feedback[String(choice)]||question.explanation}</p></div>
   {remedy&&<><h4>Essayons avec un autre exemple</h4><p>{remedy.check.prompt}</p><div className="arabic-options">{remedy.check.options.map((o,i)=><button key={o} disabled={corrected} aria-pressed={remedyChoice===i} onClick={()=>onRemedy(i)}>{o}</button>)}</div>
   {remedyChoice!==undefined&&<p role="status">{corrected?'Bien repéré.':'Reprenons le repère :'} {remedy.check.explanation}</p>}
   {corrected&&!retry&&<button className="fahm-primary" onClick={()=>setRetry(true)}>Revenir à la question initiale ↑</button>}
   {retry&&<p role="status">Vous pouvez maintenant répondre à nouveau à la question au-dessus.</p>}</>}
  </section>}
 </fieldset>;
}
