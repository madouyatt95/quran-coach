/** One cancellable playback. Events from a stopped clip cannot finish its replacement. */
export function playMediaClip(audio: HTMLAudioElement, url: string, options: {
    signal: AbortSignal; rate?: number; start?: number; end?: number;
}): Promise<boolean> {
    const {signal, start = 0, end} = options;
    if (signal.aborted) return Promise.resolve(false);
    return new Promise(resolve => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const finish = (success: boolean) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            signal.removeEventListener('abort', abort);
            audio.removeEventListener('ended', ended);
            audio.removeEventListener('error', failed);
            audio.removeEventListener('timeupdate', timeupdate);
            audio.removeEventListener('loadedmetadata', seek);
            audio.pause();
            resolve(success);
        };
        const abort = () => finish(false);
        const ended = () => finish(true);
        const failed = () => finish(false);
        const timeupdate = () => { if (end !== undefined && audio.currentTime >= end) finish(true); };
        const seek = () => { try { audio.currentTime = start; } catch { /* metadata not ready */ } };
        signal.addEventListener('abort', abort, {once:true});
        audio.addEventListener('ended', ended);
        audio.addEventListener('error', failed);
        audio.addEventListener('timeupdate', timeupdate);
        audio.addEventListener('loadedmetadata', seek, {once:true});
        try {
            audio.src = url;
            audio.playbackRate = options.rate ?? 1;
            seek();
            timer = setTimeout(failed, 15000);
            void audio.play().then(() => { clearTimeout(timer); }).catch(failed);
        } catch { failed(); }
    });
}

export function playbackPause(ms: number, signal: AbortSignal): Promise<void> {
    if (signal.aborted) return Promise.resolve();
    return new Promise(resolve => {
        const done = () => { clearTimeout(timer); signal.removeEventListener('abort', done); resolve(); };
        const timer = setTimeout(done, ms);
        signal.addEventListener('abort', done, {once:true});
    });
}
