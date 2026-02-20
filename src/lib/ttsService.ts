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
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=dict-chrome-ex&tl=ar&q=${encodeURIComponent(text)}`;
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
 * Split text into chunks to respect Google TTS limits (~200 chars).
 */
function chunkText(text: string, maxLength: number = 180): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/([.،!?؛\n]+)/);
    let current = '';

    for (const part of sentences) {
        if (current.length + part.length > maxLength && current.trim().length > 0) {
            chunks.push(current.trim());
            current = part;
        } else {
            current += part;
        }
    }
    if (current.trim().length > 0) {
        chunks.push(current.trim());
    }
    return chunks;
}

/**
 * Play Arabic text as speech.
 * Tries Google TTS first (chunked if needed), falls back to Web Speech API.
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

    const textChunks = chunkText(text);
    const audioUrls: string[] = [];

    // Fetch URLs (serving from cache if available)
    try {
        const fetchPromises = textChunks.map(async (chunk) => {
            let url = audioCache.get(chunk);
            if (!url) {
                const reqUrl = getGoogleTtsUrl(chunk);
                // Fetch as blob with no-referrer to bypass Google preventing direct audio playback from non-Google origins
                const res = await fetch(reqUrl, { referrerPolicy: 'no-referrer' });
                if (!res.ok) throw new Error(`Google TTS request failed: ${res.status}`);
                const blob = await res.blob();
                url = URL.createObjectURL(blob);
                audioCache.set(chunk, url);
            }
            return url;
        });

        const resolvedUrls = await Promise.all(fetchPromises);
        audioUrls.push(...resolvedUrls);
    } catch (e) {
        console.warn('[TTS] Failed to pre-fetch TTS blobs', e);
        // Do not add anything to audioUrls so it triggers the seamless Web Speech fallback
    }

    _isLoading = false;
    notifyChange();

    if (audioUrls.length > 0) {
        _isPlaying = true;
        notifyChange();

        for (let i = 0; i < audioUrls.length; i++) {
            if (!_isPlaying) break; // Interrupted

            const success = await new Promise<boolean>((resolve) => {
                const audio = getTtsAudio();

                audio.onended = () => resolve(true);
                audio.onerror = (e) => {
                    console.warn(`[TTS] Error loading chunk ${i}:`, e);
                    resolve(false);
                };

                // Add an external abort timeout in case 'play()' gets stuck indefinitely 
                // without firing onended or onerror
                const safeTimeout = setTimeout(() => {
                    console.warn(`[TTS] Timeout waiting for playback chunk ${i}`);
                    resolve(false);
                }, 15000);

                audio.src = audioUrls[i];
                audio.playbackRate = rate;

                audio.play().then(() => {
                    clearTimeout(safeTimeout);
                }).catch((e) => {
                    clearTimeout(safeTimeout);
                    console.warn(`[TTS] Play failed for chunk ${i}:`, e);
                    resolve(false);
                });
            });

            if (!success) {
                // If Google TTS fails mid-chunk, fallback to Web Speech for the FULL REMAINING text
                _isPlaying = false; // reset flag before fallback
                const remainingText = textChunks.slice(i).join(' ');
                console.log(`[TTS] Falling back to Web Speech for remaining ${textChunks.length - i} chunks.`);
                await speakWithWebSpeech(remainingText, rate);
                break; // Stop loop, fallback handles the rest
            }
        }
        _isPlaying = false;
        notifyChange();
        options?.onEnd?.();
        return;
    }

    // Direct Web Speech fallback if no URLs were generated
    try {
        await speakWithWebSpeech(text, rate);
        options?.onEnd?.();
    } catch {
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
