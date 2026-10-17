import { describe, it, expect } from 'vitest';
import { buildJourney, buildChallenge, mastery, exerciseWindow, weakWords, type RecallAttempt } from './hifdhJourney';
import type { Ayah } from '../types';
import type { SRSCard } from '../stores/srsStore';
const ayahs: Ayah[] = Array.from({ length: 6 }, (_, i) => ({ surah: 112, numberInSurah: i + 1, number: 6222 + i, text: 'قل هو الله أحد', juz: 30, page: 604, hizbQuarter: 240 }));
const attempt = (at: string, outcome: RecallAttempt['outcome'] = 'independent', extra: Partial<RecallAttempt> = {}): RecallAttempt => ({ id: at, at, outcome, kind: 'recall', hints: 0, surah: 112, ayah: 1, ...extra });
describe('honest memorization evidence', () => {
    it('requires days apart and never treats repeated same-day success as retention', () => {
        expect(mastery([attempt('2026-10-05T10:00:00Z'), attempt('2026-10-05T09:00:00Z')], { surah: 112, ayah: 1 })).toBe('Récité seul');
        expect(mastery([attempt('2026-10-05T10:00:00Z'), attempt('2026-10-01T09:00:00Z')], { surah: 112, ayah: 1 })).toBe('Confirmé après plusieurs jours');
    });
    it('does not let uncertainty or a partial test promote or demote whole-verse mastery', () => {
        expect(mastery([attempt('2026-10-05T10:00:00Z', 'uncertain'), attempt('2026-10-04T10:00:00Z', 'independent', { scope: 'phrase' })], { surah: 112, ayah: 1 })).toBe('En apprentissage');
    });
    it('breaks a retention chain after an unsuccessful recall', () => {
        expect(mastery([attempt('2026-10-05T10:00:00Z'), attempt('2026-10-03T10:00:00Z', 'review'), attempt('2026-10-01T09:00:00Z')], { surah: 112, ayah: 1 })).toBe('Récité seul');
    });
    it('prioritizes confirmed difficulty and due reviews, reserves new learning, avoids duplicates', () => {
        const cards = { '112:2': { id: '112:2', surah: 112, ayah: 2, nextReviewDate: '2026-10-01' } as SRSCard };
        const result = buildJourney(5, cards, [attempt('2026-10-04T10:00:00Z', 'review')], {}, ayahs, [], new Date('2026-10-05T10:00:00Z'));
        expect(result.map(p => [p.ayah, p.kind])).toEqual([[1, 'repair'], [2, 'recall'], [3, 'learn']]);
    });
    it('does not schedule a known verse as new or evaluate unknown readings', () => {
        const result = buildJourney(5, {}, [], { '112:1': { recall: 'independent', attempts: 1, lastPracticed: '2026-10-01' } }, ayahs.slice(0, 1), []);
        expect(result[0].kind).toBe('recall');
    });
    it('maps old word errors to canonical verse references across ranges', () => {
        expect(weakWords([{ scoreKey: '2:70-75', wordKey: '3-4', expected: 'x', spoken: 'y', date: '' }])).toEqual([{ surah: 2, ayah: 73, word: 4 }]);
    });
    it('returns the repair to the full verse before a mastery rating', () => {
        expect(exerciseWindow({ surah: 112, ayah: 1, kind: 'repair', word: 0, reason: '' }, ayahs[0], 0)).toEqual({ start: 0, end: 3 });
        expect(exerciseWindow({ surah: 112, ayah: 1, kind: 'repair', word: 0, reason: '' }, ayahs[0], 3)).toEqual({ start: 0, end: 4 });
    });
    it('targets difficulties in tests and includes different recall tasks', () => {
        const exercises = buildChallenge(ayahs, [attempt('2026-10-05', 'review', { ayah: 4 })], () => .5);
        expect(exercises[0].ayah).toBe(4);
        expect(new Set(exercises.map(e => e.kind)).size).toBe(3);
        expect(new Set(exercises.map(e => e.ayah)).size).toBe(exercises.length);
    });
});
