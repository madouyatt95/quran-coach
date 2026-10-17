import {useState} from 'react';
import {conceptDepth} from '../data/courseDepth';
import {conceptStatus} from '../conceptLearning';
import {useAcademyKnowledgeStore,conceptKey} from '../../stores/academyKnowledgeStore';
import {useAcademyStore} from '../../stores/academyStore';
import {CourseReferenceText} from './CourseReferences';
import './CoursePractice.css';
export function CoursePractice({id,index}:{id:string;index:number}){
 const depth=conceptDepth(id,index)!;
 const item=useAcademyKnowledgeStore(state=>state.concepts[conceptKey(id,index)]);
 const answer=useAcademyKnowledgeStore(state=>state.answer);
 const clear=useAcademyKnowledgeStore(state=>state.clearAnswer);
 const progress=useAcademyStore(state=>state.progress[id]);
 const [variant,setVariant]=useState<'check'|'retry'>(()=>item?.lastQuestion==='retry'?'retry':item?.attempts&&!item.lastCorrect?'retry':'check');
 const [open,setOpen]=useState(false);
 const question=depth[variant],chosen=item?.lastQuestion===variant?item.answers[variant]:undefined;
 const status=conceptStatus(id,index,item?{[conceptKey(id,index)]:item}:{},progress);
 const wrong=chosen!==undefined&&chosen!==question.answer;
 return <section className="course-practice" aria-label={`Compréhension : ${depth.title}`}><div className="course-practice-heading"><span>CE QUE JE COMPRENDS</span><strong className={status==='À revoir'?'needs-review':''}>{status}</strong></div><button className="course-practice-toggle" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>{status==='À revoir'?'Reprendre cette distinction':'Vérifier cette notion'} <span>{open?'−':'+'}</span></button>{open&&<>{status==='À revoir'&&chosen===undefined&&<p><CourseReferenceText text={depth.alternative}/></p>}<h3>{question.q}</h3><div className="course-practice-choices">{question.options.map((option,n)=><button key={option} disabled={chosen!==undefined} className={chosen!==undefined&&n===question.answer?'correct':chosen===n?'wrong':''} onClick={()=>answer(id,index,variant,n,n===question.answer)}>{option}</button>)}</div>{chosen!==undefined&&<div role="status"><p>{chosen===question.answer?'Tu as retrouvé la distinction. ':'Reprenons avec une autre explication. '}<CourseReferenceText text={question.feedbacks?.[chosen]||question.explanation}/></p>{wrong&&<><p><CourseReferenceText text={depth.alternative}/></p><button onClick={()=>{setVariant(variant==='check'?'retry':'check');clear(id,index,variant==='check'?'retry':'check');}}>Essayer un autre exemple</button></>}</div>}</>}<small>Ce repère concerne cette notion. Il se met à jour avec tes réponses et tes révisions.</small></section>;
}
