// Speech Recognition Service for real-time Quran recitation feedback
// Uses Web Speech API for free, real-time speech-to-text

// Arabic normalization helpers
function normalizeArabic(text: string): string {
    return text
        // Remove tashkeel (diacritics)
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Normalize hamza forms
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ي')
        // Remove tatweel
        .replace(/ـ/g, '')
        // Normalize ya/alef maqsura
        .replace(/ى/g, 'ي')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim();
}

// Compare two Arabic words with fuzzy matching
function areWordsEqual(word1: string, word2: string): boolean {
    const n1 = normalizeArabic(word1);
    const n2 = normalizeArabic(word2);

    if (n1 === n2) return true;

    // Levenshtein distance for fuzzy matching (allow 1-2 char errors)
    const distance = levenshteinDistance(n1, n2);
    const maxLen = Math.max(n1.length, n2.length);
    const similarity = 1 - (distance / maxLen);

    return similarity >= 0.7; // 70% similarity threshold
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
    onWordMatch: (wordIndex: number, isCorrect: boolean) => void;
    onInterimResult: (text: string) => void;
    onError: (error: string) => void;
    onEnd: () => void;
}

class SpeechRecognitionService {
    private recognition: any = null;
    private isListening = false;
    private expectedWords: string[] = [];
    private currentWordIndex = 0;
    private callbacks: RecognitionCallbacks | null = null;

    // Check if Web Speech API is supported
    isSupported(): boolean {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    // Initialize recognition session
    start(expectedText: string, callbacks: RecognitionCallbacks): boolean {
        if (!this.isSupported()) {
            callbacks.onError('Speech recognition not supported');
            return false;
        }

        // Parse expected words
        this.expectedWords = expectedText
            .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel for comparison
            .split(/\s+/)
            .filter(w => w.length > 0);
        this.currentWordIndex = 0;
        this.callbacks = callbacks;

        // Create recognition instance
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognitionClass();

        // Configure for Arabic
        this.recognition.lang = 'ar-SA';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        // Handle results
        this.recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            const transcript = lastResult[0].transcript;

            // Send interim result
            this.callbacks?.onInterimResult(transcript);

            // If final result, process words
            if (lastResult.isFinal) {
                this.processTranscript(transcript);
            }
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
            return true;
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            return false;
        }
    }

    // Stop recognition
    stop(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Process transcript and match words
    private processTranscript(transcript: string): void {
        const spokenWords = transcript
            .split(/\s+/)
            .filter(w => w.length > 0);

        for (const spokenWord of spokenWords) {
            if (this.currentWordIndex >= this.expectedWords.length) break;

            const expectedWord = this.expectedWords[this.currentWordIndex];
            const isCorrect = areWordsEqual(spokenWord, expectedWord);

            this.callbacks?.onWordMatch(this.currentWordIndex, isCorrect);

            // Vibrate on error
            if (!isCorrect && 'vibrate' in navigator) {
                navigator.vibrate(200);
            }

            this.currentWordIndex++;
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
    }
}

export const speechRecognitionService = new SpeechRecognitionService();
