import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlaylistItem } from "../types";
import { IMMERSIVE_VOICES } from "../lib/listeningExperience";
import { SESSION_THEMES } from "../lib/listeningJourney";
export interface JourneyProgress {
  ordinal: number;
  position: number;
  heard: number;
  voice: string;
  completed: number[];
  updatedAt: number;
}
interface Preferences {
  voice: string;
  rate: number;
  fontSize: number;
  translation: boolean;
  theme: string;
}
interface JourneyState {
  preferences: Preferences;
  progress: Record<string, JourneyProgress>;
  recent: string[];
  setPreferences: (value: Partial<Preferences>) => void;
  rememberChoice: (id: string) => void;
  saveCursor: (item: PlaylistItem, position: number, heard: number) => void;
  finishVerse: (item: PlaylistItem, duration: number, heard: number) => void;
  restart: (id: string) => void;
}
export const useListeningJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      preferences: {
        voice: "ar.alafasy",
        rate: 1,
        fontSize: 32,
        translation: true,
        theme: "discover",
      },
      progress: {},
      recent: [],
      setPreferences: (value) =>
        set((s) => ({
          preferences: {
            voice: IMMERSIVE_VOICES.some((v) => v.id === value.voice)
              ? value.voice!
              : s.preferences.voice,
            rate: [0.75, 1, 1.25, 1.5, 2].includes(value.rate!)
              ? value.rate!
              : s.preferences.rate,
            fontSize:
              value.fontSize !== undefined && Number.isFinite(value.fontSize)
                ? Math.min(48, Math.max(24, value.fontSize))
                : s.preferences.fontSize,
            translation:
              typeof value.translation === "boolean"
                ? value.translation
                : s.preferences.translation,
            theme: SESSION_THEMES.some((t) => t.id === value.theme)
              ? value.theme!
              : s.preferences.theme,
          },
        })),
      rememberChoice: (id) =>
        set((s) => ({
          recent: [id, ...s.recent.filter((v) => v !== id)].slice(0, 20),
        })),
      saveCursor: (item, position, heard) => {
        const j = item.journey;
        if (!j) return;
        set((s) => ({
          progress: {
            ...s.progress,
            [j.id]: {
              ordinal: j.ordinal,
              position: Math.max(0, position),
              heard: Math.max(0, heard),
              voice: item.reciterId || "ar.alafasy",
              completed: s.progress[j.id]?.completed || [],
              updatedAt: Date.now(),
            },
          },
        }));
      },
      finishVerse: (item, duration, heard) => {
        const j = item.journey;
        if (!j || duration <= 0) return;
        const previous = get().progress[j.id];
        const completed = previous?.completed || [];
        const heardEnough = heard >= duration * 0.8;
        set((s) => ({
          progress: {
            ...s.progress,
            [j.id]: {
              ordinal: Math.min(j.total, j.ordinal + 1),
              position: 0,
              heard: 0,
              voice: item.reciterId || "ar.alafasy",
              completed: heardEnough
                ? [...new Set([...completed, j.ordinal])]
                : completed,
              updatedAt: Date.now(),
            },
          },
        }));
      },
      restart: (id) =>
        set((s) => {
          const progress = { ...s.progress };
          delete progress[id];
          return { progress };
        }),
    }),
    {
      name: "quran-coach-listening-journeys-v1",
      partialize: (s) => ({
        preferences: s.preferences,
        progress: s.progress,
        recent: s.recent,
      }),
    },
  ),
);
