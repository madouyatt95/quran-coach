// ─── Coach Search Engine ─────────────────────────────
// Searches locally in hadiths, Hisnul Muslim, and uses Quran API for verse search

import { HADITHS } from '../data/hadiths';

// Types
export interface SearchResult {
    type: 'hadith' | 'invocation' | 'verse' | 'surah';
    title: string;
    textAr: string;
    textFr: string;
    source?: string;
    link?: string;
    score: number;
    emoji: string;
}

// ─── Tag Synonyms for fuzzy matching ─────
const TAG_SYNONYMS: Record<string, string[]> = {
    priere: ['prière', 'salat', 'prières', 'salah', 'prosternation', 'prier'],
    patience: ['patient', 'épreuve', 'épreuves', 'sabr', 'difficile', 'souffrance'],
    repentir: ['tawba', 'pardon', 'péché', 'péchés', 'demander pardon', 'se repentir'],
    jeune: ['jeûne', 'jeûner', 'ramadan', 'siyam', 'iftar'],
    ramadan: ['ramadhan', 'tarawih', 'laylat al qadr', 'nuit du destin'],
    coran: ['quran', 'lecture', 'lire', 'récitation', 'sourate', 'verset'],
    dhikr: ['dikr', 'invocation', 'rappel', 'subhanallah', 'alhamdulillah'],
    charite: ['charité', 'aumône', 'sadaqa', 'zakat', 'donner', 'don'],
    paradis: ['jannah', 'jannat', 'au-delà'],
    mort: ['mourir', 'tombe', 'décès', 'akhirah'],
    parents: ['mère', 'père', 'famille', 'enfants'],
    science: ['savoir', 'connaissance', 'apprendre', 'étudier'],
    dua: ['invocation', 'invoquer', 'supplique', 'supplication', 'doua'],
    hajj: ['pèlerinage', 'omra', 'arafat', 'mecque'],
    prophete: ['prophète', 'muhammad', 'mohammed', 'messager', 'salawat'],
    bon_comportement: ['comportement', 'caractère', 'akhlaq', 'manières', 'douceur'],
    fraternie: ['fraternité', 'frère', 'frères', 'amitié', 'entraide'],
    vendredi: ['jumu\'a', 'joumoua', 'al-kahf'],
    matin: ['aube', 'fajr', 'protections du matin'],
    soir: ['nuit', 'coucher', 'protections du soir'],
    general: [],
};

// ─── Normalize text for comparison ─────
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s]/g, ' ')
        .trim();
}

// ─── Search hadiths ─────
function searchHadiths(query: string): SearchResult[] {
    const normalizedQuery = normalize(query);
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

    if (words.length === 0) return [];

    return HADITHS.map(hadith => {
        let score = 0;
        const normalizedFr = normalize(hadith.textFr);
        const normalizedSource = normalize(hadith.source);

        // Tag matching (highest priority)
        for (const tag of hadith.tags) {
            const tagNorm = normalize(tag);
            const synonyms = TAG_SYNONYMS[tag] || [];

            for (const word of words) {
                if (tagNorm.includes(word) || word.includes(tagNorm)) {
                    score += 30;
                }
                for (const syn of synonyms) {
                    if (normalize(syn).includes(word) || word.includes(normalize(syn))) {
                        score += 25;
                    }
                }
            }
        }

        // Text content matching
        for (const word of words) {
            if (normalizedFr.includes(word)) {
                score += 10;
            }
            if (normalizedSource.includes(word)) {
                score += 5;
            }
        }

        if (score === 0) return null;

        return {
            type: 'hadith' as const,
            title: `Hadith — ${hadith.source}`,
            textAr: hadith.textAr,
            textFr: hadith.textFr,
            source: `${hadith.source} — ${hadith.narrator}`,
            score,
            emoji: '📜',
        };
    }).filter(Boolean) as SearchResult[];
}

// ─── Search Hisnul Muslim ─────
async function searchHisnulMuslim(query: string): Promise<SearchResult[]> {
    const normalizedQuery = normalize(query);
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return [];

    try {
        const { HISNUL_MUSLIM_DATA } = await import('../data/hisnulMuslim');
        const results: SearchResult[] = [];

        for (const category of HISNUL_MUSLIM_DATA) {
            for (const chapter of category.chapters) {
                let score = 0;
                const titleNorm = normalize(chapter.title);

                for (const word of words) {
                    if (titleNorm.includes(word)) {
                        score += 20;
                    }
                }

                // Also check duas content
                for (const dua of chapter.duas.slice(0, 3)) {
                    const translationNorm = normalize(dua.translation);
                    for (const word of words) {
                        if (translationNorm.includes(word)) {
                            score += 8;
                        }
                    }
                }

                if (score > 0) {
                    const firstDua = chapter.duas[0];
                    results.push({
                        type: 'invocation',
                        title: chapter.title,
                        textAr: firstDua?.arabic || chapter.titleAr,
                        textFr: firstDua?.translation || chapter.title,
                        source: `Hisnul Muslim — ${chapter.duas.length} invocation(s)`,
                        link: `/adhkar`,
                        score,
                        emoji: '🤲',
                    });
                }
            }
        }

        return results;
    } catch {
        return [];
    }
}

// ─── Search Quran via API ─────
async function searchQuranVerses(query: string): Promise<SearchResult[]> {
    try {
        const { searchQuran } = await import('./quranApi');
        const ayahs = await searchQuran(query);

        return ayahs.slice(0, 5).map(ayah => ({
            type: 'verse' as const,
            title: `Sourate ${ayah.surah} — Verset ${ayah.numberInSurah}`,
            textAr: ayah.text,
            textFr: '',
            source: `Coran ${ayah.surah}:${ayah.numberInSurah}`,
            link: '/read',
            score: 15,
            emoji: '📖',
        }));
    } catch {
        return [];
    }
}

// ─── Main Search ─────
export async function coachSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const [hadithResults, hisnResults, quranResults] = await Promise.all([
        Promise.resolve(searchHadiths(query)),
        searchHisnulMuslim(query),
        searchQuranVerses(query),
    ]);

    const all = [...hadithResults, ...hisnResults, ...quranResults];

    // Sort by score descending
    all.sort((a, b) => b.score - a.score);

    // Limit to top 15 results
    return all.slice(0, 15);
}

// ─── Quick Tags ─────
export const QUICK_TAGS = [
    { label: 'Patience', query: 'patience', emoji: '🪨' },
    { label: 'Prière', query: 'prière', emoji: '🕌' },
    { label: 'Repentir', query: 'repentir', emoji: '💜' },
    { label: 'Coran', query: 'coran', emoji: '📖' },
    { label: 'Parents', query: 'parents', emoji: '❤️' },
    { label: 'Paradis', query: 'paradis', emoji: '🌿' },
    { label: 'Dhikr', query: 'dhikr', emoji: '📿' },
    { label: 'Charité', query: 'charité', emoji: '🤝' },
    { label: 'Jeûne', query: 'jeûne', emoji: '🌙' },
    { label: 'Prophète ﷺ', query: 'prophète', emoji: '⭐' },
    { label: 'Voyage', query: 'voyage', emoji: '✈️' },
    { label: 'Matin', query: 'matin', emoji: '🌅' },
    { label: 'Soir', query: 'soir', emoji: '🌆' },
    { label: 'Mort', query: 'mort', emoji: '💀' },
    { label: 'Hajj', query: 'hajj', emoji: '🕋' },
];
