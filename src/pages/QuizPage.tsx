import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Swords, User, Trophy, Clock, CheckCircle, XCircle, Copy, Share2, RotateCcw, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../stores/quizStore';
import { QUIZ_THEMES } from '../data/quizTypes';
import { getQuestionCounts } from '../lib/quizEngine';

import './QuizPage.css';

// ─── Pseudo Setup Modal ──────────────────────────────────
function PseudoSetup({ onDone }: { onDone: () => void }) {
    const { setPlayer } = useQuizStore();
    const [pseudo, setPseudo] = useState('');
    const [emoji, setEmoji] = useState('🎓');
    const emojis = ['🎓', '🕌', '📖', '⭐', '🌙', '🤲', '🏆', '💎', '🦁', '🌟', '🔥', '👑'];

    const handleSubmit = () => {
        if (pseudo.trim().length < 2) return;
        setPlayer({
            id: crypto.randomUUID(),
            pseudo: pseudo.trim(),
            avatar_emoji: emoji,
            total_wins: 0,
            total_played: 0,
        });
        onDone();
    };

    return (
        <div className="quiz-pseudo-setup">
            <div className="quiz-pseudo-card">
                <h2>Choisis ton pseudo</h2>
                <div className="quiz-emoji-grid">
                    {emojis.map(e => (
                        <button
                            key={e}
                            className={`quiz-emoji-btn ${emoji === e ? 'active' : ''}`}
                            onClick={() => setEmoji(e)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    className="quiz-pseudo-input"
                    placeholder="Ton pseudo..."
                    value={pseudo}
                    onChange={e => setPseudo(e.target.value)}
                    maxLength={15}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                />
                <button
                    className="quiz-btn-primary"
                    onClick={handleSubmit}
                    disabled={pseudo.trim().length < 2}
                >
                    C'est parti !
                </button>
            </div>
        </div>
    );
}

// ─── Theme Selection ─────────────────────────────────────
function ThemeSelect() {
    const { selectTheme, player, totalPlayed, totalWins, soloHighScores } = useQuizStore();
    const navigate = useNavigate();
    const counts = getQuestionCounts();

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <Swords size={24} />
                    <span>Duel Quiz</span>
                </h1>
                <div className="quiz-player-badge">
                    <span className="quiz-player-emoji">{player?.avatar_emoji}</span>
                    <span className="quiz-player-name">{player?.pseudo}</span>
                </div>
            </div>

            {totalPlayed > 0 && (
                <div className="quiz-stats-bar">
                    <div className="quiz-stat">
                        <Trophy size={14} />
                        <span>{totalWins} victoires</span>
                    </div>
                    <div className="quiz-stat">
                        <Zap size={14} />
                        <span>{totalPlayed} parties</span>
                    </div>
                </div>
            )}

            <p className="quiz-subtitle">Choisis un thème</p>

            <div className="quiz-theme-grid">
                {QUIZ_THEMES.map(theme => (
                    <button
                        key={theme.id}
                        className="quiz-theme-card"
                        style={{ background: theme.gradient }}
                        onClick={() => selectTheme(theme.id)}
                    >
                        <span className="quiz-theme-emoji">{theme.emoji}</span>
                        <span className="quiz-theme-name">{theme.name}</span>
                        <span className="quiz-theme-nameAr">{theme.nameAr}</span>
                        <span className="quiz-theme-count">{counts[theme.id]} questions</span>
                        {soloHighScores[theme.id] && (
                            <span className="quiz-theme-high">
                                <Crown size={10} /> {soloHighScores[theme.id]}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Mode Selection ──────────────────────────────────────
function ModeSelect() {
    const { startSolo, setView, theme } = useQuizStore();
    const themeData = QUIZ_THEMES.find(t => t.id === theme);

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <span>{themeData?.emoji}</span>
                    <span>{themeData?.name}</span>
                </h1>
            </div>

            <div className="quiz-mode-cards">
                <button className="quiz-mode-card solo" onClick={startSolo}>
                    <User size={40} />
                    <h3>Solo</h3>
                    <p>Entraîne-toi seul</p>
                    <span className="quiz-mode-detail">5 questions • 15s/question</span>
                </button>
                <button className="quiz-mode-card duel" onClick={() => setView('lobby')}>
                    <Swords size={40} />
                    <h3>Duel</h3>
                    <p>Défie un ami</p>
                    <span className="quiz-mode-detail">Temps réel • Code de partie</span>
                </button>
            </div>

            <button className="quiz-join-btn" onClick={() => setView('join')}>
                Rejoindre un duel (code)
            </button>
        </div>
    );
}

// ─── Duel Lobby ──────────────────────────────────────────
function DuelLobby() {
    const { matchCode, createDuel, setView, opponent } = useQuizStore();
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!matchCode && !creating) {
            setCreating(true);
            createDuel().then(() => setCreating(false));
        }
    }, [matchCode, creating, createDuel]);

    const copyCode = async () => {
        if (matchCode) {
            await navigator.clipboard.writeText(matchCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareCode = async () => {
        if (matchCode && typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: 'Duel Quiz - Quran Coach',
                    text: `Rejoins mon duel ! Code: ${matchCode}`,
                });
            } catch { /* user cancelled */ }
        }
    };

    if (opponent) return null; // Will transition to playing

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('mode')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Duel</h1>
            </div>

            <div className="quiz-lobby">
                {creating ? (
                    <div className="quiz-lobby-loading">
                        <div className="quiz-spinner" />
                        <p>Création de la partie...</p>
                    </div>
                ) : (
                    <>
                        <p className="quiz-lobby-label">Code de la partie</p>
                        <div className="quiz-code-display">
                            {matchCode?.split('').map((char, i) => (
                                <span key={i} className="quiz-code-char">{char}</span>
                            ))}
                        </div>
                        <div className="quiz-lobby-actions">
                            <button className="quiz-btn-secondary" onClick={copyCode}>
                                <Copy size={18} />
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                            {typeof navigator.share === 'function' && (
                                <button className="quiz-btn-secondary" onClick={shareCode}>
                                    <Share2 size={18} />
                                    Partager
                                </button>
                            )}
                        </div>
                        <div className="quiz-lobby-waiting">
                            <div className="quiz-spinner" />
                            <p>En attente d'un adversaire...</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Join Duel ───────────────────────────────────────────
function JoinDuel() {
    const { joinDuel, setView } = useQuizStore();
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        if (code.length < 6) return;
        setJoining(true);
        setError('');
        const success = await joinDuel(code);
        if (!success) {
            setError('Partie introuvable ou déjà commencée');
            setJoining(false);
        }
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('mode')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Rejoindre</h1>
            </div>

            <div className="quiz-join">
                <p className="quiz-join-label">Entre le code de la partie</p>
                <input
                    type="text"
                    className="quiz-join-input"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="ABC123"
                    maxLength={6}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                {error && <p className="quiz-join-error">{error}</p>}
                <button
                    className="quiz-btn-primary"
                    onClick={handleJoin}
                    disabled={code.length < 6 || joining}
                >
                    {joining ? 'Connexion...' : 'Rejoindre'}
                </button>
            </div>
        </div>
    );
}

// ─── Playing View ────────────────────────────────────────
function PlayingView() {
    const { questions, currentIndex, submitAnswer, mode, opponent, opponentAnswers, score, opponentScore } = useQuizStore();
    const question = questions[currentIndex];
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useEffect(() => {
        setTimeLeft(15);
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
    }, [currentIndex, submitAnswer]);

    const handleChoice = (index: number) => {
        if (selectedIndex !== null) return;
        setSelectedIndex(index);
        clearInterval(timerRef.current);
        setTimeout(() => submitAnswer(index), 300);
    };

    if (!question) return null;

    const progress = ((currentIndex) / questions.length) * 100;
    const timerPercent = (timeLeft / 15) * 100;
    const timerColor = timeLeft > 5 ? '#4CAF50' : timeLeft > 2 ? '#FF9800' : '#f44336';

    return (
        <div className="quiz-container quiz-playing">
            {/* Progress + Scores */}
            <div className="quiz-play-header">
                <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="quiz-play-meta">
                    <span className="quiz-q-counter">{currentIndex + 1}/{questions.length}</span>
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
                <span className="quiz-timer-text">{timeLeft}</span>
            </div>

            {/* Question */}
            <div className="quiz-question-card">
                {question.questionAr && (
                    <p className="quiz-question-ar">{question.questionAr}</p>
                )}
                <p className="quiz-question-fr">{question.questionFr}</p>
            </div>

            {/* Choices */}
            <div className="quiz-choices">
                {question.choices.map((choice, i) => (
                    <button
                        key={i}
                        className={`quiz-choice ${selectedIndex === i ? 'selected' : ''}`}
                        onClick={() => handleChoice(i)}
                        disabled={selectedIndex !== null}
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

// ─── Feedback View ───────────────────────────────────────
function FeedbackView() {
    const { questions, currentIndex, answers, nextQuestion } = useQuizStore();
    const question = questions[currentIndex];
    const answer = answers[answers.length - 1];

    useEffect(() => {
        const timer = setTimeout(nextQuestion, 2000);
        return () => clearTimeout(timer);
    }, [nextQuestion]);

    if (!question || !answer) return null;

    return (
        <div className={`quiz-container quiz-feedback ${answer.correct ? 'correct' : 'wrong'}`}>
            <div className="quiz-feedback-icon">
                {answer.correct ? (
                    <CheckCircle size={80} className="quiz-icon-correct" />
                ) : (
                    <XCircle size={80} className="quiz-icon-wrong" />
                )}
            </div>
            <h2 className="quiz-feedback-title">
                {answer.correct ? 'Correct !' : 'Faux !'}
            </h2>
            {!answer.correct && (
                <p className="quiz-feedback-answer">
                    Réponse : <strong>{question.choices[question.correctIndex]}</strong>
                </p>
            )}
            {question.explanation && (
                <p className="quiz-feedback-explanation">{question.explanation}</p>
            )}
            <p className="quiz-feedback-next">Question suivante...</p>
        </div>
    );
}

// ─── Result View ─────────────────────────────────────────
function ResultView() {
    const { score, answers, mode, opponent, opponentScore, resetQuiz, theme, player } = useQuizStore();
    const correctCount = answers.filter(a => a.correct).length;
    const total = answers.length;
    const themeData = QUIZ_THEMES.find(t => t.id === theme);
    const isWinner = mode === 'solo' || score >= opponentScore;

    return (
        <div className="quiz-container quiz-result">
            <div className="quiz-result-top">
                {isWinner && <div className="quiz-crown-anim">👑</div>}
                <h1 className="quiz-result-title">
                    {mode === 'duel'
                        ? (score > opponentScore ? 'Victoire !' : score === opponentScore ? 'Égalité !' : 'Défaite')
                        : 'Résultat'}
                </h1>
            </div>

            {mode === 'duel' && opponent && (
                <div className="quiz-result-vs">
                    <div className="quiz-result-player">
                        <span className="quiz-result-emoji">{player?.avatar_emoji}</span>
                        <span className="quiz-result-pseudo">{player?.pseudo}</span>
                        <span className="quiz-result-score">{score}</span>
                    </div>
                    <span className="quiz-result-versus">VS</span>
                    <div className="quiz-result-player">
                        <span className="quiz-result-emoji">{opponent.avatar_emoji}</span>
                        <span className="quiz-result-pseudo">{opponent.pseudo}</span>
                        <span className="quiz-result-score">{opponentScore}</span>
                    </div>
                </div>
            )}

            <div className="quiz-result-stats">
                <div className="quiz-result-stat">
                    <Trophy size={20} />
                    <span>{score} points</span>
                </div>
                <div className="quiz-result-stat">
                    <CheckCircle size={20} />
                    <span>{correctCount}/{total} bonnes réponses</span>
                </div>
                <div className="quiz-result-stat">
                    <Clock size={20} />
                    <span>{Math.round(answers.reduce((s, a) => s + a.timeMs, 0) / 1000)}s total</span>
                </div>
            </div>

            <div className="quiz-result-theme">
                <span>{themeData?.emoji}</span>
                <span>{themeData?.name}</span>
            </div>

            <div className="quiz-result-actions">
                <button className="quiz-btn-primary" onClick={resetQuiz}>
                    <RotateCcw size={18} />
                    Nouvelle partie
                </button>
            </div>
        </div>
    );
}

// ─── Main Quiz Page ──────────────────────────────────────
export function QuizPage() {
    const { view, player } = useQuizStore();
    const [showSetup, setShowSetup] = useState(!player);

    if (showSetup || !player) {
        return <PseudoSetup onDone={() => setShowSetup(false)} />;
    }

    switch (view) {
        case 'home':
            return <ThemeSelect />;
        case 'mode':
            return <ModeSelect />;
        case 'lobby':
            return <DuelLobby />;
        case 'join':
            return <JoinDuel />;
        case 'playing':
            return <PlayingView />;
        case 'feedback':
            return <FeedbackView />;
        case 'result':
            return <ResultView />;
        default:
            return <ThemeSelect />;
    }
}
