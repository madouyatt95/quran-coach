import { expect,it } from 'vitest';
import { publishedDay,publishedNext } from './publishedPrayerClock';
import { SALATS } from './mosquePlanning';
import type { PublishedTimetable } from './mosqueTimetables';
const now=Date.parse('2026-10-10T08:00:00Z');
function fixture():PublishedTimetable{return {mosque:{id:'a',name:'A',lat:48,lng:2,city:'Paris',sourceUrl:'https://mawaqit.net/fr/a'},mosqueId:'a',timezone:'Europe/Paris',source:'MAWAQIT',sourceUrl:'https://mawaqit.net/fr/a',fetchedAt:now,days:[{date:'2026-10-10',prayers:SALATS.map((key,i)=>({key,adhan:'10:10',adhanAt:now+(i+1)*600000,iqama:'10:15',iqamaAt:now+(i+1)*600000+300000})),jumua:[]}]};}
it('requires all five published Adhans and freshness, without requiring or inventing Iqama',()=>{
 const t=fixture();t.days[0].prayers[0].iqama=null;t.days[0].prayers[0].iqamaAt=null;
 expect(publishedDay(t,now)).toBeDefined();expect(publishedNext(t,now)?.iqama).toBeNull();
 t.days[0].prayers.pop();expect(publishedDay(t,now)).toBeUndefined();expect(publishedDay(fixture(),now+3600001)).toBeUndefined();
});
it('counts to Adhan then to Iqama after Adhan passes',()=>{
 const t=fixture();expect(publishedNext(t,now)?.kind).toBe('Adhan');expect(publishedNext(t,now+600001)?.kind).toBe('Iqama');expect(publishedNext(t,now+900001)?.key).toBe('dhuhr');
});
it('uses Friday sessions instead of ordinary Dhuhr, and preserves both sessions',()=>{
 const t=fixture();t.days[0].jumua=[{time:'10:18',at:now+1100000},{time:'10:28',at:now+1700000}];
 expect(publishedNext(t,now+900001)?.key).toBe('friday');expect(publishedNext(t,now+1100001)?.at).toBe(now+1700000);
});
it('takes the next published day after Isha rather than computing a replacement',()=>{
 const t=fixture();const end=now+3400000;
 t.days.push({...t.days[0],date:'2026-10-11',prayers:t.days[0].prayers.map(p=>({...p,adhanAt:p.adhanAt!+86400000,iqamaAt:p.iqamaAt!+86400000}))});
 expect(publishedNext(t,end)?.at).toBe(now+600000+86400000);
});
