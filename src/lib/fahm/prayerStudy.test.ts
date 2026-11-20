import bundled from './prayer-words-ar.json';
import { describe, it, expect } from 'vitest';
import { prayerSurahs, expressionQuiz } from './prayerStudy';
import { loadFrenchWords } from '../interactiveMushaf/french';
describe('récitation en prière', () => {
  it('propose une expression sourcée et deux choix distincts pour chaque verset', async () => {
    let count = 0;
    for (const c of prayerSurahs) {
      const words = await loadFrenchWords(c.id);
      for (let a = 1; a <= c.count; a++) {
        const q = expressionQuiz(words, c.id, a);
        expect(q, `${c.id}:${a}`).toBeTruthy();
        expect(
          (bundled as Record<string, string[]>)[`${c.id}:${a}`]?.[
            q!.position - 1
          ],
        ).toBeTruthy();
        expect(q!.options).toContain(words[`${c.id}:${a}:${q!.position}`]);
        expect(new Set(q!.options).size).toBe(2);
        count++;
      }
    }
    expect(prayerSurahs.map((c) => c.id)).toEqual([
      1,
      ...Array.from({ length: 37 }, (_, i) => 78 + i),
    ]);
    expect(count).toBe(571);
  });
});
