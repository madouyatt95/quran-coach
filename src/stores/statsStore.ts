import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

    // Actions
    startSession: () => void;
    endSession: () => void;
    recordPageRead: () => void;
    setDailyGoal: (pages: number) => void;
    checkAndUpdateStreak: () => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useStatsStore = create<StatsState>()(
    persist(
        (set, get) => ({
            // Initial state
            readingStreak: 0,
            lastReadDate: null,
            totalPagesRead: 0,
            totalMinutesSpent: 0,
            dailyGoalPages: 2,
            todayPagesRead: 0,
            sessionStartTime: null,

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
                const { totalPagesRead, todayPagesRead, lastReadDate } = get();
                const today = getTodayDate();

                // Reset today's count if it's a new day
                const newTodayPages = lastReadDate === today ? todayPagesRead + 1 : 1;

                set({
                    totalPagesRead: totalPagesRead + 1,
                    todayPagesRead: newTodayPages,
                    lastReadDate: today,
                });

                // Update streak
                get().checkAndUpdateStreak();
            },

            setDailyGoal: (dailyGoalPages) => set({ dailyGoalPages }),

            checkAndUpdateStreak: () => {
                const { lastReadDate, readingStreak, todayPagesRead, dailyGoalPages } = get();
                const today = getTodayDate();
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                if (lastReadDate === today && todayPagesRead >= dailyGoalPages) {
                    // Goal met today - ensure streak is counting
                    if (readingStreak === 0) {
                        set({ readingStreak: 1 });
                    }
                } else if (lastReadDate === yesterday) {
                    // Read yesterday, streak continues
                    // Will be incremented when goal is met today
                } else if (lastReadDate !== today && lastReadDate !== yesterday) {
                    // Streak broken
                    set({ readingStreak: 0, todayPagesRead: 0 });
                }
            },
        }),
        {
            name: 'quran-coach-stats',
            partialize: (state) => ({
                readingStreak: state.readingStreak,
                lastReadDate: state.lastReadDate,
                totalPagesRead: state.totalPagesRead,
                totalMinutesSpent: state.totalMinutesSpent,
                dailyGoalPages: state.dailyGoalPages,
                todayPagesRead: state.todayPagesRead,
            }),
        }
    )
);
