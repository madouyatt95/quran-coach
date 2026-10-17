import {
  mp3QuranApi,
  ARABIC_FRENCH_COLLECTION,
  OMAR_HISHAM_COLLECTION,
} from "./mp3QuranApi";
import type { MP3QuranReciter, MP3QuranMoshaf } from "./mp3QuranApi";
import type { PlaylistItem, Surah } from "../types";
import { SURAH_NAMES_FR } from "../components/Mushaf/mushafConstants";

export const RECITER_NAMES: Record<number, string> = {
  54: "Abdurrahman As-Sudais",
  31: "Saud Ash-Shuraim",
  123: "Mishary Rashid Alafasy",
  30: "Saad Al-Ghamidi",
  102: "Maher Al-Muaiqly",
  92: "Yasser Ad-Dossari",
  5: "Ahmed Al-Ajmi",
  107: "Muhammad Al-Luhaidan",
  112: "Mohamed Siddiq Al-Minshawi",
  51: "Abdulbasit Abdussamad",
  118: "Mahmoud Khalil Al-Hussary",
  2: "Ibrahim Al-Jibreen",
  81: "Fares Abbad",
  4: "Abu Bakr Ash-Shatri",
  160: "Adil Al-Kalbani",
};
const ARABIC_ALIASES: Record<number, string> = {
  123: "مشاري راشد العفاسي",
  54: "عبد الرحمن السديس",
  31: "سعود الشريم",
  30: "سعد الغامدي",
  102: "ماهر المعيقلي",
  92: "ياسر الدوسري",
  112: "محمد صديق المنشاوي",
  118: "محمود خليل الحصري",
  51: "عبد الباسط عبد الصمد",
  5: "أحمد العجمي",
};
export const COLLECTIONS = [ARABIC_FRENCH_COLLECTION, OMAR_HISHAM_COLLECTION];
export const reciterKey = (id: string | number) =>
  String(id) === "-1" ? OMAR_HISHAM_COLLECTION.id : String(id);
export const reciterName = (r: MP3QuranReciter) =>
  RECITER_NAMES[r.id] || r.name;
export function normalizeListeningSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .toLowerCase()
    .replace(/([aeiou])\1+/g, "$1")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
export const matchesReciter = (r: MP3QuranReciter, query: string) =>
  normalizeListeningSearch(
    `${r.name} ${reciterName(r)} ${ARABIC_ALIASES[r.id] || ""}`,
  ).includes(normalizeListeningSearch(query));
export function availableSurahs(edition?: MP3QuranMoshaf): number[] {
  return [
    ...new Set(
      (edition?.surah_list || "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114),
    ),
  ].sort((a, b) => a - b);
}
export function editionMatches(edition: MP3QuranMoshaf, filter: string) {
  if (filter === "hafs")
    return edition.moshaf_type === 11 || /hafs|hafss|حفص/i.test(edition.name);
  if (filter === "warsh") return /warsh|warch|ورش/i.test(edition.name);
  return true;
}
export function listeningSurahs(surahs: Surah[]) {
  return Array.from({ length: 114 }, (_, i) => {
    const s = surahs.find((s) => s.number === i + 1);
    return {
      number: i + 1,
      name: s?.name || "",
      french: SURAH_NAMES_FR[i + 1],
      transliteration: s?.englishName || "",
      total: s?.numberOfAyahs || 0,
    };
  });
}
export function matchesSurah(
  s: ReturnType<typeof listeningSurahs>[number],
  query: string,
) {
  const q = normalizeListeningSearch(query);
  return (
    !q ||
    (/^\d+$/.test(q)
      ? s.number === Number(q)
      : normalizeListeningSearch(
          `${s.name} ${s.french} ${s.transliteration}`,
        ).includes(q))
  );
}
export function collectionItems(
  id: string,
  reciters: MP3QuranReciter[],
  surahs: Surah[],
  editionId?: number,
): PlaylistItem[] {
  id = reciterKey(id);
  const custom = COLLECTIONS.find((c) => c.id === id);
  const r = reciters.find((r) => String(r.id) === id);
  const edition =
    r?.moshaf.find((m) => m.id === editionId) ||
    mp3QuranApi.getBestMoshaf(r?.moshaf || []);
  if (!custom && !edition?.server) return [];
  const available = custom?.surahs || availableSurahs(edition);
  return listeningSurahs(surahs)
    .filter((s) => available.includes(s.number))
    .map((s) => ({
      surahNumber: s.number,
      surahName: s.french,
      surahNameAr: s.name,
      transliteration: s.transliteration,
      totalAyahs: s.total,
      reciterId: id,
      reciterName: custom?.name || (r ? reciterName(r) : ""),
      audioUrl: custom
        ? custom.getAudioUrl(s.number)
        : mp3QuranApi.getAudioUrl(edition!.server, s.number),
      playbackType: "surah",
    }));
}
export function downloadId(items: PlaylistItem[]) {
  const key = items.map((s) => s.audioUrl).join("|");
  let hash = 2166136261;
  for (const c of key) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return `listen-${(hash >>> 0).toString(36)}`;
}
export const formatListeningTime = (s: number) =>
  `${Math.floor(Math.max(0, s || 0) / 60)}:${String(Math.floor(Math.max(0, s || 0) % 60)).padStart(2, "0")}`;
