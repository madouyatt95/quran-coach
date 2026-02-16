import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
    // Preferences
    enabled: boolean;
    prayerEnabled: boolean;
    prayerMinutesBefore: number;
    hadithEnabled: boolean;
    challengeEnabled: boolean;

    // Runtime state
    permission: NotificationPermission;

    // Actions
    setEnabled: (enabled: boolean) => void;
    setPrayerEnabled: (enabled: boolean) => void;
    setPrayerMinutesBefore: (minutes: number) => void;
    setHadithEnabled: (enabled: boolean) => void;
    setChallengeEnabled: (enabled: boolean) => void;
    setPermission: (permission: NotificationPermission) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            // Defaults — all off until user enables
            enabled: false,
            prayerEnabled: true,
            prayerMinutesBefore: 10,
            hadithEnabled: true,
            challengeEnabled: true,
            permission: 'default' as NotificationPermission,

            // Actions
            setEnabled: (enabled) => set({ enabled }),
            setPrayerEnabled: (prayerEnabled) => set({ prayerEnabled }),
            setPrayerMinutesBefore: (prayerMinutesBefore) => set({ prayerMinutesBefore }),
            setHadithEnabled: (hadithEnabled) => set({ hadithEnabled }),
            setChallengeEnabled: (challengeEnabled) => set({ challengeEnabled }),
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
                hadithEnabled: state.hadithEnabled,
                challengeEnabled: state.challengeEnabled,
            }),
        }
    )
);
