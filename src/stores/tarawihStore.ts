import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TarawihNightPlan, TarawihVerse } from '../lib/tarawihService';

export type TarawihPhase = 'setup' | 'loading' | 'detecting' | 'translating' | 'paused' | 'finished';

interface TarawihState {
    // Setup config (persisted)
    nightNumber: number;
    numberOfPairs: number;
    ttsSpeed: number;

    // Live state (not persisted)
    phase: TarawihPhase;
    nightPlan: TarawihNightPlan | null;
    currentPair: number;        // 1-based
    currentVerseIndex: number;  // Index within current pair
    loadingMessage: string;
    volume: number;             // Current mic volume (0-255)

    // Actions
    setNightNumber: (n: number) => void;
    setNumberOfPairs: (n: number) => void;
    setTtsSpeed: (s: number) => void;
    setPhase: (p: TarawihPhase) => void;
    setNightPlan: (plan: TarawihNightPlan | null) => void;
    setCurrentPair: (p: number) => void;
    setCurrentVerseIndex: (i: number) => void;
    setLoadingMessage: (msg: string) => void;
    setVolume: (v: number) => void;
    nextVerse: () => void;
    prevVerse: () => void;
    nextPair: () => void;
    getCurrentVerse: () => TarawihVerse | null;
    getPairVerses: () => TarawihVerse[];
    getPairProgress: () => { current: number; total: number };
    reset: () => void;
}

export const useTarawihStore = create<TarawihState>()(
    persist(
        (set, get) => ({
            // Setup config
            nightNumber: 1,
            numberOfPairs: 4,
            ttsSpeed: 1.0,

            // Live state
            phase: 'setup',
            nightPlan: null,
            currentPair: 1,
            currentVerseIndex: 0,
            loadingMessage: '',
            volume: 0,

            // Actions
            setNightNumber: (n) => set({ nightNumber: Math.max(1, Math.min(30, n)) }),
            setNumberOfPairs: (n) => set({ numberOfPairs: Math.max(1, Math.min(10, n)) }),
            setTtsSpeed: (s) => set({ ttsSpeed: Math.max(0.5, Math.min(2.0, s)) }),
            setPhase: (p) => set({ phase: p }),
            setNightPlan: (plan) => set({ nightPlan: plan }),
            setCurrentPair: (p) => set({ currentPair: p, currentVerseIndex: 0 }),
            setCurrentVerseIndex: (i) => set({ currentVerseIndex: i }),
            setLoadingMessage: (msg) => set({ loadingMessage: msg }),
            setVolume: (v) => set({ volume: v }),

            nextVerse: () => {
                const { currentVerseIndex, nightPlan, currentPair } = get();
                if (!nightPlan) return;
                const pair = nightPlan.pairs[currentPair - 1];
                if (!pair) return;
                if (currentVerseIndex < pair.verses.length - 1) {
                    set({ currentVerseIndex: currentVerseIndex + 1 });
                }
            },

            prevVerse: () => {
                const { currentVerseIndex } = get();
                if (currentVerseIndex > 0) {
                    set({ currentVerseIndex: currentVerseIndex - 1 });
                }
            },

            nextPair: () => {
                const { currentPair, numberOfPairs } = get();
                if (currentPair < numberOfPairs) {
                    set({ currentPair: currentPair + 1, currentVerseIndex: 0 });
                } else {
                    set({ phase: 'finished' });
                }
            },

            getCurrentVerse: () => {
                const { nightPlan, currentPair, currentVerseIndex } = get();
                if (!nightPlan) return null;
                const pair = nightPlan.pairs[currentPair - 1];
                if (!pair) return null;
                return pair.verses[currentVerseIndex] || null;
            },

            getPairVerses: () => {
                const { nightPlan, currentPair } = get();
                if (!nightPlan) return [];
                const pair = nightPlan.pairs[currentPair - 1];
                return pair?.verses || [];
            },

            getPairProgress: () => {
                const { nightPlan, currentPair, currentVerseIndex } = get();
                if (!nightPlan) return { current: 0, total: 0 };
                const pair = nightPlan.pairs[currentPair - 1];
                return {
                    current: currentVerseIndex + 1,
                    total: pair?.verses.length || 0,
                };
            },

            reset: () => set({
                phase: 'setup',
                nightPlan: null,
                currentPair: 1,
                currentVerseIndex: 0,
                loadingMessage: '',
                volume: 0,
            }),
        }),
        {
            name: 'tarawih-config',
            partialize: (state) => ({
                nightNumber: state.nightNumber,
                numberOfPairs: state.numberOfPairs,
                ttsSpeed: state.ttsSpeed,
            }),
        }
    )
);
