// ─── Coach Invisible — Moteur de Décision ────────────────────
// Analyse le contexte en temps réel et produit des interventions.
// 100% local — aucun appel API externe.

import {
    EMOTIONAL_VERSES,
    VERSE_HADITH_LINKS,
    MILESTONE_MESSAGES,
    COMEBACK_MESSAGES,
    PRAYER_SURAH_RECOMMENDATIONS,
    type EmotionCategory,
} from '../data/coachData';
import type { Intervention } from '../stores/invisibleCoachStore';

// ─── Utility ─────────────────────────────────────────────────

function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const EMOTION_LABELS: Record<EmotionCategory, string> = {
    mercy: 'la miséricorde',
    patience: 'la patience',
    gratitude: 'la gratitude',
    repentance: 'le repentir',
    paradise: 'le Paradis',
    warning: 'l\'avertissement',
    trust: 'la confiance en Allah',
    death: 'la mort et l\'Au-delà',
    justice: 'la justice',
    provision: 'la subsistance',
    family: 'la famille',
    knowledge: 'la science',
    unity: 'l\'unité',
    supplication: 'l\'invocation',
    creation: 'la création',
};

// ─── Context Types ───────────────────────────────────────────

export interface ReadingContext {
    currentSurah: number;
    currentAyah: number;
    currentPage: number;
    totalAyahsInSurah: number;
    sessionStartTime: number;
    pagesReadThisSession: number;
}

export interface UserContext {
    // Stats
    readingStreak: number;
    todayPagesRead: number;
    totalPagesRead: number;
    lastSessionDate: string | null; // ISO string
    totalJuzCompleted: number;

    // Quiz
    lastQuizTheme: string | null;
    lastQuizScore: number | null;

    // Prayer
    nextPrayerName: string | null;
    nextPrayerMinutes: number | null;

    // Page visit count
    pageVisitCount: Record<number, number>; // page → visit count
}

// ─── Trigger Evaluators ──────────────────────────────────────

/**
 * Trigger 1: Long reading session (15+ minutes)
 */
export function evaluateLongReading(ctx: ReadingContext): Intervention | null {
    const elapsed = Date.now() - ctx.sessionStartTime;
    const minutes = Math.floor(elapsed / 60000);

    if (minutes >= 15 && minutes < 20) {
        return {
            id: uid(),
            level: 'whisper',
            trigger: 'long_reading',
            emoji: '🕐',
            title: 'Pause méditation',
            message: `Tu lis depuis ${minutes} minutes. Prends un instant pour méditer sur ce que tu as lu.`,
            messageAr: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ',
            source: 'Coran 4:82',
            action: { label: 'Adhkar du moment', route: '/adhkar' },
            priority: 3,
            cooldownMinutes: 60, // 1h cooldown
        };
    }
    return null;
}

/**
 * Trigger 2: Emotional verse detected
 */
export function evaluateVerseEmotion(ctx: ReadingContext): Intervention | null {
    const match = EMOTIONAL_VERSES.find(
        v => v.surah === ctx.currentSurah && v.ayah === ctx.currentAyah
    );

    if (!match) return null;

    const categoryLabel = EMOTION_LABELS[match.category] || match.category;

    return {
        id: uid(),
        level: 'nudge',
        trigger: 'verse_emotion',
        emoji: '💭',
        title: `Verset sur ${categoryLabel}`,
        message: match.reflection,
        messageAr: match.textAr,
        source: `Coran ${match.surah}:${match.ayah}`,
        action: { label: 'Comprendre ce verset', route: `/fahm?surah=${match.surah}&ayah=${match.ayah}` },
        priority: 5,
        cooldownMinutes: 30,
    };
}

/**
 * Trigger 3: Surah completed
 */
export function evaluateSurahComplete(ctx: ReadingContext): Intervention | null {
    if (ctx.currentAyah >= ctx.totalAyahsInSurah && ctx.totalAyahsInSurah > 0) {
        // Find a hadith link for this surah's key verse
        const link = VERSE_HADITH_LINKS.find(l => l.surah === ctx.currentSurah);
        const extra = link
            ? `\n\nHadith lié : « ${link.hadithFr} » (${link.source})`
            : '';

        return {
            id: uid(),
            level: 'celebration',
            trigger: 'surah_complete',
            emoji: '🎉',
            title: 'Sourate terminée !',
            message: `Tu viens de terminer une sourate complète. Chaque sourate est une lumière le Jour du Jugement.${extra}`,
            messageAr: 'الْحَمْدُ لِلَّهِ',
            priority: 7,
            cooldownMinutes: 10, // Short cooldown for consecutive surahs
        };
    }
    return null;
}

/**
 * Trigger 4: Comeback after absence
 */
export function evaluateComeback(user: UserContext): Intervention | null {
    if (!user.lastSessionDate) return null;

    const lastDate = new Date(user.lastSessionDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 3) return null;

    const msg = COMEBACK_MESSAGES.find(
        m => daysDiff >= m.minDaysAbsent && daysDiff <= m.maxDaysAbsent
    );

    if (!msg) return null;

    return {
        id: uid(),
        level: 'nudge',
        trigger: 'comeback',
        emoji: msg.emoji,
        title: msg.title,
        message: msg.message + (msg.quoteFr ? `\n\n${msg.quoteFr}` : ''),
        messageAr: msg.quoteAr,
        source: msg.source,
        action: { label: 'Reprendre la lecture', route: '/read' },
        priority: 8,
        cooldownMinutes: 60 * 24, // 24h cooldown
    };
}

/**
 * Trigger 5: Streak in danger
 */
export function evaluateStreakDanger(user: UserContext): Intervention | null {
    const hour = new Date().getHours();

    if (user.readingStreak > 0 && user.todayPagesRead === 0 && hour >= 20) {
        return {
            id: uid(),
            level: 'whisper',
            trigger: 'streak_danger',
            emoji: '🛡️',
            title: 'Série en danger !',
            message: `Ta série de ${user.readingStreak} jours est en jeu ! Une seule page suffit pour la sauver.`,
            messageAr: 'خَيْرُ الأَعْمَالِ أَدْوَمُهَا وَإِنْ قَلَّ',
            source: 'Bukhari 6464',
            action: { label: 'Lire une page', route: '/read' },
            priority: 9,
            cooldownMinutes: 60 * 4, // 4h
        };
    }
    return null;
}

/**
 * Trigger 6: Page reread (memorization suggestion)
 */
export function evaluatePageReread(ctx: ReadingContext, user: UserContext): Intervention | null {
    const visitCount = user.pageVisitCount[ctx.currentPage] || 0;

    if (visitCount >= 3) {
        return {
            id: uid(),
            level: 'whisper',
            trigger: 'page_reread',
            emoji: '🧠',
            title: 'Mémorisation ?',
            message: `Tu as visité cette page ${visitCount} fois. Veux-tu passer en mode Mémorisation ?`,
            action: { label: 'Mode Hifdh', route: '/hifdh' },
            priority: 4,
            cooldownMinutes: 60 * 24, // Once per day per page
        };
    }
    return null;
}

/**
 * Trigger 7: Quiz weak score
 */
export function evaluateQuizWeak(user: UserContext): Intervention | null {
    if (user.lastQuizScore !== null && user.lastQuizScore < 60 && user.lastQuizTheme) {
        const themeLabels: Record<string, string> = {
            prophets: 'les Prophètes',
            companions: 'les Compagnons',
            pillars: 'les Piliers de l\'Islam',
            culture: 'la Culture Islamique',
            hadiths: 'les Hadiths',
            tawhid: 'le Tawhid',
            fiqh: 'le Fiqh',
            stories: 'les Histoires Coraniques',
            geography: 'la Géographie Islamique',
            verses: 'les Versets',
            virtues: 'les Vertus des Sourates',
            women: 'les Femmes dans le Coran',
        };

        const label = themeLabels[user.lastQuizTheme] || user.lastQuizTheme;

        return {
            id: uid(),
            level: 'nudge',
            trigger: 'quiz_weak',
            emoji: '📚',
            title: 'Renforce tes connaissances',
            message: `Score de ${user.lastQuizScore}% sur ${label}. L'erreur est un professeur. Veux-tu réviser ?`,
            messageAr: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
            source: 'Coran 20:114',
            action: { label: 'Réviser', route: '/quiz' },
            priority: 5,
            cooldownMinutes: 60 * 12, // 12h
        };
    }
    return null;
}

/**
 * Trigger 8: Milestone reached
 */
export function evaluateMilestone(user: UserContext): Intervention | null {
    // Check pages milestones
    for (const m of MILESTONE_MESSAGES) {
        if (m.type === 'pages' && user.totalPagesRead === m.threshold) {
            return {
                id: uid(),
                level: 'celebration',
                trigger: 'milestone',
                emoji: m.emoji,
                title: m.title,
                message: m.message,
                messageAr: m.duaAr,
                priority: 10,
                cooldownMinutes: 60 * 24 * 7, // Once per week
            };
        }
        if (m.type === 'streak' && user.readingStreak === m.threshold) {
            return {
                id: uid(),
                level: 'celebration',
                trigger: 'milestone',
                emoji: m.emoji,
                title: m.title,
                message: m.message,
                messageAr: m.duaAr,
                priority: 10,
                cooldownMinutes: 60 * 24 * 7,
            };
        }
        if (m.type === 'juz' && user.totalJuzCompleted === m.threshold) {
            return {
                id: uid(),
                level: 'celebration',
                trigger: 'milestone',
                emoji: m.emoji,
                title: m.title,
                message: m.message,
                messageAr: m.duaAr,
                priority: 10,
                cooldownMinutes: 60 * 24 * 7,
            };
        }
    }
    return null;
}

/**
 * Trigger 10: Prayer preparation
 */
export function evaluatePrayerPrep(user: UserContext): Intervention | null {
    if (!user.nextPrayerName || user.nextPrayerMinutes === null) return null;
    if (user.nextPrayerMinutes > 10 || user.nextPrayerMinutes < 0) return null;

    const prayerKey = user.nextPrayerName.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    const rec = PRAYER_SURAH_RECOMMENDATIONS.find(r => r.prayer === prayerKey);
    const surah = rec?.surahs[0];

    const surahTip = surah
        ? `\nSourate recommandée : ${surah.name} — ${surah.reason}`
        : '';

    return {
        id: uid(),
        level: 'whisper',
        trigger: 'prayer_prep',
        emoji: '🕌',
        title: `${user.nextPrayerName} dans ${user.nextPrayerMinutes} min`,
        message: `Prépare-toi pour la prière.${surahTip}`,
        messageAr: 'حَيَّ عَلَى الصَّلَاةِ',
        action: surah
            ? { label: `Lire ${surah.name}`, route: `/read?surah=${surah.surah}` }
            : undefined,
        priority: 6,
        cooldownMinutes: 60,
    };
}

/**
 * Trigger 11: Hadith link with current verse
 */
export function evaluateHadithLink(ctx: ReadingContext): Intervention | null {
    const link = VERSE_HADITH_LINKS.find(
        l => l.surah === ctx.currentSurah && l.ayah === ctx.currentAyah
    );

    if (!link) return null;

    return {
        id: uid(),
        level: 'nudge',
        trigger: 'hadith_link',
        emoji: '🔗',
        title: 'Connexion Coran ↔ Sunna',
        message: `« ${link.hadithFr} »\n— ${link.source}\n\n${link.connection}`,
        messageAr: link.hadithAr,
        source: link.source,
        priority: 6,
        cooldownMinutes: 30,
    };
}

/**
 * Trigger 12: Push toward Fahm
 */
export function evaluateFahmPush(ctx: ReadingContext): Intervention | null {
    // Check if this verse has emotional content or a hadith link
    const hasEmotion = EMOTIONAL_VERSES.some(
        v => v.surah === ctx.currentSurah && v.ayah === ctx.currentAyah
    );
    const hasLink = VERSE_HADITH_LINKS.some(
        l => l.surah === ctx.currentSurah && l.ayah === ctx.currentAyah
    );

    if (hasEmotion || hasLink) {
        return {
            id: uid(),
            level: 'whisper',
            trigger: 'fahm_push',
            emoji: '💡',
            title: 'Comprends ce verset',
            message: 'Ce verset a une profondeur. Veux-tu le comprendre en détail ?',
            action: { label: 'Panneau Fahm', route: `/fahm?surah=${ctx.currentSurah}&ayah=${ctx.currentAyah}` },
            priority: 3,
            cooldownMinutes: 15,
        };
    }
    return null;
}

// ─── Main Evaluation ─────────────────────────────────────────

/**
 * Evaluate all triggers and return the highest-priority intervention,
 * or null if nothing should be shown.
 */
export function evaluateAllTriggers(
    readingCtx: ReadingContext | null,
    userCtx: UserContext,
    enabledTriggers: Record<string, boolean>,
    isTriggerOnCooldown: (trigger: string) => boolean
): Intervention | null {
    const candidates: Intervention[] = [];

    const tryAdd = (trigger: string, evaluator: () => Intervention | null) => {
        if (enabledTriggers[trigger] === false) return;
        if (isTriggerOnCooldown(trigger)) return;
        const result = evaluator();
        if (result) candidates.push(result);
    };

    // Reading-dependent triggers
    if (readingCtx) {
        tryAdd('long_reading', () => evaluateLongReading(readingCtx));
        tryAdd('verse_emotion', () => evaluateVerseEmotion(readingCtx));
        tryAdd('surah_complete', () => evaluateSurahComplete(readingCtx));
        tryAdd('page_reread', () => evaluatePageReread(readingCtx, userCtx));
        tryAdd('hadith_link', () => evaluateHadithLink(readingCtx));
        tryAdd('fahm_push', () => evaluateFahmPush(readingCtx));
    }

    // Context-independent triggers
    tryAdd('comeback', () => evaluateComeback(userCtx));
    tryAdd('streak_danger', () => evaluateStreakDanger(userCtx));
    tryAdd('quiz_weak', () => evaluateQuizWeak(userCtx));
    tryAdd('milestone', () => evaluateMilestone(userCtx));
    tryAdd('prayer_prep', () => evaluatePrayerPrep(userCtx));

    if (candidates.length === 0) return null;

    // Return highest priority
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0];
}
