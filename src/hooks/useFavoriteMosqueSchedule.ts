import { useEffect } from 'react';
import { activeMosque, useMosqueStore } from '../stores/mosqueStore';
import { useMosquePlansStore } from '../stores/mosquePlansStore';
import { useMosqueDirectoryStore } from '../stores/mosqueDirectoryStore';
import { scheduleSlug } from '../lib/mosqueScheduleEvents';
import { personalPlan, timetableFresh } from '../lib/mosqueTimetables';
export function useFavoriteMosqueSchedule(now:number){
 const favorite=useMosqueStore(activeMosque),plans=useMosquePlansStore(s=>s.plans);
 const {links,automatic,published,discover,loadPublished}=useMosqueDirectoryStore();
 const slug=favorite?scheduleSlug(favorite,links,automatic):undefined;
 const refreshWindow=Math.floor(now/900000);
 useEffect(()=>{if(!favorite)return;void (slug?loadPublished(slug):discover(favorite)).catch(()=>{/* Existing cached data and explicit empty states remain usable. */});},[favorite,slug,discover,loadPublished,refreshWindow]);
 const stored=slug?published[slug]:undefined;
 return {favorite,plans,plan:favorite?personalPlan(favorite,plans):undefined,timetable:stored&&timetableFresh(stored,now)?stored:undefined};
}
