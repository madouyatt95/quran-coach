import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {CompanionCard} from '../lib/companion';
import type {KeptMoment,ReminderGroup} from '../lib/reminderExperience';
interface State {
 groups:Partial<Record<ReminderGroup,boolean>>;cooldowns:Record<string,number>;moments:KeptMoment[];
 setGroup:(group:ReminderGroup,value:boolean)=>void;
 setCooldown:(topic:string,until:number)=>void;
 keep:(card:CompanionCard,at:number,originId?:string)=>string|null;
 remove:(id:string)=>void;
}
export const useReminderExperienceStore=create<State>()(persist((set)=>({
 groups:{},cooldowns:{},moments:[],
 setGroup:(group,value)=>set(s=>({groups:{...s.groups,[group]:value}})),
 setCooldown:(topic,until)=>set(s=>({cooldowns:{...s.cooldowns,[topic]:until}})),
 keep:(card,at,originId=card.id)=>{
  const now=Date.now();if(!Number.isFinite(at)||at<=now||at>now+90*86400000||(card.expiresAt&&at>=card.expiresAt))return null;
  const id=`kept:${originId}:${at}`;
  set(s=>({moments:[...s.moments.filter(m=>m.originId!==originId&&m.at>now-86400000),{id,originId,at,card:{...card}}].slice(-100)}));return id;
 },
 remove:id=>set(s=>({moments:s.moments.filter(m=>m.id!==id)})),
}),{name:'quran-coach-reminder-experience-v1'}));
