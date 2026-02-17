import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Target, Award, BookOpen, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { useStatsStore } from '../stores/statsStore';
import { useChallengesStore, BADGES } from '../stores/challengesStore';
import { useQuranStore } from '../stores/quranStore';
import './StatsPage.css';

export function StatsPage() {
    const navigate = useNavigate();
    const {
        readingStreak,
        totalPagesRead,
        dailyGoalPages,
        todayPagesRead,
        setDailyGoal,
        checkAndUpdateStreak,
    } = useStatsStore();

    const {
        dailyChallenges,
        unlockedBadges,
        khatmaPages,
        ayahOfTheDay,
        generateDailyChallenges,
        checkBadges,
        updateChallengeProgress
    } = useChallengesStore();

    const { goToAyah, goToSurah } = useQuranStore();

    // Initialize on mount
    useEffect(() => {
        checkAndUpdateStreak();
        generateDailyChallenges();
        checkBadges(readingStreak, totalPagesRead);
    }, [checkAndUpdateStreak, generateDailyChallenges, checkBadges, readingStreak, totalPagesRead]);

    // Update reading challenge progress
    useEffect(() => {
        updateChallengeProgress('read_1', todayPagesRead);
    }, [todayPagesRead, updateChallengeProgress]);

    const goalProgress = Math.min((todayPagesRead / dailyGoalPages) * 100, 100);
    const khatmaProgress = Math.round((khatmaPages.length / 604) * 100);
    const completedChallenges = dailyChallenges.filter(c => c.completed).length;

    const handleChallengeClick = (challenge: typeof dailyChallenges[0]) => {
        if (challenge.type === 'memorize_ayah' && challenge.surah && challenge.ayah) {
            sessionStorage.setItem('isSilentJump', 'true');
            sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: challenge.surah, ayah: challenge.ayah }));
            goToAyah(challenge.surah, challenge.ayah, undefined, { silent: true });
            navigate('/read');
        } else if (challenge.type === 'read_pages') {
            sessionStorage.setItem('isSilentJump', 'true');
            sessionStorage.setItem('scrollToPage', '0');
            if (challenge.surah) goToSurah(challenge.surah, { silent: true });
            else navigate('/read');
            navigate('/read');
        } else if (challenge.type === 'revision') {
            if (challenge.surah) {
                sessionStorage.setItem('isSilentJump', 'true');
                sessionStorage.setItem('scrollToPage', '0');
                goToSurah(challenge.surah, { silent: true });
                navigate('/read');
            } else {
                navigate('/hifdh');
            }
        }
    };

    return (
        <div className="stats-page">
            {/* Hero Streak Section */}
            <div className={`streak-hero ${readingStreak > 0 ? 'active' : ''}`}>
                <div className="streak-hero__flame">
                    <Flame size={48} />
                </div>
                <div className="streak-hero__count">{readingStreak}</div>
                <div className="streak-hero__label">
                    jour{readingStreak !== 1 ? 's' : ''} consécutif{readingStreak !== 1 ? 's' : ''}
                </div>
                {readingStreak >= 7 && (
                    <div className="streak-hero__badge">
                        <Award size={14} />
                        <span>En feu !</span>
                    </div>
                )}
            </div>

            {/* Khatma Progress Circle */}
            <div className="khatma-card">
                <div className="khatma-circle">
                    <svg viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="rgba(201, 168, 76, 0.2)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="#c9a84c"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${khatmaProgress * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="khatma-circle__content">
                        <span className="khatma-circle__percent">{khatmaProgress}%</span>
                        <span className="khatma-circle__label">Khatma</span>
                    </div>
                </div>
                <div className="khatma-info">
                    <BookOpen size={16} />
                    <span>{khatmaPages.length}/604 pages</span>
                </div>
            </div>

            {/* Daily Challenges */}
            <div className="challenges-section">
                <div className="section-header">
                    <Target size={20} />
                    <h2>Défis du jour</h2>
                    <span className="challenge-count">{completedChallenges}/{dailyChallenges.length}</span>
                </div>

                <div className="challenges-list">
                    {dailyChallenges.map((challenge) => (
                        <button
                            key={challenge.id}
                            className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
                            onClick={() => handleChallengeClick(challenge)}
                        >
                            <div className="challenge-card__status">
                                {challenge.completed ? (
                                    <CheckCircle size={24} className="check-icon" />
                                ) : (
                                    <div className="challenge-progress-ring">
                                        <svg viewBox="0 0 36 36">
                                            <circle
                                                cx="18" cy="18" r="16"
                                                fill="none"
                                                stroke="rgba(201, 168, 76, 0.2)"
                                                strokeWidth="3"
                                            />
                                            <circle
                                                cx="18" cy="18" r="16"
                                                fill="none"
                                                stroke="#c9a84c"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(challenge.progress / challenge.target) * 100} 100`}
                                                transform="rotate(-90 18 18)"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="challenge-card__content">
                                <div className="challenge-card__title">{challenge.title}</div>
                                <div className="challenge-card__desc">{challenge.description}</div>
                            </div>
                            <div className="challenge-card__reward">
                                <span>{challenge.reward}</span>
                                <ChevronRight size={16} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Ayah of the Day */}
            {ayahOfTheDay && (
                <button
                    className="ayah-of-day"
                    onClick={() => {
                        sessionStorage.setItem('isSilentJump', 'true');
                        sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: ayahOfTheDay.surah, ayah: ayahOfTheDay.ayah }));
                        goToAyah(ayahOfTheDay.surah, ayahOfTheDay.ayah, undefined, { silent: true });
                        navigate('/read');
                    }}
                >
                    <div className="ayah-of-day__header">
                        <span>✨ Verset du jour</span>
                        <span className="ayah-of-day__ref">{ayahOfTheDay.surah}:{ayahOfTheDay.ayah}</span>
                    </div>
                    <ChevronRight size={20} />
                </button>
            )}

            {/* Daily Goal */}
            <div className="goal-card">
                <div className="goal-card__header">
                    <Target size={18} />
                    <span>Objectif quotidien</span>
                </div>
                <div className="goal-progress">
                    <div className="goal-progress__bar">
                        <div
                            className="goal-progress__fill"
                            style={{ width: `${goalProgress}%` }}
                        />
                    </div>
                    <span className="goal-progress__text">
                        {todayPagesRead}/{dailyGoalPages} page{dailyGoalPages > 1 ? 's' : ''}
                    </span>
                </div>
                <div className="goal-selector">
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

            {/* Badges Section */}
            <div className="badges-section">
                <div className="section-header">
                    <Award size={20} />
                    <h2>Badges</h2>
                    <span className="badge-count">{unlockedBadges.length}/{BADGES.length}</span>
                </div>

                <div className="badges-grid">
                    {BADGES.map((badge) => {
                        const isUnlocked = unlockedBadges.includes(badge.id);
                        return (
                            <div
                                key={badge.id}
                                className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                            >
                                <div className="badge-item__icon">
                                    {isUnlocked ? badge.icon : <Lock size={16} />}
                                </div>
                                <div className="badge-item__name">{badge.name}</div>
                                <div className="badge-item__desc">{badge.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
