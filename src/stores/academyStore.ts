// ─── Academy Store (Premium Redesign) ────────────────────
// Tracks user progress through the 2-level Academy modules

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModuleProgress {
    completed: boolean;
    score: number; // 0-100
    completedAt?: number;
    // Feature 1: Saved position for resume
    lastContentIdx?: number;
    lastSectionIdx?: number;
    lastVisitedAt?: number;
    // Feature 3: Spaced repetition
    reviewDue?: number; // timestamp when review is due
    reviewCount?: number;
}

interface AcademyState {
    currentModule: string | null;
    progress: Record<string, ModuleProgress>;
    unlockedModules: string[];
    totalXp: number;

    // Actions
    completeModule: (moduleId: string, score: number) => void;
    unlockModule: (moduleId: string) => void;
    setCurrentModule: (moduleId: string | null) => void;
    resetProgress: () => void;
    // Feature 1: Save & resume position
    savePosition: (moduleId: string, contentIdx: number, sectionIdx: number) => void;
    // Feature 3: Spaced repetition
    markReviewed: (moduleId: string) => void;
    getModulesForReview: () => string[];
}

// Initial unlocked modules (Level 1 = fully open, Level 2 = locked until prerequisites)
const INITIAL_UNLOCKED = [
    'bases-islam',
    'wudu-fondamental',
    'priere-pas-a-pas',
    'alphabet-arabe',
    'sourates-courtes',
];

// Spaced repetition intervals (in days): 1, 3, 7, 14, 30
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export const useAcademyStore = create<AcademyState>()(
    persist(
        (set, get) => ({
            currentModule: null,
            progress: {},
            unlockedModules: INITIAL_UNLOCKED,
            totalXp: 0,

            completeModule: (moduleId, score) => set((state) => {
                const progress = { ...state.progress };
                const existing = progress[moduleId];
                progress[moduleId] = {
                    completed: true,
                    score,
                    completedAt: Date.now(),
                    // Feature 3: Schedule first review in 1 day
                    reviewDue: Date.now() + 86400000,
                    reviewCount: 0,
                    // Clear saved position
                    lastContentIdx: undefined,
                    lastSectionIdx: undefined,
                    lastVisitedAt: existing?.lastVisitedAt,
                };

                // Auto-unlock next modules based on module map
                const newUnlocked = [...state.unlockedModules];
                const nextModules = MODULE_UNLOCK_MAP[moduleId] || [];
                for (const next of nextModules) {
                    if (!newUnlocked.includes(next)) {
                        newUnlocked.push(next);
                    }
                }

                return {
                    progress,
                    unlockedModules: newUnlocked,
                    totalXp: state.totalXp + Math.round(score * 0.5),
                };
            }),

            unlockModule: (moduleId) => set((state) => ({
                unlockedModules: state.unlockedModules.includes(moduleId)
                    ? state.unlockedModules
                    : [...state.unlockedModules, moduleId],
            })),

            setCurrentModule: (moduleId) => set({ currentModule: moduleId }),

            resetProgress: () => set({
                progress: {},
                unlockedModules: INITIAL_UNLOCKED,
                totalXp: 0,
                currentModule: null,
            }),

            // Feature 1: Save position for resume
            savePosition: (moduleId, contentIdx, sectionIdx) => set((state) => {
                const progress = { ...state.progress };
                progress[moduleId] = {
                    ...(progress[moduleId] || { completed: false, score: 0 }),
                    lastContentIdx: contentIdx,
                    lastSectionIdx: sectionIdx,
                    lastVisitedAt: Date.now(),
                };
                return { progress };
            }),

            // Feature 3: Mark as reviewed (schedule next review)
            markReviewed: (moduleId) => set((state) => {
                const progress = { ...state.progress };
                const p = progress[moduleId];
                if (!p) return state;
                const count = (p.reviewCount || 0) + 1;
                const intervalDays = REVIEW_INTERVALS[Math.min(count, REVIEW_INTERVALS.length - 1)];
                progress[moduleId] = {
                    ...p,
                    reviewCount: count,
                    reviewDue: Date.now() + intervalDays * 86400000,
                };
                return { progress };
            }),

            // Feature 3: Get modules due for review
            getModulesForReview: () => {
                const { progress } = get();
                const now = Date.now();
                return Object.entries(progress)
                    .filter(([, p]) => p.completed && p.reviewDue && p.reviewDue <= now)
                    .map(([id]) => id);
            },
        }),
        {
            name: 'academy-store',
            version: 2,
            migrate: (persistedState: any, version: number) => {
                if (version < 1) {
                    const unlocked = new Set<string>(persistedState.unlockedModules || []);
                    unlocked.add('wudu-fondamental');
                    unlocked.add('priere-pas-a-pas');
                    unlocked.delete('premiere-priere');
                    INITIAL_UNLOCKED.forEach(id => unlocked.add(id));
                    persistedState.unlockedModules = Array.from(unlocked);
                }
                // v1 → v2: no breaking changes, just new optional fields
                return persistedState;
            }
        }
    )
);

// ─── Module Dependency Map ───────────────────────────────
// Level 1 modules unlock Level 2 modules

const MODULE_UNLOCK_MAP: Record<string, string[]> = {
    // Level 1 → Level 2
    'alphabet-arabe': ['tajweed-fondamental', 'makharij-al-huruf'],
    'sourates-courtes': ['comprehension-sourates'],
    'priere-pas-a-pas': ['fiqh-simplifie'],
    'wudu-fondamental': [],
    'bases-islam': [],  // foundational, no unlock needed

    // Level 2 internal
    'tajweed-fondamental': [],
    'makharij-al-huruf': [],
    'comprehension-sourates': [],
    'fiqh-simplifie': [],
};

