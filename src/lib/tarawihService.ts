/**
 * Tarawih Live Service
 * 
 * 3 responsibilities:
 * 1. Hizb Calculator — Maps night (1-30) → verse range, splits into pairs of raka'at
 * 2. Voice Activity Detector (VAD) — Monitors mic volume to detect imam's recitation vs silence
 * 3. Verse Confirmation — Brief (5s) speech recognition to confirm the starting verse
 */

import { getJuzForNight, type JuzInfo } from '../data/juzData';
import { fetchSurah, fetchSurahTranslation } from './quranApi';

// --- Types ---

export interface TarawihVerse {
    surah: number;
    surahName: string;
    ayah: number;
    textArabic: string;
    textFrench: string;
}

export interface TarawihPair {
    pairNumber: number; // 1-4
    verses: TarawihVerse[];
}

export interface TarawihNightPlan {
    night: number;
    juz: JuzInfo;
    pairs: TarawihPair[];
    totalVerses: number;
}

// --- Surah metadata (verse counts) ---
const SURAH_VERSE_COUNTS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110,
    98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182,
    88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29,
    22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50,
    40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8,
    8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

// --- Hizb Calculator ---

/**
 * Build the complete verse list for a given juz (night).
 * Returns all surahs/ayahs in order.
 */
export async function buildNightPlan(
    night: number,
    numberOfPairs: number = 4,
    onProgress?: (msg: string) => void
): Promise<TarawihNightPlan | null> {
    const juz = getJuzForNight(night);
    if (!juz) return null;

    onProgress?.(`Chargement du Juz ${juz.number}...`);

    // Collect all surah numbers that span this juz
    const surahNumbers: number[] = [];
    for (let s = juz.startSurah; s <= juz.endSurah; s++) {
        surahNumbers.push(s);
    }

    // Fetch all verses + translations
    const allVerses: TarawihVerse[] = [];

    for (const surahNum of surahNumbers) {
        onProgress?.(`Chargement sourate ${surahNum}...`);

        const [surahData, translations] = await Promise.all([
            fetchSurah(surahNum),
            fetchSurahTranslation(surahNum, 'fr'),
        ]);

        const startAyah = surahNum === juz.startSurah ? juz.startAyah : 1;
        const endAyah = surahNum === juz.endSurah
            ? juz.endAyah
            : SURAH_VERSE_COUNTS[surahNum - 1] || surahData.ayahs.length;

        for (const ayah of surahData.ayahs) {
            if (ayah.numberInSurah >= startAyah && ayah.numberInSurah <= endAyah) {
                allVerses.push({
                    surah: surahNum,
                    surahName: surahData.surah.englishName,
                    ayah: ayah.numberInSurah,
                    textArabic: ayah.text,
                    textFrench: translations.get(ayah.number) || '',
                });
            }
        }
    }

    // Split into pairs (4 pairs by default = 8 raka'at)
    const versesPerPair = Math.ceil(allVerses.length / numberOfPairs);
    const pairs: TarawihPair[] = [];

    for (let i = 0; i < numberOfPairs; i++) {
        const start = i * versesPerPair;
        const end = Math.min(start + versesPerPair, allVerses.length);
        pairs.push({
            pairNumber: i + 1,
            verses: allVerses.slice(start, end),
        });
    }

    onProgress?.('Prêt !');

    return {
        night,
        juz,
        pairs,
        totalVerses: allVerses.length,
    };
}


// --- Voice Activity Detector (VAD) ---

export class VoiceActivityDetector {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaStream: MediaStream | null = null;
    private animFrameId: number | null = null;
    private isRunning = false;

    // Callbacks
    private onVoiceDetected: (() => void) | null = null;
    private onSilenceDetected: (() => void) | null = null;
    private onVolumeUpdate: ((volume: number) => void) | null = null;

    // Config
    private voiceThreshold = 15;     // Volume above this = voice
    private silenceThreshold = 8;    // Volume below this = silence
    private voiceConfirmMs = 2000;   // Must be above threshold for 2s
    private silenceConfirmMs = 3000; // Must be below threshold for 3s

    // State
    private voiceStartTime = 0;
    private silenceStartTime = 0;
    private currentState: 'silent' | 'voice' = 'silent';

    async start(callbacks: {
        onVoiceDetected: () => void;
        onSilenceDetected: () => void;
        onVolumeUpdate?: (volume: number) => void;
    }): Promise<boolean> {
        this.onVoiceDetected = callbacks.onVoiceDetected;
        this.onSilenceDetected = callbacks.onSilenceDetected;
        this.onVolumeUpdate = callbacks.onVolumeUpdate || null;

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);

            this.isRunning = true;
            this.currentState = 'silent';
            this.monitorLoop();
            return true;
        } catch (e) {
            console.error('[VAD] Failed to start:', e);
            return false;
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
            this.audioContext = null;
        }
        this.analyser = null;
    }

    private monitorLoop = () => {
        if (!this.isRunning || !this.analyser) return;

        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        const avgVolume = sum / data.length;
        this.onVolumeUpdate?.(avgVolume);

        const now = Date.now();

        if (this.currentState === 'silent') {
            if (avgVolume > this.voiceThreshold) {
                if (this.voiceStartTime === 0) {
                    this.voiceStartTime = now;
                } else if (now - this.voiceStartTime >= this.voiceConfirmMs) {
                    this.currentState = 'voice';
                    this.voiceStartTime = 0;
                    this.silenceStartTime = 0;
                    this.onVoiceDetected?.();
                }
            } else {
                this.voiceStartTime = 0;
            }
        } else {
            // Currently in 'voice' state
            if (avgVolume < this.silenceThreshold) {
                if (this.silenceStartTime === 0) {
                    this.silenceStartTime = now;
                } else if (now - this.silenceStartTime >= this.silenceConfirmMs) {
                    this.currentState = 'silent';
                    this.silenceStartTime = 0;
                    this.voiceStartTime = 0;
                    this.onSilenceDetected?.();
                }
            } else {
                this.silenceStartTime = 0;
            }
        }

        this.animFrameId = requestAnimationFrame(this.monitorLoop);
    };

    getState() {
        return this.currentState;
    }
}


// --- Verse Confirmation via Web Speech API (burst mode) ---

export class VerseConfirmer {
    private recognition: any = null;

    /**
     * Listen for ~5 seconds and return the best transcript.
     * Used to confirm the imam is at the expected verse.
     */
    confirm(expectedArabicText: string, timeoutMs: number = 6000): Promise<{
        confirmed: boolean;
        transcript: string;
        confidence: number;
    }> {
        return new Promise((resolve) => {
            const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognitionClass) {
                // No Speech API available — auto-confirm
                resolve({ confirmed: true, transcript: '', confidence: 0 });
                return;
            }

            this.recognition = new SpeechRecognitionClass();
            this.recognition.lang = 'ar-SA';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            let bestTranscript = '';

            const timeout = setTimeout(() => {
                try { this.recognition?.stop(); } catch { }
                // If we got no transcript at all, auto-confirm (mic might not work)
                resolve({
                    confirmed: bestTranscript.length === 0 ? true : matchesVerse(bestTranscript, expectedArabicText),
                    transcript: bestTranscript,
                    confidence: bestTranscript.length === 0 ? 0 : 1,
                });
            }, timeoutMs);

            this.recognition.onresult = (event: any) => {
                const result = event.results[0];
                if (result) {
                    bestTranscript = result[0].transcript;
                }
            };

            this.recognition.onend = () => {
                clearTimeout(timeout);
                resolve({
                    confirmed: bestTranscript.length === 0 ? true : matchesVerse(bestTranscript, expectedArabicText),
                    transcript: bestTranscript,
                    confidence: bestTranscript.length === 0 ? 0 : 1,
                });
            };

            this.recognition.onerror = () => {
                clearTimeout(timeout);
                // On error, auto-confirm to not block the user
                resolve({ confirmed: true, transcript: '', confidence: 0 });
            };

            try {
                this.recognition.start();
            } catch {
                clearTimeout(timeout);
                resolve({ confirmed: true, transcript: '', confidence: 0 });
            }
        });
    }

    stop() {
        try { this.recognition?.stop(); } catch { }
    }
}


// --- Arabic Fuzzy Matching ---

function normalizeArabic(text: string): string {
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئء]/g, 'ي')
        .replace(/ـ/g, '')
        .replace(/[ىي]/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[.,!?;:()«»]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function matchesVerse(transcript: string, expectedText: string): boolean {
    const norm1 = normalizeArabic(transcript);
    const norm2 = normalizeArabic(expectedText);

    // Check if the first few words match
    const words1 = norm1.split(' ').filter(w => w.length > 0).slice(0, 4);
    const words2 = norm2.split(' ').filter(w => w.length > 0).slice(0, 4);

    if (words1.length === 0 || words2.length === 0) return false;

    let matches = 0;
    for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
        if (words1[i] === words2[i]) {
            matches++;
        } else {
            // Fuzzy: check if words are similar (Levenshtein)
            const maxLen = Math.max(words1[i].length, words2[i].length);
            let dist = 0;
            const s1 = words1[i], s2 = words2[i];
            const m = s1.length, n = s2.length;
            const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            for (let a = 0; a <= m; a++) dp[a][0] = a;
            for (let b = 0; b <= n; b++) dp[0][b] = b;
            for (let a = 1; a <= m; a++) {
                for (let b = 1; b <= n; b++) {
                    dp[a][b] = s1[a - 1] === s2[b - 1]
                        ? dp[a - 1][b - 1]
                        : 1 + Math.min(dp[a - 1][b], dp[a][b - 1], dp[a - 1][b - 1]);
                }
            }
            dist = dp[m][n];
            if ((1 - dist / maxLen) >= 0.6) matches++;
        }
    }

    // At least half the words should match
    return matches >= Math.ceil(Math.min(words1.length, words2.length) / 2);
}

// Singleton instances
export const voiceActivityDetector = new VoiceActivityDetector();
export const verseConfirmer = new VerseConfirmer();
