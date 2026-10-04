import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export function hasCompleteKhatm(pages: number[]): boolean {
    const valid = new Set(pages.filter(p => Number.isInteger(p) && p >= 1 && p <= 604));
    return valid.size === 604;
}

function legacyCompletionCount(): number {
    try { const count = Number(localStorage.getItem('quran-coach-khatm-count')); return Number.isSafeInteger(count) && count > 0 ? count : 0; }
    catch { return 0; }
}

interface KhatmState {
    completedAt: string | null;
    completionCount: number;
    celebrationPending: boolean;
    confirmCompletion: () => boolean;
    dismissCelebration: () => void;
    // Config
    isActive: boolean;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD

    // Progress - stored as sorted array for persistence
    validatedPages: number[];
    autoExcludedPages: number[];

    // Last reading position (dedicated to khatm, independent from quranStore)
    lastKhatmSurah: number;
    lastKhatmAyah: number;
    lastKhatmPage: number;

    // Daily tracking
    dailyReadCount?: number;
    lastActiveDate?: string;

    // Actions
    activate: (start: string, end: string) => void;
    deactivate: () => void;
    togglePage: (page: number) => void;
    validatePage: (page: number) => void;
    updateLastRead: (surah: number, ayah: number, page: number) => void;
    reset: () => void;

    // Computed helpers
    isPageValidated: (page: number) => boolean;
    getOverallProgress: () => { read: number; total: number; pct: number };
    getTotalDays: () => number;
    getDayNumber: () => number;
    getDaysRemaining: () => number;
    getDailyGoal: () => number;
    getTodayRange: () => { start: number; end: number };
    getTodayRead: () => number;
    getStreak: () => number;
    getNextPage: () => number;
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
            completedAt: null,
            completionCount: legacyCompletionCount(),
            celebrationPending: false,
            confirmCompletion: () => {
                const state = get();
                if (!state.isActive || state.completedAt || !hasCompleteKhatm(state.validatedPages)) return false;
                set({completedAt: new Date().toISOString(), completionCount: state.completionCount + 1, celebrationPending: true});
                return true;
            },
            dismissCelebration: () => set({celebrationPending: false}),
            isActive: false,
            startDate: '',
            endDate: '',
            validatedPages: [],
            autoExcludedPages: [],
            lastKhatmSurah: 1,
            lastKhatmAyah: 1,
            lastKhatmPage: 1,

            activate: (start, end) => set({
                isActive: true,
                completedAt: null,
                celebrationPending: false,
                startDate: start,
                endDate: end,
                validatedPages: [],
                autoExcludedPages: [],
                lastKhatmSurah: 1,
                lastKhatmAyah: 1,
                lastKhatmPage: 1,
                dailyReadCount: 0,
                lastActiveDate: todayStr(),
            }),

            updateLastRead: (surah, ayah, page) => {
                const { lastKhatmPage, lastKhatmSurah, lastKhatmAyah, isActive } = get();
                if (!isActive) return;

                // Called only after foreground consultation, never on navigation alone.
                if (!Number.isInteger(page) || page < 1 || page > 604 || get().completedAt) return;
                const isForward =
                    page > lastKhatmPage ||
                    (page === lastKhatmPage && (
                        surah > lastKhatmSurah ||
                        (surah === lastKhatmSurah && ayah > lastKhatmAyah)
                    ));

                if (isForward) {
                    console.log(`[Khatm] ✓ S${lastKhatmSurah}:A${lastKhatmAyah}(P${lastKhatmPage}) → S${surah}:A${ayah}(P${page})`);
                    set({ lastKhatmSurah: surah, lastKhatmAyah: ayah, lastKhatmPage: page });
                }
            },

            deactivate: () => set({ isActive: false }),

            validatePage: (page) => {
                const state = get();
                if (!state.isActive || state.completedAt || !Number.isInteger(page) || page < 1 || page > 604 || (state.validatedPages.includes(page) || state.autoExcludedPages.includes(page))) return;
                const today = todayStr();
                set({validatedPages:[...state.validatedPages,page].sort((a,b)=>a-b),dailyReadCount:(state.lastActiveDate === today ? state.dailyReadCount || 0 : 0)+1,lastActiveDate:today});
            },

            togglePage: (page) => set((state) => {
                if (!Number.isInteger(page) || page < 1 || page > 604 || state.completedAt) return state;
                const today = todayStr();
                let dailyReadCount = state.dailyReadCount || 0;
                let lastActiveDate = state.lastActiveDate || today;

                // Reset counter if it's a new day
                if (lastActiveDate !== today) {
                    dailyReadCount = 0;
                    lastActiveDate = today;
                }

                const excluded = new Set(state.autoExcludedPages);
                const pages = [...state.validatedPages];
                const idx = pages.indexOf(page);
                if (idx >= 0) {
                    excluded.add(page);
                    pages.splice(idx, 1);
                    dailyReadCount = Math.max(0, dailyReadCount - 1);
                } else {
                    excluded.delete(page);
                    pages.push(page);
                    pages.sort((a, b) => a - b);
                    dailyReadCount += 1;
                }
                return { validatedPages: pages, autoExcludedPages:[...excluded], dailyReadCount, lastActiveDate };
            }),

            reset: () => set({ autoExcludedPages: [], completedAt: null, celebrationPending: false, validatedPages: [], isActive: false, startDate: '', endDate: '', lastKhatmSurah: 1, lastKhatmAyah: 1, lastKhatmPage: 1, dailyReadCount: 0, lastActiveDate: '' }),

            isPageValidated: (page) => get().validatedPages.includes(page),

            getOverallProgress: () => {
                const read = new Set(get().validatedPages.filter(p => Number.isInteger(p) && p >= 1 && p <= 604)).size;
                return {read, total:604, pct:read === 604 ? 100 : Math.round(read / 604 * 1000) / 10};
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

            getDailyGoal: () => Math.ceil((604 - get().getOverallProgress().read) / get().getDaysRemaining()),

            getTodayRange: () => {
                const totalDays = get().getTotalDays();
                const dayNum = get().getDayNumber();
                const pagesPerDay = Math.ceil(604 / totalDays);

                const start = (dayNum - 1) * pagesPerDay + 1;
                const end = Math.min(dayNum * pagesPerDay, 604);
                return { start: Math.min(start, 604), end };
            },

            getTodayRead: () => {
                const state = get();
                const today = todayStr();
                if (state.lastActiveDate !== today) {
                    return 0;
                }
                return state.dailyReadCount || 0;
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
                const validated = new Set(get().validatedPages);
                // Return the first unvalidated page (1-604)
                for (let p = 1; p <= 604; p++) {
                    if (!validated.has(p)) return p;
                }
                return 604; // All done
            },
        }),
        {
            name: 'quran-coach-khatm',
        }
    )
);
