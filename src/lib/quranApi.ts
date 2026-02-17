import type { Surah, Ayah } from '../types';

const API_BASE = 'https://api.alquran.cloud/v1';

export interface QuranApiResponse<T> {
    code: number;
    status: string;
    data: T;
}

export async function fetchSurahs(): Promise<Surah[]> {
    const response = await fetch(`${API_BASE}/surah`);
    const data: QuranApiResponse<Surah[]> = await response.json();
    return data.data;
}

export async function fetchSurah(surahNumber: number): Promise<{ surah: Surah; ayahs: Ayah[] }> {
    const response = await fetch(`${API_BASE}/surah/${surahNumber}/quran-uthmani`);
    const data = await response.json();

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
    const response = await fetch(`${API_BASE}/page/${pageNumber}/quran-uthmani`);
    const data = await response.json();

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
    const response = await fetch(`${API_BASE}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`);
    const data = await response.json();

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
    const response = await fetch(`${API_BASE}/search/${encodeURIComponent(query)}/all/ar.quran-uthmani`);
    const data = await response.json();

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
    const response = await fetch(`https://api.quran.com/api/v4/recitations/7/by_ayah/${surah}:${ayah}`);
    const data = await response.json();

    if (data.audio_files && data.audio_files.length > 0) {
        return data.audio_files[0].segments || [];
    }
    return [];
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
    const response = await fetch(`${API_BASE}/surah/${surahNumber}/${edition}`);
    const data = await response.json();

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
    const response = await fetch(`${API_BASE}/surah/${surahNumber}/en.transliteration`);
    const data = await response.json();

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
    const response = await fetch(`${API_BASE}/page/${pageNumber}/${edition}`);
    const data = await response.json();

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
    const response = await fetch(`${API_BASE}/page/${pageNumber}/en.transliteration`);
    const data = await response.json();

    const map = new Map<number, string>();
    if (data.code === 200 && data.data?.ayahs) {
        for (const ayah of data.data.ayahs) {
            map.set(ayah.number, ayah.text);
        }
    }
    return map;
}
