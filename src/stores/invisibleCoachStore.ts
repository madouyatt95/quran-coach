import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────

export type InterventionLevel = 'whisper' | 'nudge' | 'celebration';

export interface Intervention {
    id: string;
    level: InterventionLevel;
    trigger: string;
    emoji: string;
    title: string;
    message: string;
    messageAr?: string;
    source?: string;
    action?: {
        label: string;
        route: string;
    };
    priority: number;
    cooldownMinutes: number;
}

export interface InterventionRecord {
    interventionId: string;
    trigger: string;
    timestamp: number;
    dismissed: boolean;
    actioned: boolean;
}

// ─── State ────────────────────────────────────────────────────

interface InvisibleCoachState {
    // Global toggle
    enabled: boolean;
    notificationsEnabled: boolean;

    // Anti-spam system
    history: InterventionRecord[];
    suppressedUntil: number | null;
    receptivityScore: number; // 0-100

    // Cooldowns per trigger type
    triggerCooldowns: Record<string, number>;

    // Session counters (reset on app open)
    sessionInterventionCount: number;
    lastInterventionTime: number;
    sessionStartTime: number;

    // Per-trigger preferences
    enabledTriggers: Record<string, boolean>;

    // Stats
    totalShown: number;
    totalDismissed: number;
    totalActioned: number;

    // ─── Actions ──────────────────────────────────────────────

    setEnabled: (val: boolean) => void;
    setNotificationsEnabled: (val: boolean) => void;
    setTriggerEnabled: (trigger: string, val: boolean) => void;

    // Record an intervention shown
    recordShown: (intervention: Intervention) => void;
    // Record dismissal
    recordDismiss: (interventionId: string) => void;
    // Record user clicked the action
    recordAction: (interventionId: string) => void;
    // Snooze all interventions for N minutes
    snooze: (minutes: number) => void;

    // Check if a trigger is on cooldown
    isTriggerOnCooldown: (trigger: string) => boolean;
    // Check if we can show an intervention right now
    canShowIntervention: () => boolean;

    // Reset session counters (called on app open)
    resetSession: () => void;
}

// ─── Constants ────────────────────────────────────────────────

const MAX_HISTORY = 50;
const MAX_SESSION_INTERVENTIONS = 3;
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between interventions
const RECEPTIVITY_DECAY = 5; // Lose 5 points per dismiss
const RECEPTIVITY_GAIN = 10; // Gain 10 points per action

// ─── Default trigger toggles ─────────────────────────────────

const DEFAULT_TRIGGERS: Record<string, boolean> = {
    long_reading: true,
    verse_emotion: true,
    surah_complete: true,
    comeback: true,
    streak_danger: true,
    page_reread: true,
    quiz_weak: true,
    milestone: true,
    vocabulary_link: true,
    prayer_prep: true,
    hadith_link: true,
    fahm_push: true,
};

// ─── Store ────────────────────────────────────────────────────

export const useInvisibleCoachStore = create<InvisibleCoachState>()(
    persist(
        (set, get) => ({
            enabled: true,
            notificationsEnabled: false,

            history: [],
            suppressedUntil: null,
            receptivityScore: 80,

            triggerCooldowns: {},

            sessionInterventionCount: 0,
            lastInterventionTime: 0,
            sessionStartTime: Date.now(),

            enabledTriggers: { ...DEFAULT_TRIGGERS },

            totalShown: 0,
            totalDismissed: 0,
            totalActioned: 0,

            // ─── Actions ──────────────────────────────────────

            setEnabled: (enabled) => set({ enabled }),
            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

            setTriggerEnabled: (trigger, val) => set(state => ({
                enabledTriggers: { ...state.enabledTriggers, [trigger]: val },
            })),

            recordShown: (intervention) => set(state => {
                const record: InterventionRecord = {
                    interventionId: intervention.id,
                    trigger: intervention.trigger,
                    timestamp: Date.now(),
                    dismissed: false,
                    actioned: false,
                };

                const newHistory = [...state.history, record].slice(-MAX_HISTORY);
                const newCooldowns = {
                    ...state.triggerCooldowns,
                    [intervention.trigger]: Date.now() + intervention.cooldownMinutes * 60 * 1000,
                };

                return {
                    history: newHistory,
                    triggerCooldowns: newCooldowns,
                    sessionInterventionCount: state.sessionInterventionCount + 1,
                    lastInterventionTime: Date.now(),
                    totalShown: state.totalShown + 1,
                };
            }),

            recordDismiss: (interventionId) => set(state => {
                const newHistory = state.history.map(h =>
                    h.interventionId === interventionId ? { ...h, dismissed: true } : h
                );

                const newReceptivity = Math.max(0, state.receptivityScore - RECEPTIVITY_DECAY);

                return {
                    history: newHistory,
                    totalDismissed: state.totalDismissed + 1,
                    receptivityScore: newReceptivity,
                };
            }),

            recordAction: (interventionId) => set(state => {
                const newHistory = state.history.map(h =>
                    h.interventionId === interventionId ? { ...h, actioned: true } : h
                );

                const newReceptivity = Math.min(100, state.receptivityScore + RECEPTIVITY_GAIN);

                return {
                    history: newHistory,
                    totalActioned: state.totalActioned + 1,
                    receptivityScore: newReceptivity,
                };
            }),

            snooze: (minutes) => set({
                suppressedUntil: Date.now() + minutes * 60 * 1000,
            }),

            isTriggerOnCooldown: (trigger) => {
                const cooldownEnd = get().triggerCooldowns[trigger];
                if (!cooldownEnd) return false;
                return Date.now() < cooldownEnd;
            },

            canShowIntervention: () => {
                const state = get();

                // Globally disabled
                if (!state.enabled) return false;

                // Snoozed
                if (state.suppressedUntil && Date.now() < state.suppressedUntil) return false;

                // Max per session
                if (state.sessionInterventionCount >= MAX_SESSION_INTERVENTIONS) return false;

                // Min interval
                if (Date.now() - state.lastInterventionTime < MIN_INTERVAL_MS) return false;

                // Very low receptivity — reduce frequency further
                if (state.receptivityScore < 20) {
                    // Only allow 1 per session when receptivity is very low
                    if (state.sessionInterventionCount >= 1) return false;
                }

                return true;
            },

            resetSession: () => set({
                sessionInterventionCount: 0,
                lastInterventionTime: 0,
                sessionStartTime: Date.now(),
            }),
        }),
        {
            name: 'quran-coach-invisible-coach',
            partialize: (state) => ({
                enabled: state.enabled,
                notificationsEnabled: state.notificationsEnabled,
                history: state.history,
                suppressedUntil: state.suppressedUntil,
                receptivityScore: state.receptivityScore,
                triggerCooldowns: state.triggerCooldowns,
                enabledTriggers: state.enabledTriggers,
                totalShown: state.totalShown,
                totalDismissed: state.totalDismissed,
                totalActioned: state.totalActioned,
            }),
        }
    )
);
