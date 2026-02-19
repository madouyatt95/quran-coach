import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Surah, Ayah, ReadingProgress } from '../types';
import { SURAH_START_PAGES } from '../components/Mushaf/mushafConstants';

interface NavigationOptions {
    silent?: boolean;
}

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
    isExploring: boolean; // Flag for search/manual jumps (resumes tracking after 10 verses)
    isKhatmMode: boolean; // Flag for Khatm sessions (strictly freezes general bookmark)
    jumpSignal: number;  // Counter to trigger scroll effects on the same surah

    // Actions
    setSurahs: (surahs: Surah[]) => void;
    setCurrentPage: (page: number) => void;
    setCurrentSurah: (surah: number) => void;
    setCurrentAyah: (ayah: number) => void;
    setPageAyahs: (ayahs: Ayah[]) => void;
    setSurahAyahs: (ayahs: Ayah[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateProgress: (options?: { force?: boolean }) => void;
    stopExploring: () => void;
    goToPage: (page: number, options?: NavigationOptions) => void;
    goToSurah: (surah: number, options?: NavigationOptions) => void;
    goToAyah: (surah: number, ayah: number, page?: number, options?: NavigationOptions) => void;
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
            isExploring: false,
            isKhatmMode: false,
            jumpSignal: 0,
            version: '1.2.8', // Diagnostic internal version

            setSurahs: (surahs) => set({ surahs }),
            setCurrentPage: (currentPage) => set({ currentPage }),
            setCurrentSurah: (currentSurah) => set({ currentSurah }),
            setCurrentAyah: (currentAyah) => set({ currentAyah }),
            setPageAyahs: (pageAyahs) => set({ pageAyahs }),
            setSurahAyahs: (currentSurahAyahs) => set({ currentSurahAyahs }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            updateProgress: (options = {}) => {
                const {
                    currentSurah, currentAyah, currentPage,
                    progress, isExploring, isKhatmMode
                } = get();

                if (options.force) {
                    set({
                        isExploring: false,
                        progress: { lastSurah: currentSurah, lastAyah: currentAyah, lastPage: currentPage, updatedAt: Date.now() }
                    });
                    return;
                }

                if (isKhatmMode) {
                    // KHATM MODE: Strictly frozen. Never update general bookmark.
                    return;
                }

                if (isExploring) {
                    // SEARCH/EXPLORATION MODE:
                    // If we moved 10 verses, we assume the user has started a new reading session
                    const verseDiff = progress ? Math.abs(currentAyah - progress.lastAyah) : 0;

                    if (verseDiff < 10 && currentSurah === progress?.lastSurah) {
                        return; // Still in "silent" zone
                    }

                    // Take over bookmark
                    set({ isExploring: false });
                }

                // Normal threshold check (10 verses from last saved)
                if (progress) {
                    const surahChanged = currentSurah !== progress.lastSurah;
                    const verseDiff = Math.abs(currentAyah - progress.lastAyah);

                    if (!surahChanged && verseDiff < 10 && currentPage === progress.lastPage) {
                        return; // Skip update
                    }
                }

                set({
                    progress: {
                        lastSurah: currentSurah,
                        lastAyah: currentAyah,
                        lastPage: currentPage,
                        updatedAt: Date.now()
                    }
                });
            },

            stopExploring: () => set({ isExploring: false }),

            goToPage: (page, options = {}) => {
                if (page >= 1 && page <= 604) {
                    // Find surah that contains this page
                    // SURAH_START_PAGES is 1-indexed (index 0 is Surah 1)
                    let surah = 1;
                    for (let i = SURAH_START_PAGES.length - 1; i >= 0; i--) {
                        if (page >= SURAH_START_PAGES[i]) {
                            surah = i + 1;
                            break;
                        }
                    }

                    set((state) => ({
                        currentPage: page,
                        currentSurah: surah,
                        currentAyah: 1,
                        isExploring: options.silent !== undefined ? !!options.silent : state.isExploring,
                        isKhatmMode: (options as any).khatm || false,
                        jumpSignal: state.jumpSignal + 1
                    }));
                    if (!options.silent) {
                        get().updateProgress();
                    }
                }
            },

            goToSurah: (surah, options = {}) => {
                if (surah >= 1 && surah <= 114) {
                    const page = SURAH_START_PAGES[surah - 1];
                    set((state) => ({
                        currentSurah: surah,
                        currentAyah: 1,
                        currentPage: page,
                        isExploring: options.silent !== undefined ? !!options.silent : state.isExploring,
                        isKhatmMode: (options as any).khatm || false,
                        jumpSignal: state.jumpSignal + 1
                    }));
                    if (!options.silent) {
                        get().updateProgress();
                    }
                }
            },

            goToAyah: (surah, ayah, page, options = {}) => {
                const updateState: any = {
                    currentSurah: surah,
                    currentAyah: ayah,
                    currentPage: page || SURAH_START_PAGES[surah - 1],
                };
                set((state) => {
                    return {
                        ...updateState,
                        isExploring: options.silent !== undefined ? !!options.silent : state.isExploring,
                        isKhatmMode: (options as any).khatm || false,
                        jumpSignal: state.jumpSignal + 1
                    };
                });
                if (!options.silent) {
                    get().updateProgress();
                }
            },

            nextPage: () => {
                const { currentPage } = get();
                if (currentPage < 604) {
                    set({ currentPage: currentPage + 1, isKhatmMode: false });
                    get().updateProgress();
                }
            },

            prevPage: () => {
                const { currentPage } = get();
                if (currentPage > 1) {
                    set({ currentPage: currentPage - 1, isKhatmMode: false });
                    get().updateProgress();
                }
            },

            nextSurah: () => {
                const { currentSurah } = get();
                if (currentSurah < 114) {
                    const nextS = currentSurah + 1;
                    const page = SURAH_START_PAGES[nextS - 1];
                    set({ currentSurah: nextS, currentAyah: 1, currentPage: page });
                    get().updateProgress();
                }
            },

            prevSurah: () => {
                const { currentSurah } = get();
                if (currentSurah > 1) {
                    const prevS = currentSurah - 1;
                    const page = SURAH_START_PAGES[prevS - 1];
                    set({ currentSurah: prevS, currentAyah: 1, currentPage: page });
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
                isKhatmMode: state.isKhatmMode,
            }),
        }
    )
);
