import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteVerse {
    /** Global ayah number */
    number: number;
    surah: number;
    numberInSurah: number;
    text: string;
    page?: number;
    /** Timestamp when added */
    addedAt: number;
}

export interface FavoriteCollection { id: string; name: string; createdAt: number }
export interface FavoriteAnnotation { note: string; collectionIds: string[] }
export const verseFavoriteKey = (number: number) => `verse:${number}`;
export const hadithFavoriteKey = (id: number) => `hadith:${id}`;
export const duaFavoriteKey = (chapterId: string, id: number) => `dua:${chapterId}:${id}`;

export interface FavoriteHadith {
    id: number;
    ar: string;
    fr: string;
    src: string;
    nar: string;
    cat: string;
    addedAt: number;
}

export interface FavoriteDua {
    chapterId: string;
    duaId: number;
    arabic: string;
    translation: string;
    source: string;
    chapterTitle: string;
    addedAt: number;
}

interface FavoritesState {
    favorites: FavoriteVerse[];
    favoriteHadiths: FavoriteHadith[];
    favoriteDuas: FavoriteDua[];
    collections: FavoriteCollection[];
    annotations: Record<string, FavoriteAnnotation>;
    createCollection: (name: string) => string | null;
    renameCollection: (id: string, name: string) => boolean;
    removeCollection: (id: string) => void;
    setNote: (key: string, note: string) => void;
    setCollections: (key: string, ids: string[]) => void;

    addFavorite: (verse: Omit<FavoriteVerse, 'addedAt'>) => void;
    removeFavorite: (number: number) => void;
    isFavorite: (number: number) => boolean;
    toggleFavorite: (verse: Omit<FavoriteVerse, 'addedAt'>) => void;

    toggleFavoriteHadith: (hadith: Omit<FavoriteHadith, 'addedAt'>) => void;
    isFavoriteHadith: (id: number) => boolean;
    removeFavoriteHadith: (id: number) => void;

    toggleFavoriteDua: (dua: Omit<FavoriteDua, 'addedAt'>) => void;
    isFavoriteDua: (chapterId: string, duaId: number) => boolean;
    removeFavoriteDua: (chapterId: string, duaId: number) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],
            favoriteHadiths: [],
            favoriteDuas: [],
            collections: [],
            annotations: {},
            createCollection: (value) => {
                const name = value.trim().slice(0, 60);
                if (!name) return null;
                const existing = get().collections.find(c => c.name.toLocaleLowerCase() === name.toLocaleLowerCase());
                if (existing) return existing.id;
                const id = crypto.randomUUID();
                set(state => ({ collections: [...state.collections, { id, name, createdAt: Date.now() }] }));
                return id;
            },
            renameCollection: (id, value) => {
                const name = value.trim().slice(0, 60);
                if (!name || !get().collections.some(c => c.id === id) || get().collections.some(c => c.id !== id && c.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return false;
                set(state => ({ collections: state.collections.map(c => c.id === id ? { ...c, name } : c) }));
                return true;
            },
            removeCollection: id => set(state => ({
                collections: state.collections.filter(c => c.id !== id),
                annotations: Object.fromEntries(Object.entries(state.annotations).map(([key, value]) => [key, { ...value, collectionIds: value.collectionIds.filter(c => c !== id) }])),
            })),
            setNote: (key, note) => set(state => ({ annotations: { ...state.annotations, [key]: { collectionIds: state.annotations[key]?.collectionIds ?? [], note: note.slice(0, 4000) } } })),
            setCollections: (key, ids) => set(state => ({ annotations: { ...state.annotations, [key]: { note: state.annotations[key]?.note ?? '', collectionIds: [...new Set(ids)].filter(id => state.collections.some(c => c.id === id)) } } })),

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

            toggleFavoriteHadith: (hadith) => {
                const { favoriteHadiths } = get();
                if (favoriteHadiths.find(h => h.id === hadith.id)) {
                    set({ favoriteHadiths: favoriteHadiths.filter(h => h.id !== hadith.id) });
                } else {
                    set({ favoriteHadiths: [...favoriteHadiths, { ...hadith, addedAt: Date.now() }] });
                }
            },

            isFavoriteHadith: (id) => {
                return get().favoriteHadiths.some(h => h.id === id);
            },

            removeFavoriteHadith: (id) => {
                set({ favoriteHadiths: get().favoriteHadiths.filter(h => h.id !== id) });
            },

            toggleFavoriteDua: (dua) => {
                const { favoriteDuas } = get();
                const key = `${dua.chapterId}-${dua.duaId}`;
                if (favoriteDuas.find(d => `${d.chapterId}-${d.duaId}` === key)) {
                    set({ favoriteDuas: favoriteDuas.filter(d => `${d.chapterId}-${d.duaId}` !== key) });
                } else {
                    set({ favoriteDuas: [...favoriteDuas, { ...dua, addedAt: Date.now() }] });
                }
            },

            isFavoriteDua: (chapterId, duaId) => {
                return get().favoriteDuas.some(d => d.chapterId === chapterId && d.duaId === duaId);
            },

            removeFavoriteDua: (chapterId, duaId) => {
                set({ favoriteDuas: get().favoriteDuas.filter(d => !(d.chapterId === chapterId && d.duaId === duaId)) });
            },
        }),
        {
            name: 'quran-coach-favorites',
        }
    )
);
