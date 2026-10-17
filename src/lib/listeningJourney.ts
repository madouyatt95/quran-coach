import {
  LISTENING_JOURNEYS,
  type ListeningJourney,
} from "../data/listeningJourneys";
import type { PlaylistItem } from "../types";

export const SESSION_THEMES = [
  {
    id: "discover",
    label: "Surprenez-moi",
    journeys: LISTENING_JOURNEYS.map((j) => j.id),
  },
  {
    id: "hope",
    label: "Espoir et patience",
    journeys: ["hope", "patience", "forgiveness", "maryam", "yusuf"],
  },
  {
    id: "family",
    label: "Famille et relations",
    journeys: ["parents", "luqman", "hujurat", "maryam", "yusuf"],
  },
  {
    id: "gratitude",
    label: "Gratitude et contemplation",
    journeys: ["gratitude", "creation", "rahman", "mulk", "waqia", "kahf"],
  },
  {
    id: "faith",
    label: "Foi et invocation",
    journeys: ["faith", "invocations", "short-surahs", "maryam", "kahf"],
  },
] as const;
/** Minutes estimated from the current Arabic passages, at the default voice and speed.
 * These are used only to avoid proposing a session much shorter than the chosen time;
 * the player still stops using actual playback time.
 */
export const SESSION_ESTIMATE_MINUTES: Record<string, number> = {
  kahf: 27.2, maryam: 17.5, fatiha: 0.7, invocations: 5,
  hope: 3.8, yusuf: 30.6, mulk: 6, rahman: 7.9,
  waqia: 9.2, luqman: 9.4, hujurat: 6, patience: 3,
  gratitude: 5.6, parents: 3.6, giving: 7.4, creation: 5,
  forgiveness: 5.7, "short-surahs": 1.6, faith: 3, time: 2,
};
export function chooseSessionJourney(theme: string, recent: string[], minutes = 0) {
  const pool =
    SESSION_THEMES.find((t) => t.id === theme)?.journeys ||
    SESSION_THEMES[0].journeys;
  const suitable = minutes
    ? pool.filter((id) => (SESSION_ESTIMATE_MINUTES[id] || 0) >= minutes * 0.9)
    : [...pool];
  const choices = suitable.length ? suitable : [...pool];
  // Start with a passage close to the requested duration, then vary the choices.
  return choices.sort((a, b) => {
    const ageA = recent.includes(a) ? recent.indexOf(a) : Infinity;
    const ageB = recent.includes(b) ? recent.indexOf(b) : Infinity;
    if (ageA !== ageB) return ageB - ageA;
    return Math.abs(SESSION_ESTIMATE_MINUTES[a] - minutes) -
      Math.abs(SESSION_ESTIMATE_MINUTES[b] - minutes);
  })[0];
}
export const journeyTotal = (j: ListeningJourney) =>
  j.chapters.reduce((n, c) => n + c.to - c.from + 1, 0);
export function annotateJourney(
  items: PlaylistItem[],
  journey: ListeningJourney,
): PlaylistItem[] {
  return items.map((item) => {
    const step = journey.chapters.findIndex(
      (c) => c.surah === item.surahNumber && c.from === item.verse?.chapterFrom,
    );
    if (step < 0 || !item.verse) return item;
    const ordinal =
      journey.chapters
        .slice(0, step)
        .reduce((n, c) => n + c.to - c.from + 1, 0) +
      item.verse.number -
      journey.chapters[step].from;
    return {
      ...item,
      journey: { id: journey.id, step, ordinal, total: journeyTotal(journey) },
    };
  });
}
export function chapterFinished(
  j: ListeningJourney,
  step: number,
  completed: number[],
) {
  const start = j.chapters
    .slice(0, step)
    .reduce((n, c) => n + c.to - c.from + 1, 0);
  return Array.from(
    { length: j.chapters[step].to - j.chapters[step].from + 1 },
    (_, i) => start + i,
  ).every((i) => completed.includes(i));
}
