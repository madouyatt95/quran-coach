import {updateRecall,type RecallCheck,type ExerciseDraft,type ListeningDraft} from '../lib/fahm/recall';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {useStatsStore} from './statsStore';
import {validTarget,verseKey,type VerseTarget,type VerseKnowledge} from '../lib/fahm/learning';
interface Session {id:string;title:string;targets:VerseTarget[];minutes:5|10|20;index:number;done:string[];finished:boolean}
interface State {
    modes:Record<string,'study'|'listen'>;
    setMode:(id:string,mode:'study'|'listen')=>void;
    checks:Record<string,RecallCheck>;
    drafts:Record<string,ExerciseDraft>;
    listening:Record<string,ListeningDraft>;
    check:(id:string,target:VerseTarget,correct:boolean,assisted?:boolean)=>void;
    draft:(id:string,patch:Partial<ExerciseDraft>)=>void;
    listenDraft:(id:string,patch:Partial<ListeningDraft>)=>void;
    resetExercise:(id:string)=>void;
    words:Record<string,{text:string;correct:boolean;due:number;at:number}>;
    wordAnswer:(key:string,text:string,correct:boolean)=>void;
    records:Record<string,VerseKnowledge>; positions:Record<string,number>; studied:Record<string,string[]>;
    session:Session|null;lastLesson:string|null;
    begin:(targets:VerseTarget[],minutes:5|10|20,title:string)=>void;
    move:(id:string,index:number)=>void;study:(id:string,target:VerseTarget)=>void;
    answer:(target:VerseTarget,correct:boolean)=>void;
    note:(target:VerseTarget,text:string,compared?:boolean)=>void;
    finishSession:()=>void;
}
const initial=(v:VerseTarget):VerseKnowledge=>({...v,correct:false,attempts:0,mistakes:0,due:0,at:0,note:''});
export const useFahmLearningStore=create<State>()(persist((set)=>({
    modes:{},setMode:(id,mode)=>set(s=>({modes:{...s.modes,[id]:mode}})),
    checks:{},drafts:{},listening:{},
    check:(id,target,correct,assisted=false)=>{if(!validTarget(target.surah,target.ayah))return;useStatsStore.getState().recordActivity();set(s=>({checks:{...s.checks,[id]:updateRecall(s.checks[id],target,correct,assisted)}}));},
    draft:(id,patch)=>set(s=>({drafts:{...s.drafts,[id]:{...(s.drafts[id]||{stage:0,wordKey:'',choice:null,meaningChoice:null,evidence:'',compared:false,completed:false,openedAt:Date.now()}),...patch}}})),
    listenDraft:(id,patch)=>set(s=>({listening:{...s.listening,[id]:{...(s.listening[id]||{help:0,choice:null,heard:false,wrong:false,completed:false,seenText:false}),...patch}}})),
    resetExercise:(id)=>set(s=>({drafts:{...s.drafts,[id]:{stage:0,wordKey:'',choice:null,meaningChoice:null,evidence:'',compared:false,completed:false,openedAt:Date.now()}}})),
    words:{},wordAnswer:(key,text,correct)=>set(s=>({words:{...s.words,[key]:{text,correct,due:Date.now()+(correct?3:1)*86400000,at:Date.now()}}})),
    records:{},positions:{},studied:{},session:null,lastLesson:null,
    begin:(targets,minutes,title)=>{const safe=targets.filter(v=>validTarget(v.surah,v.ayah));if(safe.length)set({session:{id:`personal-${Date.now()}`,title,targets:safe,minutes,index:0,done:[],finished:false}});},
    move:(id,index)=>{if(!Number.isInteger(index)||index<0)return;set(s=>({positions:{...s.positions,[id]:index},lastLesson:id,session:id===s.session?.id?{...s.session,index}:s.session}));},
    study:(id,target)=>{if(!validTarget(target.surah,target.ayah))return;useStatsStore.getState().recordActivity();set(s=>({studied:{...s.studied,[id]:[...new Set([...(s.studied[id]||[]),verseKey(target)])]},session:id===s.session?.id?{...s.session,done:[...new Set([...s.session.done,verseKey(target)])]}:s.session}));},
    answer:(target,correct)=>{if(!validTarget(target.surah,target.ayah))return;useStatsStore.getState().recordActivity();set(s=>{const key=verseKey(target),old=s.records[key]||initial(target);return {records:{...s.records,[key]:{...old,correct,attempts:old.attempts+1,mistakes:old.mistakes+(correct?0:1),at:Date.now(),due:Date.now()+(correct?3:1)*86400000}}};});},
    note:(target,text,compared=false)=>{if(!validTarget(target.surah,target.ayah))return;set(s=>({records:{...s.records,[verseKey(target)]:{...(s.records[verseKey(target)]||initial(target)),note:text.slice(0,3000),compared}}}));},
    finishSession:()=>set(s=>s.session&&s.session.targets.every(v=>s.session!.done.includes(verseKey(v)))?{session:{...s.session,finished:true}}:s),
}),{name:'quran-coach-fahm-learning-v1'}));
