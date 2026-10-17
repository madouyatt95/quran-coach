import { computeDay, type PrayerSettings } from './prayerEngine';
import { SALATS, SALAT_LABELS } from './mosquePlanning';
import { publishedDay } from './publishedPrayerClock';
import { mosqueDate } from './mosques';
import type { PublishedTimetable } from './mosqueTimetables';
import { adhanRecording, adhanNotificationSound } from './adhanCatalog';

export interface AdhanEvent { key: string; prayer: string; label: string; at: number; recording: string }
export function buildAdhanEvents(options: {
  now: number; lat: number | null; lng: number | null; settings: PrayerSettings;
  sound: string; timetable?: PublishedTimetable; days?: number;
}): AdhanEvent[] {
  const { now, lat, lng, settings, timetable, sound, days = 5 } = options;
  const events: AdhanEvent[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(now); date.setDate(date.getDate() + i);
    const day = publishedDay(timetable, now, timetable ? mosqueDate(timetable.timezone, date) : undefined);
    const calculated = !day && lat !== null && lng !== null ? computeDay(date, lat, lng, settings) : undefined;
    for (const prayer of SALATS) {
      // Adhan only: Iqama, sunrise and early reminders must never trigger a call to prayer.
      const at = day?.prayers.find(p => p.key === prayer)?.adhanAt ?? calculated?.times[prayer]?.getTime();
      if (at == null || !Number.isFinite(at)) continue;
      const recording = adhanRecording(sound, prayer === 'fajr').id;
      events.push({ key: `${prayer}:${Math.floor(at / 60000)}`, prayer, label: SALAT_LABELS[prayer], at, recording });
    }
  }
  return events.sort((a, b) => a.at - b.at);
}
export function dueAdhan(events: AdhanEvent[], now: number, seen: string[]) {
  // No delayed call when waking a suspended phone or returning hours later.
  return events.find(e => e.at <= now && now - e.at < 15000 && !seen.includes(e.key));
}
export function nativeAdhanNotifications(events: AdhanEvent[], now: number) {
  return events.filter(e => e.at > now).slice(0, 25).map((e, i) => ({
    id: 7000 + i, title: `🕌 ${e.label}`, body: `C’est l’heure de ${e.label}`,
    schedule: { at: new Date(e.at) }, sound: adhanNotificationSound(e.recording),
    extra: { kind: 'adhan', prayer: e.prayer, at: e.at },
  }));
}
