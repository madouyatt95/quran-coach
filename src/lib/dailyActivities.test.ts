import {expect,it} from 'vitest';
import {fitDailyActivities} from './dailyActivities';
import {nextRevision} from '../stores/personalJourneyStore';
it('respects the time budget without duplicate activities',()=>{const a={id:'read',title:'Read',href:'/read',minutes:3};const result=fitDailyActivities(5,[a,a,{...a,id:'course',minutes:5},{...a,id:'review',minutes:2}]);expect(result.map(a=>a.id)).toEqual(['read','review']);expect(result.every(a=>!a.done)).toBe(true);});
it('brings difficult ideas back sooner and caps successful intervals',()=>{const initial=nextRevision(undefined,true,0);expect(initial.due).toBe(3*86400000);expect(nextRevision(initial,false,0).due).toBe(86400000);expect(nextRevision({...initial,interval:40},true,0).interval).toBe(60);});
