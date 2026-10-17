import {categoryById,countEvidence,invocationCountKey} from './adhkarExperience';
import type {useAdhkarExperienceStore} from '../stores/adhkarExperienceStore';
import type {useDailyAdhkarStore} from '../stores/dailyAdhkarStore';
type Experience=Pick<ReturnType<typeof useAdhkarExperienceStore.getState>,'order'|'targets'>;
type Daily=Pick<ReturnType<typeof useDailyAdhkarStore.getState>,'day'|'counts'>;
export function invocationReminder(category:string,daily:Daily,experience:Experience,now:number){
 const items=categoryById.get(category)?.items;if(!items?.length)return null;
 const date=new Date(now),day=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
 const counts=daily.day===day?daily.counts:{};
 const sorted=[...items].sort((a,b)=>{const order=experience.order[category]||[];const x=order.indexOf(a.key),y=order.indexOf(b.key);return (x<0?1e6:x)-(y<0?1e6:y);});
 const complete=(d:typeof items[number])=>(counts[invocationCountKey(d)]||0)>=(countEvidence(d)?d.count:experience.targets[d.key]||d.count||1);
 const completed=items.filter(complete).length,next=sorted.find(d=>!complete(d))||sorted[0];
 const started=items.some(d=>(counts[invocationCountKey(d)]||0)>0);
 return {completed,total:items.length,next,route:`/adhkar?cat=${category}&dua=${encodeURIComponent(next.key)}`,action:completed===items.length?'Relire la séance':started?'Reprendre ma série':'Commencer ma série',detail:`${completed} / ${items.length} compteurs terminés aujourd’hui`};
}
