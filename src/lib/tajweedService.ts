// Tajweed Service - Fetch pre-colored Tajweed text from Quran.com API
// API provides <tajweed class="rule"> tags for each Tajweed rule

export interface TajweedVerse {
    verseKey: string;
    textTajweed: string; // HTML with <tajweed class=X> tags
}

/**
 * Tajweed rule definitions with colors.
 * COLORS MIRRORED FROM MYISLAMHUB.COM
 */
export const TAJWEED_RULES: Record<string, { name: string; nameArabic: string; color: string; description: string }> = {
    // Hamza & Silents (Gray)
    'ham_wasl': { name: 'Hamza Wasl', nameArabic: 'همزة الوصل', color: '#AAAAAA', description: 'Hamza silencieuse (liaison)' },
    'silent': { name: 'Lettre silencieuse', nameArabic: 'حرف ساكن', color: '#AAAAAA', description: 'Lettre non prononcée' },
    'slnt': { name: 'Lettre silencieuse', nameArabic: 'حرف ساكن', color: '#AAAAAA', description: 'Lettre non prononcée' },
    'laam_shamsiyah': { name: 'Lam Shamsiyah', nameArabic: 'اللام الشمسية', color: '#AAAAAA', description: 'Lam solaire (assimilée)' },

    // Madd (Prolongation) - Blues and Reds
    'madda_normal': { name: 'Madd Normal', nameArabic: 'المد الطبيعي', color: '#537FFF', description: 'Prolongation naturelle (2 temps)' },
    'madda_permissible': { name: 'Madd Permissible', nameArabic: 'المد الجائز', color: '#4169E1', description: 'Prolongation permise (2-6 temps)' },
    'madda_necessary': { name: 'Madd Lazem', nameArabic: 'المد اللازم', color: '#00008B', description: 'Prolongation obligatoire (6 temps)' },
    'madda_obligatory': { name: 'Madd Obligatoire', nameArabic: 'المد الواجب', color: '#1E90FF', description: 'Prolongation obligatoire (4-5 temps)' },

    // Ghunnah & Ikhfa (Green)
    'ghunnah': { name: 'Ghunnah', nameArabic: 'الغنة', color: '#169200', description: 'Son nasal (2 temps)' },
    'ghunnah_2': { name: 'Ghunnah', nameArabic: 'الغنة', color: '#169200', description: 'Son nasal (2 temps)' },
    'ikhfa': { name: 'Ikhfa', nameArabic: 'الإخفاء', color: '#169200', description: 'Dissimulation nasale (15 lettres)' },
    'ikhfa_shafawi': { name: 'Ikhfa Shafawi', nameArabic: 'إخفاء شفوي', color: '#169200', description: 'Dissimulation labiale (م avant ب)' },
    'ikhafa': { name: 'Ikhfa', nameArabic: 'الإخفاء', color: '#169200', description: 'Dissimulation nasale' },

    // Qalqalah (Red)
    'qalqalah': { name: 'Qalqalah', nameArabic: 'القلقلة', color: '#DD0008', description: 'Rebond sonore (ق ط ب ج د)' },
    'qalaqah': { name: 'Qalqalah', nameArabic: 'القلقلة', color: '#DD0008', description: 'Rebond sonore' },

    // Idgham & Iqlab (Orange/Saumon)
    'idgham_ghunnah': { name: 'Idgham avec Ghunnah', nameArabic: 'إدغام بغنة', color: '#FF7F00', description: 'Fusion nasale avec ينمو' },
    'idgham_no_ghunnah': { name: 'Idgham sans Ghunnah', nameArabic: 'إدغام بلا غنة', color: '#FF6347', description: 'Fusion sans nasalisation avec ل ر' },
    'idgham_wo_ghunnah': { name: 'Idgham sans Ghunnah', nameArabic: 'إدغام بلا غنة', color: '#FF6347', description: 'Fusion sans nasalisation' },
    'idgham_mutajanisayn': { name: 'Idgham Mutajanisayn', nameArabic: 'إدغام متجانسين', color: '#FFA07A', description: 'Fusion de lettres similaires' },
    'idgham_mutaqaribayn': { name: 'Idgham Mutaqaribayn', nameArabic: 'إدغام متقاربين', color: '#FFB347', description: 'Fusion de lettres proches' },
    'iqlab': { name: 'Iqlab', nameArabic: 'الإقلاب', color: '#26BFBF', description: 'Conversion du ن en م devant ب' },

    // Izhar (Marron/Rouge foncé)
    'izhar': { name: 'Izhar', nameArabic: 'الإظهار', color: '#8B0000', description: 'Prononciation claire (6 lettres)' },
    'izhar_shafawi': { name: 'Izhar Shafawi', nameArabic: 'إظهار شفوي', color: '#BA4A4A', description: 'Prononciation labiale claire' },
    'izhar_halqi': { name: 'Izhar Halqi', nameArabic: 'إظهار حلقي', color: '#8B0000', description: 'Prononciation claire (lettres de la gorge)' },
};

// Cache for Tajweed text
const tajweedCache = new Map<number, TajweedVerse[]>();

/**
 * Fetch Tajweed text for a surah from Quran.com API
 */
export async function fetchTajweedSurah(surahNumber: number): Promise<TajweedVerse[]> {
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
 * Get available Tajweed rule categories for UI
 */
export function getTajweedCategories() {
    return [
        {
            id: 'madd',
            name: 'Madd (Prolongation)',
            nameArabic: 'المد',
            color: '#4169E1',
            rules: ['madda_normal', 'madda_permissible', 'madda_necessary', 'madda_obligatory']
        },
        {
            id: 'ghunnah',
            name: 'Ghunnah (Nasalisation)',
            nameArabic: 'الغنة',
            color: '#169200',
            rules: ['ghunnah', 'ghunnah_2']
        },
        {
            id: 'qalqalah',
            name: 'Qalqalah (Rebond)',
            nameArabic: 'القلقلة',
            color: '#DD0008',
            rules: ['qalqalah', 'qalaqah']
        },
        {
            id: 'idgham',
            name: 'Idgham (Fusion)',
            nameArabic: 'الإدغام',
            color: '#FF7F00',
            rules: ['idgham_ghunnah', 'idgham_no_ghunnah', 'idgham_mutajanisayn', 'idgham_mutaqaribayn']
        },
        {
            id: 'ikhfa',
            name: 'Ikhfa (Dissimulation)',
            nameArabic: 'الإخفاء',
            color: '#169200',
            rules: ['ikhfa', 'ikhfa_shafawi', 'ikhafa']
        },
        {
            id: 'iqlab',
            name: 'Iqlab (Conversion)',
            nameArabic: 'الإقلاب',
            color: '#26BFBF',
            rules: ['iqlab']
        },
        {
            id: 'izhar',
            name: 'Izhar (Clarté)',
            nameArabic: 'الإظهار',
            color: '#8B0000',
            rules: ['izhar', 'izhar_shafawi', 'izhar_halqi']
        },
        {
            id: 'other',
            name: 'Autres (Liaison, Muettes)',
            nameArabic: 'أخرى',
            color: '#AAAAAA',
            rules: ['ham_wasl', 'laam_shamsiyah', 'silent', 'slnt']
        }
    ];
}

// Cache for page Tajweed data
const pageTajweedCache = new Map<number, TajweedVerse[]>();

/**
 * Fetch Tajweed text for a specific page from Quran.com API
 */
export async function fetchTajweedPage(pageNumber: number): Promise<TajweedVerse[]> {
    if (pageTajweedCache.has(pageNumber)) {
        return pageTajweedCache.get(pageNumber)!;
    }

    try {
        const response = await fetch(
            `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&fields=text_uthmani_tajweed`
        );
        const data = await response.json();

        const verses: TajweedVerse[] = data.verses.map((v: any) => ({
            verse_id: v.id,
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

/**
 * Get Tajweed text for a specific verse
 */
export async function fetchTajweedVerse(surah: number, ayah: number): Promise<string | null> {
    const verses = await fetchTajweedSurah(surah);
    const verseKey = `${surah}:${ayah}`;
    const verse = verses.find(v => v.verseKey === verseKey);
    return verse?.textTajweed || null;
}
