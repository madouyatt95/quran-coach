// Word-by-word audio service for Tajwid learning
// Uses everyayah.com word-by-word audio (Husary)

const WORD_AUDIO_BASE = 'https://everyayah.com/data/Husary_Mujawwad_128kbps';

// Using a more reliable source if possible, but keeping everyayah as fallback
// Note: Some sources might be HTTP only, so we use a protocol-relative URL if needed
const WORD_AUDIO_WBW_BASE = 'https://www.everyayah.com/data/wordbyword';

// Cache for loaded audio
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Get word audio URL
export function getWordAudioUrl(surah: number, ayah: number, wordPosition: number): string {
    const surahStr = String(surah).padStart(3, '0');
    const ayahStr = String(ayah).padStart(3, '0');
    const wordStr = String(wordPosition).padStart(3, '0');

    return `${WORD_AUDIO_WBW_BASE}/${surahStr}_${ayahStr}_${wordStr}.mp3`;
}

// Get full ayah audio URL
export function getAyahAudioUrl(surah: number, ayah: number): string {
    const surahStr = String(surah).padStart(3, '0');
    const ayahStr = String(ayah).padStart(3, '0');

    return `${WORD_AUDIO_BASE}/${surahStr}${ayahStr}.mp3`;
}

// Play word audio
export async function playWordAudio(
    surah: number,
    ayah: number,
    wordPosition: number,
    onEnd?: () => void
): Promise<void> {
    const url = getWordAudioUrl(surah, ayah, wordPosition);
    const cacheKey = `${surah}:${ayah}:${wordPosition}`;

    // Stop and reset all currently playing audio
    stopAllWordAudio();

    let audio = audioCache.get(cacheKey);

    if (!audio) {
        audio = new Audio();
        audioCache.set(cacheKey, audio);
    }

    // Set source and events
    audio.src = url;

    if (onEnd) {
        audio.onended = onEnd;
    } else {
        audio.onended = null;
    }

    try {
        // Essential for mobile: play() must be closely linked to user gesture
        // By setting src and playing immediately, we have better luck on Safari
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            await playPromise;
        }
    } catch (error) {
        console.error('Failed to play word audio:', error);
        // Fallback: If it failed, maybe try a fresh object
        const fallbackAudio = new Audio(url);
        fallbackAudio.onended = onEnd || null;
        await fallbackAudio.play().catch(e => console.error("Final fallback failed:", e));
    }
}

// Stop all playing word audio
export function stopAllWordAudio(): void {
    audioCache.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

// Preload word audio for an ayah
export async function preloadAyahWords(surah: number, ayah: number, wordCount: number): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let i = 1; i <= wordCount; i++) {
        const url = getWordAudioUrl(surah, ayah, i);
        const cacheKey = `${surah}:${ayah}:${i}`;

        if (!audioCache.has(cacheKey)) {
            const promise = new Promise<void>((resolve) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = url;
                audio.oncanplaythrough = () => resolve();
                audio.onerror = () => resolve(); // Don't fail if one word fails
                audioCache.set(cacheKey, audio);
            });
            promises.push(promise);
        }
    }

    await Promise.all(promises);
}

// Clear cache to free memory
export function clearWordAudioCache(): void {
    stopAllWordAudio();
    audioCache.clear();
}
