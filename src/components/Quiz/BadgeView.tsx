import { ArrowLeft, Award } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { BADGES } from '../../data/quizTypes';

export function BadgeView() {
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
                            {isUnlocked && <span className="quiz-badge-check">✓</span>}
                            <span className="quiz-badge-emoji">{badge.emoji}</span>
                            <span className="quiz-badge-name">{badge.name}</span>
                            <span className="quiz-badge-desc">{badge.description}</span>
                            <span className="quiz-badge-condition">🎯 {badge.condition}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
