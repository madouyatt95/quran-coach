export function getHijriDate(date: Date = new Date()) {
    // We use the Umm al-Qura calendar which is the standard in Saudi Arabia and widely used in Europe/France
    // It offers much better precision than the mathematical Kuwaiti algorithm
    const format = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    const parts = format.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const month = parts.find(p => p.type === 'month')?.value || '1';
    const year = parts.find(p => p.type === 'year')?.value || '1445';

    return {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        // Some browsers append " AH" to the year, so we split and take the number
        year: parseInt(year.split(' ')[0], 10)
    };
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
