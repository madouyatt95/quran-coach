import { usePrayerStore } from '../stores/prayerStore';

/**
 * resolveCoords — standalone helper to get current position
 * Fallback to Paris if geolocation fails.
 */
export async function resolveCoords(): Promise<{ lat: number; lng: number }> {
    // 1) Check store for existing coords
    const state = usePrayerStore.getState();
    if (state.lat != null && state.lng != null) {
        return { lat: state.lat, lng: state.lng };
    }

    // 2) Try browser geolocation (3s timeout — fast fail)
    try {
        if (!navigator.geolocation) throw new Error('No geolocation');

        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        );
        const { latitude, longitude } = pos.coords;

        // Reverse geocode (non-blocking — don't await if slow)
        let city = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        let country = '';
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
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
