import { expect, it } from 'vitest';
import type { RecallAttempt } from './hifdhJourney';
import { confirmedRecall, latestVerseAttempts } from './progressEvidence';

const attempt = (id: string, at: string, outcome: RecallAttempt['outcome'], scope: RecallAttempt['scope'] = 'verse'): RecallAttempt => ({ id, at, outcome, scope, surah: 2, ayah: 75, hints: 0, kind: 'recall' });

it('requires independent full-verse recall on separate days', () => {
    const first = attempt('a', '2026-10-01T12:00:00Z', 'independent');
    const sameDay = attempt('b', '2026-10-01T18:00:00Z', 'independent');
    const later = attempt('c', '2026-10-04T12:00:00Z', 'independent');
    expect(confirmedRecall([first, sameDay])).toHaveLength(0);
    expect(confirmedRecall([first, sameDay, later])).toHaveLength(1);
    expect(confirmedRecall([first, sameDay, later, attempt('d', '2026-10-05T12:00:00Z', 'review')])).toHaveLength(0);
});

it('does not turn a partial or uncertain attempt into mastery', () => {
    expect(latestVerseAttempts([attempt('a', '2026-10-01T12:00:00Z', 'independent', 'phrase')])).toHaveLength(0);
    expect(confirmedRecall([attempt('a', '2026-10-01T12:00:00Z', 'independent'), attempt('b', '2026-10-04T12:00:00Z', 'uncertain')])).toHaveLength(0);
});
