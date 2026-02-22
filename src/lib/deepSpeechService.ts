/**
 * DeepSpeechService — Asynchronous Whisper-based transcription via HuggingFace.
 * 
 * This service is completely independent of speechRecognition.ts (the real-time Web Speech API).
 * It calls the HuggingFace Space's Gradio REST API directly with raw fetch (no @gradio/client).
 * Receives Arabic transcriptions and produces word-level diffs with Makharij analysis.
 */

// --- Configuration ---
const HF_SPACE_URL = 'https://yatta95-quran-whisper-test.hf.space';

// --- Types ---

export interface MakharijAlert {
    spoken: string;
    expected: string;
    count: number;
    tip: string;
}

export type WordDiffState = 'correct' | 'missing' | 'wrong';

export interface WordDiff {
    expected: string;
    spoken: string | null;
    state: WordDiffState;
}

export interface ExamResult {
    accuracy: number;
    words: WordDiff[];
    makharijAlerts: MakharijAlert[];
    rawTranscription: string;
    totalExpected: number;
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

// --- WAV Conversion (browser-side) ---
async function blobToWav(blob: Blob): Promise<Blob> {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const numSamples = channelData.length;
    const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(wavBuffer);
    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    for (let i = 0; i < numSamples; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(44 + i * 2, sample * 0x7FFF, true);
    }
    await audioContext.close();
    return new Blob([wavBuffer], { type: 'audio/wav' });
}

// --- Core API (raw fetch to Gradio REST API) ---

/**
 * Upload a file to the HuggingFace Gradio space and call predict.
 * Uses raw fetch instead of @gradio/client (which has browser compatibility issues).
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
        // 1. Convert to WAV
        console.log('[DeepSpeech] Converting audio to WAV...');
        const wavBlob = await blobToWav(audioBlob);
        console.log('[DeepSpeech] WAV ready, size:', wavBlob.size);

        // 2. Upload file to Gradio
        console.log('[DeepSpeech] Uploading to HuggingFace...');
        const formData = new FormData();
        formData.append('files', new File([wavBlob], 'recording.wav', { type: 'audio/wav' }));

        const uploadRes = await fetch(`${HF_SPACE_URL}/gradio_api/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text().catch(() => '');
            throw new Error(`Upload échoué (${uploadRes.status}): ${errText.slice(0, 200)}`);
        }

        const uploadedFiles = await uploadRes.json();
        const filePath = uploadedFiles[0]; // server-side path to the uploaded file
        console.log('[DeepSpeech] File uploaded:', filePath);

        // 3. Call predict with the uploaded file reference
        console.log('[DeepSpeech] Calling predict...');
        const predictRes = await fetch(`${HF_SPACE_URL}/gradio_api/run/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [filePath],
                fn_index: 0,
                session_hash: Math.random().toString(36).slice(2),
            }),
        });

        if (!predictRes.ok) {
            const errText = await predictRes.text().catch(() => '');
            throw new Error(`Predict échoué (${predictRes.status}): ${errText.slice(0, 300)}`);
        }

        const predictResult = await predictRes.json();
        const transcription = predictResult?.data?.[0] || '';
        console.log('[DeepSpeech] Transcription:', transcription);
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
