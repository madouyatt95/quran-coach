import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localDay } from '../lib/learning';
import type { CompanionCard, CompanionPace, Need, ReadingEvidence } from '../lib/companion';
interface State {
    pace: CompanionPace; evidence: ReadingEvidence[]; done: Record<string,number>; later: Record<string,number>;
    completedCards: CompanionCard[];
    seenReminders: Record<string,number>; markRemindersSeen:(ids:string[])=>void;
    muted: string[]; saved: CompanionCard[];
    journey: { need:Need; step:number; day:string } | null;
    travel: boolean; setTravel:(value:boolean)=>void;
    setPace:(pace:CompanionPace)=>void; record:(e:Omit<ReadingEvidence,'day'|'at'>,now?:number)=>void; removeEvidence:(at:number)=>void;
    complete:(id:string,card?:CompanionCard)=>void; undo:(id:string)=>void; snooze:(id:string)=>void; mute:(topic:string)=>void; unmute:(topic:string)=>void;
    save:(card:CompanionCard)=>void; startJourney:(need:Need)=>void; advance:()=>void;
}
const recent = (values:Record<string,number>)=>Object.fromEntries(Object.entries(values).sort((a,b)=>b[1]-a[1]).slice(0,400));
export const useCompanionStore=create<State>()(persist((set)=>({
    seenReminders:{},markRemindersSeen:ids=>set(s=>{
        const fresh=ids.filter(id=>!s.seenReminders[id]);
        return fresh.length?{seenReminders:recent({...s.seenReminders,...Object.fromEntries(fresh.map(id=>[id,Date.now()]))})}:s;
    }),
    completedCards:[],pace:'balanced',evidence:[],done:{},later:{},muted:[],saved:[],journey:null,travel:false,
    setTravel:travel=>set({travel}),setPace:pace=>set({pace}),
    record:(e,now=Date.now())=>set(s=>{
        if(!Number.isInteger(e.page) || e.page<1 || e.page>604 || !Number.isInteger(e.surah) || e.surah<1 || e.surah>114 || !Number.isInteger(e.ayah) || e.ayah<0 || e.ayah>286)return s;
        const day=localDay(new Date(now));
        if(s.evidence.some(v=>v.day===day && v.surah===e.surah && v.ayah===e.ayah && v.page===e.page))return s;
        const cutoff=localDay(new Date(now-35*86400000));
        return {evidence:[...s.evidence.filter(v=>v.day>=cutoff),{...e,day,at:now}].slice(-18000)};
    }),
    removeEvidence:at=>set(s=>({evidence:s.evidence.filter(item=>item.at!==at)})),
    complete:(id,card)=>set(s=>({done:recent({...s.done,[id]:Date.now()}),completedCards:card?[card,...s.completedCards.filter(v=>v.id!==id)].slice(0,100):s.completedCards})),undo:id=>set(s=>({done:Object.fromEntries(Object.entries(s.done).filter(([key])=>key!==id))})),
    snooze:id=>set(s=>({later:recent({...s.later,[id]:Date.now()+30*60000})})),
    mute:topic=>set(s=>({muted:[...new Set([...s.muted,topic])]})),unmute:topic=>set(s=>({muted:s.muted.filter(t=>t!==topic)})),
    save:card=>set(s=>({saved:s.saved.some(c=>c.id===card.id)?s.saved.filter(c=>c.id!==card.id):[card,...s.saved].slice(0,100)})),
    startJourney:need=>set({journey:{need,step:0,day:localDay()}}),advance:()=>set(s=>({journey:s.journey?{...s.journey,step:Math.min(4,s.journey.step+1)}:null})),
}),{name:'quran-coach-companion-v1',partialize:({pace,evidence,done,later,muted,saved,journey,travel,completedCards,seenReminders})=>({pace,evidence,done,later,muted,saved,journey,travel,completedCards,seenReminders})}));

// Ephemeral activity must never rewrite the persisted reading history every second.
export const useCompanionRuntimeStore=create<{busy:Record<string,boolean>;activeMs:number;lastInteraction:number;setBusy:(id:string,value:boolean)=>void;touch:()=>void;addActive:(ms:number)=>void}>()(set=>({
    busy:{},activeMs:0,lastInteraction:Date.now(),
    setBusy:(id,value)=>set(s=>({busy:value?{...s.busy,[id]:true}:Object.fromEntries(Object.entries(s.busy).filter(([key])=>key!==id))})),
    touch:()=>set({lastInteraction:Date.now()}),addActive:ms=>set(s=>({activeMs:s.activeMs+ms})),
}));
