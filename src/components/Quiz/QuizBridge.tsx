import {Link,useLocation} from 'react-router-dom';
import './QuizBridge.css';
/** Only a link: loading a course does not load the quiz bank or replace an ongoing session. */
export function QuizBridge({source,id,onLeave,returnTo}:{source:'academy'|'story'|'fahm';id:string;returnTo?:string;onLeave?:()=>void}){
 const location=useLocation();
 const params=new URLSearchParams({source,scope:id,return:returnTo||location.pathname+location.search});
 return <aside className="quiz-bridge"><div><strong>Qu’ai-je retenu ?</strong><p>Quelques exercices sur {source==='academy'?'ce chapitre':source==='story'?'ce récit':'les versets étudiés'}, avec leurs explications.</p></div><Link to={`/quiz?${params}`} onClick={onLeave}>Vérifier ce que j’ai retenu →</Link></aside>;
}
