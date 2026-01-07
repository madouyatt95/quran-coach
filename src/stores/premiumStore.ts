import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PremiumState {
    isPremium: boolean;
    premiumUntil: string | null;

    // Actions
    setPremium: (isPremium: boolean, until?: string) => void;
    checkPremium: () => boolean;
}

export const usePremiumStore = create<PremiumState>()(
    persist(
        (set, get) => ({
            isPremium: false,
            premiumUntil: null,

            setPremium: (isPremium, until) => set({
                isPremium,
                premiumUntil: until || null,
            }),

            checkPremium: () => {
                const { isPremium, premiumUntil } = get();

                // Check if premium has expired
                if (premiumUntil) {
                    const expiryDate = new Date(premiumUntil);
                    if (expiryDate < new Date()) {
                        set({ isPremium: false, premiumUntil: null });
                        return false;
                    }
                }

                return isPremium;
            },
        }),
        {
            name: 'quran-coach-premium',
        }
    )
);
