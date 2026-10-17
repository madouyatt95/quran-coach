import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JourneyPlan, RecallAttempt } from '../lib/hifdhJourney';
import { useLearningStore } from './learningStore';
interface State {
    plan: JourneyPlan | null;
    attempts: RecallAttempt[];
    setPlan: (plan: JourneyPlan | null) => void;
    phase: (phase: number) => void;
    assist: () => void;
    reveal: (reviewed: boolean) => void;
    record: (attempt: Omit<RecallAttempt, 'id' | 'at'>, at?: string) => void;
    removeAttempt: (id: string) => void;
    next: (repair?: boolean) => void;
}
export const useHifdhJourneyStore = create<State>()(persist((set, get) => ({
    plan: null, attempts: [], setPlan: plan => set({ plan: plan ? { ...plan, updatedAt: Date.now() } : null }),
    phase: phase => set(s => ({ plan: s.plan ? { ...s.plan, phase, hints: 0, reviewed: false, updatedAt: Date.now() } : null })),
    assist: () => set(s => ({ plan: s.plan ? { ...s.plan, hints: (s.plan.hints || 0) + 1 } : null })),
    reveal: reviewed => set(s => ({ plan: s.plan ? { ...s.plan, reviewed } : null })),
    record: (attempt, at = new Date().toISOString()) => set(s => ({ attempts: [{ ...attempt, id: crypto.randomUUID(), at }, ...s.attempts].slice(0, 2000) })),
    removeAttempt: id => {
        const target = get().attempts.find(attempt => attempt.id === id);
        if (!target) return;
        const remaining = get().attempts.filter(attempt => attempt.id !== id);
        set({ attempts: remaining });
        useLearningStore.getState().correctJourneyRecall(target, remaining.filter(attempt => attempt.surah === target.surah && attempt.ayah === target.ayah));
    },
    next: (repair = false) => set(s => {
        if (!s.plan)
            return {};
        const exercises = [...s.plan.exercises], current = exercises[s.plan.cursor];
        // One contextual repair after an unsuccessful test, never an endless loop.
        if (repair && current && current.kind !== 'repair')
            exercises.splice(s.plan.cursor + 1, 0, { ...current, kind: 'repair', reason: 'Consolider le passage qui vient de poser difficulté' });
        return { plan: { ...s.plan, exercises, cursor: s.plan.cursor + 1, phase: 0, hints: 0, reviewed: false, updatedAt: Date.now() } };
    }),
}), { name: 'quran-coach-hifdh-journey-v1' }));
