import type {DailyActivity} from '../stores/personalJourneyStore';
export function fitDailyActivities(minutes:number,candidates:Omit<DailyActivity,'done'>[]):DailyActivity[]{
 let remaining=Math.max(0,minutes);const seen=new Set<string>();
 return candidates.flatMap(a=>{if(seen.has(a.id)||a.minutes<=0||a.minutes>remaining)return [];seen.add(a.id);remaining-=a.minutes;return [{...a,done:false}];});
}
