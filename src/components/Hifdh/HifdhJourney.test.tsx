// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../../test/memoryStorage';
import { HifdhJourney } from './HifdhJourney';
import { useHifdhJourneyStore } from '../../stores/hifdhJourneyStore';
import { useLearningStore } from '../../stores/learningStore';
import { useSRSStore } from '../../stores/srsStore';
import type { Ayah } from '../../types';
const m = vi.hoisted(() => ({ fetch: vi.fn(), stop: vi.fn(), finish: vi.fn(), start: vi.fn() }));
vi.mock('../../lib/quranApi', () => ({ fetchSurah: m.fetch, getAudioUrl: () => '/audio.mp3' }));
vi.mock('../../hooks/useCoach', () => ({ useCoach: () => ({ stopCoachListening: m.stop, finishCoachListening: m.finish, startCoachListening: m.start, selectCoachMode: vi.fn(), setDuoPhase: vi.fn(), wordStates: new Map(), allCoachWords: [], coachTotalProcessed: 0, coachMistakesCount: 0, coachUncertainCount: 0, resetCoach: vi.fn() }) }));
vi.mock('./HifdhOffline', () => ({ HifdhOffline: () => null }));
vi.mock('./HifdhSimilar', () => ({ HifdhSimilar: () => null }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root, host: HTMLDivElement;
const verses: Ayah[] = [{ surah: 112, numberInSurah: 1, number: 6222, text: 'قل هو الله أحد', page: 604, juz: 30, hizbQuarter: 240 }];
const click = async (text: string) => act(async () => { const button = Array.from(host.querySelectorAll('button')).find(b => b.textContent?.startsWith(text)); if (!button)
    throw Error(`missing ${text}`); button.click(); });
const mount = async (view: 'session' | 'training' | 'progress' = 'session', entry = '/hifdh') => act(async () => root.render(<MemoryRouter initialEntries={[entry]}><HifdhJourney view={view} ayahs={verses} errors={[]} onActive={() => { }} onStart={() => { }}/></MemoryRouter>));
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('localStorage', createMemoryStorage()); useHifdhJourneyStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) }); useLearningStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) }); useSRSStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) }); useHifdhJourneyStore.setState({ plan: null, attempts: [] }); useLearningStore.setState({ records: {}, minutes: 5 }); useSRSStore.setState({ cards: {} }); m.fetch.mockResolvedValue({ ayahs: verses }); m.finish.mockResolvedValue(undefined); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
it('does not record mastery until the hidden recall is explicitly rated', async () => {
    await mount();
    await click('Commencer ma séance');
    await click('Continuer avec le texte');
    await click('J’ai récité avec le texte');
    await click('Continuer · Rappeler sans aide');
    expect(useHifdhJourneyStore.getState().attempts).toHaveLength(0);
    expect(host.querySelector('.journey-verse')?.textContent).not.toContain('قل');
    await click('J’ai terminé');
    await click('Récité seul');
    expect(useHifdhJourneyStore.getState().attempts[0]).toMatchObject({ surah: 112, ayah: 1, outcome: 'independent' });
    expect(useLearningStore.getState().records['112:1'].recall).toBe('independent');
    expect(host.textContent).toContain('Séance terminée');
});
it('retains assistance and the exact phase when leaving and resuming', async () => {
    await mount();
    await click('Commencer ma séance');
    await click('Continuer avec le texte');
    await click('J’ai récité avec le texte');
    await click('Continuer · Rappeler sans aide');
    await click('Un mot d’aide');
    await click('Quitter et conserver');
    await click('Reprendre la séance');
    expect(useHifdhJourneyStore.getState().plan).toMatchObject({ phase: 2, hints: 1 });
    await click('J’ai terminé');
    const independent = Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Récité seul')!;
    expect(independent.disabled).toBe(true);
    await click('Avec aide');
    expect(useHifdhJourneyStore.getState().attempts[0]).toMatchObject({ outcome: 'assisted', hints: 1 });
});
it('adds one repair after a failed test, without automatically claiming any mastery', async () => {
    await mount('training');
    await click('Me tester');
    await click('J’ai terminé');
    await click('À consolider');
    expect(useHifdhJourneyStore.getState().plan?.exercises[1].kind).toBe('repair');
    expect(useHifdhJourneyStore.getState().plan?.cursor).toBe(1);
    expect(useLearningStore.getState().records['112:1']).toBeUndefined();
    expect(host.textContent).toContain('Écouter la portion');
});
it('records an unassessed attempt without changing SRS or mastery', async () => {
    await mount('training');
    await click('Me tester');
    await click('J’ai terminé');
    await click('Non évalué');
    expect(useSRSStore.getState().cards).toEqual({});
    expect(useLearningStore.getState().records).toEqual({});
});
it('opens an unfinished guided journey directly from the menu resume route', async () => {
    useHifdhJourneyStore.setState({ plan: { day: '2026-10-08', minutes: 5, phase: 1, cursor: 0,
        exercises: [{ surah: 112, ayah: 1, kind: 'learn', reason: 'Reprendre' }] } });
    await mount('session', '/hifdh?resume=journey');
    expect(host.textContent).toContain('Quitter et conserver ma séance');
    expect(host.querySelector('.journey-verse')?.textContent).toContain('قل');
});
