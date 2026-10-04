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


import { playMediaClip } from './mediaPlayback';

let ttsSession: AbortController | null = null;

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
    ttsSession?.abort();
    ttsSession = null;
    const audio = getTtsAudio();
    audio.pause();
    // Do not reset src to '' because it sometimes resets the iOS unlock state
    audio.currentTime = 0;
    window.speechSynthesis?.cancel();
    _isPlaying = false;
    _isLoading = false;
    notifyChange();
}

/**
 * Unlock audio context for iOS/Safari
 * MUST be called directly inside a UI event handler (like onClick)
 */
export function unlockAudio() {
    try {
        // Unlock HTML Audio Element using a tiny silent mp3
        const audio = getTtsAudio();
        // 0.1s silent mp3 base64
        audio.src = 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {
            // Ignore errors here, this is just a priming attempt
        });

        // Unlock Web Speech API
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.warn('Silent audio unlock failed', e);
    }
}

/**
 * Synthesize Arabic text to audio using Google Translate TTS (Unofficial API).
 * Returns an ObjectURL to the audio blob, or null if failed.
 * Note: Google TTS has a ~200 character limit per request. 
 * For Adhkar, this is usually perfectly enough.
 */
// We use Google TTS API directly via audio source to avoid CORS issues.
// `client=tw-ob` is the unofficial endpoint parameter that allows direct media playback.
function getGoogleTtsUrl(text: string, lang: string = 'ar'): string {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=dict-chrome-ex&tl=${lang}&q=${encodeURIComponent(text)}`;
}

/**
 * Fallback: use Web Speech API (SpeechSynthesisUtterance)
 */
function speakWithWebSpeech(text: string, rate: number, lang: string, signal: AbortSignal): Promise<void> {
    if (signal.aborted) return Promise.resolve();
    return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
            reject(new Error('Lecture audio indisponible sur cet appareil.'));
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'fr' ? 'fr-FR' : 'ar-SA';
        utterance.rate = rate;
        utterance.pitch = 1;

        // Select the best voice for the language
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = lang === 'fr' ? 'fr' : 'ar';
        const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));

        if (lang === 'fr') {
            // Prefer masculine French voice
            const maleVoice = langVoices.find(v =>
                v.name.toLowerCase().includes('thomas') ||
                v.name.toLowerCase().includes('male') ||
                v.name.toLowerCase().includes('homme') ||
                v.name.toLowerCase().includes('paul') ||
                v.name.toLowerCase().includes('henri') ||
                v.name.toLowerCase().includes('google français')
            );
            if (maleVoice) {
                utterance.voice = maleVoice;
            } else if (langVoices.length > 0) {
                utterance.voice = langVoices[0];
            }
        } else {
            if (langVoices.length > 0) utterance.voice = langVoices[0];
        }

        const finish = (error?: Error) => {
            signal.removeEventListener('abort', abort);
            utterance.onend = null;
            utterance.onerror = null;
            if (error && !signal.aborted) reject(error); else resolve();
        };
        const abort = () => { finish(); window.speechSynthesis.cancel(); };
        signal.addEventListener('abort', abort, {once:true});
        utterance.onend = () => finish();
        utterance.onerror = () => finish(new Error('La lecture vocale a échoué. Réessayez.'));

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
    options?: { rate?: number; lang?: string; onEnd?: () => void; signal?: AbortSignal }
): Promise<void> {
    stopTts();
    if (options?.signal?.aborted) return;
    const controller = new AbortController();
    ttsSession = controller;
    const {signal} = controller;
    const abort = () => controller.abort();
    options?.signal?.addEventListener('abort', abort, {once:true});
    const rate = options?.rate ?? 1, lang = options?.lang ?? 'ar';
    const chunks = chunkText(text);
    _isLoading = true;
    notifyChange();
    try {
        let urls: string[] = [];
        try {
            urls = await Promise.all(chunks.map(async chunk => {
                const key = `${lang}:${chunk}`;
                const cached = audioCache.get(key);
                if (cached) return cached;
                const res = await fetch(getGoogleTtsUrl(chunk, lang), {referrerPolicy:'no-referrer', signal});
                if (!res.ok) throw new Error(`TTS ${res.status}`);
                const blob = await res.blob();
                const url = await new Promise<string>((resolve,reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                if (!signal.aborted) audioCache.set(key,url);
                return url;
            }));
        } catch { /* Use device speech when the online voice is unavailable. */ }
        if (signal.aborted) return;
        _isLoading = false;
        _isPlaying = true;
        notifyChange();
        if (urls.length) {
            for (let i = 0; i < urls.length; i++) {
                if (signal.aborted) return;
                const played = await playMediaClip(getTtsAudio(),urls[i],{signal,rate});
                if (signal.aborted) return;
                if (!played) { await speakWithWebSpeech(chunks.slice(i).join(' '),rate,lang,signal); break; }
            }
        } else { await speakWithWebSpeech(text,rate,lang,signal); }
        if (!signal.aborted) options?.onEnd?.();
    } finally {
        options?.signal?.removeEventListener('abort',abort);
        if (ttsSession === controller) {
            ttsSession = null;
            _isLoading = false;
            _isPlaying = false;
            notifyChange();
        }
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
