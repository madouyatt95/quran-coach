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
            // Use whisper-tiny for faster loading, whisper-small for better accuracy
            this.transcriber = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny',
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

    // Convert audio blob to Float32Array for Whisper
    private async blobToFloat32Array(blob: Blob): Promise<Float32Array> {
        // Create an AudioContext
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        // Convert blob to ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();

        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get the audio data as Float32Array (mono, first channel)
        const audioData = audioBuffer.getChannelData(0);

        // Resample to 16kHz if needed (Whisper expects 16kHz)
        const targetSampleRate = 16000;
        if (audioBuffer.sampleRate !== targetSampleRate) {
            return this.resampleAudio(audioData, audioBuffer.sampleRate, targetSampleRate);
        }

        await audioContext.close();
        return audioData;
    }

    // Resample audio to target sample rate
    private resampleAudio(audioData: Float32Array, fromRate: number, toRate: number): Float32Array {
        const ratio = fromRate / toRate;
        const newLength = Math.round(audioData.length / ratio);
        const result = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const srcIndex = i * ratio;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
            const t = srcIndex - srcIndexFloor;

            // Linear interpolation
            result[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
        }

        return result;
    }

    // Transcribe audio blob to Arabic text
    async transcribe(audioBlob: Blob): Promise<string> {
        if (!this.transcriber) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        try {
            // Convert blob to Float32Array
            const audioData = await this.blobToFloat32Array(audioBlob);

            // Transcribe with Arabic language hint
            const result = await this.transcriber(audioData, {
                language: 'ar',
                task: 'transcribe',
            });

            // Extract text from result
            if (Array.isArray(result)) {
                return result.map((r: { text: string }) => r.text).join(' ');
            }
            return (result as { text: string }).text || '';
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
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
        const expectedWord = expectedWords[eIndex];
        const transcribedWord = transcribedWords[tIndex];

        if (!transcribedWord) {
            // Missing word
            errors.push({ type: 'missing', word: expectedWord, position: eIndex });
            missedWords.push(expectedWord);
            eIndex++;
        } else if (transcribedWord === expectedWord) {
            // Correct
            matchedWords.push(expectedWord);
            tIndex++;
            eIndex++;
        } else {
            // Check if word appears later (might be skipped)
            const foundLater = transcribedWords.slice(tIndex + 1, tIndex + 3).indexOf(expectedWord);
            if (foundLater !== -1) {
                // Extra words before
                for (let i = 0; i <= foundLater; i++) {
                    errors.push({ type: 'extra', word: transcribedWords[tIndex + i], position: eIndex });
                }
                tIndex += foundLater + 2;
                matchedWords.push(expectedWord);
                eIndex++;
            } else {
                // Wrong word
                errors.push({ type: 'wrong', word: expectedWord, position: eIndex });
                missedWords.push(expectedWord);
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
