import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
    // Preferences
    enabled: boolean;
    prayerEnabled: boolean;
    prayerMinutesBefore: number; // Global fallback
    prayerMinutesConfig: Record<string, number>; // Per-prayer individual settings
    hadithEnabled: boolean;
    challengeEnabled: boolean;

    // Advanced prayer notifications (Sprint 3)
    daruriSobhEnabled: boolean;
    daruriAsrEnabled: boolean;
    akhirIshaEnabled: boolean;
    adhanSound: string;

    // Runtime state
    permission: NotificationPermission;

    // Actions
    setEnabled: (enabled: boolean) => void;
    setPrayerEnabled: (enabled: boolean) => void;
    setPrayerMinutesBefore: (minutes: number) => void;
    setPrayerMinutesConfig: (config: Record<string, number>) => void;
    setPrayerMinuteFor: (prayer: string, minutes: number) => void;
    setHadithEnabled: (enabled: boolean) => void;
    setChallengeEnabled: (enabled: boolean) => void;
    setDaruriSobhEnabled: (enabled: boolean) => void;
    setDaruriAsrEnabled: (enabled: boolean) => void;
    setAkhirIshaEnabled: (enabled: boolean) => void;
    setAdhanSound: (sound: string) => void;
    setPermission: (permission: NotificationPermission) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            // Defaults — all off until user enables
            enabled: false,
            prayerEnabled: true,
            prayerMinutesBefore: 10,
            prayerMinutesConfig: {
                fajr: 10,
                dhuhr: 10,
                asr: 10,
                maghrib: 10,
                isha: 10,
            },
            hadithEnabled: true,
            challengeEnabled: true,
            daruriSobhEnabled: false,
            daruriAsrEnabled: false,
            akhirIshaEnabled: false,
            adhanSound: 'Mecque',
            permission: 'default' as NotificationPermission,

            // Actions
            setEnabled: (enabled) => set({ enabled }),
            setPrayerEnabled: (prayerEnabled) => set({ prayerEnabled }),
            setPrayerMinutesBefore: (prayerMinutesBefore) => set({ prayerMinutesBefore }),
            setPrayerMinutesConfig: (prayerMinutesConfig) => set({ prayerMinutesConfig }),
            setPrayerMinuteFor: (prayer, minutes) => set(state => ({
                prayerMinutesConfig: { ...state.prayerMinutesConfig, [prayer]: minutes }
            })),
            setHadithEnabled: (hadithEnabled) => set({ hadithEnabled }),
            setChallengeEnabled: (challengeEnabled) => set({ challengeEnabled }),
            setDaruriSobhEnabled: (daruriSobhEnabled) => set({ daruriSobhEnabled }),
            setDaruriAsrEnabled: (daruriAsrEnabled) => set({ daruriAsrEnabled }),
            setAkhirIshaEnabled: (akhirIshaEnabled) => set({ akhirIshaEnabled }),
            setAdhanSound: (adhanSound) => set({ adhanSound }),
            setPermission: (permission) => set({ permission }),
        }),
        {
            name: 'quran-coach-notifications',
            version: 1,
            // Don't persist runtime permission state
            partialize: (state) => ({
                enabled: state.enabled,
                prayerEnabled: state.prayerEnabled,
                prayerMinutesBefore: state.prayerMinutesBefore,
                prayerMinutesConfig: state.prayerMinutesConfig,
                hadithEnabled: state.hadithEnabled,
                challengeEnabled: state.challengeEnabled,
                daruriSobhEnabled: state.daruriSobhEnabled,
                daruriAsrEnabled: state.daruriAsrEnabled,
                akhirIshaEnabled: state.akhirIshaEnabled,
                adhanSound: state.adhanSound,
            }),
        }
    )
);
