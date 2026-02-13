import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Theme, ArabicFontSize, ViewMode } from '../types';

// Extended list of reciters with metadata
// quranComId is used for word timing API (chapter_recitations endpoint)
export const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Al-Afasy', nameArabic: 'مشاري العفاسي', country: '🇰🇼', quranComId: 7 },
    { id: 'ar.abdulbasit', name: 'Abdul Basit', nameArabic: 'عبد الباسط', country: '🇪🇬', quranComId: 1 },
    { id: 'ar.husary', name: 'Mahmoud Al-Husary', nameArabic: 'محمود الحصري', country: '🇪🇬', quranComId: 5 },
    { id: 'ar.minshawi', name: 'Mohamed Al-Minshawi', nameArabic: 'محمد المنشاوي', country: '🇪🇬', quranComId: 6 },
    { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman As-Sudais', nameArabic: 'عبد الرحمن السديس', country: '🇸🇦', quranComId: 2 },
    { id: 'ar.saaborehman', name: 'Saad Al-Ghamdi', nameArabic: 'سعد الغامدي', country: '🇸🇦', quranComId: 10 },
    { id: 'ar.maaborehman', name: 'Maher Al-Muaiqly', nameArabic: 'ماهر المعيقلي', country: '🇸🇦', quranComId: 3 },
    { id: 'ar.ahmedajamy', name: 'Ahmad Al-Ajmi', nameArabic: 'أحمد العجمي', country: '🇰🇼', quranComId: 8 },
    { id: 'ar.haborehman', name: 'Hani Ar-Rifai', nameArabic: 'هاني الرفاعي', country: '🇸🇦', quranComId: 9 },
    { id: 'ar.paborehman', name: 'Fares Abbad', nameArabic: 'فارس عباد', country: '🇸🇦', quranComId: 4 },
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
            arabicFontSize: 'md',
            viewMode: 'mushaf',
            lineSpacing: 2.4,
            showTranslation: true,
            translationLanguage: 'fr',
            tajwidEnabled: true,
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
            version: 5, // Increment for revert
            migrate: (persistedState: any, version: number) => {
                const originalLayers = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];

                if (version < 5) {
                    return {
                        ...persistedState,
                        tajwidLayers: originalLayers,
                    };
                }
                return persistedState;
            },
        }
    )
);
