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
}

export const useListenStore = create<ListenState>()((set, get) => ({
    reciters: [],
    featuredReciters: [ARABIC_FRENCH_COLLECTION],
    isLoading: false,
    error: null,
    searchQuery: '',

    fetchReciters: async () => {
        set({ isLoading: true, error: null });
        try {
            const reciters = await mp3QuranApi.getReciters('fr'); // Using 'fr' for French language metadata where available
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
    }
}));
