import { describe, expect, it } from 'vitest';
import { addDays, calendarICS, daysBetween, eventsOn, fastingBlocked, hijriForDate, hijriMonth, upcomingCalendarEvents } from './islamicCalendar';
const method='islamic-umalqura';
describe('Hijri calendar dates and worship boundaries',()=>{
 it('counts civil days across daylight saving changes, independently of elapsed local hours',()=>{
  expect(daysBetween('2026-03-28','2026-03-30')).toBe(2);
  expect(addDays('2026-12-31',1)).toBe('2027-01-01');
 });
 it('enumerates every day without gaps across a complete year including its rollover',()=>{
  let anchor='2026-01-01';let rollover=false;
  for(let n=0;n<14;n++){
   const days=hijriMonth(anchor,method,0),start=hijriForDate(days[0],method),next=addDays(days.at(-1)!,1),nextH=hijriForDate(next,method);
   expect([29,30]).toContain(days.length);expect(start.day).toBe(1);
   expect(hijriForDate(days.at(-1)!,method).day).toBe(days.length);expect(nextH.day).toBe(1);
   if(start.month===12){expect(nextH.month).toBe(1);expect(nextH.year).toBe(start.year+1);rollover=true;}
   anchor=next;
  }
  expect(rollover).toBe(true);
 });
 it('applies the same one-day offset to events and the grid',()=>{
  const base=hijriForDate('2026-10-10',method,1);
  expect(base).toEqual(hijriForDate('2026-10-11',method,0));
  expect(eventsOn('2026-10-10',method,1).filter(e=>e.id!=='weekly-fast')).toEqual(eventsOn('2026-10-11',method,0).filter(e=>e.id!=='weekly-fast'));
 });
 it('finds next-year events without adding a second year and excludes fasting recommendations on forbidden days',()=>{
  const yearDays=Array.from({length:355},(_,i)=>addDays('2026-01-01',i));
  const last=yearDays.find(d=>{const h=hijriForDate(d);return h.month===12&&h.day===29;})!;
  const nextYear=upcomingCalendarEvents(last,method,0).find(e=>e.id==='new-year');
  expect(nextYear).toBeDefined();expect(nextYear!.daysUntil).toBeLessThanOrEqual(2);
  for(const d of yearDays){const h=hijriForDate(d);if(fastingBlocked(h))expect(eventsOn(d,method,0).some(e=>e.id==='white-day'||e.id==='weekly-fast')).toBe(false);}
 });
 it('represents every last Ramadan night and does not identify the 27th with certainty',()=>{
  const nights=Array.from({length:355},(_,i)=>addDays('2026-01-01',i)).flatMap(d=>eventsOn(d,method,0).filter(e=>e.id==='last-nights'));
  expect(nights.length).toBeGreaterThanOrEqual(9);expect(nights.length).toBeLessThanOrEqual(10);
  expect(nights.every(e=>e.description.includes('pas une date certaine'))).toBe(true);
 });
 it('exports a one-day event with optional previous-evening reminder and safe text',()=>{
  const ics=calendarICS('2026-12-31','Mon jeûne','Texte; virgule,\nligne',true);
  expect(ics).toContain('DTSTART;VALUE=DATE:20261231');expect(ics).toContain('DTEND;VALUE=DATE:20270101');
  expect(ics).toContain('TRIGGER:-PT5H');expect(ics).toContain('Texte\\; virgule\\,\\nligne');
  expect(calendarICS('2026-12-31','Événement','')).not.toContain('VALARM');
  expect(ics.split('\r\n').every(l=>new TextEncoder().encode(l).length<=75)).toBe(true);
 });
});
