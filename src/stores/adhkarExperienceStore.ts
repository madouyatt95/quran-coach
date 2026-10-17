import {scheduleRecall,type RecallReview,type RecallRating,type GapMode} from '../lib/invocationPractice';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
interface Preferences {gapMode:GapMode;phonetic:boolean;translation:boolean;rate:number;repeats:number;gap:number;mode:'recite'|'learn';continuous:boolean;arabicAudio:boolean;frenchAudio:boolean;repeatSilence:boolean;}
const defaultPreferences:Preferences={gapMode:'auto',phonetic:true,translation:true,rate:1,repeats:1,gap:4,mode:'recite',continuous:false,arabicAudio:true,frenchAudio:false,repeatSilence:true};
export interface TimedInvocationSession {id:string;keys:string[];minutes:number;seconds:number;}
interface State {
 counts:Record<string,number>;targets:Record<string,number>;order:Record<string,string[]>;
 resume:{session:string;key:string}|null;preferences:Preferences;
 reviews:Record<string,RecallReview>;reviewSession:string[];rateRecall:(key:string,rating:RecallRating)=>void;postponeRecall:(key:string)=>void;startReview:(keys:string[])=>void;
 learned:Record<string,string>;timedSession:TimedInvocationSession|null;
 markLearned:(key:string)=>void;setTimedSession:(session:TimedInvocationSession)=>void;
 setResume:(session:string,key:string)=>void;count:(key:string,delta:number,max:number)=>void;
 setTarget:(key:string,value:number)=>void;setOrder:(id:string,keys:string[])=>void;
 configure:(value:Partial<Preferences>)=>void;reset:(keys:string[])=>void;
}
export const useAdhkarExperienceStore=create<State>()(persist((set)=>({
 reviews:{},reviewSession:[],
 rateRecall:(key,rating)=>set(s=>({reviews:{...s.reviews,[key]:scheduleRecall(s.reviews[key],rating)}})),
 postponeRecall:key=>set(s=>{const review=s.reviews[key];if(!review)return {};const due=new Date();due.setDate(due.getDate()+1);return {reviews:{...s.reviews,[key]:{...review,due:due.getTime()}}};}),
 startReview:reviewSession=>set(s=>({reviewSession,preferences:{...s.preferences,mode:'learn',continuous:false}})),
 counts:{},targets:{},order:{},resume:null,preferences:defaultPreferences,learned:{},timedSession:null,
 markLearned:key=>set(s=>({learned:{...s.learned,[key]:new Date().toISOString()},reviews:s.reviews[key]?s.reviews:{...s.reviews,[key]:scheduleRecall(undefined,'easy')}})),
 setTimedSession:timedSession=>set({timedSession}),
 setResume:(session,key)=>set({resume:{session,key}}),
 count:(key,delta,max)=>set(s=>({counts:{...s.counts,[key]:delta<0?Math.max(0,(s.counts[key]||0)+delta):Math.max(s.counts[key]||0,Math.min(max,(s.counts[key]||0)+delta))}})),
 setTarget:(key,value)=>{if(Number.isFinite(value))set(s=>({targets:{...s.targets,[key]:Math.min(1000,Math.max(1,Math.floor(value)))}}));},
 setOrder:(id,keys)=>set(s=>({order:{...s.order,[id]:[...new Set(keys)]}})),
 configure:value=>set(s=>({preferences:{...s.preferences,...value}})),
 reset:keys=>set(s=>({counts:Object.fromEntries(Object.entries(s.counts).filter(([key])=>!keys.includes(key)))})),
}),{name:'quran-coach-adhkar-experience',version:1,merge:(persisted,current)=>{
 const saved=persisted as Partial<State>|undefined;
 return {...current,...saved,preferences:{...defaultPreferences,...saved?.preferences,gapMode:saved?.preferences?.gapMode||(saved?.preferences?'fixed':'auto')}};
}}));
