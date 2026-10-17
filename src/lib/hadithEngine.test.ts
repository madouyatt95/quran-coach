import { describe, expect, it } from 'vitest';
import { getHadithOfDay } from './hadithEngine';

describe('daily hadith', () => {
  it('never displays an excerpt whose source text already ends in an ellipsis', () => {
    for (let day = 1; day <= 31; day++) {
      const hadith = getHadithOfDay(new Date(2026, 0, day, 12));
      expect(hadith.textAr).not.toMatch(/…|\.{3}/);
      expect(hadith.textFr).not.toMatch(/…|\.{3}/);
    }
  });
});
