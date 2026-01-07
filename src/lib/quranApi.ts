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

// Audio URLs for different reciters
const RECITERS = {
    'ar.alafasy': 'https://cdn.islamic.network/quran/audio/128/ar.alafasy',
    'ar.abdulbasit': 'https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal',
    'ar.husary': 'https://cdn.islamic.network/quran/audio/128/ar.husary',
    'ar.minshawi': 'https://cdn.islamic.network/quran/audio/128/ar.minshawi',
};

export function getAudioUrl(reciterId: string, ayahNumber: number): string {
    const baseUrl = RECITERS[reciterId as keyof typeof RECITERS] || RECITERS['ar.alafasy'];
    return `${baseUrl}/${ayahNumber}.mp3`;
}

export function getSurahAudioUrl(_reciterId: string, surahNumber: number): string {
    // Use the surah audio edition
    return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
}

export { RECITERS };
