import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Theme, ArabicFontSize, ViewMode } from '../types';

// Extended list of reciters with metadata
// quranComId is used for word timing API (chapter_recitations endpoint)
export const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Al-Afasy', nameArabic: 'مشاري العفاسي', country: '🇰🇼', quranComId: 7 },
];

// Playback speed options
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

interface SettingsState extends Settings {
    // Audio
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;

    // Visual
    starryMode: boolean;
    setStarryMode: (enabled: boolean) => void;

    // Existing
    setTheme: (theme: Theme) => void;
    setArabicFontSize: (size: ArabicFontSize) => void;
    setViewMode: (mode: ViewMode) => void;
    setLineSpacing: (spacing: number) => void;
    toggleTranslation: () => void;
    toggleTransliteration: () => void;
    setTranslationLanguage: (lang: string) => void;
    toggleTajwid: () => void;
    setTajwidLayers: (layers: string[]) => void;
    toggleTajwidLayer: (layerId: string) => void;
    setReciter: (reciterId: string) => void;
    setRepeatCount: (count: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Default settings
            theme: 'dark',
            arabicFontSize: 'xl',
            viewMode: 'mushaf',
            lineSpacing: 2.4,
            showTranslation: true,
            showTransliteration: true,
            translationLanguage: 'fr',
            tajwidEnabled: false,
            tajwidLayers: ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar', 'other'],
            selectedReciter: 'ar.alafasy',
            autoPlayAudio: false,
            repeatCount: 3,
            playbackSpeed: 1,
            starryMode: false,

            // Actions
            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme);
                set({ theme });
            },
            setArabicFontSize: (arabicFontSize) => set({ arabicFontSize }),
            setViewMode: (viewMode) => set({ viewMode }),
            setLineSpacing: (lineSpacing) => set({ lineSpacing }),
            toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
            toggleTransliteration: () => set((state) => ({ showTransliteration: !state.showTransliteration })),
            setTranslationLanguage: (translationLanguage) => set({ translationLanguage }),
            toggleTajwid: () => set((state) => ({ tajwidEnabled: !state.tajwidEnabled })),
            setTajwidLayers: (tajwidLayers) => set({ tajwidLayers }),
            toggleTajwidLayer: (layerId) => set((state) => ({
                tajwidLayers: state.tajwidLayers.includes(layerId)
                    ? state.tajwidLayers.filter(id => id !== layerId)
                    : [...state.tajwidLayers, layerId]
            })),
            setReciter: (selectedReciter) => set({ selectedReciter }),
            setRepeatCount: (repeatCount) => set({ repeatCount }),
            setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
            setStarryMode: (starryMode) => {
                document.documentElement.setAttribute('data-starry', starryMode ? 'true' : 'false');
                set({ starryMode });
            },
        }),
        {
            name: 'quran-coach-settings',
            version: 6, // Bump to apply new defaults
            migrate: (persistedState: any, version: number) => {
                const originalLayers = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];

                if (version < 6) {
                    return {
                        ...persistedState,
                        tajwidLayers: originalLayers,
                        arabicFontSize: 'xl',
                        showTransliteration: true,
                    };
                }
                return persistedState;
            },
        }
    )
);
