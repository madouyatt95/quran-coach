import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAyahCountForPage, TOTAL_VERSES } from '../components/Mushaf/pageVerseData';

interface KhatmState {
    // Config
    isActive: boolean;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD

    // Progress - stored as sorted array for persistence
    validatedPages: number[];

    // Actions
    activate: (start: string, end: string) => void;
    deactivate: () => void;
    togglePage: (page: number) => void;
    reset: () => void;

    // Computed helpers
    isPageValidated: (page: number) => boolean;
    getOverallProgress: () => { read: number; total: number; pct: number };
    getTotalDays: () => number;
    getDayNumber: () => number;   // which day of the khatm we're on (1-based)
    getDaysRemaining: () => number;
    getDailyGoal: () => number;   // adaptive pages/day
    getTodayRange: () => { start: number; end: number }; // suggested pages for today
    getTodayRead: () => number;   // pages read today (within today's range)
    getStreak: () => number;
    getNextPage: () => number; // First unvalidated page
}

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export const useKhatmStore = create<KhatmState>()(
    persist(
        (set, get) => ({
            isActive: false,
            startDate: '',
            endDate: '',
            validatedPages: [],

            activate: (start, end) => set({
                isActive: true,
                startDate: start,
                endDate: end,
                validatedPages: [],
            }),

            deactivate: () => set({ isActive: false }),

            togglePage: (page) => set((state) => {
                const pages = [...state.validatedPages];
                const idx = pages.indexOf(page);
                if (idx >= 0) {
                    pages.splice(idx, 1);
                } else {
                    pages.push(page);
                    pages.sort((a, b) => a - b);
                }
                return { validatedPages: pages };
            }),

            reset: () => set({ validatedPages: [], isActive: false, startDate: '', endDate: '' }),

            isPageValidated: (page) => get().validatedPages.includes(page),

            getOverallProgress: () => {
                const validated = get().validatedPages;
                const read = validated.reduce((sum, p) => sum + getAyahCountForPage(p), 0);
                const total = TOTAL_VERSES;
                return { read, total, pct: Math.round((read / total) * 100) };
            },

            getTotalDays: () => {
                const { startDate, endDate } = get();
                if (!startDate || !endDate) return 30;
                return daysBetween(startDate, endDate) + 1;
            },

            getDayNumber: () => {
                const { startDate } = get();
                if (!startDate) return 1;
                const today = todayStr();
                const day = daysBetween(startDate, today) + 1;
                return Math.max(1, day);
            },

            getDaysRemaining: () => {
                const { endDate } = get();
                if (!endDate) return 30;
                const today = todayStr();
                const rem = daysBetween(today, endDate) + 1;
                return Math.max(1, rem);
            },

            getDailyGoal: () => {
                const validated = get().validatedPages;
                const read = validated.reduce((sum, p) => sum + getAyahCountForPage(p), 0);
                const remaining = TOTAL_VERSES - read;
                const daysLeft = get().getDaysRemaining();
                const versesPerDay = Math.ceil(remaining / daysLeft);
                // We return "equivalent pages" for the UI, but calculated from verses
                return Math.ceil(versesPerDay / 10.3);
            },

            getTodayRange: () => {
                const totalDays = get().getTotalDays();
                const dayNum = get().getDayNumber();
                const pagesPerDay = Math.ceil(604 / totalDays);

                const start = (dayNum - 1) * pagesPerDay + 1;
                const end = Math.min(dayNum * pagesPerDay, 604);
                return { start: Math.min(start, 604), end };
            },

            getTodayRead: () => {
                const { start, end } = get().getTodayRange();
                const validated = get().validatedPages;
                return validated.filter(p => p >= start && p <= end).length;
            },

            getStreak: () => {
                const { startDate, validatedPages } = get();
                if (!startDate) return 0;

                const totalDays = get().getTotalDays();
                const pagesPerDay = Math.ceil(604 / totalDays);
                const today = todayStr();
                let streak = 0;

                // Check backwards from today
                for (let i = 0; i < 60; i++) {
                    const d = new Date(today + 'T00:00:00');
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().slice(0, 10);

                    if (dateStr < startDate) break;

                    const dayNum = daysBetween(startDate, dateStr) + 1;
                    const rangeStart = (dayNum - 1) * pagesPerDay + 1;
                    const rangeEnd = Math.min(dayNum * pagesPerDay, 604);
                    const readInRange = validatedPages.filter(
                        p => p >= rangeStart && p <= rangeEnd
                    ).length;
                    const goal = rangeEnd - rangeStart + 1;

                    if (readInRange >= goal) {
                        streak++;
                    } else if (i > 0) {
                        // Today can be incomplete, but past days must be complete
                        break;
                    }
                }
                return streak;
            },

            getNextPage: () => {
                const validated = get().validatedPages;
                if (validated.length === 0) return 1;
                // Find first missing page in sequence
                for (let i = 1; i <= 604; i++) {
                    if (!validated.includes(i)) return i;
                }
                return 604; // All done
            },
        }),
        {
            name: 'quran-coach-khatm',
        }
    )
);
