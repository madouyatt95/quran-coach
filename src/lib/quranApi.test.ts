import { describe, it, expect } from 'vitest';
import { getAudioUrl } from './quranApi';
import { RECITERS } from '../stores/settingsStore';

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
            const url = getAudioUrl('ar.alafasy', 255);
            expect(url).toMatch(/\/255\.mp3$/);
            expect(url).toContain('ar.alafasy');
        });

        it('should work for all known reciters', () => {
            for (const reciter of RECITERS) {
                const url = getAudioUrl(reciter.id, 1);
                expect(url).toMatch(/\/1\.mp3$/);
                expect(url.startsWith('https://')).toBe(true);
            }
        });
    });

    // ── RECITERS constant ──────────────────────────────────
    describe('RECITERS', () => {
        it('should contain Mishary Al-Afasy', () => {
            expect(RECITERS.some(r => r.id === 'ar.alafasy')).toBe(true);
        });

        it('should have quranComId 7 for Alafasy', () => {
            const alafasy = RECITERS.find(r => r.id === 'ar.alafasy');
            expect(alafasy?.quranComId).toBe(7);
        });
    });
});
