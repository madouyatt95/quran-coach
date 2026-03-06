import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

// Compute ranking score: wins matter most, then win rate, then sprint
function rankingScore(entry: any): number {
    const wins = entry.total_wins || 0;
    const played = entry.total_played || 1;
    const winRate = played > 0 ? (wins / played) * 100 : 0;
    const sprint = entry.sprint_best || 0;
    return (wins * 100) + (winRate * 50) + sprint;
}

export function LeaderboardView() {
    const { setView, player, totalCorrect, sprintBest, totalPlayed, totalWins, submitToLeaderboard } = useQuizStore();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'alltime' | 'weekly'>('alltime');

    // Get Monday of current week (ISO week)
    const getWeekStart = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString();
    };

    useEffect(() => {
        setLoading(true);
        submitToLeaderboard().then(async () => {
            try {
                const { supabase } = await import('../../lib/supabase');
                let query = supabase
                    .from('quiz_leaderboard')
                    .select('*')
                    .limit(100);

                if (tab === 'weekly') {
                    query = query.gte('updated_at', getWeekStart());
                }

                const { data } = await query;
                setEntries(data || []);
            } catch {
                // Table may not exist yet
            }
            setLoading(false);
        });
    }, [submitToLeaderboard, tab]);

    // Sort by ranking score client-side
    const sortedEntries = useMemo(() =>
        [...entries].sort((a, b) => rankingScore(b) - rankingScore(a)),
        [entries]);

    const myWinRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;
    const myRankScore = Math.round((totalWins * 100) + (myWinRate * 50) + sprintBest);

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

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: 8, marginBottom: 16, padding: '0 4px',
            }}>
                <button
                    onClick={() => setTab('alltime')}
                    style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        background: tab === 'alltime' ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'alltime' ? '#4CAF50' : 'var(--text-secondary, #aaa)',
                    }}
                >
                    🏆 All-time
                </button>
                <button
                    onClick={() => setTab('weekly')}
                    style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        background: tab === 'weekly' ? 'rgba(33,150,243,0.2)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'weekly' ? '#2196F3' : 'var(--text-secondary, #aaa)',
                    }}
                >
                    📅 Semaine
                </button>
            </div>

            {/* My Stats Card */}
            <div className="quiz-my-leaderboard">
                <span className="quiz-lb-emoji">{player?.avatar_emoji}</span>
                <span className="quiz-lb-pseudo">{player?.pseudo}</span>
                <div className="quiz-lb-my-stats">
                    <span>🏆 {totalWins}/{totalPlayed}</span>
                    <span>📊 {myWinRate}%</span>
                    <span>⚡ {sprintBest}</span>
                    <span>✅ {totalCorrect}</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    Score: {myRankScore} pts
                </div>
            </div>

            {loading ? (
                <div className="quiz-lobby-loading">
                    <div className="quiz-spinner" />
                    <p>Chargement...</p>
                </div>
            ) : sortedEntries.length === 0 ? (
                <div className="quiz-empty-lb">
                    <p>🏆 {tab === 'weekly' ? 'Aucun joueur cette semaine.' : 'Aucun joueur dans le classement pour le moment.'}</p>
                    <p>Joue une partie pour apparaître !</p>
                </div>
            ) : (
                <div className="quiz-leaderboard-list">
                    {sortedEntries.map((entry, i) => {
                        const played = entry.total_played || 0;
                        const wins = entry.total_wins || 0;
                        const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
                        return (
                            <div key={entry.id} className={`quiz-lb-row ${entry.id === player?.id ? 'quiz-lb-me' : ''}`}>
                                <span className="quiz-lb-rank">
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </span>
                                <span className="quiz-lb-avatar">{entry.avatar_emoji}</span>
                                <div className="quiz-lb-info">
                                    <span className="quiz-lb-name">{entry.pseudo}</span>
                                    <span className="quiz-lb-detail">
                                        {wins} victoires • {winRate}% • {played} parties
                                    </span>
                                </div>
                                <span className="quiz-lb-sprint">⚡{entry.sprint_best || 0}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
