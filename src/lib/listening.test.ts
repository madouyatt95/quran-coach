import { describe, expect, it } from "vitest";
import {
  availableSurahs,
  collectionItems,
  downloadId,
  editionMatches,
  listeningSurahs,
  matchesReciter,
  matchesSurah,
} from "./listening";
import { mp3QuranApi } from "./mp3QuranApi";
import { normalizeHistoryTrack } from "../stores/listenStore";
const edition = {
  id: 1,
  name: "Hafs",
  server: "https://example.org/hafs/",
  surah_total: 2,
  moshaf_type: 11,
  surah_list: "1,2",
};
const reciter = {
  id: 123,
  name: "Mishary Al Afasi",
  letter: "M",
  date: "",
  moshaf: [edition],
};
describe("catalogue d’écoute", () => {
  it("retrouve la même voix par son nom affiché, API et arabe", () => {
    for (const query of ["Alafasy", "Mishary Al Afasi", "مِشَارِي", "العفاسي"])
      expect(matchesReciter(reciter, query)).toBe(true);
    expect(matchesReciter(reciter, "Hussary")).toBe(false);
  });
  it("recherche une sourate par numéro exact, français, translittération et arabe", () => {
    const [first, second] = listeningSurahs([
      {
        number: 1,
        name: "الفاتحة",
        englishName: "Al-Faatiha",
        englishNameTranslation: "Opening",
        numberOfAyahs: 7,
        revelationType: "Meccan",
      },
    ]);
    for (const query of [
      "1",
      "١",
      "ouverture",
      "al faatiha",
      "Fatiha",
      "الفَاتِحَة",
    ])
      expect(matchesSurah(first, query)).toBe(true);
    expect(matchesSurah(second, "1")).toBe(false);
  });
  it("n’invente pas de fichiers absents et conserve la bonne édition", () => {
    expect(
      availableSurahs({ ...edition, surah_list: "2,1,2,0,115,no" }),
    ).toEqual([1, 2]);
    const warsh = {
      ...edition,
      id: 2,
      name: "Warch",
      server: "https://example.org/warsh/",
      moshaf_type: 10,
      surah_list: "2",
      surah_total: 1,
    };
    expect(editionMatches(warsh, "warsh")).toBe(true);
    const tracks = collectionItems(
      "123",
      [{ ...reciter, moshaf: [edition, warsh] }],
      [],
      2,
    );
    expect(tracks.map((s) => s.surahNumber)).toEqual([2]);
    expect(tracks[0].audioUrl).toContain("/warsh/002.mp3");
    expect(downloadId(tracks)).not.toBe(
      downloadId(collectionItems("123", [reciter], [])),
    );
    expect(mp3QuranApi.getBestMoshaf([])).toBeUndefined();
  });
  it("récupère les anciens identifiants sans mélanger les collections", () => {
    const old = {
      reciterId: -1,
      reciterName: "",
      surahNumber: 1,
      surahName: "",
      audioUrl:
        "https://archive.org/download/Coran_Arabe_Franais_HoudeyfaInconnu/001.mp3",
      position: 38,
    };
    expect(normalizeHistoryTrack(old).reciterId).toBe("hudhayfi-leclerc");
    expect(
      normalizeHistoryTrack({
        ...old,
        audioUrl: "https://archive.org/download/omar-hisham-al-arabi/001.mp3",
      }).reciterId,
    ).toBe("omar-hisham");
  });
});
