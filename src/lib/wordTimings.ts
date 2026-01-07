// Service for word-by-word audio synchronization
// Uses Quran.com API for word timing data

export interface WordTiming {
    id: number;
    position: number;
    text: string;
    audioUrl?: string;
    timestampFrom: number;
    timestampTo: number;
}

export interface VerseWords {
    verseKey: string;
    words: WordTiming[];
}

// Cache for word timings
const wordTimingsCache = new Map<string, VerseWords>();

// Fetch word timings for a verse
export async function fetchWordTimings(surah: number, ayah: number): Promise<VerseWords | null> {
    const verseKey = `${surah}:${ayah}`;

    // Check cache first
    if (wordTimingsCache.has(verseKey)) {
        return wordTimingsCache.get(verseKey)!;
    }

    try {
        const response = await fetch(
            `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,audio_url`
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const verse = data.verse;

        if (!verse || !verse.words) {
            return null;
        }

        const result: VerseWords = {
            verseKey,
            words: verse.words.map((w: {
                id: number;
                position: number;
                text_uthmani: string;
                audio_url?: string;
                timing?: { timestamp_from: number; timestamp_to: number };
            }) => ({
                id: w.id,
                position: w.position,
                text: w.text_uthmani,
                audioUrl: w.audio_url,
                timestampFrom: w.timing?.timestamp_from || 0,
                timestampTo: w.timing?.timestamp_to || 0,
            })),
        };

        wordTimingsCache.set(verseKey, result);
        return result;
    } catch (error) {
        console.error('Error fetching word timings:', error);
        return null;
    }
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
