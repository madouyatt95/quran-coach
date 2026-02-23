import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SmartState {
    // Toggles for different "Sentinelle" modes
    weatherEnabled: boolean;
    whiteDaysEnabled: boolean;
    kinshipEnabled: boolean;
    alKahfEnabled: boolean;
    fajrBoosterEnabled: boolean;
    historyEnabled: boolean;
    travelEnabled: boolean;
    saharEnabled: boolean;

    // Actions
    setWeatherEnabled: (val: boolean) => void;
    setWhiteDaysEnabled: (val: boolean) => void;
    setKinshipEnabled: (val: boolean) => void;
    setAlKahfEnabled: (val: boolean) => void;
    setFajrBoosterEnabled: (val: boolean) => void;
    setHistoryEnabled: (val: boolean) => void;
    setTravelEnabled: (val: boolean) => void;
    setSaharEnabled: (val: boolean) => void;

    // Global toggle (optional, for master switch)
    globalEnabled: boolean;
    setGlobalEnabled: (val: boolean) => void;
}

export const useSmartStore = create<SmartState>()(
    persist(
        (set) => ({
            weatherEnabled: true,
            whiteDaysEnabled: true,
            kinshipEnabled: true,
            alKahfEnabled: true,
            fajrBoosterEnabled: true,
            historyEnabled: true,
            travelEnabled: true,
            saharEnabled: true,
            globalEnabled: true,

            setWeatherEnabled: (weatherEnabled) => set({ weatherEnabled }),
            setWhiteDaysEnabled: (whiteDaysEnabled) => set({ whiteDaysEnabled }),
            setKinshipEnabled: (kinshipEnabled) => set({ kinshipEnabled }),
            setAlKahfEnabled: (alKahfEnabled) => set({ alKahfEnabled }),
            setFajrBoosterEnabled: (fajrBoosterEnabled) => set({ fajrBoosterEnabled }),
            setHistoryEnabled: (historyEnabled) => set({ historyEnabled }),
            setTravelEnabled: (travelEnabled) => set({ travelEnabled }),
            setSaharEnabled: (saharEnabled) => set({ saharEnabled }),
            setGlobalEnabled: (globalEnabled) => set({ globalEnabled }),
        }),
        {
            name: 'quran-coach-smart-sentinel',
        }
    )
);
