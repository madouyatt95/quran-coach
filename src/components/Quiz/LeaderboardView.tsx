import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';
import type { QuizThemeId } from '../../data/quizTypes';

// Compute ranking score: primarily XP (total_score), tie-breaker is win rate
function rankingScore(entry: any): number {
    const xp = entry.total_score || 0;
    const wins = entry.total_wins || 0;
    const played = entry.total_played || 1;
    const winRate = played > 0 ? (wins / played) : 0;

    // Primary: XP. Secondary: Win Rate (as a fractional decimal added to XP to break ties without overpowering XP)
    return xp + winRate;
}

export function LeaderboardView() {
    const { setView, player, totalCorrect, sprintBest, totalPlayed, totalWins, themeStats, totalXP } = useQuizStore();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,setError]=useState(false);
    const weeklyXP=useQuizStore(s=>s.weeklyXP);
    const weekStart=new Date();weekStart.setDate(weekStart.getDate()-(weekStart.getDay()+6)%7);weekStart.setHours(0,0,0,0);
    const weekXP=Object.entries(weeklyXP).filter(([day])=>new Date(day+'T12:00:00').getTime()>=weekStart.getTime()).reduce((sum,[,xp])=>sum+xp,0);
    const [themeFilter, setThemeFilter] = useState<QuizThemeId | 'all'>('all');

    useEffect(()=>{
        let cancelled=false;
        setLoading(true);setError(false);
        void import('../../lib/supabase').then(async({supabase})=>{
            const {data,error}=await supabase.from('quiz_leaderboard').select('*').order('total_score',{ascending:false}).limit(100);
            if(cancelled)return;
            if(error)setError(true);else setEntries(data||[]);
        }).catch(()=>{if(!cancelled)setError(true);}).finally(()=>{if(!cancelled)setLoading(false);});
        return()=>{cancelled=true;};
    },[]);

    // Sort by ranking score client-side (to handle ties or slightly adjust downloaded top 100)
    const sortedEntries = useMemo(() =>
        [...entries].sort((a, b) => rankingScore(b) - rankingScore(a)),
        [entries]);

    const myWinRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;
    const myRankScore = totalXP; // Display their actual XP


    // Theme-specific stats for "my stats" card
    const myThemeData = themeFilter !== 'all' ? themeStats[themeFilter] : null;
    const myThemeAccuracy = myThemeData && myThemeData.attempts > 0
        ? Math.round((myThemeData.correct / myThemeData.attempts) * 100) : 0;

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

            <section className="qx qx-card"><h2>Ta semaine</h2><p>{weekXP} XP gagnés cette semaine sur cet appareil.</p><p className="qx-muted">Le classement ci-dessous compare les XP cumulés de tous les joueurs.</p></section>
            {error&&<p role="alert">Le classement ne peut pas être chargé. Réessaie dans un instant.</p>}
            {/* Theme Filter */}
            <div style={{
                display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 4px 12px',
                WebkitOverflowScrolling: 'touch',
            }}>
                <button
                    onClick={() => setThemeFilter('all')}
                    style={{
                        padding: '6px 12px', borderRadius: 20, border: 'none',
                        fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                        background: themeFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: themeFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                >
                    Tous
                </button>
                {QUIZ_THEMES.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setThemeFilter(t.id)}
                        style={{
                            padding: '6px 12px', borderRadius: 20, border: 'none',
                            fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                            background: themeFilter === t.id ? `${t.color}33` : 'rgba(255,255,255,0.04)',
                            color: themeFilter === t.id ? t.color : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        {t.emoji} {t.name}
                    </button>
                ))}
            </div>

            {/* My Stats Card */}
            <div className="quiz-my-leaderboard">
                <span className="quiz-lb-emoji">{player?.avatar_emoji}</span>
                <span className="quiz-lb-pseudo">{player?.pseudo}</span>
                {themeFilter === 'all' ? (
                    <>
                        <div className="quiz-lb-my-stats">
                            <span>🏆 {totalWins}/{totalPlayed}</span>
                            <span>📊 {myWinRate}%</span>
                            <span>⚡ {sprintBest}</span>
                            <span>✅ {totalCorrect}</span>
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                            Score: {myRankScore} pts
                        </div>
                    </>
                ) : (
                    <div className="quiz-lb-my-stats">
                        <span>📊 {myThemeAccuracy}%</span>
                        <span>✅ {myThemeData?.correct || 0}/{myThemeData?.attempts || 0}</span>
                        <span>🔥 {myThemeData?.bestStreak || 0}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="quiz-lobby-loading">
                    <div className="quiz-spinner" />
                    <p>Chargement...</p>
                </div>
            ) : error ? null : sortedEntries.length === 0 ? (
                <div className="quiz-empty-lb">
                    <p>🏆 Aucun joueur dans le classement pour le moment.</p>
                    <p>Joue une partie pour apparaître !</p>
                </div>
            ) : (
                <div className="quiz-leaderboard-list">
                    {sortedEntries.map((entry, i) => {
                        const played = entry.total_played || 0;
                        const wins = entry.total_wins || 0;
                        const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
                        const xp = entry.total_score || 0;

                        return (
                            <div key={entry.id} className={`quiz-lb-row ${entry.id === player?.id ? 'quiz-lb-me' : ''}`}>
                                <span className="quiz-lb-rank">
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </span>
                                <span className="quiz-lb-avatar">{entry.avatar_emoji}</span>
                                <div className="quiz-lb-info">
                                    <span className="quiz-lb-name">{entry.pseudo}</span>
                                    <span className="quiz-lb-detail">
                                        {winRate}% de victoires ({wins} / {played})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <span className="quiz-lb-sprint" style={{ color: '#FFD700', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {xp} <span style={{ fontSize: '10px' }}>XP</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
