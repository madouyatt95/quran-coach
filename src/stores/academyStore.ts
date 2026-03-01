// ─── Academy Store (Premium Redesign) ────────────────────
// Tracks user progress through the 2-level Academy modules

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModuleProgress {
    completed: boolean;
    score: number; // 0-100
    completedAt?: number;
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
}

// Initial unlocked modules (Level 1 = fully open, Level 2 = locked until prerequisites)
const INITIAL_UNLOCKED = [
    'bases-islam',
    'wudu-fondamental',
    'priere-pas-a-pas',
    'alphabet-arabe',
    'sourates-courtes',
];

export const useAcademyStore = create<AcademyState>()(
    persist(
        (set) => ({
            currentModule: null,
            progress: {},
            unlockedModules: INITIAL_UNLOCKED,
            totalXp: 0,

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
                unlockedModules: INITIAL_UNLOCKED,
                totalXp: 0,
                currentModule: null,
            }),
        }),
        {
            name: 'academy-store',
            version: 1,
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // Update unlocked modules for existing users to reflect the split
                    const unlocked = new Set<string>(persistedState.unlockedModules || []);
                    unlocked.add('wudu-fondamental');
                    unlocked.add('priere-pas-a-pas');
                    unlocked.delete('premiere-priere');

                    // Always make sure initial unlocked are present
                    INITIAL_UNLOCKED.forEach(id => unlocked.add(id));

                    persistedState.unlockedModules = Array.from(unlocked);
                }
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

