import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ListeningEvidence {
    id: string;
    surah: number;
    ayah?: number;
    at: string;
    source: 'mushaf' | 'memorisation' | 'lecteur' | 'passage';
}

interface ListeningEvidenceState {
    entries: ListeningEvidence[];
    recordVerse: (surah: number, ayah: number, source: ListeningEvidence['source']) => void;
    recordSurah: (surah: number) => void;
    remove: (id: string) => void;
}

const fallbackEntries = new Map<string, string>();
const evidenceStorage = createJSONStorage(() => {
    try {
        const storage = globalThis.localStorage;
        if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function' && typeof storage.removeItem === 'function') return storage;
    } catch { /* Storage may be unavailable in tests or private browsing. */ }
    return {
        getItem: (key: string) => fallbackEntries.get(key) ?? null,
        setItem: (key: string, value: string) => { fallbackEntries.set(key, value); },
        removeItem: (key: string) => { fallbackEntries.delete(key); },
    };
});

export const useListeningEvidenceStore = create<ListeningEvidenceState>()(persist((set) => ({
    entries: [],
    recordVerse: (surah, ayah, source) => set(state => {
        if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) return state;
        return { entries: [{ id: crypto.randomUUID(), surah, ayah, at: new Date().toISOString(), source }, ...state.entries].slice(0, 2000) };
    }),
    recordSurah: surah => set(state => {
        if (!Number.isInteger(surah) || surah < 1 || surah > 114) return state;
        return { entries: [{ id: crypto.randomUUID(), surah, at: new Date().toISOString(), source: 'lecteur' as const }, ...state.entries].slice(0, 2000) };
    }),
    remove: id => set(state => ({ entries: state.entries.filter(entry => entry.id !== id) })),
}), { name: 'quran-coach-listening-evidence-v1', storage: evidenceStorage }));
