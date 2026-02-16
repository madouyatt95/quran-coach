import { Trophy, Zap } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';

export function RoundEndView() {
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
