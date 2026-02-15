// Quiz Store — Zustand state management for solo + duel + sprint + revision modes
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { getQuestions, getSprintQuestions, getDuelRoundQuestions, calculateScore } from '../lib/quizEngine';
import type { QuizQuestion, QuizThemeId, QuizAnswer, QuizPlayer, QuizDifficulty, ThemeStats, BadgeId } from '../data/quizTypes';
import { DIFFICULTY_CONFIG, BADGES } from '../data/quizTypes';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type QuizView =
    | 'home'        // Mode Selection (Solo, Duel, etc.) + Difficulty
    | 'solo-themes' // Theme selection (only for Solo)
    | 'stats'       // Stats dashboard
    | 'badges'      // Badge gallery
    | 'leaderboard' // Global leaderboard
    | 'lobby'       // Waiting for opponent
    | 'join'        // Enter code to join
    | 'playing'     // Active quiz
    | 'feedback'    // Answer feedback (correct/wrong)
    | 'roundEnd'    // End of round summary
    | 'result';     // Final match result

export type QuizMode = 'solo' | 'duel' | 'sprint' | 'revision';

interface QuizState {
    // Player
    player: QuizPlayer | null;
    setPlayer: (p: QuizPlayer) => void;

    // View
    view: QuizView;
    setView: (v: QuizView) => void;

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

    // Sprint state
    sprintTimeLeft: number;
    sprintCorrect: number;

    // Duel state
    matchId: string | null;
    matchCode: string | null;
    opponent: QuizPlayer | null;
    opponentScore: number;
    opponentAnswers: QuizAnswer[];
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
    createDuel: () => Promise<string>;
    joinDuel: (code: string) => Promise<boolean>;
    submitAnswer: (chosenIndex: number) => void;
    nextQuestion: () => void;
    nextRound: () => void;
    selectRandomSolo: () => void;
    resetQuiz: () => void;
    submitToLeaderboard: () => Promise<void>;

    // Persisted Stats
    totalPlayed: number;
    totalWins: number;
    totalCorrect: number;
    soloHighScores: Record<string, number>;
    themeStats: Record<string, ThemeStats>;
    unlockedBadges: BadgeId[];
    wrongQuestions: QuizQuestion[];  // For revision mode
    sprintBest: number;
    duelWins: number;
}

function generateCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

// ─── Badge Checking ──────────────────────────────────────
function checkBadges(state: QuizState): BadgeId[] {
    const newBadges: BadgeId[] = [];
    const already = new Set(state.unlockedBadges);

    const check = (id: BadgeId, condition: boolean) => {
        if (!already.has(id) && condition) newBadges.push(id);
    };

    check('first_quiz', state.totalPlayed >= 1);
    check('streak_5', state.currentStreak >= 5);
    check('streak_10', state.currentStreak >= 10);
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

    // Theme mastery
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
        if (stats && stats.attempts >= 20) {
            check(badgeId, stats.correct / stats.attempts >= 0.9);
        }
    }

    // All themes played
    const allThemes = ['prophets', 'companions', 'verses', 'invocations', 'structure', 'ya-ayyuha'];
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

            // Sprint
            sprintTimeLeft: 60,
            sprintCorrect: 0,

            // Duel
            matchId: null,
            matchCode: null,
            opponent: null,
            opponentScore: 0,
            opponentAnswers: [],
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
            soloHighScores: {},
            themeStats: {},
            unlockedBadges: [],
            wrongQuestions: [],
            sprintBest: 0,
            duelWins: 0,

            setDifficulty: (d) => set({ difficulty: d }),

            selectTheme: (theme) => {
                set({ theme });
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
                    view: 'playing',
                });
            },

            startSolo: () => {
                set({ view: 'solo-themes' });
            },

            selectRandomSolo: () => {
                const allThemes = ['prophets', 'companions', 'verses', 'invocations', 'structure', 'ya-ayyuha'];
                const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)] as QuizThemeId;
                get().selectTheme(randomTheme);
            },

            startSprint: () => {
                const questions = getSprintQuestions(50);
                set({
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
                    view: 'playing',
                });
            },

            startRevision: () => {
                const { wrongQuestions } = get();
                if (wrongQuestions.length === 0) return;
                const questions = wrongQuestions.slice(0, 10);
                set({
                    mode: 'revision',
                    questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    currentStreak: 0,
                    timerStart: Date.now(),
                    view: 'playing',
                });
            },

            createDuel: async () => {
                const { player } = get();
                if (!player) return '';

                const code = generateCode();
                const { themes, questions: roundQuestions } = getDuelRoundQuestions();
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

                // Subscribe to match changes
                const channel = supabase
                    .channel(`match-${data.id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'quiz_matches',
                        filter: `id=eq.${data.id}`,
                    }, (payload) => {
                        const match = payload.new as any;
                        const state = get();

                        // Opponent joined
                        if (match.status === 'playing' && state.view === 'lobby') {
                            // Rebuild round questions from flat list
                            const flatQ = match.questions as QuizQuestion[];
                            const rebuiltRounds = [flatQ.slice(0, 3), flatQ.slice(3, 6), flatQ.slice(6, 9)];
                            const rebuiltThemes = rebuiltRounds.map(r => r[0]?.theme || 'prophets') as QuizThemeId[];

                            set({
                                opponent: {
                                    id: match.player2_id,
                                    pseudo: match.player2_pseudo || 'Adversaire',
                                    avatar_emoji: match.player2_emoji || '🎓',
                                    total_wins: 0,
                                    total_played: 0,
                                },
                                duelAllQuestions: rebuiltRounds,
                                duelRounds: rebuiltThemes,
                                duelRound: 0,
                                duelRoundScores: [0, 0, 0],
                                duelRoundOppScores: [0, 0, 0],
                                questions: rebuiltRounds[0],
                                currentIndex: 0,
                                answers: [],
                                score: 0,
                                timerStart: Date.now(),
                                view: 'playing',
                            });
                        }

                        // Opponent score update
                        if (match.player2_score !== undefined) {
                            set({
                                opponentScore: match.player2_score,
                                opponentAnswers: match.player2_answers || [],
                            });
                        }
                    })
                    .subscribe();

                set({
                    matchId: data.id,
                    matchCode: code,
                    channel,
                    duelAllQuestions: roundQuestions,
                    duelRounds: themes,
                    duelRound: 0,
                    duelRoundScores: [0, 0, 0],
                    duelRoundOppScores: [0, 0, 0],
                    questions: roundQuestions[0],
                    theme: themes[0],
                    mode: 'duel',
                    view: 'lobby',
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                });

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

                if (error || !match) {
                    console.error('[Quiz] Join error:', error);
                    return false;
                }

                // Update match
                const { error: updateError } = await supabase
                    .from('quiz_matches')
                    .update({
                        player2_id: player.id,
                        player2_pseudo: player.pseudo,
                        player2_emoji: player.avatar_emoji,
                        status: 'playing',
                    })
                    .eq('id', match.id);

                if (updateError) {
                    console.error('[Quiz] Join update error:', updateError);
                    return false;
                }

                // Subscribe
                const channel = supabase
                    .channel(`match-${match.id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'quiz_matches',
                        filter: `id=eq.${match.id}`,
                    }, (payload) => {
                        const m = payload.new as any;
                        if (m.player1_score !== undefined) {
                            set({
                                opponentScore: m.player1_score,
                                opponentAnswers: m.player1_answers || [],
                            });
                        }
                    })
                    .subscribe();

                // Rebuild round questions from flat list
                const flatQ = match.questions as QuizQuestion[];
                const rebuiltRounds = [flatQ.slice(0, 3), flatQ.slice(3, 6), flatQ.slice(6, 9)];
                const rebuiltThemes = rebuiltRounds.map(r => r[0]?.theme || 'prophets') as QuizThemeId[];

                set({
                    matchId: match.id,
                    matchCode: code.toUpperCase(),
                    mode: 'duel',
                    channel,
                    opponent: {
                        id: match.player1_id,
                        pseudo: match.player1_pseudo || 'Adversaire',
                        avatar_emoji: match.player1_emoji || '🎓',
                        total_wins: 0,
                        total_played: 0,
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
                    view: 'playing',
                });

                return true;
            },

            submitAnswer: (chosenIndex) => {
                const { questions, currentIndex, answers, score, timerStart, mode, matchId, player, difficulty, currentStreak, wrongQuestions, totalCorrect, sprintCorrect } = get();
                const question = questions[currentIndex];
                if (!question) return;

                const maxTimeMs = mode === 'sprint' ? 10000 : DIFFICULTY_CONFIG[difficulty].timerSeconds * 1000;
                const timeMs = Date.now() - timerStart;
                const correct = chosenIndex === question.correctIndex;
                const points = calculateScore(correct, timeMs, maxTimeMs, difficulty);

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
                    if (!wrongQuestions.find(q => q.id === question.id)) {
                        newWrong = [...wrongQuestions, question];
                    }
                } else if (mode === 'revision') {
                    // Remove from wrong if answered correctly in revision
                    newWrong = wrongQuestions.filter(q => q.id !== question.id);
                }

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
                });

                // Sync to Supabase in duel mode
                if (mode === 'duel' && matchId && player) {
                    const isPlayer1 = get().opponent?.id !== player.id;
                    const updateField = isPlayer1
                        ? { player1_answers: newAnswers, player1_score: newScore }
                        : { player2_answers: newAnswers, player2_score: newScore };

                    supabase
                        .from('quiz_matches')
                        .update(updateField)
                        .eq('id', matchId)
                        .then();
                }

                // In sprint, auto-advance to next question
                if (mode === 'sprint') {
                    const nextIdx = currentIndex + 1;
                    if (nextIdx < questions.length) {
                        set({
                            currentIndex: nextIdx,
                            timerStart: Date.now(),
                        });
                    }
                }
            },

            nextQuestion: () => {
                const state = get();
                const { currentIndex, questions, mode, score, totalPlayed, totalWins, opponentScore, soloHighScores, theme, matchId, channel, duelWins, sprintCorrect, sprintBest, duelRound, duelRounds, duelRoundScores } = state;

                // In duel mode: check if current round is done (3 questions per round)
                if (mode === 'duel' && currentIndex + 1 >= questions.length && duelRound < duelRounds.length - 1) {
                    // End of current round, but more rounds to go
                    const newRoundScores = [...duelRoundScores];
                    // Calculate this round's score contribution
                    const prevRoundsScore = newRoundScores.slice(0, duelRound).reduce((a, b) => a + b, 0);
                    newRoundScores[duelRound] = score - prevRoundsScore;

                    set({
                        view: 'roundEnd',
                        duelRoundScores: newRoundScores,
                    });
                    return;
                }

                if (currentIndex + 1 >= questions.length || mode === 'sprint') {
                    // End of match
                    const isDuel = mode === 'duel';
                    const isWin = mode === 'solo' || mode === 'sprint' || mode === 'revision' || score > opponentScore;
                    const newHighScores = { ...soloHighScores };
                    if (mode === 'solo' && theme) {
                        const prev = newHighScores[theme] || 0;
                        if (score > prev) newHighScores[theme] = score;
                    }

                    const newDuelWins = isDuel && score > opponentScore ? duelWins + 1 : duelWins;
                    const newSprintBest = mode === 'sprint' ? Math.max(sprintBest, sprintCorrect) : sprintBest;

                    // Mark match finished in duel mode
                    if (isDuel && matchId) {
                        supabase
                            .from('quiz_matches')
                            .update({ status: 'finished' })
                            .eq('id', matchId)
                            .then();
                    }

                    // For duel: finalize last round score
                    if (isDuel) {
                        const newRoundScores = [...duelRoundScores];
                        const prevRoundsScore = newRoundScores.slice(0, duelRound).reduce((a, b) => a + b, 0);
                        newRoundScores[duelRound] = score - prevRoundsScore;
                        set({ duelRoundScores: newRoundScores });
                    }

                    set({
                        view: 'result',
                        totalPlayed: totalPlayed + 1,
                        totalWins: isWin ? totalWins + 1 : totalWins,
                        soloHighScores: newHighScores,
                        duelWins: newDuelWins,
                        sprintBest: newSprintBest,
                    });

                    // Check for new badges
                    const updatedState = get();
                    const newBadges = checkBadges(updatedState);
                    if (newBadges.length > 0) {
                        set({
                            unlockedBadges: [...updatedState.unlockedBadges, ...newBadges],
                        });
                    }

                    // Cleanup channel
                    if (channel) {
                        supabase.removeChannel(channel);
                        set({ channel: null });
                    }
                } else {
                    set({
                        currentIndex: currentIndex + 1,
                        timerStart: Date.now(),
                        view: 'playing',
                    });
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
                    view: 'playing',
                });
            },

            submitToLeaderboard: async () => {
                const { player, totalCorrect, totalPlayed, totalWins, score, sprintBest } = get();
                if (!player) return;

                const { error } = await supabase
                    .from('quiz_leaderboard')
                    .upsert({
                        id: player.id,
                        pseudo: player.pseudo,
                        avatar_emoji: player.avatar_emoji,
                        total_score: score,
                        total_correct: totalCorrect,
                        total_played: totalPlayed,
                        total_wins: totalWins,
                        sprint_best: sprintBest,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'id' });

                if (error) console.error('[Quiz] Leaderboard update error:', error);
            },

            resetQuiz: () => {
                const { channel } = get();
                if (channel) supabase.removeChannel(channel);
                set({
                    view: 'home',
                    theme: null,
                    questions: [],
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    matchId: null,
                    matchCode: null,
                    opponent: null,
                    opponentScore: 0,
                    opponentAnswers: [],
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
            partialize: (state) => ({
                player: state.player,
                totalPlayed: state.totalPlayed,
                totalWins: state.totalWins,
                totalCorrect: state.totalCorrect,
                soloHighScores: state.soloHighScores,
                themeStats: state.themeStats,
                unlockedBadges: state.unlockedBadges,
                wrongQuestions: state.wrongQuestions,
                sprintBest: state.sprintBest,
                duelWins: state.duelWins,
                difficulty: state.difficulty,
            }),
        }
    )
);

// Re-export badge list for UI
export { BADGES };
