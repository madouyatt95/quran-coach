import { describe, it, expect } from 'vitest';
import { getHijriDate, getHijriMonthNameAr, getHijriMonthNameFr, formatHijriDate, getSeasonalTags, getHadithOfDay, getGreeting } from './hadithEngine';

describe('hadithEngine', () => {

    // ── getHijriDate ───────────────────────────────────────
    describe('getHijriDate', () => {
        it('should return a valid Hijri date object', () => {
            const hijri = getHijriDate(new Date('2026-02-16'));
            expect(hijri).toHaveProperty('day');
            expect(hijri).toHaveProperty('month');
            expect(hijri).toHaveProperty('year');
        });

        it('should return day between 1 and 30', () => {
            const hijri = getHijriDate(new Date('2026-02-16'));
            expect(hijri.day).toBeGreaterThanOrEqual(1);
            expect(hijri.day).toBeLessThanOrEqual(30);
        });

        it('should return month between 1 and 12', () => {
            const hijri = getHijriDate(new Date('2026-02-16'));
            expect(hijri.month).toBeGreaterThanOrEqual(1);
            expect(hijri.month).toBeLessThanOrEqual(12);
        });

        it('should return a reasonable Hijri year', () => {
            const hijri = getHijriDate(new Date('2026-02-16'));
            // 2026 CE ≈ 1447-1448 AH
            expect(hijri.year).toBeGreaterThanOrEqual(1440);
            expect(hijri.year).toBeLessThanOrEqual(1460);
        });

        it('should give different dates for different Gregorian dates', () => {
            const h1 = getHijriDate(new Date('2026-01-01'));
            const h2 = getHijriDate(new Date('2026-06-01'));
            expect(h1.month !== h2.month || h1.day !== h2.day).toBe(true);
        });
    });

    // ── Month names ────────────────────────────────────────
    describe('getHijriMonthNameAr', () => {
        it('should return Arabic name for month 1 (Muharram)', () => {
            const name = getHijriMonthNameAr(1);
            expect(name).toBe('مُحَرَّم');
        });

        it('should return Arabic name for month 9 (Ramadan)', () => {
            const name = getHijriMonthNameAr(9);
            expect(name).toBe('رَمَضَان');
        });

        it('should return empty string for invalid month', () => {
            expect(getHijriMonthNameAr(0)).toBe('');
            expect(getHijriMonthNameAr(13)).toBe('');
        });
    });

    describe('getHijriMonthNameFr', () => {
        it('should return French name for month 9 (Ramadan)', () => {
            expect(getHijriMonthNameFr(9)).toBe('Ramadan');
        });

        it('should return French name for month 12 (Dhul Hijjah)', () => {
            expect(getHijriMonthNameFr(12)).toBe('Dhul Hijjah');
        });
    });

    // ── formatHijriDate ────────────────────────────────────
    describe('formatHijriDate', () => {
        it('should format a Hijri date in French', () => {
            const formatted = formatHijriDate({ day: 15, month: 9, year: 1447 });
            expect(formatted).toBe('15 Ramadan 1447');
        });
    });

    // ── getSeasonalTags ────────────────────────────────────
    describe('getSeasonalTags', () => {
        it('should return an array', () => {
            const tags = getSeasonalTags(new Date('2026-02-16T10:00:00'));
            expect(Array.isArray(tags)).toBe(true);
        });

        it('should return "matin" tag for morning hours', () => {
            const tags = getSeasonalTags(new Date('2026-02-16T07:00:00'));
            expect(tags).toContain('matin');
        });

        it('should return "soir" tag for evening hours', () => {
            const tags = getSeasonalTags(new Date('2026-02-16T20:00:00'));
            expect(tags).toContain('soir');
        });

        it('should return "vendredi" tag on Fridays', () => {
            // 2026-02-20 is a Friday
            const tags = getSeasonalTags(new Date('2026-02-20T12:00:00'));
            expect(tags).toContain('vendredi');
        });

        it('should not contain duplicates', () => {
            const tags = getSeasonalTags(new Date('2026-02-16T07:00:00'));
            expect(new Set(tags).size).toBe(tags.length);
        });
    });

    // ── getHadithOfDay ─────────────────────────────────────
    describe('getHadithOfDay', () => {
        it('should return a valid hadith object', () => {
            const hadith = getHadithOfDay(new Date('2026-02-16'));
            expect(hadith).toHaveProperty('id');
            expect(hadith).toHaveProperty('textAr');
            expect(hadith).toHaveProperty('textFr');
            expect(hadith).toHaveProperty('source');
        });

        it('should be deterministic for the same date', () => {
            const h1 = getHadithOfDay(new Date('2026-02-16'));
            const h2 = getHadithOfDay(new Date('2026-02-16'));
            expect(h1.id).toBe(h2.id);
        });

        it('should return different hadiths for different dates', () => {
            const h1 = getHadithOfDay(new Date('2026-02-16'));
            const h2 = getHadithOfDay(new Date('2026-06-20'));
            // Very high probability of being different
            expect(h1.id).not.toBe(h2.id);
        });
    });

    // ── getGreeting ────────────────────────────────────────
    describe('getGreeting', () => {
        it('should return an object with text and emoji', () => {
            const greeting = getGreeting();
            expect(greeting).toHaveProperty('text');
            expect(greeting).toHaveProperty('emoji');
            expect(typeof greeting.text).toBe('string');
            expect(typeof greeting.emoji).toBe('string');
        });
    });
});
