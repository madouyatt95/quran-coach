// Speech Recognition Service for real-time Quran recitation feedback
// Uses Web Speech API for free, real-time speech-to-text

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
    onWordMatch: (wordIndex: number, isCorrect: boolean) => void;
    onInterimResult: (text: string) => void;
    onCurrentWord: (wordIndex: number) => void; // NEW: for real-time highlighting
    onError: (error: string) => void;
    onEnd: () => void;
}

class SpeechRecognitionService {
    private recognition: any = null;
    private isListening = false;
    private expectedWords: string[] = [];
    private currentWordIndex = 0;
    private callbacks: RecognitionCallbacks | null = null;
    private processedWords: Set<number> = new Set(); // Track already processed words
    private lastInterimText = ''; // Track last interim for delta processing

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
        this.processedWords = new Set();
        this.lastInterimText = '';

        // Create recognition instance
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognitionClass();

        // Configure for Arabic
        this.recognition.lang = 'ar-SA';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        // Handle results - IMPROVED with instant interim feedback
        this.recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            const transcript = lastResult[0].transcript;

            // Send interim result for display
            this.callbacks?.onInterimResult(transcript);

            // Process BOTH interim and final results for instant feedback
            this.processTranscriptRealtime(transcript, lastResult.isFinal);
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
            // Highlight first word as current
            this.callbacks?.onCurrentWord(0);
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

    // IMPROVED: Process transcript in real-time with instant feedback
    private processTranscriptRealtime(transcript: string, isFinal: boolean): void {
        const spokenWords = transcript
            .split(/\s+/)
            .filter(w => w.length > 0);

        // Find new words not yet processed
        const newWordStartIndex = this.findNewWordsStartIndex(spokenWords);

        for (let i = newWordStartIndex; i < spokenWords.length; i++) {
            if (this.currentWordIndex >= this.expectedWords.length) break;

            const spokenWord = spokenWords[i];
            const expectedWord = this.expectedWords[this.currentWordIndex];

            // Try to match with sliding window (allows skipping 1-2 words ahead)
            const matchResult = this.findBestMatch(spokenWord, this.currentWordIndex);

            if (matchResult.matched) {
                // Mark any skipped words as errors
                for (let j = this.currentWordIndex; j < matchResult.matchIndex; j++) {
                    if (!this.processedWords.has(j)) {
                        this.processedWords.add(j);
                        // Only trigger callback with error for the first skipped word to avoid TTS spam
                        // The others are still marked as processed/error in the UI via the state map
                        this.callbacks?.onWordMatch(j, false);
                    }
                }

                // Mark the matched word as correct
                if (!this.processedWords.has(matchResult.matchIndex)) {
                    this.processedWords.add(matchResult.matchIndex);
                    this.callbacks?.onWordMatch(matchResult.matchIndex, true);
                }

                this.currentWordIndex = matchResult.matchIndex + 1;

                // Update current word highlight
                if (this.currentWordIndex < this.expectedWords.length) {
                    this.callbacks?.onCurrentWord(this.currentWordIndex);
                }
            } else if (isFinal) {
                // Only mark as error on final result to avoid false negatives
                const isCorrect = areWordsEqual(spokenWord, expectedWord);

                if (!this.processedWords.has(this.currentWordIndex)) {
                    this.processedWords.add(this.currentWordIndex);
                    this.callbacks?.onWordMatch(this.currentWordIndex, isCorrect);

                    // Vibrate on error
                    if (!isCorrect && 'vibrate' in navigator) {
                        navigator.vibrate(100);
                    }
                }

                this.currentWordIndex++;

                // Update current word highlight
                if (this.currentWordIndex < this.expectedWords.length) {
                    this.callbacks?.onCurrentWord(this.currentWordIndex);
                }
            }
        }

        // Update last processed text for delta tracking
        if (isFinal) {
            this.lastInterimText = '';
        } else {
            this.lastInterimText = transcript;
        }
    }

    // Find where new words start (for incremental processing)
    private findNewWordsStartIndex(currentWords: string[]): number {
        const lastWords = this.lastInterimText.split(/\s+/).filter(w => w.length > 0);

        // Find common prefix length
        let commonLength = 0;
        for (let i = 0; i < Math.min(lastWords.length, currentWords.length); i++) {
            if (normalizeArabic(lastWords[i]) === normalizeArabic(currentWords[i])) {
                commonLength++;
            } else {
                break;
            }
        }

        // Start from after common words, but process at least last word
        return Math.max(0, commonLength - 1);
    }

    // IMPROVED: Sliding window to find best match (allows skipping ahead)
    private findBestMatch(spokenWord: string, startIndex: number): { matched: boolean; matchIndex: number } {
        const windowSize = 4; // Look up to 4 words ahead for better tolerance

        for (let i = startIndex; i < Math.min(startIndex + windowSize, this.expectedWords.length); i++) {
            if (areWordsEqual(spokenWord, this.expectedWords[i])) {
                return { matched: true, matchIndex: i };
            }
        }

        return { matched: false, matchIndex: startIndex };
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
        this.lastInterimText = '';
    }
}

export const speechRecognitionService = new SpeechRecognitionService();

