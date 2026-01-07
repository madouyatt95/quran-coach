import { useEffect } from 'react';
import { Flame, BookOpen, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { useStatsStore } from '../stores/statsStore';
import './StatsPage.css';

export function StatsPage() {
    const {
        readingStreak,
        totalPagesRead,
        totalMinutesSpent,
        dailyGoalPages,
        todayPagesRead,
        setDailyGoal,
        checkAndUpdateStreak,
    } = useStatsStore();

    // Check streak on mount
    useEffect(() => {
        checkAndUpdateStreak();
    }, [checkAndUpdateStreak]);

    const goalProgress = Math.min((todayPagesRead / dailyGoalPages) * 100, 100);
    const goalMet = todayPagesRead >= dailyGoalPages;

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    return (
        <div className="stats-page">
            <h1 className="stats-page__title">Statistiques</h1>

            {/* Streak Card */}
            <div className={`stats-card stats-card--streak ${readingStreak > 0 ? 'active' : ''}`}>
                <div className="stats-card__icon">
                    <Flame size={32} />
                </div>
                <div className="stats-card__content">
                    <span className="stats-card__value">{readingStreak}</span>
                    <span className="stats-card__label">
                        jour{readingStreak !== 1 ? 's' : ''} consécutif{readingStreak !== 1 ? 's' : ''}
                    </span>
                </div>
                {readingStreak >= 7 && (
                    <div className="stats-card__badge">
                        <Award size={16} />
                        <span>Assidu!</span>
                    </div>
                )}
            </div>

            {/* Daily Goal */}
            <div className="stats-card stats-card--goal">
                <div className="stats-card__header">
                    <Target size={20} />
                    <span>Objectif du jour</span>
                    {goalMet && <span className="goal-met">✓ Atteint!</span>}
                </div>
                <div className="goal-progress">
                    <div className="goal-progress__bar">
                        <div
                            className="goal-progress__fill"
                            style={{ width: `${goalProgress}%` }}
                        />
                    </div>
                    <span className="goal-progress__text">
                        {todayPagesRead} / {dailyGoalPages} page{dailyGoalPages > 1 ? 's' : ''}
                    </span>
                </div>
                <div className="goal-selector">
                    <span>Objectif :</span>
                    {[1, 2, 3, 5, 10].map((pages) => (
                        <button
                            key={pages}
                            className={`goal-btn ${dailyGoalPages === pages ? 'active' : ''}`}
                            onClick={() => setDailyGoal(pages)}
                        >
                            {pages}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stats-item">
                    <BookOpen size={24} />
                    <span className="stats-item__value">{totalPagesRead}</span>
                    <span className="stats-item__label">Pages lues</span>
                </div>
                <div className="stats-item">
                    <Clock size={24} />
                    <span className="stats-item__value">{formatTime(totalMinutesSpent)}</span>
                    <span className="stats-item__label">Temps total</span>
                </div>
                <div className="stats-item">
                    <TrendingUp size={24} />
                    <span className="stats-item__value">
                        {totalPagesRead > 0 ? Math.round((totalPagesRead / 604) * 100) : 0}%
                    </span>
                    <span className="stats-item__label">du Coran</span>
                </div>
            </div>

            {/* Motivation */}
            <div className="stats-motivation">
                {readingStreak === 0 && (
                    <p>📖 Commencez à lire pour démarrer votre streak!</p>
                )}
                {readingStreak >= 1 && readingStreak < 7 && (
                    <p>🔥 Continuez comme ça! Encore {7 - readingStreak} jour{7 - readingStreak > 1 ? 's' : ''} pour une semaine complète.</p>
                )}
                {readingStreak >= 7 && readingStreak < 30 && (
                    <p>⭐ Excellent! Vous êtes sur une belle lancée de {readingStreak} jours!</p>
                )}
                {readingStreak >= 30 && (
                    <p>🏆 Incroyable! {readingStreak} jours de lecture régulière. Mashallah!</p>
                )}
            </div>
        </div>
    );
}
