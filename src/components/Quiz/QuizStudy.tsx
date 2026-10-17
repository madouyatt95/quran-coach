import {useState,useEffect} from 'react';
import {hadithArabic} from '../../academy/data/courseEvidence';
import {QuestionForm} from './QuizQuestionForm';
import {answerFeedback,type PedagogicalAnswer} from '../../lib/quizPedagogy';
import {Link} from 'react-router-dom';
import {useQuizStore} from '../../stores/quizStore';
import {useQuizLearningStore} from '../../stores/quizLearningStore';
import {encodeQuizShare,learningBank,type LearningQuestion} from '../../lib/quizLearning';
export function QuizSources({question:q}:{question:LearningQuestion}){
 const chapter=q.context?.type==='academy'&&/^sabirin-hadith-(\d+)$/.exec(q.context.id);const hadith=chapter?hadithArabic(Number(chapter[1])):null;
 return <div className="qx-sources">{hadith&&<a href={hadith.url} target="_blank" rel="noopener noreferrer">📜 {hadith.source} ↗</a>}{q.verseRef&&<Link to={`/passage?surah=${q.verseRef.surah}&ayah=${q.verseRef.ayah}&from=quiz`}>📖 Coran {q.verseRef.surah}:{q.verseRef.ayah} →</Link>}{q.sourceLink&&<Link to={q.sourceLink.href}>{q.sourceLink.label} →</Link>}</div>;
}
export function QuizStudy(){
 const store=useQuizLearningStore(),s=store.session;
 const [share,setShare]=useState('');
 useEffect(()=>{window.scrollTo({top:0});},[s?.index,s?.feedback,s?.finished,s?.handoff]);
 if(!s)return null;
 const home=()=>useQuizStore.getState().setView('home');
 const shareQuiz=async()=>{const url=new URL('/quiz',location.origin);url.searchParams.set('challenge',encodeQuizShare(s.questions));try{if(navigator.share)await navigator.share({title:'Ton défi Quran Coach',url:url.href});else{await navigator.clipboard.writeText(url.href);setShare('Lien copié : les mêmes questions, dans le même ordre.');}}catch{setShare(url.href);}};
 if(s.finished){const correct=s.answers.filter(a=>a.correct).length;return <main className="quiz-container qx"><button onClick={home}>← Quiz & défis</button><section className="qx-hero"><span>🎉 Séance terminée</span><h1>{correct} / {s.questions.length}</h1><p>{s.mode==='coop'?(correct>=Math.ceil(s.questions.length*.7)?'Objectif commun atteint !':'Une nouvelle occasion de progresser ensemble.'):'Chaque correction est une occasion de retenir.'}</p></section>{s.mode==='family'&&<div className="qx-row">{s.names.map((name,i)=><p key={i}>{name} : {s.answers.filter(a=>a.player===i&&a.correct).length}/{s.answers.filter(a=>a.player===i).length}</p>)}</div>}<button className="qx-primary" onClick={()=>void shareQuiz()}>Partager ce même quiz</button>{share&&<p role="status" className="qx-share">{share}</p>}<h2>La correction ensemble</h2>{s.questions.map((q,i)=><details className="qx-card" key={q.id}><summary>{s.answers[i]?.correct?'✓':'↻'} {q.questionFr}</summary><p>Votre réponse : {s.answers[i]?.response}</p><Correction q={q} answer={s.answers[i]}/></details>)}<button onClick={()=>{store.clear();home();}}>Choisir une nouvelle séance</button></main>;}
 const q=s.questions[s.index];
 if(s.handoff)return <main className="quiz-container qx qx-handoff"><span>📱</span><h1>À toi, {s.names[s.index%s.names.length]||'joueur'} !</h1><p>Passez le téléphone. La correction sera partagée à la fin.</p><button className="qx-primary" onClick={store.ready}>Je suis prêt</button><button onClick={home}>Faire une pause</button></main>;
 return <main className="quiz-container qx"><header className="qx-header"><button onClick={home}>← Pause</button><span>{s.index+1} / {s.questions.length}</span></header><progress max={s.questions.length} value={s.index}/>{q.investigation&&<nav className="qx-investigation-steps" aria-label="Étapes de l’enquête">{["Observer","Trouver l’indice","Justifier"].map(step=><span key={step} aria-current={step===q.investigation?.step?"step":undefined}>{step}</span>)}</nav>}<p className="qx-eyebrow">{s.title}{s.mode==='coop'?` · objectif ${Math.ceil(s.questions.length*.7)} bonnes réponses`:''}</p>{!s.feedback&&s.adaptationNote&&<p className="qx-adaptation" role="status">{s.adaptationNote}</p>}{s.feedback?<section className="qx-card" aria-live="polite"><h1>{s.mode==='learn'?(s.answers.at(-1)?.correct?'Bien trouvé !':'À revoir tranquillement'):'Réponse enregistrée'}</h1>{s.mode==='learn'?<><h2>{q.questionFr}</h2><Correction key={q.id} q={q} answer={s.answers.at(-1)} interactive/></>:<p>Vous retrouverez toutes les explications à la fin.</p>}<button className="qx-primary" onClick={store.next}>{s.index+1===s.questions.length?'Voir le bilan':'Continuer'}</button></section>:<QuestionForm key={q.id} q={q} learning={s.mode==='learn'} support={s.support} onAnswer={store.answer}/>}</main>;
}
export function Correction({q,answer,interactive=false}:{q:LearningQuestion;answer?:PedagogicalAnswer;interactive?:boolean}){
 const {saved,save}=useQuizLearningStore();
 const [checking,setChecking]=useState(false),[checked,setChecked]=useState<PedagogicalAnswer|null>(null);
 const feedback=answer?answerFeedback(q,answer):[];
 const checkpoint=q.checkpointId?learningBank().find(item=>item.id===q.checkpointId):undefined;
 return <>
 {answer&&!answer.correct&&<div className="qx-response"><strong>Ta réponse</strong><p>{answer.response}</p>{feedback.length>0&&<><h3>Ce qui fait la différence</h3>{feedback.map((text,i)=><p key={i}>{text}</p>)}</>}</div>}
 <p className="qx-answer">{q.format==='order'?q.items?.join(' → '):q.format==='match'?'Les associations à retenir':q.choices[q.correctIndex]}</p>
 <p className="qx-explanation">{q.explanation||`À retenir : ${q.choices[q.correctIndex]}.`}</p><QuizSources question={q}/>
 <button aria-pressed={!!saved[q.id]} onClick={()=>save(q)}>{saved[q.id]?'✓ Enregistré dans À retenir':'☆ À retenir'}</button>
 {interactive&&answer&&(!answer.correct||!answer.certain)&&checkpoint&&<section className="qx-consolidation"><h3>Vérifions avec un autre exemple</h3><p className="qx-muted">Un entraînement sans point supplémentaire. La notion sera aussi revue à distance.</p>{!checking?<button onClick={()=>setChecking(true)}>Vérifier ma compréhension</button>:checked?<div role="status"><strong>{checked.correct?'Tu as retrouvé la distinction.':'Reprenons la distinction.'}</strong><p>{answerFeedback(checkpoint,checked).join(' ')||checkpoint.explanation}</p><p>{checkpoint.choices[checkpoint.correctIndex]}</p><QuizSources question={checkpoint}/></div>:<QuestionForm key={checkpoint.id} q={checkpoint} learning={false} onAnswer={(correct,certain,response,detail)=>setChecked({id:checkpoint.id,correct,certain,response,detail})}/>}</section>}
 </>;
}
