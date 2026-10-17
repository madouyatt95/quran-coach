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
  recordRecall: (passage: Passage, recall: Recall, origin?: 'journey' | 'passage') => void;
  correctJourneyRecall: (passage: Passage, remaining: Array<{ at: string; outcome: string; scope?: 'phrase' | 'verse' }>) => void;
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
      recordRecall: (passage, recall, origin: 'journey' | 'passage' = 'passage') =>
        set((state) => ({
          records: {
            ...state.records,
            [passageKey(passage)]: {
              recall,
              lastPracticed: new Date().toISOString(),
              attempts: (state.records[passageKey(passage)]?.attempts || 0) + 1,
              origin,
            },
          },
        })),
      correctJourneyRecall: (passage, remaining) => set(state => {
        const key = passageKey(passage), current = state.records[key];
        if (!current || current.origin !== 'journey') return state;
        const latest = [...remaining].filter(a => a.scope !== 'phrase' && a.outcome !== 'uncertain').sort((a,b) => b.at.localeCompare(a.at))[0];
        const records = { ...state.records };
        if (!latest) delete records[key];
        else records[key] = { ...current, recall: latest.outcome === 'independent' ? 'independent' : latest.outcome === 'assisted' ? 'assisted' : 'consolidate', lastPracticed: latest.at, attempts: Math.max(1,current.attempts - 1) };
        return { records };
      }),
    }),
    { name: "quran-coach-learning-v1" },
  ),
);
