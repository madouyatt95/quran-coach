/**
 * Utility to get current Hijri date using Intl API (Umm al-Qura)
 */
export function getHijriDate(date: Date = new Date()) {
    try {
        const formatter = new Intl.DateTimeFormat('fr-FR-u-ca-islamic-uma-nu-latn', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });

        const parts = formatter.formatToParts(date);
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
        const year = parseInt(parts.find(p => p.type === 'year')?.value || '1445');

        return { day, month, year };
    } catch (e) {
        console.error('Hijri date formatting failed', e);
        // Basic fallback: 1st of current month (approximate)
        return { day: date.getDate(), month: 1, year: 1447 };
    }
}

/**
 * Check if the current time is in the last third of the night
 * Calculated simply as (Maghrib to Fajr) / 3, then taken from the end.
 */
export function isSaharTime(fajrDate: Date, now: Date = new Date()) {
    // This is an approximation. Real Sahar is the last 1/3 of the night.
    // If we don't have precise night duration, we take 1.5 hours before Fajr as a safe bet for the "Final stretch".
    const saharStart = new Date(fajrDate.getTime() - 90 * 60 * 1000); // 1h30 before Fajr
    return now >= saharStart && now < fajrDate;
}

/**
 * Check if it's currently Friday (Jumu'ah)
 */
export function isFriday(date: Date = new Date()) {
    return date.getDay() === 5;
}

/**
 * Check if we are "Post-Fajr" (Booster zone: Fajr to 1.5h after Sunrise)
 */
export function isFajrBoosterZone(sunriseDate: Date, fajrDate: Date, now: Date = new Date()) {
    const boosterEnd = new Date(sunriseDate.getTime() + 90 * 60 * 1000); // 1h30 after sunrise
    return now >= fajrDate && now < boosterEnd;
}
