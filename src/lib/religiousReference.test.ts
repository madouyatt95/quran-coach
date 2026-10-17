import { describe, expect, it } from 'vitest';
import { religiousReference } from './religiousReference';

describe('religious source transparency', () => {
  it('links a precise Quran reference and keeps collection-only hadiths pending', () => {
    expect(religiousReference('Verset', 'Al-Baqarah 2:30')).toMatchObject({ url: 'https://quran.com/2/30', pending: false });
    expect(religiousReference('Hadith', 'Bukhari & Muslim')).toMatchObject({ pending: true });
  });

  it('accepts a direct source link without accepting arbitrary URLs', () => {
    expect(religiousReference('Invocation', 'Hisn 75', 'https://sunnah.com/hisn:75').pending).toBe(false);
    expect(religiousReference('Hadith', 'Bukhari', 'https://example.com/bukhari:1')).toMatchObject({ pending: true });
  });
});
