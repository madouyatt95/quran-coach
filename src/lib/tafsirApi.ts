// Tafsir API integration using Quran.com API
// Documentation: https://api-docs.quran.foundation

const API_BASE = 'https://api.qurancdn.com/api/v4';

// Available French tafsirs on Quran.com
export const AVAILABLE_TAFSIRS = [
    { id: 169, name: 'Ibn Kathir', nameAr: 'ابن كثير', language: 'fr' },
    { id: 93, name: 'Ibn Kathir (English)', nameAr: 'ابن كثير', language: 'en' },
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
    tafsirId: number,
    surah: number,
    ayah: number
): Promise<TafsirContent | null> {
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
