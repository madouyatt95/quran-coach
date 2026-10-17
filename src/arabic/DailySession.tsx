import type {ExerciseHistory} from './challengeRotation';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import {usePracticeState,useArabicPracticeStore} from '../stores/arabicPracticeStore';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {buildDailyPlan,completeDailyStep,type DailyPlan} from './dailyPlan';
import {ARABIC_QUESTIONS} from './reviewData';
import {reviewVariant} from './reviewVariants';
import {grammarCheckId,lessonById} from './data';
import {REPAIRS} from './studioData';
import {SURAH_JOURNEYS} from './journeyData';
import {RepairExercise} from './ConstructionStudio';
import {JourneyStep} from './SurahJourney';
import {DUELS,INQUIRIES} from './playData';
import {DuelRound,InquiryRound} from './ArabicChallenges';
import {PlayFrame} from './PlayFrame';
import {playFeedback} from './playFeedback';
import {GuidedExplanation} from './GuidedExplanation';
export function DailySession(){
 const [plan,setPlan]=usePracticeState<DailyPlan|null>('daily:plan',null);const [minutes,setMinutes]=useState<5|10|20>(10);const [focus,setFocus]=usePracticeState('daily:focus',true);
 const focusRef=useRef<HTMLElement>(null);const active=focus&&!!plan&&!plan.finished;
 useEffect(()=>{if(!active)return;const previous=document.body.style.overflow;const root=document.getElementById('root');const inert=root?.inert;document.body.style.overflow='hidden';if(root)root.inert=true;return()=>{document.body.style.overflow=previous;if(root)root.inert=!!inert;};},[active]);
 function start(){setPlan(buildDailyPlan(minutes,useFahmLearningStore.getState().checks,useArabicLearningStore.getState().drafts,new Date(),useArabicPracticeStore.getState().workshops as Record<string,ExerciseHistory>));}
 if(!plan||plan.finished)return <><h1>{plan?.finished?'Séance terminée':'Ma séance du jour'}</h1>{plan?.finished&&<section className="fahm-card"><p>{plan.done.length} étapes travaillées. Retrouvez vos découvertes ci-dessous.</p><ul>{plan.steps.map(s=><li key={s.id}>{s.kind==='lesson'?lessonById(s.ref)?.title:s.kind==='verse'?`Coran ${s.ref}`:s.kind==='recall'?'Rappel sans aide':s.kind==='duel'?DUELS.find(d=>d.id===s.ref)?.title:s.kind==='inquiry'?INQUIRIES.find(d=>d.id===s.ref)?.title:'Correction d’une construction'}</li>)}</ul></section>}<section className="fahm-card"><h2>Le temps dont vous disposez</h2><div className="arabic-options">{([5,10,20] as const).map(n=><button key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)}>{n} minutes</button>)}</div><p>Une séance adaptée à vos révisions et à vos découvertes. Vous pouvez faire une pause à tout moment.</p><button className="fahm-primary" onClick={start}>{plan?'Préparer une autre séance':'Préparer ma séance'}</button></section></>;
 const step=plan.steps[plan.index];const done=()=>{playFeedback();setPlan(p=>p?completeDailyStep(p,step.id):p);};const labels={recall:'Retrouver',repair:'Réparer',lesson:'Découvrir',verse:'Appliquer',duel:'Comparer',inquiry:'Enquêter'};
 const content=<section ref={focusRef} role={focus?"dialog":undefined} aria-modal={focus||undefined} aria-label={focus?"Séance d’arabe immersive":undefined} onKeyDown={e=>{if(!focus)return;if(e.key==='Escape'){setFocus(false);return;}if(e.key==='Tab'){const els=Array.from(focusRef.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input,textarea,select,summary')||[]).filter(el=>el.getClientRects().length>0);const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}} className={focus?"arabic-daily-focus fahm-shell arabic-page":"arabic-daily-inline"}><div className="arabic-focus-top"><Link to="/academy/arabic">← Faire une pause</Link><button onClick={()=>setFocus(!focus)}>{focus?"Quitter l’immersion":"Mode immersif"}</button>{focus&&<div className="arabic-focus-progress"><span>Étape {plan.index+1} / {plan.steps.length} · {plan.minutes} min</span><progress value={plan.done.length} max={plan.steps.length} aria-label="Étapes terminées"/></div>}</div><PlayFrame title={`${labels[step.kind]} · ${plan.minutes} min`} step={plan.index+1} total={plan.steps.length} scene={`${plan.id}:${step.id}`}><details className="arabic-help"><summary>Pourquoi cet exercice ?</summary><p>{step.reason}</p></details>
 {step.kind==='duel'&&<DuelRound key={`${plan.id}:${step.id}`} task={DUELS.find(d=>d.id===step.ref)!} storageKey={`daily:${plan.id}:${step.id}`} onNext={done} nextLabel="Continuer la séance →"/>}
 {step.kind==='inquiry'&&<InquiryRound key={`${plan.id}:${step.id}`} task={INQUIRIES.find(d=>d.id===step.ref)!} storageKey={`daily:${plan.id}:${step.id}`} onNext={done} nextLabel="Continuer la séance →"/>}
 {step.kind==='recall'&&<DailyRecall key={`${plan.id}:${step.id}`} id={step.ref} storageKey={`daily:${plan.id}:${step.id}`} onComplete={done}/>}
 {step.kind==='repair'&&<RepairExercise key={`${plan.id}:${step.id}`} task={REPAIRS.find(r=>r.id===step.ref)!} storageKey={`daily:${plan.id}:${step.id}`} onComplete={done}/>}
 {step.kind==='lesson'&&<DailyLesson key={`${plan.id}:${step.id}`} id={step.ref} storageKey={`daily:${plan.id}:${step.id}`} onComplete={done}/>}
 {step.kind==='verse'&&<JourneyStep key={`${plan.id}:${step.id}`} task={SURAH_JOURNEYS.flatMap(j=>j.verses).find(v=>v.key===step.ref)!} storageKey={`daily:${plan.id}:${step.id}`} onComplete={done}/>}
 </PlayFrame><p className="arabic-muted">Votre place est sauvegardée sur cet appareil.</p></section>;
 return focus?createPortal(content,document.body):content;
}
function DailyRecall({id,storageKey,onComplete}:{id:string;storageKey:string;onComplete:()=>void}){
 const base=ARABIC_QUESTIONS.find(q=>q.id===id)!;
 const [d,setD]=usePracticeState<{question:ReturnType<typeof reviewVariant>;choice:number|null}>(storageKey,{question:reviewVariant(base,useArabicPracticeStore.getState().evidence[id]?.seen||[]),choice:null});
 const q=d.question;
 function answer(i:number){if(useArabicPracticeStore.getState().workshops[storageKey]&&(useArabicPracticeStore.getState().workshops[storageKey] as typeof d).choice!==null)return;setD(x=>({...x,choice:i}));const check=useFahmLearningStore.getState().checks[grammarCheckId(id)];const due=!!check&&check.due<=Date.now();if(due)useFahmLearningStore.getState().check(grammarCheckId(id),base.target,i===q.answer);useArabicPracticeStore.getState().attempt(id,q.id,i===q.answer,false,due);}
 return <section className="arabic-workshop"><h2>Retrouver sans aide</h2><p>{q.prompt}</p><div className="arabic-options">{q.options.map((o,i)=><button key={o} disabled={d.choice!==null} aria-pressed={d.choice===i} onClick={()=>answer(i)}>{o}</button>)}</div>{d.choice!==null&&<><p role="status">{d.choice===q.answer?'Bien retrouvé.':'Ce repère sera à reprendre.'} {q.explanation}</p><button className="fahm-primary" onClick={onComplete}>Continuer la séance →</button></>}</section>;
}
function DailyLesson({id,storageKey,onComplete}:{id:string;storageKey:string;onComplete:()=>void}){
 const lesson=lessonById(id)!;const q=lesson.questions[0];const [choice,setChoice]=usePracticeState<number|null>(`${storageKey}:question`,null);
 return <section className="fahm-card"><h2>{lesson.title}</h2><blockquote>{lesson.takeaway}</blockquote><details><summary>Comprendre pas à pas</summary><GuidedExplanation lessonId={id}/></details><p className="arabic-play-prompt">{q.prompt}</p><div className="arabic-options">{q.options.map((o,i)=><button key={o} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{o}</button>)}</div>{choice!==null&&<p role="status">{choice===q.answer?'Bien repéré.':'Reprenons ce repère. '}{q.explanation}</p>}<div className="arabic-actions"><Link to={`/academy/arabic/${id}`}>Ouvrir le cours complet</Link><button className="fahm-primary" disabled={choice!==q.answer} onClick={onComplete}>Continuer la séance →</button></div></section>;
}
