// ─── Coach Invisible — Hook Réactif ──────────────────────────
// Écoute les stores en temps réel et décide quoi montrer.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInvisibleCoachStore, type Intervention } from '../stores/invisibleCoachStore';
import { useQuranStore } from '../stores/quranStore';
import { useStatsStore } from '../stores/statsStore';
import { usePrayerStore } from '../stores/prayerStore';
import { evaluateAllTriggers, type ReadingContext, type UserContext } from '../lib/invisibleCoachEngine';

// Surah ayah counts (114 surahs)
const SURAH_AYAH_COUNTS = [
    7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
    112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,
    89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,
    12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,
    30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

const EVAL_INTERVAL_MS = 30 * 1000; // Re-evaluate every 30 seconds

export interface UseInvisibleCoachReturn {
    currentIntervention: Intervention | null;
    dismiss: () => void;
    action: () => void;
    snooze: (minutes: number) => void;
}

export function useInvisibleCoach(): UseInvisibleCoachReturn {
    const [currentIntervention, setCurrentIntervention] = useState<Intervention | null>(null);
    const lastEvalRef = useRef(0);

    // Stores
    const coachStore = useInvisibleCoachStore();
    const quranStore = useQuranStore();
    const statsStore = useStatsStore();
    const prayerStore = usePrayerStore();

    // Build reading context from quranStore
    const buildReadingContext = useCallback((): ReadingContext | null => {
        const surah = quranStore.currentSurah;
        const ayah = quranStore.currentAyah;
        const page = quranStore.currentPage;

        if (!surah || surah < 1 || surah > 114) return null;

        return {
            currentSurah: surah,
            currentAyah: ayah || 1,
            currentPage: page || 1,
            totalAyahsInSurah: SURAH_AYAH_COUNTS[surah - 1] || 0,
            sessionStartTime: coachStore.sessionStartTime,
            pagesReadThisSession: statsStore.todayPagesRead || 0,
        };
    }, [quranStore.currentSurah, quranStore.currentAyah, quranStore.currentPage, coachStore.sessionStartTime, statsStore.todayPagesRead]);

    // Build user context from multiple stores
    const buildUserContext = useCallback((): UserContext => {
        // Calculate next prayer info
        let nextPrayerName: string | null = null;
        let nextPrayerMinutes: number | null = null;

        try {
            const todayResult = prayerStore.getTodayResult?.();
            if (todayResult) {
                const now = new Date();
                const nowMin = now.getHours() * 60 + now.getMinutes();
                const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
                const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

                for (let i = 0; i < prayerKeys.length; i++) {
                    const pTime = todayResult.times[prayerKeys[i]];
                    if (pTime) {
                        const pDate = new Date(pTime);
                        const pMin = pDate.getHours() * 60 + pDate.getMinutes();
                        const diff = pMin - nowMin;
                        if (diff > 0 && diff <= 15) {
                            nextPrayerName = prayers[i];
                            nextPrayerMinutes = diff;
                            break;
                        }
                    }
                }
            }
        } catch { /* prayer store may not be initialized */ }

        return {
            readingStreak: statsStore.readingStreak || 0,
            todayPagesRead: statsStore.todayPagesRead || 0,
            totalPagesRead: statsStore.totalPagesRead || 0,
            lastSessionDate: statsStore.lastReadDate || null,
            totalJuzCompleted: Math.floor((statsStore.totalPagesRead || 0) / 20),

            lastQuizTheme: null, // TODO: connect to quizStore when available
            lastQuizScore: null,

            nextPrayerName,
            nextPrayerMinutes,

            pageVisitCount: {}, // TODO: track page visits
        };
    }, [statsStore, prayerStore]);

    // Main evaluation loop
    useEffect(() => {
        if (!coachStore.enabled) {
            setCurrentIntervention(null);
            return;
        }

        const evaluate = () => {
            // Throttle evaluations
            const now = Date.now();
            if (now - lastEvalRef.current < 5000) return; // min 5s between evals
            lastEvalRef.current = now;

            if (!coachStore.canShowIntervention()) return;

            const readingCtx = buildReadingContext();
            const userCtx = buildUserContext();

            const intervention = evaluateAllTriggers(
                readingCtx,
                userCtx,
                coachStore.enabledTriggers,
                coachStore.isTriggerOnCooldown
            );

            if (intervention) {
                setCurrentIntervention(intervention);
                coachStore.recordShown(intervention);
            }
        };

        // Evaluate immediately and then periodically
        evaluate();
        const interval = setInterval(evaluate, EVAL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [
        coachStore.enabled,
        quranStore.currentSurah,
        quranStore.currentAyah,
        quranStore.currentPage,
        statsStore.todayPagesRead,
        statsStore.readingStreak,
        buildReadingContext,
        buildUserContext,
    ]);

    // Reset session on mount
    useEffect(() => {
        coachStore.resetSession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Actions
    const dismiss = useCallback(() => {
        if (currentIntervention) {
            coachStore.recordDismiss(currentIntervention.id);
        }
        setCurrentIntervention(null);
    }, [currentIntervention, coachStore]);

    const action = useCallback(() => {
        if (currentIntervention) {
            coachStore.recordAction(currentIntervention.id);
        }
        setCurrentIntervention(null);
    }, [currentIntervention, coachStore]);

    const snooze = useCallback((minutes: number) => {
        coachStore.snooze(minutes);
        setCurrentIntervention(null);
    }, [coachStore]);

    return {
        currentIntervention,
        dismiss,
        action,
        snooze,
    };
}
