import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark, Favorite, HifdhSession } from '../types';

interface ProgressState {
    bookmarks: Bookmark[];
    favorites: Favorite[];
    hifdhSessions: HifdhSession[];

    // Bookmark actions
    addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
    removeBookmark: (id: string) => void;
    updateBookmarkLabel: (id: string, label: string) => void;

    // Favorite actions
    addFavorite: (favorite: Omit<Favorite, 'id' | 'createdAt'>) => void;
    removeFavorite: (id: string) => void;
    updateFavoriteNote: (id: string, note: string) => void;

    // Hifdh actions
    createHifdhSession: (session: Omit<HifdhSession, 'id' | 'lastPracticed' | 'nextReview' | 'mastered'>) => void;
    updateHifdhSession: (id: string, updates: Partial<HifdhSession>) => void;
    markSessionMastered: (id: string) => void;
    deleteHifdhSession: (id: string) => void;
    getSessionsForReview: () => HifdhSession[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

// Spaced repetition intervals (in days)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            bookmarks: [],
            favorites: [],
            hifdhSessions: [],

            // Bookmark actions
            addBookmark: (bookmark) => set((state) => ({
                bookmarks: [...state.bookmarks, {
                    ...bookmark,
                    id: generateId(),
                    createdAt: Date.now()
                }]
            })),

            removeBookmark: (id) => set((state) => ({
                bookmarks: state.bookmarks.filter(b => b.id !== id)
            })),

            updateBookmarkLabel: (id, label) => set((state) => ({
                bookmarks: state.bookmarks.map(b =>
                    b.id === id ? { ...b, label } : b
                )
            })),

            // Favorite actions
            addFavorite: (favorite) => set((state) => ({
                favorites: [...state.favorites, {
                    ...favorite,
                    id: generateId(),
                    createdAt: Date.now()
                }]
            })),

            removeFavorite: (id) => set((state) => ({
                favorites: state.favorites.filter(f => f.id !== id)
            })),

            updateFavoriteNote: (id, note) => set((state) => ({
                favorites: state.favorites.map(f =>
                    f.id === id ? { ...f, note } : f
                )
            })),

            // Hifdh actions
            createHifdhSession: (session) => set((state) => ({
                hifdhSessions: [...state.hifdhSessions, {
                    ...session,
                    id: generateId(),
                    mastered: false,
                    lastPracticed: Date.now(),
                    nextReview: Date.now() + REVIEW_INTERVALS[0] * 24 * 60 * 60 * 1000
                }]
            })),

            updateHifdhSession: (id, updates) => set((state) => ({
                hifdhSessions: state.hifdhSessions.map(s =>
                    s.id === id ? { ...s, ...updates, lastPracticed: Date.now() } : s
                )
            })),

            markSessionMastered: (id) => set((state) => ({
                hifdhSessions: state.hifdhSessions.map(s =>
                    s.id === id ? { ...s, mastered: true } : s
                )
            })),

            deleteHifdhSession: (id) => set((state) => ({
                hifdhSessions: state.hifdhSessions.filter(s => s.id !== id)
            })),

            getSessionsForReview: () => {
                const now = Date.now();
                return get().hifdhSessions.filter(s => !s.mastered && s.nextReview <= now);
            },
        }),
        {
            name: 'quran-coach-progress',
        }
    )
);
