import {useState} from 'react';
import {useQuizStore} from '../../stores/quizStore';
import {encodeClassicShare,legacyLearningQuestion} from '../../lib/quizLearning';
import {Correction} from './QuizStudy';
import {DIFFICULTY_CONFIG} from '../../data/quizTypes';

export function QuizResultReview(){
 const {questions,answers,difficulty,score,mode}=useQuizStore();
 const [share,setShare]=useState('');
 const answered=answers.flatMap(answer=>{const question=questions.find(q=>q.id===answer.questionId);return question?[{question,answer}]:[];});
 const correct=answered.filter(item=>item.answer.correct).length;
 const base=correct*Math.round(100*DIFFICULTY_CONFIG[difficulty].scoreMultiplier);
 const code=encodeClassicShare(answered.map(item=>item.question));
 const shareChallenge=async()=>{
  if(!code)return;
  const url=new URL('/quiz',location.origin);url.searchParams.set('challenge',code);
  const text=`Mon résultat : ${correct}/${answered.length}. Essaie les mêmes questions, avec les mêmes choix. Un point par bonne réponse, sans chrono.`;
  try{if(navigator.share)await navigator.share({title:'Un défi Quran Coach pour toi',text,url:url.href});else{await navigator.clipboard.writeText(`${text}\n${url.href}`);setShare('Lien du défi copié.');}}
  catch(error){if(error instanceof Error&&error.name==='AbortError')return;setShare(url.href);}
 };
 return <section className="qx qx-result-review">
 <h2>Ce que tu as compris</h2><p><strong>{correct} / {answered.length} bonnes réponses</strong></p>
 {mode!=='duel'&&<p className="qx-muted">{base} points de réponses · {Math.max(0,score-base)} points de vitesse. La compréhension se compare avec le nombre de bonnes réponses.</p>}
 {code&&<><button className="qx-primary" onClick={()=>void shareChallenge()}>Défier un ami sur ces questions</button><p className="qx-muted">Mêmes questions, mêmes choix et même ordre. Le défi partagé se joue sans chronomètre et sans aide ; un point par bonne réponse.</p></>}
 {share&&<p role="status" className="qx-share">{share}</p>}
 <h2>{mode==='duel'?'Correction de la dernière manche':'Comprendre mes réponses'}</h2>
 {answered.map(({question,answer},i)=><details className="qx-card" key={`${question.id}-${i}`}>
 <summary>{answer.correct?'✓':'↻'} {question.questionFr}</summary>
 <Correction q={legacyLearningQuestion(question)} answer={{id:question.id,correct:answer.correct,certain:true,response:question.choices[answer.chosenIndex]||'Aucune réponse',detail:{choice:answer.chosenIndex}}}/>
 </details>)}
 </section>;
}
