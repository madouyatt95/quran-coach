import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Surah, Ayah, ReadingProgress } from '../types';

interface QuranState {
    // Data
    surahs: Surah[];
    currentPage: number;
    currentSurah: number;
    currentAyah: number;
    pageAyahs: Ayah[];

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Reading progress
    progress: ReadingProgress | null;

    // Actions
    setSurahs: (surahs: Surah[]) => void;
    setCurrentPage: (page: number) => void;
    setCurrentSurah: (surah: number) => void;
    setCurrentAyah: (ayah: number) => void;
    setPageAyahs: (ayahs: Ayah[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateProgress: () => void;
    goToPage: (page: number) => void;
    goToSurah: (surah: number) => void;
    goToAyah: (surah: number, ayah: number, page?: number) => void;
    nextPage: () => void;
    prevPage: () => void;
}

export const useQuranStore = create<QuranState>()(
    persist(
        (set, get) => ({
            surahs: [],
            currentPage: 1,
            currentSurah: 1,
            currentAyah: 1,
            pageAyahs: [],
            isLoading: false,
            error: null,
            progress: null,

            setSurahs: (surahs) => set({ surahs }),
            setCurrentPage: (currentPage) => set({ currentPage }),
            setCurrentSurah: (currentSurah) => set({ currentSurah }),
            setCurrentAyah: (currentAyah) => set({ currentAyah }),
            setPageAyahs: (pageAyahs) => set({ pageAyahs }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            updateProgress: () => {
                const { currentSurah, currentAyah, currentPage } = get();
                set({
                    progress: {
                        lastSurah: currentSurah,
                        lastAyah: currentAyah,
                        lastPage: currentPage,
                        updatedAt: Date.now()
                    }
                });
            },

            goToPage: (page) => {
                if (page >= 1 && page <= 604) {
                    set({ currentPage: page });
                    get().updateProgress();
                }
            },

            goToSurah: (surah) => {
                if (surah >= 1 && surah <= 114) {
                    // Starting pages for each surah (approximate)
                    const SURAH_START_PAGES: Record<number, number> = {
                        1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177,
                        9: 187, 10: 208, 11: 221, 12: 235, 13: 249, 14: 255, 15: 262,
                        16: 267, 17: 282, 18: 293, 19: 305, 20: 312, 21: 322, 22: 332,
                        23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396,
                        30: 404, 31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440,
                        37: 446, 38: 453, 39: 458, 40: 467, 41: 477, 42: 483, 43: 489,
                        44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
                        51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537,
                        58: 542, 59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556,
                        65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570,
                        72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582,
                        79: 583, 80: 585, 81: 586, 82: 587, 83: 587, 84: 589, 85: 590,
                        86: 591, 87: 591, 88: 592, 89: 593, 90: 594, 91: 595, 92: 595,
                        93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599,
                        100: 599, 101: 600, 102: 600, 103: 601, 104: 601, 105: 601,
                        106: 602, 107: 602, 108: 602, 109: 603, 110: 603, 111: 603,
                        112: 604, 113: 604, 114: 604
                    };
                    const startPage = SURAH_START_PAGES[surah] || 1;
                    set({ currentSurah: surah, currentAyah: 1, currentPage: startPage });
                    get().updateProgress();
                }
            },

            goToAyah: (surah, ayah, page?: number) => {
                const updateState: Partial<QuranState> = {
                    currentSurah: surah,
                    currentAyah: ayah
                };
                if (page) {
                    updateState.currentPage = page;
                }
                set(updateState);
                get().updateProgress();
            },

            nextPage: () => {
                const { currentPage } = get();
                if (currentPage < 604) {
                    set({ currentPage: currentPage + 1 });
                    get().updateProgress();
                }
            },

            prevPage: () => {
                const { currentPage } = get();
                if (currentPage > 1) {
                    set({ currentPage: currentPage - 1 });
                    get().updateProgress();
                }
            },
        }),
        {
            name: 'quran-coach-quran',
            partialize: (state) => ({
                currentPage: state.currentPage,
                currentSurah: state.currentSurah,
                currentAyah: state.currentAyah,
                progress: state.progress,
            }),
        }
    )
);
