// Quran Data Types

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
    number: number;
    numberInSurah: number;
    text: string;
    surah: number;
    juz: number;
    page: number;
    hizbQuarter: number;
}

export interface QuranPage {
    pageNumber: number;
    ayahs: Ayah[];
}

export interface Bookmark {
    id: string;
    surah: number;
    ayah: number;
    page: number;
    createdAt: number;
    label?: string;
}

export interface Favorite {
    id: string;
    surah: number;
    startAyah: number;
    endAyah: number;
    note?: string;
    createdAt: number;
}

export interface ReadingProgress {
    lastSurah: number;
    lastAyah: number;
    lastPage: number;
    updatedAt: number;
}

export interface HifdhSession {
    id: string;
    surah: number;
    startAyah: number;
    endAyah: number;
    repetitions: number;
    mastered: boolean;
    lastPracticed: number;
    nextReview: number;
}

export interface Reciter {
    id: string;
    name: string;
    arabicName: string;
    style?: string;
}

export interface TajwidRule {
    id: string;
    name: string;
    nameArabic: string;
    color: string;
    description: string;
    enabled: boolean;
}

export type Theme = 'dark' | 'light' | 'sepia';
export type ArabicFontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ViewMode = 'mushaf' | 'focus' | 'list';

export interface Settings {
    theme: Theme;
    arabicFontSize: ArabicFontSize;
    viewMode: ViewMode;
    lineSpacing: number;
    showTranslation: boolean;
    showTransliteration: boolean;
    translationLanguage: string;
    tajwidEnabled: boolean;
    tajwidLayers: string[];
    selectedReciter: string;
    autoPlayAudio: boolean;
    repeatCount: number;
}
