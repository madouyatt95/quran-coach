import { describe, it, expect } from 'vitest';
import { getAudioUrl, getSurahAudioUrl, RECITERS } from './quranApi';

describe('quranApi', () => {

    // ── getAudioUrl ────────────────────────────────────────
    describe('getAudioUrl', () => {
        it('should return a valid URL for a known reciter', () => {
            const url = getAudioUrl('ar.alafasy', 1);
            expect(url).toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3');
        });

        it('should return Alafasy URL for unknown reciter (fallback)', () => {
            const url = getAudioUrl('unknown.reciter', 42);
            expect(url).toContain('ar.alafasy');
            expect(url).toMatch(/\/42\.mp3$/);
        });

        it('should format ayah number correctly in URL', () => {
            const url = getAudioUrl('ar.husary', 255);
            expect(url).toMatch(/\/255\.mp3$/);
            expect(url).toContain('ar.husary');
        });

        it('should work for all known reciters', () => {
            for (const reciterId of Object.keys(RECITERS)) {
                const url = getAudioUrl(reciterId, 1);
                expect(url).toMatch(/\/1\.mp3$/);
                expect(url.startsWith('https://')).toBe(true);
            }
        });
    });

    // ── getSurahAudioUrl ───────────────────────────────────
    describe('getSurahAudioUrl', () => {
        it('should return a valid surah audio URL', () => {
            const url = getSurahAudioUrl('ar.alafasy', 1);
            expect(url).toBe('https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3');
        });

        it('should format surah number correctly', () => {
            const url = getSurahAudioUrl('ar.alafasy', 114);
            expect(url).toMatch(/\/114\.mp3$/);
        });
    });

    // ── RECITERS constant ──────────────────────────────────
    describe('RECITERS', () => {
        it('should contain at least 4 reciters', () => {
            expect(Object.keys(RECITERS).length).toBeGreaterThanOrEqual(4);
        });

        it('should contain Alafasy', () => {
            expect(RECITERS).toHaveProperty('ar.alafasy');
        });

        it('should have URLs starting with https', () => {
            for (const url of Object.values(RECITERS)) {
                expect(url.startsWith('https://')).toBe(true);
            }
        });
    });
});
