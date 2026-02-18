/**
 * Anonymous Analytics Service
 * Tracks user events in Supabase without authentication.
 * Each device gets a persistent UUID stored in localStorage.
 */
import { supabase } from './supabase';

const DEVICE_ID_KEY = 'qc-device-id';
const SESSION_KEY = 'qc-session-start';

// ─── Device ID ──────────────────────────────────────
function getDeviceId(): string {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

// ─── Device Info (collected once) ───────────────────
function getDeviceInfo(): Record<string, unknown> {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true;

    return {
        platform: isIOS ? 'ios' : isAndroid ? 'android' : 'desktop',
        browser: isSafari ? 'safari' : /Chrome/.test(ua) ? 'chrome' : /Firefox/.test(ua) ? 'firefox' : 'other',
        pwa: isPWA,
        screen: `${window.screen.width}x${window.screen.height}`,
        lang: navigator.language,
    };
}

// ─── Debounce: prevent spam ─────────────────────────
const recentEvents = new Map<string, number>();
const DEBOUNCE_MS = 2000; // 2 seconds between same events

function shouldTrack(event: string, page?: string): boolean {
    const key = `${event}:${page || ''}`;
    const last = recentEvents.get(key);
    const now = Date.now();
    if (last && now - last < DEBOUNCE_MS) return false;
    recentEvents.set(key, now);
    return true;
}

// ─── Core tracking function ─────────────────────────
export async function trackEvent(
    event: string,
    metadata: Record<string, unknown> = {},
    page?: string
): Promise<void> {
    if (!shouldTrack(event, page)) return;

    try {
        await supabase.from('analytics_events').insert({
            device_id: getDeviceId(),
            event,
            page: page || window.location.pathname,
            metadata,
            device_info: getDeviceInfo(),
        });
    } catch {
        // Silent fail — analytics should never break the app
    }
}

// ─── Convenience helpers ────────────────────────────
export function trackPageView(page: string): void {
    trackEvent('page_view', {}, page);
}

export function trackAppOpen(): void {
    const lastSession = localStorage.getItem(SESSION_KEY);
    const returning = !!lastSession;
    localStorage.setItem(SESSION_KEY, new Date().toISOString());
    trackEvent('app_open', { returning });
}

export function trackAudioPlay(surah: number, surahName: string, reciterName: string, source: string): void {
    trackEvent('audio_play', { surah, surahName, reciterName, source });
}

export function trackAudioResume(surah: number, position: number): void {
    trackEvent('audio_resume', { surah, position: Math.floor(position) });
}

export function trackSearch(query: string, page: string): void {
    if (query.length < 2) return; // Don't track single chars
    trackEvent('search', { query }, page);
}

export function trackNotificationToggle(enabled: boolean): void {
    trackEvent('notification_toggle', { enabled });
}

export function trackTafsirView(surah: number, ayah: number, source: string): void {
    trackEvent('tafsir_view', { surah, ayah, source });
}

export function trackShare(type: string): void {
    trackEvent('share', { type });
}
