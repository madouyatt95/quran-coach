// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
import { useHifdhJourneyStore } from './hifdhJourneyStore';
import { useLearningStore } from './learningStore';

beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    useHifdhJourneyStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
    useLearningStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
    useHifdhJourneyStore.setState({ attempts: [], plan: null });
    useLearningStore.setState({ records: {} });
});

it('corrects a mistaken journey result without removing unrelated learning records', () => {
    const journey = useHifdhJourneyStore.getState();
    const learning = useLearningStore.getState();
    journey.record({ surah: 2, ayah: 75, outcome: 'independent', scope: 'verse', hints: 0, kind: 'recall' }, '2026-10-01T12:00:00Z');
    learning.recordRecall({ surah: 2, ayah: 75 }, 'independent', 'journey');
    learning.recordRecall({ surah: 1, ayah: 1 }, 'independent');
    journey.removeAttempt(useHifdhJourneyStore.getState().attempts[0].id);
    expect(useLearningStore.getState().records['2:75']).toBeUndefined();
    expect(useLearningStore.getState().records['1:1'].recall).toBe('independent');
});
