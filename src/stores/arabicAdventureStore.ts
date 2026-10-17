import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {MISSIONS,MISSION_ANALYSES,DUELS,INQUIRIES} from '../arabic/playData';
import {useStatsStore} from './statsStore';
export interface MissionDraft {stage:number;heard:boolean;read:boolean;spot:number|null;order:number[];note:string;compared:boolean;recall:number|null;assisted:boolean;completeAt:number}
export const freshMission=():MissionDraft=>({stage:0,heard:false,read:false,spot:null,order:[],note:'',compared:false,recall:null,assisted:false,completeAt:0});
export function canAdvanceMission(id:string,d:MissionDraft){const t=MISSIONS.find(m=>m.key===id),a=MISSION_ANALYSES[id];if(!t||!a)return false;switch(d.stage){case 0:return d.heard||d.read;case 1:return d.spot===t.focus;case 2:return d.order.length===a.parts.length&&d.order.every((n,i)=>n===i);case 3:return d.compared;case 4:return d.recall===t.answer;default:return false;}}
interface PlayState {missions:Record<string,MissionDraft>;wins:Record<string,{at:number;assisted:boolean}>;motion:boolean;haptics:boolean;patch:(id:string,changes:Partial<Omit<MissionDraft,'stage'|'completeAt'>>)=>void;advance:(id:string,stage:number)=>boolean;revisit:(id:string,stage:number)=>void;win:(kind:'duel'|'inquiry',id:string,answer:number,assisted:boolean)=>void;preferences:(p:Partial<Pick<PlayState,'motion'|'haptics'>>)=>void}
export const useArabicAdventureStore=create<PlayState>()(persist((set,get)=>({missions:{},wins:{},motion:true,haptics:false,
 patch:(id,changes)=>{if(!MISSIONS.some(m=>m.key===id))return;set(s=>({missions:{...s.missions,[id]:{...freshMission(),...s.missions[id],...changes}}}));},
 advance:(id,stage)=>{const d=get().missions[id]||freshMission();if(d.stage!==stage||!canAdvanceMission(id,d))return false;const first=stage===4&&!d.completeAt;set(s=>({missions:{...s.missions,[id]:{...d,stage:Math.min(4,stage+1),completeAt:stage===4?(d.completeAt||Date.now()):d.completeAt}}}));if(first)useStatsStore.getState().recordActivity();return true;},
 revisit:(id,stage)=>{const d=get().missions[id];if(!d||!Number.isInteger(stage)||stage<0||stage>4||(!d.completeAt&&stage>d.stage))return;set(s=>({missions:{...s.missions,[id]:{...d,stage}}}));},
 win:(kind,id,answer,assisted)=>{const t=(kind==='duel'?DUELS:INQUIRIES).find(t=>t.id===id);if(!t||answer!==t.answer||get().wins[`${kind}:${id}`])return;set(s=>({wins:{...s.wins,[`${kind}:${id}`]:{at:Date.now(),assisted}}}));useStatsStore.getState().recordActivity();},
 preferences:p=>set(p),
}),{name:'qc-arabic-adventure-v1'}));
