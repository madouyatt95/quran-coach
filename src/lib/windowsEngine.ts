/**
 * Windows Engine — Fiqh windows computation (Ikhtiyârî / Darûrî)
 * Computes the advanced time windows for Sobh, Asr, and Isha.
 */

import type { DayTimes, PrayerSettings } from './prayerEngine';

// ─── Types ──────────────────────────────────────────────

export interface PrayerWindow {
    start: Date;
    endIkhtiyari: Date;
    startDaruri: Date;
    endDaruri: Date;
}

export interface FiqhWindows {
    sobh: PrayerWindow;
    asr: PrayerWindow;
    isha: {
        start: Date;
        endIkhtiyari: Date; // Akhir Isha
    };
    nightDurationMin: number;
}

// ─── Core ────────────────────────────────────────────────

/**
 * Compute fiqh windows from base prayer times.
 * @param today Today's prayer times
 * @param tomorrowFajr Tomorrow's fajr time (to compute night duration)
 * @param settings User prayer settings
 */
export function computeWindows(
    today: DayTimes,
    tomorrowFajr: Date,
    settings: PrayerSettings
): FiqhWindows {
    const nightDurationMin = computeNightDuration(today.maghrib, tomorrowFajr);

    return {
        sobh: computeSobhWindow(today.fajr, today.sunrise, settings),
        asr: computeAsrWindow(today.asr, today.maghrib, settings),
        isha: computeIshaWindow(today.isha, today.maghrib, nightDurationMin, settings),
        nightDurationMin,
    };
}

// ─── Night Duration ──────────────────────────────────────

/**
 * Compute the legal night duration in minutes.
 * Night = Maghrib → Fajr(next day)
 */
export function computeNightDuration(maghrib: Date, fajrNextDay: Date): number {
    let diff = (fajrNextDay.getTime() - maghrib.getTime()) / 60000;
    // If fajr is "earlier" than maghrib (crossing midnight), add 24h
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff);
}

// ─── Sobh (Fajr) Window ─────────────────────────────────

function computeSobhWindow(
    fajr: Date,
    sunrise: Date,
    settings: PrayerSettings
): PrayerWindow {
    const start = fajr;
    const endDaruri = sunrise; // Sobh daruri always ends at sunrise

    let endIkhtiyari: Date;
    if (settings.sobhIkhtiyariRule.type === 'CUSTOM_OFFSET_MIN') {
        // End ikhtiyari = sunrise - X minutes
        endIkhtiyari = addMinutes(sunrise, -settings.sobhIkhtiyariRule.minutes);
    } else {
        // DEFAULT: Sobh ikhtiyari ends at ~2/3 between fajr and sunrise
        // (a commonly used rule: the middle portion of pre-dawn time)
        const totalMin = diffMin(sunrise, fajr);
        endIkhtiyari = addMinutes(fajr, Math.round(totalMin * 2 / 3));
    }

    // Clamp: endIkhtiyari must be between fajr and sunrise
    if (endIkhtiyari < fajr) endIkhtiyari = new Date(fajr);
    if (endIkhtiyari > sunrise) endIkhtiyari = new Date(sunrise);

    return {
        start,
        endIkhtiyari,
        startDaruri: endIkhtiyari, // Daruri starts where ikhtiyari ends
        endDaruri,
    };
}

// ─── Asr Window ──────────────────────────────────────────

function computeAsrWindow(
    asr: Date,
    maghrib: Date,
    settings: PrayerSettings
): PrayerWindow {
    const start = asr;
    const endDaruri = maghrib; // Asr daruri always ends at maghrib

    let endIkhtiyari: Date;
    if (settings.asrIkhtiyariRule.type === 'CUSTOM_OFFSET_MIN') {
        // End ikhtiyari = maghrib - X minutes
        endIkhtiyari = addMinutes(maghrib, -settings.asrIkhtiyariRule.minutes);
    } else {
        // DEFAULT: Asr ikhtiyari ends when the sun turns yellow
        // Approximation: ~2/3 between asr and maghrib
        const totalMin = diffMin(maghrib, asr);
        endIkhtiyari = addMinutes(asr, Math.round(totalMin * 2 / 3));
    }

    // Clamp: endIkhtiyari must be between asr and maghrib
    if (endIkhtiyari < asr) endIkhtiyari = new Date(asr);
    if (endIkhtiyari > maghrib) endIkhtiyari = new Date(maghrib);

    return {
        start,
        endIkhtiyari,
        startDaruri: endIkhtiyari,
        endDaruri,
    };
}

// ─── Isha Window ─────────────────────────────────────────

function computeIshaWindow(
    isha: Date,
    maghrib: Date,
    nightDurationMin: number,
    settings: PrayerSettings
): { start: Date; endIkhtiyari: Date } {
    const start = isha;

    let endIkhtiyari: Date;
    if (settings.ishaIkhtiyari === 'HALF_NIGHT') {
        // Akhir Isha = Maghrib + nightDuration * 1/2
        endIkhtiyari = addMinutes(maghrib, Math.round(nightDurationMin / 2));
    } else {
        // THIRD_NIGHT: Akhir Isha = Maghrib + nightDuration * 1/3
        endIkhtiyari = addMinutes(maghrib, Math.round(nightDurationMin / 3));
    }

    // Sanity: endIkhtiyari must be after isha
    if (endIkhtiyari < isha) endIkhtiyari = addMinutes(isha, 30);

    return { start, endIkhtiyari };
}

// ─── Helpers ──────────────────────────────────────────────

function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
}

function diffMin(later: Date, earlier: Date): number {
    return Math.round((later.getTime() - earlier.getTime()) / 60000);
}

/**
 * Format a PrayerWindow to human-readable strings.
 */
export function formatWindow(w: PrayerWindow): {
    start: string;
    endIkhtiyari: string;
    startDaruri: string;
    endDaruri: string;
} {
    const fmt = (d: Date) =>
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return {
        start: fmt(w.start),
        endIkhtiyari: fmt(w.endIkhtiyari),
        startDaruri: fmt(w.startDaruri),
        endDaruri: fmt(w.endDaruri),
    };
}

export function formatIshaWindow(w: { start: Date; endIkhtiyari: Date }): {
    start: string;
    endIkhtiyari: string;
} {
    const fmt = (d: Date) =>
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return {
        start: fmt(w.start),
        endIkhtiyari: fmt(w.endIkhtiyari),
    };
}
