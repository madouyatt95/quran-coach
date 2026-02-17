/**
 * High Latitude Resolver
 * Detects invalid prayer times at extreme latitudes and applies fallback methods.
 * 
 * The adhan library already handles most high-lat cases, but this module
 * provides additional validation and the "Nearest City" estimation fallback.
 */

import type { DayTimes } from './prayerEngine';

export type HighLatMode =
    | 'NONE'
    | 'ASTRO_MIDNIGHT'
    | 'MIDDLE_OF_NIGHT'
    | 'ONE_SEVENTH'
    | 'ANGLE_BASED';

/**
 * Check if any prayer time is invalid (NaN, undefined, or clearly wrong).
 */
export function hasInvalidTimes(times: DayTimes): boolean {
    const keys: (keyof DayTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const k of keys) {
        const t = times[k];
        if (!t || isNaN(t.getTime())) return true;
    }
    return false;
}

/**
 * Validate that prayer times are in the correct chronological order.
 * Returns false if any prayer is out of order.
 */
export function isChronologicallyValid(times: DayTimes): boolean {
    const order = [times.fajr, times.sunrise, times.dhuhr, times.asr, times.maghrib, times.isha];
    for (let i = 1; i < order.length; i++) {
        if (order[i] <= order[i - 1]) return false;
    }
    return true;
}

/**
 * Detect if we're in a high latitude scenario where prayer times might be unreliable.
 * Generally, latitudes above 48° start having issues during summer/winter.
 */
export function isHighLatitude(lat: number): boolean {
    return Math.abs(lat) > 48;
}

/**
 * Get a human-readable warning message for high-latitude situations.
 */
export function getHighLatWarning(lat: number, times: DayTimes): string | null {
    if (!isHighLatitude(lat)) return null;
    if (hasInvalidTimes(times)) {
        return 'Certaines heures de prière peuvent être imprécises à cette latitude élevée. Le mode haute latitude est appliqué.';
    }
    if (!isChronologicallyValid(times)) {
        return 'Les horaires sont ajustés pour votre latitude élevée via la méthode configurée.';
    }
    return null;
}
