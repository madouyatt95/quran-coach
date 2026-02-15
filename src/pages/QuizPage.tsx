import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Swords, User, Trophy, Clock, CheckCircle, XCircle, Copy, Share2, RotateCcw, Zap, Crown, BarChart3, Award, Globe, Timer, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore, BADGES } from '../stores/quizStore';
import { QUIZ_THEMES, DIFFICULTY_CONFIG } from '../data/quizTypes';
import type { QuizDifficulty } from '../data/quizTypes';
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

// ─── Theme Selection (Home) ─────────────────────────────
function ThemeSelect() {
    const { selectTheme, player, totalPlayed, totalWins, soloHighScores, setView, wrongQuestions, unlockedBadges, sprintBest, themeStats } = useQuizStore();
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

            {/* Quick Stats Bar */}
            {totalPlayed > 0 && (
                <div className="quiz-stats-bar">
                    <div className="quiz-stat" onClick={() => setView('stats')}>
                        <BarChart3 size={14} />
                        <span>{totalWins}/{totalPlayed}</span>
                    </div>
                    <div className="quiz-stat" onClick={() => setView('badges')}>
                        <Award size={14} />
                        <span>{unlockedBadges.length}/{BADGES.length}</span>
                    </div>
                    <div className="quiz-stat" onClick={() => setView('leaderboard')}>
                        <Globe size={14} />
                        <span>Classement</span>
                    </div>
                </div>
            )}

            {/* Special Modes */}
            <div className="quiz-special-modes">
                <button className="quiz-special-card sprint-card" onClick={() => {
                    useQuizStore.getState().startSprint();
                }}>
                    <Timer size={24} />
                    <div>
                        <h4>⚡ Sprint</h4>
                        <p>60s • Tous thèmes</p>
                    </div>
                    {sprintBest > 0 && <span className="quiz-special-best">🏆 {sprintBest}</span>}
                </button>
                {wrongQuestions.length > 0 && (
                    <button className="quiz-special-card revision-card" onClick={() => {
                        useQuizStore.getState().startRevision();
                    }}>
                        <BookOpen size={24} />
                        <div>
                            <h4>📝 Révision</h4>
                            <p>{wrongQuestions.length} erreurs</p>
                        </div>
                    </button>
                )}
            </div>

            <p className="quiz-subtitle">Choisis un thème</p>

            <div className="quiz-theme-grid">
                {QUIZ_THEMES.map(theme => {
                    const stats = themeStats[theme.id];
                    const rate = stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
                    return (
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
                            <div className="quiz-theme-meta">
                                {soloHighScores[theme.id] && (
                                    <span className="quiz-theme-high">
                                        <Crown size={10} /> {soloHighScores[theme.id]}
                                    </span>
                                )}
                                {rate !== null && (
                                    <span className="quiz-theme-rate">{rate}%</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Stats Dashboard ─────────────────────────────────────
function StatsView() {
    const { themeStats, totalPlayed, totalWins, totalCorrect, setView, sprintBest, duelWins } = useQuizStore();

    // Radar chart data
    const themes = QUIZ_THEMES;
    const radarData = themes.map(t => {
        const stats = themeStats[t.id];
        if (!stats || stats.attempts === 0) return 0;
        return Math.round((stats.correct / stats.attempts) * 100);
    });
    const maxVal = 100;
    const cx = 150, cy = 150, r = 100;

    const polarToXY = (angle: number, value: number) => {
        const a = (angle - 90) * Math.PI / 180;
        const dist = (value / maxVal) * r;
        return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) };
    };

    const angleStep = 360 / themes.length;
    const radarPoints = radarData.map((v, i) => polarToXY(i * angleStep, v));
    const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <BarChart3 size={24} />
                    <span>Statistiques</span>
                </h1>
            </div>

            {/* Global Stats */}
            <div className="quiz-global-stats">
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{totalPlayed}</span>
                    <span className="quiz-gstat-label">Parties</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{totalWins}</span>
                    <span className="quiz-gstat-label">Victoires</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{totalCorrect}</span>
                    <span className="quiz-gstat-label">Correctes</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{duelWins}</span>
                    <span className="quiz-gstat-label">Duels gagnés</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{sprintBest}</span>
                    <span className="quiz-gstat-label">Sprint record</span>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="quiz-radar-container">
                <h3>Performance par thème</h3>
                <svg viewBox="0 0 300 300" className="quiz-radar-svg">
                    {/* Grid circles */}
                    {[25, 50, 75, 100].map(pct => (
                        <circle key={pct} cx={cx} cy={cy} r={r * pct / 100}
                            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    ))}
                    {/* Axis lines */}
                    {themes.map((_, i) => {
                        const p = polarToXY(i * angleStep, 100);
                        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
                            stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
                    })}
                    {/* Data polygon */}
                    <path d={radarPath} fill="rgba(76,175,80,0.3)" stroke="#4CAF50" strokeWidth="2" />
                    {/* Data points */}
                    {radarPoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={4} fill={themes[i].color} />
                    ))}
                    {/* Labels */}
                    {themes.map((t, i) => {
                        const p = polarToXY(i * angleStep, 120);
                        return (
                            <text key={i} x={p.x} y={p.y} textAnchor="middle"
                                fill="var(--text-primary, #fff)" fontSize="10" fontWeight="600">
                                {t.emoji}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Per-theme details */}
            <div className="quiz-theme-stats-list">
                {themes.map(t => {
                    const stats = themeStats[t.id];
                    const rate = stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
                    return (
                        <div key={t.id} className="quiz-theme-stat-row">
                            <span className="quiz-tstat-emoji">{t.emoji}</span>
                            <div className="quiz-tstat-info">
                                <span className="quiz-tstat-name">{t.name}</span>
                                <div className="quiz-tstat-bar">
                                    <div className="quiz-tstat-fill" style={{ width: `${rate}%`, background: t.color }} />
                                </div>
                            </div>
                            <div className="quiz-tstat-numbers">
                                <span className="quiz-tstat-pct">{rate}%</span>
                                <span className="quiz-tstat-count">{stats?.correct || 0}/{stats?.attempts || 0}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Badge Gallery ───────────────────────────────────────
function BadgeView() {
    const { unlockedBadges, setView } = useQuizStore();
    const unlocked = new Set(unlockedBadges);

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <Award size={24} />
                    <span>Badges ({unlockedBadges.length}/{BADGES.length})</span>
                </h1>
            </div>

            <div className="quiz-badge-grid">
                {BADGES.map(badge => {
                    const isUnlocked = unlocked.has(badge.id);
                    return (
                        <div key={badge.id} className={`quiz-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                            <span className="quiz-badge-emoji">{badge.emoji}</span>
                            <span className="quiz-badge-name">{badge.name}</span>
                            <span className="quiz-badge-desc">{badge.description}</span>
                            {isUnlocked && <span className="quiz-badge-check">✓</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Leaderboard ─────────────────────────────────────────
function LeaderboardView() {
    const { setView, player, totalCorrect, sprintBest, totalPlayed, totalWins, submitToLeaderboard } = useQuizStore();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Submit own score first, then fetch
        submitToLeaderboard().then(async () => {
            try {
                const { supabase } = await import('../lib/supabase');
                const { data } = await supabase
                    .from('quiz_leaderboard')
                    .select('*')
                    .order('total_correct', { ascending: false })
                    .limit(50);
                setEntries(data || []);
            } catch {
                // Table may not exist yet
            }
            setLoading(false);
        });
    }, [submitToLeaderboard]);

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <Globe size={24} />
                    <span>Classement</span>
                </h1>
            </div>

            {/* My Stats Card */}
            <div className="quiz-my-leaderboard">
                <span className="quiz-lb-emoji">{player?.avatar_emoji}</span>
                <span className="quiz-lb-pseudo">{player?.pseudo}</span>
                <div className="quiz-lb-my-stats">
                    <span>✅ {totalCorrect}</span>
                    <span>🏆 {totalWins}/{totalPlayed}</span>
                    <span>⚡ {sprintBest}</span>
                </div>
            </div>

            {loading ? (
                <div className="quiz-lobby-loading">
                    <div className="quiz-spinner" />
                    <p>Chargement...</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="quiz-empty-lb">
                    <p>🏆 Aucun joueur dans le classement pour le moment.</p>
                    <p>Joue une partie pour apparaître !</p>
                </div>
            ) : (
                <div className="quiz-leaderboard-list">
                    {entries.map((entry, i) => (
                        <div key={entry.id} className={`quiz-lb-row ${entry.id === player?.id ? 'quiz-lb-me' : ''}`}>
                            <span className="quiz-lb-rank">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </span>
                            <span className="quiz-lb-avatar">{entry.avatar_emoji}</span>
                            <div className="quiz-lb-info">
                                <span className="quiz-lb-name">{entry.pseudo}</span>
                                <span className="quiz-lb-detail">
                                    {entry.total_correct} correctes • {entry.total_wins} victoires
                                </span>
                            </div>
                            <span className="quiz-lb-sprint">⚡{entry.sprint_best || 0}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Mode Selection ──────────────────────────────────────
function ModeSelect() {
    const { startSolo, setView, theme, difficulty, setDifficulty } = useQuizStore();
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

            {/* Difficulty Selector */}
            <div className="quiz-difficulty-row">
                {(Object.keys(DIFFICULTY_CONFIG) as QuizDifficulty[]).map(d => {
                    const cfg = DIFFICULTY_CONFIG[d];
                    return (
                        <button
                            key={d}
                            className={`quiz-diff-btn ${difficulty === d ? 'active' : ''}`}
                            onClick={() => setDifficulty(d)}
                        >
                            <span className="quiz-diff-emoji">{cfg.emoji}</span>
                            <span className="quiz-diff-label">{cfg.label}</span>
                            <span className="quiz-diff-detail">
                                {cfg.choiceCount} choix • {cfg.timerSeconds}s
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="quiz-mode-cards">
                <button className="quiz-mode-card solo" onClick={startSolo}>
                    <User size={40} />
                    <h3>Solo</h3>
                    <p>Entraîne-toi seul</p>
                    <span className="quiz-mode-detail">
                        {DIFFICULTY_CONFIG[difficulty].questionCount} questions • {DIFFICULTY_CONFIG[difficulty].timerSeconds}s/question
                    </span>
                </button>
                <button className="quiz-mode-card duel" onClick={() => setView('lobby')}>
                    <Swords size={40} />
                    <h3>Duel</h3>
                    <p>Défie un ami</p>
                    <span className="quiz-mode-detail">3 rounds × thèmes variés • Temps réel</span>
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
    const store = useQuizStore();
    const { questions, currentIndex, submitAnswer, mode, opponent, score, opponentScore, difficulty, sprintCorrect, currentStreak, duelRound, duelRounds } = store;
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

    if (!question) return null;

    const progress = ((currentIndex) / questions.length) * 100;
    const timerPercent = isSprint ? (sprintTime / 60) * 100 : (timeLeft / maxTime) * 100;
    const timerColor = isSprint
        ? (sprintTime > 20 ? '#4CAF50' : sprintTime > 10 ? '#FF9800' : '#f44336')
        : (timeLeft > maxTime * 0.33 ? '#4CAF50' : timeLeft > maxTime * 0.13 ? '#FF9800' : '#f44336');
    const displayTime = isSprint ? sprintTime : timeLeft;

    return (
        <div className="quiz-container quiz-playing">
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
                    <span>{store.opponentAnswers.length}/{questions.length} réponses</span>
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
    const { score, answers, mode, opponent, opponentScore, resetQuiz, theme, player, sprintCorrect, sprintBest, unlockedBadges, currentStreak } = useQuizStore();
    const correctCount = answers.filter(a => a.correct).length;
    const total = answers.length;
    const themeData = QUIZ_THEMES.find(t => t.id === theme);
    const isWinner = mode === 'solo' || mode === 'sprint' || mode === 'revision' || score >= opponentScore;
    const isSprint = mode === 'sprint';
    const isRevision = mode === 'revision';

    // Check for newly unlocked badges (last few)
    const [newBadges] = useState(() => {
        // Show last unlocked badges as "new"
        return unlockedBadges.slice(-3);
    });

    return (
        <div className="quiz-container quiz-result">
            <div className="quiz-result-top">
                {isWinner && <div className="quiz-crown-anim">👑</div>}
                <h1 className="quiz-result-title">
                    {isSprint
                        ? `⚡ Sprint terminé !`
                        : isRevision
                            ? 'Révision terminée'
                            : mode === 'duel'
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
                {isSprint ? (
                    <>
                        <div className="quiz-result-stat">
                            <Zap size={20} />
                            <span>{sprintCorrect} bonnes réponses</span>
                        </div>
                        <div className="quiz-result-stat">
                            <Trophy size={20} />
                            <span>Record : {sprintBest}</span>
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
                {currentStreak >= 3 && (
                    <div className="quiz-result-stat">
                        <Zap size={20} />
                        <span>🔥 Meilleur streak : {currentStreak}</span>
                    </div>
                )}
            </div>

            {!isSprint && themeData && (
                <div className="quiz-result-theme">
                    <span>{themeData.emoji}</span>
                    <span>{themeData.name}</span>
                </div>
            )}

            {/* New Badges */}
            {newBadges.length > 0 && (
                <div className="quiz-new-badges">
                    <h3>🏅 Badges débloqués</h3>
                    <div className="quiz-new-badge-list">
                        {newBadges.map(id => {
                            const badge = BADGES.find(b => b.id === id);
                            if (!badge) return null;
                            return (
                                <div key={id} className="quiz-new-badge">
                                    <span>{badge.emoji}</span>
                                    <span>{badge.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="quiz-result-actions">
                <button className="quiz-btn-primary" onClick={resetQuiz}>
                    <RotateCcw size={18} />
                    Nouvelle partie
                </button>
            </div>
        </div>
    );
}

// ─── Round End View (between duel rounds) ─────────────────
function RoundEndView() {
    const { duelRound, duelRounds, duelRoundScores, score, opponentScore, opponent, player, nextRound } = useQuizStore();
    const currentTheme = QUIZ_THEMES.find(t => t.id === duelRounds[duelRound]);
    const nextThemeData = duelRound + 1 < duelRounds.length ? QUIZ_THEMES.find(t => t.id === duelRounds[duelRound + 1]) : null;

    const myRoundScore = duelRoundScores[duelRound] || 0;
    const roundWon = score > opponentScore;

    return (
        <div className="quiz-container quiz-result">
            <div className="quiz-crown-anim">
                {roundWon ? '✅' : '⚠️'}
            </div>

            <h2 className="quiz-result-title">
                Fin du Round {duelRound + 1}
            </h2>

            <p className="quiz-subtitle">
                {currentTheme?.emoji} {currentTheme?.name}
            </p>

            <div className="quiz-result-vs">
                <div className="quiz-result-player">
                    <span className="quiz-result-emoji">{player?.avatar_emoji}</span>
                    <span className="quiz-result-pseudo">{player?.pseudo}</span>
                    <span className="quiz-result-score">+{myRoundScore}</span>
                </div>
                <span className="quiz-result-versus">VS</span>
                <div className="quiz-result-player">
                    <span className="quiz-result-emoji">{opponent?.avatar_emoji}</span>
                    <span className="quiz-result-pseudo">{opponent?.pseudo}</span>
                    <span className="quiz-result-score" style={{ color: '#E91E63' }}>{opponentScore}</span>
                </div>
            </div>

            <div className="quiz-result-stats">
                <div className="quiz-result-stat">
                    <Trophy size={18} color="#FFD700" />
                    <span>Score total : {score} vs {opponentScore}</span>
                </div>
            </div>

            {nextThemeData && (
                <div style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '16px',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '300px',
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 6px' }}>Prochain round</p>
                    <p style={{ fontSize: '1.3rem', margin: 0 }}>
                        {nextThemeData.emoji} {nextThemeData.name}
                    </p>
                </div>
            )}

            <div className="quiz-result-actions">
                <button className="quiz-btn-primary" onClick={nextRound}>
                    <Zap size={18} />
                    Round {duelRound + 2} →
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
        case 'stats':
            return <StatsView />;
        case 'badges':
            return <BadgeView />;
        case 'leaderboard':
            return <LeaderboardView />;
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
        case 'roundEnd':
            return <RoundEndView />;
        case 'result':
            return <ResultView />;
        default:
            return <ThemeSelect />;
    }
}
