// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { CoachPage } from './CoachPage';
import { FindButton } from '../components/Navigation/FindButton';
const mocks = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock('../lib/coachSearch', () => ({ coachSearch: mocks.search, QUICK_TAGS: [] }));
vi.mock('../stores/quranStore', () => ({ useQuranStore: () => ({ currentSurah: 2, currentAyah: 75, currentPage: 11 }) }));
vi.mock('../stores/settingsStore', () => ({ useSettingsStore: (selector: (state: { viewMode: string }) => unknown) => selector({ viewMode: 'mushaf' }) }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root, container: HTMLDivElement;
function Location() { const location = useLocation(); return <output>{JSON.stringify(location)}</output>; }
beforeEach(() => { vi.useFakeTimers(); mocks.search.mockReset(); mocks.search.mockResolvedValue([{ type: 'verse', title: 'Résultat', source: 'Coran 2:255', emoji: '📖', textAr: '', textFr: '' }]); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); });
async function click(element: Element) { await act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))); }
it('keeps search available from an old chatbot link', async () => {
 await act(async () => root.render(<MemoryRouter initialEntries={['/coach?tab=chatbot&q=patience']}><CoachPage/></MemoryRouter>));
 await act(async () => { await vi.advanceTimersByTimeAsync(400); });
 expect(container.querySelector('input')?.value).toBe('patience');
 expect(mocks.search).toHaveBeenCalledWith('patience');
 expect(container.querySelector('.coach-card')).not.toBeNull();
 expect(container.textContent).not.toContain('Chatbot');
});
it('opens Trouve with a return to the visible passage, not an old reader URL', async () => {
 await act(async () => root.render(<MemoryRouter initialEntries={['/read?surah=1&ayah=1']}><Location/><Routes><Route path="/read" element={<FindButton/>}/><Route path="/coach" element={<CoachPage/>}/></Routes></MemoryRouter>));
 await click(container.querySelector('a')!);
 expect(document.activeElement).toBe(container.querySelector('input'));
 await click(container.querySelector('button.coach-return')!);
 expect(JSON.parse(container.querySelector('output')!.textContent!).search).toBe('?surah=2&ayah=75&page=11');
});
it('opens a result at the exact verse and retains the query and origin for returning', async () => {
 await act(async () => root.render(<MemoryRouter initialEntries={[{ pathname: '/coach', search: '?q=patience', state: { findReturn: { to: '/favorites?collection=abc' } } }]}><Location/><Routes><Route path="/coach" element={<CoachPage/>}/><Route path="/read" element={<div>Lecture</div>}/></Routes></MemoryRouter>));
 await act(async () => { await vi.advanceTimersByTimeAsync(400); });
 await click(container.querySelector('.coach-card')!);
 const location = JSON.parse(container.querySelector('output')!.textContent!);
 expect(location.pathname + location.search).toBe('/read?surah=2&ayah=255');
 expect(location.state.readerReturn.to).toBe('/coach?q=patience');
 expect(location.state.readerReturn.state.findReturn.to).toBe('/favorites?collection=abc');
});
