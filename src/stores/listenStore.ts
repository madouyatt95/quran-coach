import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaylistItem } from '../types';

interface LastListened {
    reciterId: number;
    reciterName: string;
    surahNumber: number;
    surahName: string;
    audioUrl: string;
    position: number; // seconds
    playlist?: PlaylistItem[]; // full playlist for resume
    playlistIndex?: number; // current index in playlist
}

import type { MP3QuranReciter } from '../lib/mp3QuranApi';
import { mp3QuranApi, ARABIC_FRENCH_COLLECTION, OMAR_HISHAM_COLLECTION } from '../lib/mp3QuranApi';

interface ListenState {
    reciters: MP3QuranReciter[];
    featuredReciters: any[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    lastListened: LastListened | null;

    // Actions
    fetchReciters: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    getFilteredReciters: () => MP3QuranReciter[];
    getPopularReciters: () => MP3QuranReciter[];
    setLastListened: (data: LastListened) => void;
    updateLastPosition: (position: number) => void;
    updateLastPlaylistIndex: (index: number) => void;
    clearLastListened: () => void;
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
    2,   // Ibrahime Al Jebrine
    81,  // Faress Abbad
    4    // Shaik Aboubaker Al-Chateri
];

// Display name overrides for popular reciters (API uses French transliterations)
const POPULAR_NAME_OVERRIDES: Record<number, string> = {
    54: 'Abdurrahman As-Sudais',
    31: 'Saud Ash-Shuraim',
    123: 'Mishary Rashid Alafasy',
    30: 'Saad Al-Ghamidi',
    102: 'Maher Al-Muaiqly',
    92: 'Yasser Ad-Dossari',
    5: 'Ahmed Al-Ajmi',
    112: 'Mohamed Siddiq Al-Minshawi',
    51: 'Abdulbasit Abdussamad',
    118: 'Mahmoud Khalil Al-Hussary',
    2: 'Ibrahim Al-Jibreen',
    81: 'Fares Abbad',
    4: 'Abu Bakr Ash-Shatri',
};

export const useListenStore = create<ListenState>()(
    persist(
        (set, get) => ({
            reciters: [],
            featuredReciters: [ARABIC_FRENCH_COLLECTION],
            isLoading: false,
            error: null,
            searchQuery: '',
            lastListened: null,

            fetchReciters: async () => {
                set({ isLoading: true, error: null });
                try {
                    const reciters = await mp3QuranApi.getReciters('fr');
                    // Inject custom collections as synthetic reciters
                    const omarHishamSynthetic: MP3QuranReciter = {
                        id: -1, // special ID, routed via OMAR_HISHAM_COLLECTION.id
                        name: OMAR_HISHAM_COLLECTION.name,
                        letter: 'O',
                        date: '',
                        moshaf: [{ id: -1, name: 'Hafs An Asim - Murattal', server: OMAR_HISHAM_COLLECTION.baseUrl, surah_total: OMAR_HISHAM_COLLECTION.surahs.length, moshaf_type: 11, surah_list: OMAR_HISHAM_COLLECTION.surahs.join(',') }]
                    };
                    set({ reciters: [omarHishamSynthetic, ...reciters], isLoading: false });
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
                const popular = reciters
                    .filter(r => POPULAR_RECITER_IDS.includes(r.id))
                    .map(r => POPULAR_NAME_OVERRIDES[r.id] ? { ...r, name: POPULAR_NAME_OVERRIDES[r.id] } : r);
                // Also include Omar Hisham (synthetic reciter with id -1)
                const omarHisham = reciters.find(r => r.id === -1);
                if (omarHisham) popular.unshift(omarHisham);
                return popular;
            },

            setLastListened: (data) => set({ lastListened: data }),

            updateLastPosition: (position) => set((state) => ({
                lastListened: state.lastListened
                    ? { ...state.lastListened, position }
                    : null
            })),

            updateLastPlaylistIndex: (index) => set((state) => ({
                lastListened: state.lastListened
                    ? { ...state.lastListened, playlistIndex: index }
                    : null
            })),

            clearLastListened: () => set({ lastListened: null }),
        }),
        {
            name: 'quran-coach-listen',
            partialize: (state) => ({ lastListened: state.lastListened }),
        }
    )
);
