// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
import { useListeningEvidenceStore } from './listeningEvidenceStore';

beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    useListeningEvidenceStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
    useListeningEvidenceStore.setState({ entries: [] });
});

it('stores exact completed passages and allows removing only the mistaken record', async () => {
    const store = useListeningEvidenceStore.getState();
    store.recordVerse(2, 75, 'mushaf');
    store.recordSurah(1);
    store.recordVerse(0, 1, 'mushaf');
    expect(useListeningEvidenceStore.getState().entries).toHaveLength(2);
    const id = useListeningEvidenceStore.getState().entries.find(e => e.ayah === 75)!.id;
    store.remove(id);
    await useListeningEvidenceStore.persist.rehydrate();
    expect(useListeningEvidenceStore.getState().entries).toMatchObject([{ surah: 1, source: 'lecteur' }]);
});
