export type GapMode='auto'|'slow'|'fixed';
export function repeatPauseSeconds(mode:GapMode,duration:number,rate:number,fixed:number){
 if(mode==='fixed')return Math.max(1,Math.min(600,fixed));
 return Math.max(2,Math.min(600,Math.ceil(Math.max(0,duration)/Math.max(.25,rate)*(mode==='slow'?1.4:1)+1.5)));
}
export type RecallRating='again'|'hesitant'|'easy';
export interface RecallReview {due:number;interval:number;rating:RecallRating;reviewedAt:number;}
export function scheduleRecall(previous:RecallReview|undefined,rating:RecallRating,now=Date.now()):RecallReview{
 const interval=rating==='again'?1:rating==='hesitant'?Math.max(1,Math.round((previous?.interval||2)*.7)):Math.min(90,Math.max(3,Math.round((previous?.interval||1)*2.2)));
 const due=new Date(now);due.setDate(due.getDate()+interval);
 return {due:due.getTime(),interval,rating,reviewedAt:now};
}
