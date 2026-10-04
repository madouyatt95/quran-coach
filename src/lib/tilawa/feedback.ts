import type { WordVerdict } from "@tilawa/core";
import { normalizeRecitationWord } from "../recitationMatching";
export const issueLabels: Record<string, string> = {
  possible_omission: "Omission possible",
  possible_substitution: "Substitution possible",
  possible_vowel: "Voyelle à vérifier",
  possible_repetition: "Répétition possible",
  possible_skipped_ayah: "Verset possiblement sauté",
  unclear_ayah: "Passage mal reconnu",
};
export function compatibleWords(expected: string[], corpus: string[]): boolean {
  return (
    expected.length === corpus.length &&
    expected.every(
      (word, i) =>
        normalizeRecitationWord(word) === normalizeRecitationWord(corpus[i]),
    )
  );
}
export function recognizedIndices(
  verdicts: WordVerdict[],
  surah: number,
  ayah: number,
  start: number,
): Set<number> {
  return new Set(
    verdicts
      .filter(
        (v) =>
          v.surah === surah &&
          v.ayah === ayah &&
          v.word >= start &&
          v.state === "ok",
      )
      .map((v) => v.word),
  );
}

/** The API prepends an unnumbered basmala to some first ayahs; the acoustic corpus does not. */
export function corpusWordOffset(expected: string[], corpus: string[], surah: number, ayah: number): number | null {
  if (compatibleWords(expected, corpus)) return 0;
  const basmala = ['بسم', 'الله', 'الرحمن', 'الرحيم'];
  if (surah !== 1 && surah !== 9 && ayah === 1 && compatibleWords(expected.slice(0, 4), basmala) && compatibleWords(expected.slice(4), corpus)) return 4;
  return null;
}
