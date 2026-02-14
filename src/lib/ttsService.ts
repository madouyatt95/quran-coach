/**
 * Arabic TTS Service
 * 
 * Uses Arabic-TTS-Spark HuggingFace Space (IbrahimSalah/Arabic-TTS-Spark)
 * with fallback to Web Speech API (SpeechSynthesisUtterance).
 * 
 * Includes audio caching to avoid re-synthesis of the same text.
 */

const TTS_SPACE_URL = 'https://ibrahimsalah-arabic-tts-spark.hf.space';

// In-memory audio cache (text → ObjectURL)
const audioCache = new Map<string, string>();

// State
let currentAudio: HTMLAudioElement | null = null;
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
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    window.speechSynthesis?.cancel();
    _isPlaying = false;
    _isLoading = false;
    notifyChange();
}

/**
 * Synthesize Arabic text to audio using HuggingFace Space.
 * Returns an ObjectURL to the audio blob, or null if failed.
 */
async function synthesizeWithHuggingFace(text: string): Promise<string | null> {
    try {
        // Call the Gradio API predict endpoint
        const response = await fetch(`${TTS_SPACE_URL}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [text, null, 1.0], // text, reference audio (null = default), speed
            }),
        });

        if (!response.ok) {
            console.warn('TTS Space returned', response.status);
            return null;
        }

        const result = await response.json();

        // Gradio returns file path or base64 audio
        const audioData = result.data?.[0];
        if (!audioData) return null;

        // If it's a file path, fetch it from the Space
        if (typeof audioData === 'object' && audioData.name) {
            const fileUrl = `${TTS_SPACE_URL}/file=${audioData.name}`;
            const audioResponse = await fetch(fileUrl);
            if (!audioResponse.ok) return null;
            const audioBlob = await audioResponse.blob();
            return URL.createObjectURL(audioBlob);
        }

        // If it's base64 data
        if (typeof audioData === 'string' && audioData.startsWith('data:')) {
            const fetchRes = await fetch(audioData);
            const blob = await fetchRes.blob();
            return URL.createObjectURL(blob);
        }

        return null;
    } catch (error) {
        console.warn('TTS HuggingFace synthesis failed:', error);
        return null;
    }
}

/**
 * Fallback: use Web Speech API (SpeechSynthesisUtterance)
 */
function speakWithWebSpeech(text: string, rate: number = 0.85): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
            reject(new Error('Speech synthesis not supported'));
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
            _isPlaying = false;
            notifyChange();
            reject(e);
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

    // Stop any current playback
    stopTts();

    _isLoading = true;
    notifyChange();

    // Check cache first
    let audioUrl = audioCache.get(text);

    // Try HuggingFace synthesis if not cached
    if (!audioUrl) {
        audioUrl = await synthesizeWithHuggingFace(text) ?? undefined;
        if (audioUrl) {
            audioCache.set(text, audioUrl);
        }
    }

    _isLoading = false;
    notifyChange();

    // Play via Audio element if we have a URL
    if (audioUrl) {
        return new Promise<void>((resolve) => {
            const audio = new Audio(audioUrl);
            audio.playbackRate = rate;
            currentAudio = audio;
            _isPlaying = true;
            notifyChange();

            audio.onended = () => {
                _isPlaying = false;
                currentAudio = null;
                notifyChange();
                options?.onEnd?.();
                resolve();
            };

            audio.onerror = () => {
                _isPlaying = false;
                currentAudio = null;
                notifyChange();
                // Fallback to Web Speech on audio error
                speakWithWebSpeech(text, rate).then(() => {
                    options?.onEnd?.();
                    resolve();
                }).catch(resolve);
            };

            audio.play().catch(() => {
                // Fallback to Web Speech
                _isPlaying = false;
                currentAudio = null;
                speakWithWebSpeech(text, rate).then(() => {
                    options?.onEnd?.();
                    resolve();
                }).catch(resolve);
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
