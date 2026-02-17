/**
 * Prayer Engine — Local prayer time computation using adhan library.
 * Replaces the AlAdhan API with local, configurable, offline-capable calculations.
 */

import {
    PrayerTimes,
    CalculationMethod,
    CalculationParameters,
    Coordinates,
    Madhab,
    HighLatitudeRule,
} from 'adhan';

// ─── Types ──────────────────────────────────────────────

export type AnglePreset =
    | 'STANDARD_18_17'
    | 'ANCIENTS'
    | 'LATER'
    | 'ABU_ALI_MURRAKUCHI'
    | 'CUSTOM';

export type IshaIkhtiyari = 'THIRD_NIGHT' | 'HALF_NIGHT';

export type SobhIkhtiyariRule =
    | { type: 'DEFAULT' }
    | { type: 'CUSTOM_OFFSET_MIN'; minutes: number };

export type AsrIkhtiyariRule =
    | { type: 'DEFAULT' }
    | { type: 'CUSTOM_OFFSET_MIN'; minutes: number };

export type HighLatMode =
    | 'NONE'
    | 'ASTRO_MIDNIGHT'
    | 'MIDDLE_OF_NIGHT'
    | 'ONE_SEVENTH'
    | 'ANGLE_BASED';

export type Rounding = 'NONE' | 'NEAREST_MIN' | 'CEIL_MIN';

export interface PrayerAdjustments {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
}

export interface PrayerSettings {
    anglePreset: AnglePreset;
    fajrAngle: number;
    ishaAngle: number;
    asrShadow: 1 | 2;
    ishaIkhtiyari: IshaIkhtiyari;
    sobhIkhtiyariRule: SobhIkhtiyariRule;
    asrIkhtiyariRule: AsrIkhtiyariRule;
    highLatFajrIsha: HighLatMode;
    adjustmentsMin: PrayerAdjustments;
    fajrSafetyMin: number;
    rounding: Rounding;
    showTahajjud: boolean;
    showIshraq: boolean;
}

export interface DayTimes {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    tahajjud?: Date;
    ishraq?: Date;
}

export interface FormattedTimes {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    tahajjud?: string;
    ishraq?: string;
}

export interface DayResult {
    date: string; // YYYY-MM-DD
    times: DayTimes;
    nextPrayer: string | null;
    formattedTimes: Record<string, string>; // Keep Record<string, string> for simplicity in existing UI but add specific keys
}

// ─── Preset Values ──────────────────────────────────────

export const ANGLE_PRESETS: Record<AnglePreset, { fajrAngle: number; ishaAngle: number; label: string; labelAr: string }> = {
    STANDARD_18_17: { fajrAngle: 18, ishaAngle: 17, label: 'Standard (MWL)', labelAr: 'قياسي' },
    ANCIENTS: { fajrAngle: 18, ishaAngle: 18, label: 'Anciens (18/18)', labelAr: 'المتقدمون' },
    LATER: { fajrAngle: 19, ishaAngle: 17, label: 'Tardif (19/17)', labelAr: 'المتأخرون' },
    ABU_ALI_MURRAKUCHI: { fajrAngle: 20, ishaAngle: 16, label: 'Abu Ali al-Murrakuchi', labelAr: 'أبو علي المراكشي' },
    CUSTOM: { fajrAngle: 18, ishaAngle: 17, label: 'Personnalisé', labelAr: 'مخصص' },
};

export const PRAYER_NAMES_FR: Record<string, string> = {
    fajr: 'Sobh', sunrise: 'Shuruq', dhuhr: 'Dhuhr',
    asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
    tahajjud: 'Tahajjud', ishraq: 'Ishraq'
};

export const SALAT_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

// ─── Default Settings ────────────────────────────────────

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
    anglePreset: 'STANDARD_18_17',
    fajrAngle: 18,
    ishaAngle: 17,
    asrShadow: 1,
    ishaIkhtiyari: 'THIRD_NIGHT',
    sobhIkhtiyariRule: { type: 'DEFAULT' },
    asrIkhtiyariRule: { type: 'DEFAULT' },
    highLatFajrIsha: 'MIDDLE_OF_NIGHT',
    adjustmentsMin: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    fajrSafetyMin: 0,
    rounding: 'NEAREST_MIN',
    showTahajjud: false,
    showIshraq: false,
};

// ─── Core Compute ────────────────────────────────────────

function buildParams(settings: PrayerSettings): CalculationParameters {
    // Start from MuslimWorldLeague as a base, then override
    const params = CalculationMethod.MuslimWorldLeague();

    // Apply preset or custom angles
    const preset = settings.anglePreset === 'CUSTOM'
        ? { fajrAngle: settings.fajrAngle, ishaAngle: settings.ishaAngle }
        : ANGLE_PRESETS[settings.anglePreset];

    params.fajrAngle = preset.fajrAngle;
    params.ishaAngle = preset.ishaAngle;

    // Asr shadow ratio
    params.madhab = settings.asrShadow === 2 ? Madhab.Hanafi : Madhab.Shafi;

    // High latitude
    switch (settings.highLatFajrIsha) {
        case 'MIDDLE_OF_NIGHT':
            params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
            break;
        case 'ONE_SEVENTH':
            params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
            break;
        case 'ASTRO_MIDNIGHT':
            params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
            break;
        default:
            params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
    }

    // Adjustments
    params.adjustments = {
        fajr: settings.adjustmentsMin.fajr - settings.fajrSafetyMin,
        sunrise: settings.adjustmentsMin.sunrise,
        dhuhr: settings.adjustmentsMin.dhuhr,
        asr: settings.adjustmentsMin.asr,
        maghrib: settings.adjustmentsMin.maghrib,
        isha: settings.adjustmentsMin.isha,
    };

    return params;
}

export function computeDay(
    date: Date,
    lat: number,
    lng: number,
    settings: PrayerSettings
): DayResult {
    const coords = new Coordinates(lat, lng);
    const params = buildParams(settings);
    const pt = new PrayerTimes(coords, date, params);

    const times: DayTimes = {
        fajr: pt.fajr,
        sunrise: pt.sunrise,
        dhuhr: pt.dhuhr,
        asr: pt.asr,
        maghrib: pt.maghrib,
        isha: pt.isha,
    };

    // Apply rounding
    const roundFn = getRoundingFn(settings.rounding);
    for (const key of Object.keys(times) as (keyof DayTimes)[]) {
        if (times[key]) times[key] = roundFn(times[key] as Date);
    }

    // ─── Extra Times (Tahajjud & Ishraq) ───

    // Ishraq: 15 min after sunrise
    times.ishraq = new Date(times.sunrise.getTime() + 15 * 60 * 1000);

    // Tahajjud: start of the last third of the night
    // Night = Today's Maghrib to tomorrow's Fajr
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPt = new PrayerTimes(coords, tomorrow, params);
    const tomorrowFajr = roundFn(tomorrowPt.fajr);

    const nightDurationMs = tomorrowFajr.getTime() - times.maghrib.getTime();
    const oneThirdMs = nightDurationMs / 3;
    times.tahajjud = new Date(tomorrowFajr.getTime() - oneThirdMs);

    // Formatted
    const formattedTimes: Record<string, string> = {};
    for (const key of Object.keys(times) as (keyof DayTimes)[]) {
        if (times[key]) formattedTimes[key] = formatTime(times[key] as Date);
    }

    // Next prayer
    const now = new Date();
    let nextPrayerStr: string | null = null;
    if (isSameDay(date, now)) {
        const current = pt.currentPrayer();
        const np = pt.nextPrayer();
        const prayerNameMap: Record<string, string> = {
            fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr',
            asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', none: '',
        };
        if (np) nextPrayerStr = prayerNameMap[np] || np;
        // If no next prayer today and current is isha, next is fajr tomorrow
        if (!nextPrayerStr && current === 'isha') {
            nextPrayerStr = 'Fajr';
        }
    }

    return {
        date: formatDate(date),
        times,
        nextPrayer: nextPrayerStr,
        formattedTimes,
    };
}

/**
 * Compute prayer times for a range of days.
 */
export function computeRange(
    startDate: Date,
    days: number,
    lat: number,
    lng: number,
    settings: PrayerSettings
): DayResult[] {
    const results: DayResult[] = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        results.push(computeDay(d, lat, lng, settings));
    }
    return results;
}

/**
 * Compute the "standard" reference times for comparison purposes.
 * Uses STANDARD_18_17 preset with default settings.
 */
export function computeStandard(
    date: Date,
    lat: number,
    lng: number
): DayTimes {
    const standardSettings: PrayerSettings = {
        ...DEFAULT_PRAYER_SETTINGS,
        anglePreset: 'STANDARD_18_17',
        fajrAngle: 18,
        ishaAngle: 17,
    };
    return computeDay(date, lat, lng, standardSettings).times;
}

// ─── Helpers ──────────────────────────────────────────────

function getRoundingFn(rounding: Rounding): (d: Date) => Date {
    switch (rounding) {
        case 'NEAREST_MIN':
            return (d) => {
                const r = new Date(d);
                if (r.getSeconds() >= 30) r.setMinutes(r.getMinutes() + 1);
                r.setSeconds(0, 0);
                return r;
            };
        case 'CEIL_MIN':
            return (d) => {
                const r = new Date(d);
                if (r.getSeconds() > 0 || r.getMilliseconds() > 0) {
                    r.setMinutes(r.getMinutes() + 1);
                }
                r.setSeconds(0, 0);
                return r;
            };
        default:
            return (d) => d;
    }
}

export function formatTime(d: Date): string {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

/**
 * Get the difference in minutes between two Date objects.
 */
export function diffMinutes(a: Date, b: Date): number {
    return Math.round((a.getTime() - b.getTime()) / 60000);
}

/**
 * Compare user times with standard times and return deltas.
 */
export function compareWithStandard(
    userTimes: DayTimes,
    standardTimes: DayTimes
): Record<string, number> {
    const keys: (keyof DayTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const deltas: Record<string, number> = {};
    for (const k of keys) {
        deltas[k] = diffMinutes(userTimes[k] as Date, standardTimes[k] as Date);
    }
    return deltas;
}

/**
 * Format date to Hijri string (UMM AL-QURA).
 */
export function getHijriDate(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('fr-FR-u-ca-islamic-uma', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}
