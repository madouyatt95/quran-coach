const LETTERS: Record<string, string> = {
    'ء': 'ʾ', 'أ': 'ʾ', 'إ': 'ʾ', 'ؤ': 'ʾ', 'ئ': 'ʾ', 'آ': 'ʾā',
    'ا': 'a', 'ٱ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ',
    'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'ه': 'h', 'ة': 'a', 'و': 'w', 'ى': 'ā', 'ي': 'y', 'پ': 'p',
};

const VOWELS: Record<string, string> = {
    '\u064e': 'a', // fatha
    '\u0650': 'i', // kasra
    '\u064f': 'u', // damma
    '\u064b': 'an', // fathatan
    '\u064d': 'in', // kasratan
    '\u064c': 'un', // dammatan
};

const isHaraka = (char: string) => /[\u064b-\u065f\u0670]/u.test(char);

interface ArabicToken { base: string; marks: string[] }

/**
 * Creates a reading aid from the vocalized Arabic text. It is intentionally indicative:
 * it does not replace a reviewed transliteration or listening to a qualified reciter.
 */
export function transliterateArabicIndicatively(text: string): string {
    const tokens: ArabicToken[] = [];
    for (const char of Array.from(text.normalize('NFC'))) {
        if (isHaraka(char) && tokens.length > 0) tokens[tokens.length - 1].marks.push(char);
        else if (char === 'ـ') continue;
        else tokens.push({ base: char, marks: [] });
    }

    return tokens.map((token, index) => {
        const { base, marks } = token;
        if (base === '،') return ',';
        if (base === '؛') return ';';
        if (base === '؟') return '?';
        if (base === '۞' || /[\u06d6-\u06ed]/u.test(base)) return '';

        const next = tokens[index + 1];
        const has = (mark: string) => marks.includes(mark);
        const nextHasShortVowel = next?.marks.some(mark => VOWELS[mark]) ?? false;
        const previous = tokens[index - 1];
        const articleAlifFollowsClitic = base === 'ا'
            && Boolean(previous && /[بفكلو]/u.test(previous.base) && /[\u064e\u0650]/u.test(previous.marks.join('')))
            && next?.base === 'ل';
        if (articleAlifFollowsClitic) return '';

        const articleAlifContext = tokens[index - 2];
        const articleAlifStartsWord = !articleAlifContext || /[\s.,;:!?؟،؛]/u.test(articleAlifContext.base);
        const articlePrefixFollowsClitic = Boolean(articleAlifContext
            && /[بفكلو]/u.test(articleAlifContext.base)
            && /[\u064e\u0650]/u.test(articleAlifContext.marks.join('')));
        const followsArticleAlif = base === 'ل'
            && (previous?.base === 'ا' || previous?.base === 'ٱ')
            && (articleAlifStartsWord || articlePrefixFollowsClitic);
        const isSolarArticleLam = followsArticleAlif
            && Boolean(next && /[تثدذرزسشصضطظلن]/u.test(next.base) && next.marks.includes('\u0651'));
        if (isSolarArticleLam) return '';
        if (followsArticleAlif) return 'l-';

        const isLongAlif = (base === 'ا' || base === 'ى') && index > 0 && tokens[index - 1].marks.includes('\u064e');
        const isLongWaw = base === 'و' && index > 0 && tokens[index - 1].marks.includes('\u064f') && !marks.some(mark => VOWELS[mark]);
        const isLongYa = base === 'ي' && index > 0 && tokens[index - 1].marks.includes('\u0650') && !marks.some(mark => VOWELS[mark]);
        if (isLongAlif || isLongWaw || isLongYa) return '';

        let output = LETTERS[base] ?? base;
        const consonant = output;
        if (has('\u0651') && consonant && !/[\s.,;:!?؟،؛]/u.test(base)) output += consonant;

        if (has('\u064e')) output += (next?.base === 'ا' || next?.base === 'ى') && !nextHasShortVowel ? 'ā' : 'a';
        else if (has('\u0650')) output += next?.base === 'ي' && !nextHasShortVowel ? 'ī' : 'i';
        else if (has('\u064f')) output += next?.base === 'و' && !nextHasShortVowel ? 'ū' : 'u';
        else {
            for (const mark of marks) if (VOWELS[mark]) output += VOWELS[mark];
        }

        return output;
    }).join('').replace(/\s+([,.;!?])/gu, '$1').replace(/\s{2,}/gu, ' ').trim();
}

export function getHadithPhonetic(textAr: string): string {
    return transliterateArabicIndicatively(textAr);
}
