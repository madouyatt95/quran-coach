import { ArrowLeft, Swords, BarChart3, Award, Globe, User, BookOpen, Timer, GraduationCap, Headphones, Clock, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { DIFFICULTY_CONFIG, BADGES } from '../../data/quizTypes';
import type { QuizDifficulty } from '../../data/quizTypes';

export function HomeView() {
    const { startSolo, setView, player, totalPlayed, totalWins, totalXP, level, title, difficulty, setDifficulty, wrongQuestions, unlockedBadges, sprintBest, startAudio, gameHistory } = useQuizStore();
    const navigate = useNavigate();

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
                <div className="quiz-player-badge" onClick={() => setView('profile')}>
                    <span className="quiz-player-emoji">{player?.avatar_emoji}</span>
                    <div className="quiz-player-info">
                        <span className="quiz-player-name">{player?.pseudo}</span>
                        <span className="quiz-player-title">{title}</span>
                    </div>
                </div>
            </div>

            {/* Level & XP Bar */}
            <div className="quiz-xp-container" onClick={() => setView('stats')}>
                <div className="quiz-xp-header">
                    <span className="quiz-level-tag">Niveau {level}</span>
                    <span className="quiz-xp-text">{totalXP % 1000} / 1000 XP</span>
                </div>
                <div className="quiz-xp-bar-bg">
                    <div className="quiz-xp-bar-fill" style={{ width: `${(totalXP % 1000) / 10}%` }}></div>
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

            {/* Difficulty Selector */}
            <p className="quiz-subtitle">Difficulté</p>
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

            <p className="quiz-subtitle">Choisis ton mode</p>
            <div className="quiz-mode-cards">
                <button className="quiz-mode-card daily" onClick={() => setView('daily')}>
                    <Timer size={32} />
                    <h3>Défi du Jour</h3>
                    <p>Même quiz pour tous !</p>
                    <span className="quiz-mode-tag">XP x2</span>
                </button>
                <div className="quiz-mode-row">
                    <button className="quiz-mode-card solo" onClick={startSolo}>
                        <User size={32} />
                        <h3>Solo</h3>
                    </button>
                    <button className="quiz-mode-card duel" onClick={() => setView('lobby')}>
                        <Swords size={32} />
                        <h3>Duel</h3>
                    </button>
                </div>
                <button className="quiz-mode-card sira" onClick={() => setView('sira-map')} style={{ marginTop: '12px', background: 'linear-gradient(135deg, #FFD700, #DAAB00)', color: '#000' }}>
                    <Map size={32} />
                    <h3>Parcours de la Sira</h3>
                    <p>Découvre l'histoire du Prophète ﷺ</p>
                    <span className="quiz-mode-tag" style={{ background: '#000', color: '#FFD700' }}>MODE HISTOIRE</span>
                </button>
            </div>

            <button className="quiz-join-btn" onClick={() => setView('join')} style={{ marginTop: '12px' }}>
                Rejoindre un duel avec un code
            </button>

            {/* Special Modes */}
            <div className="quiz-special-modes" style={{ marginTop: '24px' }}>
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
                <button className="quiz-special-card teacher-card" onClick={() => setView('custom-duel')}>
                    <GraduationCap size={24} />
                    <div>
                        <h4>🎓 Mode Professeur</h4>
                        <p>Crée ton duel sur mesure</p>
                    </div>
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
                <button className="quiz-special-card" onClick={startAudio} style={{ background: 'linear-gradient(135deg, #1a237e, #3F51B5)' }}>
                    <Headphones size={24} />
                    <div>
                        <h4>🎧 Mode Audio</h4>
                        <p>Reconnais la sourate</p>
                    </div>
                </button>
                {gameHistory.length > 0 && (
                    <button className="quiz-special-card" onClick={() => setView('history')} style={{ background: 'linear-gradient(135deg, #263238, #455A64)' }}>
                        <Clock size={24} />
                        <div>
                            <h4>📋 Historique</h4>
                            <p>{gameHistory.length} parties</p>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
