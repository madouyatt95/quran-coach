import { ArrowLeft, Trophy, Award, CheckCircle, Crown } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function ProfileView() {
    const { player, title, level, totalXP, setView, unlockedBadges, totalPlayed, totalWins } = useQuizStore();
    const xpInLevel = totalXP % 1000;
    const xpToNext = 1000 - xpInLevel;

    const titles = [
        { name: 'Mubtadi', range: 'Lv 1-5', info: 'Débutant courageux' },
        { name: 'Talib', range: 'Lv 6-15', info: 'Étudiant assidu' },
        { name: 'Hafidh', range: 'Lv 16-30', info: 'Gardien du savoir' },
        { name: 'Alim', range: 'Lv 31+', info: 'Savant accompli' }
    ];

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Profil Joueur</h1>
            </div>

            <div className="quiz-profile-card">
                <div className="quiz-profile-avatar">{player?.avatar_emoji}</div>
                <h2 className="quiz-profile-name">{player?.pseudo}</h2>
                <div className="quiz-profile-rank">
                    <span className="quiz-level-tag">Niveau {level}</span>
                    <span className="quiz-profile-title">{title}</span>
                </div>

                <div className="quiz-xp-container" style={{ width: '100%', marginTop: '16px' }}>
                    <div className="quiz-xp-header">
                        <span className="quiz-xp-text">{xpInLevel} / 1000 XP</span>
                    </div>
                    <div className="quiz-xp-bar-bg">
                        <div className="quiz-xp-bar-fill" style={{ width: `${xpInLevel / 10}%` }}></div>
                    </div>
                    <p className="quiz-next-level-info">
                        Plus que <strong>{xpToNext} XP</strong> pour le niveau {level + 1} !
                    </p>
                </div>
            </div>

            <div className="quiz-profile-stats">
                <div className="quiz-p-stat">
                    <Trophy size={18} color="#FFD700" />
                    <div className="quiz-p-stat-info">
                        <strong>{totalWins}</strong>
                        <span>Victoires Total</span>
                    </div>
                </div>
                <div className="quiz-p-stat">
                    <Award size={18} color="#4CAF50" />
                    <div className="quiz-p-stat-info">
                        <strong>{unlockedBadges.length}</strong>
                        <span>Badges</span>
                    </div>
                </div>
                <div className="quiz-p-stat">
                    <CheckCircle size={18} color="#2196F3" />
                    <div className="quiz-p-stat-info">
                        <strong>{Math.round((totalWins / (totalPlayed || 1)) * 100)}%</strong>
                        <span>Taux de réussite</span>
                    </div>
                </div>
            </div>

            <div className="quiz-level-guide">
                <h3><Crown size={18} color="#FFD700" /> Guide des Titres</h3>
                {titles.map(t => (
                    <div key={t.name} className={`quiz-guide-row ${title === t.name ? 'active' : ''}`}>
                        <div className="quiz-guide-label">
                            <span className="quiz-guide-title">{t.name}</span>
                            <span className="quiz-guide-info">{t.info}</span>
                        </div>
                        <span className="quiz-guide-range">{t.range}</span>
                    </div>
                ))}
            </div>

            <button className="quiz-btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setView('home')}>
                Retour au menu
            </button>
        </div>
    );
}
