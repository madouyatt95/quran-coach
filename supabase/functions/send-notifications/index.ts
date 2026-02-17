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

    // Import VAPID private key for signing
    const privKeyBytes = urlBase64Decode(VAPID_PRIVATE_KEY);
    // VAPID private key is raw 32-byte scalar, need to wrap in PKCS8
    const pkcs8 = wrapRawKeyInPKCS8(privKeyBytes);
    const privateKey = await crypto.subtle.importKey(
        "pkcs8", pkcs8,
        { name: "ECDSA", namedCurve: "P-256" },
        false, ["sign"]
    );

    const input = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigRaw = new Uint8Array(await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" }, privateKey, input
    ));

    return `${headerB64}.${payloadB64}.${urlBase64Encode(sigRaw)}`;
}

// Wrap a raw 32-byte P-256 private key scalar into PKCS8 DER format
function wrapRawKeyInPKCS8(rawKey: Uint8Array): Uint8Array {
    // PKCS8 header for P-256 ECDSA
    const header = new Uint8Array([
        0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
        0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
        0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
        0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
        0x01, 0x01, 0x04, 0x20
    ]);
    const footer = new Uint8Array([
        0xa1, 0x44, 0x03, 0x42, 0x00
    ]);

    // We need to append the public key, but for signing we can skip it
    // Actually for PKCS8 import to work, we need a valid structure
    // Simplified: just the private key without public key
    const result = new Uint8Array(header.length + rawKey.length);
    result.set(header);
    result.set(rawKey, header.length);
    return result;
}

// ─── RFC 8291 Web Push Encryption (aes128gcm) ──────
async function encryptPayload(
    payload: string,
    p256dhKey: string,
    authSecret: string
): Promise<{ encrypted: Uint8Array; localPublicKey: Uint8Array }> {
    // 1. Decode subscriber keys
    const subscriberPubBytes = urlBase64Decode(p256dhKey);
    const authBytes = urlBase64Decode(authSecret);

    // 2. Import subscriber's public key
    const subscriberKey = await crypto.subtle.importKey(
        "raw", subscriberPubBytes,
        { name: "ECDH", namedCurve: "P-256" },
        false, []
    );

    // 3. Generate ephemeral ECDH key pair
    const localKeyPair = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true, ["deriveBits"]
    );

    // 4. Export local public key (65 bytes uncompressed)
    const localPubRaw = new Uint8Array(
        await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
    );

    // 5. ECDH shared secret
    const sharedSecret = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: "ECDH", public: subscriberKey },
            localKeyPair.privateKey, 256
        )
    );

    // 6. HKDF to derive PRK (using auth as IKM salt)
    // info = "WebPush: info\0" + subscriber_pub + local_pub
    const infoPrefix = new TextEncoder().encode("WebPush: info\0");
    const ikm_info = new Uint8Array(infoPrefix.length + 65 + 65);
    ikm_info.set(infoPrefix);
    ikm_info.set(subscriberPubBytes, infoPrefix.length);
    ikm_info.set(localPubRaw, infoPrefix.length + 65);

    // Import shared secret as HKDF key material
    const ikmKey = await crypto.subtle.importKey(
        "raw", sharedSecret, "HKDF", false, ["deriveBits"]
    );

    // Derive IKM (32 bytes)
    const ikm = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: "HKDF", salt: authBytes, info: ikm_info, hash: "SHA-256" },
            ikmKey, 256
        )
    );

    // 7. Generate 16-byte salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // 8. Derive CEK and nonce from IKM using salt
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

    // 9. Pad the plaintext (add 0x02 delimiter + zero padding)
    const payloadBytes = new TextEncoder().encode(payload);
    const padded = new Uint8Array(payloadBytes.length + 1); // minimal padding
    padded.set(payloadBytes);
    padded[payloadBytes.length] = 0x02; // delimiter

    // 10. AES-128-GCM encrypt
    const aesKey = await crypto.subtle.importKey(
        "raw", cek, "AES-GCM", false, ["encrypt"]
    );
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: nonce, tagLength: 128 },
            aesKey, padded
        )
    );

    // 11. Build aes128gcm body: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
    const rs = 4096;
    const header = new Uint8Array(16 + 4 + 1 + 65);
    header.set(salt, 0);
    // Record size (4 bytes big-endian)
    header[16] = (rs >> 24) & 0xff;
    header[17] = (rs >> 16) & 0xff;
    header[18] = (rs >> 8) & 0xff;
    header[19] = rs & 0xff;
    // Key ID length
    header[20] = 65;
    // Key ID (local public key)
    header.set(localPubRaw, 21);

    // Combine header + ciphertext
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

        // Encrypt the payload per RFC 8291
        const { encrypted } = await encryptPayload(
            payloadStr,
            subscription.keys_p256dh,
            subscription.keys_auth
        );

        // Create VAPID JWT
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
            // Subscription expired — remove it
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
