import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuranStore } from './quranStore';
import { useSettingsStore } from './settingsStore';

export type BookmarkView = 'mushaf' | 'madinah' | 'tajweed';
export interface ReadingBookmark {
    surah: number;
    ayah: number;
    page: number;
    view: BookmarkView;
    precision: 'verse' | 'page';
    savedAt: number;
}
export const useReadingBookmarkStore = create<{
    bookmark: ReadingBookmark | null;
    save: (position: Omit<ReadingBookmark, 'savedAt'>) => void;
}>()(persist((set) => ({
    bookmark: null,
    save: position => {
        if (!Number.isInteger(position.page) || position.page < 1 || position.page > 604 ||
            !Number.isInteger(position.surah) || position.surah < 1 || position.surah > 114 ||
            !Number.isInteger(position.ayah) || position.ayah < 1) return;
        set({ bookmark: { ...position, savedAt: Date.now() } });
    },
}), { name: 'quran-coach-reading-bookmark', partialize: s => ({ bookmark: s.bookmark }) }));

export function resumeReadingBookmark(bookmark: ReadingBookmark) {
    useSettingsStore.getState().setViewMode(bookmark.view);
    if (bookmark.precision === 'page') useQuranStore.getState().goToPage(bookmark.page, { silent: true });
    else useQuranStore.getState().goToAyah(bookmark.surah, bookmark.ayah, bookmark.page, { silent: true });
}
