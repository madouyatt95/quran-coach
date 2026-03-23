import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// App Group identifier for sharing data with iOS Widgets
const APP_GROUP = 'group.com.qurancoach.app';

/**
 * Initializes Preferences to use the shared App Group on iOS.
 * This MUST be called before writing widget data.
 */
export async function initWidgetService() {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        try {
            await Preferences.configure({ group: APP_GROUP });
            console.log('[WidgetService] Shared App Group configured for iOS Widgets');
        } catch (e) {
            console.warn('[WidgetService] Could not configure App Group', e);
        }
    }
}

/**
 * Updates the Next Prayer Widget Data
 */
export async function updateNextPrayerWidget(prayerName: string, prayerTimeStr: string) {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await initWidgetService(); // Ensure group is set
        await Preferences.set({ key: 'widgetNextPrayerName', value: prayerName });
        await Preferences.set({ key: 'widgetNextPrayerTime', value: prayerTimeStr });
    } catch (e) {
        console.error('Error updating next prayer widget data', e);
    }
}

/**
 * Updates the Hadith of the Day Widget Data
 */
export async function updateHadithWidget(hadithText: string, hadithSource: string) {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await initWidgetService();
        await Preferences.set({ key: 'widgetHadithText', value: hadithText });
        await Preferences.set({ key: 'widgetHadithSource', value: hadithSource });
    } catch (e) {
        console.error('Error updating hadith widget data', e);
    }
}

/**
 * Updates the Sentinel (Word of the Day) Widget Data
 */
export async function updateSentinelWidget(wordAr: string, wordFr: string) {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await initWidgetService();
        await Preferences.set({ key: 'widgetSentinelWordAr', value: wordAr });
        await Preferences.set({ key: 'widgetSentinelWordFr', value: wordFr });
    } catch (e) {
        console.error('Error updating sentinel widget data', e);
    }
}
