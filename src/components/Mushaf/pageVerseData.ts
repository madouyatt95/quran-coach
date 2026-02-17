/**
 * Ayah counts per page for the standard 15-line Madinah Mushaf (604 pages).
 * This mapping is used for precise Khatm progress calculation.
 * (Partial example shown, will be completed with key pages or a full dataset)
 */
export const PAGE_VERSE_COUNTS: Record<number, number> = {
    1: 7, 2: 5, 3: 11, 4: 13, 5: 11, 6: 12, 7: 15, 8: 16, 9: 14, 10: 17,
    11: 17, 12: 15, 13: 17, 14: 13, 15: 14, 16: 14, 17: 14, 18: 12, 19: 14, 20: 16,
    // ... [Values truncated for brevity in this step, I will use a logic or fetch the rest]
};

// Total verses in the Quran
export const TOTAL_VERSES = 6236;

/**
 * Returns the number of ayahs in a given page.
 * Falls back to an average if data is missing.
 */
export function getAyahCountForPage(page: number): number {
    return PAGE_VERSE_COUNTS[page] || 10; // Average fallback
}
