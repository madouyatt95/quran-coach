/**
 * Prayer Notification Scheduler
 * Schedules local notifications for advanced prayer windows (Daruri/Akhir Isha).
 * Does NOT interfere with the existing Web Push notifications.
 */

import type { FiqhWindows } from './windowsEngine';

// ─── Types ──────────────────────────────────────────────

interface ScheduledNotification {
    id: string;
    type: 'DARURI_SOBH' | 'DARURI_ASR' | 'AKHIR_ISHA';
    time: Date;
    title: string;
    body: string;
}

// Store active timeouts for cleanup
const activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// ─── Schedule ID (stable, dedup-safe) ────────────────────

function generateScheduleId(
    dateStr: string,
    type: string,
    lat: number,
    lng: number,
    settingsHash: string
): string {
    // Simple stable hash to prevent duplicates
    const raw = `${dateStr}|${type}|${lat.toFixed(4)}|${lng.toFixed(4)}|${settingsHash}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `prayer-notif-${Math.abs(hash).toString(36)}`;
}

/**
 * Create a simple hash from settings relevant to notification timing.
 */
export function hashSettings(settings: {
    ishaIkhtiyari: string;
    sobhIkhtiyariRule: { type: string; minutes?: number };
    asrIkhtiyariRule: { type: string; minutes?: number };
}): string {
    return `${settings.ishaIkhtiyari}-${settings.sobhIkhtiyariRule.type}${'minutes' in settings.sobhIkhtiyariRule ? settings.sobhIkhtiyariRule.minutes : ''
        }-${settings.asrIkhtiyariRule.type}${'minutes' in settings.asrIkhtiyariRule ? settings.asrIkhtiyariRule.minutes : ''
        }`;
}

// ─── Schedule Notifications ──────────────────────────────

/**
 * Schedule all eligible prayer notifications for today.
 * Cancels any previously scheduled ones first.
 */
export function schedulePrayerNotifications(
    windows: FiqhWindows,
    dateStr: string,
    lat: number,
    lng: number,
    settingsHash: string,
    options: {
        daruriSobhEnabled: boolean;
        daruriAsrEnabled: boolean;
        akhirIshaEnabled: boolean;
    }
): void {
    // Cancel all existing scheduled notifications
    cancelAllScheduled();

    const notifications: ScheduledNotification[] = [];
    const now = new Date();

    // Daruri Sobh notification
    if (options.daruriSobhEnabled && windows.sobh.startDaruri > now) {
        notifications.push({
            id: generateScheduleId(dateStr, 'DARURI_SOBH', lat, lng, settingsHash),
            type: 'DARURI_SOBH',
            time: windows.sobh.startDaruri,
            title: '⚠️ Temps Darûrî Sobh',
            body: 'Le temps de préférence (Ikhtiyârî) pour le Sobh est terminé. Temps Darûrî jusqu\'au lever du soleil.',
        });
    }

    // Daruri Asr notification
    if (options.daruriAsrEnabled && windows.asr.startDaruri > now) {
        notifications.push({
            id: generateScheduleId(dateStr, 'DARURI_ASR', lat, lng, settingsHash),
            type: 'DARURI_ASR',
            time: windows.asr.startDaruri,
            title: '⚠️ Temps Darûrî Asr',
            body: 'Le temps de préférence (Ikhtiyârî) pour l\'Asr est terminé. Temps Darûrî jusqu\'au Maghrib.',
        });
    }

    // Akhir Isha notification
    if (options.akhirIshaEnabled && windows.isha.endIkhtiyari > now) {
        notifications.push({
            id: generateScheduleId(dateStr, 'AKHIR_ISHA', lat, lng, settingsHash),
            type: 'AKHIR_ISHA',
            time: windows.isha.endIkhtiyari,
            title: '🌙 Akhir Isha',
            body: 'Le temps de préférence (Ikhtiyârî) pour l\'Isha se termine. Priez avant qu\'il ne soit trop tard !',
        });
    }

    // Schedule each notification
    for (const notif of notifications) {
        const delay = notif.time.getTime() - now.getTime();
        if (delay > 0) {
            const timeout = setTimeout(() => {
                showLocalNotification(notif.title, notif.body, notif.type);
                activeTimeouts.delete(notif.id);
            }, delay);
            activeTimeouts.set(notif.id, timeout);
        }
    }

    if (notifications.length > 0) {
        console.log(`[PrayerNotif] Scheduled ${notifications.length} notification(s)`);
    }
}

/**
 * Cancel all currently scheduled prayer notifications.
 */
export function cancelAllScheduled(): void {
    for (const [id, timeout] of activeTimeouts) {
        clearTimeout(timeout);
        activeTimeouts.delete(id);
    }
}

// ─── Local Notification ──────────────────────────────────

async function showLocalNotification(title: string, body: string, type: string): Promise<void> {
    import('@capacitor/core').then(({ Capacitor }) => {
        if (Capacitor.isNativePlatform()) {
            import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
                LocalNotifications.schedule({
                    notifications: [{
                        id: Math.floor(Math.random() * 10000) + 50000, // Safe id range
                        title,
                        body,
                        schedule: { at: new Date(Date.now() + 1000) }, // Schedule for +1s
                        sound: 'default'
                    }]
                }).catch(err => console.error('[PrayerNotif] Native schedule failed:', err));
            });
            return;
        }

        // Web PWA fallback
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        try {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        tag: `prayer-${type}-${Date.now()}`,
                    });
                });
            } else {
                new Notification(title, { body, icon: '/icon-192.png' });
            }
        } catch (err) {
            console.error('[PrayerNotif] Failed to show web notification:', err);
        }
    }).catch(() => { /* ignore */ });
}
