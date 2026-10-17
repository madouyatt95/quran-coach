import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localDay } from '../lib/learning';
import { regularityStreak } from '../lib/regularity';

interface StatsState {
    // Reading stats
    readingStreak: number;
    lastReadDate: string | null;
    totalPagesRead: number;
    totalMinutesSpent: number;

    // Daily goal
    dailyGoalPages: number;
    todayPagesRead: number;

    // Session tracking
    sessionStartTime: number | null;

    // Activity history for calendar (date -> pages read)
    activityHistory: Record<string, number>;

    activeDays: Record<string, boolean>;
    countedPages: Record<string, number[]>;
    recordActivity: (at?: number) => void;
    recordQualifiedPage: (page: number, at?: number) => void;
    restoreActivityDays: (dates: string[]) => void;

    // Actions
    startSession: () => void;
    endSession: () => void;
    recordPageRead: () => void;
    setDailyGoal: (pages: number) => void;
    checkAndUpdateStreak: () => void;
}

const getTodayDate = () => localDay();

export const useStatsStore = create<StatsState>()(
    persist(
        (set, get) => ({
            activeDays: {}, countedPages: {},
            recordActivity: (at = Date.now()) => {
                const day = localDay(new Date(at));
                if (day > localDay() || !Number.isFinite(at)) return;
                set(s => s.activeDays[day] ? s : ({ activeDays: {...s.activeDays, [day]: true} }));
                get().checkAndUpdateStreak();
            },
            restoreActivityDays: dates => {
                set(s => ({ activeDays: {...s.activeDays, ...Object.fromEntries(dates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= localDay()).map(d => [d, true]))} }));
                get().checkAndUpdateStreak();
            },
            recordQualifiedPage: (page, at = Date.now()) => {
                if (!Number.isInteger(page) || page < 1 || page > 604) return;
                const day = localDay(new Date(at));
                if (day !== localDay() || get().countedPages[day]?.includes(page)) return;
                set(s => ({ countedPages: {[day]: [...(s.countedPages[day] || []), page]} }));
                get().recordPageRead();
            },
            // Initial state
            readingStreak: 0,
            lastReadDate: null,
            totalPagesRead: 0,
            totalMinutesSpent: 0,
            dailyGoalPages: 2,
            todayPagesRead: 0,
            sessionStartTime: null,
            activityHistory: {},

            startSession: () => {
                set({ sessionStartTime: Date.now() });
            },

            endSession: () => {
                const { sessionStartTime, totalMinutesSpent } = get();
                if (sessionStartTime) {
                    const sessionMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
                    set({
                        totalMinutesSpent: totalMinutesSpent + sessionMinutes,
                        sessionStartTime: null,
                    });
                }
            },

            recordPageRead: () => {
                const { totalPagesRead, todayPagesRead, lastReadDate, activityHistory } = get();
                const today = getTodayDate();

                // Reset today's count if it's a new day
                const newTodayPages = lastReadDate === today ? todayPagesRead + 1 : 1;

                // Update activity history
                const newHistory = {
                    ...activityHistory,
                    [today]: (activityHistory[today] || 0) + 1,
                };

                set({
                    totalPagesRead: totalPagesRead + 1,
                    todayPagesRead: newTodayPages,
                    lastReadDate: today,
                    activityHistory: newHistory,
                });

                get().recordActivity();
            },

            setDailyGoal: (dailyGoalPages) => set({ dailyGoalPages }),

            checkAndUpdateStreak: () => {
                const state = get(), today = getTodayDate();
                const days = new Set([...Object.keys(state.activeDays), ...Object.entries(state.activityHistory).filter(([,n]) => n > 0).map(([day]) => day)]);
                const streak = regularityStreak(days);
                const pages = state.activityHistory[today] || 0;
                if (streak !== state.readingStreak || pages !== state.todayPagesRead) set({ readingStreak: streak, todayPagesRead: pages });
            },
        }),
        {
            name: 'quran-coach-stats',
            partialize: (state) => ({
                activeDays: state.activeDays,
                countedPages: state.countedPages,
                readingStreak: state.readingStreak,
                lastReadDate: state.lastReadDate,
                totalPagesRead: state.totalPagesRead,
                totalMinutesSpent: state.totalMinutesSpent,
                dailyGoalPages: state.dailyGoalPages,
                todayPagesRead: state.todayPagesRead,
                activityHistory: state.activityHistory,
            }),
        }
    )
);
