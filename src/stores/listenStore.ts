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

// List of universally recognized popular reciter IDs from MP3Quran API
const POPULAR_RECITER_IDS = [
    54,  // Abdul Rahman Al-Sudais
    34,  // Saud Al-Shuraim
    114, // Mishary Rashid Alafasy
    33,  // Saad Al-Ghamdi
    108, // Maher Al-Muaiqly
    120, // Yasser Al-Dosari
    4,   // Ahmad Al-Ajmi
    98,  // Mohamed Siddiq El-Minshawi
    51,  // Abdul Basit Abdul Samad
    47,  // Mahmoud Khalil Al-Husary
    119, // Nasser Al Qatami
    32,  // Fares Abbad
    29   // Abu Bakr Al Shatri
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
