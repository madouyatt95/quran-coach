import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlaylistItem } from "../types";
import type { MP3QuranReciter } from "../lib/mp3QuranApi";
import { mp3QuranApi } from "../lib/mp3QuranApi";
import {
  matchesReciter,
  reciterKey,
  reciterName,
  RECITER_NAMES,
} from "../lib/listening";

export interface LastListened {
  verse?: PlaylistItem["verse"];
  reciterId: string | number;
  reciterName: string;
  surahNumber: number;
  surahName: string;
  audioUrl: string;
  position: number;
  playlist?: PlaylistItem[];
  playlistIndex?: number;
  updatedAt?: number;
}
export interface AudioBookmark {
  id: string;
  track: LastListened;
  createdAt: number;
}
interface ListenState {
  reciters: MP3QuranReciter[];
  fetchedAt: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  lastListened: LastListened | null;
  history: LastListened[];
  favoriteReciters: string[];
  bookmarks: AudioBookmark[];
  fetchReciters: (force?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredReciters: () => MP3QuranReciter[];
  getPopularReciters: () => MP3QuranReciter[];
  setLastListened: (data: LastListened) => void;
  updateLastPosition: (position: number) => void;
  updateLastPlaylistIndex: (index: number) => void;
  clearLastListened: () => void;
  toggleFavorite: (id: string) => void;
  addBookmark: (track: LastListened) => void;
  removeBookmark: (id: string) => void;
}
export function normalizeHistoryTrack(data: LastListened): LastListened {
  // Older custom collections shared the numeric -1: recover them from their audio source.
  const reciterId = data.audioUrl?.includes("Coran_Arabe_Franais")
    ? "hudhayfi-leclerc"
    : reciterKey(data.reciterId ?? "");
  return {
    ...data,
    reciterId,
    position: Number.isFinite(data.position) ? Math.max(0, data.position) : 0,
  };
}
export const useListenStore = create<ListenState>()(
  persist(
    (set, get) => ({
      reciters: [],
      fetchedAt: 0,
      isLoading: false,
      error: null,
      searchQuery: "",
      lastListened: null,
      history: [],
      favoriteReciters: [],
      bookmarks: [],
      fetchReciters: async (force = false) => {
        if (
          get().isLoading ||
          (!force &&
            get().reciters.length &&
            Date.now() - get().fetchedAt < 86400000)
        )
          return;
        set({ isLoading: true, error: null });
        try {
          const reciters = await mp3QuranApi.getReciters("fr");
          if (!Array.isArray(reciters) || !reciters.length)
            throw new Error("Catalogue vide");
          set({
            reciters: reciters.filter((r) => r.id > 0 && r.moshaf?.length),
            fetchedAt: Date.now(),
            isLoading: false,
          });
        } catch {
          set({
            isLoading: false,
            error:
              "Catalogue indisponible. Vos écoutes enregistrées restent accessibles.",
          });
        }
      },
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      getFilteredReciters: () =>
        get().reciters.filter((r) => matchesReciter(r, get().searchQuery)),
      getPopularReciters: () =>
        get()
          .reciters.filter((r) => RECITER_NAMES[r.id])
          .map((r) => ({ ...r, name: reciterName(r) })),
      setLastListened: (data) =>
        set((state) => {
          const track = {
            ...normalizeHistoryTrack(data),
            updatedAt: Date.now(),
          };
          return {
            lastListened: track,
            history: [
              { ...track, playlist: undefined, playlistIndex: undefined },
              ...state.history.filter((t) => t.audioUrl !== track.audioUrl),
            ].slice(0, 20),
          };
        }),
      updateLastPosition: (position) => {
        const last = get().lastListened;
        if (last && Number.isFinite(position))
          get().setLastListened({ ...last, position });
      },
      updateLastPlaylistIndex: (playlistIndex) =>
        set((s) => ({
          lastListened: s.lastListened
            ? { ...s.lastListened, playlistIndex }
            : null,
        })),
      clearLastListened: () => set({ lastListened: null }),
      toggleFavorite: (id) =>
        set((s) => ({
          favoriteReciters: s.favoriteReciters.includes(id)
            ? s.favoriteReciters.filter((k) => k !== id)
            : [...s.favoriteReciters, id],
        })),
      addBookmark: (track) =>
        set((s) => {
          const id = `${track.audioUrl}#${Math.floor(track.position)}`;
          return {
            bookmarks: [
              {
                id,
                track: {
                  ...normalizeHistoryTrack(track),
                  playlist: undefined,
                  playlistIndex: undefined,
                },
                createdAt: Date.now(),
              },
              ...s.bookmarks.filter((b) => b.id !== id),
            ].slice(0, 100),
          };
        }),
      removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
    }),
    {
      name: "quran-coach-listen",
      version: 1,
      migrate: (stored) => {
        const old = stored as Partial<ListenState>;
        const lastListened = old.lastListened
          ? normalizeHistoryTrack(old.lastListened)
          : null;
        return {
          ...old,
          reciters: [],
          fetchedAt: 0,
          lastListened,
          history: lastListened
            ? [{ ...lastListened, playlist: undefined }]
            : [],
          favoriteReciters: [],
          bookmarks: [],
        };
      },
      partialize: (s) => ({
        reciters: s.reciters,
        fetchedAt: s.fetchedAt,
        lastListened: s.lastListened,
        history: s.history,
        favoriteReciters: s.favoriteReciters,
        bookmarks: s.bookmarks,
      }),
    },
  ),
);
