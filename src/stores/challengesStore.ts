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

// Reading Challenge Template
export interface ReadingChallengeTemplate {
    id: string;
    name: string;
    nameArabic: string;
    description: string;
    icon: string;
    color: string;
    type: 'khatm' | 'surah' | 'verse';
    target: number; // Pages for khatm, surah number for surah
    frequency: 'daily' | 'weekly' | 'after_prayer';
    frequencyDay?: number; // 0=Sunday, 5=Friday
    duration: number; // Days (0 = ongoing)
}

// Active Reading Challenge
export interface ActiveReadingChallenge {
    id: string;
    templateId: string;
    name: string;
    nameArabic: string;
    icon: string;
    color: string;
    type: 'khatm' | 'surah' | 'verse';
    target: number;
    frequency: 'daily' | 'weekly' | 'after_prayer';
    frequencyDay?: number;
    duration: number;
    startDate: string;
    progress: number;
    completedDates: string[];
    isActive: boolean;
}

// Pre-defined reading challenge templates
export const READING_TEMPLATES: ReadingChallengeTemplate[] = [
    {
        id: 'khatm-ramadan',
        name: 'Khatm Ramadan',
        nameArabic: 'ختم رمضان',
        description: 'Terminer le Coran en 30 jours (~20 pages/jour)',
        icon: '🌙',
        color: '#9C27B0',
        type: 'khatm',
        target: 604,
        frequency: 'daily',
        duration: 30
    },
    {
        id: 'alkahf-friday',
        name: 'Al-Kahf Vendredi',
        nameArabic: 'الكهف الجمعة',
        description: 'Lire Sourate Al-Kahf chaque vendredi',
        icon: '📖',
        color: '#2196F3',
        type: 'surah',
        target: 18,
        frequency: 'weekly',
        frequencyDay: 5,
        duration: 0
    },
    {
        id: 'almulk-night',
        name: 'Al-Mulk Nuit',
        nameArabic: 'الملك قبل النوم',
        description: 'Lire Sourate Al-Mulk chaque soir',
        icon: '🌃',
        color: '#3F51B5',
        type: 'surah',
        target: 67,
        frequency: 'daily',
        duration: 0
    },
    {
        id: 'ayat-kursi',
        name: 'Ayat al-Kursi',
        nameArabic: 'آية الكرسي',
        description: 'Lire après chaque prière',
        icon: '🛡️',
        color: '#4CAF50',
        type: 'verse',
        target: 255,
        frequency: 'after_prayer',
        duration: 0
    },
    {
        id: '3-qul',
        name: 'Les 3 Qul',
        nameArabic: 'المعوذات',
        description: 'Sourates 112-114 matin et soir',
        icon: '🤲',
        color: '#FF9800',
        type: 'surah',
        target: 112,
        frequency: 'daily',
        duration: 0
    },
    {
        id: 'yasin-morning',
        name: 'Yasin Matin',
        nameArabic: 'يس صباحاً',
        description: 'Sourate Yasin chaque matin',
        icon: '🌅',
        color: '#E91E63',
        type: 'surah',
        target: 36,
        frequency: 'daily',
        duration: 0
    }
];

export interface ChallengesState {
    // Daily challenges
    dailyChallenges: DailyChallenge[];
    lastChallengeDate: string;

    // Reading challenges (new)
    activeReadingChallenges: ActiveReadingChallenge[];

    // Badges
    unlockedBadges: string[];

    // Khatma progress
    khatmaPages: number[];

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

    // Reading challenge actions (new)
    startReadingChallenge: (template: ReadingChallengeTemplate, customName?: string) => void;
    markReadingChallengeComplete: (challengeId: string) => void;
    removeReadingChallenge: (challengeId: string) => void;
    getTodayReading: (challengeId: string) => { start: number; end: number } | null;
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
            activeReadingChallenges: [],
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

                if (streak >= 3 && !state.unlockedBadges.includes('streak_3')) toUnlock.push('streak_3');
                if (streak >= 7 && !state.unlockedBadges.includes('streak_7')) toUnlock.push('streak_7');
                if (streak >= 30 && !state.unlockedBadges.includes('streak_30')) toUnlock.push('streak_30');
                if (streak >= 100 && !state.unlockedBadges.includes('streak_100')) toUnlock.push('streak_100');

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
            },

            // Reading Challenge Actions
            startReadingChallenge: (template, customName) => {
                const newChallenge: ActiveReadingChallenge = {
                    id: `${template.id}-${Date.now()}`,
                    templateId: template.id,
                    name: customName || template.name,
                    nameArabic: template.nameArabic,
                    icon: template.icon,
                    color: template.color,
                    type: template.type,
                    target: template.target,
                    frequency: template.frequency,
                    frequencyDay: template.frequencyDay,
                    duration: template.duration,
                    startDate: getTodayDate(),
                    progress: 0,
                    completedDates: [],
                    isActive: true
                };

                set(state => ({
                    activeReadingChallenges: [...state.activeReadingChallenges, newChallenge]
                }));
            },

            markReadingChallengeComplete: (challengeId) => {
                const today = getTodayDate();

                set(state => ({
                    activeReadingChallenges: state.activeReadingChallenges.map(c => {
                        if (c.id !== challengeId) return c;
                        if (c.completedDates.includes(today)) return c;

                        const pagesPerDay = c.type === 'khatm' ? Math.ceil(604 / c.duration) : 0;
                        const newProgress = c.type === 'khatm'
                            ? c.progress + pagesPerDay
                            : c.progress + 1;

                        return {
                            ...c,
                            progress: Math.min(newProgress, c.type === 'khatm' ? 604 : 999),
                            completedDates: [...c.completedDates, today]
                        };
                    })
                }));
            },

            removeReadingChallenge: (challengeId) => {
                set(state => ({
                    activeReadingChallenges: state.activeReadingChallenges.filter(c => c.id !== challengeId)
                }));
            },

            getTodayReading: (challengeId) => {
                const challenge = get().activeReadingChallenges.find(c => c.id === challengeId);
                if (!challenge || challenge.type !== 'khatm') return null;

                const pagesPerDay = Math.ceil(604 / challenge.duration);
                const dayNumber = challenge.completedDates.length + 1;
                const start = (dayNumber - 1) * pagesPerDay + 1;
                const end = Math.min(dayNumber * pagesPerDay, 604);

                return { start, end };
            }
        }),
        {
            name: 'quran-coach-challenges'
        }
    )
);
