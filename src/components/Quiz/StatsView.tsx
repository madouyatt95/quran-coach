import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';

export function StatsView() {
    const { themeStats, totalPlayed, totalWins, totalCorrect, setView, sprintBest, duelWins } = useQuizStore();

    // Radar chart data
    const themes = QUIZ_THEMES;
    const radarData = themes.map(t => {
        const stats = themeStats[t.id];
        if (!stats || stats.attempts === 0) return 0;
        return Math.round((stats.correct / stats.attempts) * 100);
    });
    const maxVal = 100;
    const cx = 150, cy = 150, r = 100;

    const polarToXY = (angle: number, value: number) => {
        const a = (angle - 90) * Math.PI / 180;
        const dist = (value / maxVal) * r;
        return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) };
    };

    const angleStep = 360 / themes.length;
    const radarPoints = radarData.map((v, i) => polarToXY(i * angleStep, v));
    const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <BarChart3 size={24} />
                    <span>Statistiques</span>
                </h1>
            </div>

            {/* Global Stats */}
            <div className="quiz-global-stats">
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{totalPlayed}</span>
                    <span className="quiz-gstat-label">Parties</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{totalWins}</span>
                    <span className="quiz-gstat-label">Victoires</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{totalCorrect}</span>
                    <span className="quiz-gstat-label">Correctes</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{duelWins}</span>
                    <span className="quiz-gstat-label">Duels gagnés</span>
                </div>
                <div className="quiz-global-stat">
                    <span className="quiz-gstat-value">{sprintBest}</span>
                    <span className="quiz-gstat-label">Sprint record</span>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="quiz-radar-container">
                <h3>Performance par thème</h3>
                <svg viewBox="0 0 300 300" className="quiz-radar-svg">
                    {/* Grid circles */}
                    {[25, 50, 75, 100].map(pct => (
                        <circle key={pct} cx={cx} cy={cy} r={r * pct / 100}
                            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    ))}
                    {/* Axis lines */}
                    {themes.map((_, i) => {
                        const p = polarToXY(i * angleStep, 100);
                        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
                            stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
                    })}
                    {/* Data polygon */}
                    <path d={radarPath} fill="rgba(76,175,80,0.3)" stroke="#4CAF50" strokeWidth="2" />
                    {/* Data points */}
                    {radarPoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={4} fill={themes[i].color} />
                    ))}
                    {/* Labels */}
                    {themes.map((t, i) => {
                        const p = polarToXY(i * angleStep, 120);
                        return (
                            <text key={i} x={p.x} y={p.y} textAnchor="middle"
                                fill="var(--text-primary, #fff)" fontSize="10" fontWeight="600">
                                {t.emoji}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Per-theme details */}
            <div className="quiz-theme-stats-list">
                {themes.map(t => {
                    const stats = themeStats[t.id];
                    const rate = stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
                    return (
                        <div key={t.id} className="quiz-theme-stat-row">
                            <span className="quiz-tstat-emoji">{t.emoji}</span>
                            <div className="quiz-tstat-info">
                                <span className="quiz-tstat-name">{t.name}</span>
                                <div className="quiz-tstat-bar">
                                    <div className="quiz-tstat-fill" style={{ width: `${rate}%`, background: t.color }} />
                                </div>
                            </div>
                            <div className="quiz-tstat-numbers">
                                <span className="quiz-tstat-pct">{rate}%</span>
                                <span className="quiz-tstat-count">{stats?.correct || 0}/{stats?.attempts || 0}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
