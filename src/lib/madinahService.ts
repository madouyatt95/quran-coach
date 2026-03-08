import { fetchWithCache } from './apiCache';

export interface MadinahBox {
    verseKey: string;
    surah: number;
    ayah: number;
    line: number;
    left: number;   // percentage
    top: number;    // percentage
    width: number;  // percentage
    height: number; // percentage
}

export async function fetchMadinahBoxes(page: number): Promise<MadinahBox[]> {
    try {
        const data = await fetchWithCache<any>(`https://api.quran.com/api/v4/verses/by_page/${page}?words=true`);
        const boxes: MadinahBox[] = [];

        if (data && data.verses) {
            // Group words by line_number
            const lineWords = new Map<number, any[]>();

            data.verses.forEach((verse: any) => {
                const [surahStr, ayahStr] = verse.verse_key.split(':');
                const surah = parseInt(surahStr);
                const ayah = parseInt(ayahStr);

                verse.words.forEach((word: any) => {
                    // Skip end marks or words without line_number
                    if (!word.line_number) return;

                    if (!lineWords.has(word.line_number)) {
                        lineWords.set(word.line_number, []);
                    }

                    lineWords.get(word.line_number)!.push({
                        ...word,
                        surah,
                        ayah,
                        verseKey: verse.verse_key
                    });
                });
            });

            // The Madinah mushaf layout has 15 lines. We'll use 15 as base.
            const MAX_LINES = 15;

            lineWords.forEach((words, lineNum) => {
                // Determine bounding boxes for verses on this line
                const wordsByVerse = new Map<string, any[]>();
                words.forEach(w => {
                    if (!wordsByVerse.has(w.verseKey)) Object.assign(w, { isFirst: true });

                    if (!wordsByVerse.has(w.verseKey)) wordsByVerse.set(w.verseKey, []);
                    wordsByVerse.get(w.verseKey)!.push(w);
                });

                let totalWordsOnLine = words.length;

                // Words are usually ordered as they appear right-to-left in the API Response.
                // We keep a running "right" percentage.
                let currentRight = 0;

                Array.from(wordsByVerse.entries()).forEach(([verseKey, verseWords]) => {
                    // Weight proportion of line occupied by this verse's words
                    const widthPercent = (verseWords.length / totalWordsOnLine) * 100;
                    const leftPercent = 100 - currentRight - widthPercent;

                    boxes.push({
                        verseKey,
                        surah: verseWords[0].surah,
                        ayah: verseWords[0].ayah,
                        line: lineNum,
                        left: leftPercent,
                        top: (lineNum - 1) * (100 / MAX_LINES),
                        width: widthPercent,
                        height: 100 / MAX_LINES
                    });

                    currentRight += widthPercent;
                });
            });
        }

        return boxes;
    } catch (e) {
        console.error('Failed to fetch Madinah boxes', e);
        return [];
    }
}
