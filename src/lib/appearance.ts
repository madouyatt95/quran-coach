import type { Theme } from '../types';

export const APPEARANCES: { id: Theme; label: string; description: string; color: string }[] = [
    { id: 'violet', label: 'Original', description: 'Bleu nuit, indigo et doré', color: '#1a1a2e' },
    { id: 'dark', label: 'Sombre sobre', description: 'Anthracite et touches dorées', color: '#0d1117' },
    { id: 'light', label: 'Clair', description: 'Lumineux et épuré', color: '#ffffff' },
    { id: 'sepia', label: 'Sépia', description: 'Papier chaud et doux', color: '#f4ecd8' },
];

export function applyAppearance(theme: Theme) {
    // Violet shares the dark reading/tajwid contrast rules, with its own palette.
    document.documentElement.dataset.theme = theme === 'violet' ? 'dark' : theme;
    document.documentElement.dataset.appearance = theme;
    document.documentElement.style.colorScheme = theme === 'violet' || theme === 'dark' ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', APPEARANCES.find(a => a.id === theme)!.color);
}

export function migrateAppearance<T extends { theme?: Theme }>(settings: T, version: number): T {
    return version < 8 && (!settings.theme || settings.theme === 'dark')
        ? { ...settings, theme: 'violet' }
        : settings;
}
