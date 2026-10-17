// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { applyAppearance, migrateAppearance } from './appearance';

describe('appearance preferences', () => {
  it('introduces violet once while preserving unrelated settings and light/sepia choices', () => {
    const old = { theme: 'dark' as const, arabicFontSize: 'xl', selectedReciter: 'ar.alafasy', tajwidEnabled: true };
    expect(migrateAppearance(old, 7)).toEqual({ ...old, theme: 'violet' });
    for (const theme of ['light', 'sepia'] as const) {
      expect(migrateAppearance({ ...old, theme }, 7).theme).toBe(theme);
    }
    expect(migrateAppearance(old, 8)).toEqual(old); // choosing sober dark remains persistent
  });
  it('uses dark contrast for violet and removes the palette when switching away', () => {
    document.head.innerHTML = '<meta name="theme-color" content="#000">';
    applyAppearance('violet');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.appearance).toBe('violet');
    expect(document.querySelector('meta')?.content).toBe('#1a1a2e');
    applyAppearance('sepia');
    expect(document.documentElement.dataset.theme).toBe('sepia');
    expect(document.documentElement.dataset.appearance).toBe('sepia');
    expect(document.documentElement.style.colorScheme).toBe('light');
    applyAppearance('dark');
    expect(document.documentElement.dataset.appearance).toBe('dark');
  });
});
