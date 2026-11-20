import chapters from '../interactiveMushaf/chapters.json';
export const prayerSurahs = chapters.filter((c) => c.id === 1 || c.id >= 78);

/** Keep the supplied French wording and choose a distractor absent from the whole verse. */
export function expressionQuiz(
  words: Record<string, string>,
  surah: number,
  ayah: number,
) {
  const prefix = `${surah}:${ayah}:`;
  const entries = Object.entries(words);
  const verse = entries.filter(
    ([key, text]) => key.startsWith(prefix) && text.trim(),
  );
  const correct = [...verse].sort((a, b) => b[1].length - a[1].length)[0];
  if (!correct) return null;
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase('fr')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  const full = normalize(verse.map(([, text]) => text).join(' '));
  const others = entries.filter(
    ([key, text]) =>
      !key.startsWith(prefix) &&
      normalize(text).length > 3 &&
      !full.includes(normalize(text)) &&
      !normalize(text).includes(normalize(correct[1])),
  );
  if (!others.length) return null;
  const alternate = others[(surah + ayah) % others.length][1];
  return {
    expression: correct[1],
    position: Number(correct[0].split(':')[2]),
    options:
      (surah + ayah) % 2 ? [correct[1], alternate] : [alternate, correct[1]],
  };
}
