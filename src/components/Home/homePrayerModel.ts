import {computeDay, type PrayerSettings} from '../../lib/prayerEngine';
import {SALATS, SALAT_LABELS} from '../../lib/mosquePlanning';

export interface HomePrayerEvent {
    label: string; kind: string; at: number; time: string;
    adhan: string | null; iqama: string | null;
}

// Compute tomorrow independently: its Fajr is not necessarily today's Fajr.
export function calculatedHomePrayers(now: number, lat: number | null, lng: number | null, settings: PrayerSettings): HomePrayerEvent[] {
    if (lat === null || lng === null) return [];
    try {
        return [0, 1].flatMap(offset => {
            const date = new Date(now);
            date.setDate(date.getDate() + offset);
            const day = computeDay(date, lat, lng, settings);
            return SALATS.map(key => ({label: SALAT_LABELS[key], kind: 'Horaire calculé', at: +day.times[key], time: day.formattedTimes[key], adhan: null, iqama: null}));
        }).filter(event => Number.isFinite(event.at)).sort((a, b) => a.at - b.at);
    } catch { return []; }
}

