function getHijriDate(date = new Date()) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    let jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
        + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
        - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
        + d - 32075;

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

const today = new Date();
// The user's mock time is 2026-03-07
const mockDate = new Date('2026-03-07T12:00:00Z');
console.log('Today (System):', getHijriDate(today));
console.log('2026-03-07 (Mocked):', getHijriDate(mockDate));
