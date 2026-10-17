import { useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, List, PencilLine } from 'lucide-react';
import type { AcademyModule } from '../data/types';
import { courseChapter } from '../data/courseLibrary';
import { chapterTeaching } from '../data/courseExplanations';
import { courseNarration, narrationBlocks } from '../courseReading';
import { courseChallenge } from '../data/courseChallenges';
import { useAcademyStore } from '../../stores/academyStore';
import {CourseReferencesProvider,CourseReferenceText,CourseReferenceList} from './CourseReferences';
import './AcademyCourse.css';
import './CourseDiscovery.css';
import {CourseOpening,CourseConceptMap,CourseExplore} from './CourseDiscovery';
import {CourseAudio,type CourseAudioHandle} from './CourseAudio';
import {CourseProject} from './CourseProject';
import {CourseReasoning} from './CourseReasoning';
import {CourseCases} from './CourseCases';
import {CoursePractice} from './CoursePractice';
import {CourseConnections,CourseReturnLink} from './CourseConnections';
import {useAcademyKnowledgeStore} from '../../stores/academyKnowledgeStore';

function Paragraphs({text}:{text:string}) {
 return <>{text.split('\n\n').map((paragraph,index)=><p key={index}><CourseReferenceText text={paragraph}/></p>)}</>;
}

export function AcademyCourse({course,application,onBack,onPractice,onRead,onNextChapter,onReview}:{
 course:AcademyModule;application:boolean;onBack:()=>void;onPractice:()=>void;onRead:()=>void;onNextChapter?:()=>void;onReview:()=>void;
}) {
 const location=useLocation();
 const querySection=new URLSearchParams(location.search).get('section');
 const explicit=querySection!==null&&/^[0-2]$/.test(querySection)?Number(querySection):null;
 const source=courseChapter(course.id)!;
 const teaching=chapterTeaching(course.id)!;
 const lesson=course.content[0];
 const sections=lesson.type==='lesson'?lesson.sections:[];
 const savePosition=useAcademyStore(state=>state.savePosition);
 const note=useAcademyStore(state=>state.notes[`${course.id}:reflection:3`]||'');
 const saveNote=useAcademyStore(state=>state.saveNote);
 const initial=useRef(useAcademyStore.getState().progress[course.id]?.lastSectionIdx||0);
 const article=useRef<HTMLElement>(null);
 const top=useRef<HTMLDivElement>(null);
 const [outline,setOutline]=useState(false);
 const audio=useRef<CourseAudioHandle>(null);
 const listen=(index:number)=>audio.current?.play(index);
 const narration=courseNarration(course.id);
 const jump=(index:number)=>{
  savePosition(course.id,0,index);
  document.getElementById(`course-section-${index}`)?.scrollIntoView({block:'start',behavior:'instant'});
 };
 useLayoutEffect(()=>{
  const position=explicit??initial.current;
  const target=!application&&(explicit!==null||position>0)?document.getElementById(`course-section-${position}`):top.current;
  target?.scrollIntoView({block:'start',behavior:'instant'});
 },[application,course.id,explicit,location.key]);
 useEffect(()=>{
  if(application)return;
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
   if(!visible)return;
   const index=Number((visible.target as HTMLElement).dataset.section);
   const saved=useAcademyStore.getState().progress[course.id];
   if(saved?.lastContentIdx!==0||saved.lastSectionIdx!==index)savePosition(course.id,0,index);
  },{rootMargin:'-20% 0px -60% 0px',threshold:0});
  article.current?.querySelectorAll('[data-section]').forEach(element=>observer.observe(element));
  return()=>observer.disconnect();
 },[application,course.id,savePosition]);
 const applicationLesson=course.content[2];
 const prompt=applicationLesson.type==='lesson'?applicationLesson.sections[0]:null;
 return <CourseReferencesProvider moduleId={course.id}><div ref={top} className="academy-hub academy-course-shell">
  <nav className="academy-course-nav" aria-label="Navigation du cours"><button onClick={onBack}><ArrowLeft size={17}/> Tous les chapitres</button><span>{source.doc.subject==='aqidah'?'Aqidah':'Hadith'} · {source.chapter.number}/{source.doc.chapters.length-1}</span></nav>
  <div className="academy-course-backlink"><CourseReturnLink id={course.id}/></div>
  <header className="academy-course-cover"><span className="academy-course-eyebrow">{application?'MISE EN PRATIQUE':'COURS DE '+(source.doc.subject==='aqidah'?'AQIDAH':'HADITH')} · CHAPITRE {String(source.chapter.number).padStart(2,'0')}</span><h1>{course.title}</h1><p><CourseReferenceText text={teaching.introduction}/></p><div className="academy-course-byline"><BookOpen size={16}/><span>Cours de {source.doc.author} · Masjid Sabirin</span></div></header>
  {application?<section className="academy-course-article academy-course-application">
   <button className="academy-course-link" onClick={onRead}><BookOpen size={16}/> Revenir aux explications</button>
   <h2>Mettre le cours en pratique</h2><p>Les explications restent accessibles. Prends le temps de réfléchir, puis compare ton raisonnement avec la correction.</p>
   <CourseExercise moduleId={course.id}/>
   <h2>Faire le lien avec sa vie</h2><p>{prompt?.body}</p><label htmlFor="course-reflection">{prompt?.reflection}</label><textarea id="course-reflection" placeholder="Mon raisonnement, ma question ou mon exemple…" value={note} onChange={event=>saveNote(`${course.id}:reflection:3`,event.target.value)}/><small>Note personnelle enregistrée sur cet appareil. Tu peux la compléter plus tard.</small>
   <button className="academy-course-primary" onClick={onPractice}>Vérifier ma compréhension <ArrowRight size={17}/></button>
  </section>:<>
   <div className="course-discovery-intro"><CourseOpening id={course.id}/><CourseConceptMap id={course.id} onRead={jump}/></div>
   <section className="academy-course-objective"><span>À la fin de ce chapitre</span><p>{course.description}</p></section>
   <nav className="academy-course-outline" aria-label="Sommaire du chapitre"><button onClick={()=>setOutline(value=>!value)} aria-expanded={outline}><List size={18}/> Dans ce chapitre <span>{outline?'−':'+'}</span></button>{outline&&<ol>{sections.map((section,index)=><li key={section.title}><button onClick={()=>jump(index)}>{section.title}</button></li>)}</ol>}</nav>
   <article className="academy-course-article" ref={article}>
    {narration&&<section className="academy-course-narration"><span className="academy-course-eyebrow">LE RÉCIT ÉTUDIÉ · TRADUCTION DU COURS</span><h2>{source.chapter.number===12?'Lire le récit de Umar':'Lire le hadith dans son contexte'}</h2>{narrationBlocks(narration).map((block,index)=>block.type==='speaker'?<h3 className="academy-course-speaker" key={index}>{block.text}</h3>:<p key={index}><CourseReferenceText text={block.text}/></p>)}<small>Texte et attributions reproduits du chapitre {source.chapter.number}, à partir de la page {source.chapter.start} du cours.</small></section>}
    {sections.map((section,index)=><section className="academy-course-section" id={`course-section-${index}`} data-section={index} key={section.title}>
     <span className="academy-course-section-number">{String(index+1).padStart(2,'0')} / COMPRENDRE</span><h2>{section.title}</h2><p className="academy-course-lead"><CourseReferenceText text={section.body}/></p><Paragraphs text={teaching.developments[index]}/><CourseReasoning id={course.id} index={index} onPractice={()=>document.getElementById(`course-practice-${index}`)?.scrollIntoView({block:'center',behavior:'smooth'})}/><div id={`course-practice-${index}`}><CoursePractice id={course.id} index={index}/></div><CourseExplore id={course.id} index={index} onListen={()=>listen(index)}/>
    </section>)}
    <CourseCases id={course.id} onRead={jump} onAnswer={(index,correct)=>useAcademyKnowledgeStore.getState().answer(course.id,index,'case',correct?1:0,correct)}/><CourseConnections id={course.id}/><button className="academy-course-link" onClick={onReview}>Préparer ma séance de révision →</button>
    <CourseProject id={course.id}/>
    <section className="academy-course-takeaway"><h2><Check size={20}/> Ce qu’il faut retenir</h2><p><CourseReferenceText text={teaching.takeaway}/></p></section>
    <CourseReferenceList texts={[teaching.introduction,...teaching.developments,...sections.map(section=>section.body)]}/>
    <section className="academy-course-questions"><h2><PencilLine size={20}/> Une question à éclaircir ?</h2><CourseQuestion moduleId={course.id}/></section>
    <details className="academy-course-source"><summary>Références et développement du cours d’origine</summary><p>Explications adaptées du cours de {source.doc.author}, chapitre {source.chapter.number}, pages {source.chapter.start}–{source.chapter.end}. Les explications pédagogiques ne sont pas des citations.</p><p>Le texte d’origine est conservé ci-dessous avec ses références. Les attributions sont celles du support ; elles ne constituent pas une vérification indépendante des transmissions.</p>{source.pages.map(page=><section key={page.page}><h3>Page {page.page}</h3><p className="academy-course-source-text"><CourseReferenceText text={page.text}/></p></section>)}<a href={`${source.doc.pdf}#page=${source.chapter.start}`} target="_blank" rel="noopener noreferrer">Consulter le document original ↗</a></details>
    <footer className="academy-course-finish"><span>LE COURS EST TERMINÉ</span><h2>Passons de la lecture à la compréhension.</h2><p>Retrouve les notions dans quelques questions, puis travaille une situation concrète. Le cours reste accessible pendant les exercices.</p><button className="academy-course-primary" onClick={onPractice}>Passer aux exercices <ArrowRight size={18}/></button>{onNextChapter&&<button className="academy-course-link" onClick={onNextChapter}>Continuer la lecture au chapitre suivant →</button>}</footer>
   </article>
  </>}
 {!application&&<CourseAudio id={course.id} ref={audio} onRead={jump} onQuestion={()=>{document.getElementById('course-question')?.scrollIntoView({block:'center',behavior:'instant'});document.getElementById('course-question')?.focus({preventScroll:true});}}/>}
 </div></CourseReferencesProvider>;
}
function CourseQuestion({moduleId}:{moduleId:string}) {
 const key=`${moduleId}:course-question`;
 const question=useAcademyStore(state=>state.notes[key]||'');
 const saveNote=useAcademyStore(state=>state.saveNote);
 return <><label htmlFor="course-question">Ma question pour approfondir ce chapitre</label><textarea id="course-question" value={question} placeholder="Ce que je voudrais demander à mon enseignant…" onChange={event=>saveNote(key,event.target.value)}/><small>Enregistrée sur cet appareil ; aucune réponse automatique n’est inventée.</small></>;
}
function CourseExercise({moduleId}:{moduleId:string}) {
 const challenge=courseChallenge(moduleId);
 // Retain the previous exercise key so an existing attempt survives the course redesign.
 const key=`${moduleId}:0:0`;
 const attempt=useAcademyStore(state=>state.practice[key]);
 const savePractice=useAcademyStore(state=>state.savePractice);
 const reviewAnswer=useAcademyStore(state=>state.reviewAnswer);
 if(!challenge)return null;
 const choose=(choice:number)=>{savePractice(key,{choice,done:true});if(challenge.kind!=='order'&&choice!==challenge.correct)reviewAnswer(`${moduleId}:practice`,false);};
 const order=(index:number)=>{const selected=attempt?.order||[];if(index!==selected.length){savePractice(key,{order:selected,choice:index});return;}const next=[...selected,index];savePractice(key,{order:next,done:next.length===3});};
 return <section className="academy-course-exercise"><h3>{challenge.prompt}</h3>{challenge.kind==='order'?<>
  {!!attempt?.order?.length&&<ol>{attempt.order.map(index=><li key={index}>{challenge.steps[index]}</li>)}</ol>}
  {[2,0,1].filter(index=>!attempt?.order?.includes(index)).map(index=><button key={index} onClick={()=>order(index)}>{challenge.steps[index]}</button>)}
  {attempt?.choice!==undefined&&<p role="status">Commence par « {challenge.steps[attempt.order?.length||0]} » : chaque idée prépare la suivante.</p>}
  {attempt?.done&&<p role="status">{challenge.explanation}</p>}
 </>:<>{challenge.options.map((option,index)=><button key={index} disabled={attempt?.done} onClick={()=>choose(index)} className={attempt?.choice===index?'selected':''}>{option}</button>)}{attempt?.choice!==undefined&&<p role="status">{attempt.choice===challenge.correct?'Bien vu. ':'À revoir : '}{challenge.reasons[attempt.choice]}{attempt.choice!==challenge.correct&&` La réponse attendue est « ${challenge.options[challenge.correct]} ». ${challenge.reasons[challenge.correct]}`}</p>}</>}{attempt?.done&&<button onClick={()=>savePractice(key,{})}>Refaire l’exercice</button>}</section>;
}
