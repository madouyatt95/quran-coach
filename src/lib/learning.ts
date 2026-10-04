import type { SRSCard } from "../stores/srsStore";
export interface Passage {
  surah: number;
  ayah: number;
}
export type Recall = "learning" | "assisted" | "independent" | "consolidate";
export interface LearningRecord {
  recall: Recall;
  lastPracticed: string;
  attempts: number;
}
export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const passageKey = (p: Passage) => `${p.surah}:${p.ayah}`;
export const passageUrl = (p: Passage) =>
  `/passage?surah=${p.surah}&ayah=${p.ayah}`;
export function parsePassage(params: URLSearchParams): Passage {
  const integer = (value: string | null, fallback: number, max: number) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 && n <= max ? n : fallback;
  };
  return {
    surah: integer(params.get("surah"), 1, 114),
    ayah: integer(params.get("ayah"), 1, 286),
  };
}
export interface SessionStep extends Passage {
  id: string;
  kind: "review" | "understand" | "listen" | "recite";
  label: string;
}
export function buildDailySession(
  minutes: 5 | 10 | 20,
  cards: Record<string, SRSCard>,
  next: Passage,
  today = localDay(),
): SessionStep[] {
  const limit = minutes === 5 ? 1 : minutes === 10 ? 2 : 4;
  const reviews = Object.values(cards)
    .filter((c) => c.nextReviewDate <= today)
    .sort(
      (a, b) =>
        a.nextReviewDate.localeCompare(b.nextReviewDate) ||
        a.surah - b.surah ||
        a.ayah - b.ayah,
    )
    .slice(0, limit);
  return [
    ...reviews.map((c) => ({
      id: `review-${c.id}`,
      kind: "review" as const,
      label: "Réviser sans regarder",
      surah: c.surah,
      ayah: c.ayah,
    })),
    {
      ...next,
      id: "understand",
      kind: "understand",
      label: "Lire et comprendre",
    },
    { ...next, id: "listen", kind: "listen", label: "Écouter le récitateur" },
    {
      ...next,
      id: "recite",
      kind: "recite",
      label: "Réciter et programmer la révision",
    },
  ];
}
export function masteryLabel(
  record?: LearningRecord,
  card?: SRSCard,
  today = localDay(),
): string {
  if (card && card.nextReviewDate <= today) return "À réviser";
  if (record?.recall === "consolidate") return "À consolider";
  if (
    record?.recall === "independent" &&
    card &&
    card.repetitions >= 3 &&
    card.interval >= 7
  )
    return "Stable selon vos révisions";
  if (record?.recall === "independent") return "Rappelé sans aide";
  if (record?.recall === "assisted") return "Récité avec aide";
  return "En apprentissage";
}
export function differingWordIndices(a: string[], b: string[]): Set<number> {
  // LCS keeps repeated words aligned and highlights insertions as well as substitutions.
  const rows = Array.from(
    { length: a.length + 1 },
    () => new Uint16Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      rows[i][j] =
        a[i] === b[j]
          ? rows[i + 1][j + 1] + 1
          : Math.max(rows[i + 1][j], rows[i][j + 1]);
  const same = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      same.add(i++);
      j++;
    } else if (rows[i + 1][j] >= rows[i][j + 1]) i++;
    else j++;
  }
  return new Set(
    a.map((_, index) => index).filter((index) => !same.has(index)),
  );
}
