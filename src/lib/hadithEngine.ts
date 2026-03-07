// ─── Hadith Engine ──────────────────────────────────────
// Intelligent daily hadith selection based on Hijri calendar

import { HADITHS, type Hadith, type HadithTag } from '../data/hadiths';

// ─── Hijri Date Calculation (Approximate) ───────────────
// Uses the Umm al-Qura approximation algorithm
interface HijriDate {
    day: number;
    month: number;
    year: number;
}

const HIJRI_MONTHS_AR = [
    'مُحَرَّم', 'صَفَر', 'رَبِيعُ الأَوَّل', 'رَبِيعُ الثَّانِي',
    'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
    'رَمَضَان', 'شَوَّال', 'ذُو القِعْدَة', 'ذُو الحِجَّة'
];

const HIJRI_MONTHS_FR = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah'
];

export function getHijriDate(date: Date = new Date()): HijriDate {
    const format = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    const parts = format.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const month = parts.find(p => p.type === 'month')?.value || '1';
    const year = parts.find(p => p.type === 'year')?.value || '1445';

    return {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year.split(' ')[0], 10)
    };
}

export function getHijriMonthNameAr(month: number): string {
    return HIJRI_MONTHS_AR[month - 1] || '';
}

export function getHijriMonthNameFr(month: number): string {
    return HIJRI_MONTHS_FR[month - 1] || '';
}

export function formatHijriDate(hijri: HijriDate): string {
    return `${hijri.day} ${getHijriMonthNameFr(hijri.month)} ${hijri.year}`;
}

export function formatHijriDateAr(hijri: HijriDate): string {
    return `${hijri.day} ${getHijriMonthNameAr(hijri.month)} ${hijri.year}`;
}

// ─── Seasonal Tags ──────────────────────────────────────
// Returns relevant tags based on Hijri month, day of week, time of day
export function getSeasonalTags(date: Date = new Date()): HadithTag[] {
    const hijri = getHijriDate(date);
    const dayOfWeek = date.getDay(); // 0=Sun, 5=Fri
    const hour = date.getHours();
    const tags: HadithTag[] = [];

    // Hijri month-based tags
    switch (hijri.month) {
        case 1: tags.push('muharram'); break;
        case 7: tags.push('rajab'); break;
        case 8: tags.push('shaban'); break;
        case 9: tags.push('ramadan', 'jeune', 'priere'); break;
        case 10: tags.push('charite'); break; // Shawwal — Eid al-Fitr
        case 12: tags.push('hajj'); break;
    }

    // Dhul Hijjah first 10 days
    if (hijri.month === 12 && hijri.day <= 10) {
        tags.push('hajj', 'jeune', 'dhikr');
    }

    // Day of Arafat (9 Dhul Hijjah)
    if (hijri.month === 12 && hijri.day === 9) {
        tags.push('dua');
    }

    // Ashura (10 Muharram)
    if (hijri.month === 1 && hijri.day >= 9 && hijri.day <= 11) {
        tags.push('jeune');
    }

    // Friday
    if (dayOfWeek === 5) {
        tags.push('vendredi');
    }

    // Time of day
    if (hour >= 4 && hour < 10) {
        tags.push('matin');
    } else if (hour >= 17 || hour < 4) {
        tags.push('soir');
    }

    return [...new Set(tags)]; // deduplicate
}

// ─── Hadith of the Day ─────────────────────────────────
// Deterministic selection based on date + seasonal priority
export function getHadithOfDay(date: Date = new Date()): Hadith {
    const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const seed = hashString(dateStr);
    const seasonalTags = getSeasonalTags(date);

    // If we have seasonal tags, prioritize hadiths matching them
    if (seasonalTags.length > 0) {
        const seasonalHadiths = HADITHS.filter(h =>
            h.tags.some(t => seasonalTags.includes(t))
        );

        if (seasonalHadiths.length > 0) {
            return seasonalHadiths[seed % seasonalHadiths.length];
        }
    }

    // Fallback: general rotation
    return HADITHS[seed % HADITHS.length];
}

// ─── Get Greeting ───────────────────────────────────────
export function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return { text: 'Sabah al-Khayr', emoji: '🌅' };
    if (hour >= 12 && hour < 17) return { text: 'Masa al-Khayr', emoji: '☀️' };
    if (hour >= 17 && hour < 21) return { text: 'Masa al-Khayr', emoji: '🌇' };
    return { text: 'Layla Sa\'ida', emoji: '🌙' };
}

// ─── Simple string hash ─────────────────────────────────
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
