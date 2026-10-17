import type { RecallAttempt } from './hifdhJourney';

export function latestVerseAttempts(attempts: RecallAttempt[]): RecallAttempt[] {
    const latest = new Map<string, RecallAttempt>();
    for (const attempt of [...attempts].sort((a, b) => b.at.localeCompare(a.at))) {
        if (attempt.scope === 'phrase' || attempt.outcome === 'uncertain') continue;
        const key = `${attempt.surah}:${attempt.ayah}`;
        if (!latest.has(key)) latest.set(key, attempt);
    }
    return [...latest.values()];
}

export function confirmedRecall(attempts: RecallAttempt[]): RecallAttempt[] {
    return latestVerseAttempts(attempts).filter(latest => {
        if (latest.outcome !== 'independent') return false;
        const previous = attempts
            .filter(a => a.surah === latest.surah && a.ayah === latest.ayah && a.scope !== 'phrase' && a.at < latest.at)
            .sort((a, b) => b.at.localeCompare(a.at));
        for (const attempt of previous) {
            if (attempt.outcome !== 'independent') break;
            if (Date.parse(latest.at) - Date.parse(attempt.at) >= 3 * 86400000) return true;
        }
        return false;
    });
}
