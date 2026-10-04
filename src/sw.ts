/// <reference lib="webworker" />
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { createPartialResponse } from 'workbox-range-requests';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// ─── Workbox Precaching ─────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//, /^\/tilawa\//] }));

// Optional packs: only explicitly downloaded files are stored in these caches.
registerRoute(({url}) => url.origin === self.location.origin && url.pathname.startsWith('/tilawa/v1/'), async ({request}) => (await (await caches.open('quran-coach-tilawa-v1')).match(request)) || fetch(request));
registerRoute(({url}) => url.origin === 'https://api.alquran.cloud', async ({request,event}) => {
    const packed = await (await caches.open('quran-coach-content-v1')).match(request);
    if (packed) return packed;
    return new CacheFirst({cacheName:'quran-api-cache',plugins:[new ExpirationPlugin({maxEntries:500,maxAgeSeconds:365*24*60*60}),new CacheableResponsePlugin({statuses:[200]})]}).handle({request,event});
});
registerRoute(({url}) => /\.(mp3|wav)$/i.test(url.pathname), async ({request}) => {
    const packed = await (await caches.open('quran-coach-audio-v1')).match(request.url);
    if (!packed) return fetch(request);
    return request.headers.has('range') ? createPartialResponse(request, packed) : packed;
});

registerRoute(
    ({ url }) => url.origin === 'https://api.quran.com',
    new CacheFirst({
        cacheName: 'qurancom-api-cache',
        plugins: [
            new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 365 * 24 * 60 * 60 }),
            new CacheableResponsePlugin({ statuses: [200] }),
        ],
    })
);

registerRoute(
    ({ url }) => url.pathname.endsWith('/reciterFingerprints.json'),
    new CacheFirst({
        cacheName: 'fingerprint-db-cache',
        plugins: [
            new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 365 * 24 * 60 * 60 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);

// ─── Push Notifications ─────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data: { title?: string; body?: string; icon?: string; url?: string; tag?: string };
    try {
        data = event.data.json();
    } catch {
        data = { title: 'Quran Coach', body: event.data.text() };
    }

    const title = data.title || 'Quran Coach';
    const options: NotificationOptions = {
        body: data.body || '',
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || 'default',
        data: { url: data.url || '/' },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ─── Notification Click → Open app ──────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Validate URL to prevent open redirect (only allow internal paths)
    const rawUrl = (event.notification.data?.url as string) || '/';
    const targetUrl = rawUrl.startsWith('/') || rawUrl.startsWith(self.registration.scope)
        ? rawUrl : '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            return self.clients.openWindow(targetUrl);
        })
    );
});

// Updates stay waiting until a client explicitly requests activation.

// ─── Activate: claim clients immediately ────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// ─── Message handler: allow app to trigger skipWaiting ──
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
