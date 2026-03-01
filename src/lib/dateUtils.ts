export function getHijriDate(date: Date = new Date()) {
    // Julian Day Number calculation
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    let jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
        + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
        - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
        + d - 32075;

    // Islamic calendar epoch
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const lRem = l - 10631 * n + 354;
    const j = Math.floor((10985 - lRem) / 5316) * Math.floor((50 * lRem) / 17719)
        + Math.floor(lRem / 5670) * Math.floor((43 * lRem) / 15238);
    const lFinal = lRem - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
        - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

    const hijriMonth = Math.floor((24 * lFinal) / 709);
    const hijriDay = lFinal - Math.floor((709 * hijriMonth) / 24);
    const hijriYear = 30 * n + j - 30;

    return { day: hijriDay, month: hijriMonth, year: hijriYear };
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
