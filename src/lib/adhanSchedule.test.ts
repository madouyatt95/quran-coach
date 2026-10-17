import { describe, expect, it } from 'vitest';
import { buildAdhanEvents, dueAdhan, nativeAdhanNotifications } from './adhanSchedule';
import { DEFAULT_PRAYER_SETTINGS } from './prayerEngine';
import { adhanRecording } from './adhanCatalog';
import type { PublishedTimetable } from './mosqueTimetables';
import { SALATS } from './mosquePlanning';
const now = new Date('2026-10-15T00:00:00Z').getTime();
const options = { now, lat: 48.85, lng: 2.35, settings: DEFAULT_PRAYER_SETTINGS, sound: 'ahmed-2', days: 1 };
describe('adhan scheduling', () => {
 it('schedules exactly five calls, dedicated Fajr and the selected voice for others', () => {
  const events = buildAdhanEvents(options); expect(events).toHaveLength(5);
  expect(events.map(e => e.prayer)).toEqual([...SALATS]);
  expect(events[0].recording).toBe('ahmed-fajr'); expect(events.slice(1).every(e => e.recording === 'ahmed-2')).toBe(true);
 });
 it('does not invent times without coordinates or a published day', () => { expect(buildAdhanEvents({ ...options, lat: null })).toEqual([]); });
 it('uses published Adhan timestamps rather than Iqama or calculated hours', () => {
  const timetable = { updatedAt: new Date(now).toISOString(), fetchedAt: now, timezone: 'Europe/Paris', days: [{ date: '2026-10-15', jumua: [], prayers: SALATS.map((key,i) => ({ key, adhan: '06:00', adhanAt: now + (i+6)*3600000, iqama: '06:20', iqamaAt: now + (i+6)*3600000+1200000 })) }] } as unknown as PublishedTimetable;
  const events=buildAdhanEvents({...options,timetable});
  expect(events.map(e=>e.at)).toEqual(SALATS.map((_,i)=>now+(i+6)*3600000));
 });
 it('never catches up missed calls or repeats an already played call', () => {
  const events=buildAdhanEvents(options),first=events[0];
  expect(dueAdhan(events,first.at-1,[])).toBeUndefined();
  expect(dueAdhan(events,first.at+4000,[])).toBe(first);
  expect(dueAdhan(events,first.at+15000,[])).toBeUndefined();
  expect(dueAdhan(events,first.at,[first.key])).toBeUndefined();
 });
 it('keeps native notification IDs isolated, future-only and at most 25', () => {
  const events=buildAdhanEvents({...options,days:7});
  const notifications=nativeAdhanNotifications(events,events[0].at);
  expect(notifications).toHaveLength(25);expect(notifications.every(n=>n.schedule.at.getTime()>events[0].at)).toBe(true);
  expect(notifications[0].id).toBe(7000);expect(notifications[24].id).toBe(7024);
  expect(notifications[0].sound).toBe('adhan-ahmed-2.caf');
 });
 it('handles old city preferences without pretending they identify a recording',()=>{
  expect(adhanRecording('Mecque').id).toBe('ahmed-1');expect(adhanRecording('ahmed-2',true).id).toBe('ahmed-fajr');
 });
});
