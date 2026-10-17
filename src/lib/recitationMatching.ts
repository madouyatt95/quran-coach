/** Text alignment for recognition feedback; this does not grade pronunciation. */
export function normalizeRecitationWord(text: string): string {
    return text.normalize('NFKC')
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06EDـ]/g, '')
        .replace(/[أإآٱ]/g, 'ا').replace(/ؤ/g, 'و').replace(/[ئء]/g, 'ي')
        .replace(/ى/g, 'ي').replace(/ة/g, 'ه')
        .replace(/[^\u0621-\u063A\u0641-\u064A]/g, '');
}

export function recitationWords(text: string): string[] {
    return text.split(/\s+/).filter(word => normalizeRecitationWord(word).length > 0);
}

function similar(a: string, b: string): boolean {
    if (!a || !b) return false;
    if (a === b) return true;
    // Short words often differ by a single meaningful letter (من / ما).
    if (Math.min(a.length, b.length) <= 3) return false;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
        const row = [i];
        for (let j = 1; j <= b.length; j++) {
            row[j] = Math.min(row[j - 1] + 1, previous[j] + 1,
                previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
        }
        previous = row;
    }
    return 1 - previous[b.length] / Math.max(a.length, b.length) >= 0.8;
}

export interface RecognizedWord { isCorrect: boolean; spoken: string }

/** Recompute a cumulative hypothesis so revised/shortened partials can retract old results. */
export function alignRecitation(expected: string[], transcript: string, startIndex = 0) {
    const normalized = expected.map(normalizeRecitationWord);
    const matches = new Map<number, RecognizedWord>();
    let cursor = Math.max(0, Math.min(startIndex, expected.length));
    const heard = recitationWords(transcript);
    for (let heardIndex = 0; heardIndex < heard.length; heardIndex++) {
        const spoken = heard[heardIndex];
        if (cursor >= expected.length) break;
        const word = normalizeRecitationWord(spoken);
        // Ignore an explicit restart of a just-read phrase only with a matching
        // continuation. A repeated common word alone must not relocate the reader.
        if (normalized[cursor] !== word) {
            let repeated = 0;
            for (let from = Math.max(startIndex, cursor - 6); from < cursor; from++) {
                const count = cursor - from;
                if (heardIndex + count >= heard.length) continue;
                if (normalized[cursor] !== normalizeRecitationWord(heard[heardIndex + count])) continue;
                if (Array.from({length:count}, (_,i)=>normalized[from+i] === normalizeRecitationWord(heard[heardIndex+i])).every(Boolean)) { repeated=count; break; }
            }
            if (repeated) { heardIndex += repeated - 1; continue; }
            // A spoken slip immediately followed by the expected word is a retry,
            // not a reason to shift every subsequent word by one position.
            if (heardIndex + 1 < heard.length && normalizeRecitationWord(heard[heardIndex+1]) === normalized[cursor]
                && !normalized.slice(cursor+1,cursor+4).includes(word)) continue;
        }
        const end = Math.min(cursor + 4, expected.length);
        // Prefer an exact word anywhere in the window over a fuzzy earlier word.
        let found = -1;
        for (let i = cursor; i < end; i++) {
            if (normalized[i] === word) { found = i; break; }
        }
        if (found < 0) {
            for (let i = cursor; i < end; i++) {
                if (similar(normalized[i], word)) { found = i; break; }
            }
        }
        if (found >= 0) {
            while (cursor < found) matches.set(cursor++, { isCorrect: false, spoken: '(non reconnu)' });
            matches.set(cursor++, { isCorrect: true, spoken });
        } else {
            matches.set(cursor++, { isCorrect: false, spoken });
        }
    }
    return { matches, cursor };
}
