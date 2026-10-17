import type { PlaylistItem } from "../types";
import { fetchSurah, fetchSurahTranslation } from "./quranApi";
import type { ListeningChapter } from "../data/listeningJourneys";

export const IMMERSIVE_VOICES = [
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    bitrate: 128,
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    bitrate: 128,
  },
  {
    id: "ar.minshawi",
    name: "Mohamed Siddiq Al-Minshawi",
    bitrate: 128,
  },
  {
    id: "ar.abdulbasitmurattal",
    name: "Abdul Basit · Murattal",
    bitrate: 192,
  },
  {
    id: "ar.abdullahbasfar",
    name: "Abdullah Basfar",
    bitrate: 192,
  },
  {
    id: "ar.abdurrahmaansudais",
    name: "Abdurrahman As-Sudais",
    bitrate: 192,
  },
  {
    id: "ar.abdulsamad",
    name: "Abdul Basit · Mujawwad",
    bitrate: 64,
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Ash-Shaatree",
    bitrate: 128,
  },
  {
    id: "ar.ahmedajamy",
    name: "Ahmed ibn Ali al-Ajamy",
    bitrate: 128,
  },
  {
    id: "ar.hanirifai",
    name: "Hani Rifai",
    bitrate: 192,
  },
  {
    id: "ar.husarymujawwad",
    name: "Al-Husary · Mujawwad",
    bitrate: 128,
  },
  {
    id: "ar.hudhaify",
    name: "Hudhaify",
    bitrate: 128,
  },
  {
    id: "ar.ibrahimakhbar",
    name: "Ibrahim Akhdar",
    bitrate: 32,
  },
  {
    id: "ar.mahermuaiqly",
    name: "Maher Al Muaiqly",
    bitrate: 128,
  },
  {
    id: "ar.minshawimujawwad",
    name: "Al-Minshawi · Mujawwad",
    bitrate: 64,
  },
  {
    id: "ar.muhammadayyoub",
    name: "Muhammad Ayyoub",
    bitrate: 128,
  },
  {
    id: "ar.muhammadjibreel",
    name: "Muhammad Jibreel",
    bitrate: 128,
  },
  {
    id: "ar.saoodshuraym",
    name: "Saoud Ash-Shuraym",
    bitrate: 64,
  },
  {
    id: "ar.parhizgar",
    name: "Parhizgar",
    bitrate: 48,
  },
  {
    id: "ar.aymanswoaid",
    name: "Ayman Sowaid",
    bitrate: 64,
  },
] as const;
export function immersiveVoice(id: string) {
  return IMMERSIVE_VOICES.find((v) => v.id === id) || IMMERSIVE_VOICES[0];
}
export function verseAudioUrl(voice: string, globalAyah: number) {
  const selected = immersiveVoice(voice);
  return `https://cdn.islamic.network/quran/audio/${selected.bitrate}/${selected.id}/${globalAyah}.mp3`;
}
export function withVoice(item: PlaylistItem, voiceId: string): PlaylistItem {
  if (!item.verse) return item;
  const voice = immersiveVoice(voiceId);
  return {
    ...item,
    reciterId: voice.id,
    reciterName: voice.name,
    audioUrl: verseAudioUrl(voice.id, item.verse.globalNumber),
  };
}
export async function preparePassages(
  chapters: ListeningChapter[],
  voice: string,
): Promise<PlaylistItem[]> {
  const ids = [...new Set(chapters.map((c) => c.surah))];
  const data = await Promise.all(
    ids.map(async (id) => {
      const [arabic, french] = await Promise.all([
        fetchSurah(id),
        fetchSurahTranslation(id),
      ]);
      if (!arabic.ayahs.length || !french.size)
        throw new Error("Texte ou traduction indisponible. Réessayez.");
      return { id, ...arabic, french };
    }),
  );
  return chapters.flatMap((rawChapter) => {
    const chapter = { ...rawChapter };
    const d = data.find((d) => d.id === chapter.surah)!;
    if (chapter.to === 0) chapter.to = d.surah.numberOfAyahs;
    if (
      !Number.isInteger(chapter.from) ||
      !Number.isInteger(chapter.to) ||
      chapter.from < 1 ||
      chapter.to < chapter.from ||
      chapter.to > d.surah.numberOfAyahs
    )
      throw new Error(
        "Ce passage ne correspond pas aux versets de la sourate.",
      );
    return d.ayahs
      .filter(
        (a) => a.numberInSurah >= chapter.from && a.numberInSurah <= chapter.to,
      )
      .map((a) =>
        withVoice(
          {
            surahNumber: d.id,
            surahName: d.surah.englishName,
            surahNameAr: d.surah.name,
            totalAyahs: d.surah.numberOfAyahs,
            playbackType: "surah",
            verse: {
              number: a.numberInSurah,
              globalNumber: a.number,
              text: a.text,
              translation: d.french.get(a.number) || "",
              chapterTitle: chapter.title,
              introduction: chapter.introduction,
              chapterFrom: chapter.from,
              chapterTo: chapter.to,
            },
          },
          voice,
        ),
      );
  });
}
/** Approximate reading duration only. Real session stopping uses actual elapsed playback. */
export function estimatedSeconds(items: PlaylistItem[]) {
  return items.reduce(
    (n, item) =>
      n +
      Math.max(
        5,
        (item.verse?.text.trim().split(/\s+/).length || 10) * 0.85 + 2,
      ),
    0,
  );
}
export function fitSession(items: PlaylistItem[], minutes: number) {
  const budget = Math.max(1, minutes) * 60;
  let duration = 0;
  return items.filter((item, index) => {
    if (duration >= budget && index > 0) return false;
    duration += estimatedSeconds([item]);
    return true;
  });
}
export function momentUrl(item: PlaylistItem, position = 0, end?: number) {
  const q = new URLSearchParams();
  q.set("surah", String(item.surahNumber));
  q.set("voice", item.reciterId || "ar.alafasy");
  if (item.verse) {
    q.set("from", String(item.verse.number));
    q.set("to", String(item.verse.number));
  } else if (item.audioUrl) q.set("audio", item.audioUrl);
  q.set("t", String(Math.max(0, Math.floor(position))));
  if (end !== undefined && end > position) q.set("end", String(Math.ceil(end)));
  return `${window.location.origin}/listen/experience?${q}`;
}
export function safeSharedAudio(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const allowed =
      /(^|\.)mp3quran\.net$/.test(u.hostname) ||
      u.hostname === "cdn.islamic.network" ||
      u.hostname === "download.quranicaudio.com" ||
      u.hostname === "archive.org";
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      allowed &&
      /\.mp3$/i.test(u.pathname)
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export async function shareMoment(
  item: PlaylistItem,
  position: number,
  end?: number,
) {
  const url = momentUrl(item, position, end);
  const title = `${item.surahName}${item.verse ? ` · verset ${item.verse.number}` : ""} — ${item.reciterName || "Quran Coach"}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text: title, url });
      return "Partage ouvert.";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "";
    }
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return "Lien copié : l’écoute commencera à ce moment.";
  }
  throw new Error(
    "Copie indisponible. Ouvrez le lien affiché pour le partager.",
  );
}
