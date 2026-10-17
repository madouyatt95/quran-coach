import {Link} from 'react-router-dom';
import type {MushafWord} from '../lib/interactiveMushaf/model';
import {wordCourses} from './learningConnections';
import {lessonById} from './data';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import './LearningBridges.css';
export default function WordCourseLink({word,onClose}:{word:MushafWord;onClose:()=>void}){
 const drafts=useArabicLearningStore(s=>s.drafts);
 const courses=wordCourses(word);
 if(!courses.length)return null;
 return <details className="iq-word-grammar"><summary>Comprendre sa construction · {courses.some(c=>drafts[c.lesson]?.complete)?'Notion étudiée':'Cours d’arabe'}</summary>{courses.map(c=><div key={c.lesson}><p>{c.explanation}</p><Link to={`/academy/arabic/${c.lesson}?view=read`} onClick={onClose}>{drafts[c.lesson]?.complete?'Revoir':'Comprendre'} : {lessonById(c.lesson)?.title} →</Link></div>)}</details>;
}
