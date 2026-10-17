import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {ARABIC_LESSONS,lessonById} from '../arabic/data';
import {applicationQuestion} from '../arabic/applicationQuestions';
import {REMEDIES} from '../arabic/pedagogy';
import {useArabicPracticeStore} from './arabicPracticeStore';
import {useStatsStore} from './statsStore';
export interface ArabicDraft {stage:number;answers:Record<string,number>;complete:boolean;application:boolean;applicationAnswer?:number;remedies?:Record<string,number>}
const empty=():ArabicDraft=>({stage:0,answers:{},complete:false,application:false});
interface ArabicState {
 detailed:boolean;last:string|null;drafts:Record<string,ArabicDraft>;
 setDetailed:(v:boolean)=>void;move:(id:string,stage:number)=>void;
 answer:(id:string,question:string,value:number)=>void;apply:(id:string)=>void;
 verifyApplication:(id:string,value:number)=>void;
 remedy:(id:string,question:string,value:number)=>void;
 finish:(id:string)=>void;restart:(id:string)=>void;
}
export const useArabicLearningStore=create<ArabicState>()(persist((set,get)=>({detailed:false,last:null,drafts:{},
 setDetailed:detailed=>set({detailed}),
 move:(id,stage)=>{if(!lessonById(id)||!Number.isInteger(stage)||stage<0||stage>2)return;set(s=>({last:id,drafts:{...s.drafts,[id]:{...empty(),...s.drafts[id],stage}}}));},
 answer:(id,question,value)=>{const q=lessonById(id)?.questions.find(q=>q.id===question);if(!q||!Number.isInteger(value)||value<0||value>=q.options.length)return;set(s=>({drafts:{...s.drafts,[id]:{...empty(),...s.drafts[id],remedies:{...s.drafts[id]?.remedies,...(value!==q.answer?{[question]:-1}:{})},answers:{...s.drafts[id]?.answers,[question]:value}}}}));},
 remedy:(id,question,value)=>{const q=lessonById(id)?.questions.find(q=>q.id===question),r=REMEDIES[question];if(!q||!r||!Number.isInteger(value)||value<0||value>=r.check.options.length)return;set(s=>({drafts:{...s.drafts,[id]:{...empty(),...s.drafts[id],remedies:{...s.drafts[id]?.remedies,[question]:value}}}}));},
 verifyApplication:(id,value)=>{const q=applicationQuestion(id);if(!q||!Number.isInteger(value)||value<0||value>=q.options.length)return;set(s=>({drafts:{...s.drafts,[id]:{...empty(),...s.drafts[id],applicationAnswer:value,application:value===q.answer}}}));const base=lessonById(id)?.questions[0];if(base)useArabicPracticeStore.getState().attempt(base.id,q.id,value===q.answer,true,false);},
 apply:id=>{if(lessonById(id)?.level!==2)return;set(s=>({drafts:{...s.drafts,[id]:{...empty(),...s.drafts[id],application:true}}}));},
 finish:id=>{const s=get(),l=lessonById(id),draft=s.drafts[id];if(!l||!draft?.application||(l.level!==2&&!draft.complete&&draft.applicationAnswer!==applicationQuestion(id)?.answer)||!l.questions.every(q=>draft.answers[q.id]===q.answer))return;if(!draft.complete)useStatsStore.getState().recordActivity();set({last:ARABIC_LESSONS[ARABIC_LESSONS.indexOf(l)+1]?.id||id,drafts:{...s.drafts,[id]:{...draft,complete:true}}});},
 restart:id=>{if(!lessonById(id))return;set(s=>({last:id,drafts:{...s.drafts,[id]:{...empty(),complete:s.drafts[id]?.complete||false}}}));},
}),{name:'qc-arabic-learning-v1'}));
