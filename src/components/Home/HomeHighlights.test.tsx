// @vitest-environment jsdom
import {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {MemoryRouter, useLocation} from 'react-router-dom';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
vi.hoisted(() => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: {getItem: (k: string) => values.get(k) || null, setItem: (k: string, v: string) => values.set(k, v), removeItem: (k: string) => values.delete(k)}});
});
const catalog = vi.hoisted(() => ({items: [] as unknown[], loading: false, error: ''}));
vi.mock('../../hooks/useBookCatalog', () => ({useBookCatalog: () => catalog}));
vi.mock('../../lib/widgetService', () => ({updateNextPrayerWidget: vi.fn().mockResolvedValue(undefined)}));
import {HomePrayerCard} from './HomePrayer';
import {calculatedHomePrayers} from './homePrayerModel';
import HomeBooks from './HomeBooks';
import {homeBookCategory, selectHomeBooks} from './homeBookSelection';
import {publishedNext} from '../../lib/publishedPrayerClock';
import {SALATS} from '../../lib/mosquePlanning';
import type {PublishedTimetable} from '../../lib/mosqueTimetables';
import {computeDay, DEFAULT_PRAYER_SETTINGS} from '../../lib/prayerEngine';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {books} from '../../lib/bookLibrary';
import type {LibraryAudio} from '../../lib/audioProduction';

Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true});
const now = Date.parse('2026-10-30T08:00:00Z');
const mosque = {id: 'a', name: 'Mosquée du test', lat: 48, lng: 2, city: 'Paris', sourceUrl: 'https://mawaqit.net/fr/test'};
function timetable(): PublishedTimetable {
    return {mosque, mosqueId: 'a', timezone: 'Europe/Paris', source: 'MAWAQIT', sourceUrl: mosque.sourceUrl, fetchedAt: now, days: [{date: '2026-10-30', prayers: SALATS.map((key, i) => ({key, adhan: '09:10', adhanAt: now + (i + 1) * 600000, iqama: '09:15', iqamaAt: now + (i + 1) * 600000 + 300000})), jumua: []}]};
}
let root: Root, host: HTMLDivElement;
beforeEach(() => {host = document.createElement('div'); document.body.append(host); root = createRoot(host); catalog.items = []; useAudioLibraryStore.setState({positions: {}, bookReading: {}});});
afterEach(async () => {await act(async () => root.unmount()); host.remove();});
async function renderPrayer(t: PublishedTimetable, time: number) {
    await act(async () => root.render(<MemoryRouter><HomePrayerCard event={publishedNext(t, time)} now={time} mosque={mosque} calculatedCity="Paris" published/></MemoryRouter>));
}

it('switches visibly from Adhan to Iqama at Adhan, then to the next prayer', async () => {
    const t = timetable();
    await renderPrayer(t, now);
    expect(host.textContent).toContain('Adhan dans');
    expect(host.querySelector('[role=timer]')?.textContent).toBe('10m 0s');
    await renderPrayer(t, now + 600000);
    expect(host.textContent).toContain('Iqama dans');
    expect(host.textContent).toContain('Adhan passé');
    expect(host.querySelector('[role=timer]')?.textContent).toBe('5m 0s');
    await renderPrayer(t, now + 900000);
    expect(host.querySelector('h2')?.textContent).toBe('Dhouhr');
    expect(host.textContent).toContain('Adhan dans');
});
it('keeps an absent Iqama explicit and exposes both directions without nested links', async () => {
    const t = timetable(); t.days[0].prayers[0].iqama = null; t.days[0].prayers[0].iqamaAt = null;
    await renderPrayer(t, now);
    expect(host.textContent).toContain('Horaires d’Iqama non renseignés');
    expect(host.querySelector('a a')).toBeNull();
    expect(host.querySelector('a[href*="maps.apple.com"]')?.getAttribute('href')).toContain('daddr=48,2');
    expect(host.querySelector('a[href*="google.com/maps"]')).not.toBeNull();
});
it('shows Friday sessions without calling them an Adhan or invented Iqama', async () => {
    const t = timetable(); t.days[0].jumua = [{at: now + 1100000, time: '09:18'}];
    await renderPrayer(t, now + 900000);
    expect(host.textContent).toContain('Jumu’a dans');
    expect(host.querySelector('.home-prayer-stages')).toBeNull();
});
it('does not fabricate a next published time when the following day is missing', async () => {
    const t = timetable();
    await renderPrayer(t, now + 3400000);
    expect(host.textContent).toContain('Le prochain horaire n’est pas encore renseigné');
    expect(host.querySelector('[role=timer]')).toBeNull();
});
it('labels calculated times separately and never attaches mosque Iqama or directions', async () => {
    const event = calculatedHomePrayers(now, 48, 2, DEFAULT_PRAYER_SETTINGS).find(e => e.at > now);
    await act(async () => root.render(<MemoryRouter><HomePrayerCard event={event} now={now} mosque={mosque} calculatedCity="Paris" published={false}/></MemoryRouter>));
    expect(host.textContent).toContain('Horaires calculés · Paris');
    expect(host.textContent).not.toContain('Mosquée du test');
    expect(host.textContent).not.toContain('Iqama');
    expect(host.querySelector('details')).toBeNull();
    expect(calculatedHomePrayers(now, null, null, DEFAULT_PRAYER_SETTINGS)).toEqual([]);
});
it('calculates the real next day after Isha', () => {
    const date = new Date(2026, 9, 30, 23, 59), tomorrow = new Date(2026, 9, 31, 12);
    const next = calculatedHomePrayers(+date, 48, 2, DEFAULT_PRAYER_SETTINGS).find(e => e.at > +date);
    expect(next?.at).toBe(+computeDay(tomorrow, 48, 2, DEFAULT_PRAYER_SETTINGS).times.fajr);
});
it('selects six unique books from all three collections, stable for a local day and rotating tomorrow', () => {
    const day = new Date(2026, 9, 30, 1), selected = selectHomeBooks(day);
    expect(new Set(selected.map(b => b.id)).size).toBe(6);
    for (const category of ['Prophètes', 'Compagnons', 'Histoires et moralités']) expect(selected.filter(b => homeBookCategory(b) === category)).toHaveLength(2);
    expect(selectHomeBooks(new Date(2026, 9, 30, 23))).toEqual(selected);
    expect(selectHomeBooks(new Date(2026, 9, 31))).not.toEqual(selected);
    expect(selectHomeBooks(day, [books[0]])).toEqual([books[0]]);
});
function Location() {return <output>{useLocation().pathname}</output>;}
it('keeps all collection links and opens the existing book page without autoplay', async () => {
    const date = new Date(2026, 9, 30), first = selectHomeBooks(date)[0];
    await act(async () => root.render(<MemoryRouter><HomeBooks date={date}/><Location/></MemoryRouter>));
    expect(host.querySelectorAll('.home-book')).toHaveLength(6);
    for (const path of ['/prophets', '/companions', '/stories', '/listen/library']) expect(host.querySelector(`a[href="${path}"]`)).not.toBeNull();
    expect(host.querySelector('.home-book')?.textContent).toContain('Lire le livre');
    await act(async () => (host.querySelector('.home-book') as HTMLAnchorElement).click());
    expect(host.querySelector('output')?.textContent).toBe(`/books/${first.id}`);
});
it('uses published audio duration and saved listening progress on the cover', async () => {
    const date = new Date(2026, 9, 30), first = selectHomeBooks(date)[0];
    const track: LibraryAudio = {id: 'track', title: `${first.title} · ${first.chapters[0].title}`, reference: `Manuscrit ${first.chapters[0].audioVersion || first.version}, chapitre ${first.chapters[0].id}, segment 1/1`, text: 'Texte', sourceUrl: '', category: 'prophet', narrator: 'George', url: '/audio.mp3', duration: 600, bytes: 100, sentences: []};
    catalog.items = [track];
    useAudioLibraryStore.setState({positions: {track: {seconds: 300, updatedAt: now}}});
    await act(async () => root.render(<MemoryRouter><HomeBooks date={date}/></MemoryRouter>));
    const card = host.querySelector('.home-book')!;
    expect(card.textContent).toContain('10 min d’écoute');
    expect(card.textContent).toContain('Lire ou écouter');
    expect(card.textContent).toContain('50 % écouté');
    expect(card.querySelector('progress')?.getAttribute('value')).toBe('300');
});
