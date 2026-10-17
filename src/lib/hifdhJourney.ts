import type { Ayah } from '../types';
import type { SRSCard } from '../stores/srsStore';
import type { LearningRecord, Passage } from './learning';
import { localDay, passageKey } from './learning';
import type { CoachReviewEntry } from './coachSession';
import { recitationWords } from './recitationMatching';
export type RecallOutcome = 'independent' | 'assisted' | 'self-corrected' | 'review' | 'uncertain';
export type ExerciseKind = 'learn' | 'repair' | 'recall' | 'middle' | 'ending' | 'transition';
export interface RecallAttempt extends Passage {
    id: string;
    at: string;
    outcome: RecallOutcome;
    hints: number;
    kind: ExerciseKind;
    scope?: 'phrase' | 'verse';
}
export interface JourneyExercise extends Passage {
    kind: ExerciseKind;
    word?: number;
    reason: string;
}
export interface JourneyPlan {
    day: string;
    updatedAt?: number;
    minutes: 5 | 10 | 20;
    exercises: JourneyExercise[];
    cursor: number;
    phase: number;
    hints?: number;
    reviewed?: boolean;
}
export const outcomeLabels: Record<RecallOutcome, string> = { independent: 'Récité seul', assisted: 'Avec aide', 'self-corrected': 'Autocorrection', review: 'À consolider', uncertain: 'Non évalué' };
export function mastery(attempts: RecallAttempt[], p: Passage, record?: LearningRecord) {
    const relevant = attempts.filter(a => passageKey(a) === passageKey(p) && a.outcome !== 'uncertain' && a.scope !== 'phrase').sort((a, b) => b.at.localeCompare(a.at));
    const last = relevant[0];
    if (!last)
        return record?.recall === 'independent' ? 'Rappel déclaré sans aide' : record?.recall === 'assisted' ? 'Récité avec aide' : record?.recall === 'consolidate' ? 'À consolider' : 'En apprentissage';
    if (last.outcome === 'review' || last.outcome === 'self-corrected')
        return 'À consolider';
    if (last.outcome === 'assisted')
        return 'Récité avec aide';
    // A failure breaks the evidence chain. Same-day repetitions cannot establish retention.
    const failure = relevant.findIndex(a => a.outcome !== 'independent');
    const successes = failure < 0 ? relevant : relevant.slice(0, failure);
    return successes.some(a => Date.parse(last.at) - Date.parse(a.at) >= 3 * 86400000) ? 'Confirmé après plusieurs jours' : 'Récité seul';
}
export function weakWords(entries: CoachReviewEntry[]): Array<Passage & {
    word: number;
}> {
    return entries.flatMap(e => {
        const match = /^(\d+):(\d+)-(\d+)$/.exec(e.scoreKey), word = /^(\d+)-(\d+)$/.exec(e.wordKey);
        if (!match || !word)
            return [];
        const ayah = Number(match[2]) + Number(word[1]);
        return ayah <= Number(match[3]) ? [{ surah: Number(match[1]), ayah, word: Number(word[2]) }] : [];
    });
}
export function buildJourney(minutes: 5 | 10 | 20, cards: Record<string, SRSCard>, attempts: RecallAttempt[], records: Record<string, LearningRecord>, selected: Ayah[], errors: CoachReviewEntry[], now = new Date()): JourneyExercise[] {
    const today = localDay(now), budget = minutes === 5 ? 3 : minutes === 10 ? 5 : 9;
    const result: JourneyExercise[] = [], seen = new Set<string>();
    const add = (p: JourneyExercise) => { const key = passageKey(p); if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
    } };
    const latest = new Map<string, RecallAttempt>();
    for (const a of [...attempts].sort((a, b) => b.at.localeCompare(a.at)))
        if (a.outcome !== 'uncertain' && !latest.has(passageKey(a)))
            latest.set(passageKey(a), a);
    const weak = weakWords(errors);
    for (const a of latest.values())
        if (['review', 'assisted', 'self-corrected'].includes(a.outcome))
            add({ ...a, kind: 'repair', word: weak.find(w => passageKey(w) === passageKey(a))?.word, reason: 'Difficulté confirmée à consolider' });
    for (const c of Object.values(cards).filter(c => c.nextReviewDate <= today).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)))
        add({ ...c, kind: 'recall', reason: 'Révision arrivée à échéance' });
    for (const a of latest.values())
        if (a.outcome === 'independent' && now.getTime() - Date.parse(a.at) >= 3 * 86400000)
            add({ ...a, kind: 'recall', reason: 'Vérifier la tenue dans le temps' });
    for (const p of weak)
        add({ ...p, kind: 'repair', reason: 'Signalement vocal à vérifier' });
    // Reserve one slot for new learning when available; never call a known verse new.
    const fresh = selected.find(a => !latest.has(`${a.surah}:${a.numberInSurah}`) && !records[`${a.surah}:${a.numberInSurah}`] && !cards[`${a.surah}:${a.numberInSurah}`] && !seen.has(`${a.surah}:${a.numberInSurah}`));
    const planned = result.slice(0, budget - (fresh ? 1 : 0));
    if (fresh)
        planned.push({ surah: fresh.surah, ayah: fresh.numberInSurah, kind: 'learn', reason: 'Nouveau verset du passage choisi' });
    for (const a of selected) {
        if (planned.length >= budget)
            break;
        if (!planned.some(p => p.surah === a.surah && p.ayah === a.numberInSurah))
            planned.push({ surah: a.surah, ayah: a.numberInSurah, kind: records[`${a.surah}:${a.numberInSurah}`] || cards[`${a.surah}:${a.numberInSurah}`] ? 'recall' : 'learn', reason: 'Votre passage sélectionné' });
    }
    return planned;
}
export function buildChallenge(verses: Ayah[], attempts: RecallAttempt[], random = Math.random): JourneyExercise[] {
    const latest = new Map<string, RecallAttempt>();
    for (const a of [...attempts].sort((a, b) => b.at.localeCompare(a.at)))
        if (a.outcome !== 'uncertain' && !latest.has(passageKey(a)))
            latest.set(passageKey(a), a);
    const ranked = verses.map(a => ({ a, rank: random() + (latest.get(`${a.surah}:${a.numberInSurah}`)?.outcome === 'review' ? 3 : 0) })).sort((a, b) => b.rank - a.rank).slice(0, 5);
    return ranked.map(({ a }, i) => ({ surah: a.surah, ayah: a.numberInSurah, kind: i % 3 === 0 ? 'middle' : i % 3 === 1 ? 'ending' : 'transition', reason: i % 3 === 0 ? 'Reprendre au milieu du verset' : i % 3 === 1 ? 'Retrouver la fin du verset' : 'Enchaîner avec le verset suivant' }));
}
export function exerciseWindow(exercise: JourneyExercise, ayah: Ayah, phase: number) {
    const length = recitationWords(ayah.text).length;
    if (exercise.kind === 'repair' && phase < 3) {
        const word = Math.min(length - 1, Math.max(0, exercise.word ?? 0));
        return { start: Math.max(0, word - 2), end: Math.min(length, word + 3) };
    }
    if (exercise.kind === 'middle')
        return { start: Math.floor(length / 2), end: length };
    if (exercise.kind === 'ending')
        return { start: Math.max(0, length - 4), end: length };
    return { start: 0, end: length };
}
