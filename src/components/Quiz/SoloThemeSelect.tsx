import { ArrowLeft, BookOpen, Crown } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';
import { getQuestionCounts } from '../../lib/quizEngine';

export function SoloThemeSelect() {
    const { selectTheme, selectRandomSolo, setView, soloHighScores, themeStats } = useQuizStore();
    const counts = getQuestionCounts();

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">
                    <BookOpen size={24} />
                    <span>Choisir un thème</span>
                </h1>
            </div>

            <div className="quiz-theme-grid">
                {/* Random Card First */}
                <button
                    className="quiz-theme-card"
                    style={{ background: 'linear-gradient(135deg, #607D8B, #455A64)' }}
                    onClick={selectRandomSolo}
                >
                    <span className="quiz-theme-emoji">🎲</span>
                    <span className="quiz-theme-name">Aléatoire</span>
                    <span className="quiz-theme-nameAr">عشوائي</span>
                    <span className="quiz-theme-count">Tirage au sort</span>
                </button>

                {QUIZ_THEMES.map(theme => {
                    const stats = themeStats[theme.id];
                    const rate = stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
                    return (
                        <button
                            key={theme.id}
                            className="quiz-theme-card"
                            style={{ background: theme.gradient }}
                            onClick={() => selectTheme(theme.id)}
                        >
                            <span className="quiz-theme-emoji">{theme.emoji}</span>
                            <span className="quiz-theme-name">{theme.name}</span>
                            <span className="quiz-theme-nameAr">{theme.nameAr}</span>
                            <span className="quiz-theme-count">{counts[theme.id]} questions</span>
                            <div className="quiz-theme-meta">
                                {soloHighScores[theme.id] && (
                                    <span className="quiz-theme-high">
                                        <Crown size={10} /> {soloHighScores[theme.id]}
                                    </span>
                                )}
                                {rate !== null && (
                                    <span className="quiz-theme-rate">{rate}%</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
