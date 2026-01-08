// Word-by-word audio service for Tajwid learning
// Uses everyayah.com word-by-word audio (Husary)

const WORD_AUDIO_BASE = 'https://everyayah.com/data/Husary_Mujawwad_128kbps';

// Format: https://everyayah.com/data/Husary_Mujawwad_128kbps/001002.mp3
// 001 = surah, 002 = ayah
// For word-by-word: https://everyayah.com/data/wordbyword/001_002_001.mp3
const WORD_AUDIO_WBW_BASE = 'https://everyayah.com/data/wordbyword';

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

    // Stop any currently playing audio
    stopAllWordAudio();

    let audio = audioCache.get(cacheKey);

    if (!audio) {
        audio = new Audio(url);
        audioCache.set(cacheKey, audio);
    }

    if (onEnd) {
        audio.onended = onEnd;
    }

    try {
        audio.currentTime = 0;
        await audio.play();
    } catch (error) {
        console.error('Failed to play word audio:', error);
        // Fallback: Remove from cache and try again
        audioCache.delete(cacheKey);
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
