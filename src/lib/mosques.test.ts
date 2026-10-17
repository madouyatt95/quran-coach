import { expect,it } from 'vitest';
import { parseMosques,parseMosqueSchedule,safeMosqueUrl,distanceKm,mosqueDate,directionsUrl } from './mosques';
const row={slug:'paris_mosquee',title:'Mosquée',city:'Paris',coordinates:[2.35,48.85],publicUrl:'/paris/mosques/test'};
it('validates directory coordinates and links, removes duplicate ids, and preserves correct lat/lng order',()=>{
 const result=parseMosques([row,row,{...row,slug:'bad',coordinates:[200,100]},{...row,slug:'evil',publicUrl:'/\\evil.example'}]);
 expect(result).toHaveLength(1);expect(result[0]).toMatchObject({lat:48.85,lng:2.35,sourceUrl:'https://pray.zone/paris/mosques/test'});
 expect(()=>parseMosques({error:'down'})).toThrow();
});
it('labels provider times as calculated, never turns them into an iqama',()=>{
 const result=parseMosqueSchedule({data:{date:'2026-10-09',timezone:'Europe/Paris',prayerTimes:[{id:'Fajr',time:'06:20'},{id:'Asr',time:'25:00'},{id:'Maghrib',time:'19:00'}]},mosque:{address:'Paris'}});
 expect(result.kind).toBe('calculated');expect(result.times).toHaveLength(2);expect(result).not.toHaveProperty('iqama');
 expect(()=>parseMosqueSchedule({data:{date:'2026-10-09',timezone:'invalid',prayerTimes:[]}})).toThrow();
});
it('accepts https timetable links but rejects scripts, credentials and malformed links',()=>{
 expect(safeMosqueUrl('https://mawaqit.net/fr/mosquee')).toBe('https://mawaqit.net/fr/mosquee');
 for(const value of ['javascript:alert(1)','https://user:pass@example.com','http://example.com','https://127.0.0.1/test','not-a-link'])expect(safeMosqueUrl(value)).toBeNull();
});
it('uses mosque timezone for the current day and provides destination-only directions',()=>{
 expect(mosqueDate('Europe/Paris',new Date('2026-10-09T23:30:00Z'))).toBe('2026-10-10');
 expect(mosqueDate('America/New_York',new Date('2026-10-09T00:30:00Z'))).toBe('2026-10-08');
 const m=parseMosques([row])[0];expect(directionsUrl(m,'google')).toContain('destination=48.85,2.35');expect(directionsUrl(m,'apple')).toContain('daddr=48.85,2.35');expect(distanceKm(m,m)).toBe(0);
});
