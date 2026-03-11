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
    private voiceConfirmMs = 3500;   // Must be above threshold for 3.5s (filters Takbirs)
    private silenceConfirmMs = 4000; // Must be below threshold for 4s (ensures real pause)

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
     * Listen for a few seconds and return the raw Arabic transcript.
     * Does NOT confirm against any specific verse — just captures what the mic hears.
     */
    listen(timeoutMs: number = 6000): Promise<string> {
        return new Promise((resolve) => {
            const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognitionClass) {
                resolve('');
                return;
            }

            this.recognition = new SpeechRecognitionClass();
            this.recognition.lang = 'ar-SA';
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 3;

            let allTranscripts: string[] = [];

            const timeout = setTimeout(() => {
                try { this.recognition?.stop(); } catch { }
            }, timeoutMs);

            this.recognition.onresult = (event: any) => {
                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal || result[0]) {
                        // Collect all alternatives for better matching
                        for (let j = 0; j < result.length; j++) {
                            if (result[j].transcript) {
                                allTranscripts.push(result[j].transcript);
                            }
                        }
                    }
                }
            };

            this.recognition.onend = () => {
                clearTimeout(timeout);
                const combined = allTranscripts.join(' ');
                console.log('[VerseConfirmer] Heard:', combined);
                resolve(combined);
            };

            this.recognition.onerror = (e: any) => {
                console.warn('[VerseConfirmer] Error:', e.error);
                clearTimeout(timeout);
                resolve(allTranscripts.join(' '));
            };

            try {
                this.recognition.start();
            } catch {
                clearTimeout(timeout);
                resolve('');
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




// --- Find verse in plan by comparing transcript ---

export interface VerseMatch {
    pairIndex: number;   // 0-based index of the pair
    verseIndex: number;  // 0-based index of the verse within the pair
    verse: TarawihVerse;
    score: number;       // 0-1 match score
}

/**
 * Search all verses in a night plan to find which one best matches
 * the given transcript. Returns the best match or null.
 */
export function findVerseInPlan(
    plan: TarawihNightPlan,
    transcript: string
): VerseMatch | null {
    if (!transcript || transcript.trim().length === 0) return null;

    const normTranscript = normalizeArabic(transcript);
    const transcriptWords = normTranscript.split(' ').filter(w => w.length > 1);
    if (transcriptWords.length === 0) return null;

    let bestMatch: VerseMatch | null = null;
    let bestScore = 0;

    for (let pi = 0; pi < plan.pairs.length; pi++) {
        const pair = plan.pairs[pi];
        for (let vi = 0; vi < pair.verses.length; vi++) {
            const verse = pair.verses[vi];
            const normVerse = normalizeArabic(verse.textArabic);
            const verseWords = normVerse.split(' ').filter(w => w.length > 1);
            if (verseWords.length === 0) continue;

            // Score: how many transcript words appear in the verse text
            let matchCount = 0;
            for (const tw of transcriptWords) {
                // Check if any verse word is similar
                for (const vw of verseWords) {
                    if (tw === vw) {
                        matchCount++;
                        break;
                    }
                    // Fuzzy: starts-with or contained
                    if (tw.length >= 3 && (vw.startsWith(tw) || tw.startsWith(vw))) {
                        matchCount += 0.7;
                        break;
                    }
                }
            }

            // Also check if transcript is a substring of the verse
            if (normVerse.includes(normTranscript)) {
                matchCount = transcriptWords.length; // perfect substring match
            }

            const score = matchCount / transcriptWords.length;

            if (score > bestScore && score >= 0.3) {
                bestScore = score;
                bestMatch = { pairIndex: pi, verseIndex: vi, verse, score };
            }
        }
    }

    console.log('[Tarawih] Best verse match:', bestMatch ? 
        `${bestMatch.verse.surah}:${bestMatch.verse.ayah} (score: ${bestMatch.score.toFixed(2)})` : 
        'none');

    return bestMatch;
}


// Singleton instances
export const voiceActivityDetector = new VoiceActivityDetector();
export const verseConfirmer = new VerseConfirmer();
