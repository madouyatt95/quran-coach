// AI Poke/Assist Service for real-time hints during recitation
// Uses silence detection to trigger hints

export interface HintConfig {
    silenceThresholdMs: number; // Time before showing a hint (default: 3000)
    enableVibration: boolean;
    enableVisualHint: boolean;
    enableAudioHint: boolean;
    hintType: 'firstLetter' | 'firstWord' | 'fullWord';
}

const DEFAULT_CONFIG: HintConfig = {
    silenceThresholdMs: 3000,
    enableVibration: true,
    enableVisualHint: true,
    enableAudioHint: false,
    hintType: 'firstLetter',
};

// Generate a hint based on current word
export function generateHint(
    words: string[],
    currentWordIndex: number,
    config: Partial<HintConfig> = {}
): { hint: string; nextWord: string } | null {
    const merged = { ...DEFAULT_CONFIG, ...config };

    if (currentWordIndex >= words.length) {
        return null;
    }

    const nextWord = words[currentWordIndex];
    let hint = '';

    switch (merged.hintType) {
        case 'firstLetter':
            // Show first letter only
            hint = nextWord.charAt(0) + '...';
            break;
        case 'firstWord':
            // Show first full word
            hint = nextWord;
            break;
        case 'fullWord':
            // Show the full word (for difficult cases)
            hint = nextWord;
            break;
    }

    return { hint, nextWord };
}

// Vibrate device for hint
export function triggerVibration(pattern: 'short' | 'long' | 'double' = 'short') {
    if (!('vibrate' in navigator)) return;

    switch (pattern) {
        case 'short':
            navigator.vibrate(100);
            break;
        case 'long':
            navigator.vibrate(300);
            break;
        case 'double':
            navigator.vibrate([100, 50, 100]);
            break;
    }
}

// Speak hint using Web Speech API (TTS)
export function speakHint(text: string, whisper: boolean = true) {
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Arabic
    utterance.rate = whisper ? 0.7 : 0.9; // Slower for whisper effect
    utterance.volume = whisper ? 0.3 : 0.8; // Lower volume for whisper
    utterance.pitch = whisper ? 0.8 : 1; // Slightly lower pitch for whisper

    window.speechSynthesis.speak(utterance);
}

// Main poke controller
export class PokeController {
    private silenceTimeout: number | null = null;
    private config: HintConfig;
    private onHint: ((hint: string) => void) | null = null;
    private lastHintTime: number = 0;
    private minTimeBetweenHints: number = 2000; // 2 seconds between hints

    constructor(config: Partial<HintConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    setConfig(config: Partial<HintConfig>) {
        this.config = { ...this.config, ...config };
    }

    setOnHint(callback: (hint: string) => void) {
        this.onHint = callback;
    }

    // Called when recording starts or voice is detected
    reset() {
        if (this.silenceTimeout) {
            window.clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }

    // Called when silence is detected
    onSilence(words: string[], currentWordIndex: number) {
        const now = Date.now();

        // Don't show hints too frequently
        if (now - this.lastHintTime < this.minTimeBetweenHints) {
            return;
        }

        // Start countdown to hint
        if (this.silenceTimeout) {
            window.clearTimeout(this.silenceTimeout);
        }

        this.silenceTimeout = window.setTimeout(() => {
            this.triggerHint(words, currentWordIndex);
        }, this.config.silenceThresholdMs);
    }

    private triggerHint(words: string[], currentWordIndex: number) {
        const hintData = generateHint(words, currentWordIndex, this.config);
        if (!hintData) return;

        this.lastHintTime = Date.now();

        // Vibration
        if (this.config.enableVibration) {
            triggerVibration('double');
        }

        // Visual hint callback
        if (this.config.enableVisualHint && this.onHint) {
            this.onHint(hintData.hint);
        }

        // Audio hint (TTS)
        if (this.config.enableAudioHint) {
            speakHint(hintData.nextWord, true);
        }
    }

    destroy() {
        this.reset();
        this.onHint = null;
    }
}

// Singleton instance
export const pokeController = new PokeController();
