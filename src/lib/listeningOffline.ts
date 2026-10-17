import type { PlaylistItem } from "../types";
export const JOURNEY_CACHE = "quran-coach-journeys-v1";
export function journeyPackUrls(items: PlaylistItem[]) {
  return [
    ...new Set([
      ...items.map((i) => i.audioUrl!).filter(Boolean),
      "https://api.alquran.cloud/v1/surah",
      ...[...new Set(items.map((i) => i.surahNumber))].flatMap((s) => [
        `https://api.alquran.cloud/v1/surah/${s}/quran-uthmani`,
        `https://api.alquran.cloud/v1/surah/${s}/fr.hamidullah`,
      ]),
      ...items
        .filter((i) => i.verse)
        .map(
          (i) =>
            `https://quranenc.com/api/v1/translation/aya/french_mokhtasar/${i.surahNumber}/${i.verse!.number}`,
        ),
    ]),
  ];
}
export async function packedResponse(url: string) {
  if (typeof caches === "undefined") return undefined;
  try {
    return await (await caches.open(JOURNEY_CACHE)).match(url);
  } catch {
    return undefined;
  }
}
