// Tafsir API integration using Quran.com API
// Documentation: https://api-docs.quran.foundation

const API_BASE = 'https://api.qurancdn.com/api/v4';

// Available French tafsirs and high-quality translations
export const AVAILABLE_TAFSIRS = [
    { id: 'french_mokhtasar', name: 'Mokhtasar (Exégèse Simplifiée)', nameAr: 'المختصر في التفسير', language: 'fr', type: 'quranenc' },
    { id: 'french_rashid', name: 'Rashid Maash (Exégèse)', nameAr: 'راشد معاش', language: 'fr', type: 'quranenc' },
    { id: 'french_montada', name: 'Montada Islamic (Exégèse)', nameAr: 'المنتدى الإسلامي', language: 'fr', type: 'quranenc' },
    { id: 'french_ibnkathir_local', name: 'Ibn Kathir (Français - LOCAL)', nameAr: 'ابن كثير (محلي)', language: 'fr', type: 'local' },
    { id: 169, name: 'Ibn Kathir (English)', nameAr: 'ابن كثير', language: 'en', type: 'quran' },
];

export interface TafsirInfo {
    id: number;
    name: string;
    author_name: string;
    language_name: string;
}

export interface TafsirContent {
    resource_id: number;
    text: string;
    verse_key: string;
    language_id: number;
    resource_name: string;
}

export interface TafsirResponse {
    tafsir: TafsirContent;
}

// Fetch available tafsirs
export async function fetchAvailableTafsirs(): Promise<TafsirInfo[]> {
    try {
        const response = await fetch(`${API_BASE}/resources/tafsirs`);
        if (!response.ok) throw new Error('Failed to fetch tafsirs');
        const data = await response.json();
        return data.tafsirs;
    } catch (error) {
        console.error('Error fetching available tafsirs:', error);
        return [];
    }
}

// Fetch tafsir for a specific verse
export async function fetchTafsir(
    tafsirId: number | string,
    surah: number,
    ayah: number
): Promise<TafsirContent | null> {
    // If it's a QuranEnc resource
    if (typeof tafsirId === 'string' && tafsirId.startsWith('french_')) {
        if (tafsirId === 'french_ibnkathir_local') {
            return fetchLocalTafsir(tafsirId, surah, ayah);
        }
        return fetchFrenchTafsir(tafsirId, surah, ayah);
    }

    try {
        const verseKey = `${surah}:${ayah}`;
        const response = await fetch(
            `${API_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch tafsir: ${response.status}`);
        }

        const data: TafsirResponse = await response.json();
        return data.tafsir;
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        return null;
    }
}

async function fetchLocalTafsir(
    resourceId: string,
    surah: number,
    ayah: number
): Promise<TafsirContent | null> {
    try {
        // Local JSON files are stored in /public/tafsirs/{resourceId}.json
        // Format: { "1:1": "Text...", "1:2": "Text...", ... }
        const response = await fetch(`/tafsirs/${resourceId}.json`);
        if (!response.ok) throw new Error('Local tafsir file not found');

        const data = await response.json();
        const verseKey = `${surah}:${ayah}`;
        const text = data[verseKey];

        if (!text) return null;

        return {
            resource_id: 0,
            text: text,
            verse_key: verseKey,
            language_id: 0,
            resource_name: 'Ibn Kathir (Français)'
        };
    } catch (error) {
        console.error('Error fetching local tafsir:', error);
        return null;
    }
}

// Fetch French "Tafsir" (Translation + Footnotes) from QuranEnc
async function fetchFrenchTafsir(
    resourceId: string,
    surah: number,
    ayah: number
): Promise<TafsirContent | null> {
    try {
        // QuranEnc API: https://quranenc.com/api/v1/translation/aya/{resource_id}/{sura_number}/{aya_number}
        const response = await fetch(
            `https://quranenc.com/api/v1/translation/aya/${resourceId}/${surah}/${ayah}`
        );

        if (!response.ok) throw new Error('Failed to fetch from QuranEnc');

        const data = await response.json();
        const result = data.result;

        if (!result) return null;

        // We combine translation and footnotes for a complete explanation
        const fullText = result.footnotes
            ? `${result.translation}\n\nNotes :\n${result.footnotes}`
            : result.translation;

        const resourceNames: Record<string, string> = {
            'french_rashid': 'Rashid Maash',
            'french_montada': 'Montada Islamic',
            'french_mokhtasar': 'Mokhtasar (Exégèse Simplifiée)'
        };

        return {
            resource_id: 0,
            text: fullText,
            verse_key: `${surah}:${ayah}`,
            language_id: 0,
            resource_name: resourceNames[resourceId] || 'Exégèse Française'
        };
    } catch (error) {
        console.error('Error fetching French tafsir:', error);
        return null;
    }
}

// Fetch verse text for display
export async function fetchVerseText(
    surah: number,
    ayah: number
): Promise<{ arabic: string; translation: string } | null> {
    try {
        const verseKey = `${surah}:${ayah}`;
        const response = await fetch(
            `${API_BASE}/verses/by_key/${verseKey}?translations=136&fields=text_uthmani`
        );

        if (!response.ok) throw new Error('Failed to fetch verse');

        const data = await response.json();
        const verse = data.verse;

        return {
            arabic: verse.text_uthmani || '',
            translation: verse.translations?.[0]?.text || '',
        };
    } catch (error) {
        console.error('Error fetching verse:', error);
        return null;
    }
}
