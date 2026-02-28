// ─── Academy Store (Parcours Guidé + Mode Enfant) ────────
// Tracks user progress through learning modules

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AcademyLevel = 'enfant' | 'debutant' | 'intermediaire';

export interface ModuleProgress {
    completed: boolean;
    score: number; // 0-100
    completedAt?: number;
}

interface AcademyState {
    level: AcademyLevel;
    currentModule: string | null;
    progress: Record<string, ModuleProgress>;
    unlockedModules: string[];
    totalXp: number;

    // Actions
    setLevel: (level: AcademyLevel) => void;
    completeModule: (moduleId: string, score: number) => void;
    unlockModule: (moduleId: string) => void;
    setCurrentModule: (moduleId: string | null) => void;
    resetProgress: () => void;
}

export const useAcademyStore = create<AcademyState>()(
    persist(
        (set) => ({
            level: 'debutant',
            currentModule: null,
            progress: {},
            unlockedModules: ['alphabet', 'fatiha', 'pillars'],
            totalXp: 0,

            setLevel: (level) => set({ level }),

            completeModule: (moduleId, score) => set((state) => {
                const progress = { ...state.progress };
                progress[moduleId] = {
                    completed: true,
                    score,
                    completedAt: Date.now(),
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
                unlockedModules: ['alphabet', 'fatiha', 'pillars'],
                totalXp: 0,
                currentModule: null,
            }),
        }),
        { name: 'academy-store' }
    )
);

// ─── Module Dependency Map ───────────────────────────────
// When a module is completed, which modules get unlocked?

const MODULE_UNLOCK_MAP: Record<string, string[]> = {
    'alphabet': ['reading-basics', 'short-surahs'],
    'fatiha': ['short-surahs'],
    'pillars': ['wudu', 'salat-basics'],
    'reading-basics': ['tajweed-intro'],
    'short-surahs': ['memorization'],
    'wudu': ['salat-basics'],
    'salat-basics': ['salat-advanced', 'fasting'],
    'tajweed-intro': ['tajweed-rules'],
    'salat-advanced': ['zakat', 'hajj-basics'],
    'fasting': ['zakat'],
    'zakat': ['hajj-basics'],
    'hajj-basics': ['aqidah-advanced'],
};
