/**
 * Unit tests for prayerEngine.ts
 */
import { describe, it, expect } from 'vitest';
import { computeDay, computeStandard, compareWithStandard, DEFAULT_PRAYER_SETTINGS, ANGLE_PRESETS, type PrayerSettings } from './prayerEngine';

// Paris coordinates
const PARIS = { lat: 48.8566, lng: 2.3522 };

describe('prayerEngine', () => {
    describe('computeDay', () => {
        it('should return chronologically ordered prayer times for Paris', () => {
            const date = new Date(2026, 1, 17); // Feb 17, 2026
            const result = computeDay(date, PARIS.lat, PARIS.lng, DEFAULT_PRAYER_SETTINGS);

            const { fajr, sunrise, dhuhr, asr, maghrib, isha } = result.times;

            expect(fajr.getTime()).toBeLessThan(sunrise.getTime());
            expect(sunrise.getTime()).toBeLessThan(dhuhr.getTime());
            expect(dhuhr.getTime()).toBeLessThan(asr.getTime());
            expect(asr.getTime()).toBeLessThan(maghrib.getTime());
            expect(maghrib.getTime()).toBeLessThan(isha.getTime());
        });

        it('should produce valid times for multiple dates', () => {
            const dates = [
                new Date(2026, 0, 1),  // Jan 1 (winter)
                new Date(2026, 2, 21), // Mar 21 (equinox)
                new Date(2026, 5, 21), // Jun 21 (summer solstice)
                new Date(2026, 8, 21), // Sep 21 (equinox)
                new Date(2026, 11, 21), // Dec 21 (winter solstice)
            ];

            for (const date of dates) {
                const result = computeDay(date, PARIS.lat, PARIS.lng, DEFAULT_PRAYER_SETTINGS);
                expect(result.date).toBeTruthy();
                expect(result.formattedTimes.fajr).toMatch(/^\d{2}:\d{2}$/);
                expect(result.formattedTimes.isha).toMatch(/^\d{2}:\d{2}$/);
            }
        });

        it('should return correct date string in YYYY-MM-DD format', () => {
            const date = new Date(2026, 1, 17);
            const result = computeDay(date, PARIS.lat, PARIS.lng, DEFAULT_PRAYER_SETTINGS);
            expect(result.date).toBe('2026-02-17');
        });
    });

    describe('ANGLE_PRESETS', () => {
        it('STANDARD_18_17 should have fajr=18, isha=17', () => {
            const preset = ANGLE_PRESETS.STANDARD_18_17;
            expect(preset.fajrAngle).toBe(18);
            expect(preset.ishaAngle).toBe(17);
        });

        it('ANCIENTS should have fajr=18, isha=18', () => {
            const preset = ANGLE_PRESETS.ANCIENTS;
            expect(preset.fajrAngle).toBe(18);
            expect(preset.ishaAngle).toBe(18);
        });

        it('ABU_ALI_MURRAKUCHI should have fajr=20, isha=16', () => {
            const preset = ANGLE_PRESETS.ABU_ALI_MURRAKUCHI;
            expect(preset.fajrAngle).toBe(20);
            expect(preset.ishaAngle).toBe(16);
        });
    });

    describe('adjustments', () => {
        it('should apply positive fajr adjustment', () => {
            const date = new Date(2026, 1, 17);
            const baseResult = computeDay(date, PARIS.lat, PARIS.lng, DEFAULT_PRAYER_SETTINGS);

            const adjustedSettings: PrayerSettings = {
                ...DEFAULT_PRAYER_SETTINGS,
                adjustmentsMin: { ...DEFAULT_PRAYER_SETTINGS.adjustmentsMin, fajr: 5 },
            };
            const adjustedResult = computeDay(date, PARIS.lat, PARIS.lng, adjustedSettings);

            // Fajr should be ~5 minutes later
            const diffMs = adjustedResult.times.fajr.getTime() - baseResult.times.fajr.getTime();
            const diffMinutes = Math.round(diffMs / 60000);
            expect(diffMinutes).toBeGreaterThanOrEqual(4);
            expect(diffMinutes).toBeLessThanOrEqual(6);
        });
    });

    describe('compareWithStandard', () => {
        it('should return zero deltas when using standard settings', () => {
            const date = new Date(2026, 1, 17);
            const result = computeDay(date, PARIS.lat, PARIS.lng, DEFAULT_PRAYER_SETTINGS);
            const standard = computeStandard(date, PARIS.lat, PARIS.lng);
            const deltas = compareWithStandard(result.times, standard);

            // All deltas should be 0 or very close (±1 due to rounding)
            for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
                expect(Math.abs(deltas[key])).toBeLessThanOrEqual(1);
            }
        });

        it('should show non-zero deltas with different angles', () => {
            const date = new Date(2026, 1, 17);
            const customSettings: PrayerSettings = {
                ...DEFAULT_PRAYER_SETTINGS,
                anglePreset: 'CUSTOM',
                fajrAngle: 20,
                ishaAngle: 15,
            };
            const result = computeDay(date, PARIS.lat, PARIS.lng, customSettings);
            const standard = computeStandard(date, PARIS.lat, PARIS.lng);
            const deltas = compareWithStandard(result.times, standard);

            // With a higher fajr angle (20° vs 18°), fajr should be earlier (negative delta)
            expect(deltas.fajr).toBeLessThan(0);
            // With a lower isha angle (15° vs 17°), isha should be earlier (negative delta)
            expect(deltas.isha).toBeLessThan(0);
        });
    });
});
