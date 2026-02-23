import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES, DIFFICULTY_CONFIG } from '../../data/quizTypes';
import type { PowerUpEffect } from '../../data/quizTypes';
import { AudioPlayer } from './AudioPlayer';

export function PlayingView() {
    const { questions, currentIndex, submitAnswer, mode, player, opponent, score, opponentScore, opponentAnswers, difficulty, sprintCorrect, currentStreak, duelRound, duelRounds, powerUps, applyPowerUp, resetQuiz, activeEffects } = useQuizStore();
    const isDuel = mode === 'duel';
    const roundTheme = isDuel && duelRounds.length > 0 ? QUIZ_THEMES.find(t => t.id === duelRounds[duelRound]) : null;
    const question = questions[currentIndex];
    const isSprint = mode === 'sprint';
    const maxTime = isSprint ? 10 : DIFFICULTY_CONFIG[difficulty].timerSeconds;

    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [sprintTime, setSprintTime] = useState(60);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const sprintTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    // Question timer
    useEffect(() => {
        if (isSprint) return; // Sprint uses global timer
        setTimeLeft(maxTime);
        setSelectedIndex(null);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    submitAnswer(-1); // timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [currentIndex, submitAnswer, maxTime, isSprint]);

    // Sprint global timer
    useEffect(() => {
        if (!isSprint) return;
        setSprintTime(60);
        sprintTimerRef.current = setInterval(() => {
            setSprintTime(prev => {
                if (prev <= 1) {
                    clearInterval(sprintTimerRef.current);
                    // End sprint
                    useQuizStore.getState().nextQuestion();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(sprintTimerRef.current);
    }, [isSprint]);

    // Reset selection on question change (sprint)
    useEffect(() => {
        if (isSprint) setSelectedIndex(null);
    }, [currentIndex, isSprint]);

    const handleChoice = (index: number) => {
        if (selectedIndex !== null && !isSprint) return;
        setSelectedIndex(index);
        if (!isSprint) {
            clearInterval(timerRef.current);
            setTimeout(() => submitAnswer(index), 300);
        } else {
            submitAnswer(index);
        }
    };

    const [sandstormActive, setSandstormActive] = useState(false);

    // Watch for offensive effects
    useEffect(() => {
        if (!player || !activeEffects) return;
        const myEffects = activeEffects.filter((e: PowerUpEffect) => e.targetId === player.id);
        const hasSandstorm = myEffects.some((e: PowerUpEffect) => e.type === 'sandstorm' && (Date.now() - e.startTime < e.durationMs));
        setSandstormActive(hasSandstorm);

        // Timer bomb effect
        const bombs = myEffects.filter((e: PowerUpEffect) => e.type === 'timer-bomb');
        if (bombs.length > 0) {
            // Check if we already processed this bomb (simple version: compare count)
            // For now, let's just reduce time if bomb exists (needs more robust tracking for production)
            setTimeLeft(prev => Math.max(1, prev - 5));
        }

        if (hasSandstorm) {
            const timer = setTimeout(() => setSandstormActive(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [activeEffects, player]);

    if (!question) return null;

    const progress = ((currentIndex) / questions.length) * 100;
    const timerPercent = isSprint ? (sprintTime / 60) * 100 : (timeLeft / maxTime) * 100;
    const timerColor = isSprint
        ? (sprintTime > 20 ? '#4CAF50' : sprintTime > 10 ? '#FF9800' : '#f44336')
        : (timeLeft > maxTime * 0.33 ? '#4CAF50' : timeLeft > maxTime * 0.13 ? '#FF9800' : '#f44336');
    const displayTime = isSprint ? sprintTime : timeLeft;

    return (
        <div className="quiz-container quiz-playing">
            {/* Exit button */}
            <button className="quiz-exit-btn" onClick={resetQuiz} title="Quitter le quiz">
                <ArrowLeft size={24} />
            </button>

            {/* Progress + Scores */}
            <div className="quiz-play-header">
                {!isSprint && (
                    <div className="quiz-progress-bar">
                        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                )}
                <div className="quiz-play-meta">
                    {isSprint ? (
                        <div className="quiz-sprint-meta">
                            <span className="quiz-sprint-correct">✅ {sprintCorrect}</span>
                            {currentStreak >= 3 && <span className="quiz-streak-badge">🔥 {currentStreak}</span>}
                        </div>
                    ) : (
                        <span className="quiz-q-counter">
                            {isDuel && roundTheme && <span>{roundTheme.emoji} R{duelRound + 1}/3 — </span>}
                            {currentIndex + 1}/{questions.length}
                        </span>
                    )}
                    {currentStreak >= 3 && !isSprint && (
                        <span className="quiz-streak-badge">🔥 {currentStreak}</span>
                    )}
                    {mode === 'duel' && opponent && (
                        <div className="quiz-duel-scores">
                            <span className="quiz-my-score">{score}</span>
                            <span className="quiz-vs">VS</span>
                            <span className="quiz-opp-score">{opponentScore}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Timer */}
            <div className="quiz-timer">
                <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <circle
                        cx="30" cy="30" r="26"
                        fill="none"
                        stroke={timerColor}
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - timerPercent / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                    />
                </svg>
                <span className="quiz-timer-text">{displayTime}</span>
            </div>

            {/* Question */}
            {question.audioUrl && <AudioPlayer url={question.audioUrl} />}

            <div className="quiz-question-card">
                {question.questionAr && (
                    <p className="quiz-question-ar">{question.questionAr}</p>
                )}
                <p className="quiz-question-fr">{question.questionFr}</p>
            </div>

            {/* Power-Ups */}
            {!isSprint && (mode === 'solo' || mode === 'duel') && (
                <div className="quiz-powerups" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {(mode === 'solo'
                        ? (['50-50', 'time-freeze', 'second-chance'] as const)
                        : (['sandstorm', 'timer-bomb', 'shield'] as const)
                    ).map(id => {
                        const count = powerUps[id] || 0;
                        const icons: Record<string, string> = {
                            '50-50': '🌗',
                            'time-freeze': '❄️',
                            'second-chance': '🛡️',
                            'sandstorm': '🌪️',
                            'timer-bomb': '💣',
                            'shield': '🔰'
                        };
                        return (
                            <button
                                key={id}
                                className={`quiz-powerup-item ${count === 0 ? 'disabled' : ''}`}
                                onClick={() => applyPowerUp(id)}
                                disabled={count === 0}
                                title={id}
                            >
                                <span className="quiz-pu-icon">{icons[id]}</span>
                                <span className="quiz-pu-count">{count}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Choices */}
            <div className={`quiz-choices ${sandstormActive ? 'sandstorm-blur' : ''}`}>
                {question.choices.map((choice, i) => (
                    <button
                        key={i}
                        className={`quiz-choice ${selectedIndex === i ? 'selected' : ''} ${isSprint && selectedIndex === i ? (i === question.correctIndex ? 'sprint-correct' : 'sprint-wrong') : ''}`}
                        onClick={() => handleChoice(i)}
                        disabled={selectedIndex !== null && !isSprint}
                    >
                        <span className="quiz-choice-letter">{'ABCD'[i]}</span>
                        <span className="quiz-choice-text">{choice}</span>
                    </button>
                ))}
            </div>

            {/* Opponent progress in duel */}
            {mode === 'duel' && opponent && (
                <div className="quiz-opp-progress">
                    <span>{opponent.avatar_emoji} {opponent.pseudo}</span>
                    <span>{opponentAnswers.length}/{questions.length} réponses</span>
                </div>
            )}
        </div>
    );
}
