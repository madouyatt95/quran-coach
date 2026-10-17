export function isSessionRoute(path: string): boolean {
    // A passive Mushaf page is safe to refresh on explicit user action: its page,
    // mode and reading position are persisted. Active audio/live-follow is guarded
    // separately by UpdateBanner, so those sessions remain protected.
    return ['/academy/arabic','/fahm/lesson','/fahm/session','/fahm/surah','/fahm/review','/listen/experience','/hifdh','/test-memorization','/voice-search','/adhkar','/passage'].some(route => path === route || path.startsWith(route + '/'));
}

/** Refresh safe screens promptly while preserving active sessions. */
export function watchAppUpdates(container: ServiceWorkerContainer, options: {
    isProtected: () => boolean;
    onAvailable: (available: boolean) => void;
    reload: () => void;
}) {
    let disposed = false, refreshing = false, takeover = false, activationRequested = false;
    let waiting: ServiceWorker | null = null;
    let registration: ServiceWorkerRegistration | null = null;
    let interval: ReturnType<typeof setInterval> | undefined;
    const workers = new Map<ServiceWorker, () => void>();
    const hadController = !!container.controller;
    const available = () => options.onAvailable(!!waiting || takeover);
    const controllerChange = () => {
        if (disposed || !hadController) return;
        takeover = true;
        available();
        checkIdle();
    };
    const checkIdle = () => {
        if (disposed || refreshing || options.isProtected()) return;
        if (takeover) {
            refreshing = true;
            options.reload();
        } else if (waiting && !activationRequested) {
            activationRequested = true;
            waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    };
    const trackWorker = (worker: ServiceWorker | null) => {
        if (!worker || workers.has(worker)) return;
        const change = () => {
            if (disposed) return;
            if (worker.state === 'installed' && container.controller) { waiting = worker; activationRequested = false; available(); checkIdle(); }
            if (worker.state === 'redundant' && waiting === worker) { waiting = null; activationRequested = false; available(); }
        };
        workers.set(worker, change);
        worker.addEventListener('statechange', change);
        change();
    };
    const updateFound = () => trackWorker(registration?.installing ?? null);
    const checkForUpdates = () => { if (!disposed && (typeof document === 'undefined' || document.visibilityState === 'visible')) void registration?.update().catch(() => {}); };
    container.addEventListener('controllerchange', controllerChange);
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', checkForUpdates);
    void container.getRegistration().then(reg => {
        if (disposed || !reg) return;
        registration = reg;
        waiting = reg.waiting;
        available();
        checkIdle();
        reg.addEventListener('updatefound', updateFound);
        trackWorker(reg.installing);
        void reg.update().catch(() => {});
        interval = setInterval(checkForUpdates, 60_000);
    }).catch(() => { /* Offline: try again on the next app opening. */ });
    return {
        checkIdle,
        apply: () => {
            checkIdle();
        },
        dispose: () => {
            disposed = true;
            clearInterval(interval);
            container.removeEventListener('controllerchange', controllerChange);
            if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', checkForUpdates);
            registration?.removeEventListener('updatefound', updateFound);
            workers.forEach((callback,worker) => worker.removeEventListener('statechange',callback));
            workers.clear();
        },
    };
}
