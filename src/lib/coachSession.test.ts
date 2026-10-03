import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../test/memoryStorage';
import { persistCoachSession, readCoachReviews, coachTotals, type CoachReviewEntry } from './coachSession';
let localStorage: Storage;
beforeEach(() => { localStorage = createMemoryStorage(); });
const entry: CoachReviewEntry = { scoreKey: '1:1-2', wordKey: '0-0', expected: 'بسم', spoken: 'خطأ', date: '2026-01-01' };
describe('session persistence', () => {
    it('preserves unrelated history and legacy scores when saving a partial session', () => {
        localStorage.setItem('hifdh-error-log', JSON.stringify([entry]));
        localStorage.setItem('quran-coach-scores', JSON.stringify({ legacy: { accuracy: 90, date: '2026-01-01' } }));
        expect(persistCoachSession(localStorage, '112:1-2', { '0-0': { state: 'error', expected: 'قل', spoken: 'خطأ' } }, 6)).toBe(true);
        expect(readCoachReviews(localStorage)).toHaveLength(2);
        expect(JSON.parse(localStorage.getItem('quran-coach-scores')!).legacy.accuracy).toBe(90);
    });
    it('removes only retried, recognized or dismissed words', () => {
        localStorage.setItem('hifdh-error-log', JSON.stringify([entry, { ...entry, wordKey: '0-1' }]));
        persistCoachSession(localStorage, '1:1-2', { '0-0': { state: 'correct', expected: 'بسم', spoken: 'بسم' } }, 6);
        expect(readCoachReviews(localStorage).map(item => item.wordKey)).toEqual(['0-1']);
    });
    it('preserves malformed stored data rather than silently discarding it', () => {
        localStorage.setItem('hifdh-error-log', 'broken-json');
        expect(persistCoachSession(localStorage, '1:1', { '0-0': { state: 'error', expected: 'قل', spoken: 'خطأ' } }, 4)).toBe(false);
        expect(localStorage.getItem('hifdh-error-log')).toBe('broken-json');
    });
    it('does not count dismissed or retracted hypotheses as correct', () => {
        expect(coachTotals({ '0-0': { state: 'dismissed', expected: 'قل', spoken: 'خطأ' }, '0-1': { state: 'unread', expected: 'هو', spoken: '' } })).toMatchObject({ processed: 0, mistakes: 0, accuracy: 0 });
    });
    it('clears the saved count when the only recognized result is retracted', () => {
        persistCoachSession(localStorage, '1:1', { '0-0': { state: 'error', expected: 'قل', spoken: 'خطأ' } }, 4);
        persistCoachSession(localStorage, '1:1', { '0-0': { state: 'unread', expected: 'قل', spoken: '' } }, 4);
        expect(readCoachReviews(localStorage)).toEqual([]);
        expect(JSON.parse(localStorage.getItem('quran-coach-scores')!)['1:1']).toMatchObject({ processed: 0, mistakes: 0, complete: false });
    });
});
