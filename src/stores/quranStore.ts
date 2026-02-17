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
    currentSurahAyahs: Ayah[];

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
    setSurahAyahs: (ayahs: Ayah[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateProgress: () => void;
    goToPage: (page: number) => void;
    goToSurah: (surah: number) => void;
    goToAyah: (surah: number, ayah: number, page?: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    nextSurah: () => void;
    prevSurah: () => void;
}

export const useQuranStore = create<QuranState>()(
    persist(
        (set, get) => ({
            surahs: [],
            currentPage: 1,
            currentSurah: 1,
            currentAyah: 1,
            pageAyahs: [],
            currentSurahAyahs: [],
            isLoading: false,
            error: null,
            progress: null,

            setSurahs: (surahs) => set({ surahs }),
            setCurrentPage: (currentPage) => set({ currentPage }),
            setCurrentSurah: (currentSurah) => set({ currentSurah }),
            setCurrentAyah: (currentAyah) => set({ currentAyah }),
            setPageAyahs: (pageAyahs) => set({ pageAyahs }),
            setSurahAyahs: (currentSurahAyahs) => set({ currentSurahAyahs }),
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
                    set({ currentSurah: surah, currentAyah: 1 });
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

            nextSurah: () => {
                const { currentSurah } = get();
                if (currentSurah < 114) {
                    set({ currentSurah: currentSurah + 1, currentAyah: 1 });
                    get().updateProgress();
                }
            },

            prevSurah: () => {
                const { currentSurah } = get();
                if (currentSurah > 1) {
                    set({ currentSurah: currentSurah - 1, currentAyah: 1 });
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
