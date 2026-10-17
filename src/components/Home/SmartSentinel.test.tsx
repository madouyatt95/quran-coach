// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../../test/memoryStorage';
import { SmartSentinel, SentinelShortcut } from './SmartSentinel';
import { SentinellePage } from '../../pages/SentinellePage';
import { useSmartStore } from '../../stores/smartStore';
import { usePrayerStore } from '../../stores/prayerStore';
import { useCompanionStore } from '../../stores/companionStore';
import type { CompanionCard } from '../../lib/companion';
const mockFeed = vi.hoisted(() => ({ cards: [] as CompanionCard[], upcoming: [] as CompanionCard[], completed: [], now: Date.now() }));
vi.mock('../../hooks/useSmartCoaching', () => ({ useSmartCoaching: () => mockFeed }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const reminder: CompanionCard = { id:'evening:today', topic:'evening', origin:'sentinel', emoji:'🌇', title:'Votre moment du soir', message:'Les invocations du soir.', reason:'Selon votre ville.', minutes:5, route:'/adhkar?cat=evening', action:'Ouvrir les invocations', kind:'Invocation', priority:74 };
let root: Root, div: HTMLDivElement;
beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    useCompanionStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
    useSmartStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
    useCompanionStore.setState({ seenReminders:{}, done:{}, saved:[], muted:[], evidence:[] });
    useSmartStore.setState({ globalEnabled:true });
    usePrayerStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
    usePrayerStore.setState({ lat:48.85, lng:2.35 });
    mockFeed.cards = [{...reminder, id:'coach', origin:'coach', title:'Conseil du coach'}, reminder];
    mockFeed.upcoming = [];
    div = document.createElement('div'); document.body.append(div); root = createRoot(div);
});
afterEach(async () => { await act(async () => root.unmount()); div.remove(); vi.unstubAllGlobals(); });
async function home() { await act(async () => root.render(<MemoryRouter><SentinelShortcut feed={mockFeed}/><SmartSentinel feed={mockFeed}/></MemoryRouter>)); }
it('exposes the sentinel action without unfolding or substituting a coach card', async () => {
    await home();
    expect(div.querySelector('h3')?.textContent).toBe(reminder.title);
    expect(div.querySelector('a[href="/adhkar?cat=evening"]')).not.toBeNull();
    expect(div.querySelector('section > details')).toBeNull();
    expect(div.querySelector('h2')).toBeNull();
    expect(div.querySelector('section')?.textContent).not.toContain('Sentinelle');
    expect(div.querySelector('.home-sentinel-shortcut')?.getAttribute('href')).toBe('/sentinel?space=sentinel');
});
it('keeps disabled and missing-location states actionable without clearing preferences', async () => {
    useSmartStore.setState({globalEnabled:false, alKahfEnabled:false}); await home();
    expect(div.querySelector('.home-sentinel-dot')).toBeNull();
    await act(async () => (div.querySelector('.home-reminder-card button') as HTMLButtonElement).click());
    expect(useSmartStore.getState().globalEnabled).toBe(true);
    expect(useSmartStore.getState().alKahfEnabled).toBe(false);
    mockFeed.cards=[];
    await act(async () => usePrayerStore.setState({lat:null,lng:null}));
    expect(div.querySelector('a[href="/prayers"]')?.getAttribute('href')).toBe('/prayers');
});
it('shows a future reminder without offering to mark it done, then a calm state', async () => {
    mockFeed.cards=[]; mockFeed.upcoming=[{...reminder, startsAt:Date.now()+3600000}]; await home();
    expect(div.textContent).toContain('À venir ·');
    expect(Array.from(div.querySelectorAll('button')).some(button=>button.textContent==='Déjà fait ✓')).toBe(false);
    expect(div.querySelector('.home-sentinel-dot')).toBeNull();
    mockFeed.upcoming=[]; await home(); expect(div.textContent).toContain('Tout est calme pour le moment');
});
it('opens reminders directly and marks consultation without marking accomplishment', async () => {
    await home(); expect(div.querySelector('.home-sentinel-dot')).not.toBeNull();
    await act(async () => root.render(<MemoryRouter key="reminders" initialEntries={['/sentinel?space=sentinel']}><SentinellePage/></MemoryRouter>));
    expect(Array.from(div.querySelectorAll('.companion-tabs button')).find(b=>b.getAttribute('aria-pressed')==='true')?.textContent).toContain('Mes rappels');
    expect(useCompanionStore.getState().seenReminders[reminder.id]).toBeTruthy();
    expect(useCompanionStore.getState().seenReminders.coach).toBeUndefined();
    expect(useCompanionStore.getState().done).toEqual({});
    await home(); expect(div.querySelector('.home-sentinel-dot')).toBeNull();
    expect(JSON.parse(localStorage.getItem('quran-coach-companion-v1')!).state.seenReminders[reminder.id]).toBeTruthy();
});

it('shows all current reminders before upcoming ones and consultation is not accomplishment', async () => {
    mockFeed.cards.push({...reminder,id:'night',title:'Avant le repos',route:'/read?surah=67'});
    mockFeed.upcoming=[{...reminder,id:'tomorrow',title:'Demain matin',startsAt:Date.now()+3600000}];
    await home();
    expect(Array.from(div.querySelectorAll('.home-reminder-card h3')).map(node=>node.textContent)).toEqual([reminder.title,'Avant le repos','Demain matin']);
    await act(async () => (div.querySelector('.home-reminder-link') as HTMLAnchorElement).click());
    expect(useCompanionStore.getState().seenReminders[reminder.id]).toBeTruthy();
    expect(useCompanionStore.getState().done).toEqual({});
});
