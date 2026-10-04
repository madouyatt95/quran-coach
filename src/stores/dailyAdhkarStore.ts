import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export function localAdhkarDay() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
export const useDailyAdhkarStore = create<{
    day: string; counts: Record<string, number>;
    increment: (key: string, max: number) => number;
}>()(persist((set, get) => ({
    day: localAdhkarDay(), counts: {},
    increment: (key, max) => {
        const day = localAdhkarDay();
        const counts = get().day === day ? get().counts : {};
        const count = Math.min(max, (counts[key] || 0) + 1);
        set({day,counts:{...counts,[key]:count}});
        return count;
    },
}), {name:'quran-coach-daily-adhkar'}));
