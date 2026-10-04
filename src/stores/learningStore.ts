import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildDailySession,
  localDay,
  passageKey,
  type Passage,
  type Recall,
  type LearningRecord,
  type SessionStep,
} from "../lib/learning";
import type { SRSCard } from "./srsStore";
interface DailySession {
  date: string;
  minutes: 5 | 10 | 20;
  steps: SessionStep[];
  done: string[];
  skipped: string[];
}
interface LearningState {
  minutes: 5 | 10 | 20;
  session: DailySession | null;
  records: Record<string, LearningRecord>;
  engine: "standard" | "tilawa";
  setEngine: (engine: "standard" | "tilawa") => void;
  start: (
    minutes: 5 | 10 | 20,
    cards: Record<string, SRSCard>,
    passage: Passage,
  ) => void;
  completeStep: (id: string, skipped?: boolean) => void;
  recordRecall: (passage: Passage, recall: Recall) => void;
}
export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      minutes: 10,
      session: null,
      records: {},
      engine: "standard",
      setEngine: (engine) => set({ engine }),
      start: (minutes, cards, passage) =>
        set({
          minutes,
          session: {
            date: localDay(),
            minutes,
            steps: buildDailySession(minutes, cards, passage),
            done: [],
            skipped: [],
          },
        }),
      completeStep: (id, skipped = false) =>
        set((state) => {
          const session = state.session;
          if (
            !session ||
            session.date !== localDay() ||
            !session.steps.some((s) => s.id === id)
          )
            return state;
          const key = skipped ? "skipped" : "done";
          const other = skipped ? "done" : "skipped";
          return {
            session: {
              ...session,
              [other]: session[other].filter((s) => s !== id),
              [key]: [...new Set([...session[key], id])],
            },
          };
        }),
      recordRecall: (passage, recall) =>
        set((state) => ({
          records: {
            ...state.records,
            [passageKey(passage)]: {
              recall,
              lastPracticed: new Date().toISOString(),
              attempts: (state.records[passageKey(passage)]?.attempts || 0) + 1,
            },
          },
        })),
    }),
    { name: "quran-coach-learning-v1" },
  ),
);
