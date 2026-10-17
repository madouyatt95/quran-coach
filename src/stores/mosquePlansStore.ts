import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parsePlan, planErrors, type MosquePlan } from '../lib/mosquePlanning';
interface PlansState { plans:Record<string,MosquePlan>; save:(p:MosquePlan)=>void; remove:(id:string)=>void; }
export const useMosquePlansStore=create<PlansState>()(persist((set)=>({
 plans:{},
 save:plan=>{const errors=planErrors(plan);if(errors.length)throw new Error(errors[0]);set(s=>{if(!s.plans[plan.mosque.id]&&Object.keys(s.plans).length>=12)throw new Error('Vous pouvez enregistrer 12 mosquées. Retirez un calendrier pour en ajouter un autre.');return {plans:{...s.plans,[plan.mosque.id]:{...plan,confirmedAt:Date.now()}}};});},
 remove:id=>set(s=>({plans:Object.fromEntries(Object.entries(s.plans).filter(([key])=>key!==id))})),
}),{name:'quran-coach-mosque-plans-v1',merge:(saved,current)=>{const entries=Object.values((saved as Partial<PlansState>)?.plans||{}).slice(0,12).map(parsePlan).filter((p):p is MosquePlan=>p!==null);return {...current,plans:Object.fromEntries(entries.map(p=>[p.mosque.id,p]))};}}));
