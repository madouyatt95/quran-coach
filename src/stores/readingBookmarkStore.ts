import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuranStore } from './quranStore';
import { useSettingsStore } from './settingsStore';

export type BookmarkView = 'mushaf' | 'madinah' | 'tajweed' | 'tajweed-interactive';
export interface ReadingBookmark {
    id?: string;
    label?: string;
    surah: number;
    ayah: number;
    page: number;
    view: BookmarkView;
    precision: 'verse' | 'page';
    savedAt: number;
    ribbonLength?:number;
}
export const useReadingBookmarkStore = create<{
    bookmark: ReadingBookmark | null;
    bookmarks: ReadingBookmark[];
    remove: (id?: string) => void;
    save: (position: Omit<ReadingBookmark, 'savedAt'>) => void;
    saveNamed: (position: Omit<ReadingBookmark, 'savedAt' | 'id' | 'label'>, label: string) => void;
}>()(persist((set, get) => ({
    bookmark: null,
    bookmarks: [],
    remove: (id) => set(state => {
        const targetId = id ?? state.bookmark?.id;
        if (!targetId) return id ? state : { bookmark: null, bookmarks: state.bookmarks.filter(item => item.id !== 'resume-reading' && item.label !== 'Reprendre ma lecture') };
        const bookmarks = state.bookmarks.filter(item => item.id !== targetId);
        return { bookmarks, bookmark: state.bookmark?.id === targetId ? null : state.bookmark };
    }),
    save: position => {
        if (!Number.isInteger(position.page) || position.page < 1 || position.page > 604 ||
            !Number.isInteger(position.surah) || position.surah < 1 || position.surah > 114 ||
            !Number.isInteger(position.ayah) || position.ayah < 1) return;
        const previous = get().bookmark;
        const bookmark: ReadingBookmark = { ...position, id: previous?.id || 'resume-reading', label: 'Reprendre ma lecture', savedAt: Date.now() };
        set(state => ({ bookmark, bookmarks: [bookmark, ...state.bookmarks.filter(item => item.id !== bookmark.id)] }));
    },
    saveNamed: (position, rawLabel) => {
        const label = rawLabel.trim().slice(0, 48);
        if (!label || !Number.isInteger(position.page) || position.page < 1 || position.page > 604 ||
            !Number.isInteger(position.surah) || position.surah < 1 || position.surah > 114 ||
            !Number.isInteger(position.ayah) || position.ayah < 1) return;
        if (label.toLocaleLowerCase('fr') === 'reprendre ma lecture') {
            get().save(position);
            return;
        }
        const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const bookmark: ReadingBookmark = { ...position, id, label, savedAt: Date.now() };
        set(state => ({ bookmarks: [bookmark, ...state.bookmarks] }));
    },
}), {
    name: 'quran-coach-reading-bookmark',
    version: 1,
    migrate: (persisted, version) => {
        void version;
        const state = (persisted || {}) as { bookmark?: ReadingBookmark | null; bookmarks?: ReadingBookmark[] };
        const legacy = state.bookmark ? { ...state.bookmark, id: state.bookmark.id || 'resume-reading', label: state.bookmark.label || 'Reprendre ma lecture' } : null;
        const bookmarks = Array.isArray(state.bookmarks) ? state.bookmarks.map((item, index) => ({ ...item, id: item.id || `bookmark-migrated-${index}`, label: item.label || 'Reprendre ma lecture' })) : legacy ? [legacy] : [];
        return { ...state, bookmark: legacy, bookmarks };
    },
    partialize: s => ({ bookmark: s.bookmark, bookmarks: s.bookmarks }),
}));

export function resumeReadingBookmark(bookmark: ReadingBookmark) {
    useSettingsStore.getState().setViewMode(bookmark.view);
    if (bookmark.precision === 'page') useQuranStore.getState().goToPage(bookmark.page, { silent: true });
    else useQuranStore.getState().goToAyah(bookmark.surah, bookmark.ayah, bookmark.page, { silent: true });
}
