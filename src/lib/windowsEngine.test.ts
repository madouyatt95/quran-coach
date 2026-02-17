/**
 * Unit tests for windowsEngine.ts
 */
import { describe, it, expect } from 'vitest';
import { computeWindows, computeNightDuration } from './windowsEngine';
import { computeDay, DEFAULT_PRAYER_SETTINGS, type PrayerSettings } from './prayerEngine';

// Paris coordinates
const PARIS = { lat: 48.8566, lng: 2.3522 };

function getTestData(settings: PrayerSettings = DEFAULT_PRAYER_SETTINGS) {
    const date = new Date(2026, 1, 17); // Feb 17, 2026
    const tomorrow = new Date(2026, 1, 18);
    const today = computeDay(date, PARIS.lat, PARIS.lng, settings);
    const tomorrowResult = computeDay(tomorrow, PARIS.lat, PARIS.lng, settings);
    return { today, tomorrowFajr: tomorrowResult.times.fajr, settings };
}

describe('windowsEngine', () => {
    describe('computeNightDuration', () => {
        it('should compute positive night duration', () => {
            const maghrib = new Date(2026, 1, 17, 17, 58); // 17:58
            const fajr = new Date(2026, 1, 18, 6, 25);     // 06:25 next day
            const duration = computeNightDuration(maghrib, fajr);
            expect(duration).toBeGreaterThan(0);
            expect(duration).toBeLessThan(24 * 60); // Less than 24 hours
            // Expected: ~747 minutes (12h27)
            expect(duration).toBeGreaterThan(600);
            expect(duration).toBeLessThan(900);
        });
    });

    describe('computeWindows', () => {
        it('should compute valid Sobh window', () => {
            const { today, tomorrowFajr, settings } = getTestData();
            const windows = computeWindows(today.times, tomorrowFajr, settings);

            // Sobh: start = fajr
            expect(windows.sobh.start.getTime()).toBe(today.times.fajr.getTime());
            // endDaruri = sunrise
            expect(windows.sobh.endDaruri.getTime()).toBe(today.times.sunrise.getTime());
            // endIkhtiyari should be between fajr and sunrise
            expect(windows.sobh.endIkhtiyari.getTime()).toBeGreaterThanOrEqual(today.times.fajr.getTime());
            expect(windows.sobh.endIkhtiyari.getTime()).toBeLessThanOrEqual(today.times.sunrise.getTime());
            // startDaruri = endIkhtiyari
            expect(windows.sobh.startDaruri.getTime()).toBe(windows.sobh.endIkhtiyari.getTime());
        });

        it('should compute valid Asr window', () => {
            const { today, tomorrowFajr, settings } = getTestData();
            const windows = computeWindows(today.times, tomorrowFajr, settings);

            // Asr: start = asr
            expect(windows.asr.start.getTime()).toBe(today.times.asr.getTime());
            // endDaruri = maghrib
            expect(windows.asr.endDaruri.getTime()).toBe(today.times.maghrib.getTime());
            // endIkhtiyari between asr and maghrib
            expect(windows.asr.endIkhtiyari.getTime()).toBeGreaterThanOrEqual(today.times.asr.getTime());
            expect(windows.asr.endIkhtiyari.getTime()).toBeLessThanOrEqual(today.times.maghrib.getTime());
        });

        describe('Isha THIRD_NIGHT', () => {
            it('should set endIkhtiyari to maghrib + nightDuration/3', () => {
                const { today, tomorrowFajr, settings } = getTestData({
                    ...DEFAULT_PRAYER_SETTINGS,
                    ishaIkhtiyari: 'THIRD_NIGHT',
                });
                const windows = computeWindows(today.times, tomorrowFajr, settings);

                const expectedEndMs = today.times.maghrib.getTime()
                    + Math.round(windows.nightDurationMin / 3) * 60000;
                const expectedEnd = new Date(expectedEndMs);

                // Allow 1 minute tolerance
                const diffMin = Math.abs(windows.isha.endIkhtiyari.getTime() - expectedEnd.getTime()) / 60000;
                expect(diffMin).toBeLessThanOrEqual(2);
            });
        });

        describe('Isha HALF_NIGHT', () => {
            it('should set endIkhtiyari to maghrib + nightDuration/2', () => {
                const { today, tomorrowFajr, settings } = getTestData({
                    ...DEFAULT_PRAYER_SETTINGS,
                    ishaIkhtiyari: 'HALF_NIGHT',
                });
                const windows = computeWindows(today.times, tomorrowFajr, settings);

                const expectedEndMs = today.times.maghrib.getTime()
                    + Math.round(windows.nightDurationMin / 2) * 60000;
                const expectedEnd = new Date(expectedEndMs);

                // Allow 1 minute tolerance
                const diffMin = Math.abs(windows.isha.endIkhtiyari.getTime() - expectedEnd.getTime()) / 60000;
                expect(diffMin).toBeLessThanOrEqual(2);
            });

            it('HALF_NIGHT should be later than THIRD_NIGHT', () => {
                const { today, tomorrowFajr } = getTestData();

                const thirdSettings: PrayerSettings = { ...DEFAULT_PRAYER_SETTINGS, ishaIkhtiyari: 'THIRD_NIGHT' };
                const halfSettings: PrayerSettings = { ...DEFAULT_PRAYER_SETTINGS, ishaIkhtiyari: 'HALF_NIGHT' };

                const thirdWindows = computeWindows(today.times, tomorrowFajr, thirdSettings);
                const halfWindows = computeWindows(today.times, tomorrowFajr, halfSettings);

                expect(halfWindows.isha.endIkhtiyari.getTime()).toBeGreaterThan(thirdWindows.isha.endIkhtiyari.getTime());
            });
        });

        describe('custom offset rules', () => {
            it('Sobh custom offset should set endIkhtiyari = sunrise - X min', () => {
                const customSettings: PrayerSettings = {
                    ...DEFAULT_PRAYER_SETTINGS,
                    sobhIkhtiyariRule: { type: 'CUSTOM_OFFSET_MIN', minutes: 20 },
                };
                const { today, tomorrowFajr } = getTestData(customSettings);
                const windows = computeWindows(today.times, tomorrowFajr, customSettings);

                const expectedMs = today.times.sunrise.getTime() - 20 * 60000;
                const diffMin = Math.abs(windows.sobh.endIkhtiyari.getTime() - expectedMs) / 60000;
                expect(diffMin).toBeLessThanOrEqual(1);
            });

            it('Asr custom offset should set endIkhtiyari = maghrib - X min', () => {
                const customSettings: PrayerSettings = {
                    ...DEFAULT_PRAYER_SETTINGS,
                    asrIkhtiyariRule: { type: 'CUSTOM_OFFSET_MIN', minutes: 15 },
                };
                const { today, tomorrowFajr } = getTestData(customSettings);
                const windows = computeWindows(today.times, tomorrowFajr, customSettings);

                const expectedMs = today.times.maghrib.getTime() - 15 * 60000;
                const diffMin = Math.abs(windows.asr.endIkhtiyari.getTime() - expectedMs) / 60000;
                expect(diffMin).toBeLessThanOrEqual(1);
            });
        });
    });
});
