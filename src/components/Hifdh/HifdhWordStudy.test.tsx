// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useHifdhWordStudy } from './useHifdhWordStudy';
import type { Ayah } from '../../types';
const mock = vi.hoisted(() => ({ load: vi.fn(), stop: vi.fn(), click: vi.fn() }));
vi.mock('../../lib/hifdhWordStudy', () => ({ loadHifdhStudyWords: mock.load }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const ayah: Ayah = { surah: 2, numberInSurah: 13, number: 20, text: 'أَلَا إِنَّهُمْ', page: 3, juz: 1, hizbQuarter: 1 };
function Harness({ enabled = true, scope = 'one' }: { enabled?: boolean; scope?: string }) {
    const study = useHifdhWordStudy(scope, mock.stop);
    return <><span data-testid="word" {...study.bind(ayah, 0, ['أَلَا', 'إِنَّهُمْ'], enabled)} onClick={mock.click}>أَلَا</span>{study.card}</>;
}
let root: Root, host: HTMLDivElement;
const sounds: { src: string; pause: ReturnType<typeof vi.fn>; play: ReturnType<typeof vi.fn> }[] = [];
beforeEach(() => {
    vi.clearAllMocks(); sounds.length = 0;
    mock.load.mockResolvedValue(['أَلَا', 'إِنَّهُمْ'].map((text, index) => ({ page: 3, word: { text, verseKey: '2:13', key: `2:13:${index + 1}`, position: index + 1, audio: `https://audio.test/${index + 1}.mp3`, french: 'Sens', transliteration: 'Phonétique', rules: [], tajweedSegments: [] } })));
    vi.stubGlobal('Audio', class { onplaying: (() => void) | null = null; onended = null; onerror = null; loop = false; pause = vi.fn(); play = vi.fn(async () => { this.onplaying?.(); }); src: string; constructor(src: string) { this.src = src; sounds.push(this); } });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
const render = (enabled = true, scope = 'one') => act(async () => root.render(<MemoryRouter><Harness enabled={enabled} scope={scope}/></MemoryRouter>));
const open = () => act(async () => { host.querySelector('span')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })); });
it('opens the shared word card, suppresses the release click and plays the selected word', async () => {
    await render(); await open();
    await act(async () => host.querySelector('span')!.click());
    expect(mock.click).not.toHaveBeenCalled(); expect(mock.stop).toHaveBeenCalled();
    await act(async () => (document.querySelector('[aria-label="Prononcer le mot"]') as HTMLElement).click());
    expect(sounds[0].src).toBe('https://audio.test/1.mp3'); expect(sounds[0].play).toHaveBeenCalled();
    await act(async () => (document.querySelector('[aria-label="Mot suivant"]') as HTMLElement).click());
    expect(sounds[0].pause).toHaveBeenCalled();
    await act(async () => (document.querySelector('[aria-label="Prononcer le mot"]') as HTMLElement).click());
    expect(sounds[1].src).toBe('https://audio.test/2.mp3');
    await render(true, 'another-passage');
    expect(document.querySelector('.iq-word-card')).toBeNull(); expect(sounds[1].pause).toHaveBeenCalled();
});
it('preserves selection clicks and never opens a card for a hidden word', async () => {
    await render(false); await open();
    await act(async () => host.querySelector('span')!.click());
    expect(mock.click).toHaveBeenCalledOnce(); expect(mock.load).not.toHaveBeenCalled();
    expect(document.querySelector('.iq-word-card')).toBeNull();
});
it('allows retry after loading fails and closing a pending card', async () => {
    mock.load.mockRejectedValueOnce(new Error('offline'));
    await render(); await open(); expect(document.querySelector('[role="alert"]')).not.toBeNull();
    await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent === 'Réessayer')!.click());
    expect(document.querySelector('[aria-label="Prononcer le mot"]')).not.toBeNull();
    await act(async () => (document.querySelector('[aria-label="Fermer la fiche du mot"]') as HTMLElement).click());
    expect(document.querySelector('.iq-word-card')).toBeNull();
});
