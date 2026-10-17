import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export interface ConceptKnowledge {
 answers:Record<string,number>;attempts:number;mistakes:number;streak:number;
 lastCorrect:boolean;lastQuestion?:string;updatedAt:number;due:number;interval:number;
 explanation:string;proofNote:string;confirmedAt?:number;
}
export const conceptKey=(id:string,index:number)=>`${id}:notion:${index}`;
interface KnowledgeState {
 concepts:Record<string,ConceptKnowledge>;
 session:{targets:{id:string;index:number;reason:string}[];cursor:number;stage:number;finished:boolean}|null;
 begin:(targets:{id:string;index:number;reason:string}[])=>void;
 advance:()=>void;
 clearAnswer:(id:string,index:number,question:string)=>void;
 answer:(id:string,index:number,question:string,choice:number,correct:boolean,review?:boolean)=>void;
 write:(id:string,index:number,field:'explanation'|'proofNote',text:string)=>void;
}
const empty=():ConceptKnowledge=>({answers:{},attempts:0,mistakes:0,streak:0,lastCorrect:false,updatedAt:0,due:0,interval:0,explanation:'',proofNote:''});
export const useAcademyKnowledgeStore=create<KnowledgeState>()(persist((set)=>({concepts:{},session:null,
 begin:targets=>set({session:{targets,cursor:0,stage:0,finished:false}}),
 advance:()=>set(state=>!state.session?state:{session:{...state.session,stage:state.session.stage<2?state.session.stage+1:0,cursor:state.session.stage===2?state.session.cursor+1:state.session.cursor,finished:state.session.stage===2&&state.session.cursor+1>=state.session.targets.length}}),
 clearAnswer:(id,index,question)=>set(state=>{const key=conceptKey(id,index),old=state.concepts[key];if(!old)return state;const answers={...old.answers};delete answers[question];return{concepts:{...state.concepts,[key]:{...old,answers}}};}),
 answer:(id,index,question,choice,correct,review=false)=>set(state=>{const key=conceptKey(id,index),old=state.concepts[key]||empty();const priorAnswers={...old.answers};if(!correct&&!['check','retry'].includes(question)){delete priorAnswers.check;delete priorAnswers.retry;}const interval=correct?review?Math.min(30,Math.max(3,old.interval*2)):Math.max(1,old.interval):1;return{concepts:{...state.concepts,[key]:{...old,answers:{...priorAnswers,[question]:choice},attempts:old.attempts+1,mistakes:old.mistakes+(correct?0:1),streak:correct?old.streak+1:0,confirmedAt:correct?(review&&old.lastCorrect&&old.due<=Date.now()?Date.now():old.confirmedAt):undefined,lastCorrect:correct,lastQuestion:question,updatedAt:Date.now(),interval,due:Date.now()+interval*86400000}}};}),
 write:(id,index,field,text)=>set(state=>{const key=conceptKey(id,index);return{concepts:{...state.concepts,[key]:{...empty(),...state.concepts[key],[field]:text.slice(0,3000)}}};}),
}),{name:'qc-academy-notions-v1',version:1}));
