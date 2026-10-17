import { PAGE_MANIFEST, type MushafWord } from './interactiveMushaf/model';
import { loadInteractivePage } from './interactiveMushaf/service';
import { compatibleWords } from './tilawa/feedback';

export type HifdhStudyWord = { word: MushafWord; page: number };

/** Resolve the complete verse, including verses split across two Mushaf pages.
 * Never assume the display's whitespace indices match Quran.com's audio positions. */
export async function loadHifdhStudyWords(verseKey: string, displayed: string[]): Promise<HifdhStudyWord[]> {
    const pages = Object.entries(PAGE_MANIFEST).filter(([, manifest]) => manifest.verseKeys.includes(verseKey));
    if (!pages.length) throw new Error('Verset indisponible.');
    const data = await Promise.all(pages.map(([page]) => loadInteractivePage(Number(page))));
    const words = data.flatMap(page => page.words.filter(word => word.kind === 'word' && word.verseKey === verseKey).map(word => ({ word, page: page.page })))
        .sort((a, b) => a.word.position - b.word.position);
    if (!compatibleWords(displayed, words.map(item => item.word.text))) {
        throw new Error('La prononciation de ce mot ne peut pas être associée avec certitude.');
    }
    return words;
}
