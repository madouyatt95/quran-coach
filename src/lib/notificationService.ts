/**
 * Notification Service for Quran Coach
 * Handles local scheduled notifications for prayer reminders, daily hadith, and challenges.
 * No backend required — fully client-side using Notification API + setTimeout.
 */

// ─── Types ──────────────────────────────────────────────
export interface PrayerTimesData {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

interface ScheduledTimer {
    id: ReturnType<typeof setTimeout>;
    type: string;
}

// Active timers for cancellation
let activeTimers: ScheduledTimer[] = [];

// ─── Permission ──────────────────────────────────────────
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('[Notif] Notifications not supported in this browser');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        return 'denied';
    }

    const result = await Notification.requestPermission();
    return result;
}

export function getNotificationPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
}

// ─── Show Notification ──────────────────────────────────
async function showNotification(title: string, body: string, tag: string, url?: string) {
    if (Notification.permission !== 'granted') return;

    const options: NotificationOptions = {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag, // prevents duplicate notifs
        data: { url: url || '/' },
    };

    // Attempt via Service Worker (works in background)
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, options);
            return;
        } catch (e) {
            console.warn('[Notif] SW notification failed, falling back to API', e);
        }
    }

    // Fallback: direct Notification API (only works in foreground)
    new Notification(title, options);
}

// ─── Prayer Reminders ──────────────────────────────────
export function schedulePrayerReminders(
    prayerTimes: PrayerTimesData,
    minutesBefore: number = 10
) {
    // Cancel previous prayer timers
    cancelTimersByType('prayer');

    const prayers = [
        { key: 'Fajr', name: 'Fajr', nameAr: 'الفجر', emoji: '🌅' },
        { key: 'Dhuhr', name: 'Dhouhr', nameAr: 'الظهر', emoji: '☀️' },
        { key: 'Asr', name: 'Asr', nameAr: 'العصر', emoji: '🌤️' },
        { key: 'Maghrib', name: 'Maghrib', nameAr: 'المغرب', emoji: '🌅' },
        { key: 'Isha', name: 'Ishaa', nameAr: 'العشاء', emoji: '🌙' },
    ];

    const now = new Date();

    for (const prayer of prayers) {
        const timeStr = prayerTimes[prayer.key as keyof PrayerTimesData];
        if (!timeStr) continue;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        // Schedule `minutesBefore` minutes before the prayer
        const notifDate = new Date(prayerDate.getTime() - minutesBefore * 60 * 1000);

        const delay = notifDate.getTime() - now.getTime();
        if (delay <= 0) continue; // Past time, skip

        const timerId = setTimeout(() => {
            showNotification(
                `${prayer.emoji} ${prayer.name} — ${prayer.nameAr}`,
                `${prayer.name} dans ${minutesBefore} minutes (${timeStr})`,
                `prayer-${prayer.key}`,
                '/prieres'
            );
        }, delay);

        activeTimers.push({ id: timerId, type: 'prayer' });
    }

    console.log(`[Notif] ${activeTimers.filter(t => t.type === 'prayer').length} rappels de prière programmés`);
}

// ─── Daily Hadith ───────────────────────────────────────
export function scheduleDailyHadith() {
    cancelTimersByType('hadith');

    const now = new Date();
    const target = new Date();
    target.setHours(8, 0, 0, 0); // 8:00 AM

    // If 8 AM already passed, schedule for tomorrow
    if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timerId = setTimeout(async () => {
        // Dynamically import to avoid circular imports
        try {
            const { getHadithOfDay } = await import('./hadithEngine');
            const hadith = getHadithOfDay();
            showNotification(
                '📖 Hadith du Jour',
                hadith?.textFr?.substring(0, 100) || 'Découvre le hadith du jour sur Quran Coach',
                'daily-hadith',
                '/hadiths'
            );
        } catch {
            showNotification(
                '📖 Hadith du Jour',
                'Découvre le hadith du jour sur Quran Coach',
                'daily-hadith',
                '/hadiths'
            );
        }

        // Reschedule for next day
        scheduleDailyHadith();
    }, delay);

    activeTimers.push({ id: timerId, type: 'hadith' });
    console.log(`[Notif] Hadith du jour programmé dans ${Math.round(delay / 60000)} min`);
}

// ─── Daily Challenge ────────────────────────────────────
export function scheduleDailyChallenge() {
    cancelTimersByType('challenge');

    const now = new Date();
    const target = new Date();
    target.setHours(12, 0, 0, 0); // Noon

    if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timerId = setTimeout(() => {
        showNotification(
            '🏆 Défi du Jour',
            'Le quiz du jour t\'attend ! Relève le défi et gagne des XP bonus.',
            'daily-challenge',
            '/quiz'
        );
        scheduleDailyChallenge(); // Reschedule
    }, delay);

    activeTimers.push({ id: timerId, type: 'challenge' });
    console.log(`[Notif] Défi quotidien programmé dans ${Math.round(delay / 60000)} min`);
}

// ─── Inactivity Reminder ────────────────────────────────
export function checkInactivityReminder() {
    const lastVisit = localStorage.getItem('notif_last_visit');
    if (!lastVisit) return;

    const daysSince = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
    if (daysSince >= 3) {
        // Schedule in 2 seconds (give time for SW to be ready)
        setTimeout(() => {
            showNotification(
                '📚 Tu nous manques !',
                'Continue ta lecture du Coran. Chaque verset compte.',
                'inactivity-reminder',
                '/read'
            );
        }, 2000);
    }
}

export function updateLastVisit() {
    localStorage.setItem('notif_last_visit', Date.now().toString());
}

// ─── Test Notification ──────────────────────────────────
export async function sendTestNotification() {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
        return false;
    }

    await showNotification(
        '🔔 Quran Coach',
        'Les notifications fonctionnent correctement ! بارك الله فيك',
        'test-notification'
    );
    return true;
}

// ─── Cancel / Cleanup ───────────────────────────────────
function cancelTimersByType(type: string) {
    const toCancel = activeTimers.filter(t => t.type === type);
    toCancel.forEach(t => clearTimeout(t.id));
    activeTimers = activeTimers.filter(t => t.type !== type);
}

export function cancelAllNotifications() {
    activeTimers.forEach(t => clearTimeout(t.id));
    activeTimers = [];
    console.log('[Notif] Toutes les notifications annulées');
}

// ─── Init (called from App.tsx on mount) ────────────────
export function initNotifications(opts: {
    prayerEnabled: boolean;
    hadithEnabled: boolean;
    challengeEnabled: boolean;
    prayerMinutesBefore: number;
}) {
    if (Notification.permission !== 'granted') return;

    if (opts.hadithEnabled) scheduleDailyHadith();
    if (opts.challengeEnabled) scheduleDailyChallenge();

    // Prayer reminders are scheduled separately when times are fetched
    console.log('[Notif] Système de notifications initialisé');
}
