/**
 * Notification Service for Quran Coach — Web Push Edition
 * Uses the Web Push API + Supabase backend for background notifications.
 */

import { supabase } from './supabase';
import { usePrayerStore } from '../stores/prayerStore';

let VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (Capacitor.isNativePlatform()) {
        try {
            const permStatus = await LocalNotifications.requestPermissions();
            return permStatus.display === 'granted' ? 'granted' : 'denied';
        } catch {
            return 'denied';
        }
    }

    if (!('Notification' in window)) {
        console.warn('[Push] Notifications not supported');
        return 'denied';
    }
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
    if (Capacitor.isNativePlatform()) return 'granted'; // Rely on requestPermissions dynamically instead
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
}

// ─── VAPID key helper ───────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ─── Subscribe to Push ──────────────────────────────
export async function subscribeToPush(options: {
    prayerEnabled: boolean;
    prayerMinutesBefore: number;
    prayerMinutesConfig: Record<string, number>;
    hadithEnabled: boolean;
    challengeEnabled: boolean;
    daruriSobhEnabled?: boolean;
    daruriAsrEnabled?: boolean;
    akhirIshaEnabled?: boolean;
    latitude?: number;
    longitude?: number;
    prayerSettings?: any;
}): Promise<boolean> {
    try {
        if (Capacitor.isNativePlatform()) {
            return true; // We use Local Notifications on Native
        }

        if (!VAPID_PUBLIC_KEY) {
            throw new Error('VITE_VAPID_PUBLIC_KEY manquante dans le fichier .env');
        }

        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push with VAPID key
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const subJson = subscription.toJSON();
        if (!subJson.endpoint || !subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
            console.error('[Push] Invalid subscription JSON:', subJson);
            throw new Error('Le navigateur a renvoyé un abonnement push invalide.');
        }

        // Determine timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Get coords from store if missing in options
        const prayerState = usePrayerStore.getState();
        const lat = options.latitude !== undefined ? options.latitude : prayerState.lat;
        const lng = options.longitude !== undefined ? options.longitude : prayerState.lng;

        // Upsert to Supabase
        const data: any = {
            endpoint: subJson.endpoint,
            keys_p256dh: subJson.keys.p256dh,
            keys_auth: subJson.keys.auth,
            prayer_enabled: options.prayerEnabled,
            prayer_minutes_before: options.prayerMinutesBefore,
            prayer_minutes_config: options.prayerMinutesConfig,
            hadith_enabled: options.hadithEnabled,
            challenge_enabled: options.challengeEnabled,
            daruri_sobh_enabled: options.daruriSobhEnabled ?? false,
            daruri_asr_enabled: options.daruriAsrEnabled ?? false,
            akhir_isha_enabled: options.akhirIshaEnabled ?? false,
            prayer_settings: options.prayerSettings || {},
            latitude: lat || null,
            longitude: lng || null,
            timezone,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(data, { onConflict: 'endpoint' });

        if (error) {
            console.error('[Push] Failed to save subscription:', error);
            // Propagate error message for debugging
            throw new Error(`Supabase Error: ${error.message} (${error.code})`);
        }

        console.log('[Push] Subscription saved successfully');
        return true;
    } catch (err) {
        console.error('[Push] Subscribe error:', err);
        throw err; // Re-throw to be caught by the UI
    }
}

// ─── Update preferences (without re-subscribing) ───
export async function updatePushPreferences(prefs: {
    prayerEnabled?: boolean;
    prayerMinutesBefore?: number;
    prayerMinutesConfig?: Record<string, number>;
    hadithEnabled?: boolean;
    challengeEnabled?: boolean;
    daruriSobhEnabled?: boolean;
    daruriAsrEnabled?: boolean;
    akhirIshaEnabled?: boolean;
    latitude?: number;
    longitude?: number;
    prayerSettings?: any;
}): Promise<boolean> {
    try {
        if (Capacitor.isNativePlatform()) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const { computeDay, PRAYER_NAMES_FR } = await import('./prayerEngine');
            const prayerState = usePrayerStore.getState();
            
            const lat = prefs.latitude !== undefined ? prefs.latitude : prayerState.lat;
            const lng = prefs.longitude !== undefined ? prefs.longitude : prayerState.lng;
            const pSettings = prefs.prayerSettings !== undefined ? prefs.prayerSettings : prayerState.settings;
            const pConf = prefs.prayerMinutesConfig !== undefined ? prefs.prayerMinutesConfig : {};
            
            // Annuler d'abord toutes les notifications en attente
            try {
                const pending = await LocalNotifications.getPending();
                if (pending.notifications.length > 0) {
                    await LocalNotifications.cancel({ notifications: pending.notifications });
                }
            } catch (e) { console.error('Cancel failed', e); }

            const PRAYER_NAMES_AR: Record<string, string> = {
                fajr: 'الفجر', dhuhr: 'الظهر',
                asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
            };
            
            const PRAYER_EMOJIS: Record<string, string> = {
                fajr: '🌅', dhuhr: '☀️',
                asr: '🌤️', maghrib: '🌅', isha: '🌙',
            };

            if (prefs.prayerEnabled === false || lat == null || lng == null) {
                return true;
            }

            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            const notificationsToSchedule = [];
            let notifId = 1000;

            // Préparer 7 jours de notifications
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const result = computeDay(date, lat, lng, pSettings);

                for (const p of prayers) {
                    const offsetMin = pConf[p] ?? 10; // 10 min par défaut
                    const timeStr = result.formattedTimes[p];
                    if (!timeStr) continue;

                    const [h, m] = timeStr.split(':').map(Number);
                    const prayerDate = new Date(date);
                    prayerDate.setHours(h, m, 0, 0);
                    prayerDate.setMinutes(prayerDate.getMinutes() - offsetMin);

                    // Exactly matching PWA (Supabase push) format
                    const SUNNAN_HINTS: Record<string, string> = {
                        fajr: " — 2 rak'at Sunna avant ⭐",
                        dhuhr: " — 4 Sunna avant + 2 après",
                        asr: "",
                        maghrib: " — 2 rak'at Sunna après",
                        isha: " — 2 Sunna après + Witr",
                    };

                    const nameFr = PRAYER_NAMES_FR[p as keyof typeof PRAYER_NAMES_FR] || p;
                    const nameAr = PRAYER_NAMES_AR ? PRAYER_NAMES_AR[p as keyof typeof PRAYER_NAMES_AR] : '';
                    const emoji = PRAYER_EMOJIS ? PRAYER_EMOJIS[p as keyof typeof PRAYER_EMOJIS] : '🕌';

                    const sunnaHint = SUNNAN_HINTS[p] || '';
                    const body = offsetMin === 0 
                        ? `C'est l'heure de ${nameFr} (${timeStr})${sunnaHint}` 
                        : `${nameFr} dans ~${offsetMin} minutes (${timeStr})${sunnaHint}`;

                    const title = nameAr ? `${emoji} ${nameFr} — ${nameAr}` : `${emoji} ${nameFr}`;

                    notificationsToSchedule.push({
                        id: notifId++,
                        title,
                        body,
                        schedule: { at: prayerDate },
                        sound: 'default'
                    });
                }
            }

            if (notificationsToSchedule.length > 0) {
                try {
                    await LocalNotifications.schedule({ notifications: notificationsToSchedule });
                    console.log(`[Native] Scheduled ${notificationsToSchedule.length} local prayer notifications.`);
                } catch (e) {
                    console.error('Failed to schedule local notifications', e);
                }
            }
            return true;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return false;

        // Map camelCase to snake_case for Supabase columns
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        if (prefs.prayerEnabled !== undefined) updateData.prayer_enabled = prefs.prayerEnabled;
        if (prefs.prayerMinutesBefore !== undefined) updateData.prayer_minutes_before = prefs.prayerMinutesBefore;
        if (prefs.prayerMinutesConfig !== undefined) updateData.prayer_minutes_config = prefs.prayerMinutesConfig;
        if (prefs.hadithEnabled !== undefined) updateData.hadith_enabled = prefs.hadithEnabled;
        if (prefs.challengeEnabled !== undefined) updateData.challenge_enabled = prefs.challengeEnabled;
        if (prefs.daruriSobhEnabled !== undefined) updateData.daruri_sobh_enabled = prefs.daruriSobhEnabled;
        if (prefs.daruriAsrEnabled !== undefined) updateData.daruri_asr_enabled = prefs.daruriAsrEnabled;
        if (prefs.akhirIshaEnabled !== undefined) updateData.akhir_isha_enabled = prefs.akhirIshaEnabled;
        if (prefs.prayerSettings !== undefined) updateData.prayer_settings = prefs.prayerSettings;

        // Add coords from prefs or fallback to store
        const prayerState = usePrayerStore.getState();
        const lat = prefs.latitude !== undefined ? prefs.latitude : prayerState.lat;
        const lng = prefs.longitude !== undefined ? prefs.longitude : prayerState.lng;

        if (lat != null) updateData.latitude = lat;
        if (lng != null) updateData.longitude = lng;

        const { error } = await supabase
            .from('push_subscriptions')
            .update(updateData)
            .eq('endpoint', subscription.endpoint);

        if (error) {
            console.error('[Push] Update prefs error:', error);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

// ─── Update location (for prayer times) ─────────────
export async function updatePushLocation(latitude: number, longitude: number): Promise<void> {
    try {
        if (Capacitor.isNativePlatform()) return;

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;

        await supabase
            .from('push_subscriptions')
            .update({
                latitude,
                longitude,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                updated_at: new Date().toISOString(),
            })
            .eq('endpoint', subscription.endpoint);
    } catch {
        // Silent fail
    }
}

// ─── Unsubscribe ────────────────────────────────────
export async function unsubscribeFromPush(): Promise<void> {
    try {
        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.removeAllDeliveredNotifications();
            // TODO: Unschedule all future notifications if desired
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;

        // Remove from Supabase
        await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);

        // Unsubscribe locally
        await subscription.unsubscribe();
        console.log('[Push] Unsubscribed');
    } catch (err) {
        console.error('[Push] Unsubscribe error:', err);
    }
}

// ─── Check if push is active ────────────────────────
export async function isPushSubscribed(): Promise<boolean> {
    try {
        if (Capacitor.isNativePlatform()) {
            // Check if Local Notifications permission is granted
            const req = await LocalNotifications.checkPermissions();
            return req.display === 'granted';
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return !!subscription;
    } catch {
        return false;
    }
}

// ─── Test Notification (local, instant) ─────────────
export async function sendTestNotification(): Promise<boolean> {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') return false;

    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "🔔 Quran Coach",
                        body: "Les notifications natives fonctionnent parfaitement ! بارك الله فيك",
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 1000) },
                    }
                ]
            });
            return true;
        } catch {
            return false;
        }
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🔔 Quran Coach', {
            body: 'Les notifications fonctionnent correctement ! بارك الله فيك',
            icon: '/icon-192.png',
            tag: 'test-notification',
        });
        return true;
    } catch {
        return false;
    }
}

// ─── Last visit tracking (for inactivity) ───────────
export function updateLastVisit() {
    localStorage.setItem('notif_last_visit', Date.now().toString());
}

// ─── Coach Invisible Notifications ──────────────────
// Programme des rappels de lecture locaux basés sur l'inactivité.
// Appelé par le store du coach quand les notifications sont activées.
export async function scheduleCoachNotification(options: {
    type: 'streak_danger' | 'comeback' | 'daily_reminder';
    title: string;
    body: string;
    delayMinutes: number;
}): Promise<boolean> {
    try {
        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.schedule({
                notifications: [{
                    id: 9000 + Math.floor(Math.random() * 1000),
                    title: options.title,
                    body: options.body,
                    schedule: { at: new Date(Date.now() + options.delayMinutes * 60 * 1000) },
                    sound: 'default',
                }]
            });
            return true;
        }

        // Web: use service worker notification
        if (!('serviceWorker' in navigator)) return false;
        const permission = getNotificationPermission();
        if (permission !== 'granted') return false;

        const registration = await navigator.serviceWorker.ready;

        // Schedule via setTimeout (works only while app is open)
        setTimeout(async () => {
            try {
                await registration.showNotification(options.title, {
                    body: options.body,
                    icon: '/icon-192.png',
                    tag: `coach-${options.type}`,
                    badge: '/icon-192.png',
                });
            } catch { /* silent */ }
        }, options.delayMinutes * 60 * 1000);

        return true;
    } catch {
        return false;
    }
}

// Fonction utilitaire : programme les rappels du coach
export function scheduleCoachReminders() {
    const lastVisit = localStorage.getItem('notif_last_visit');
    if (!lastVisit) return;

    const hoursSinceLastVisit = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60);

    // Si l'utilisateur est actif depuis plus de 20h sans lire aujourd'hui
    if (hoursSinceLastVisit > 20 && hoursSinceLastVisit < 48) {
        scheduleCoachNotification({
            type: 'streak_danger',
            title: '📖 Ta série est en danger !',
            body: 'Tu n\'as pas encore lu aujourd\'hui. Quelques versets suffisent pour maintenir ta série. بارك الله فيك',
            delayMinutes: 30, // Dans 30 min
        });
    }

    // Si l'utilisateur est absent depuis plus de 3 jours
    if (hoursSinceLastVisit > 72) {
        scheduleCoachNotification({
            type: 'comeback',
            title: '🤲 Tu nous manques...',
            body: 'Le Coran attend ton retour. « Et quiconque s\'en remet à Allah, Il lui suffit » (65:3)',
            delayMinutes: 60,
        });
    }
}
