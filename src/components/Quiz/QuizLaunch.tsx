import {useMemo} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {resolveQuizLaunch} from '../../lib/quizLaunch';
import {useQuizLearningStore} from '../../stores/quizLearningStore';
import {useQuizStore} from '../../stores/quizStore';
export function QuizLaunch(){
 const [params,setParams]=useSearchParams();
 const launch=useMemo(()=>resolveQuizLaunch(params),[params]);
 const store=useQuizLearningStore();
 // Prefer least recently seen questions; every exercise remains within the selected source.
 const questions=[...launch.questions].sort((a,b)=>(store.recalls[a.id]?.last||0)-(store.recalls[b.id]?.last||0)).slice(0,6);
 const exit=()=>{useQuizStore.getState().setView('home');setParams({}, {replace:true});};
 return <main className="quiz-container qx"><header className="qx-header"><button onClick={exit}>← Quiz & défis</button>{launch.returnTo&&<Link to={launch.returnTo}>Retour à ma lecture</Link>}</header><section className="qx-hero"><span>COMPRENDRE ET RETENIR</span><h1>{launch.title}</h1><p>{questions.length?`${questions.length} exercices, sans chronomètre. Prends le temps de répondre, puis découvre pourquoi.`:'Il n’y a pas encore de questions préparées pour ce passage.'}</p></section>{questions.length>0&&<section className="qx-card"><p>Les questions restent liées à ta sélection. Tu peux faire une pause et reprendre ta séance.</p>{store.session&&!store.session.finished&&<><p>Tu as une séance en pause. Commencer celle-ci la remplacera ; tes acquis restent conservés.</p><button onClick={()=>{useQuizStore.getState().setView('study');setParams({}, {replace:true});}}>Reprendre la séance en pause</button></>}<button className="qx-primary" onClick={()=>{store.start(launch.title,questions,'learn',[],{adaptive:false,returnTo:launch.returnTo});useQuizStore.getState().setView('study');setParams({}, {replace:true});}}>Commencer les exercices</button></section>}{!questions.length&&<button onClick={exit}>Choisir un autre exercice</button>}</main>;
}
