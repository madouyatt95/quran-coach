import { fetchAyahAudioUrl, fetchRabbanaTimings } from './quranApi';
import { playTts, stopTts } from './ttsService';
import { playMediaClip, playbackPause } from './mediaPlayback';

let audio: HTMLAudioElement | null = null;
let session: AbortController | null = null;
const getAudio = () => { if (!audio) { audio = new Audio(); audio.preload = 'none'; } return audio; };
type Options = { rate?: number; onEnd?: () => void };

export function getAdhkarAudioUrl(categoryId: string, duaId: number): string | null {
    if (categoryId !== 'hisn_chap_27' && categoryId !== 'chap_27' && (categoryId.startsWith('hisn_') || categoryId.startsWith('chap_'))) {
        return `${import.meta.env.BASE_URL}audio/hisn/dua_${duaId}.mp3`;
    }
    return null;
}

async function playOnce(text: string, duaId: number, categoryId: string, source: string | undefined, rate: number | undefined, signal: AbortSignal): Promise<void> {
    const quran = categoryId === 'rabanna' && source?.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (quran) {
        const surah = Number(quran[1]), first = Number(quran[2]), last = Number(quran[3] || first);
        let complete = true;
        try {
            const timings = await fetchRabbanaTimings(surah, first, text);
            if (signal.aborted) return;
            for (let verse = first; verse <= last; verse++) {
                const url = await fetchAyahAudioUrl(surah, verse);
                if (signal.aborted) return;
                if (!url || !await playMediaClip(getAudio(), url, {signal, rate,
                    start:verse === first && timings ? timings[0]/1000 : 0,
                    end:first === last && timings ? timings[1]/1000 : undefined})) {complete = false;break;}
            }
            if (complete || signal.aborted) return;
        } catch { if (signal.aborted) return; }
    }
    const url = getAdhkarAudioUrl(categoryId, duaId);
    if (url && await playMediaClip(getAudio(), url, {signal, rate})) return;
    if (!signal.aborted) await playTts(text, {rate, signal});
}

export function stopAdhkarAudio() {
    session?.abort();
    session = null;
    audio?.pause();
    stopTts();
}

export async function playAdhkarAudio(text: string, duaId: number, categoryId: string, source?: string, options?: Options): Promise<void> {
    await playAdhkarAudioLoop(text, duaId, categoryId, 1, source, options);
}

export async function playAdhkarAudioLoop(text: string, duaId: number, categoryId: string, count: number, source?: string,
    options?: Options & {pauseMs?: number; onLoop?: (current: number) => void}): Promise<void> {
    stopAdhkarAudio();
    const controller = new AbortController();
    session = controller;
    const {signal} = controller;
    const repeats = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    try {
        for (let i = 0; i < repeats; i++) {
            if (signal.aborted) return;
            options?.onLoop?.(i);
            await playOnce(text, duaId, categoryId, source, options?.rate, signal);
            if (signal.aborted) return;
            if (i < repeats - 1) await playbackPause(options?.pauseMs ?? 600, signal);
        }
        if (!signal.aborted && repeats > 0) options?.onEnd?.();
    } finally { if (session === controller) session = null; }
}
