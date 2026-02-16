import { useState, useEffect } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function LeaderboardView() {
    const { setView, player, totalCorrect, sprintBest, totalPlayed, totalWins, submitToLeaderboard } = useQuizStore();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        submitToLeaderboard().then(async () => {
            try {
                const { supabase } = await import('../../lib/supabase');
                const { data } = await supabase
                    .from('quiz_leaderboard')
                    .select('*')
                    .order('total_correct', { ascending: false })
                    .limit(50);
                setEntries(data || []);
            } catch {
                // Table may not exist yet
            }
            setLoading(false);
        });
    }, [submitToLeaderboard]);

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <Globe size={24} />
                    <span>Classement</span>
                </h1>
            </div>

            {/* My Stats Card */}
            <div className="quiz-my-leaderboard">
                <span className="quiz-lb-emoji">{player?.avatar_emoji}</span>
                <span className="quiz-lb-pseudo">{player?.pseudo}</span>
                <div className="quiz-lb-my-stats">
                    <span>✅ {totalCorrect}</span>
                    <span>🏆 {totalWins}/{totalPlayed}</span>
                    <span>⚡ {sprintBest}</span>
                </div>
            </div>

            {loading ? (
                <div className="quiz-lobby-loading">
                    <div className="quiz-spinner" />
                    <p>Chargement...</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="quiz-empty-lb">
                    <p>🏆 Aucun joueur dans le classement pour le moment.</p>
                    <p>Joue une partie pour apparaître !</p>
                </div>
            ) : (
                <div className="quiz-leaderboard-list">
                    {entries.map((entry, i) => (
                        <div key={entry.id} className={`quiz-lb-row ${entry.id === player?.id ? 'quiz-lb-me' : ''}`}>
                            <span className="quiz-lb-rank">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </span>
                            <span className="quiz-lb-avatar">{entry.avatar_emoji}</span>
                            <div className="quiz-lb-info">
                                <span className="quiz-lb-name">{entry.pseudo}</span>
                                <span className="quiz-lb-detail">
                                    {entry.total_correct} correctes • {entry.total_wins} victoires
                                </span>
                            </div>
                            <span className="quiz-lb-sprint">⚡{entry.sprint_best || 0}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
