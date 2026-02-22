/**
 * DeepSpeechService — Asynchronous Whisper-based transcription via HuggingFace.
 * 
 * This service is completely independent of speechRecognition.ts (the real-time Web Speech API).
 * It sends recorded audio blobs to the user's HuggingFace Space running Tarteel Whisper,
 * receives Arabic transcriptions, and produces word-level diffs with Makharij analysis.
 */

import { Client } from '@gradio/client';

// --- Configuration ---
// The user's HuggingFace Space URL. Update this if the space name changes.
const HF_SPACE_URL = 'madouyatt95/quran-asr';

// --- Types ---

export interface MakharijAlert {
    /** The letter the user said */
    spoken: string;
    /** The letter that was expected */
    expected: string;
    /** Number of times this confusion occurred */
    count: number;
    /** Correction tip */
    tip: string;
}

export type WordDiffState = 'correct' | 'missing' | 'wrong';

export interface WordDiff {
    expected: string;
    spoken: string | null;
    state: WordDiffState;
}

export interface ExamResult {
    /** Overall accuracy 0-100 */
    accuracy: number;
    /** Per-word diff */
    words: WordDiff[];
    /** Letter confusion alerts */
    makharijAlerts: MakharijAlert[];
    /** Raw transcription from Whisper */
    rawTranscription: string;
    /** Total expected words */
    totalExpected: number;
    /** Total correct words */
    totalCorrect: number;
}

// --- Makharij Confusion Database ---
const MAKHARIJ_PAIRS: Array<{ a: string; b: string; tip: string }> = [
    { a: 'ذ', b: 'ز', tip: 'Sortez le bout de la langue entre les dents pour le ذ (Dhal).' },
    { a: 'ث', b: 'س', tip: 'Sortez le bout de la langue entre les dents pour le ث (Tha).' },
    { a: 'ظ', b: 'ض', tip: 'Le ظ (Dha) sort entre les dents. Le ض (Dad) se prononce du côté de la langue.' },
    { a: 'ح', b: 'خ', tip: 'Le ح (Ha) vient du fond de la gorge sans friction. Le خ (Kha) a une friction gutturale.' },
    { a: 'ع', b: 'أ', tip: 'Le ع (Ayn) vient du milieu de la gorge. Ne le remplacez pas par un Hamza.' },
    { a: 'ق', b: 'ك', tip: 'Le ق (Qaf) se prononce du fond du palais. Le ك (Kaf) est plus antérieur.' },
    { a: 'ط', b: 'ت', tip: 'Le ط (Ta emphatique) est plus lourd et appuyé que le ت (Ta léger).' },
    { a: 'ص', b: 'س', tip: 'Le ص (Sad) est emphatique et lourd. Le س (Sin) est léger.' },
    { a: 'هـ', b: 'ح', tip: 'Le هـ (Ha) est plus léger et sort du bas de la gorge, pas comme le ح.' },
];

// --- Arabic Normalization ---
function normalizeArabic(text: string): string {
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '')   // Remove tashkeel
        .replace(/[أإآٱ]/g, 'ا')                  // Normalize Alif variants
        .replace(/[ؤ]/g, 'و')                     // Normalize Waw Hamza
        .replace(/[ئء]/g, 'ي')                    // Normalize Ya Hamza
        .replace(/ـ/g, '')                         // Remove tatweel
        .replace(/[ىي]/g, 'ي')                    // Normalize Ya
        .replace(/ة/g, 'ه')                        // Ta marbuta → Ha
        .replace(/[.,!?;:()«»]/g, '')             // Remove punctuation
        .replace(/\s+/g, ' ')
        .trim();
}

function splitWords(text: string): string[] {
    return text.split(/\s+/).filter(w => w.length > 0);
}

// --- Levenshtein for fuzzy matching ---
function levenshtein(s1: string, s2: string): number {
    const m = s1.length, n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = s1[i - 1] === s2[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

function similarity(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
}

// --- Core API ---

/**
 * Send audio to HuggingFace Space and get Arabic transcription back.
 * The blob is released from memory after the call.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
        const client = await Client.connect(HF_SPACE_URL);

        // Convert Blob to File for Gradio
        const audioFile = new File([audioBlob], 'recording.wav', { type: audioBlob.type });

        const result = await client.predict('/predict', {
            audio_file: audioFile,
        });

        // The result.data is the transcription string
        const transcription = (result.data as string[])[0] || '';
        return transcription;
    } catch (error) {
        console.error('[DeepSpeech] Transcription failed:', error);
        throw new Error(`Échec de la transcription IA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
}

/**
 * Compare the Whisper transcription with the expected Quran text.
 * Produces a word-level diff and detects Makharij confusions.
 */
export function compareWithExpected(transcribed: string, expectedText: string): ExamResult {
    const expectedWords = splitWords(expectedText);
    const spokenWords = splitWords(transcribed);

    const nExpected = normalizeArabic(expectedText);
    const nSpoken = normalizeArabic(transcribed);
    const expectedNorm = splitWords(nExpected);
    const spokenNorm = splitWords(nSpoken);

    // LCS-based alignment for best word matching
    const wordDiffs: WordDiff[] = [];
    let si = 0; // spoken index
    let totalCorrect = 0;

    // Letter confusion tracker
    const confusions = new Map<string, { spoken: string; expected: string; count: number }>();

    for (let ei = 0; ei < expectedWords.length; ei++) {
        const eNorm = expectedNorm[ei] || normalizeArabic(expectedWords[ei]);

        // Look ahead in spoken words for a match (sliding window of 3)
        let bestMatch = -1;
        let bestSim = 0;
        const windowEnd = Math.min(si + 4, spokenNorm.length);

        for (let j = si; j < windowEnd; j++) {
            const sim = similarity(eNorm, spokenNorm[j]);
            if (sim > bestSim) {
                bestSim = sim;
                bestMatch = j;
            }
        }

        const threshold = eNorm.length <= 3 ? 0.5 : eNorm.length <= 6 ? 0.65 : 0.75;

        if (bestSim >= threshold && bestMatch >= 0) {
            // Mark skipped spoken words (extras the user added)
            // We just skip them, they don't count against the expected

            const isExactMatch = bestSim >= 0.9;
            wordDiffs.push({
                expected: expectedWords[ei],
                spoken: spokenWords[bestMatch] || null,
                state: isExactMatch ? 'correct' : 'wrong',
            });

            if (isExactMatch) {
                totalCorrect++;
            } else {
                // Detect letter-level confusions for Makharij
                detectLetterConfusions(eNorm, spokenNorm[bestMatch], confusions);
            }

            si = bestMatch + 1;
        } else {
            // Word was missed entirely
            wordDiffs.push({
                expected: expectedWords[ei],
                spoken: null,
                state: 'missing',
            });
        }
    }

    // Build Makharij alerts from confusions
    const makharijAlerts: MakharijAlert[] = [];
    confusions.forEach((conf) => {
        const pair = MAKHARIJ_PAIRS.find(
            p => (p.a === conf.expected && p.b === conf.spoken) || (p.b === conf.expected && p.a === conf.spoken)
        );
        if (pair) {
            makharijAlerts.push({
                spoken: conf.spoken,
                expected: conf.expected,
                count: conf.count,
                tip: pair.tip,
            });
        }
    });

    const accuracy = expectedWords.length > 0
        ? Math.round((totalCorrect / expectedWords.length) * 100)
        : 0;

    return {
        accuracy,
        words: wordDiffs,
        makharijAlerts,
        rawTranscription: transcribed,
        totalExpected: expectedWords.length,
        totalCorrect,
    };
}

/**
 * Detect individual letter-level confusions between two normalized Arabic words.
 */
function detectLetterConfusions(
    expected: string,
    spoken: string,
    confusions: Map<string, { spoken: string; expected: string; count: number }>
): void {
    const minLen = Math.min(expected.length, spoken.length);
    for (let i = 0; i < minLen; i++) {
        if (expected[i] !== spoken[i]) {
            // Check if this is a known Makharij pair
            const isPair = MAKHARIJ_PAIRS.some(
                p => (p.a === expected[i] && p.b === spoken[i]) || (p.b === expected[i] && p.a === spoken[i])
            );
            if (isPair) {
                const key = `${expected[i]}-${spoken[i]}`;
                const existing = confusions.get(key);
                if (existing) {
                    existing.count++;
                } else {
                    confusions.set(key, { spoken: spoken[i], expected: expected[i], count: 1 });
                }
            }
        }
    }
}
