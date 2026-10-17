import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlaylistItem } from "../types";
export interface ListeningNote {
  id: string;
  item: PlaylistItem;
  note: string;
  createdAt: number;
}
export const useListeningNotebookStore = create<{
  notes: ListeningNote[];
  save: (item: PlaylistItem, note?: string) => void;
  remove: (id: string) => void;
}>()(
  persist(
    (set) => ({
      notes: [],
      save: (item, note) =>
        set((s) => {
          if (!item.verse) return s;
          const id = `${item.surahNumber}:${item.verse.number}:${item.reciterId}`;
          const existing = s.notes.find((n) => n.id === id);
          return {
            notes: [
              {
                id,
                item,
                note: (note ?? existing?.note ?? "").slice(0, 2000),
                createdAt: existing?.createdAt ?? Date.now(),
              },
              ...s.notes.filter((n) => n.id !== id),
            ].slice(0, 200),
          };
        }),
      remove: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: "quran-coach-listening-notebook" },
  ),
);
