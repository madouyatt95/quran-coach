import { create } from 'zustand';
import type { MP3QuranReciter } from '../lib/mp3QuranApi';
import { mp3QuranApi, ARABIC_FRENCH_COLLECTION } from '../lib/mp3QuranApi';

interface ListenState {
    reciters: MP3QuranReciter[];
    featuredReciters: any[]; // For Hudhayfi x Leclerc
    isLoading: boolean;
    error: string | null;
    searchQuery: string;

    // Actions
    fetchReciters: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    getFilteredReciters: () => MP3QuranReciter[];
    getPopularReciters: () => MP3QuranReciter[];
}

// List of popular reciter IDs verified for the French MP3Quran API
const POPULAR_RECITER_IDS = [
    54,  // Abderrahmane Soudais
    31,  // Saoud Al Cherim
    123, // Mishary Al Afasi
    30,  // Saad El Ghamidi
    102, // Maher Al Meaqli
    92,  // Yasser Al Doussari
    5,   // Ahmed El-Ajami
    112, // Mohamed Seddik El Manchaoui
    51,  // Abdelbassit Abdelsamad
    118, // Mahmoud Khalil Al-Hussary
    111, // Mohamed Jibreel
    81,  // Faress Abbad
    4    // Shaik Aboubaker Al-Chateri
];

export const useListenStore = create<ListenState>()((set, get) => ({
    reciters: [],
    featuredReciters: [ARABIC_FRENCH_COLLECTION],
    isLoading: false,
    error: null,
    searchQuery: '',

    fetchReciters: async () => {
        set({ isLoading: true, error: null });
        try {
            const reciters = await mp3QuranApi.getReciters('fr');
            set({ reciters, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to load reciters', isLoading: false });
        }
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    getFilteredReciters: () => {
        const { reciters, searchQuery } = get();
        if (!searchQuery) return reciters;
        return reciters.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    },

    getPopularReciters: () => {
        const { reciters } = get();
        // Priority to those in the popular ID list, then maybe those with images?
        // For now, just those in the list
        return reciters.filter(r => POPULAR_RECITER_IDS.includes(r.id));
    }
}));
