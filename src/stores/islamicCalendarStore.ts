import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HijriMethod } from '../lib/islamicCalendar';
type FastStatus='planned'|'done';
interface CalendarState {
 method:HijriMethod;offset:number;community:string;fasts:Record<string,FastStatus>;
 configure:(method:HijriMethod,offset:number,community:string)=>void;
 setFast:(date:string,status:FastStatus|null)=>void;
}
export const useIslamicCalendarStore=create<CalendarState>()(persist(set=>({
 method:'islamic-umalqura',offset:0,community:'',fasts:{},
 configure:(method,offset,community)=>set({method,offset:Math.max(-2,Math.min(2,Math.round(offset))),community:community.slice(0,120)}),
 setFast:(date,status)=>set(s=>{const fasts={...s.fasts};if(status)fasts[date]=status;else delete fasts[date];return {fasts};}),
}),{name:'quran-coach-islamic-calendar-v1',merge:(saved,current)=>{
 const v=saved as Partial<CalendarState>|null;
 return {...current,method:v?.method==='islamic-civil'?'islamic-civil':'islamic-umalqura',offset:Number.isInteger(v?.offset)&&Math.abs(v!.offset!)<=2?v!.offset!:0,community:typeof v?.community==='string'?v.community.slice(0,120):'',fasts:Object.fromEntries(Object.entries(v?.fasts||{}).filter(([k,s])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&(s==='planned'||s==='done')))};
}}));
