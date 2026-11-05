import {create} from 'zustand';
import {persist} from '../lib/profilePersist';
export interface DailyActivity {id:string;title:string;href:string;minutes:number;done:boolean}
export interface PersonalSession {createdAt:number;minutes:number;activities:DailyActivity[]}
export interface RevisionMemory {due:number;interval:number;attempts:number;correct:boolean}
export function nextRevision(old:RevisionMemory|undefined,correct:boolean,now=Date.now()):RevisionMemory{
 const interval=correct?Math.min(60,Math.max(3,(old?.interval||1)*2)):1;
 return {due:now+interval*86400000,interval,attempts:(old?.attempts||0)+1,correct};
}
export const usePersonalJourneyStore=create<{
 session:PersonalSession|null;start:(minutes:number,activities:DailyActivity[])=>void;complete:(id:string)=>void;
 reviews:Record<string,RevisionMemory>;review:(id:string,correct:boolean)=>void;
 savedCourses:Record<string,number>;toggleCourse:(id:string)=>void;
}>()(persist(set=>({session:null,start:(minutes,activities)=>set({session:{createdAt:Date.now(),minutes,activities}}),complete:id=>set(s=>s.session?{session:{...s.session,activities:s.session.activities.map(a=>a.id===id?{...a,done:true}:a)}}:s),
 reviews:{},review:(id,correct)=>set(s=>({reviews:{...s.reviews,[id]:nextRevision(s.reviews[id],correct)}})),
 savedCourses:{},toggleCourse:id=>set(s=>{const savedCourses={...s.savedCourses};if(savedCourses[id])delete savedCourses[id];else savedCourses[id]=Date.now();return {savedCourses};})
}),{name:'qc-personal-journey-v1'}));
