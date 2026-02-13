import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteVerse {
    /** Global ayah number */
    number: number;
    surah: number;
    numberInSurah: number;
    text: string;
    /** Timestamp when added */
    addedAt: number;
}

interface FavoritesState {
    favorites: FavoriteVerse[];
    addFavorite: (verse: Omit<FavoriteVerse, 'addedAt'>) => void;
    removeFavorite: (number: number) => void;
    isFavorite: (number: number) => boolean;
    toggleFavorite: (verse: Omit<FavoriteVerse, 'addedAt'>) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],

            addFavorite: (verse) => {
                const { favorites } = get();
                if (!favorites.find(f => f.number === verse.number)) {
                    set({ favorites: [...favorites, { ...verse, addedAt: Date.now() }] });
                }
            },

            removeFavorite: (number) => {
                set({ favorites: get().favorites.filter(f => f.number !== number) });
            },

            isFavorite: (number) => {
                return get().favorites.some(f => f.number === number);
            },

            toggleFavorite: (verse) => {
                const { favorites } = get();
                if (favorites.find(f => f.number === verse.number)) {
                    set({ favorites: favorites.filter(f => f.number !== verse.number) });
                } else {
                    set({ favorites: [...favorites, { ...verse, addedAt: Date.now() }] });
                }
            },
        }),
        {
            name: 'quran-coach-favorites',
        }
    )
);
