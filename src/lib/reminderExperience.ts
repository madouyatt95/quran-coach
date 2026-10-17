import type { CompanionCard } from './companion';
export const REMINDER_GROUPS = [
 ['invocations','🤲 Invocations'],['mosque','🕌 Mosquée'],['friday','🏔️ Vendredi'],
 ['fasting','🌙 Jeûne'],['reading','📖 Lecture et compréhension'],['kinship','📞 Proches'],
 ['weather','🌧️ Météo'],['travel','🧳 Voyage'],['night','🌌 Nuit'],['calendar','📅 Calendrier'],
] as const;
export type ReminderGroup = typeof REMINDER_GROUPS[number][0];
export function reminderGroup(topic:string):ReminderGroup {
 if(['morning','evening'].includes(topic))return 'invocations';
 if(topic.startsWith('prayer-')||topic==='mosque-departure'||topic==='location')return 'mosque';
 if(['friday','al-kahf','kahf-prepare','salawat'].includes(topic))return 'friday';
 if(['fasting','fasting-prepare','white-days'].includes(topic))return 'fasting';
 if(topic==='kinship'||topic==='weather'||topic==='travel')return topic;
 if(topic==='sahar'||topic==='night')return 'night';if(topic==='history')return 'calendar';return 'reading';
}
export interface KeptMoment {id:string;originId:string;at:number;card:CompanionCard;}
export function selectHomeReminders(cards:CompanionCard[],upcoming:CompanionCard[],now:number){
 const current=cards.filter(c=>c.origin==='sentinel'&&c.topic!=='location'&&(!c.expiresAt||c.expiresAt>now));
 const future=upcoming.filter(c=>c.origin==='sentinel'&&c.startsAt!>now&&c.startsAt!<=now+86400000&&(!c.expiresAt||c.expiresAt>now)).sort((a,b)=>a.startsAt!-b.startsAt!).slice(0,2);
 return [...current.filter(c=>c.priority>=30).sort((a,b)=>b.priority-a.priority),...future,...current.filter(c=>c.priority<30)];
}
export function nextMoment(preset:'tonight'|'tomorrow',now=Date.now()){
 const d=new Date(now);if(preset==='tomorrow')d.setDate(d.getDate()+1);
 d.setHours(preset==='tonight'?20:9,0,0,0);return +d>now?+d:null;
}
export function momentLabel(at:number){return new Date(at).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}
