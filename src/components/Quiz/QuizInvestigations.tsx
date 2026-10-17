import {learningBank} from '../../lib/quizLearning';
import {useQuizLearningStore} from '../../stores/quizLearningStore';
import {useQuizStore} from '../../stores/quizStore';
export function QuizInvestigations(){
 const questions=learningBank().filter(q=>q.investigation);
 const investigations=[...new Map(questions.map(q=>[q.investigation!.id,q.investigation!])).values()];
 return <main className="quiz-container qx"><header className="qx-header"><button onClick={()=>useQuizStore.getState().setView('home')}>← Quiz & défis</button></header><h1>Les enquêtes du savoir</h1><p>Observe une situation, trouve l’indice dans le cours ou le récit, puis justifie ta réponse.</p><p className="qx-muted">Trois étapes, sans chrono. Les situations pédagogiques sont distinguées des extraits du cours.</p>{investigations.map((item,i)=><section className="qx-card qx-inquiry-card" key={item.id}><span aria-hidden="true">{['📚','🤲','🪶'][i]}</span><h2>{item.title}</h2><p>{questions.find(q=>q.investigation?.id===item.id)?.sourceLink?.label}</p><small>Observer → Trouver l’indice → Justifier</small><button className="qx-primary" onClick={()=>{useQuizLearningStore.getState().start(item.title,questions.filter(q=>q.investigation?.id===item.id),'learn',[],{adaptive:false});useQuizStore.getState().setView('study');}}>Ouvrir l’enquête</button></section>)}{useQuizLearningStore.getState().session&&!useQuizLearningStore.getState().session?.finished&&<p className="qx-muted">Ouvrir une enquête remplace la séance en pause. Tes acquis restent enregistrés.</p>}</main>;
}
