// Service for word-by-word audio synchronization
// Uses Quran.com API for word timing data

export interface WordTiming {
    id: number;
    position: number;
    text: string;
    textTajweed?: string;
    audioUrl?: string;
    timestampFrom: number;
    timestampTo: number;
}

export interface VerseWords {
    verseKey: string;
    words: WordTiming[];
}

// Cache for chapter timings (reciterId-chapterNumber -> timestamps)
const chapterTimingsCache = new Map<string, any>();

// Fetch word timings for a verse and a specific reciter
export async function fetchWordTimings(
    surah: number,
    ayah: number,
    reciterId: number = 7
): Promise<VerseWords | null> {
    const verseKey = `${surah}:${ayah}`;
    const chapterCacheKey = `${reciterId}-${surah}`;

    // 1. Fetch verse words if not cached (contains text and positions)
    // We'll use a local cache for verse words to avoid redundant calls
    const verseWordsRes = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,text_uthmani_tajweed`
    );
    if (!verseWordsRes.ok) return null;
    const verseData = await verseWordsRes.json();
    const words = verseData.verse.words;

    // 2. Fetch or get chapter segments for this reciter
    let chapterTimings = chapterTimingsCache.get(chapterCacheKey);
    if (!chapterTimings) {
        try {
            const res = await fetch(
                `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${surah}?segments=true`
            );
            if (res.ok) {
                const data = await res.json();
                chapterTimings = data.audio_file.timestamps;
                chapterTimingsCache.set(chapterCacheKey, chapterTimings);
            }
        } catch (e) {
            console.error("Failed to fetch chapter timings", e);
        }
    }

    // 3. Find segments for this specific ayah
    const ayahTimings = chapterTimings?.find((t: any) => t.verse_key === verseKey);
    const segments = ayahTimings?.segments || [];

    // Get the ayah's start time in the chapter audio to calculate relative offsets
    const ayahStartTime = ayahTimings?.timestamp_from || 0;

    // 4. Map segments to words based on position with RELATIVE timestamps
    // The API returns absolute timestamps in the chapter audio, but we use per-ayah audio
    // So we need to subtract the ayah's start time to get relative timestamps
    const timings: WordTiming[] = words
        .filter((w: any) => w.char_type_name === 'word') // Filter out "end" markers
        .map((w: any, index: number) => {
            // segments format: [[word_position, start_ms, end_ms], ...]
            // Some segments may be incomplete (e.g., [1]) - skip those
            const seg = segments.find((s: any[]) => s.length >= 3 && s[0] === w.position);

            // Calculate relative timestamps (subtract ayah start time)
            const relativeFrom = seg ? Math.max(0, seg[1] - ayahStartTime) : 0;
            const relativeTo = seg ? Math.max(0, seg[2] - ayahStartTime) : 0;

            return {
                id: w.id,
                position: index + 1,
                text: w.text_uthmani,
                textTajweed: w.text_uthmani_tajweed,
                timestampFrom: relativeFrom,
                timestampTo: relativeTo,
            };
        });

    return { verseKey, words: timings };
}

// Fetch word audio for a specific reciter
export async function fetchReciterWordTimings(
    surah: number,
    ayah: number,
    reciterId: number = 7 // Default: Mishari Rashid al-Afasy
): Promise<WordTiming[]> {
    try {
        const response = await fetch(
            `https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${surah}:${ayah}`
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        if (data.audio_files && data.audio_files.length > 0) {
            const audioFile = data.audio_files[0];

            if (audioFile.segments) {
                return audioFile.segments.map((seg: [number, number, number], index: number) => ({
                    id: index,
                    position: index + 1,
                    text: '',
                    timestampFrom: seg[1],
                    timestampTo: seg[2],
                }));
            }
        }

        return [];
    } catch (error) {
        console.error('Error fetching reciter word timings:', error);
        return [];
    }
}

// Calculate which word should be highlighted based on current time
export function getCurrentWordIndex(
    currentTimeMs: number,
    segments: { timestampFrom: number; timestampTo: number }[]
): number {
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (currentTimeMs >= seg.timestampFrom && currentTimeMs <= seg.timestampTo) {
            return i;
        }
    }
    return -1;
}
