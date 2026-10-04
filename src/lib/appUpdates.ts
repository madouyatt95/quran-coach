export function isSessionRoute(path: string): boolean {
    return ['/read','/hifdh','/test-memorization','/voice-search','/adhkar','/passage'].some(route => path === route || path.startsWith(route + '/'));
}

/** The worker waits for an explicit request; a takeover from another tab never interrupts this session. */
export function watchAppUpdates(container: ServiceWorkerContainer, options: {
    isProtected: () => boolean;
    onAvailable: (available: boolean) => void;
    reload: () => void;
}) {
    let disposed = false, refreshing = false, takeover = false;
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
        if (disposed || refreshing || !takeover || options.isProtected()) return;
        refreshing = true;
        options.reload();
    };
    const trackWorker = (worker: ServiceWorker | null) => {
        if (!worker || workers.has(worker)) return;
        const change = () => {
            if (disposed) return;
            if (worker.state === 'installed' && container.controller) { waiting = worker; available(); }
            if (worker.state === 'redundant' && waiting === worker) {waiting = null;available();}
        };
        workers.set(worker, change);
        worker.addEventListener('statechange', change);
        change();
    };
    const updateFound = () => trackWorker(registration?.installing ?? null);
    container.addEventListener('controllerchange', controllerChange);
    void container.getRegistration().then(reg => {
        if (disposed || !reg) return;
        registration = reg;
        waiting = reg.waiting;
        available();
        reg.addEventListener('updatefound', updateFound);
        trackWorker(reg.installing);
        interval = setInterval(() => { void reg.update().catch(() => {}); }, 60_000);
    }).catch(() => { /* Offline: try again on the next app opening. */ });
    return {
        checkIdle,
        apply: () => {
            if (disposed || options.isProtected()) return;
            if (takeover) checkIdle();
            else waiting?.postMessage({type:'SKIP_WAITING'});
        },
        dispose: () => {
            disposed = true;
            clearInterval(interval);
            container.removeEventListener('controllerchange', controllerChange);
            registration?.removeEventListener('updatefound', updateFound);
            workers.forEach((callback,worker) => worker.removeEventListener('statechange',callback));
            workers.clear();
        },
    };
}
