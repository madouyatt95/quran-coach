import {selectChallenge,type ExerciseHistory} from './challengeRotation';
import {ARABIC_LESSONS,grammarCheckId} from './data';
import {arabicReviewItems,ARABIC_QUESTIONS} from './reviewData';
import {DUELS,INQUIRIES} from './playData';
import {REPAIRS} from './studioData';
import {SURAH_JOURNEYS} from './journeyData';
import type {RecallCheck} from '../lib/fahm/recall';
import type {ArabicDraft} from '../stores/arabicLearningStore';
export interface DailyStep {id:string;kind:'recall'|'repair'|'lesson'|'verse'|'duel'|'inquiry';ref:string;reason:string}
export interface DailyPlan {id:string;date:string;minutes:number;index:number;done:string[];steps:DailyStep[];finished:boolean}
export const localDay=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function buildDailyPlan(minutes:5|10|20,checks:Record<string,RecallCheck>,drafts:Record<string,ArabicDraft>,now=new Date(),history:Record<string,ExerciseHistory>={}):DailyPlan{
 const steps:DailyStep[]=[];
 const due=arabicReviewItems(checks,now.getTime()).sort((a,b)=>checks[grammarCheckId(a.id)].due-checks[grammarCheckId(b.id)].due).slice(0,minutes===5?1:minutes===10?2:3);
 due.forEach(q=>steps.push({id:`recall:${q.id}`,kind:'recall',ref:q.id,reason:'Ce rappel est arrivé à échéance.'}));
 const weak=ARABIC_QUESTIONS.filter(q=>checks[grammarCheckId(q.id)]&&!checks[grammarCheckId(q.id)].correct).sort((a,b)=>checks[grammarCheckId(b.id)].at-checks[grammarCheckId(a.id)].at);
 const repair=weak.map(q=>REPAIRS.find(r=>r.lesson===q.lesson)).find(Boolean);
 if(repair)steps.push({id:`repair:${repair.id}`,kind:'repair',ref:repair.id,reason:'Une difficulté a été rencontrée sur cette notion.'});
 const next=ARABIC_LESSONS.find(l=>!drafts[l.id]?.complete&&(!l.prerequisites||l.prerequisites.every(id=>drafts[id]?.complete)))||ARABIC_LESSONS.find(l=>!drafts[l.id]?.complete)||ARABIC_LESSONS[0];
 steps.push({id:`lesson:${next.id}`,kind:'lesson',ref:next.id,reason:drafts[next.id]?.complete?'Revisiter un repère déjà étudié.':'Avancer dans le programme à partir de vos validations.'});
 const verses=SURAH_JOURNEYS.flatMap(s=>s.verses);const verse=verses.find(v=>v.lesson===next.id)||verses.find(v=>drafts[v.lesson]?.complete)||verses[0];
 steps.push({id:`verse:${verse.key}`,kind:'verse',ref:verse.key,reason:'Retrouver une construction dans une sourate courte.'});
 if(minutes===20&&!repair){const r=REPAIRS.find(r=>drafts[r.lesson]?.complete);if(r)steps.splice(steps.length-1,0,{id:`repair:${r.id}`,kind:'repair',ref:r.id,reason:'Réinvestir une notion déjà étudiée.'});}
 if(minutes>=10){const duelLesson=DUELS.find(d=>d.lesson===next.id)?.lesson||DUELS.find(d=>drafts[d.lesson]?.complete)?.lesson||DUELS[3].lesson;const duel=selectChallenge(DUELS,duelLesson,history,'duel');steps.splice(steps.length-1,0,{id:`duel:${duel.id}`,kind:'duel',ref:duel.id,reason:'Comparer deux phrases pour repérer une différence de sens.'});}
 if(minutes===20){const inquiryLesson=INQUIRIES.find(i=>i.lesson===next.id)?.lesson||INQUIRIES.find(i=>drafts[i.lesson]?.complete)?.lesson||INQUIRIES[0].lesson;const inquiry=selectChallenge(INQUIRIES,inquiryLesson,history,'inquiry');steps.push({id:`inquiry:${inquiry.id}`,kind:'inquiry',ref:inquiry.id,reason:'Réunir les indices avant de proposer une explication.'});}
 return{id:`${localDay(now)}-${now.getTime()}`,date:localDay(now),minutes,index:0,done:[],steps,finished:false};
}
export function completeDailyStep(plan:DailyPlan,id:string):DailyPlan{
 if(plan.steps[plan.index]?.id!==id||plan.finished)return plan;
 const done=[...new Set([...plan.done,id])];const finished=plan.steps.every(s=>done.includes(s.id));return{...plan,done,finished,index:finished?plan.index:Math.min(plan.index+1,plan.steps.length-1)};
}
