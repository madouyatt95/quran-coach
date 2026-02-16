import { create } from 'zustand';
import { getAudioUrl } from '../lib/quranApi';

export interface PlaylistItem {
    surahNumber: number;
    surahName: string;
    surahNameAr: string;
    totalAyahs: number;
    audioUrl?: string; // For direct streaming (Listen page)
    playbackType?: 'ayah' | 'surah';
    transliteration?: string;
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
    playbackType: 'ayah' | 'surah';
    repeatMode: 'none' | 'one' | 'all';

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
    seek: (time: number) => void;
    toggleRepeatMode: () => void;
    jumpToPlaylistIndex: (index: number) => void;
    getAudioRef: () => HTMLAudioElement;
    addToQueue: (surah: PlaylistItem) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
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
    playbackType: 'ayah',
    repeatMode: 'none',
    playlist: [],
    currentPlaylistIndex: 0,
    reciterId: 'ar.alafasy',
    ayahs: [],

    playSurah: (surah, reciterId) => {
        const audio = getOrCreateAudio();
        const pMode = surah.playbackType || 'ayah';

        set({
            currentSurahNumber: surah.surahNumber,
            currentSurahName: surah.surahName,
            currentSurahNameAr: surah.surahNameAr,
            totalAyahsInSurah: surah.totalAyahs,
            currentAyahInSurah: pMode === 'surah' ? 0 : 1,
            currentAyahNumber: 0,
            isPlaying: pMode === 'surah', // Auto-play if surah mode
            reciterId,
            playlist: [surah],
            currentPlaylistIndex: 0,
            ayahs: [],
            playbackType: pMode,
        });

        if (pMode === 'surah' && surah.audioUrl) {
            audio.src = surah.audioUrl;
            audio.play().catch(() => { });
        }
    },

    setPlaylist: (items, startIndex, reciterId) => {
        const surah = items[startIndex];
        const pMode = surah.playbackType || 'ayah';
        set({
            playlist: items,
            currentPlaylistIndex: startIndex,
            currentSurahNumber: surah.surahNumber,
            currentSurahName: surah.surahName,
            currentSurahNameAr: surah.surahNameAr,
            totalAyahsInSurah: surah.totalAyahs,
            currentAyahInSurah: pMode === 'surah' ? 0 : 1,
            currentAyahNumber: 0,
            isPlaying: false,
            reciterId,
            ayahs: [],
            playbackType: pMode,
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
        const { isPlaying, currentAyahNumber, playbackType } = get();
        const audio = getOrCreateAudio();
        if (isPlaying) {
            audio.pause();
            set({ isPlaying: false });
        } else if (playbackType === 'surah' || currentAyahNumber > 0) {
            audio.play().catch(() => { });
            set({ isPlaying: true });
        }
    },

    seek: (time) => {
        const audio = getOrCreateAudio();
        audio.currentTime = time;
        set({ currentTime: time });
    },

    toggleRepeatMode: () => {
        const { repeatMode } = get();
        const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
        const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
        set({ repeatMode: nextMode });
    },

    jumpToPlaylistIndex: (index) => {
        const { playlist, reciterId } = get();
        if (!playlist[index]) return;

        const surah = playlist[index];
        const audio = getOrCreateAudio();
        const pMode = surah.playbackType || 'ayah';

        set({
            currentPlaylistIndex: index,
            currentSurahNumber: surah.surahNumber,
            currentSurahName: surah.surahName,
            currentSurahNameAr: surah.surahNameAr,
            totalAyahsInSurah: surah.totalAyahs,
            currentAyahInSurah: pMode === 'surah' ? 0 : 1,
            currentAyahNumber: 0,
            isPlaying: true,
            reciterId,
            ayahs: [],
            playbackType: pMode,
        });

        if (pMode === 'surah' && surah.audioUrl) {
            audio.src = surah.audioUrl;
            audio.play().catch(console.error);
        }
    },

    nextAyah: () => {
        const { ayahs, currentAyahInSurah, totalAyahsInSurah, playbackType, repeatMode } = get();

        if (repeatMode === 'one') {
            const audio = getOrCreateAudio();
            audio.currentTime = 0;
            audio.play().catch(() => { });
            return;
        }

        if (playbackType === 'surah') {
            get().nextSurah();
            return;
        }

        if (currentAyahInSurah < totalAyahsInSurah) {
            const nextIdx = currentAyahInSurah;
            if (ayahs[nextIdx]) {
                get().playAyah(ayahs[nextIdx].number, ayahs[nextIdx].numberInSurah);
            }
        } else {
            get().nextSurah();
        }
    },

    prevAyah: () => {
        const { ayahs, currentAyahInSurah, playbackType } = get();
        if (playbackType === 'surah') {
            // Reset current surah to 0
            const audio = getOrCreateAudio();
            audio.currentTime = 0;
            set({ currentTime: 0 });
            return;
        }

        if (currentAyahInSurah > 1) {
            const prevIdx = currentAyahInSurah - 2; // 0-indexed
            if (ayahs[prevIdx]) {
                get().playAyah(ayahs[prevIdx].number, ayahs[prevIdx].numberInSurah);
            }
        }
    },

    nextSurah: () => {
        const { playlist, currentPlaylistIndex, repeatMode } = get();

        if (repeatMode === 'one') {
            const currentItem = playlist[currentPlaylistIndex];
            if (currentItem?.playbackType === 'surah' && currentItem.audioUrl) {
                const audio = getOrCreateAudio();
                audio.currentTime = 0;
                audio.play().catch(() => { });
                return;
            }
        }

        if (currentPlaylistIndex < playlist.length - 1) {
            get().jumpToPlaylistIndex(currentPlaylistIndex + 1);
        } else if (repeatMode === 'all' && playlist.length > 0) {
            get().jumpToPlaylistIndex(0);
        } else {
            // End of playlist
            get().stop();
        }
    },

    stop: () => {
        const audio = getOrCreateAudio();
        audio.pause();
        audio.src = '';
        audio.currentTime = 0;
        set({
            isPlaying: false,
            currentAyahNumber: 0,
            currentAyahInSurah: 0,
            currentSurahNumber: 0,
            currentSurahName: '',
            currentSurahNameAr: '',
            totalAyahsInSurah: 0,
            playbackType: 'ayah',
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

    addToQueue: (surah) => {
        const { playlist, currentSurahNumber, reciterId } = get();
        if (currentSurahNumber === 0) {
            // Nothing playing — start this surah
            get().playSurah(surah, reciterId);
        } else {
            // Append to playlist
            set({ playlist: [...playlist, surah] });
        }
    },

    removeFromQueue: (index) => {
        const { playlist, currentPlaylistIndex } = get();
        if (index <= currentPlaylistIndex) return; // Can't remove current or past items
        const newPlaylist = playlist.filter((_, i) => i !== index);
        set({ playlist: newPlaylist });
    },

    clearQueue: () => {
        const { playlist, currentPlaylistIndex } = get();
        // Keep everything up to the current track
        const newPlaylist = playlist.slice(0, currentPlaylistIndex + 1);
        set({ playlist: newPlaylist });
    },
}));
