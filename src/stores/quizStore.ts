import {quizDay} from '../lib/quizDate';
// Quiz Store — Zustand state management for solo + duel + sprint + revision modes
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { getQuestions, getSprintQuestions, getDuelRoundQuestions, getDailyQuestions, calculateScore, getAudioQuestions, generateSiraLevels, stableQuestionId } from '../lib/quizEngine';
import type { QuizQuestion, QuizThemeId, QuizAnswer, QuizPlayer, QuizDifficulty, ThemeStats, BadgeId, QuizView, QuizMode, PowerUpId, PowerUpEffect, SiraLevel } from '../data/quizTypes';
import { DIFFICULTY_CONFIG, BADGES } from '../data/quizTypes';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface QuizState {
    // Player
    player: QuizPlayer | null;
    setPlayer: (p: QuizPlayer) => void;

    // View
    view: QuizView;
    setView: (v: QuizView) => void;

    lastGame: {kind:'solo'|'audio'|'sprint'|'daily'|'sira'|'revision'|'duel';theme?:QuizThemeId;difficulty:QuizDifficulty;at:number} | null;
    replayLast: () => void;
    // Game state
    mode: QuizMode;
    difficulty: QuizDifficulty;
    theme: QuizThemeId | null;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: QuizAnswer[];
    score: number;
    timerStart: number;
    currentStreak: number;

    secondChance: boolean;
    freezeUntil: number;
    dailySessionDate: string | null;
    dailyDraft: {date: string; questions: QuizQuestion[]; currentIndex: number; answers: QuizAnswer[]; score: number; currentStreak: number; feedback: boolean} | null;
    saveDaily: () => void;
    reviewSchedule: Record<string, {due: number; successes: number; last: number}>;
    // Sprint state
    sprintTimeLeft: number;
    sprintCorrect: number;

    // Duel state
    duelResultStatus: 'idle'|'loading'|'waiting'|'ready';
    matchId: string | null;
    matchCode: string | null;
    isDuelCreator: boolean;
    opponent: QuizPlayer | null;
    opponentScore: number;
    opponentAnswers: QuizAnswer[];
    activeEffects: PowerUpEffect[];
    channel: RealtimeChannel | null;

    // Multi-round duel state
    duelRound: number;                    // Current round (0-indexed)
    duelRounds: QuizThemeId[];            // Theme per round
    duelAllQuestions: QuizQuestion[][];   // Questions grouped by round
    duelRoundScores: number[];            // My score per round
    duelRoundOppScores: number[];         // Opponent score per round

    // Actions
    selectTheme: (theme: QuizThemeId) => void;
    setDifficulty: (d: QuizDifficulty) => void;
    startSolo: () => void;
    startSprint: () => void;
    startRevision: () => void;
    startDaily: () => void;
    createDuel: (customThemes?: QuizThemeId[]) => Promise<string>;
    joinDuel: (code: string) => Promise<boolean>;
    submitAnswer: (chosenIndex: number) => void;
    nextQuestion: () => Promise<void>;
    applyPowerUp: (id: PowerUpId) => void;
    nextRound: () => void;
    selectRandomSolo: () => void;
    resetQuiz: () => void;
    submitToLeaderboard: () => Promise<void>;

    // Persisted Stats & Progress
    totalPlayed: number;
    totalWins: number;
    totalCorrect: number;
    totalXP: number;
    weeklyXP: Record<string,number>;
    level: number;
    title: string | null;
    card_theme: string | null;
    powerUps: Record<PowerUpId, number>;
    dailyChallengeLastDate: string | null; // ISO date YYYY-MM-DD

    soloHighScores: Record<string, number>;
    themeStats: Record<string, ThemeStats>;
    unlockedBadges: BadgeId[];
    wrongQuestions: QuizQuestion[];  // For revision mode
    sprintBest: number;
    duelWins: number;

    // Game history
    gameHistory: { date: string; mode: string; theme: string | null; score: number; correct: number; total: number; won: boolean }[];
    lastPowerUpGained: PowerUpId | null;

    // Progression Actions
    syncMatch: () => Promise<void>;
    addXP: (amount: number) => void;
    usePowerUp: (id: PowerUpId) => void;
    unlockBadge: (id: BadgeId) => void;
    startAudio: () => void;

    // Sira
    siraLevels: SiraLevel[];
    siraCurrentLevel: SiraLevel | null;
    siraProgression: Record<string, { completed: boolean; stars: number }>;
    unlockSiraLevel: (id: string) => void;
    completeSiraLevel: (id: string, stars: number) => void;
    startSiraLevel: (level: SiraLevel) => void;
}

function gameTitle(level:number){return level>=31?'Vétéran':level>=16?'Persévérant':level>=6?'Passionné':'Explorateur';}

function generateCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

// ─── Badge Checking ──────────────────────────────────────
function checkBadges(state: QuizState): BadgeId[] {
    const newBadges: BadgeId[] = [];
    const already = new Set(state.unlockedBadges);

    const check = (id: BadgeId, condition: boolean) => {
        if (!already.has(id) && condition) newBadges.push(id);
    };

    check('first_quiz', state.totalPlayed >= 1);
    // Use max of current streak and all-time best streaks from themeStats
    const bestStreakEver = Math.max(
        state.currentStreak,
        ...Object.values(state.themeStats).map(s => s.bestStreak || 0)
    );
    check('streak_5', bestStreakEver >= 5);
    check('streak_10', bestStreakEver >= 10);
    check('marathon', state.totalPlayed >= 50);
    check('scholar', state.totalCorrect >= 500);
    check('duel_winner', state.duelWins >= 1);
    check('duel_champion', state.duelWins >= 10);
    check('sprint_30', state.sprintBest >= 30);

    // Perfect round check
    const lastRoundAnswers = state.answers;
    if (lastRoundAnswers.length >= 5 && lastRoundAnswers.every(a => a.correct)) {
        check('perfect_round', true);
    }

    // Speed demon
    if (lastRoundAnswers.some(a => a.correct && a.timeMs < 3000)) {
        check('speed_demon', true);
    }

    // Theme mastery — all 15 themes
    const themeMap: Record<string, BadgeId> = {
        prophets: 'master_prophets',
        companions: 'master_companions',
        verses: 'master_verses',
        invocations: 'master_invocations',
        structure: 'master_structure',
        'ya-ayyuha': 'master_ya_ayyuha',
    };
    for (const [themeId, badgeId] of Object.entries(themeMap)) {
        const stats = state.themeStats[themeId];
        if (stats && stats.attempts >= 10) {
            check(badgeId, stats.correct / stats.attempts >= 0.9);
        }
    }

    // All themes played (all 15 themes)
    const allThemes: QuizThemeId[] = ['prophets', 'companions', 'verses', 'invocations', 'structure', 'ya-ayyuha', 'stories', 'geography', 'virtues', 'women', 'pillars', 'hadiths', 'culture', 'tawhid', 'fiqh'];
    const allPlayed = allThemes.every(t => state.themeStats[t]?.attempts > 0);
    check('all_themes', allPlayed);

    return newBadges;
}

export const useQuizStore = create<QuizState>()(
    persist(
        (set, get) => ({
            // Player
            player: null,
            setPlayer: (p) => set({ player: p }),

            // View
            view: 'home',
            setView: (v) => set({ view: v }),

            // Game
            mode: 'solo',
            difficulty: 'medium',
            theme: null,
            questions: [],
            currentIndex: 0,
            answers: [],
            score: 0,
            timerStart: 0,
            currentStreak: 0,

            secondChance: false,
            freezeUntil: 0,
            dailySessionDate: null,
            dailyDraft: null,
            reviewSchedule: {},
            saveDaily: () => {const s=get(); if(s.mode==='daily' && s.view!=='result' && s.dailySessionDate) set({dailyDraft:{date:s.dailySessionDate,questions:s.questions,currentIndex:s.currentIndex,answers:s.answers,score:s.score,currentStreak:s.currentStreak,feedback:s.view==='feedback'}});},
            // Sprint
            sprintTimeLeft: 60,
            sprintCorrect: 0,

            // Duel
            duelResultStatus: 'idle',
            matchId: null,
            matchCode: null,
            isDuelCreator: false,
            opponent: null,
            opponentScore: 0,
            opponentAnswers: [],
            activeEffects: [],
            channel: null,

            // Multi-round duel
            duelRound: 0,
            duelRounds: [],
            duelAllQuestions: [],
            duelRoundScores: [],
            duelRoundOppScores: [],

            // Stats
            totalPlayed: 0,
            totalWins: 0,
            totalCorrect: 0,
            totalXP: 0,
            weeklyXP: {},
            level: 1,
            title: 'Explorateur',
            card_theme: null,
            powerUps: { '50-50': 3, 'time-freeze': 3, 'second-chance': 3, 'sandstorm': 2, 'shield': 2, 'timer-bomb': 1 },
            dailyChallengeLastDate: null,
            soloHighScores: {},
            themeStats: {},
            unlockedBadges: [],
            wrongQuestions: [],
            sprintBest: 0,
            duelWins: 0,
            lastGame: null,
            replayLast: () => {
                const last=get().lastGame;if(!last)return;get().setDifficulty(last.difficulty);
                if(last.kind==='audio')get().startAudio();
                else if(last.kind==='sprint')get().startSprint();
                else if(last.kind==='solo'&&last.theme)get().selectTheme(last.theme);
                else get().setView(last.kind==='sira'?'sira-map':last.kind==='daily'?'daily':last.kind==='revision'?'error-review':last.kind==='duel'?'duel-choice':'solo-themes');
            },
            gameHistory: [],
            lastPowerUpGained: null,

            // Sira
            siraLevels: generateSiraLevels(),
            siraCurrentLevel: null,
            siraProgression: {},

            unlockSiraLevel: (_id) => {
                // Future Implementation for unlocking a level on the map
            },
            completeSiraLevel: (id, stars) => {
                const { siraProgression } = get();
                set({ siraProgression: { ...siraProgression, [id]: { completed: true, stars: Math.max(stars, siraProgression[id]?.stars || 0) } } });
            },
            startSiraLevel: (level) => {
                set({lastGame: {kind:'sira',difficulty:get().difficulty,at:Date.now()},
                    mode: 'sira',
                    siraCurrentLevel: level,
                    questions: level.questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    currentStreak: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
            },

            addXP: (amount) => {
                const { totalXP, player } = get();
                const newXP = totalXP + amount;
                const newLevel = Math.floor(newXP / 1000) + 1;

                // Determine Title based on level
                let newTitle = 'Explorateur';
                if (newLevel >= 31) newTitle = 'Vétéran';
                else if (newLevel >= 16) newTitle = 'Persévérant';
                else if (newLevel >= 6) newTitle = 'Passionné';

                set({
                    totalXP: newXP,
                    weeklyXP: {...get().weeklyXP,[new Date().toLocaleDateString('en-CA')]: (get().weeklyXP[new Date().toLocaleDateString('en-CA')]||0)+amount},
                    level: newLevel,
                    title: newTitle,
                    player: player ? { ...player, total_xp: newXP, level: newLevel, title: newTitle } : null
                });
            },

            usePowerUp: (id) => {
                const { powerUps } = get();
                if (powerUps[id] > 0) {
                    set({ powerUps: { ...powerUps, [id]: powerUps[id] - 1 } });
                }
            },

            unlockBadge: (id) => {
                const { unlockedBadges } = get();
                if (!unlockedBadges.includes(id)) {
                    set({ unlockedBadges: [...unlockedBadges, id] });
                }
            },

            setDifficulty: (d) => set({ difficulty: d }),

            selectTheme: (theme) => {
                set({lastGame: {kind:'solo',difficulty:get().difficulty,at:Date.now(),theme}, theme });
                // Start solo immediately with selected theme
                const { difficulty } = get();
                const config = DIFFICULTY_CONFIG[difficulty];
                const questions = getQuestions(theme, config.questionCount, difficulty);
                set({
                    mode: 'solo',
                    questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    currentStreak: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
            },

            startSolo: () => {
                set({ view: 'solo-themes' });
            },

            selectRandomSolo: () => {
                const allThemes: QuizThemeId[] = ['prophets', 'companions', 'verses', 'invocations', 'structure', 'ya-ayyuha', 'stories', 'geography', 'virtues', 'women', 'pillars', 'hadiths', 'culture', 'tawhid', 'fiqh'];
                const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
                get().selectTheme(randomTheme);
            },

            startSprint: () => {
                const questions = getSprintQuestions(50);
                set({lastGame: {kind:'sprint',difficulty:get().difficulty,at:Date.now()},
                    mode: 'sprint',
                    theme: null,
                    questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    sprintCorrect: 0,
                    sprintTimeLeft: 60,
                    currentStreak: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
            },

            startRevision: () => {
                const { wrongQuestions } = get();
                if (wrongQuestions.length === 0) return;
                const questions = wrongQuestions.slice(0, 10);
                set({lastGame: {kind:'revision',difficulty:get().difficulty,at:Date.now()},
                    mode: 'revision',
                    questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    currentStreak: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
            },

            startAudio: () => {
                const questions = getAudioQuestions(10);
                if (questions.length === 0) return;
                set({lastGame: {kind:'audio',difficulty:get().difficulty,at:Date.now()},
                    mode: 'solo',
                    theme: null,
                    questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    currentStreak: 0,
                    lastPowerUpGained: null,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
            },

            startDaily: () => {
                const today = quizDay();
                if (get().dailyChallengeLastDate === today) return;
                const draft = get().dailyDraft;
                if(draft?.date === today) {set({lastGame: {kind:'daily',difficulty:'medium',at:Date.now()},...draft, dailySessionDate:today, mode:'daily', difficulty:'medium', view:draft.feedback?'feedback':'playing', timerStart:Date.now(), secondChance:false,freezeUntil:0});return;}
                const questions = getDailyQuestions(today);
                set({
                    lastGame: {kind:'daily',difficulty:'medium',at:Date.now()},
                    mode: 'daily',
                    questions,
                    dailySessionDate: today,
                    difficulty: 'medium',
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    currentStreak: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
                get().saveDaily();
            },

            createDuel: async (customThemes?: QuizThemeId[]) => {
                const { player } = get();
                if (!player) return '';

                const code = generateCode();
                const { themes, questions: roundQuestions } = getDuelRoundQuestions(customThemes);
                const allQuestions = roundQuestions.flat();

                const { data, error } = await supabase
                    .from('quiz_matches')
                    .insert({
                        code,
                        status: 'waiting',
                        theme: themes[0],
                        questions: allQuestions,
                        player1_id: player.id,
                        player1_pseudo: player.pseudo,
                        player1_emoji: player.avatar_emoji,
                    })
                    .select()
                    .single();

                if (error || !data) {
                    console.error('[Quiz] Create match error:', error);
                    return '';
                }

                set({
                    duelResultStatus: 'idle',
                    matchId: data.id,
                    matchCode: code,
                    isDuelCreator: true,
                    duelAllQuestions: roundQuestions,
                    duelRounds: themes,
                    duelRound: 0,
                    duelRoundScores: [0, 0, 0],
                    duelRoundOppScores: [0, 0, 0],
                    questions: roundQuestions[0],
                    theme: themes[0],
                    lastGame: {kind:'duel',difficulty:get().difficulty,at:Date.now()},
                    mode: 'duel', difficulty: 'medium',
                    view: 'lobby',
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                });

                await get().syncMatch();
                return code;
            },

            joinDuel: async (code) => {
                const { player } = get();
                if (!player) return false;

                // Find match
                const { data: match, error } = await supabase
                    .from('quiz_matches')
                    .select('*')
                    .eq('code', code.toUpperCase())
                    .eq('status', 'waiting')
                    .single();

                if (error || !match || match.player1_id === player.id) {
                    console.error('[Quiz] Join error:', error);
                    return false;
                }

                // Update match
                const { data: claimed, error: updateError } = await supabase
                    .from('quiz_matches')
                    .update({
                        player2_id: player.id,
                        player2_pseudo: player.pseudo,
                        player2_emoji: player.avatar_emoji,
                        status: 'playing',
                    })
                    .eq('id', match.id)
                    .eq('status', 'waiting')
                    .is('player2_id', null)
                    .select('id').maybeSingle();

                if (updateError || !claimed) {
                    console.error('[Quiz] Join update error:', updateError);
                    return false;
                }

                // Rebuild round questions from flat list
                const flatQ = match.questions as QuizQuestion[];
                const rebuiltRounds = [flatQ.slice(0, 3), flatQ.slice(3, 6), flatQ.slice(6, 9)];
                const rebuiltThemes = rebuiltRounds.map(r => r[0]?.theme || 'prophets') as QuizThemeId[];

                set({
                    duelResultStatus: 'idle',
                    matchId: match.id,
                    matchCode: code.toUpperCase(),
                    lastGame: {kind:'duel',difficulty:get().difficulty,at:Date.now()},
                    mode: 'duel', difficulty: 'medium',
                    isDuelCreator: false,
                    opponent: {
                        id: match.player1_id,
                        pseudo: match.player1_pseudo || 'Adversaire',
                        avatar_emoji: match.player1_emoji || '🎓',
                        total_wins: 0,
                        total_played: 0,
                        total_xp: 0,
                        level: 1,
                        title: 'Explorateur'
                    },
                    duelAllQuestions: rebuiltRounds,
                    duelRounds: rebuiltThemes,
                    duelRound: 0,
                    duelRoundScores: [0, 0, 0],
                    duelRoundOppScores: [0, 0, 0],
                    theme: rebuiltThemes[0],
                    questions: rebuiltRounds[0],
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });

                await get().syncMatch();
                return true;
            },

            syncMatch: async () => {
                const { matchId, player, channel } = get();
                if (!matchId || !player) return;

                // Cleanup existing channel if any
                if (channel) {
                    supabase.removeChannel(channel);
                }

                // Initial fetch to get current state
                const { data: match, error } = await supabase
                    .from('quiz_matches')
                    .select('*')
                    .eq('id', matchId)
                    .single();

                if (error || !match) {
                    console.error('[Quiz] Sync fetch error:', error);
                    return;
                }

                if(get().matchId!==matchId)return;
                const isPlayer1 = match.player1_id === player.id;
                const oppId = isPlayer1 ? match.player2_id : match.player1_id;

                // Update local state if opponent joined while we were offline
                if (oppId && match.status === 'playing') {
                    const flatQ = match.questions as QuizQuestion[];
                    const rebuiltRounds = [flatQ.slice(0, 3), flatQ.slice(3, 6), flatQ.slice(6, 9)];
                    const rebuiltThemes = rebuiltRounds.map(r => r[0]?.theme || 'prophets') as QuizThemeId[];

                    set({
                        opponent: {
                            id: oppId,
                            pseudo: isPlayer1 ? match.player2_pseudo : match.player1_pseudo,
                            avatar_emoji: isPlayer1 ? match.player2_emoji : match.player1_emoji,
                            total_wins: 0,
                            total_played: 0,
                            total_xp: 0,
                            level: 1,
                            title: 'Explorateur'
                        },
                        opponentScore: isPlayer1 ? (match.player2_score || 0) : (match.player1_score || 0),
                        opponentAnswers: isPlayer1 ? (match.player2_answers || []) : (match.player1_answers || []),
                        duelAllQuestions: rebuiltRounds,
                        duelRounds: rebuiltThemes,
                        mode: 'duel', difficulty: 'medium',
                        timerStart: ['lobby','home','join'].includes(get().view)?Date.now():get().timerStart,
                        view: get().view === 'lobby' || get().view === 'home' || get().view === 'join' ? 'playing' : get().view,
                    });
                }

                // Establish/Restore Realtime subscription
                const newChannel = supabase
                    .channel(`match-${matchId}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'quiz_matches',
                        filter: `id=eq.${matchId}`,
                    }, (payload) => {
                        const m = payload.new as any;
                        const state = get();
                        const myId = state.player?.id;
                        if (!myId || state.matchId!==matchId) return;

                        const isP1 = m.player1_id === myId;
                        const oId = isP1 ? m.player2_id : m.player1_id;

                        // Transition to playing if opponent just joined
                        if (m.status === 'playing' && oId && (state.view === 'lobby' || state.view === 'home')) {
                            const flatQ = m.questions as QuizQuestion[];
                            const rebuiltRounds = [flatQ.slice(0, 3), flatQ.slice(3, 6), flatQ.slice(6, 9)];
                            const rebuiltThemes = rebuiltRounds.map(r => r[0]?.theme || 'prophets') as QuizThemeId[];

                            set({
                                opponent: {
                                    id: oId,
                                    pseudo: isP1 ? m.player2_pseudo : m.player1_pseudo,
                                    avatar_emoji: isP1 ? m.player2_emoji : m.player1_emoji,
                                    total_wins: 0, total_played: 0, total_xp: 0, level: 1, title: 'Explorateur'
                                },
                                duelAllQuestions: rebuiltRounds,
                                duelRounds: rebuiltThemes,
                                duelRound: 0,
                                questions: rebuiltRounds[0],
                                currentIndex: 0,
                                answers: [],
                                score: 0,
                                timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                                view: 'playing',
                            });
                        }

                        // Update opponent scores in real-time
                        if (isP1) {
                            if (m.player2_score !== undefined || m.activeEffects !== undefined) {
                                set({
                                    opponentScore: m.player2_score ?? state.opponentScore,
                                    opponentAnswers: m.player2_answers || [],
                                    activeEffects: m.activeEffects || [],
                                });
                            }
                        } else {
                            if (m.player1_score !== undefined || m.activeEffects !== undefined) {
                                set({
                                    opponentScore: m.player1_score ?? state.opponentScore,
                                    opponentAnswers: m.player1_answers || [],
                                    activeEffects: m.activeEffects || [],
                                });
                            }
                        }
                    })
                    .subscribe();

                set({ channel: newChannel });
            },

            applyPowerUp: (id) => {
                const { powerUps, mode } = get();
                if (!['solo','duel'].includes(mode) || get().view!=='playing') return;
                if (powerUps[id] <= 0) return;

                const newPowerUps = { ...powerUps, [id]: powerUps[id] - 1 };

                if (id === 'time-freeze') {
                    // Stop timer by resetting timerStart to a future date or just setting a flag
                    // Simple: add 10s to timerStart
                    if(get().freezeUntil>Date.now())return;
                    set({ freezeUntil: Date.now()+10000, powerUps: newPowerUps });
                } else if (id === 'second-chance') {
                    if(get().secondChance)return;
                    set({secondChance:true, powerUps:newPowerUps});
                } else if (id === '50-50') {
                    const { questions, currentIndex } = get();
                    const q = questions[currentIndex];
                    if (!q || q.choices.length<=2) return;

                    const correctChoice = q.choices[q.correctIndex];
                    const others = q.choices.filter((_, i) => i !== q.correctIndex);
                    // Keep 1 random wrong choice
                    const randomWrong = others[Math.floor(Math.random() * others.length)];
                    // Shuffle them?
                    const shuffled = Math.random() > 0.5 ? [correctChoice, randomWrong] : [randomWrong, correctChoice];

                    const newQuestions = [...questions];
                    newQuestions[currentIndex] = {
                        ...q,
                        choices: shuffled,
                        correctIndex: shuffled.indexOf(correctChoice)
                    };
                    set({ questions: newQuestions, powerUps: newPowerUps });
                } else if (id === 'sandstorm' || id === 'timer-bomb' || id === 'shield') {
                    // OFFENSIVE / DEFENSIVE POWER-UPS (Duel only)
                    if (mode !== 'duel') return;
                    const { matchId, player, opponent } = get();
                    if (!matchId || !player || !opponent) return;

                    const effect: PowerUpEffect = {
                        id: uid(),
                        type: id,
                        targetId: id === 'shield' ? player.id : opponent.id,
                        startTime: Date.now(),
                        durationMs: id === 'sandstorm' ? 8000 : 0,
                    };

                    // Update match in Supabase - use atomic update via RPC if possible, 
                    // or just a cleaner update for now.
                    supabase
                        .from('quiz_matches')
                        .select('activeEffects')
                        .eq('id', matchId)
                        .single()
                        .then(({ data }) => {
                            const currentEffects = (data?.activeEffects || []) as PowerUpEffect[];
                            // Filter out expired effects while we are at it to keep DB clean
                            const now = Date.now();
                            const cleanEffects = currentEffects.filter(e => !e.durationMs || (now - e.startTime < e.durationMs + 2000));

                            supabase
                                .from('quiz_matches')
                                .update({ activeEffects: [...cleanEffects, effect] })
                                .eq('id', matchId)
                                .then();
                        });

                    set({ powerUps: newPowerUps });
                } else {
                    set({ powerUps: newPowerUps });
                }
            },

            submitAnswer: (chosenIndex) => {
                const { questions, currentIndex, answers, score, timerStart, mode, matchId, player, difficulty, currentStreak, wrongQuestions, totalCorrect, sprintCorrect } = get();
                const question = questions[currentIndex];
                if (!question || get().view !== 'playing' || answers.some(a=>a.questionId===question.id)) return;
                if (!Number.isInteger(chosenIndex) || chosenIndex < -1 || chosenIndex >= question.choices.length) return;
                if(chosenIndex>=0 && chosenIndex!==question.correctIndex && get().secondChance){set({secondChance:false});return;}

                const maxTimeMs = mode === 'sprint' ? 10000 : DIFFICULTY_CONFIG[difficulty].timerSeconds * 1000;
                const timeMs = Math.max(0, Date.now() - timerStart);
                const correct = chosenIndex === question.correctIndex;
                const points = calculateScore(correct, timeMs, maxTimeMs, difficulty);

                if (correct) {
                    const difficultyCfg = DIFFICULTY_CONFIG[difficulty];
                    const baseXP = 15; // Base XP per correct answer
                    const difficultyBonus = Math.round(baseXP * difficultyCfg.scoreMultiplier);
                    const streakBonus = currentStreak * 2; // +2 XP for each streak point
                    let totalXPToGained = difficultyBonus + streakBonus;

                    if (mode === 'daily') totalXPToGained *= 2;

                    get().addXP(totalXPToGained);
                }

                const answer: QuizAnswer = {
                    questionId: question.id,
                    chosenIndex,
                    correct,
                    timeMs,
                    theme: question.theme,
                };

                const newAnswers = [...answers, answer];
                const newScore = score + points;
                const newStreak = correct ? currentStreak + 1 : 0;
                const newTotalCorrect = correct ? totalCorrect + 1 : totalCorrect;

                // Track wrong answers for revision (don't add duplicates)
                let newWrong = wrongQuestions;
                if (!correct) {
                    if (!wrongQuestions.find(q => stableQuestionId(q) === stableQuestionId(question))) {
                        newWrong = [...wrongQuestions, question];
                    }
                }
                const key=stableQuestionId(question);
                const oldReview=get().reviewSchedule[key];
                const spaced= !oldReview || Date.now()-oldReview.last>=86400000;
                const successes=correct?(oldReview?.successes||0)+(spaced?1:0):0;
                const reviewSchedule={...get().reviewSchedule,[key]:{successes,due:Date.now()+(correct?(successes>=2?7:2):1)*86400000,last:Date.now()}};
                if(correct && mode==='revision' && successes>=2) newWrong=newWrong.filter(q=>stableQuestionId(q)!==key);
                set({reviewSchedule});

                // Update theme stats
                const themeId = question.theme;
                const { themeStats } = get();
                const existing = themeStats[themeId] || { attempts: 0, correct: 0, bestStreak: 0, totalTimeMs: 0, lastPlayed: 0 };
                const updatedStats = {
                    ...existing,
                    attempts: existing.attempts + 1,
                    correct: existing.correct + (correct ? 1 : 0),
                    bestStreak: Math.max(existing.bestStreak, newStreak),
                    totalTimeMs: existing.totalTimeMs + timeMs,
                    lastPlayed: Date.now(),
                };

                set({
                    answers: newAnswers,
                    score: newScore,
                    currentStreak: newStreak,
                    totalCorrect: newTotalCorrect,
                    wrongQuestions: newWrong,
                    sprintCorrect: correct ? sprintCorrect + 1 : sprintCorrect,
                    themeStats: { ...themeStats, [themeId]: updatedStats },
                    view: mode === 'sprint' ? 'playing' : 'feedback',
                    secondChance: false,freezeUntil:0,
                });

                get().saveDaily();
                // Sync to Supabase in duel mode
                if (mode === 'duel' && matchId && player) {
                    const isP1 = get().isDuelCreator;
                    const updateField = isP1
                        ? { player1_answers: newAnswers, player1_score: newScore }
                        : { player2_answers: newAnswers, player2_score: newScore };

                    supabase
                        .from('quiz_matches')
                        .update(updateField)
                        .eq('id', matchId)
                        .then(async () => {
                            // Fetch opponent's latest score (Realtime fallback)
                            const { data: m } = await supabase
                                .from('quiz_matches')
                                .select('player1_score,player1_answers,player2_score,player2_answers')
                                .eq('id', matchId)
                                .single();
                            if (m) {
                                const oppScore = isP1 ? (m.player2_score || 0) : (m.player1_score || 0);
                                const oppAnswers = isP1 ? (m.player2_answers || []) : (m.player1_answers || []);
                                set({ opponentScore: oppScore, opponentAnswers: oppAnswers });
                            }
                        });
                }

                // In sprint, auto-advance to next question
                if (mode === 'sprint') {
                    const nextIdx = currentIndex + 1;
                    if (nextIdx >= questions.length) {void get().nextQuestion();}
                    if (nextIdx < questions.length) {
                        set({
                            currentIndex: nextIdx,
                            timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                        });
                    }
                }

                // Check badges after every answer (catches streak, speed_demon mid-game)
                const postAnswerState = get();
                const midGameBadges = checkBadges(postAnswerState);
                if (midGameBadges.length > 0) {
                    set({ unlockedBadges: [...postAnswerState.unlockedBadges, ...midGameBadges] });
                }
            },

            nextQuestion: async () => {
                const state = get();
                if((!['feedback','playing'].includes(state.view)&&!(state.view==='result'&&state.mode==='duel'&&state.duelResultStatus==='waiting'))||!state.questions.length)return;
                if(state.mode!=='sprint'&&!state.answers.some(a=>a.questionId===state.questions[state.currentIndex]?.id))return;
                const { currentIndex, questions, mode, score, totalPlayed, totalWins, soloHighScores, theme, matchId, channel, duelWins, sprintCorrect, sprintBest, duelRound, duelRounds, duelRoundScores, siraCurrentLevel } = state;

                // In duel mode: check if current round is done (3 questions per round)
                if (mode === 'duel' && currentIndex + 1 >= questions.length && duelRound < duelRounds.length - 1) {
                    const newRoundScores = [...duelRoundScores];
                    const prevRoundsScore = newRoundScores.slice(0, duelRound).reduce((a, b) => a + b, 0);
                    newRoundScores[duelRound] = score - prevRoundsScore;

                    set({
                        view: 'roundEnd',
                        duelRoundScores: newRoundScores,
                    });
                    return;
                }

                if (currentIndex + 1 >= questions.length || mode === 'sprint') {
                    // Close synchronously before awaiting remote results to prevent duplicate awards.
                    set({view:'result',duelResultStatus:mode==='duel'?'loading':'idle'});
                    // End of match
                    const isDuelMatch = mode === 'duel';

                    // Both players must finish before awarding a victory or recording a loss.
                    if (isDuelMatch && matchId) {
                        const isP1 = get().isDuelCreator;
                        try {
                            const { data: finalMatch } = await supabase.from('quiz_matches')
                                .select('player1_score,player1_answers,player2_score,player2_answers')
                                .eq('id', matchId).single();
                            if(get().matchId!==matchId)return;
                            const expected=state.duelAllQuestions.flat().length||state.answers.length;
                            const finalOppAnswers=finalMatch?(isP1?finalMatch.player2_answers:finalMatch.player1_answers)||[]:[];
                            if(finalMatch)set({opponentScore:(isP1?finalMatch.player2_score:finalMatch.player1_score)||0,opponentAnswers:finalOppAnswers});
                            if(!finalMatch||finalOppAnswers.length<expected){set({duelResultStatus:'waiting'});return;}
                            set({duelResultStatus:'ready'});
                        } catch {
                            if(get().matchId===matchId)set({duelResultStatus:'waiting'});
                            return;
                        }
                    }

                    const latestState = get();
                    const latestOppScore = latestState.opponentScore;
                    const latestAnswers = latestState.answers;
                    const correctCount = latestAnswers.filter(a => a.correct).length;
                    const totalQ = latestAnswers.length;
                    const correctRate = totalQ > 0 ? correctCount / totalQ : 0;

                    // Victory Condition
                    const isWin = isDuelMatch
                        ? (score > latestOppScore)
                        : (mode === 'sira' ? (correctCount === totalQ) : (correctRate >= 0.8));

                    const newHighScores = { ...soloHighScores };
                    if (mode === 'solo' && theme) {
                        const prev = newHighScores[theme] || 0;
                        if (score > prev) newHighScores[theme] = score;
                    }

                    const newDuelWins = isDuelMatch && score > latestOppScore ? duelWins + 1 : duelWins;
                    const newSprintBest = mode === 'sprint' ? Math.max(sprintBest, sprintCorrect) : sprintBest;

                    // Mark match finished
                    if (isDuelMatch && matchId) {
                        supabase.from('quiz_matches').update({ status: 'finished' }).eq('id', matchId).then();
                    }

                    // For duel: finalize score
                    if (isDuelMatch) {
                        const newRoundScores = [...duelRoundScores];
                        const prevRoundsScore = newRoundScores.slice(0, duelRound).reduce((a, b) => a + b, 0);
                        newRoundScores[duelRound] = score - prevRoundsScore;
                        set({ duelRoundScores: newRoundScores });
                    }

                    // Sira Progression
                    if (mode === 'sira' && siraCurrentLevel) {
                        const percentage = (correctCount / totalQ) * 100;
                        let stars = 0;
                        if (percentage === 100) stars = 3;
                        else if (percentage >= 70) stars = 2;
                        else if (percentage > 0) stars = 1;

                        // Only unlock next level if 100% (3 stars)
                        if (stars === 3) {
                            get().completeSiraLevel(siraCurrentLevel.id, stars);
                        }
                    }

                    set({
                        view: 'result',
                        dailyChallengeLastDate: mode==='daily'?get().dailySessionDate:get().dailyChallengeLastDate,
                        dailyDraft:mode==='daily'?null:get().dailyDraft,
                        totalPlayed: totalPlayed + 1,
                        totalWins: isWin ? totalWins + 1 : totalWins,
                        soloHighScores: newHighScores,
                        duelWins: newDuelWins,
                        sprintBest: newSprintBest,
                        lastPowerUpGained: null,
                    });

                    if (isWin) {
                        const { powerUps: currentPUs } = get();
                        // Recharge both solo and duel power-ups
                        const allOptions: PowerUpId[] = isDuelMatch
                            ? ['sandstorm', 'timer-bomb', 'shield']
                            : ['50-50', 'time-freeze', 'second-chance'];

                        const rechargeOptions = allOptions.filter(id => (currentPUs[id] || 0) < 5);

                        if (rechargeOptions.length > 0) {
                            const chosen = rechargeOptions[Math.floor(Math.random() * rechargeOptions.length)];
                            set({
                                powerUps: { ...currentPUs, [chosen]: (currentPUs[chosen] || 0) + 1 },
                                lastPowerUpGained: chosen,
                            });
                        }
                    }

                    // Save to game history
                    const { gameHistory: prevHistory, answers: latestAnswers2 } = get();
                    const historyEntry = {
                        date: new Date().toISOString(),
                        mode,
                        theme: theme || null,
                        score,
                        correct: latestAnswers2.filter(a => a.correct).length,
                        total: latestAnswers2.length,
                        won: isWin,
                    };
                    set({ gameHistory: [historyEntry, ...prevHistory].slice(0, 50) });

                    get().submitToLeaderboard();

                    const updatedState = get();
                    const newBadges = checkBadges(updatedState);
                    if (newBadges.length > 0) {
                        set({ unlockedBadges: [...updatedState.unlockedBadges, ...newBadges] });
                    }

                    if (channel) {
                        supabase.removeChannel(channel);
                        set({ channel: null });
                    }
                } else {
                    set({
                        currentIndex: currentIndex + 1,
                        timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                        view: 'playing',
                    });
                    get().saveDaily();
                }
            },

            nextRound: () => {
                const { duelRound, duelAllQuestions, duelRounds } = get();
                const nextRound = duelRound + 1;
                if (nextRound >= duelAllQuestions.length) return;

                set({
                    duelRound: nextRound,
                    theme: duelRounds[nextRound],
                    questions: duelAllQuestions[nextRound],
                    currentIndex: 0,
                    timerStart: Date.now(),
                    secondChance: false, freezeUntil: 0,
                    view: 'playing',
                });
            },

            submitToLeaderboard: async () => {
                const { player, totalCorrect, totalPlayed, totalWins, totalXP, sprintBest } = get();
                if (!player) return;

                const { error } = await supabase
                    .from('quiz_leaderboard')
                    .upsert({
                        id: player.id,
                        pseudo: player.pseudo,
                        avatar_emoji: player.avatar_emoji,
                        total_score: totalXP,          // Cumulative XP, not session score
                        total_correct: totalCorrect,
                        total_played: totalPlayed,
                        total_wins: totalWins,
                        sprint_best: sprintBest,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'id' });

                if (error) console.error('[Quiz] Leaderboard update error:', error);
            },

            resetQuiz: () => {
                get().saveDaily();
                const { channel } = get();
                if (channel) supabase.removeChannel(channel);
                set({
                    view: 'home',
                    theme: null,
                    questions: [],
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    duelResultStatus: 'idle',
            matchId: null,
                    matchCode: null,
                    isDuelCreator: false,
                    opponent: null,
                    opponentScore: 0,
                    opponentAnswers: [],
                    activeEffects: [],
                    channel: null,
                    mode: 'solo',
                    currentStreak: 0,
                    sprintCorrect: 0,
                    sprintTimeLeft: 60,
                    duelRound: 0,
                    duelRounds: [],
                    duelAllQuestions: [],
                    duelRoundScores: [],
                    duelRoundOppScores: [],
                });
            },
        }),
        {
            name: 'quiz-store',
            version: 3,
            partialize: (state) => ({
                lastGame: state.lastGame,
                dailyDraft: state.dailyDraft,
                reviewSchedule: state.reviewSchedule,
                player: state.player,
                totalPlayed: state.totalPlayed,
                totalWins: state.totalWins,
                totalCorrect: state.totalCorrect,
                totalXP: state.totalXP,
                weeklyXP: state.weeklyXP,
                level: state.level,
                title: state.title,
                card_theme: state.card_theme,
                powerUps: state.powerUps,
                dailyChallengeLastDate: state.dailyChallengeLastDate,
                soloHighScores: state.soloHighScores,
                themeStats: state.themeStats,
                unlockedBadges: state.unlockedBadges,
                wrongQuestions: state.wrongQuestions,
                sprintBest: state.sprintBest,
                duelWins: state.duelWins,
                difficulty: state.difficulty,
                gameHistory: state.gameHistory,
                siraProgression: state.siraProgression,
            }),
            migrate: (persistedState: unknown): Partial<QuizState> => {
                const saved = (persistedState || {}) as Partial<QuizState>;
                return {...saved, title: gameTitle(saved.level || 1), wrongQuestions:[...new Map((saved.wrongQuestions||[]).map(q=>{const id=stableQuestionId(q);return [id,{...q,id}] as const;})).values()]};
            },
        }
    )
);

// Re-export badge list for UI
export { BADGES };
