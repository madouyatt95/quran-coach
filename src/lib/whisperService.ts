import { pipeline, Pipeline } from '@xenova/transformers';

// Service for in-browser speech-to-text using Whisper WASM
class WhisperService {
    private transcriber: Pipeline | null = null;
    private isLoading = false;
    private modelLoaded = false;
    private loadProgress = 0;
    private onProgressCallback: ((progress: number) => void) | null = null;

    // Load the Whisper model (downloads once, cached after)
    async loadModel(onProgress?: (progress: number) => void): Promise<boolean> {
        if (this.modelLoaded) return true;
        if (this.isLoading) return false;

        this.isLoading = true;
        this.onProgressCallback = onProgress || null;

        try {
            // Use whisper-small for better Arabic accuracy
            // Options: whisper-tiny (~40MB), whisper-small (~250MB), whisper-base (~75MB)
            this.transcriber = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-small',
                {
                    progress_callback: (data: { progress?: number }) => {
                        if (data.progress !== undefined) {
                            this.loadProgress = data.progress;
                            this.onProgressCallback?.(data.progress);
                        }
                    }
                }
            );
            this.modelLoaded = true;
            this.isLoading = false;
            return true;
        } catch (error) {
            console.error('Failed to load Whisper model:', error);
            this.isLoading = false;
            return false;
        }
    }

    // Check if model is ready
    isReady(): boolean {
        return this.modelLoaded;
    }

    // Get loading status
    getLoadProgress(): number {
        return this.loadProgress;
    }

    // Transcribe audio blob to Arabic text
    async transcribe(audioBlob: Blob): Promise<string> {
        if (!this.transcriber) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Transcribe with Arabic language hint
        const result = await this.transcriber(arrayBuffer, {
            language: 'ar',
            task: 'transcribe',
        });

        // Extract text from result
        if (Array.isArray(result)) {
            return result.map((r: { text: string }) => r.text).join(' ');
        }
        return (result as { text: string }).text || '';
    }

    // Transcribe from audio URL
    async transcribeFromUrl(audioUrl: string): Promise<string> {
        if (!this.transcriber) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        const result = await this.transcriber(audioUrl, {
            language: 'ar',
            task: 'transcribe',
        });

        if (Array.isArray(result)) {
            return result.map((r: { text: string }) => r.text).join(' ');
        }
        return (result as { text: string }).text || '';
    }
}

// Singleton instance
export const whisperService = new WhisperService();

// Compare transcribed text with expected text
export function compareArabicTexts(
    transcribed: string,
    expected: string
): {
    correct: boolean;
    accuracy: number;
    errors: { type: 'missing' | 'wrong' | 'extra'; word: string; position: number }[];
    matchedWords: string[];
    missedWords: string[];
} {
    // Normalize Arabic text (remove diacritics for comparison)
    const normalize = (text: string) => {
        return text
            .replace(/[\u064B-\u0652\u0670]/g, '') // Remove tashkeel
            .replace(/\s+/g, ' ')
            .trim();
    };

    const transcribedNorm = normalize(transcribed);
    const expectedNorm = normalize(expected);

    const transcribedWords = transcribedNorm.split(' ').filter(w => w.length > 0);
    const expectedWords = expectedNorm.split(' ').filter(w => w.length > 0);

    const errors: { type: 'missing' | 'wrong' | 'extra'; word: string; position: number }[] = [];
    const matchedWords: string[] = [];
    const missedWords: string[] = [];

    // Simple word-by-word comparison
    let tIndex = 0;
    let eIndex = 0;

    while (eIndex < expectedWords.length) {
        const expected = expectedWords[eIndex];
        const transcribed = transcribedWords[tIndex];

        if (!transcribed) {
            // Missing word
            errors.push({ type: 'missing', word: expected, position: eIndex });
            missedWords.push(expected);
            eIndex++;
        } else if (transcribed === expected) {
            // Correct
            matchedWords.push(expected);
            tIndex++;
            eIndex++;
        } else {
            // Check if word appears later (might be skipped)
            const foundLater = transcribedWords.slice(tIndex + 1, tIndex + 3).indexOf(expected);
            if (foundLater !== -1) {
                // Extra words before
                for (let i = 0; i <= foundLater; i++) {
                    errors.push({ type: 'extra', word: transcribedWords[tIndex + i], position: eIndex });
                }
                tIndex += foundLater + 2;
                matchedWords.push(expected);
                eIndex++;
            } else {
                // Wrong word
                errors.push({ type: 'wrong', word: expected, position: eIndex });
                missedWords.push(expected);
                tIndex++;
                eIndex++;
            }
        }
    }

    // Check for extra words at the end
    while (tIndex < transcribedWords.length) {
        errors.push({ type: 'extra', word: transcribedWords[tIndex], position: expectedWords.length });
        tIndex++;
    }

    const accuracy = expectedWords.length > 0
        ? (matchedWords.length / expectedWords.length) * 100
        : 100;

    return {
        correct: errors.length === 0,
        accuracy: Math.round(accuracy),
        errors,
        matchedWords,
        missedWords,
    };
}
