import { useEffect, useState } from 'react';
import {
    Flame,
    BookOpen,
    Clock,
    Target,
    TrendingUp,
    Award,
    Calendar,
    Brain,
    ChevronRight
} from 'lucide-react';
import { useStatsStore } from '../stores/statsStore';
import { useSRSStore } from '../stores/srsStore';
import { useTranslation } from 'react-i18next';
import './ProgressPage.css';

// Generate last 365 days for calendar
function generateCalendarDays(): { date: string; dayOfWeek: number }[] {
    const days: { date: string; dayOfWeek: number }[] = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push({
            date: date.toISOString().split('T')[0],
            dayOfWeek: date.getDay(),
        });
    }
    return days;
}

// Get month labels for calendar
function getMonthLabels(days: { date: string }[]): { month: string; index: number }[] {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = '';

    days.forEach((day, index) => {
        const month = new Date(day.date).toLocaleDateString('fr-FR', { month: 'short' });
        if (month !== lastMonth) {
            labels.push({ month, index });
            lastMonth = month;
        }
    });
    return labels;
}

export function ProgressPage() {
    const { t } = useTranslation();
    const {
        readingStreak,
        totalPagesRead,
        totalMinutesSpent,
        dailyGoalPages,
        todayPagesRead,
        setDailyGoal,
        checkAndUpdateStreak,
        activityHistory,
    } = useStatsStore();

    const { getDueCards, cards } = useSRSStore();

    const [calendarDays] = useState(generateCalendarDays);
    const [monthLabels] = useState(() => getMonthLabels(calendarDays));

    // Check streak on mount
    useEffect(() => {
        checkAndUpdateStreak();
    }, [checkAndUpdateStreak]);

    const goalProgress = Math.min((todayPagesRead / dailyGoalPages) * 100, 100);
    const goalMet = todayPagesRead >= dailyGoalPages;
    const dueCards = getDueCards();
    const totalCards = Object.keys(cards).length;

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    // Get activity level for a date (0-4)
    const getActivityLevel = (date: string): number => {
        const pages = activityHistory?.[date] || 0;
        if (pages === 0) return 0;
        if (pages === 1) return 1;
        if (pages <= 3) return 2;
        if (pages <= 5) return 3;
        return 4;
    };

    return (
        <div className="progress-page">
            <h1 className="progress-page__title">{t('progress.title', 'Ma Progression')}</h1>

            {/* Streak Card */}
            <div className={`progress-card progress-card--streak ${readingStreak > 0 ? 'active' : ''}`}>
                <div className="progress-card__icon">
                    <Flame size={32} />
                </div>
                <div className="progress-card__content">
                    <span className="progress-card__value">{readingStreak}</span>
                    <span className="progress-card__label">
                        {t('progress.daysInRow', 'jours de suite')}
                    </span>
                </div>
                {readingStreak >= 7 && (
                    <div className="progress-card__badge">
                        <Award size={16} />
                        <span>{readingStreak >= 30 ? t('progress.master', 'Maître!') : t('progress.diligent', 'Assidu!')}</span>
                    </div>
                )}
            </div>

            {/* SRS Due Cards */}
            {totalCards > 0 && (
                <div className="progress-card progress-card--srs">
                    <div className="progress-card__icon srs-icon">
                        <Brain size={24} />
                    </div>
                    <div className="progress-card__content">
                        <span className="progress-card__value">{dueCards.length}</span>
                        <span className="progress-card__label">
                            {t('progress.versesToReview', 'versets à réviser')}
                        </span>
                    </div>
                    <div className="progress-card__extra">
                        <span>{totalCards} {t('progress.inMemorization', 'en mémorisation')}</span>
                        <ChevronRight size={16} />
                    </div>
                </div>
            )}

            {/* Activity Calendar */}
            <div className="progress-calendar">
                <h3 className="progress-calendar__title">
                    <Calendar size={18} />
                    {t('progress.activity', 'Activité')}
                </h3>

                <div className="progress-calendar__months">
                    {monthLabels.map((label, i) => (
                        <span
                            key={i}
                            className="progress-calendar__month"
                            style={{ gridColumnStart: Math.floor(label.index / 7) + 1 }}
                        >
                            {label.month}
                        </span>
                    ))}
                </div>

                <div className="progress-calendar__grid">
                    {calendarDays.map((day, i) => (
                        <div
                            key={i}
                            className={`progress-calendar__day level-${getActivityLevel(day.date)}`}
                            title={`${day.date}: ${activityHistory?.[day.date] || 0} pages`}
                        />
                    ))}
                </div>

                <div className="progress-calendar__legend">
                    <span>{t('progress.less', 'Moins')}</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div key={level} className={`progress-calendar__day level-${level}`} />
                    ))}
                    <span>{t('progress.more', 'Plus')}</span>
                </div>
            </div>

            {/* Daily Goal */}
            <div className="progress-card progress-card--goal">
                <div className="progress-card__header">
                    <Target size={20} />
                    <span>{t('progress.dailyGoal', 'Objectif du jour')}</span>
                    {goalMet && <span className="goal-met">✓ {t('progress.goalMet', 'Atteint!')}</span>}
                </div>
                <div className="goal-progress">
                    <div className="goal-progress__bar">
                        <div
                            className="goal-progress__fill"
                            style={{ width: `${goalProgress}%` }}
                        />
                    </div>
                    <span className="goal-progress__text">
                        {todayPagesRead} / {dailyGoalPages} {t('common.pages', 'pages')}
                    </span>
                </div>
                <div className="goal-selector">
                    <span>{t('progress.goalLabel', 'Objectif :')}</span>
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
            <div className="progress-grid">
                <div className="progress-item">
                    <BookOpen size={24} />
                    <span className="progress-item__value">{totalPagesRead}</span>
                    <span className="progress-item__label">{t('progress.pagesRead', 'Pages lues')}</span>
                </div>
                <div className="progress-item">
                    <Clock size={24} />
                    <span className="progress-item__value">{formatTime(totalMinutesSpent)}</span>
                    <span className="progress-item__label">{t('progress.totalTime', 'Temps total')}</span>
                </div>
                <div className="progress-item">
                    <TrendingUp size={24} />
                    <span className="progress-item__value">
                        {totalPagesRead > 0 ? Math.round((totalPagesRead / 604) * 100) : 0}%
                    </span>
                    <span className="progress-item__label">{t('progress.ofQuran', 'du Coran')}</span>
                </div>
            </div>

            {/* Motivation */}
            <div className="progress-motivation">
                {readingStreak === 0 && (
                    <p>📖 {t('progress.startReading', 'Commencez à lire pour démarrer votre streak!')}</p>
                )}
                {readingStreak >= 1 && readingStreak < 7 && (
                    <p>🔥 Encore {7 - readingStreak} {t('common.days', 'jours')} {t('progress.toFullWeek', 'pour une semaine complète!')}</p>
                )}
                {readingStreak >= 7 && readingStreak < 30 && (
                    <p>⭐ {t('progress.excellent', 'Excellent!')} {readingStreak} {t('progress.daysOfReading', 'jours de lecture régulière!')}</p>
                )}
                {readingStreak >= 30 && (
                    <p>🏆 {t('progress.mashallah', 'Mashallah!')} {readingStreak} {t('progress.consecutiveDays', 'jours consécutifs!')}</p>
                )}
            </div>
        </div>
    );
}
