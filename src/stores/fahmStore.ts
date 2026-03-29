import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Fahm Store — Vocabulaire SRS + Parcours Thématiques ─────

interface WordProgress {
    level: number;        // 0=jamais vu, 1-5=SRS levels
    nextReview: number;   // timestamp
    correctCount: number;
    wrongCount: number;
    lastReviewed: number; // timestamp
}

interface FahmState {
    // ── Vocabulaire SRS ──
    learnedWords: Record<number, WordProgress>;

    // ── Parcours ──
    activePath: string | null;
    pathProgress: Record<string, number[]>; // pathId → completed day numbers

    // ── Stats ──
    totalWordsLearned: number;  // Words with level >= 1
    totalReviews: number;

    // ── Derniers versets consultés ──
    lastFahmVerses: Array<{ surah: number; ayah: number; timestamp: number }>;

    // ── Actions ──
    markWordReviewed: (wordId: number, correct: boolean) => void;
    resetWord: (wordId: number) => void;
    getWordsForReview: () => number[];
    startPath: (pathId: string) => void;
    completePathDay: (pathId: string, day: number) => void;
    abandonPath: () => void;
    recordFahmView: (surah: number, ayah: number) => void;
}

// SRS intervals in hours: [4h, 1d, 3d, 7d, 14d]
const SRS_INTERVALS = [4, 24, 72, 168, 336];

export const useFahmStore = create<FahmState>()(
    persist(
        (set, get) => ({
            learnedWords: {},
            activePath: null,
            pathProgress: {},
            totalWordsLearned: 0,
            totalReviews: 0,
            lastFahmVerses: [],

            markWordReviewed: (wordId, correct) => set(state => {
                const current = state.learnedWords[wordId] || {
                    level: 0,
                    nextReview: 0,
                    correctCount: 0,
                    wrongCount: 0,
                    lastReviewed: 0,
                };

                const newLevel = correct
                    ? Math.min(5, current.level + 1)
                    : Math.max(0, current.level - 1);

                const intervalHours = SRS_INTERVALS[Math.min(newLevel - 1, SRS_INTERVALS.length - 1)] || 4;
                const nextReview = Date.now() + intervalHours * 60 * 60 * 1000;

                const updated: WordProgress = {
                    level: newLevel,
                    nextReview,
                    correctCount: current.correctCount + (correct ? 1 : 0),
                    wrongCount: current.wrongCount + (correct ? 0 : 1),
                    lastReviewed: Date.now(),
                };

                const newLearned = { ...state.learnedWords, [wordId]: updated };
                const totalWordsLearned = Object.values(newLearned).filter(w => w.level >= 1).length;

                return {
                    learnedWords: newLearned,
                    totalWordsLearned,
                    totalReviews: state.totalReviews + 1,
                };
            }),

            resetWord: (wordId) => set(state => {
                const { [wordId]: _, ...rest } = state.learnedWords;
                const totalWordsLearned = Object.values(rest).filter(w => w.level >= 1).length;
                return { learnedWords: rest, totalWordsLearned };
            }),

            getWordsForReview: () => {
                const { learnedWords } = get();
                const now = Date.now();
                return Object.entries(learnedWords)
                    .filter(([, progress]) => progress.level > 0 && progress.nextReview <= now)
                    .sort(([, a], [, b]) => a.nextReview - b.nextReview)
                    .map(([id]) => parseInt(id));
            },

            startPath: (pathId) => set(state => ({
                activePath: pathId,
                pathProgress: {
                    ...state.pathProgress,
                    [pathId]: state.pathProgress[pathId] || [],
                },
            })),

            completePathDay: (pathId, day) => set(state => {
                const current = state.pathProgress[pathId] || [];
                if (current.includes(day)) return state;
                return {
                    pathProgress: {
                        ...state.pathProgress,
                        [pathId]: [...current, day].sort((a, b) => a - b),
                    },
                };
            }),

            abandonPath: () => set({ activePath: null }),

            recordFahmView: (surah, ayah) => set(state => {
                const entry = { surah, ayah, timestamp: Date.now() };
                const updated = [entry, ...state.lastFahmVerses].slice(0, 20);
                return { lastFahmVerses: updated };
            }),
        }),
        {
            name: 'quran-coach-fahm',
            partialize: (state) => ({
                learnedWords: state.learnedWords,
                activePath: state.activePath,
                pathProgress: state.pathProgress,
                totalWordsLearned: state.totalWordsLearned,
                totalReviews: state.totalReviews,
                lastFahmVerses: state.lastFahmVerses,
            }),
        }
    )
);
