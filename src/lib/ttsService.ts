/**
 * Arabic TTS Service
 * 
 * Uses Arabic-TTS-Spark HuggingFace Space (IbrahimSalah/Arabic-TTS-Spark)
 * with fallback to Web Speech API (SpeechSynthesisUtterance).
 * 
 * Includes audio caching to avoid re-synthesis of the same text.
 * 
 * FIX: Uses a single shared audio element (ttsAudio) instead of creating
 * new Audio() instances each time, preventing ghost audio that can't be stopped.
 */


// In-memory audio cache (text → ObjectURL)
const audioCache = new Map<string, string>();

// Single shared TTS audio element — prevents ghost audio instances
let ttsAudio: HTMLAudioElement | null = null;

function getTtsAudio(): HTMLAudioElement {
    if (!ttsAudio) {
        ttsAudio = new Audio();
        ttsAudio.preload = 'none';
    }
    return ttsAudio;
}

// State
let _isPlaying = false;
let _isLoading = false;
let onStateChange: (() => void) | null = null;

/**
 * Set a callback for state changes (playing/loading)
 */
export function setTtsStateCallback(cb: () => void) {
    onStateChange = cb;
}

function notifyChange() {
    onStateChange?.();
}

/**
 * Check if TTS is currently playing
 */
export function isTtsPlaying(): boolean {
    return _isPlaying;
}

/**
 * Check if TTS is currently loading/synthesizing
 */
export function isTtsLoading(): boolean {
    return _isLoading;
}

/**
 * Stop any currently playing TTS audio
 */
export function stopTts() {
    const audio = getTtsAudio();
    audio.pause();
    audio.src = '';
    audio.currentTime = 0;
    window.speechSynthesis?.cancel();
    _isPlaying = false;
    _isLoading = false;
    notifyChange();
}

/**
 * Synthesize Arabic text to audio using Google Translate TTS (Unofficial API).
 * Returns an ObjectURL to the audio blob, or null if failed.
 * Note: Google TTS has a ~200 character limit per request. 
 * For Adhkar, this is usually perfectly enough.
 */
// We use Google TTS API directly via audio source to avoid CORS issues.
// `client=tw-ob` is the unofficial endpoint parameter that allows direct media playback.
function getGoogleTtsUrl(text: string): string {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodeURIComponent(text)}`;
}

/**
 * Fallback: use Web Speech API (SpeechSynthesisUtterance)
 */
function speakWithWebSpeech(text: string, rate: number = 0.85): Promise<void> {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.warn('Speech synthesis not supported');
            resolve();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = rate;
        utterance.pitch = 1;

        // Try to find an Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.onend = () => {
            _isPlaying = false;
            notifyChange();
            resolve();
        };
        utterance.onerror = (e) => {
            console.warn('Web Speech API error:', e);
            _isPlaying = false;
            notifyChange();
            resolve(); // Resolve anyway so it doesn't block the app
        };

        _isPlaying = true;
        notifyChange();
        window.speechSynthesis.speak(utterance);
    });
}

/**
 * Play Arabic text as speech.
 * Tries HuggingFace Space first, falls back to Web Speech API.
 * 
 * @param text Arabic text to speak
 * @param options.rate Playback speed (default 1.0)
 * @param options.onEnd Callback when playback finishes
 */
export async function playTts(
    text: string,
    options?: { rate?: number; onEnd?: () => void }
): Promise<void> {
    const rate = options?.rate ?? 1.0;

    // Stop any current playback (uses shared element — no ghost audio)
    stopTts();

    _isLoading = true;
    notifyChange();

    // Check cache first
    let audioUrl = audioCache.get(text);

    // Try Google TTS if not cached
    if (!audioUrl) {
        audioUrl = getGoogleTtsUrl(text);
        if (audioUrl) {
            audioCache.set(text, audioUrl);
        }
    }

    _isLoading = false;
    notifyChange();

    // Play via shared Audio element if we have a URL
    if (audioUrl) {
        return new Promise<void>((resolve) => {
            const audio = getTtsAudio();
            audio.src = audioUrl!;
            audio.playbackRate = rate;
            _isPlaying = true;
            notifyChange();

            // Remove old listeners before adding new ones
            audio.onended = null;
            audio.onerror = null;

            audio.onended = () => {
                _isPlaying = false;
                notifyChange();
                options?.onEnd?.();
                resolve();
            };

            audio.onerror = () => {
                _isPlaying = false;
                notifyChange();
                // Fallback to Web Speech on audio error
                speakWithWebSpeech(text, rate).then(() => {
                    options?.onEnd?.();
                    resolve();
                });
            };

            audio.play().catch((e) => {
                console.warn('Google TTS play failed, CORS or block. Fallback to Web Speech:', e);
                // Fallback to Web Speech
                _isPlaying = false;
                speakWithWebSpeech(text, rate).then(() => {
                    options?.onEnd?.();
                    resolve();
                });
            });
        });
    }

    // Direct Web Speech fallback
    try {
        await speakWithWebSpeech(text, rate);
        options?.onEnd?.();
    } catch {
        // Silent fail — no TTS available
        options?.onEnd?.();
    }
}

/**
 * Play text in a loop N times with a pause between repetitions.
 */
export async function playTtsLoop(
    text: string,
    count: number,
    options?: { rate?: number; pauseMs?: number; onLoop?: (current: number) => void; onEnd?: () => void }
): Promise<void> {
    const pauseMs = options?.pauseMs ?? 600;

    for (let i = 0; i < count; i++) {
        options?.onLoop?.(i);
        await playTts(text, { rate: options?.rate });

        // Pause between repetitions (except after last)
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, pauseMs));
        }
    }

    options?.onEnd?.();
}

/**
 * Clear the audio cache (free memory)
 */
export function clearTtsCache() {
    audioCache.forEach(url => URL.revokeObjectURL(url));
    audioCache.clear();
}
