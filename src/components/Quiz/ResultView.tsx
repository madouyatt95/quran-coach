import { useState } from 'react';
import { Trophy, Zap, Share2, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES, BADGES } from '../../data/quizTypes';

export function ResultView() {
    const { score, answers, mode, opponent, opponentScore, resetQuiz, theme, player, sprintCorrect, sprintBest, unlockedBadges, currentStreak } = useQuizStore();
    const correctCount = answers.filter(a => a.correct).length;
    const total = answers.length;
    const themeData = QUIZ_THEMES.find(t => t.id === theme);
    const correctRate = total > 0 ? correctCount / total : 0;
    const isWinner = mode === 'duel' ? score >= opponentScore : correctRate >= 0.8;
    const isSprint = mode === 'sprint';
    const isRevision = mode === 'revision';

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
                <button className="quiz-btn-secondary" style={{ marginTop: '12px' }} onClick={() => {
                    const text = mode === 'duel'
                        ? `J'ai fait un score de ${score} contre ${opponent?.pseudo} sur Duel Quiz ! 🏆`
                        : `J'ai fait ${correctCount}/${total} sur le thème ${themeData?.name || ''} ! 🚀`;
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
