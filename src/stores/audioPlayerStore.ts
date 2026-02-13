import { create } from 'zustand';
import { getAudioUrl } from '../lib/quranApi';

export interface PlaylistItem {
    surahNumber: number;
    surahName: string;
    surahNameAr: string;
    totalAyahs: number;
}

interface AudioPlayerState {
    // Playback state
    isPlaying: boolean;
    currentAyahNumber: number;     // global ayah number
    currentAyahInSurah: number;    // ayah number within surah
    currentSurahNumber: number;
    currentSurahName: string;
    currentSurahNameAr: string;
    totalAyahsInSurah: number;
    duration: number;
    currentTime: number;

    // Playlist
    playlist: PlaylistItem[];
    currentPlaylistIndex: number;

    // Reciter
    reciterId: string;

    // Ayah list for current surah
    ayahs: { number: number; numberInSurah: number; text: string }[];

    // Actions
    playSurah: (surah: PlaylistItem, reciterId: string) => void;
    setPlaylist: (items: PlaylistItem[], startIndex: number, reciterId: string) => void;
    playAyah: (globalAyahNumber: number, ayahInSurah: number) => void;
    togglePlay: () => void;
    nextAyah: () => void;
    prevAyah: () => void;
    nextSurah: () => void;
    stop: () => void;
    setAyahs: (ayahs: { number: number; numberInSurah: number; text: string }[]) => void;
    updateTime: (current: number, dur: number) => void;
    getAudioRef: () => HTMLAudioElement;
}

// Single shared audio element for the global player
let globalAudio: HTMLAudioElement | null = null;

function getOrCreateAudio(): HTMLAudioElement {
    if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.preload = 'auto';
    }
    return globalAudio;
}

export const useAudioPlayerStore = create<AudioPlayerState>()((set, get) => ({
    isPlaying: false,
    currentAyahNumber: 0,
    currentAyahInSurah: 0,
    currentSurahNumber: 0,
    currentSurahName: '',
    currentSurahNameAr: '',
    totalAyahsInSurah: 0,
    duration: 0,
    currentTime: 0,
    playlist: [],
    currentPlaylistIndex: 0,
    reciterId: 'ar.alafasy',
    ayahs: [],

    playSurah: (surah, reciterId) => {
        set({
            currentSurahNumber: surah.surahNumber,
            currentSurahName: surah.surahName,
            currentSurahNameAr: surah.surahNameAr,
            totalAyahsInSurah: surah.totalAyahs,
            currentAyahInSurah: 1,
            currentAyahNumber: 0,
            isPlaying: false,
            reciterId,
            playlist: [surah],
            currentPlaylistIndex: 0,
            ayahs: [],
        });
    },

    setPlaylist: (items, startIndex, reciterId) => {
        const surah = items[startIndex];
        set({
            playlist: items,
            currentPlaylistIndex: startIndex,
            currentSurahNumber: surah.surahNumber,
            currentSurahName: surah.surahName,
            currentSurahNameAr: surah.surahNameAr,
            totalAyahsInSurah: surah.totalAyahs,
            currentAyahInSurah: 1,
            currentAyahNumber: 0,
            isPlaying: false,
            reciterId,
            ayahs: [],
        });
    },

    setAyahs: (ayahs) => {
        set({ ayahs });
        // Auto-play first ayah
        if (ayahs.length > 0) {
            const { reciterId } = get();
            const audio = getOrCreateAudio();
            set({
                currentAyahNumber: ayahs[0].number,
                currentAyahInSurah: 1,
                isPlaying: true,
            });
            audio.src = getAudioUrl(reciterId, ayahs[0].number);
            audio.play().catch(() => { });
        }
    },

    playAyah: (globalNumber, ayahInSurah) => {
        const { reciterId } = get();
        const audio = getOrCreateAudio();
        set({
            currentAyahNumber: globalNumber,
            currentAyahInSurah: ayahInSurah,
            isPlaying: true,
        });
        audio.src = getAudioUrl(reciterId, globalNumber);
        audio.play().catch(() => { });
    },

    togglePlay: () => {
        const { isPlaying, currentAyahNumber } = get();
        const audio = getOrCreateAudio();
        if (isPlaying) {
            audio.pause();
            set({ isPlaying: false });
        } else if (currentAyahNumber > 0) {
            audio.play().catch(() => { });
            set({ isPlaying: true });
        }
    },

    nextAyah: () => {
        const { ayahs, currentAyahInSurah, totalAyahsInSurah } = get();
        if (currentAyahInSurah < totalAyahsInSurah) {
            const nextIdx = currentAyahInSurah; // 0-indexed = currentAyahInSurah (since it's 1-based)
            if (ayahs[nextIdx]) {
                get().playAyah(ayahs[nextIdx].number, ayahs[nextIdx].numberInSurah);
            }
        } else {
            // End of surah — try next in playlist
            get().nextSurah();
        }
    },

    prevAyah: () => {
        const { ayahs, currentAyahInSurah } = get();
        if (currentAyahInSurah > 1) {
            const prevIdx = currentAyahInSurah - 2; // 0-indexed
            if (ayahs[prevIdx]) {
                get().playAyah(ayahs[prevIdx].number, ayahs[prevIdx].numberInSurah);
            }
        }
    },

    nextSurah: () => {
        const { playlist, currentPlaylistIndex, reciterId } = get();
        if (currentPlaylistIndex < playlist.length - 1) {
            const nextIdx = currentPlaylistIndex + 1;
            const nextSurah = playlist[nextIdx];
            set({
                currentPlaylistIndex: nextIdx,
                currentSurahNumber: nextSurah.surahNumber,
                currentSurahName: nextSurah.surahName,
                currentSurahNameAr: nextSurah.surahNameAr,
                totalAyahsInSurah: nextSurah.totalAyahs,
                currentAyahInSurah: 1,
                currentAyahNumber: 0,
                isPlaying: false,
                reciterId,
                ayahs: [],
            });
            // The MiniPlayer component will detect surah change and fetch ayahs
        } else {
            // End of playlist
            get().stop();
        }
    },

    stop: () => {
        const audio = getOrCreateAudio();
        audio.pause();
        audio.currentTime = 0;
        set({
            isPlaying: false,
            currentAyahNumber: 0,
            currentAyahInSurah: 0,
            currentSurahNumber: 0,
            currentSurahName: '',
            currentSurahNameAr: '',
            totalAyahsInSurah: 0,
            playlist: [],
            currentPlaylistIndex: 0,
            ayahs: [],
            currentTime: 0,
            duration: 0,
        });
    },

    updateTime: (current, dur) => {
        set({ currentTime: current, duration: dur });
    },

    getAudioRef: () => getOrCreateAudio(),
}));
