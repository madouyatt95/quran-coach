import { useState } from 'react';
import { Trophy, Zap, Share2, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES, BADGES } from '../../data/quizTypes';

export function ResultView() {
    const { score, answers, mode, opponent, opponentScore, resetQuiz, theme, player, sprintCorrect, sprintBest, unlockedBadges, currentStreak, lastPowerUpGained } = useQuizStore();
    const correctCount = answers.filter(a => a.correct).length;
    const total = answers.length;
    const themeData = QUIZ_THEMES.find(t => t.id === theme);
    const correctRate = total > 0 ? correctCount / total : 0;
    const pct = Math.round(correctRate * 100);
    const isWinner = mode === 'duel' ? score >= opponentScore : correctRate >= 0.8;
    const isSprint = mode === 'sprint';

    // Color based on percentage
    const pctColor = pct >= 80 ? '#4CAF50' : pct >= 50 ? '#FF9800' : '#f44336';

    // Check for newly unlocked badges (last few)
    const [newBadges] = useState(() => {
        return unlockedBadges.slice(-3);
    });

    return (
        <div className="quiz-container quiz-result">
            <div className="quiz-result-top">
                {isWinner && <div className="quiz-crown-anim">👑</div>}
                <h1 className="quiz-result-title">
                    {isSprint
                        ? `⚡ Sprint terminé !`
                        : mode === 'revision'
                            ? 'Révision terminée'
                            : mode === 'duel'
                                ? (score > opponentScore ? 'Victoire !' : score === opponentScore ? 'Égalité !' : 'Défaite')
                                : isWinner ? '🎉 Victoire !' : 'Partie terminée'}
                </h1>
            </div>

            {/* Big percentage circle (non-sprint, non-duel) */}
            {!isSprint && mode !== 'duel' && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: '50%',
                        border: `4px solid ${pctColor}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: `${pctColor}15`,
                    }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: pctColor }}>{pct}%</span>
                        <span style={{ fontSize: 11, opacity: 0.7, color: 'var(--text-primary, #fff)' }}>
                            {pct >= 80 ? '✅ Réussi' : '❌ < 80%'}
                        </span>
                    </div>
                </div>
            )}

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
                            <span>{correctCount}/{total} bonnes réponses ({pct}%)</span>
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

            {/* Power-up recharged notification */}
            {lastPowerUpGained && (
                <div style={{
                    textAlign: 'center', padding: '8px 16px', margin: '8px 0',
                    borderRadius: 12, background: 'rgba(76,175,80,0.15)',
                    fontSize: 14, color: '#4CAF50', fontWeight: 600,
                }}>
                    {lastPowerUpGained === '50-50' ? '🌗' : lastPowerUpGained === 'time-freeze' ? '❄️' : '🛡️'} Power-up rechargé !
                </div>
            )}

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
                <button className="quiz-btn-secondary" style={{ marginTop: '12px' }} onClick={() => {
                    const text = mode === 'duel'
                        ? `J'ai fait un score de ${score} contre ${opponent?.pseudo} sur Duel Quiz ! 🏆`
                        : `J'ai fait ${pct}% (${correctCount}/${total}) sur le thème ${themeData?.name || ''} ! 🚀`;
                    if (navigator.share) {
                        navigator.share({ title: 'Quran Coach Quiz', text, url: window.location.href });
                    } else {
                        navigator.clipboard.writeText(text);
                        alert('Copié dans le presse-papiers !');
                    }
                }}>
                    <Share2 size={18} />
                    Partager mon score
                </button>
            </div>
        </div>
    );
}
