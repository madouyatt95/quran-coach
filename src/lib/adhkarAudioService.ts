/**
 * Adhkar Audio Service
 * Handles playback of Adhkar audio, routing to either:
 * 1. Quranic audio (Mishary) for Rabbana invocations
 * 2. Pre-recorded MP3s for Hisnul Muslim
 * 3. Fallback to Google TTS or local Web Speech API
 */

import { fetchAyahAudioUrl, fetchRabbanaTimings } from './quranApi';
import { playTts, stopTts } from './ttsService';
import { HISNUL_MUSLIM_DATA } from '../data/hisnulMuslim';

let adhkarAudio: HTMLAudioElement | null = null;
let currentLoopTimeout: ReturnType<typeof setTimeout> | null = null;
let isPlayingLoop = false;
let autoStoptimer: ReturnType<typeof setTimeout> | null = null;

function getAdhkarAudio(): HTMLAudioElement {
    if (!adhkarAudio) {
        adhkarAudio = new Audio();
        adhkarAudio.preload = 'none';
    }
    return adhkarAudio;
}

/**
 * Parses a source string like "2:127" into surah and ayah numbers.
 */
function parseQuranicSource(source?: string): { surah: number; ayah: number; isRange: boolean } | null {
    if (!source) return null;
    const match = source.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (match) {
        return {
            surah: parseInt(match[1], 10),
            ayah: parseInt(match[2], 10),
            isRange: !!match[3]
        };
    }
    return null;
}

/**
 * Tries to play Hisnul Muslim MP3 if audioId exists
 */
async function tryPlayHisnulMuslimAudio(duaId: number, categoryId: string, options?: { rate?: number }): Promise<boolean> {
    try {
        let audioId: number | undefined;

        // AdhkarPage passes "hisn_chap_X" to prevent collisions. We strip "hisn_" to match HISNUL_MUSLIM_DATA.
        const actualCategoryId = categoryId.startsWith('hisn_') ? categoryId.replace('hisn_', '') : categoryId;

        // Find the audioId in the mapped dataset
        for (const mega of HISNUL_MUSLIM_DATA) {
            const chap = mega.chapters.find(c => c.id === actualCategoryId);
            if (chap) {
                const dua = chap.duas.find(d => d.id === duaId);
                if (dua && dua.audioId) {
                    audioId = dua.audioId;
                }
                break;
            }
        }

        if (!audioId) return false;

        const url = `https://www.hisnmuslim.com/audio/ar/${audioId}.mp3`;

        const played = await new Promise<boolean>((resolve) => {
            const audio = getAdhkarAudio();
            audio.src = url;
            audio.playbackRate = options?.rate || 1.0;

            const clearTimeupdate = () => { audio.ontimeupdate = null; };

            audio.onended = () => {
                clearTimeupdate();
                resolve(true);
            };
            audio.onerror = () => {
                console.error(`Failed to load MP3 from ${url}`);
                clearTimeupdate();
                resolve(false);
            };
            audio.play().catch((err) => {
                console.error('Play promise rejected for Hisnul Muslim MP3', err);
                clearTimeupdate();
                resolve(false);
            });
        });

        return played;
    } catch (e) {
        console.error('Error playing Hisnul Muslim MP3', e);
        return false;
    }
}


/**
 * Plays a single Adhkar audio
 */
export async function playAdhkarAudio(
    text: string,
    _duaId: number,
    categoryId: string,
    source?: string,
    options?: { rate?: number; onEnd?: () => void }
): Promise<void> {
    stopAdhkarAudio();
    // 1. Check if it's a Quranic Dua (e.g. Rabbana). 
    const quranicSource = parseQuranicSource(source);
    if (quranicSource && categoryId === 'rabanna') {
        try {
            if (quranicSource.isRange) {
                // Play range sequentially with slicing on the first ayah
                const endAyah = Number(source!.split('-')[1]);

                // Fetch timings for the first ayah using the text to find the start point
                const startTimings = await fetchRabbanaTimings(quranicSource.surah, quranicSource.ayah, text);

                for (let a = quranicSource.ayah; a <= endAyah; a++) {
                    const url = await fetchAyahAudioUrl(quranicSource.surah, a);
                    if (!url) break;

                    if (!isPlayingLoop && a > quranicSource.ayah) {
                        return; // Stopped manually
                    }

                    const played = await new Promise<boolean>((resolve) => {
                        const audio = getAdhkarAudio();
                        audio.src = url;
                        audio.playbackRate = options?.rate || 1.0;

                        const clearTimeupdate = () => { audio.ontimeupdate = null; };

                        // If it's the first ayah, slice it to start exactly at the Rabbana
                        if (a === quranicSource.ayah && startTimings) {
                            audio.currentTime = startTimings[0] / 1000;
                        }

                        // For the last ayah we usually play to the end, but could slice if needed.
                        // Currently Rabbanas end at the end of the ayah.

                        audio.onended = () => resolve(true);
                        audio.onerror = () => {
                            clearTimeupdate();
                            resolve(false);
                        };
                        audio.play().catch(() => {
                            clearTimeupdate();
                            resolve(false);
                        });
                    });
                    if (!played) break;
                }
                options?.onEnd?.();
                return;
            } else {
                // Single Ayah playback with precise slicing
                const timings = await fetchRabbanaTimings(quranicSource.surah, quranicSource.ayah, text);
                const url = await fetchAyahAudioUrl(quranicSource.surah, quranicSource.ayah);

                if (url && timings) {
                    const [startMs, endMs] = timings;
                    const played = await new Promise<boolean>((resolve) => {
                        const audio = getAdhkarAudio();
                        audio.src = url;
                        audio.playbackRate = options?.rate || 1.0;

                        const durationMs = (endMs - startMs) / audio.playbackRate;

                        // Prepare time slicing
                        audio.currentTime = startMs / 1000;

                        const clearTimeupdate = () => { audio.ontimeupdate = null; };

                        // We ensure exact isolation
                        audio.ontimeupdate = () => {
                            if (audio.currentTime >= endMs / 1000) {
                                audio.pause();
                                clearTimeupdate();
                                options?.onEnd?.();
                                resolve(true);
                            }
                        };

                        // Backup safety timeout incase timeupdate misses
                        if (autoStoptimer) clearTimeout(autoStoptimer);
                        autoStoptimer = setTimeout(() => {
                            audio.pause();
                            clearTimeupdate();
                            options?.onEnd?.();
                            resolve(true);
                        }, durationMs + 300); // 300ms buffer

                        audio.onerror = () => {
                            console.error('Failed to play sliced Quranic audio for Adhkar');
                            clearTimeupdate();
                            if (autoStoptimer) clearTimeout(autoStoptimer);
                            resolve(false);
                        };

                        audio.play().catch(() => {
                            console.error('Play promise rejected for Quranic audio slice');
                            clearTimeupdate();
                            if (autoStoptimer) clearTimeout(autoStoptimer);
                            resolve(false);
                        });
                    });

                    if (played) return; // Exist if played successfully. Otherwise, fallback TTS.
                }
            }
        } catch (e) {
            console.error('Error fetching/playing Quranic audio', e);
        }
    }

    // 2. Try Hisnul Muslim Pre-recorded MP3
    const playedMp3 = await tryPlayHisnulMuslimAudio(_duaId, categoryId, { rate: options?.rate });
    if (playedMp3) {
        options?.onEnd?.();
        return;
    }

    // 3. Fallback to TTS (We use the improved ttsService which uses Google TTS / Web Speech)
    await playTts(text, options);
}

/**
 * Plays Adhkar audio in a loop
 */
export async function playAdhkarAudioLoop(
    text: string,
    duaId: number,
    categoryId: string,
    count: number,
    source?: string,
    options?: { rate?: number; pauseMs?: number; onLoop?: (current: number) => void; onEnd?: () => void }
): Promise<void> {
    const pauseMs = options?.pauseMs ?? 600;
    isPlayingLoop = true;

    for (let i = 0; i < count; i++) {
        if (!isPlayingLoop) break;

        options?.onLoop?.(i);

        await new Promise<void>((resolve) => {
            playAdhkarAudio(text, duaId, categoryId, source, {
                rate: options?.rate,
                onEnd: resolve
            });
        });

        if (!isPlayingLoop) break;

        // Pause between repetitions
        if (i < count - 1) {
            await new Promise<void>(resolve => {
                currentLoopTimeout = setTimeout(resolve, pauseMs);
            });
        }
    }

    isPlayingLoop = false;
    options?.onEnd?.();
}

/**
 * Stops all Adhkar audio
 */
export function stopAdhkarAudio() {
    isPlayingLoop = false;
    if (currentLoopTimeout) {
        clearTimeout(currentLoopTimeout);
        currentLoopTimeout = null;
    }
    if (autoStoptimer) {
        clearTimeout(autoStoptimer);
        autoStoptimer = null;
    }

    if (adhkarAudio) {
        adhkarAudio.pause();
        adhkarAudio.ontimeupdate = null;
        adhkarAudio.currentTime = 0;
    }

    stopTts();
}
