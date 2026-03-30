// ─── Fahm Page — Hub de Compréhension du Coran ──────────────
// Page dédiée avec parcours thématiques, vocabulaire SRS, et statistiques.

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Hash, Route, TrendingUp,
    ChevronRight, Play, CheckCircle2, Star, Sparkles
} from 'lucide-react';
import { READING_PATHS, type ReadingPath } from '../data/readingPaths';
import { QURAN_VOCABULARY } from '../data/quranVocabulary';
import { useFahmStore } from '../stores/fahmStore';
import { useQuranStore } from '../stores/quranStore';
import './FahmPage.css';

export function FahmPage() {
    const navigate = useNavigate();
    const fahm = useFahmStore();
    const { goToAyah } = useQuranStore();
    const [tab, setTab] = useState<'paths' | 'vocab' | 'stats'>('paths');

    const wordsForReview = useMemo(() => fahm.getWordsForReview(), [fahm.learnedWords]);
    const totalLearned = fahm.totalWordsLearned;
    const totalWords = QURAN_VOCABULARY.length;
    const pct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;

    const handleStartPath = (path: ReadingPath) => {
        fahm.startPath(path.id);
        // Navigate to first incomplete day
        const completed = fahm.pathProgress[path.id] || [];
        const nextDay = path.days.find(d => !completed.includes(d.day));
        if (nextDay) {
            navigate(`/fahm/lesson/${path.id}/${nextDay.day}`);
        }
    };

    const handleContinuePath = (path: ReadingPath) => {
        const completed = fahm.pathProgress[path.id] || [];
        const nextDay = path.days.find(d => !completed.includes(d.day));
        if (nextDay) {
            navigate(`/fahm/lesson/${path.id}/${nextDay.day}`);
        }
    };

    const handleDayClick = (path: ReadingPath, day: typeof path.days[0]) => {
        navigate(`/fahm/lesson/${path.id}/${day.day}`);
    };

    return (
        <div className="fahm-page">
            {/* Header */}
            <header className="fahm-page__header">
                <button className="fahm-page__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div className="fahm-page__title-block">
                    <h1>فَهْم</h1>
                    <span className="fahm-page__subtitle">Comprendre le Coran</span>
                </div>
            </header>

            {/* Stats bar */}
            <div className="fahm-stats-bar">
                <div className="fahm-stat">
                    <Hash size={16} />
                    <span>{totalLearned}/{totalWords} mots</span>
                </div>
                <div className="fahm-stat">
                    <TrendingUp size={16} />
                    <span>{pct}% compréhension</span>
                </div>
                {wordsForReview.length > 0 && (
                    <button className="fahm-review-btn" onClick={() => navigate('/vocab')}>
                        <Sparkles size={14} />
                        {wordsForReview.length} à réviser
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="fahm-progress-bar">
                <div className="fahm-progress-bar__fill" style={{ width: `${pct}%` }} />
            </div>

            {/* Tabs */}
            <div className="fahm-page__tabs">
                <button
                    className={`fahm-page__tab ${tab === 'paths' ? 'active' : ''}`}
                    onClick={() => setTab('paths')}
                >
                    <Route size={16} />
                    <span>Parcours</span>
                </button>
                <button
                    className={`fahm-page__tab ${tab === 'vocab' ? 'active' : ''}`}
                    onClick={() => navigate('/vocab')}
                >
                    <Hash size={16} />
                    <span>Vocabulaire</span>
                </button>
                <button
                    className={`fahm-page__tab ${tab === 'stats' ? 'active' : ''}`}
                    onClick={() => setTab('stats')}
                >
                    <TrendingUp size={16} />
                    <span>Progrès</span>
                </button>
            </div>

            {/* Content */}
            <div className="fahm-page__content">
                {tab === 'paths' && (
                    <div className="fahm-paths">
                        {/* Active path */}
                        {fahm.activePath && (() => {
                            const activePath = READING_PATHS.find(p => p.id === fahm.activePath);
                            if (!activePath) return null;
                            const completed = fahm.pathProgress[activePath.id] || [];
                            const progress = Math.round((completed.length / activePath.days.length) * 100);

                            return (
                                <div className="fahm-active-path">
                                    <div className="fahm-active-path__header">
                                        <span className="fahm-active-path__emoji">{activePath.emoji}</span>
                                        <div>
                                            <h3>{activePath.title}</h3>
                                            <span className="fahm-active-path__ar">{activePath.titleAr}</span>
                                        </div>
                                        <div className="fahm-active-path__progress">
                                            <span>{progress}%</span>
                                        </div>
                                    </div>

                                    <div className="fahm-active-path__bar">
                                        <div className="fahm-active-path__bar-fill" style={{ width: `${progress}%` }} />
                                    </div>

                                    <div className="fahm-active-path__days">
                                        {activePath.days.map(day => {
                                            const isDone = completed.includes(day.day);
                                            return (
                                                <div
                                                    key={day.day}
                                                    className={`fahm-day ${isDone ? 'fahm-day--done' : ''}`}
                                                    onClick={() => {
                                                        if (!isDone) {
                                                            fahm.completePathDay(activePath.id, day.day);
                                                        }
                                                        handleDayClick(activePath, day);
                                                    }}
                                                >
                                                    <div className="fahm-day__num">
                                                        {isDone ? <CheckCircle2 size={16} /> : <span>J{day.day}</span>}
                                                    </div>
                                                    <div className="fahm-day__info">
                                                        <span className="fahm-day__title">{day.title}</span>
                                                        <span className="fahm-day__note">{day.fahmNote}</span>
                                                    </div>
                                                    <ChevronRight size={16} />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="fahm-active-path__actions">
                                        <button className="fahm-btn fahm-btn--primary" onClick={() => handleContinuePath(activePath)}>
                                            <Play size={16} />
                                            Continuer
                                        </button>
                                        <button className="fahm-btn fahm-btn--ghost" onClick={() => fahm.abandonPath()}>
                                            Abandonner
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Available paths */}
                        <h2 className="fahm-section-title">
                            {fahm.activePath ? 'Autres parcours' : 'Choisis un parcours'}
                        </h2>
                        <div className="fahm-paths-grid">
                            {READING_PATHS.filter(p => p.id !== fahm.activePath).map(path => {
                                const completed = fahm.pathProgress[path.id] || [];
                                const isStarted = completed.length > 0;
                                const progress = Math.round((completed.length / path.days.length) * 100);
                                const isComplete = completed.length === path.days.length;

                                return (
                                    <div
                                        key={path.id}
                                        className={`fahm-path-card ${isComplete ? 'fahm-path-card--complete' : ''}`}
                                        onClick={() => handleStartPath(path)}
                                    >
                                        <div className="fahm-path-card__emoji">{path.emoji}</div>
                                        <div className="fahm-path-card__info">
                                            <h3>{path.title}</h3>
                                            <span className="fahm-path-card__ar">{path.titleAr}</span>
                                            <p>{path.description}</p>
                                            <div className="fahm-path-card__meta">
                                                <span>{path.durationDays} jours</span>
                                                <span className={`fahm-difficulty fahm-difficulty--${path.difficulty}`}>
                                                    {path.difficulty === 'beginner' ? '🟢 Débutant'
                                                        : path.difficulty === 'intermediate' ? '🟡 Intermédiaire'
                                                            : '🔴 Avancé'}
                                                </span>
                                            </div>
                                            {isStarted && !isComplete && (
                                                <div className="fahm-path-card__progress-bar">
                                                    <div style={{ width: `${progress}%` }} />
                                                </div>
                                            )}
                                            {isComplete && (
                                                <div className="fahm-path-card__complete">
                                                    <Star size={14} /> Terminé
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight size={18} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tab === 'stats' && (
                    <div className="fahm-stats-page">
                        <div className="fahm-stat-card">
                            <BookOpen size={28} />
                            <div className="fahm-stat-card__value">{totalLearned}</div>
                            <div className="fahm-stat-card__label">Mots appris</div>
                        </div>
                        <div className="fahm-stat-card">
                            <TrendingUp size={28} />
                            <div className="fahm-stat-card__value">{pct}%</div>
                            <div className="fahm-stat-card__label">Compréhension</div>
                        </div>
                        <div className="fahm-stat-card">
                            <Sparkles size={28} />
                            <div className="fahm-stat-card__value">{fahm.totalReviews}</div>
                            <div className="fahm-stat-card__label">Révisions</div>
                        </div>
                        <div className="fahm-stat-card">
                            <Route size={28} />
                            <div className="fahm-stat-card__value">
                                {Object.values(fahm.pathProgress).filter(p => p.length > 0).length}
                            </div>
                            <div className="fahm-stat-card__label">Parcours commencés</div>
                        </div>

                        {fahm.lastFahmVerses.length > 0 && (
                            <>
                                <h3 className="fahm-section-title" style={{ marginTop: 24 }}>Derniers versets consultés</h3>
                                <div className="fahm-recent-verses">
                                    {fahm.lastFahmVerses.slice(0, 10).map((v, i) => (
                                        <div
                                            key={i}
                                            className="fahm-recent-verse"
                                            onClick={() => { goToAyah(v.surah, v.ayah); navigate('/read'); }}
                                        >
                                            <span>S{v.surah}:V{v.ayah}</span>
                                            <span className="fahm-recent-verse__time">
                                                {new Date(v.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
