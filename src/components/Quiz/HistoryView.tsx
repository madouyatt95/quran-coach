import { ArrowLeft, Clock } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';

export function HistoryView() {
    const { setView, gameHistory } = useQuizStore();

    const getThemeEmoji = (themeId: string | null) => {
        if (!themeId) return '🎲';
        return QUIZ_THEMES.find(t => t.id === themeId)?.emoji || '📝';
    };

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'solo': return 'Solo';
            case 'duel': return 'Duel';
            case 'sprint': return 'Sprint';
            case 'revision': return 'Révision';
            case 'daily': return 'Défi du Jour';
            default: return mode;
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <Clock size={24} />
                    <span>Historique</span>
                </h1>
            </div>

            {gameHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.6 }}>
                    <p style={{ fontSize: 40 }}>📋</p>
                    <p>Aucune partie jouée pour le moment.</p>
                    <p>Lance une partie pour voir ton historique ici !</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gameHistory.map((entry, i) => {
                        const pct = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
                        const pctColor = pct >= 80 ? '#4CAF50' : pct >= 50 ? '#FF9800' : '#f44336';
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', borderRadius: 12,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <span style={{ fontSize: 24 }}>{getThemeEmoji(entry.theme)}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary, #fff)' }}>
                                            {getModeLabel(entry.mode)}
                                        </span>
                                        <span style={{
                                            fontSize: 11, padding: '2px 8px', borderRadius: 6,
                                            background: entry.won ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                                            color: entry.won ? '#4CAF50' : '#f44336',
                                            fontWeight: 600,
                                        }}>
                                            {entry.won ? '✅ Gagné' : '❌ Perdu'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2, color: 'var(--text-primary, #fff)' }}>
                                        {formatDate(entry.date)} • {entry.score} pts
                                    </div>
                                </div>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%',
                                    border: `3px solid ${pctColor}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: pctColor }}>{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
