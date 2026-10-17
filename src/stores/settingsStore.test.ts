// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('reading mode preference', () => {
    beforeEach(() => {
        const values = new Map<string,string>();
        vi.stubGlobal('localStorage', { getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => values.set(key,value), removeItem: (key:string) => values.delete(key) });
        vi.resetModules();
    });
    afterEach(() => vi.unstubAllGlobals());
    it('opens the interactive Tajwid Mushaf for a new reader', async () => {
        const { useSettingsStore } = await import('./settingsStore');
        expect(useSettingsStore.getState().viewMode).toBe('tajweed-interactive');
    });
    it.each(['tajweed', 'madinah'] as const)('migrates the retired %s preference without changing other settings', async mode => {
        localStorage.setItem('quran-coach-settings', JSON.stringify({ version: 8, state: { viewMode: mode, theme: 'light', selectedReciter: 'ar.husary', playbackSpeed: 0.75 } }));
        const { useSettingsStore } = await import('./settingsStore');
        expect(useSettingsStore.getState()).toMatchObject({ viewMode: 'tajweed-interactive', theme: 'light', selectedReciter: 'ar.husary', playbackSpeed: 0.75 });
        useSettingsStore.getState().setViewMode(mode);
        expect(useSettingsStore.getState().viewMode).toBe('tajweed-interactive');
    });
    it.each(['mushaf', 'tajweed-interactive'] as const)('preserves a saved %s choice after reload', async mode => {
        const { useSettingsStore } = await import('./settingsStore');
        useSettingsStore.getState().setViewMode(mode);
        vi.resetModules();
        const restored = await import('./settingsStore');
        expect(restored.useSettingsStore.getState().viewMode).toBe(mode);
    });
});
