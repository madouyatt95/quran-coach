import { usePrayerStore } from '../stores/prayerStore';
import { Capacitor } from '@capacitor/core';

/**
 * resolveCoords — standalone helper to get current position
 * Uses native Capacitor Geolocation on iOS, browser geolocation on web.
 * Fallback to Paris if geolocation fails.
 */
export async function resolveCoords(): Promise<{ lat: number; lng: number }> {
    // 1) Check store for existing coords
    const state = usePrayerStore.getState();
    if (state.lat != null && state.lng != null) {
        return { lat: state.lat, lng: state.lng };
    }

    // 2) Try geolocation (native or web)
    try {
        let latitude: number;
        let longitude: number;

        if (Capacitor.isNativePlatform()) {
            const { Geolocation } = await import('@capacitor/geolocation');
            const permission = await Geolocation.checkPermissions();
            if (permission.location !== 'granted') {
                const req = await Geolocation.requestPermissions();
                if (req.location !== 'granted') throw new Error('Permission denied');
            }
            const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 });
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;
        } else {
            if (!navigator.geolocation) throw new Error('No geolocation');
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
            );
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;
        }

        // Reverse geocode (non-blocking — don't await if slow)
        let city = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        let country = '';
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude.toFixed(1)}&longitude=${longitude.toFixed(1)}&localityLanguage=fr`,
                { signal: controller.signal }
            );
            clearTimeout(timer);
            const geo = await res.json();
            city = geo.city || geo.locality || city;
            country = geo.countryName || '';
        } catch { /* use coord fallback */ }

        usePrayerStore.getState().updateCoords(latitude, longitude, city, country);
        return { lat: latitude, lng: longitude };
    } catch (err) {
        console.warn('[Location] Geolocation failed, using Paris fallback:', err);
        // 3) Fallback: Paris
        usePrayerStore.getState().updateCoords(48.8566, 2.3522, 'Paris', 'France');
        return { lat: 48.8566, lng: 2.3522 };
    }
}
