// Speech Recognition Service for real-time Quran recitation feedback
// Hybrid: Native Capacitor plugin on iOS, Web Speech API on PWA/browser

import { Capacitor } from '@capacitor/core';

// Arabic normalization helpers - improved for Quran
function normalizeArabic(text: string): string {
    return text
        // Remove tashkeel (diacritics)
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Normalize Alif variants (Madda, Hamza, Wasla)
        .replace(/[أإآٱ]/g, 'ا')
        // Normalize Hamza forms
        .replace(/[ؤ]/g, 'و')
        // Use a broader normalization for hamza on ya/standalone hamza
        .replace(/[ئء]/g, 'ي')
        // Remove tatweel (kashida)
        .replace(/ـ/g, '')
        // Normalize ya/alef maqsura
        .replace(/[ىي]/g, 'ي')
        // Normalize taa marbuta to haa
        .replace(/ة/g, 'ه')
        // Remove punctuation and extra symbols often in transcriptions
        .replace(/[.,!?;:()]/g, '')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim();
}

// Compare two Arabic words with fuzzy matching
function areWordsEqual(word1: string, word2: string): boolean {
    const n1 = normalizeArabic(word1);
    const n2 = normalizeArabic(word2);

    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) {
        // Handle cases where one word includes the other (common in ASR for Arabic)
        if (Math.abs(n1.length - n2.length) <= 1) return true;
    }

    // Levenshtein distance for fuzzy matching
    const distance = levenshteinDistance(n1, n2);
    const maxLen = Math.max(n1.length, n2.length);

    if (maxLen === 0) return true;

    const similarity = 1 - (distance / maxLen);

    // Stricter for long words, more relaxed for short ones
    const threshold = maxLen <= 3 ? 0.5 : maxLen <= 6 ? 0.7 : 0.8;
    return similarity >= threshold;
}

function levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

export type WordState = 'pending' | 'current' | 'correct' | 'error' | 'hidden' | 'revealed';

export interface WordMatch {
    index: number;
    word: string;
    state: WordState;
}

export interface RecognitionCallbacks {
    onWordMatch: (wordIndex: number, isCorrect: boolean, spokenWord?: string) => void;
    onInterimResult: (text: string) => void;
    onCurrentWord: (wordIndex: number) => void;
    onError: (error: string) => void;
    onEnd: () => void;
}

class SpeechRecognitionService {
    private recognition: any = null;
    private isListening = false;
    private expectedWords: string[] = [];
    private currentWordIndex = 0;
    private callbacks: RecognitionCallbacks | null = null;
    private processedWords: Set<number> = new Set();
    private useNative = false;
    private nativeListenerHandle: any = null;

    // Check if speech recognition is supported (native or web)
    isSupported(): boolean {
        if (Capacitor.isNativePlatform()) {
            return true; // Native plugin always available on iOS
        }
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    // Initialize recognition session
    async start(expectedText: string, callbacks: RecognitionCallbacks, startIndex: number = 0): Promise<boolean> {
        // Parse expected words
        this.expectedWords = expectedText
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
        this.currentWordIndex = startIndex;
        this.callbacks = callbacks;
        this.processedWords = new Set();
        this.useNative = Capacitor.isNativePlatform();

        if (this.useNative) {
            return this.startNative(callbacks);
        } else {
            return this.startWeb(callbacks);
        }
    }

    // ─── Native iOS (Capacitor plugin) ───────────────────────
    private async startNative(callbacks: RecognitionCallbacks): Promise<boolean> {
        try {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');

            // Request permissions
            const permResult = await SpeechRecognition.requestPermissions();
            if (permResult.speechRecognition !== 'granted') {
                callbacks.onError('Veuillez autoriser la reconnaissance vocale dans les Réglages.');
                return false;
            }

            // Listen for partial results
            this.nativeListenerHandle = await SpeechRecognition.addListener('partialResults', (data: any) => {
                const matches: string[] = data.matches || [];
                if (matches.length > 0) {
                    const transcript = matches[0];
                    this.callbacks?.onInterimResult(transcript);
                    // Process as final since native returns accumulated text
                    this.processTranscriptRealtime(transcript, true);
                }
            });

            // Start listening
            await SpeechRecognition.start({
                language: 'ar-SA',
                partialResults: true,
                popup: false,
            });

            this.isListening = true;
            this.callbacks?.onCurrentWord(this.currentWordIndex);
            return true;
        } catch (error: any) {
            console.error('[SpeechRecognition] Native start failed:', error);
            callbacks.onError(error.message || 'Erreur de reconnaissance vocale native');
            return false;
        }
    }

    // ─── Web Speech API (PWA / Browser) ──────────────────────
    private startWeb(callbacks: RecognitionCallbacks): boolean {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            callbacks.onError('Speech recognition not supported');
            return false;
        }

        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognitionClass();

        // Configure for Arabic
        this.recognition.lang = 'ar-SA';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        // Handle results
        this.recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            const transcript = lastResult[0].transcript;

            this.callbacks?.onInterimResult(transcript);

            const isAndrMobile = new RegExp(['A','n','d','r','o','i','d'].join(''), 'i').test(navigator.userAgent);
            this.processTranscriptRealtime(transcript, lastResult.isFinal || isAndrMobile);
        };

        // Handle errors
        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') {
                this.callbacks?.onError(event.error);
            }
        };

        // Handle end
        this.recognition.onend = () => {
            this.isListening = false;
            this.callbacks?.onEnd();
        };

        // Start listening
        try {
            this.recognition.start();
            this.isListening = true;
            this.callbacks?.onCurrentWord(this.currentWordIndex);
            return true;
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            return false;
        }
    }

    // Stop recognition
    async stop(): Promise<void> {
        if (this.useNative) {
            try {
                const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                await SpeechRecognition.stop();
                if (this.nativeListenerHandle) {
                    this.nativeListenerHandle.remove();
                    this.nativeListenerHandle = null;
                }
            } catch (e) {
                console.warn('[SpeechRecognition] Native stop error:', e);
            }
        } else if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
    }

    // Process transcript in real-time
    private processTranscriptRealtime(transcript: string, isFinal: boolean): void {
        const spokenWords = transcript
            .split(/\s+/)
            .filter(w => w.length > 0);

        if (!isFinal) {
            return;
        }

        for (const spokenWord of spokenWords) {
            if (this.currentWordIndex >= this.expectedWords.length) break;

            const expectedWord = this.expectedWords[this.currentWordIndex];
            const matchResult = this.findBestMatch(spokenWord, this.currentWordIndex);

            if (matchResult.matched) {
                for (let j = this.currentWordIndex; j < matchResult.matchIndex; j++) {
                    if (!this.processedWords.has(j)) {
                        this.processedWords.add(j);
                        this.callbacks?.onWordMatch(j, false, "(sauté)");
                    }
                }

                if (!this.processedWords.has(matchResult.matchIndex)) {
                    this.processedWords.add(matchResult.matchIndex);
                    this.callbacks?.onWordMatch(matchResult.matchIndex, true, spokenWord);
                }

                this.currentWordIndex = matchResult.matchIndex + 1;
            } else {
                if (!this.processedWords.has(this.currentWordIndex)) {
                    this.processedWords.add(this.currentWordIndex);
                    const fuzzyMatch = areWordsEqual(spokenWord, expectedWord);
                    this.callbacks?.onWordMatch(this.currentWordIndex, fuzzyMatch, spokenWord);
                }
                this.currentWordIndex++;
            }

            if (this.currentWordIndex < this.expectedWords.length) {
                this.callbacks?.onCurrentWord(this.currentWordIndex);
            }
        }
    }

    // Sliding window to find best match (allows skipping ahead)
    private findBestMatch(spokenWord: string, startIndex: number): { matched: boolean; matchIndex: number } {
        const windowSize = 4;

        for (let i = startIndex; i < Math.min(startIndex + windowSize, this.expectedWords.length); i++) {
            if (areWordsEqual(spokenWord, this.expectedWords[i])) {
                return { matched: true, matchIndex: i };
            }
        }

        return { matched: false, matchIndex: startIndex };
    }

    // Set current word index (for manual jumps)
    setCurrentWordIndex(index: number): void {
        if (index >= 0 && index < this.expectedWords.length) {
            this.currentWordIndex = index;
            for (let i = index; i < this.expectedWords.length; i++) {
                this.processedWords.delete(i);
            }
            this.callbacks?.onCurrentWord(index);
        }
    }

    // Get current progress
    getProgress(): { current: number; total: number } {
        return {
            current: this.currentWordIndex,
            total: this.expectedWords.length
        };
    }

    // Reset for new session
    reset(): void {
        this.stop();
        this.expectedWords = [];
        this.currentWordIndex = 0;
        this.callbacks = null;
        this.processedWords = new Set();
    }
}

export const speechRecognitionService = new SpeechRecognitionService();
