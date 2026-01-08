import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Badge definitions
export interface Badge {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    icon: string;
    requirement: number;
    type: 'streak' | 'pages' | 'surahs' | 'memorization' | 'special';
}

export const BADGES: Badge[] = [
    // Streak badges
    { id: 'streak_3', name: 'Débutant', nameAr: 'مبتدئ', description: '3 jours consécutifs', icon: '🌱', requirement: 3, type: 'streak' },
    { id: 'streak_7', name: 'Régulier', nameAr: 'منتظم', description: '7 jours consécutifs', icon: '🔥', requirement: 7, type: 'streak' },
    { id: 'streak_30', name: 'Assidu', nameAr: 'مثابر', description: '30 jours consécutifs', icon: '⭐', requirement: 30, type: 'streak' },
    { id: 'streak_100', name: 'Maître', nameAr: 'متقن', description: '100 jours consécutifs', icon: '👑', requirement: 100, type: 'streak' },

    // Pages read badges
    { id: 'pages_10', name: 'Lecteur', nameAr: 'قارئ', description: '10 pages lues', icon: '📖', requirement: 10, type: 'pages' },
    { id: 'pages_100', name: 'Grand Lecteur', nameAr: 'قارئ كبير', description: '100 pages lues', icon: '📚', requirement: 100, type: 'pages' },
    { id: 'pages_604', name: 'Khatm', nameAr: 'ختم', description: 'Coran complet lu', icon: '🏆', requirement: 604, type: 'pages' },

    // Surah badges
    { id: 'fatiha', name: 'Al-Fatiha', nameAr: 'الفاتحة', description: 'Sourate 1 mémorisée', icon: '🌟', requirement: 1, type: 'surahs' },
    { id: 'juz_amma', name: "Juz' Amma", nameAr: 'جزء عمّ', description: 'Dernière partie mémorisée', icon: '🎯', requirement: 30, type: 'memorization' },
];

// Daily challenge types
export interface DailyChallenge {
    id: string;
    type: 'read_pages' | 'memorize_ayah' | 'recite_surah' | 'revision';
    title: string;
    titleAr: string;
    description: string;
    target: number;
    progress: number;
    surah?: number;
    ayah?: number;
    reward: string;
    completed: boolean;
}

export interface ChallengesState {
    // Daily challenges
    dailyChallenges: DailyChallenge[];
    lastChallengeDate: string;

    // Badges
    unlockedBadges: string[];

    // Khatma progress
    khatmaPages: number[]; // Array of page numbers that have been read

    // Ayah of the day
    ayahOfTheDay: { surah: number; ayah: number } | null;
    lastAyahDate: string;

    // Actions
    generateDailyChallenges: () => void;
    updateChallengeProgress: (challengeId: string, progress: number) => void;
    completeChallenge: (challengeId: string) => void;
    unlockBadge: (badgeId: string) => void;
    checkBadges: (streak: number, totalPages: number) => void;
    markPageRead: (pageNumber: number) => void;
    generateAyahOfTheDay: () => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

// Generate pseudo-random ayah based on date
const getAyahForDate = (date: string): { surah: number; ayah: number } => {
    const hash = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    // Select from popular surahs for variety
    const surahs = [
        { num: 1, maxAyah: 7 },    // Al-Fatiha
        { num: 2, maxAyah: 286 },  // Al-Baqarah
        { num: 3, maxAyah: 200 },  // Al-Imran
        { num: 18, maxAyah: 110 }, // Al-Kahf
        { num: 36, maxAyah: 83 },  // Ya-Sin
        { num: 55, maxAyah: 78 },  // Ar-Rahman
        { num: 67, maxAyah: 30 },  // Al-Mulk
        { num: 112, maxAyah: 4 },  // Al-Ikhlas
    ];

    const surahIndex = hash % surahs.length;
    const surah = surahs[surahIndex];
    const ayah = (hash * 7) % surah.maxAyah + 1;

    return { surah: surah.num, ayah };
};

export const useChallengesStore = create<ChallengesState>()(
    persist(
        (set, get) => ({
            dailyChallenges: [],
            lastChallengeDate: '',
            unlockedBadges: [],
            khatmaPages: [],
            ayahOfTheDay: null,
            lastAyahDate: '',

            generateDailyChallenges: () => {
                const today = getTodayDate();
                if (get().lastChallengeDate === today) return;

                const ayah = getAyahForDate(today);

                const challenges: DailyChallenge[] = [
                    {
                        id: 'read_1',
                        type: 'read_pages',
                        title: 'Lecture quotidienne',
                        titleAr: 'القراءة اليومية',
                        description: 'Lire au moins 1 page du Coran',
                        target: 1,
                        progress: 0,
                        reward: '🔥 +1 streak',
                        completed: false
                    },
                    {
                        id: 'memorize_ayah',
                        type: 'memorize_ayah',
                        title: 'Verset du jour',
                        titleAr: 'آية اليوم',
                        description: `Mémoriser le verset ${ayah.surah}:${ayah.ayah}`,
                        target: 1,
                        progress: 0,
                        surah: ayah.surah,
                        ayah: ayah.ayah,
                        reward: '⭐ +10 XP',
                        completed: false
                    },
                    {
                        id: 'revision',
                        type: 'revision',
                        title: 'Révision',
                        titleAr: 'المراجعة',
                        description: 'Réviser 3 versets mémorisés',
                        target: 3,
                        progress: 0,
                        reward: '📚 Badge progrès',
                        completed: false
                    }
                ];

                set({
                    dailyChallenges: challenges,
                    lastChallengeDate: today,
                    ayahOfTheDay: ayah,
                    lastAyahDate: today
                });
            },

            updateChallengeProgress: (challengeId, progress) => {
                set(state => ({
                    dailyChallenges: state.dailyChallenges.map(c =>
                        c.id === challengeId
                            ? { ...c, progress: Math.min(progress, c.target), completed: progress >= c.target }
                            : c
                    )
                }));
            },

            completeChallenge: (challengeId) => {
                set(state => ({
                    dailyChallenges: state.dailyChallenges.map(c =>
                        c.id === challengeId
                            ? { ...c, completed: true, progress: c.target }
                            : c
                    )
                }));
            },

            unlockBadge: (badgeId) => {
                const state = get();
                if (!state.unlockedBadges.includes(badgeId)) {
                    set({ unlockedBadges: [...state.unlockedBadges, badgeId] });
                }
            },

            checkBadges: (streak, totalPages) => {
                const state = get();
                const toUnlock: string[] = [];

                // Check streak badges
                if (streak >= 3 && !state.unlockedBadges.includes('streak_3')) toUnlock.push('streak_3');
                if (streak >= 7 && !state.unlockedBadges.includes('streak_7')) toUnlock.push('streak_7');
                if (streak >= 30 && !state.unlockedBadges.includes('streak_30')) toUnlock.push('streak_30');
                if (streak >= 100 && !state.unlockedBadges.includes('streak_100')) toUnlock.push('streak_100');

                // Check pages badges
                if (totalPages >= 10 && !state.unlockedBadges.includes('pages_10')) toUnlock.push('pages_10');
                if (totalPages >= 100 && !state.unlockedBadges.includes('pages_100')) toUnlock.push('pages_100');
                if (totalPages >= 604 && !state.unlockedBadges.includes('pages_604')) toUnlock.push('pages_604');

                if (toUnlock.length > 0) {
                    set({ unlockedBadges: [...state.unlockedBadges, ...toUnlock] });
                }
            },

            markPageRead: (pageNumber) => {
                const state = get();
                if (!state.khatmaPages.includes(pageNumber)) {
                    set({ khatmaPages: [...state.khatmaPages, pageNumber] });
                }
            },

            generateAyahOfTheDay: () => {
                const today = getTodayDate();
                if (get().lastAyahDate === today && get().ayahOfTheDay) return;

                const ayah = getAyahForDate(today);
                set({ ayahOfTheDay: ayah, lastAyahDate: today });
            }
        }),
        {
            name: 'quran-coach-challenges'
        }
    )
);
