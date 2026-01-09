// Tajweed Service - Fetch pre-colored Tajweed text from Quran.com API
// API provides <tajweed class="rule"> tags for each Tajweed rule

export interface TajweedVerse {
    verseKey: string;
    textTajweed: string; // HTML with <tajweed class=X> tags
}

// Tajweed rule definitions with colors
export const TAJWEED_RULES: Record<string, { name: string; nameArabic: string; color: string; description: string }> = {
    // Hamza
    'ham_wasl': { name: 'Hamza Wasl', nameArabic: 'همزة الوصل', color: '#AAAAAA', description: 'Hamza silencieuse (liaison)' },

    // Lam
    'laam_shamsiyah': { name: 'Lam Shamsiyah', nameArabic: 'اللام الشمسية', color: '#AAAAAA', description: 'Lam solaire (assimilée)' },

    // Madd (Prolongation)
    'madda_normal': { name: 'Madd Normal', nameArabic: 'المد الطبيعي', color: '#FF7F7F', description: 'Prolongation naturelle (2 temps)' },
    'madda_permissible': { name: 'Madd Permissible', nameArabic: 'المد الجائز', color: '#FF6B6B', description: 'Prolongation permise (2-6 temps)' },
    'madda_necessary': { name: 'Madd Lazem', nameArabic: 'المد اللازم', color: '#FF4444', description: 'Prolongation obligatoire (6 temps)' },
    'madda_obligatory': { name: 'Madd Obligatoire', nameArabic: 'المد الواجب', color: '#FF5555', description: 'Prolongation obligatoire (4-5 temps)' },

    // Ghunnah (Nasalisation)
    'ghunnah': { name: 'Ghunnah', nameArabic: 'الغنة', color: '#4ECDC4', description: 'Son nasal (2 temps)' },

    // Qalqalah (Rebond)
    'qalqalah': { name: 'Qalqalah', nameArabic: 'القلقلة', color: '#FFE66D', description: 'Rebond sonore (ق ط ب ج د)' },

    // Idgham (Fusion)
    'idgham_ghunnah': { name: 'Idgham avec Ghunnah', nameArabic: 'إدغام بغنة', color: '#95E1D3', description: 'Fusion nasale avec ينمو' },
    'idgham_no_ghunnah': { name: 'Idgham sans Ghunnah', nameArabic: 'إدغام بلا غنة', color: '#7BC9BD', description: 'Fusion sans nasalisation avec ل ر' },
    'idgham_mutajanisayn': { name: 'Idgham Mutajanisayn', nameArabic: 'إدغام متجانسين', color: '#6AB5A8', description: 'Fusion de lettres similaires' },
    'idgham_mutaqaribayn': { name: 'Idgham Mutaqaribayn', nameArabic: 'إدغام متقاربين', color: '#5AA99C', description: 'Fusion de lettres proches' },

    // Ikhfa (Dissimulation)
    'ikhfa': { name: 'Ikhfa', nameArabic: 'الإخفاء', color: '#DDA0DD', description: 'Dissimulation nasale (15 lettres)' },
    'ikhfa_shafawi': { name: 'Ikhfa Shafawi', nameArabic: 'إخفاء شفوي', color: '#CC8FCC', description: 'Dissimulation labiale (م avant ب)' },

    // Iqlab
    'iqlab': { name: 'Iqlab', nameArabic: 'الإقلاب', color: '#87CEEB', description: 'Conversion du ن en م devant ب' },

    // Izhar (Prononciation claire)
    'izhar': { name: 'Izhar', nameArabic: 'الإظهار', color: '#98D8C8', description: 'Prononciation claire (6 lettres)' },
    'izhar_shafawi': { name: 'Izhar Shafawi', nameArabic: 'إظهار شفوي', color: '#88C8B8', description: 'Prononciation labiale claire' },

    // Silent letters
    'silent': { name: 'Lettre silencieuse', nameArabic: 'حرف ساكن', color: '#888888', description: 'Lettre non prononcée' },
};

// Cache for Tajweed text
const tajweedCache = new Map<number, TajweedVerse[]>();

/**
 * Fetch Tajweed text for a surah from Quran.com API
 */
export async function fetchTajweedSurah(surahNumber: number): Promise<TajweedVerse[]> {
    // Check cache first
    if (tajweedCache.has(surahNumber)) {
        return tajweedCache.get(surahNumber)!;
    }

    try {
        const response = await fetch(
            `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${surahNumber}`
        );
        const data = await response.json();

        const verses: TajweedVerse[] = data.verses.map((v: any) => ({
            verseKey: v.verse_key,
            textTajweed: v.text_uthmani_tajweed,
        }));

        tajweedCache.set(surahNumber, verses);
        return verses;
    } catch (error) {
        console.error('Failed to fetch Tajweed text:', error);
        return [];
    }
}

/**
 * Get Tajweed text for a specific verse
 */
export async function fetchTajweedVerse(surah: number, ayah: number): Promise<string | null> {
    const verses = await fetchTajweedSurah(surah);
    const verse = verses.find(v => v.verseKey === `${surah}:${ayah}`);
    return verse?.textTajweed || null;
}

/**
 * Get available Tajweed rule categories for UI
 */
export function getTajweedCategories() {
    return [
        {
            id: 'madd',
            name: 'Madd (Prolongation)',
            nameArabic: 'المد',
            color: '#FF6B6B',
            rules: ['madda_normal', 'madda_permissible', 'madda_necessary', 'madda_obligatory']
        },
        {
            id: 'ghunnah',
            name: 'Ghunnah (Nasalisation)',
            nameArabic: 'الغنة',
            color: '#4ECDC4',
            rules: ['ghunnah']
        },
        {
            id: 'qalqalah',
            name: 'Qalqalah (Rebond)',
            nameArabic: 'القلقلة',
            color: '#FFE66D',
            rules: ['qalqalah']
        },
        {
            id: 'idgham',
            name: 'Idgham (Fusion)',
            nameArabic: 'الإدغام',
            color: '#95E1D3',
            rules: ['idgham_ghunnah', 'idgham_no_ghunnah', 'idgham_mutajanisayn', 'idgham_mutaqaribayn']
        },
        {
            id: 'ikhfa',
            name: 'Ikhfa (Dissimulation)',
            nameArabic: 'الإخفاء',
            color: '#DDA0DD',
            rules: ['ikhfa', 'ikhfa_shafawi']
        },
        {
            id: 'iqlab',
            name: 'Iqlab (Conversion)',
            nameArabic: 'الإقلاب',
            color: '#87CEEB',
            rules: ['iqlab']
        },
        {
            id: 'izhar',
            name: 'Izhar (Prononciation claire)',
            nameArabic: 'الإظهار',
            color: '#98D8C8',
            rules: ['izhar', 'izhar_shafawi']
        }
    ];
}

// Cache for page Tajweed data
const pageTajweedCache = new Map<number, TajweedVerse[]>();

/**
 * Fetch Tajweed text for a specific page from Quran.com API
 */
export async function fetchTajweedPage(pageNumber: number): Promise<TajweedVerse[]> {
    // Check cache first
    if (pageTajweedCache.has(pageNumber)) {
        return pageTajweedCache.get(pageNumber)!;
    }

    try {
        const response = await fetch(
            `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&fields=text_uthmani_tajweed`
        );
        const data = await response.json();

        const verses: TajweedVerse[] = data.verses.map((v: any) => ({
            verseKey: v.verse_key,
            textTajweed: v.text_uthmani_tajweed,
        }));

        pageTajweedCache.set(pageNumber, verses);
        return verses;
    } catch (error) {
        console.error('Failed to fetch Tajweed page:', error);
        return [];
    }
}

