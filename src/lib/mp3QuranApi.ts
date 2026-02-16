const API_BASE_URL = 'https://mp3quran.net/api/v3';

export interface MP3QuranReciter {
    id: number;
    name: string;
    letter: string;
    date: string;
    moshaf: MP3QuranMoshaf[];
}

export interface MP3QuranMoshaf {
    id: number;
    name: string;
    server: string;
    surah_total: number;
    moshaf_type: number;
    surah_list: string;
}

export interface MP3QuranSurah {
    id: number;
    name: string;
    makkia: number;
    type: number;
    start_page: number;
    end_page: number;
}

export const mp3QuranApi = {
    /**
     * Fetch all reciters for a given language.
     * @param language Language code (ar, fr, eng, etc.)
     */
    async getReciters(language: string = 'ar'): Promise<MP3QuranReciter[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/reciters?language=${language}`);
            if (!response.ok) throw new Error('Failed to fetch reciters');
            const data = await response.json();
            return data.reciters;
        } catch (error) {
            console.error('[MP3QuranApi] Error fetching reciters:', error);
            return [];
        }
    },

    /**
     * Fetch list of surahs.
     */
    async getSurahs(language: string = 'fr'): Promise<MP3QuranSurah[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/suwar?language=${language}`);
            if (!response.ok) throw new Error('Failed to fetch surahs');
            const data = await response.json();
            return data.suwar;
        } catch (error) {
            console.error('[MP3QuranApi] Error fetching surahs:', error);
            return [];
        }
    },

    /**
     * Construct audio URL for a surah.
     * @param server The server URL from the moshaf object
     * @param surahId The surah number (1-114)
     */
    getAudioUrl(server: string, surahId: number): string {
        const formattedId = surahId.toString().padStart(3, '0');
        // Ensure server URL ends with a slash
        const baseUrl = server.endsWith('/') ? server : `${server}/`;
        return `${baseUrl}${formattedId}.mp3`;
    }
};

/**
 * Special Collection: Hudhayfi × Leclerc
 */
export const ARABIC_FRENCH_COLLECTION = {
    id: 'hudhayfi-leclerc',
    name: 'Ali Al-Hudhayfi × Youssouf Leclerc',
    nameArabic: 'علي الحذيفي × يوسف لوكلير',
    type: 'arabic_french',
    baseUrl: 'https://archive.org/download/Ali_al-Hudhaifi_and_Youssouf_Leclerc/',
    surahs: Array.from({ length: 114 }, (_, i) => i + 1),
    getAudioUrl: (surahId: number) => {
        const formattedId = surahId.toString().padStart(3, '0');
        return `https://archive.org/download/Ali_al-Hudhaifi_and_Youssouf_Leclerc/${formattedId}.mp3`;
    }
};
