import { expect, it, vi } from 'vitest';
import { loadHifdhStudyWords } from './hifdhWordStudy';
const load = vi.hoisted(() => vi.fn());
vi.mock('./interactiveMushaf/service', () => ({ loadInteractivePage: load }));
vi.mock('./interactiveMushaf/model', () => ({ PAGE_MANIFEST: { 3: { verseKeys: ['2:13'] }, 4: { verseKeys: ['2:13'] } } }));
it('keeps canonical audio positions when a verse spans pages and excludes verse medals', async () => {
    load.mockImplementation(async (page: number) => ({ page, words: page === 3
        ? [{ kind: 'word', verseKey: '2:13', position: 1, text: 'أَلَآ', audio: '001.mp3' }]
        : [{ kind: 'word', verseKey: '2:13', position: 2, text: 'إِنَّهُمْ', audio: '002.mp3' }, { kind: 'end', verseKey: '2:13', position: 3, text: '١٣' }] }));
    const words = await loadHifdhStudyWords('2:13', ['أَلَا', 'إِنَّهُمْ']);
    expect(words.map(item => [item.word.audio, item.page])).toEqual([['001.mp3', 3], ['002.mp3', 4]]);
    await expect(loadHifdhStudyWords('2:13', ['إِنَّهُمْ', 'أَلَا'])).rejects.toThrow('certitude');
    await expect(loadHifdhStudyWords('2:13', ['أَلَا'])).rejects.toThrow('certitude');
});
