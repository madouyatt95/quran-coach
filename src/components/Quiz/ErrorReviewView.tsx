import { useState, useMemo } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';
import type { QuizThemeId } from '../../data/quizTypes';

export function ErrorReviewView() {
    const { setView, wrongQuestions } = useQuizStore();
    const [themeFilter, setThemeFilter] = useState<QuizThemeId | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Group by theme
    const themeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const q of wrongQuestions) {
            counts[q.theme] = (counts[q.theme] || 0) + 1;
        }
        return counts;
    }, [wrongQuestions]);

    // Filter
    const filtered = useMemo(() =>
        themeFilter === 'all'
            ? wrongQuestions
            : wrongQuestions.filter(q => q.theme === themeFilter),
        [wrongQuestions, themeFilter]);

    const getTheme = (id: QuizThemeId) => QUIZ_THEMES.find(t => t.id === id);

    const removeQuestion = (questionId: string) => {
        const store = useQuizStore.getState();
        const updated = store.wrongQuestions.filter(q => q.id !== questionId);
        useQuizStore.setState({ wrongQuestions: updated });
    };

    const clearAll = () => {
        useQuizStore.setState({ wrongQuestions: [] });
        setView('home');
    };

    const retryErrors = () => {
        const store = useQuizStore.getState();
        const questions = themeFilter === 'all'
            ? store.wrongQuestions.slice(0, 10)
            : store.wrongQuestions.filter(q => q.theme === themeFilter).slice(0, 10);
        if (questions.length === 0) return;
        useQuizStore.setState({
            mode: 'revision',
            questions,
            currentIndex: 0,
            answers: [],
            score: 0,
            currentStreak: 0,
            timerStart: Date.now(),
            view: 'playing',
        });
    };

    if (wrongQuestions.length === 0) {
        return (
            <div className="quiz-container">
                <div className="quiz-header">
                    <button className="quiz-back-btn" onClick={() => setView('home')}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="quiz-title">📝 Mes Erreurs</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
                    <p style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</p>
                    <p>Aucune erreur à revoir !</p>
                    <p style={{ fontSize: 12, marginTop: 8 }}>Continue à jouer pour voir tes erreurs ici.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">📝 Mes Erreurs</h1>
            </div>

            {/* Summary bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', margin: '0 0 8px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', fontSize: 13,
            }}>
                <span>{filtered.length} question{filtered.length > 1 ? 's' : ''}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={retryErrors}
                        style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            background: 'rgba(76,175,80,0.15)', color: '#4CAF50',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        ▶ S'entraîner
                    </button>
                    <button
                        onClick={clearAll}
                        style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            background: 'rgba(244,67,54,0.1)', color: '#F44336',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Tout effacer
                    </button>
                </div>
            </div>

            {/* Theme filter */}
            <div style={{
                display: 'flex', gap: 6, overflowX: 'auto', padding: '0 0 12px',
                WebkitOverflowScrolling: 'touch',
            }}>
                <button
                    onClick={() => setThemeFilter('all')}
                    style={{
                        padding: '5px 10px', borderRadius: 16, border: 'none',
                        fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                        background: themeFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: themeFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                >
                    Tous ({wrongQuestions.length})
                </button>
                {Object.entries(themeCounts).map(([tid, count]) => {
                    const theme = getTheme(tid as QuizThemeId);
                    if (!theme) return null;
                    return (
                        <button
                            key={tid}
                            onClick={() => setThemeFilter(tid as QuizThemeId)}
                            style={{
                                padding: '5px 10px', borderRadius: 16, border: 'none',
                                fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                                background: themeFilter === tid ? `${theme.color}33` : 'rgba(255,255,255,0.04)',
                                color: themeFilter === tid ? theme.color : 'rgba(255,255,255,0.4)',
                            }}
                        >
                            {theme.emoji} {theme.name} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Error cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((q) => {
                    const theme = getTheme(q.theme);
                    const isExpanded = expandedId === q.id;
                    return (
                        <div
                            key={q.id}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 12,
                                padding: '12px 14px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                style={{ cursor: 'pointer' }}
                                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, padding: '2px 6px',
                                        borderRadius: 6, background: `${theme?.color || '#666'}22`,
                                        color: theme?.color || '#aaa',
                                    }}>
                                        {theme?.emoji} {theme?.name}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'rgba(255,255,255,0.2)', padding: 2,
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 4px', color: '#e8e4da' }}>
                                    {q.questionFr}
                                </p>
                                {q.questionAr && (
                                    <p style={{ fontSize: 15, fontFamily: "'Amiri', serif", margin: '4px 0', color: '#C9A84C', direction: 'rtl' }}>
                                        {q.questionAr}
                                    </p>
                                )}
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                    {isExpanded ? '▲ Masquer' : '▼ Voir la réponse'}
                                </p>
                            </div>

                            {isExpanded && (
                                <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                                    {q.choices.map((choice, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '8px 12px',
                                                margin: '4px 0',
                                                borderRadius: 8,
                                                fontSize: 13,
                                                background: i === q.correctIndex
                                                    ? 'rgba(76,175,80,0.12)'
                                                    : 'rgba(255,255,255,0.02)',
                                                border: i === q.correctIndex
                                                    ? '1px solid rgba(76,175,80,0.3)'
                                                    : '1px solid rgba(255,255,255,0.04)',
                                                color: i === q.correctIndex
                                                    ? '#81C784'
                                                    : 'rgba(255,255,255,0.6)',
                                                fontWeight: i === q.correctIndex ? 600 : 400,
                                            }}
                                        >
                                            {i === q.correctIndex ? '✅ ' : ''}{choice}
                                        </div>
                                    ))}
                                    {q.explanation && (
                                        <div style={{
                                            marginTop: 8, padding: '8px 12px', borderRadius: 8,
                                            background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.15)',
                                            fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                                        }}>
                                            💡 {q.explanation}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
