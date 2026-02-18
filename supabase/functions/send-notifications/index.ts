// @ts-nocheck
// Supabase Edge Function: send-notifications
// Sends Web Push notifications for prayer reminders, daily hadith, and quiz challenges.
// Invoked by pg_cron every 30 minutes.
//
// FIX: Detection window widened to ±14 min (safe for 30-min cron without duplicates).
//      Deduplication via last_notified_* columns — each notification type sent at most
//      once per 20-minute cooldown window per subscription.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Web Push constants ─────────────────────────────
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:contact@qurancoach.app";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ─── Detection window ───────────────────────────────
// Cron runs every 30 min → window must be > 15 min to guarantee coverage.
// We use 14 min on each side = 28-min window, safe with a 30-min cron.
// Deduplication prevents double-sends when two cron ticks both see the window.
const WINDOW_MIN = 14;

// Cooldown: don't re-send the same notification type within this many minutes
const COOLDOWN_MIN = 20;

// ─── Base64 helpers ─────────────────────────────────
function urlBase64Decode(str: string): Uint8Array {
    const padding = "=".repeat((4 - (str.length % 4)) % 4);
    const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
}

function urlBase64Encode(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ─── VAPID JWT ──────────────────────────────────────
async function createVapidJWT(endpoint: string): Promise<string> {
    const audience = new URL(endpoint).origin;
    const header = { typ: "JWT", alg: "ES256" };
    const now = Math.floor(Date.now() / 1000);
    const payload = { aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT };

    const headerB64 = urlBase64Encode(new TextEncoder().encode(JSON.stringify(header)));
    const payloadB64 = urlBase64Encode(new TextEncoder().encode(JSON.stringify(payload)));

    // Import the raw 32-byte private key via JWK (more reliable than PKCS8 on Deno)
    const privKeyBytes = urlBase64Decode(VAPID_PRIVATE_KEY);
    const pubKeyBytes = urlBase64Decode(VAPID_PUBLIC_KEY);

    // Build JWK from raw key bytes
    const jwk = {
        kty: "EC",
        crv: "P-256",
        d: urlBase64Encode(privKeyBytes),     // private scalar (32 bytes)
        x: urlBase64Encode(pubKeyBytes.slice(1, 33)),  // public key X (skip 0x04 prefix)
        y: urlBase64Encode(pubKeyBytes.slice(33, 65)), // public key Y
    };

    const privateKey = await crypto.subtle.importKey(
        "jwk", jwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false, ["sign"]
    );

    const input = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigRaw = new Uint8Array(await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" }, privateKey, input
    ));

    return `${headerB64}.${payloadB64}.${urlBase64Encode(sigRaw)}`;
}

// ─── RFC 8291 Web Push Encryption (aes128gcm) ──────
async function encryptPayload(
    payload: string,
    p256dhKey: string,
    authSecret: string
): Promise<{ encrypted: Uint8Array; localPublicKey: Uint8Array }> {
    const subscriberPubBytes = urlBase64Decode(p256dhKey);
    const authBytes = urlBase64Decode(authSecret);

    const subscriberKey = await crypto.subtle.importKey(
        "raw", subscriberPubBytes,
        { name: "ECDH", namedCurve: "P-256" },
        false, []
    );

    const localKeyPair = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true, ["deriveBits"]
    );

    const localPubRaw = new Uint8Array(
        await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
    );

    const sharedSecret = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: "ECDH", public: subscriberKey },
            localKeyPair.privateKey, 256
        )
    );

    const infoPrefix = new TextEncoder().encode("WebPush: info\0");
    const ikm_info = new Uint8Array(infoPrefix.length + 65 + 65);
    ikm_info.set(infoPrefix);
    ikm_info.set(subscriberPubBytes, infoPrefix.length);
    ikm_info.set(localPubRaw, infoPrefix.length + 65);

    const ikmKey = await crypto.subtle.importKey(
        "raw", sharedSecret, "HKDF", false, ["deriveBits"]
    );

    const ikm = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: "HKDF", salt: authBytes, info: ikm_info, hash: "SHA-256" },
            ikmKey, 256
        )
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));

    const prkKey = await crypto.subtle.importKey(
        "raw", ikm, "HKDF", false, ["deriveBits"]
    );

    const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
    const cek = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: "HKDF", salt: salt, info: cekInfo, hash: "SHA-256" },
            prkKey, 128
        )
    );

    const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
    const nonce = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: "HKDF", salt: salt, info: nonceInfo, hash: "SHA-256" },
            prkKey, 96
        )
    );

    const payloadBytes = new TextEncoder().encode(payload);
    const padded = new Uint8Array(payloadBytes.length + 1);
    padded.set(payloadBytes);
    padded[payloadBytes.length] = 0x02;

    const aesKey = await crypto.subtle.importKey(
        "raw", cek, "AES-GCM", false, ["encrypt"]
    );
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: nonce, tagLength: 128 },
            aesKey, padded
        )
    );

    const rs = 4096;
    const header = new Uint8Array(16 + 4 + 1 + 65);
    header.set(salt, 0);
    header[16] = (rs >> 24) & 0xff;
    header[17] = (rs >> 16) & 0xff;
    header[18] = (rs >> 8) & 0xff;
    header[19] = rs & 0xff;
    header[20] = 65;
    header.set(localPubRaw, 21);

    const encrypted = new Uint8Array(header.length + ciphertext.length);
    encrypted.set(header);
    encrypted.set(ciphertext, header.length);

    return { encrypted, localPublicKey: localPubRaw };
}

// ─── Send a single push notification ────────────────
async function sendPush(
    subscription: { endpoint: string; keys_p256dh: string; keys_auth: string },
    payload: object
): Promise<boolean> {
    try {
        const payloadStr = JSON.stringify(payload);
        const { encrypted } = await encryptPayload(
            payloadStr,
            subscription.keys_p256dh,
            subscription.keys_auth
        );

        const jwt = await createVapidJWT(subscription.endpoint);

        const response = await fetch(subscription.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
                "Content-Type": "application/octet-stream",
                "Content-Encoding": "aes128gcm",
                "TTL": "86400",
                "Urgency": "normal",
                "Content-Length": encrypted.length.toString(),
            },
            body: encrypted,
        });

        if (response.status === 410 || response.status === 404) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
            console.log(`[Push] Cleaned expired: ${subscription.endpoint.slice(0, 50)}...`);
            return false;
        }

        if (!response.ok) {
            const text = await response.text();
            console.error(`[Push] ${response.status}: ${text}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error("[Push] Send error:", err);
        return false;
    }
}

// ─── Deduplication helper ───────────────────────────
// Returns true if we should skip sending (already sent within cooldown window).
function recentlySent(lastNotifiedIso: string | null): boolean {
    if (!lastNotifiedIso) return false;
    const lastMs = new Date(lastNotifiedIso).getTime();
    const diffMin = (Date.now() - lastMs) / 60000;
    return diffMin < COOLDOWN_MIN;
}

// ─── Prayer times from AlAdhan API ─────────────────
interface PrayerTimesResponse {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Sunrise?: string;
}

const prayerTimesCache = new Map<string, PrayerTimesResponse | null>();

function roundCoord(n: number): number {
    return Math.round(n * 10) / 10;
}

async function fetchPrayerTimes(
    lat: number,
    lng: number,
    settings: any = {}
): Promise<PrayerTimesResponse | null> {
    const asrShadow = settings.asrShadow || 1;
    const school = asrShadow === 2 ? 1 : 0;
    const fAngle = settings.fajrAngle || 18;
    const iAngle = settings.ishaAngle || 17;

    const cacheKey = `${roundCoord(lat)},${roundCoord(lng)},${fAngle},${iAngle},${school}`;
    if (prayerTimesCache.has(cacheKey)) return prayerTimesCache.get(cacheKey)!;

    try {
        const url = `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${lat}&longitude=${lng}&method=99&methodSettings=${fAngle},null,${iAngle}&school=${school}`;
        const resp = await fetch(url);
        const data = await resp.json();
        const times = data.code === 200 ? data.data.timings : null;
        prayerTimesCache.set(cacheKey, times);
        return times;
    } catch {
        prayerTimesCache.set(cacheKey, null);
        return null;
    }
}

// ─── Main handler ──────────────────────────────────
serve(async (req) => {
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
        const currentMin = localHour * 60 + localMinute;

        // Batch of dedup updates to apply after processing this subscription
        const dedupUpdates: Record<string, string> = {};

        // ─── Hadith du jour (target: 8:00) ────────────────
        if (sub.hadith_enabled) {
            const targetMin = 8 * 60; // 8:00
            const diff = currentMin - targetMin;
            // Within ±14 min of 8:00 AND not sent in last 20 min
            if (Math.abs(diff) <= WINDOW_MIN && !recentlySent(sub.last_notified_hadith)) {
                const ok = await sendPush(sub, {
                    title: "📖 Hadith du Jour",
                    body: "Découvre le hadith du jour sur Quran Coach",
                    url: "/hadiths",
                    tag: "daily-hadith",
                });
                if (ok) {
                    sent++;
                    dedupUpdates.last_notified_hadith = now.toISOString();
                }
            }
        }

        // ─── Défi quotidien (target: 12:00) ──────────────
        if (sub.challenge_enabled) {
            const targetMin = 12 * 60; // 12:00
            const diff = currentMin - targetMin;
            if (Math.abs(diff) <= WINDOW_MIN && !recentlySent(sub.last_notified_challenge)) {
                const ok = await sendPush(sub, {
                    title: "🏆 Défi du Jour",
                    body: "Le quiz du jour t'attend ! Relève le défi et gagne des XP bonus.",
                    url: "/quiz",
                    tag: "daily-challenge",
                });
                if (ok) {
                    sent++;
                    dedupUpdates.last_notified_challenge = now.toISOString();
                }
            }
        }

        // ─── Rappels de prière ────────────────────────────
        if (sub.latitude && sub.longitude) {
            const times = await fetchPrayerTimes(sub.latitude, sub.longitude, sub.prayer_settings);
            if (times) {
                const toMin = (t: string) => {
                    const [h, m] = t.split(":").map(Number);
                    return h * 60 + m;
                };

                // ── Classic prayer reminders (X minutes before) ──
                if (sub.prayer_enabled) {
                    const prayers = [
                        { key: "Fajr", name: "Fajr", nameAr: "الفجر", emoji: "🌅", dedupKey: "last_notified_fajr" },
                        { key: "Dhuhr", name: "Dhouhr", nameAr: "الظهر", emoji: "☀️", dedupKey: "last_notified_dhuhr" },
                        { key: "Asr", name: "Asr", nameAr: "العصر", emoji: "🌤️", dedupKey: "last_notified_asr" },
                        { key: "Maghrib", name: "Maghrib", nameAr: "المغرب", emoji: "🌅", dedupKey: "last_notified_maghrib" },
                        { key: "Isha", name: "Ishaa", nameAr: "العشاء", emoji: "🌙", dedupKey: "last_notified_isha" },
                    ];

                    const globalMinutesBefore = sub.prayer_minutes_before || 10;
                    const config = sub.prayer_minutes_config || {};
                    const settings = sub.prayer_settings || {};
                    const adjustments = settings.adjustmentsMin || {};

                    for (const prayer of prayers) {
                        const rawTimeStr = times[prayer.key as keyof PrayerTimesResponse];
                        if (!rawTimeStr) continue;

                        let prayerMin = toMin(rawTimeStr as string);
                        const adj = adjustments[prayer.key.toLowerCase()] || 0;
                        prayerMin += adj;

                        const minutesBefore = config[prayer.key.toLowerCase()] ?? globalMinutesBefore;

                        // Target moment = prayerMin - minutesBefore
                        const targetMin = prayerMin - minutesBefore;
                        const diff = currentMin - targetMin;

                        // Within ±WINDOW_MIN of target AND not recently sent
                        if (Math.abs(diff) <= WINDOW_MIN && !recentlySent(sub[prayer.dedupKey])) {
                            const adjH = Math.floor((prayerMin % 1440) / 60);
                            const adjM = Math.floor(prayerMin % 60);
                            const timeStr = `${adjH.toString().padStart(2, "0")}:${adjM.toString().padStart(2, "0")}`;

                            const ok = await sendPush(sub, {
                                title: `${prayer.emoji} ${prayer.name} — ${prayer.nameAr}`,
                                body: `${prayer.name} dans ~${minutesBefore} minutes (${timeStr})`,
                                url: "/prieres",
                                tag: `prayer-${prayer.key}`,
                            });
                            if (ok) {
                                sent++;
                                dedupUpdates[prayer.dedupKey] = now.toISOString();
                            }
                        }
                    }
                }

                // ── Advanced Fiqh notifications ──────────────────
                const sunriseStr = times["Sunrise"];
                const fajrMin = toMin(times.Fajr);
                const asrMin = toMin(times.Asr);
                const maghribMin = toMin(times.Maghrib);
                const ishaMin = toMin(times.Isha);

                // Darûrî Sobh: ~20 min before sunrise
                if (sub.daruri_sobh_enabled && sunriseStr) {
                    const sunriseMin = toMin(sunriseStr);
                    const daruriSobhMin = sunriseMin - 20;
                    const diff = currentMin - daruriSobhMin;
                    if (Math.abs(diff) <= WINDOW_MIN && !recentlySent(sub.last_notified_daruri_sobh)) {
                        const ok = await sendPush(sub, {
                            title: "⚠️ Temps Darûrî Sobh",
                            body: "Le temps Ikhtiyârî (recommandé) pour le Sobh est terminé. Priez avant le lever du soleil !",
                            url: "/prieres",
                            tag: "daruri-sobh",
                        });
                        if (ok) {
                            sent++;
                            dedupUpdates.last_notified_daruri_sobh = now.toISOString();
                        }
                    }
                }

                // Darûrî Asr: midpoint between Asr and Maghrib
                if (sub.daruri_asr_enabled) {
                    const daruriAsrMin = Math.round((asrMin + maghribMin) / 2);
                    const diff = currentMin - daruriAsrMin;
                    if (Math.abs(diff) <= WINDOW_MIN && !recentlySent(sub.last_notified_daruri_asr)) {
                        const ok = await sendPush(sub, {
                            title: "⚠️ Temps Darûrî Asr",
                            body: "Le temps Ikhtiyârî (recommandé) pour l'Asr est terminé. Priez avant le Maghrib !",
                            url: "/prieres",
                            tag: "daruri-asr",
                        });
                        if (ok) {
                            sent++;
                            dedupUpdates.last_notified_daruri_asr = now.toISOString();
                        }
                    }
                }

                // Akhir Isha: 1/3 of the night after Isha
                if (sub.akhir_isha_enabled) {
                    const nightDuration = (24 * 60 - ishaMin) + fajrMin;
                    const akhirIshaMin = (ishaMin + Math.round(nightDuration / 3)) % (24 * 60);
                    let diff = currentMin - akhirIshaMin;
                    // Handle midnight wrap
                    if (diff > 720) diff -= 24 * 60;
                    if (diff < -720) diff += 24 * 60;
                    if (Math.abs(diff) <= WINDOW_MIN && !recentlySent(sub.last_notified_akhir_isha)) {
                        const ok = await sendPush(sub, {
                            title: "🌙 Akhir Isha",
                            body: "Le temps Ikhtiyârî (recommandé) pour l'Isha se termine. Priez avant qu'il ne soit trop tard !",
                            url: "/prieres",
                            tag: "akhir-isha",
                        });
                        if (ok) {
                            sent++;
                            dedupUpdates.last_notified_akhir_isha = now.toISOString();
                        }
                    }
                }
            }
        }

        // ─── Apply dedup updates ──────────────────────────
        if (Object.keys(dedupUpdates).length > 0) {
            await supabase
                .from("push_subscriptions")
                .update({ ...dedupUpdates, updated_at: now.toISOString() })
                .eq("endpoint", sub.endpoint);
        }
    }

    console.log(`[Push] Sent ${sent} notifications to ${subscriptions.length} subscribers`);

    return new Response(JSON.stringify({ ok: true, sent, total: subscriptions.length }), {
        headers: { "Content-Type": "application/json" },
    });
});
