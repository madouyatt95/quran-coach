import { expect,it } from 'vitest';
import { adaptPublicTimetable, extractConfData } from '../../server/mawaqitPublic';
import { nextKnownIqama } from './mosqueTimetables';
const now=Date.parse('2026-10-09T10:00:00Z');
const calendar=Array.from({length:12},()=>({'9':['06:00','07:30','13:00','16:00','19:00','23:55'],'10':['06:01','07:31','13:00','16:00','19:00','23:55']}));
const raw={name:'Test Mosque',timezone:'Europe/Paris',latitude:48.85,longitude:2.35,calendar,iqamaEnabled:true,iqamaCalendar:Array.from({length:12},()=>({'9':['+10',null,'16:15','bad','+10']})),jumua:'13:15',jumua2:'14:00',jumuaAsDuhr:false};
it('parses JSON strings containing semicolons and braces, rejecting executable JS',()=>{
 expect(extractConfData('<script>let confData = {"name":"a; b} \\" c", "x":1};</script>').x).toBe(1);
 expect(()=>extractConfData('let confData = {name: alert(1)};')).toThrow();
 expect(()=>extractConfData('nothing here')).toThrow();
});
it('keeps absent iqamas empty and resolves only the offsets actually published by the mosque',()=>{
 const t=adaptPublicTimetable(raw,'test-mosque',now),today=t.days.find(d=>d.date==='2026-10-09')!;
 expect(today.prayers[0].iqama).toBe('06:10');expect(today.prayers[1].iqama).toBeNull();expect(today.prayers[3].iqama).toBeNull();expect(today.prayers[4].iqama).toBe('00:05');
 expect(new Date(today.prayers[4].iqamaAt!).toISOString()).toBe('2026-10-09T22:05:00.000Z');expect(today.jumua.map(p=>p.time)).toEqual(['13:15','14:00']);
});
it('honors iqama disabled and never falls back from iqama to adhan in list filtering',()=>{
 const t=adaptPublicTimetable({...raw,iqamaEnabled:false,jumua:null,jumua2:null},'test-mosque',now);
 expect(t.days.every(d=>d.prayers.every(p=>p.iqama===null))).toBe(true);
 expect(nextKnownIqama(t.mosque,{}, {[t.mosqueId]:t},now)).toBeUndefined();
});
it('rejects DST gaps and drops stale schedules from the next-prayer filter',()=>{
 const t=adaptPublicTimetable(raw,'test-mosque',now);
 expect(nextKnownIqama(t.mosque,{}, {[t.mosqueId]:t},now+3600001)).toBeUndefined();
 expect(()=>adaptPublicTimetable({...raw,timezone:'bad'},'test',now)).toThrow();
 const autumn=Array.from({length:12},()=>({'25':['02:30','07:30','13:00','16:00','19:00','20:00']}));
 const ambiguous=adaptPublicTimetable({...raw,calendar:autumn},'test',Date.parse('2026-10-25T00:00:00Z'));
 expect(ambiguous.days.find(d=>d.date==='2026-10-25')?.prayers[0].adhan).toBeNull();
});
