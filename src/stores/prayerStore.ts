/**
 * Prayer Store — Zustand state for prayer settings, coords, and cached computations.
 * Persisted to localStorage. Cache is invalidated when settings or coords change.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    computeRange,
    formatDate,
    DEFAULT_PRAYER_SETTINGS,
    type PrayerSettings,
    type DayResult,
    type AnglePreset,
    type IshaIkhtiyari,
    type SobhIkhtiyariRule,
    type AsrIkhtiyariRule,
    type HighLatMode,
    type Rounding,
    type PrayerAdjustments,
    ANGLE_PRESETS,
} from '../lib/prayerEngine';

// ─── Types ──────────────────────────────────────────────

interface PrayerStoreState {
    // Settings
    settings: PrayerSettings;

    // Coordinates
    lat: number | null;
    lng: number | null;
    cityName: string;
    countryName: string;

    // Cache
    cache: Record<string, DayResult>; // dateKey → DayResult
    cacheSettingsHash: string;
    cacheCoordsHash: string;

    // Actions
    updateAnglePreset: (preset: AnglePreset) => void;
    updateCustomAngles: (fajrAngle: number, ishaAngle: number) => void;
    updateAsrShadow: (shadow: 1 | 2) => void;
    updateIshaIkhtiyari: (rule: IshaIkhtiyari) => void;
    updateSobhIkhtiyariRule: (rule: SobhIkhtiyariRule) => void;
    updateAsrIkhtiyariRule: (rule: AsrIkhtiyariRule) => void;
    updateHighLatMode: (mode: HighLatMode) => void;
    updateAdjustments: (adj: PrayerAdjustments) => void;
    updateFajrSafety: (min: number) => void;
    updateRounding: (r: Rounding) => void;
    updateShowTahajjud: (show: boolean) => void;
    updateShowIshraq: (show: boolean) => void;
    updateCoords: (lat: number, lng: number, city: string, country: string) => void;

    // Computation
    computeAndCache: (startDate: Date, days: number) => void;
    getDay: (date: Date) => DayResult | null;
    getTodayResult: () => DayResult | null;
    invalidateCache: () => void;
}

// ─── Hashing ─────────────────────────────────────────────

function hashSettings(s: PrayerSettings): string {
    return JSON.stringify({
        ap: s.anglePreset,
        fa: s.fajrAngle,
        ia: s.ishaAngle,
        as: s.asrShadow,
        ii: s.ishaIkhtiyari,
        sr: s.sobhIkhtiyariRule,
        ar: s.asrIkhtiyariRule,
        hl: s.highLatFajrIsha,
        adj: s.adjustmentsMin,
        fs: s.fajrSafetyMin,
        r: s.rounding,
    });
}

function hashCoords(lat: number | null, lng: number | null): string {
    if (lat == null || lng == null) return 'none';
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// ─── Store ───────────────────────────────────────────────

export const usePrayerStore = create<PrayerStoreState>()(
    persist(
        (set, get) => ({
            settings: { ...DEFAULT_PRAYER_SETTINGS },
            lat: null,
            lng: null,
            cityName: '',
            countryName: '',
            cache: {},
            cacheSettingsHash: hashSettings(DEFAULT_PRAYER_SETTINGS),
            cacheCoordsHash: 'none',

            updateAnglePreset: (preset) => {
                const angles = ANGLE_PRESETS[preset];
                set((state) => ({
                    settings: {
                        ...state.settings,
                        anglePreset: preset,
                        fajrAngle: preset === 'CUSTOM' ? state.settings.fajrAngle : angles.fajrAngle,
                        ishaAngle: preset === 'CUSTOM' ? state.settings.ishaAngle : angles.ishaAngle,
                    },
                }));
                get().invalidateCache();
            },

            updateCustomAngles: (fajrAngle, ishaAngle) => {
                set((state) => ({
                    settings: { ...state.settings, fajrAngle, ishaAngle, anglePreset: 'CUSTOM' as AnglePreset },
                }));
                get().invalidateCache();
            },

            updateAsrShadow: (shadow) => {
                set((state) => ({
                    settings: { ...state.settings, asrShadow: shadow },
                }));
                get().invalidateCache();
            },

            updateIshaIkhtiyari: (rule) => {
                set((state) => ({
                    settings: { ...state.settings, ishaIkhtiyari: rule },
                }));
                // Windows change but base times don't — no cache invalidation needed
            },

            updateSobhIkhtiyariRule: (rule) => {
                set((state) => ({
                    settings: { ...state.settings, sobhIkhtiyariRule: rule },
                }));
            },

            updateAsrIkhtiyariRule: (rule) => {
                set((state) => ({
                    settings: { ...state.settings, asrIkhtiyariRule: rule },
                }));
            },

            updateHighLatMode: (mode) => {
                set((state) => ({
                    settings: { ...state.settings, highLatFajrIsha: mode },
                }));
                get().invalidateCache();
            },

            updateAdjustments: (adj) => {
                set((state) => ({
                    settings: { ...state.settings, adjustmentsMin: adj },
                }));
                get().invalidateCache();
            },

            updateFajrSafety: (min) => {
                set((state) => ({
                    settings: { ...state.settings, fajrSafetyMin: min },
                }));
                get().invalidateCache();
            },

            updateRounding: (r) => {
                set((state) => ({
                    settings: { ...state.settings, rounding: r },
                }));
                get().invalidateCache();
            },

            updateShowTahajjud: (show) => {
                set((state) => ({
                    settings: { ...state.settings, showTahajjud: show },
                }));
            },

            updateShowIshraq: (show) => {
                set((state) => ({
                    settings: { ...state.settings, showIshraq: show },
                }));
            },

            updateCoords: (lat, lng, city, country) => {
                const newCoordsHash = hashCoords(lat, lng);
                const state = get();
                if (newCoordsHash !== state.cacheCoordsHash) {
                    set({ lat, lng, cityName: city, countryName: country, cache: {}, cacheCoordsHash: newCoordsHash });
                } else {
                    set({ lat, lng, cityName: city, countryName: country });
                }
            },

            computeAndCache: (startDate, days) => {
                const state = get();
                if (state.lat == null || state.lng == null) return;

                const results = computeRange(startDate, days, state.lat, state.lng, state.settings);
                const newCache = { ...state.cache };
                for (const r of results) {
                    newCache[r.date] = r;
                }

                set({
                    cache: newCache,
                    cacheSettingsHash: hashSettings(state.settings),
                    cacheCoordsHash: hashCoords(state.lat, state.lng),
                });
            },

            getDay: (date) => {
                const key = formatDate(date);
                return get().cache[key] || null;
            },

            getTodayResult: () => {
                const key = formatDate(new Date());
                return get().cache[key] || null;
            },

            invalidateCache: () => {
                set({ cache: {} });
            },
        }),
        {
            name: 'quran-coach-prayer',
            version: 1,
            partialize: (state) => ({
                settings: state.settings,
                lat: state.lat,
                lng: state.lng,
                cityName: state.cityName,
                countryName: state.countryName,
                cache: state.cache,
                cacheSettingsHash: state.cacheSettingsHash,
                cacheCoordsHash: state.cacheCoordsHash,
            }),
        }
    )
);
