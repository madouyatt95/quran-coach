// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  IMMERSIVE_VOICES,
  preparePassages,
  safeSharedAudio,
  withVoice,
  momentUrl,
  fitSession,
  estimatedSeconds,
} from "./listeningExperience";
import { LISTENING_JOURNEYS } from "../data/listeningJourneys";
vi.mock("./quranApi", () => ({
  fetchSurah: vi.fn(async (id: number) => ({
    surah: {
      number: id,
      name: "الفاتحة",
      englishName: "Al-Fatiha",
      numberOfAyahs: 7,
    },
    ayahs: Array.from({ length: 7 }, (_, i) => ({
      number: i + 1,
      numberInSurah: i + 1,
      text: "بسم الله الرحمن الرحيم",
    })),
  })),
  fetchSurahTranslation: vi.fn(
    async () =>
      new Map(
        Array.from({ length: 7 }, (_, i) => [i + 1, `Traduction ${i + 1}`]),
      ),
  ),
}));
const chapter = {
  surah: 1,
  from: 2,
  to: 4,
  title: "Passage",
  introduction: "",
};
describe("séances immersives", () => {
  it("aligne exactement arabe, traduction et audio sur la plage demandée", async () => {
    const items = await preparePassages([chapter], "ar.saoodshuraym");
    expect(items.map((v) => v.verse?.number)).toEqual([2, 3, 4]);
    expect(items[0].verse?.translation).toBe("Traduction 2");
    expect(items[0].audioUrl).toContain("/64/ar.saoodshuraym/2.mp3");
    expect(withVoice(items[0], "ar.abdurrahmaansudais").audioUrl).toContain(
      "/192/ar.abdurrahmaansudais/2.mp3",
    );
    expect(IMMERSIVE_VOICES).toHaveLength(20);
  });
  it("résout la fin de sourate sans dépendre du catalogue déjà chargé", async () => {
    expect(
      await preparePassages([{ ...chapter, to: 0 }], "ar.alafasy"),
    ).toHaveLength(6);
    await expect(
      preparePassages([{ ...chapter, to: 20 }], "ar.alafasy"),
    ).rejects.toThrow("passage");
    await expect(
      preparePassages([{ ...chapter, from: 5 }], "ar.alafasy"),
    ).rejects.toThrow("passage");
  });
  it("borne une séance par versets entiers et produit un lien exact sans texte privé", async () => {
    const items = await preparePassages(
      [{ ...chapter, from: 1, to: 7 }],
      "ar.alafasy",
    );
    const selection = fitSession([...items, ...items, ...items], 1);
    expect(selection.length).toBeLessThan(21);
    expect(estimatedSeconds(selection)).toBeGreaterThanOrEqual(60);
    const u = new URL(momentUrl(items[1], 3, 8));
    expect(u.searchParams.get("from")).toBe("2");
    expect(u.searchParams.get("to")).toBe("2");
    expect(u.searchParams.get("t")).toBe("3");
    expect(u.searchParams.get("end")).toBe("8");
    expect(u.searchParams.has("text")).toBe(false);
  });
  it("refuse les liens audio externes arbitraires et les faux sous-domaines", () => {
    expect(
      safeSharedAudio("https://server8.mp3quran.net/a/001.mp3"),
    ).toBeTruthy();
    for (const url of [
      "javascript:alert(1)",
      "http://server8.mp3quran.net/001.mp3",
      "https://mp3quran.net.evil.org/a.mp3",
      "https://user:pass@server8.mp3quran.net/a.mp3",
    ])
      expect(safeSharedAudio(url)).toBeNull();
  });
  it("les parcours complets couvrent toutes les ayat sans trous ni chevauchements", () => {
    for (const [id, total] of [
      ["kahf", 110],
      ["maryam", 98],
      ["fatiha", 7],
      ["yusuf", 111],
      ["mulk", 30],
      ["rahman", 78],
      ["waqia", 96],
      ["luqman", 34],
      ["hujurat", 18],
    ] as const) {
      const chapters = LISTENING_JOURNEYS.find((j) => j.id === id)!.chapters;
      const verses = chapters.flatMap((c) =>
        Array.from({ length: c.to - c.from + 1 }, (_, i) => c.from + i),
      );
      expect(verses).toEqual(Array.from({ length: total }, (_, i) => i + 1));
    }
  });
});
