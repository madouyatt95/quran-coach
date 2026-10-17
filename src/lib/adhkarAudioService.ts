import {repeatPauseSeconds,type GapMode} from './invocationPractice';
import {humanInvocationAudio} from './humanInvocationAudio';
import { fetchAyahAudioUrl, fetchRabbanaTimings } from './quranApi';
import { playTts, stopTts } from './ttsService';
import { playMediaClip } from './mediaPlayback';
import {PlaybackGate} from './playbackGate';
let gate = new PlaybackGate();
export function pauseAdhkarAudio() { gate.setPaused(true); }
export function resumeAdhkarAudio() { gate.setPaused(false); }

let audio: HTMLAudioElement | null = null;
let session: AbortController | null = null;
const getAudio = () => { if (!audio) { audio = new Audio(); audio.preload = 'none'; } return audio; };
type Options = { rate?: number; onEnd?: () => void; onStarted?:()=>void };
type Understanding = {gapMode?:GapMode;referenceDuration?:number;arabic:boolean;french:boolean;silence:boolean;translation:string;gap:number;onPhase?:(phase:'arabic'|'french'|'silence')=>void};

export function getAdhkarAudioUrl(categoryId: string, duaId: number): string | null {
    const human=humanInvocationAudio(categoryId,duaId);
    if(human)return human.url;
    // The legacy 276 recording was shared by two different texts; do not guess its mapping.
    if (duaId === 276 || duaId === 100276) return null;
    if (categoryId !== 'hisn_chap_27' && categoryId !== 'chap_27' && (categoryId.startsWith('hisn_') || categoryId.startsWith('chap_'))) {
        return `${import.meta.env.BASE_URL}audio/hisn/dua_${duaId}.mp3`;
    }
    return null;
}

async function playOnce(text: string, duaId: number, categoryId: string, source: string | undefined, rate: number | undefined, signal: AbortSignal, control:PlaybackGate, onStarted?:()=>void): Promise<void> {
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
                if (!url || !await playMediaClip(getAudio(), url, {signal, rate, gate:control,onStarted,
                    start:verse === first && timings ? timings[0]/1000 : 0,
                    end:first === last && timings ? timings[1]/1000 : undefined})) {complete = false;break;}
            }
            if (complete || signal.aborted) return;
        } catch { if (signal.aborted) return; }
    }
    const url = getAdhkarAudioUrl(categoryId, duaId);
    if (url && await playMediaClip(getAudio(), url, {signal, rate, gate:control,onStarted})) return;
    if (!signal.aborted) await playTts(text, {rate, signal, gate:control,onStart:onStarted});
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
    options?: Options & {pauseMs?: number; onLoop?: (current: number) => void;understanding?:Understanding}): Promise<void> {
    stopAdhkarAudio();
    const controller = new AbortController();
    session = controller;
    const control = gate = new PlaybackGate();
    const {signal} = controller;
    const repeats = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    try {
        for (let i = 0; i < (options?.understanding?.arabic===false?0:repeats); i++) {
            if (signal.aborted) return;
            await control.wait(signal);
            if(signal.aborted)return;
            options?.onLoop?.(i);
            options?.understanding?.onPhase?.('arabic');
            await playOnce(text, duaId, categoryId, source, options?.rate, signal,control,options?.onStarted);
            if (signal.aborted) return;
            if (i < repeats - 1) await control.delay(options?.pauseMs ?? 600, signal);
        }
        if(!signal.aborted && options?.understanding)await finishUnderstanding(options.understanding,options.rate??1,signal,control);
        if (!signal.aborted && repeats > 0) options?.onEnd?.();
    } finally { if (session === controller) session = null; }
}

/** Prefer recorded acoustic passages; otherwise synthesize the exact text segments. */
export async function learnAdhkar(phrases:string[], options:{rate:number;repeats:number;gap:number;onPart:(index:number,phase:'loading'|'listen'|'repeat')=>void;recording?:{url:string;ranges:number[][]}|null;understanding?:Understanding}):Promise<void>{
    stopAdhkarAudio();
    const controller=new AbortController(); session=controller;
    const control=gate=new PlaybackGate(), {signal}=controller;
    try {
        const parts=options.recording?.ranges.length??phrases.length;
        for(let i=0;i<(options.understanding?.arabic===false?0:parts);i++)for(let n=0;n<options.repeats;n++){
            await control.wait(signal);if(signal.aborted)return;
            options.onPart(i,'loading');
            if(options.recording){
                const [start,end]=options.recording.ranges[i];
                const played=await playMediaClip(getAudio(),options.recording.url,{start,end,rate:options.rate,signal,gate:control,onStarted:()=>options.onPart(i,'listen')});
                if(!played&&!signal.aborted)throw new Error('Enregistrement indisponible.');
            }else await playTts(phrases[i],{rate:options.rate,signal,gate:control,onStart:()=>options.onPart(i,'listen')});
            if(signal.aborted)return;
            if(options.understanding?.silence!==false){options.onPart(i,'repeat');await control.delay(repeatPauseSeconds(options.understanding?.gapMode||'fixed',options.recording?options.recording.ranges[i][1]-options.recording.ranges[i][0]:Math.max(2,phrases[i].split(/\s+/).length/1.8),options.rate,options.gap)*1000,signal);}
        }
        if(!signal.aborted&&options.understanding)await finishUnderstanding({...options.understanding,silence:options.understanding.arabic===false&&options.understanding.silence},options.rate,signal,control);
    }finally{if(session===controller)session=null;}
}
async function finishUnderstanding(options:Understanding,rate:number,signal:AbortSignal,control:PlaybackGate){
    if(options.french){
        await control.wait(signal);if(signal.aborted)return;
        options.onPhase?.('french');
        await playTts(options.translation,{lang:'fr',rate,signal,gate:control});
    }
    if(!signal.aborted&&options.silence){options.onPhase?.('silence');await control.delay(repeatPauseSeconds(options.gapMode||'fixed',options.referenceDuration||options.gap,rate,options.gap)*1000,signal);}
}
