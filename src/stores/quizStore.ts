// Quiz Store — Zustand state management for solo + duel modes
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { getQuestions, calculateScore } from '../lib/quizEngine';
import type { QuizQuestion, QuizThemeId, QuizAnswer, QuizPlayer } from '../data/quizTypes';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type QuizView =
    | 'home'        // Theme selection
    | 'mode'        // Solo vs Duel
    | 'lobby'       // Waiting for opponent
    | 'join'        // Enter code to join
    | 'playing'     // Active quiz
    | 'feedback'    // Answer feedback (correct/wrong)
    | 'roundEnd'    // End of round summary
    | 'result';     // Final match result

interface QuizState {
    // Player
    player: QuizPlayer | null;
    setPlayer: (p: QuizPlayer) => void;

    // View
    view: QuizView;
    setView: (v: QuizView) => void;

    // Game state
    mode: 'solo' | 'duel';
    theme: QuizThemeId | null;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: QuizAnswer[];
    score: number;
    timerStart: number;

    // Duel state
    matchId: string | null;
    matchCode: string | null;
    opponent: QuizPlayer | null;
    opponentScore: number;
    opponentAnswers: QuizAnswer[];
    channel: RealtimeChannel | null;

    // Actions
    selectTheme: (theme: QuizThemeId) => void;
    startSolo: () => void;
    createDuel: () => Promise<string>;
    joinDuel: (code: string) => Promise<boolean>;
    submitAnswer: (chosenIndex: number) => void;
    nextQuestion: () => void;
    resetQuiz: () => void;

    // Stats
    totalPlayed: number;
    totalWins: number;
    soloHighScores: Record<string, number>;
}

function generateCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
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
            theme: null,
            questions: [],
            currentIndex: 0,
            answers: [],
            score: 0,
            timerStart: 0,

            // Duel
            matchId: null,
            matchCode: null,
            opponent: null,
            opponentScore: 0,
            opponentAnswers: [],
            channel: null,

            // Stats
            totalPlayed: 0,
            totalWins: 0,
            soloHighScores: {},

            selectTheme: (theme) => set({ theme, view: 'mode' }),

            startSolo: () => {
                const { theme } = get();
                if (!theme) return;
                const questions = getQuestions(theme, 5);
                set({
                    mode: 'solo',
                    questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    timerStart: Date.now(),
                    view: 'playing',
                });
            },

            createDuel: async () => {
                const { theme, player } = get();
                if (!theme || !player) return '';

                const code = generateCode();
                const questions = getQuestions(theme, 5);

                const { data, error } = await supabase
                    .from('quiz_matches')
                    .insert({
                        code,
                        status: 'waiting',
                        theme,
                        questions,
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
                            set({
                                opponent: {
                                    id: match.player2_id,
                                    pseudo: match.player2_pseudo || 'Adversaire',
                                    avatar_emoji: match.player2_emoji || '🎓',
                                    total_wins: 0,
                                    total_played: 0,
                                },
                                questions: match.questions,
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
                    questions,
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
                    theme: match.theme,
                    questions: match.questions,
                    currentIndex: 0,
                    answers: [],
                    score: 0,
                    timerStart: Date.now(),
                    view: 'playing',
                });

                return true;
            },

            submitAnswer: (chosenIndex) => {
                const { questions, currentIndex, answers, score, timerStart, mode, matchId, player } = get();
                const question = questions[currentIndex];
                if (!question) return;

                const timeMs = Date.now() - timerStart;
                const correct = chosenIndex === question.correctIndex;
                const points = calculateScore(correct, timeMs);

                const answer: QuizAnswer = {
                    questionId: question.id,
                    chosenIndex,
                    correct,
                    timeMs,
                };

                const newAnswers = [...answers, answer];
                const newScore = score + points;

                set({
                    answers: newAnswers,
                    score: newScore,
                    view: 'feedback',
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
            },

            nextQuestion: () => {
                const { currentIndex, questions, mode, score, totalPlayed, totalWins, opponentScore, soloHighScores, theme, matchId, channel } = get();

                if (currentIndex + 1 >= questions.length) {
                    // End of round
                    const isWin = mode === 'solo' || score > opponentScore;
                    const newHighScores = { ...soloHighScores };
                    if (mode === 'solo' && theme) {
                        const prev = newHighScores[theme] || 0;
                        if (score > prev) newHighScores[theme] = score;
                    }

                    // Mark match finished in duel mode
                    if (mode === 'duel' && matchId) {
                        supabase
                            .from('quiz_matches')
                            .update({ status: 'finished' })
                            .eq('id', matchId)
                            .then();
                    }

                    set({
                        view: 'result',
                        totalPlayed: totalPlayed + 1,
                        totalWins: isWin ? totalWins + 1 : totalWins,
                        soloHighScores: newHighScores,
                    });

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
                });
            },
        }),
        {
            name: 'quiz-store',
            partialize: (state) => ({
                player: state.player,
                totalPlayed: state.totalPlayed,
                totalWins: state.totalWins,
                soloHighScores: state.soloHighScores,
            }),
        }
    )
);
