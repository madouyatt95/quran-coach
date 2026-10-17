// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { useFavoritesStore as store, verseFavoriteKey, hadithFavoriteKey, duaFavoriteKey } from './favoritesStore';
import { createMemoryStorage } from '../test/memoryStorage';
import { createJSONStorage } from 'zustand/middleware';
const verse = { number: 262, surah: 2, numberInSurah: 255, text: 'آية', addedAt: 1 };
beforeEach(() => { vi.stubGlobal("localStorage", createMemoryStorage()); store.persist.setOptions({ storage: createJSONStorage(() => localStorage) }); store.setState({ favorites: [], favoriteHadiths: [], favoriteDuas: [], collections: [], annotations: {} }); });
it('loads legacy favorites without losing content or requiring a migration', async () => {
 localStorage.setItem('quran-coach-favorites', JSON.stringify({ state: { favorites: [verse], favoriteHadiths: [], favoriteDuas: [] }, version: 0 }));
 await store.persist.rehydrate();
 expect(store.getState().favorites).toEqual([verse]);
 expect(store.getState().collections).toEqual([]);
 expect(store.getState().annotations).toEqual({});
});
it('persists mixed collections and separate personal notes after reload', async () => {
 store.getState().addFavorite(verse);
 const id = store.getState().createCollection('À retenir')!;
 const keys = [verseFavoriteKey(1), hadithFavoriteKey(1), duaFavoriteKey('morning', 1)];
 for (const key of keys) { store.getState().setNote(key, key); store.getState().setCollections(key, [id, id, 'missing']); }
 const persisted = localStorage.getItem('quran-coach-favorites')!;
 store.setState({ collections: [], annotations: {}, favorites: [] });
 localStorage.setItem('quran-coach-favorites', persisted);
 await store.persist.rehydrate();
 for (const key of keys) expect(store.getState().annotations[key]).toEqual({ note: key, collectionIds: [id] });
 expect(store.getState().favorites).toHaveLength(1);
 expect(store.getState().createCollection(' à retenir ')).toBe(id);
});
it('renames and dissolves a collection while preserving favorites and notes', () => {
 store.getState().addFavorite(verse);
 const id = store.getState().createCollection('Travail')!;
 const key = verseFavoriteKey(verse.number);
 store.getState().setCollections(key, [id]); store.getState().setNote(key, 'À relire');
 expect(store.getState().renameCollection(id, 'Révision')).toBe(true);
 expect(store.getState().collections[0].name).toBe('Révision');
 store.getState().removeCollection(id);
 expect(store.getState().annotations[key]).toEqual({ note: 'À relire', collectionIds: [] });
 expect(store.getState().favorites[0].number).toBe(verse.number);
});
