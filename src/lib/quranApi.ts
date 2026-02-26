import type { Surah, Ayah } from '../types';
import { fetchWithCache } from './apiCache';

const API_BASE = 'https://api.alquran.cloud/v1';

export interface QuranApiResponse<T> {
    code: number;
    status: string;
    data: T;
}

export async function fetchSurahs(): Promise<Surah[]> {
    const data: QuranApiResponse<Surah[]> = await fetchWithCache(`${API_BASE}/surah`);
    return data.data;
}

export async function fetchSurah(surahNumber: number): Promise<{ surah: Surah; ayahs: Ayah[] }> {
    const data = await fetchWithCache<any>(`${API_BASE}/surah/${surahNumber}/quran-uthmani`);

    return {
        surah: {
            number: data.data.number,
            name: data.data.name,
            englishName: data.data.englishName,
            englishNameTranslation: data.data.englishNameTranslation,
            numberOfAyahs: data.data.numberOfAyahs,
            revelationType: data.data.revelationType,
        },
        ayahs: data.data.ayahs.map((ayah: any) => ({
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            text: ayah.text,
            surah: surahNumber,
            juz: ayah.juz,
            page: ayah.page,
            hizbQuarter: ayah.hizbQuarter,
        })),
    };
}

export async function fetchPage(pageNumber: number): Promise<Ayah[]> {
    const data = await fetchWithCache<any>(`${API_BASE}/page/${pageNumber}/quran-uthmani`);

    return data.data.ayahs.map((ayah: any) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        surah: ayah.surah.number,
        juz: ayah.juz,
        page: ayah.page,
        hizbQuarter: ayah.hizbQuarter,
    }));
}

export async function fetchAyah(surahNumber: number, ayahNumber: number): Promise<Ayah> {
    const data = await fetchWithCache<any>(`${API_BASE}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`);

    return {
        number: data.data.number,
        numberInSurah: data.data.numberInSurah,
        text: data.data.text,
        surah: data.data.surah.number,
        juz: data.data.juz,
        page: data.data.page,
        hizbQuarter: data.data.hizbQuarter,
    };
}

export async function searchQuran(query: string): Promise<Ayah[]> {
    const data = await fetchWithCache<any>(`${API_BASE}/search/${encodeURIComponent(query)}/all/ar.quran-uthmani`);

    if (data.code !== 200 || !data.data.matches) {
        return [];
    }

    return data.data.matches.map((match: any) => ({
        number: match.number,
        numberInSurah: match.numberInSurah,
        text: match.text,
        surah: match.surah.number,
        juz: match.juz,
        page: match.page,
        hizbQuarter: match.hizbQuarter,
    }));
}

export async function fetchAyahTiming(surah: number, ayah: number): Promise<any[]> {
    // Recitation 7 is Mishary Al-Afasy on Quran.com
    const data = await fetchWithCache<any>(`https://api.quran.com/api/v4/recitations/7/by_ayah/${surah}:${ayah}`);

    if (data.audio_files && data.audio_files.length > 0) {
        return data.audio_files[0].segments || [];
    }
    return [];
}

/**
 * Fetch the exact audio URL for a specific verse (Mishary Al-Afasy by default)
 */
export async function fetchAyahAudioUrl(surah: number, ayah: number, reciterId: number = 7): Promise<string | null> {
    try {
        const data = await fetchWithCache<any>(`https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${surah}:${ayah}`);

        if (data.audio_files && data.audio_files.length > 0 && data.audio_files[0].url) {
            let url = data.audio_files[0].url;

            // Handle relative URLs returned by quran.com API (e.g. "alafasy/mp3/002255.mp3")
            if (!url.startsWith('http') && !url.startsWith('//')) {
                url = `https://verses.quran.com/${url}`;
            } else if (url.startsWith('//')) {
                url = `https:${url}`;
            }
            return url;
        }
        return null;
    } catch (e) {
        console.error('Failed to fetch ayah audio url', e);
        return null;
    }
}

/**
 * Fetches precise start/end timestamps for an exact dua substring within an Ayah.
 * Uses QDC (Quran.com V4 private API) which provides exact word-level segments.
 * Returns relative [startMs, endMs] within the Ayah's MP3 file.
 */
export async function fetchRabbanaTimings(surah: number, ayah: number, duaText: string, reciterId: number = 7): Promise<[number, number] | null> {
    try {
        const url = `https://api.quran.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`;
        const data = await fetchWithCache<any>(url);

        if (!data.audio_files || !data.audio_files[0] || !data.audio_files[0].verse_timings) {
            return null;
        }

        const ayahTimings = data.audio_files[0].verse_timings.find((v: any) => v.verse_key === `${surah}:${ayah}`);
        if (!ayahTimings || !ayahTimings.segments) {
            return null;
        }

        const segments = ayahTimings.segments; // Array of [word_index, absolute_start_ms, absolute_end_ms]
        if (segments.length === 0) return null;

        // Fetch exact word items from quran.com to perfectly map against segments since punctuation is stripped from segments
        const quranData = await fetchWithCache<any>(`https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani`);

        const duaWords = duaText.split(/[\s،]+/).filter(w => w.trim().length > 0);

        if (quranData.verse && quranData.verse.words) {
            const apiWords = quranData.verse.words.filter((w: any) => w.char_type_name === 'word');
            const normalizeArabic = (text: string) => {
                if (!text) return '';
                return text
                    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Arabic diacritics
                    .replace(/[\u0640]/g, '') // Tatweel
                    .replace(/[ٱإأآء]/g, 'ا') // Normalize Alif variants and Hamza
                    .replace(/[ىئ]/g, 'ي') // Normalize Ya variants
                    .replace(/ؤ/g, 'و') // Normalize Waw variants
                    .replace(/ة/g, 'ه') // Normalize Ta Marbuta to Ha
                    .replace(/[^\u0600-\u06FF]/g, ''); // Keep only Arabic letters
            };

            const wordsMatch = (w1: string, w2: string) => {
                // Remove all Alifs from both to compare skeleton loosely
                // This helps match Uthmani spellings (e.g. للايمن vs للايمان)
                const skeleton1 = w1.replace(/ا/g, '');
                const skeleton2 = w2.replace(/ا/g, '');
                return skeleton1 === skeleton2 || skeleton1.includes(skeleton2) || skeleton2.includes(skeleton1);
            };

            const cleanDuaWords = duaWords.map(normalizeArabic);
            const cleanAyahWords = apiWords.map((w: any) => normalizeArabic(w.text_uthmani || ''));

            let foundIndex = -1;
            for (let i = 0; i <= cleanAyahWords.length - cleanDuaWords.length; i++) {
                let match = true;
                for (let j = 0; j < cleanDuaWords.length; j++) {
                    if (!wordsMatch(cleanAyahWords[i + j], cleanDuaWords[j])) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    foundIndex = i; // Store it but keep going to find the last one (e.g. Rabbana 37 in 59:10)
                }
            }

            // The API words index is 0-based. The QDC segment array uses a relative index (1-based) as the first element: [rel_idx, startMs, endMs].
            // We need to map our foundIndex (which is in the apiWords array) to the segment array.

            let startIndex = 0;
            let endMsRaw = 0;

            if ((surah === 59 && ayah === 10) || (surah === 66 && ayah === 8)) {
                // Special mapping for repeated ayahs where the reciter restarts
                if (foundIndex !== -1) {
                    const targetStartRelIdx = foundIndex + 1;
                    const targetEndRelIdx = foundIndex + duaWords.length;

                    let endSegIndex = -1;
                    for (let i = segments.length - 1; i >= 0; i--) {
                        if (segments[i][0] === targetEndRelIdx) {
                            endSegIndex = i;
                            break;
                        }
                    }
                    if (endSegIndex === -1) endSegIndex = segments.length - 1;

                    let startSegIndex = -1;
                    for (let i = endSegIndex; i >= 0; i--) {
                        if (segments[i][0] === targetStartRelIdx) {
                            startSegIndex = i;
                            while (i > 0 && segments[i - 1][0] === targetStartRelIdx) {
                                i--;
                                startSegIndex = i;
                            }
                            break;
                        }
                    }
                    if (startSegIndex === -1) startSegIndex = 0;

                    startIndex = startSegIndex;
                    endMsRaw = segments[endSegIndex][2] || ayahTimings.timestamp_to;
                } else {
                    startIndex = Math.max(0, segments.length - duaWords.length);
                    endMsRaw = segments[segments.length - 1][2] || ayahTimings.timestamp_to;
                }
            } else {
                // Original logic for all other 38 Rabbanas
                if (foundIndex !== -1) {
                    startIndex = foundIndex;
                } else {
                    startIndex = Math.max(0, segments.length - duaWords.length);
                }
                const endIndex = Math.min(segments.length - 1, startIndex + duaWords.length - 1);
                endMsRaw = segments[endIndex][2] || ayahTimings.timestamp_to;
            }

            const startMs = Math.max(0, segments[startIndex][1] - ayahTimings.timestamp_from);
            const endMs = Math.max(0, endMsRaw - ayahTimings.timestamp_from);

            return [startMs, endMs];
        } else {
            const startIndex = Math.max(0, segments.length - duaWords.length);
            const endIndex = segments.length - 1;
            const endMsRaw = segments[endIndex][2] || ayahTimings.timestamp_to;

            const startMs = Math.max(0, segments[startIndex][1] - ayahTimings.timestamp_from);
            const endMs = Math.max(0, endMsRaw - ayahTimings.timestamp_from);

            return [startMs, endMs];
        }
    } catch (e) {
        console.error('Failed to fetch rabbana word timings', e);
        return null;
    }
}

const RECITERS_OLD = {
    'ar.alafasy': 'https://cdn.islamic.network/quran/audio/128/ar.alafasy',
};

export function getAudioUrl(reciterId: string, ayahNumber: number): string {
    const baseUrl = RECITERS_OLD[reciterId as keyof typeof RECITERS_OLD] || RECITERS_OLD['ar.alafasy'];
    return `${baseUrl}/${ayahNumber}.mp3`;
}

// Translation editions
const TRANSLATION_EDITIONS: Record<string, string> = {
    fr: 'fr.hamidullah',
};

export async function fetchSurahTranslation(
    surahNumber: number,
    language: string = 'fr'
): Promise<Map<number, string>> {
    const edition = TRANSLATION_EDITIONS[language] || TRANSLATION_EDITIONS.fr;
    const data = await fetchWithCache<any>(`${API_BASE}/surah/${surahNumber}/${edition}`);

    const map = new Map<number, string>();
    if (data.code === 200 && data.data?.ayahs) {
        for (const ayah of data.data.ayahs) {
            map.set(ayah.number, ayah.text);
        }
    }
    return map;
}

export async function fetchSurahTransliteration(
    surahNumber: number
): Promise<Map<number, string>> {
    const data = await fetchWithCache<any>(`${API_BASE}/surah/${surahNumber}/en.transliteration`);

    const map = new Map<number, string>();
    if (data.code === 200 && data.data?.ayahs) {
        for (const ayah of data.data.ayahs) {
            map.set(ayah.number, ayah.text);
        }
    }
    return map;
}

export async function fetchPageTranslation(
    pageNumber: number,
    language: string = 'fr'
): Promise<Map<number, string>> {
    const edition = TRANSLATION_EDITIONS[language] || TRANSLATION_EDITIONS.fr;
    const data = await fetchWithCache<any>(`${API_BASE}/page/${pageNumber}/${edition}`);

    const map = new Map<number, string>();
    if (data.code === 200 && data.data?.ayahs) {
        for (const ayah of data.data.ayahs) {
            map.set(ayah.number, ayah.text);
        }
    }
    return map;
}

export async function fetchPageTransliteration(
    pageNumber: number
): Promise<Map<number, string>> {
    const data = await fetchWithCache<any>(`${API_BASE}/page/${pageNumber}/en.transliteration`);

    const map = new Map<number, string>();
    if (data.code === 200 && data.data?.ayahs) {
        for (const ayah of data.data.ayahs) {
            map.set(ayah.number, ayah.text);
        }
    }
    return map;
}
