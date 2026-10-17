/** Pause is distinct from cancellation, including gaps between clips. */
export class PlaybackGate {
    paused = false;
    private listeners = new Set<() => void>();
    subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
    setPaused(value: boolean) { this.paused = value; this.listeners.forEach(fn => fn()); }
    wait(signal: AbortSignal): Promise<void> {
        if (!this.paused || signal.aborted) return Promise.resolve();
        return new Promise(resolve => {
            const done = () => { if (!this.paused || signal.aborted) { off(); signal.removeEventListener('abort', done); resolve(); } };
            const off = this.subscribe(done); signal.addEventListener('abort', done, {once:true});
        });
    }
    delay(ms: number, signal: AbortSignal): Promise<void> {
        if (signal.aborted) return Promise.resolve();
        return new Promise(resolve => {
            let remaining = ms, started = 0, timer: ReturnType<typeof setTimeout> | undefined;
            const done = () => { clearTimeout(timer); off(); signal.removeEventListener('abort', done); resolve(); };
            const sync = () => {
                if (timer !== undefined) { clearTimeout(timer); remaining -= Date.now() - started; timer = undefined; }
                if (!this.paused) { started = Date.now(); timer = setTimeout(done, Math.max(0, remaining)); }
            };
            const off = this.subscribe(sync); signal.addEventListener('abort', done, {once:true}); sync();
        });
    }
}
