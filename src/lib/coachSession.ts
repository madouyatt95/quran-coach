export interface CoachAssessment {
    state: 'correct' | 'error' | 'dismissed' | 'unread';
    expected: string;
    spoken: string;
}
export interface CoachReviewEntry {
    scoreKey: string;
    wordKey: string;
    expected: string;
    spoken: string;
    date: string;
}
export const COACH_REVIEW_EVENT = 'quran-coach-review-updated';
export const COACH_ERROR_KEY = 'hifdh-error-log';
export type CoachAssessments = Record<string, CoachAssessment>;

export function coachTotals(assessments: CoachAssessments) {
    const evaluated = Object.values(assessments).filter(item => item.state === 'correct' || item.state === 'error');
    const mistakes = evaluated.filter(item => item.state === 'error').length;
    return {
        processed: evaluated.length,
        mistakes,
        accuracy: evaluated.length ? Math.round((evaluated.length - mistakes) / evaluated.length * 100) : 0,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readCoachReviews(storage: Pick<Storage, 'getItem'>): CoachReviewEntry[] {
    const value: unknown = JSON.parse(storage.getItem(COACH_ERROR_KEY) || '[]');
    if (!Array.isArray(value) || !value.every(item => isRecord(item)
        && ['scoreKey', 'wordKey', 'expected', 'spoken', 'date'].every(key => typeof item[key] === 'string'))) {
        throw new Error('Invalid review history');
    }
    return value as CoachReviewEntry[];
}

/** Merge only assessed words. Unread words and unrelated legacy history remain untouched. */
export function persistCoachSession(storage: Pick<Storage, 'getItem' | 'setItem'>,
    scoreKey: string, assessments: CoachAssessments, totalWords: number): boolean {
    if (!Object.keys(assessments).length) return true;
    try {
        const previous = readCoachReviews(storage);
        const scores: unknown = JSON.parse(storage.getItem('quran-coach-scores') || '{}');
        // Never replace malformed saved data with an empty object.
        if (!isRecord(scores)) return false;
        const date = new Date().toISOString();
        const reviewedKeys = new Set(Object.keys(assessments));
        const merged = previous.filter(item => item.scoreKey !== scoreKey || !reviewedKeys.has(item.wordKey));
        for (const [wordKey, item] of Object.entries(assessments)) {
            if (item.state === 'error') merged.push({ scoreKey, wordKey, expected: item.expected, spoken: item.spoken, date });
        }
        storage.setItem(COACH_ERROR_KEY, JSON.stringify(merged.slice(-200)));
        const totals = coachTotals(assessments);
        scores[scoreKey] = { ...totals, totalWords, complete: totals.processed === totalWords, kind: 'recognition', date };
        storage.setItem('quran-coach-scores', JSON.stringify(scores));
        return true;
    } catch {
        return false;
    }
}
