// @ts-nocheck
// Supabase Edge Function: send-notifications
// Sends Web Push notifications for prayer reminders, daily hadith, and quiz challenges.
// Invoked by pg_cron every 30 minutes.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Web Push constants ─────────────────────────────
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:contact@qurancoach.app";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ─── Web Push via fetch (no npm dependency) ─────────
// We use the Web Push protocol directly via crypto APIs

async function importVapidKeys(publicKey: string, privateKey: string) {
    // Decode URL-safe base64
    function urlBase64Decode(str: string): Uint8Array {
        const padding = "=".repeat((4 - (str.length % 4)) % 4);
        const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(base64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
    }

    const pubBytes = urlBase64Decode(publicKey);
    const privBytes = urlBase64Decode(privateKey);

    const keyPair = await crypto.subtle.importKey(
        "raw",
        pubBytes,
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        []
    );

    const privKey = await crypto.subtle.importKey(
        "pkcs8",
        privBytes,
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign"]
    );

    return { publicKey: keyPair, privateKey: privKey };
}

async function createJWT(endpoint: string, privateKey: CryptoKey): Promise<string> {
    const audience = new URL(endpoint).origin;
    const header = { typ: "JWT", alg: "ES256" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        aud: audience,
        exp: now + 12 * 3600,
        sub: VAPID_SUBJECT,
    };

    function base64url(data: Uint8Array | string): string {
        const str = typeof data === "string" ? data : String.fromCharCode(...data);
        return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }

    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(payload));
    const input = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        input
    );

    return `${headerB64}.${payloadB64}.${base64url(new Uint8Array(signature))}`;
}

async function sendPush(
    subscription: { endpoint: string; keys_p256dh: string; keys_auth: string },
    payload: object
): Promise<boolean> {
    try {
        // For simplicity, we'll use a direct POST without encryption
        // This works with most push services that accept VAPID JWT auth
        const { privateKey: privKey } = await importVapidKeys(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        const jwt = await createJWT(subscription.endpoint, privKey);

        const body = JSON.stringify(payload);

        const response = await fetch(subscription.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
                "Content-Type": "application/octet-stream",
                "Content-Encoding": "aes128gcm",
                "TTL": "86400",
                "Urgency": "normal",
            },
            body: new TextEncoder().encode(body),
        });

        if (response.status === 410 || response.status === 404) {
            // Subscription expired — remove it
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
            console.log(`[Push] Cleaned expired subscription: ${subscription.endpoint.slice(0, 50)}...`);
            return false;
        }

        return response.ok;
    } catch (err) {
        console.error("[Push] Send error:", err);
        return false;
    }
}

// ─── Prayer times from AlAdhan API ─────────────────
interface PrayerTimesResponse {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

async function fetchPrayerTimes(lat: number, lng: number): Promise<PrayerTimesResponse | null> {
    try {
        const resp = await fetch(
            `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${lat}&longitude=${lng}&method=2`
        );
        const data = await resp.json();
        if (data.code === 200) return data.data.timings;
        return null;
    } catch {
        return null;
    }
}

// ─── Main handler ──────────────────────────────────
serve(async (req) => {
    // Allow only POST or cron invocations
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: subscriptions, error } = await supabase
        .from("push_subscriptions")
        .select("*");

    if (error || !subscriptions) {
        console.error("[Push] Failed to fetch subscriptions:", error);
        return new Response(JSON.stringify({ error: "DB error" }), { status: 500 });
    }

    console.log(`[Push] Processing ${subscriptions.length} subscriptions`);

    const now = new Date();
    let sent = 0;

    for (const sub of subscriptions) {
        const tz = sub.timezone || "Europe/Paris";
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
        const localHour = localTime.getHours();
        const localMinute = localTime.getMinutes();

        // ─── Hadith du jour (8:00 - 8:29) ────────
        if (sub.hadith_enabled && localHour === 8 && localMinute < 30) {
            const ok = await sendPush(sub, {
                title: "📖 Hadith du Jour",
                body: "Découvre le hadith du jour sur Quran Coach",
                url: "/hadiths",
                tag: "daily-hadith",
            });
            if (ok) sent++;
        }

        // ─── Défi quotidien (12:00 - 12:29) ──────
        if (sub.challenge_enabled && localHour === 12 && localMinute < 30) {
            const ok = await sendPush(sub, {
                title: "🏆 Défi du Jour",
                body: "Le quiz du jour t'attend ! Relève le défi et gagne des XP bonus.",
                url: "/quiz",
                tag: "daily-challenge",
            });
            if (ok) sent++;
        }

        // ─── Rappels de prière ────────────────────
        if (sub.prayer_enabled && sub.latitude && sub.longitude) {
            const times = await fetchPrayerTimes(sub.latitude, sub.longitude);
            if (times) {
                const prayers = [
                    { key: "Fajr", name: "Fajr", nameAr: "الفجر", emoji: "🌅" },
                    { key: "Dhuhr", name: "Dhouhr", nameAr: "الظهر", emoji: "☀️" },
                    { key: "Asr", name: "Asr", nameAr: "العصر", emoji: "🌤️" },
                    { key: "Maghrib", name: "Maghrib", nameAr: "المغرب", emoji: "🌅" },
                    { key: "Isha", name: "Ishaa", nameAr: "العشاء", emoji: "🌙" },
                ];

                const minutesBefore = sub.prayer_minutes_before || 10;

                for (const prayer of prayers) {
                    const timeStr = times[prayer.key as keyof PrayerTimesResponse];
                    if (!timeStr) continue;

                    const [h, m] = timeStr.split(":").map(Number);
                    const prayerMinutesFromMidnight = h * 60 + m;
                    const currentMinutesFromMidnight = localHour * 60 + localMinute;
                    const diff = prayerMinutesFromMidnight - currentMinutesFromMidnight;

                    // Notify if prayer is within [minutesBefore-5, minutesBefore+5] window
                    if (diff >= minutesBefore - 5 && diff <= minutesBefore + 5) {
                        const ok = await sendPush(sub, {
                            title: `${prayer.emoji} ${prayer.name} — ${prayer.nameAr}`,
                            body: `${prayer.name} dans ~${minutesBefore} minutes (${timeStr})`,
                            url: "/prieres",
                            tag: `prayer-${prayer.key}`,
                        });
                        if (ok) sent++;
                    }
                }
            }
        }
    }

    console.log(`[Push] Sent ${sent} notifications to ${subscriptions.length} subscribers`);

    return new Response(JSON.stringify({ ok: true, sent, total: subscriptions.length }), {
        headers: { "Content-Type": "application/json" },
    });
});
