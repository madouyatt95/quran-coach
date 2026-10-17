import { localDay } from './learning';
/** Count local calendar days, including yesterday until today's first activity. */
export function regularityStreak(days: Iterable<string>, now = new Date()): number {
    const active = new Set(days);
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    if (!active.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (active.has(localDay(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
    return count;
}
