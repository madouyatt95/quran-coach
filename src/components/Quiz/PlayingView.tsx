import {Pupitre,PupitreTop,PupitreBottom} from '../Pupitre/Pupitre';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES, DIFFICULTY_CONFIG } from '../../data/quizTypes';
import type { PowerUpEffect } from '../../data/quizTypes';
import { AudioPlayer } from './AudioPlayer';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function PlayingView() {
    const { questions, currentIndex, submitAnswer, mode, player, opponent, score, opponentScore, opponentAnswers, difficulty, sprintCorrect, currentStreak, duelRound, duelRounds, powerUps, applyPowerUp, resetQuiz, activeEffects } = useQuizStore();
    const isDuel = mode === 'duel';
    const roundTheme = isDuel && duelRounds.length > 0 ? QUIZ_THEMES.find(t => t.id === duelRounds[duelRound]) : null;
    const question = questions[currentIndex];
    const isSprint = mode === 'sprint';
    const untimed = mode==='revision'||mode==='sira';
    const [heardId,setHeardId]=useState<string|null>(null);
    const [retry,setRetry]=useState(false);
    const submittedRef=useRef<number|null>(null);
    const waitingAudio=!!question?.audioUrl&&heardId!==question.id;
    const maxTime = isSprint ? 10 : DIFFICULTY_CONFIG[difficulty].timerSeconds;

    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [sprintTime, setSprintTime] = useState(60);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const remainingRef=useRef(maxTime*1000);
    const sprintTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useEffect(()=>{setSelectedIndex(null);setRetry(false);submittedRef.current=null;},[currentIndex]);
    // Keep countdown paused until the complete excerpt has been heard.
    useEffect(() => {
        if (isSprint || untimed || waitingAudio) return;
        setTimeLeft(maxTime);
        let previous=Date.now();remainingRef.current=maxTime*1000;
        const interval=setInterval(()=>{
            const now=Date.now(),freeze=useQuizStore.getState().freezeUntil;
            remainingRef.current=Math.max(0,remainingRef.current-Math.max(0,now-Math.max(previous,freeze)));
            previous=now;setTimeLeft(Math.ceil(remainingRef.current/1000));
        },200);
        timerRef.current=interval;
        return()=>clearInterval(interval);
    },[currentIndex,maxTime,isSprint,untimed,waitingAudio]);
    useEffect(()=>{if(!isSprint&&!untimed&&!waitingAudio&&timeLeft===0)submitAnswer(-1);},[timeLeft,isSprint,untimed,waitingAudio,submitAnswer]);

    useEffect(()=>{
        if(!isSprint)return;
        const deadline=Date.now()+60000;
        sprintTimerRef.current=setInterval(()=>{
            const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setSprintTime(left);
            if(!left){clearInterval(sprintTimerRef.current);void useQuizStore.getState().nextQuestion();}
        },200);
        return()=>clearInterval(sprintTimerRef.current);
    },[isSprint]);

    // Reset selection on question change (sprint)
    useEffect(() => {
        if (isSprint) setSelectedIndex(null);
    }, [currentIndex, isSprint]);

    const handleChoice = (index: number) => {
        if (submittedRef.current===currentIndex || selectedIndex !== null && !isSprint || waitingAudio) return;
        if(useQuizStore.getState().secondChance && index!==question.correctIndex){submitAnswer(index);setRetry(true);return;}

        if (Capacitor.isNativePlatform()) {
            if (index === question.correctIndex) {
                 Haptics.impact({ style: ImpactStyle.Medium });
            } else {
                 Haptics.impact({ style: ImpactStyle.Heavy }); // Heavy for wrong answer
            }
        }

        submittedRef.current=currentIndex;
        setSelectedIndex(index);
        if (!isSprint) {
            clearInterval(timerRef.current);
            submitAnswer(index);
        } else {
            submitAnswer(index);
        }
    };

    const [sandstormActive, setSandstormActive] = useState(false);
    const processedEffectsRef = useRef<Set<string>>(new Set());

    // Watch for offensive effects
    useEffect(() => {
        if (!player || !activeEffects || activeEffects.length === 0) return;

        const myEffects = activeEffects.filter((e: PowerUpEffect) => e.targetId === player.id);
        const now = Date.now();

        myEffects.forEach((e: PowerUpEffect) => {
            if (processedEffectsRef.current.has(e.id)) return;

            // Mark as processed immediately
            processedEffectsRef.current.add(e.id);

            if (e.type === 'sandstorm' && (now - e.startTime < e.durationMs)) {
                setSandstormActive(true);
                setTimeout(() => setSandstormActive(false), e.durationMs);
            }

            if (e.type === 'timer-bomb') {
                // Apply bomb only once per receipt
                remainingRef.current=Math.max(1000,remainingRef.current-5000);
                setTimeLeft(Math.ceil(remainingRef.current/1000));
            }

            if (e.type === 'shield') {
                // Shield can clear current offensive effects
                setSandstormActive(false);
            }
        });
    }, [activeEffects, player]);

    if (!question) return null;

    const progress = ((currentIndex) / questions.length) * 100;
    const timerPercent = isSprint ? (sprintTime / 60) * 100 : (timeLeft / maxTime) * 100;
    const timerColor = isSprint
        ? (sprintTime > 20 ? '#4CAF50' : sprintTime > 10 ? '#FF9800' : '#f44336')
        : (timeLeft > maxTime * 0.33 ? '#4CAF50' : timeLeft > maxTime * 0.13 ? '#FF9800' : '#f44336');
    const displayTime = isSprint ? sprintTime : timeLeft;

    return (
        <Pupitre activity="quiz" title="Quiz · répondre" className="quiz-container quiz-playing"><PupitreTop aria-label="Question et progression">
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
            {!untimed && !waitingAudio && <div className="quiz-timer">
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

            }
            {waitingAudio&&<p>Le temps de réponse commence à la fin de l’extrait.</p>}
            {retry&&<p role="status">Seconde chance : essaie une autre réponse.</p>}
            {/* Question */}


            <div className="quiz-question-card">
                {question.questionAr && (
                    <p className="quiz-question-ar">{question.questionAr}</p>
                )}
                <p className="quiz-question-fr">{question.questionFr}</p>
            </div>

            </PupitreTop><PupitreBottom aria-label="Réponses et aides">
            {question.audioUrl && <AudioPlayer key={question.id} url={question.audioUrl} onListened={()=>{setHeardId(question.id);useQuizStore.setState({timerStart:Date.now()});}} />}
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
                        disabled={waitingAudio || selectedIndex !== null && !isSprint}
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
        </PupitreBottom></Pupitre>
    );
}
