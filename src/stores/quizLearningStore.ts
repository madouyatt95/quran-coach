import {useStatsStore} from './statsStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recallAnswer, learningBank, type LearningQuestion, type QuizRecall } from '../lib/quizLearning';
import {adaptNext,type AnswerDetail} from '../lib/quizPedagogy';
export interface StudyAnswer {id:string;correct:boolean;certain:boolean;player:number;response:string;detail?:AnswerDetail}
export interface StudySession {startedAt?:number;title:string;questions:LearningQuestion[];index:number;answers:StudyAnswer[];mode:'learn'|'family'|'coop'|'shared'|'local-duel';names:string[];feedback:boolean;handoff:boolean;finished:boolean;adaptive?:boolean;poolIds?:string[];adaptationNote?:string;support?:boolean}
interface State {
 session:StudySession|null;recalls:Record<string,QuizRecall>;saved:Record<string,LearningQuestion>;completed:number;
 start:(title:string,q:LearningQuestion[],mode?:StudySession['mode'],names?:string[],options?:{adaptive?:boolean;poolIds?:string[]})=>void;
 answer:(correct:boolean,certain:boolean,response:string,detail?:AnswerDetail)=>void;next:()=>void;ready:()=>void;
 save:(q:LearningQuestion)=>void;clear:()=>void;
}
export const useQuizLearningStore=create<State>()(persist((set,get)=>({
 session:null,recalls:{},saved:{},completed:0,
 start:(title,questions,mode='learn',names=[],options={})=>{if(!questions.length)return;if(mode==='local-duel'){names=names.map(n=>n.trim()).filter(Boolean).slice(0,2);if(names.length!==2)return;questions=questions.flatMap(q=>[q,q]);}set({session:{startedAt:Date.now(),title,questions,adaptive:mode==='learn'&&!questions.some(q=>q.investigation)&&options.adaptive!==false,poolIds:options.poolIds??questions.map(q=>q.id),index:0,answers:[],mode,names:names.map(n=>n.trim().slice(0,24)).filter(Boolean).slice(0,6),feedback:false,handoff:mode==='family'||mode==='local-duel',finished:false}});},
 answer:(correct,certain,response,detail)=>{const s=get().session;if(!s||s.finished||s.feedback||s.handoff||s.answers.length!==s.index)return;const q=s.questions[s.index];if(s.mode==='learn')useStatsStore.getState().recordActivity();const answer={id:q.id,correct,certain,response,detail,player:s.names.length?s.index%s.names.length:0};set(state=>({session:{...s,feedback:true,answers:[...s.answers,answer]},recalls:s.mode==='learn'&&!q.investigation?{...state.recalls,[q.id]:recallAnswer(state.recalls[q.id],correct,certain)}:state.recalls}));},
 next:()=>{const s=get().session;if(!s||!s.feedback||s.finished)return;const finished=s.index+1>=s.questions.length;const ids=new Set(s.poolIds||s.questions.map(q=>q.id));const adapted=s.adaptive&&!finished?adaptNext(s.questions,s.index,s.answers,learningBank().filter(q=>ids.has(q.id))):{questions:s.questions,note:'',support:false};set(state=>({session:{...s,questions:adapted.questions,adaptationNote:adapted.note,support:adapted.support,index:finished?s.index:s.index+1,feedback:false,handoff:!finished&&(s.mode==='family'||s.mode==='local-duel'),finished},completed:state.completed+(finished?1:0)}));},
 ready:()=>set(state=>({session:state.session?{...state.session,handoff:false}:null})),
 save:q=>set(state=>{const saved={...state.saved};if(saved[q.id])delete saved[q.id];else saved[q.id]=q;return {saved};}),
 clear:()=>set({session:null}),
}),{name:'quran-coach-quiz-learning-v1',version:1}));
