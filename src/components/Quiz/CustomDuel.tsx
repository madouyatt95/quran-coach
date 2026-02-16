import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { QUIZ_THEMES } from '../../data/quizTypes';
import type { QuizThemeId } from '../../data/quizTypes';

export function CustomDuel() {
    const { createDuel, setView } = useQuizStore();
    const [selected, setSelected] = useState<QuizThemeId[]>([]);
    const [creating, setCreating] = useState(false);

    const toggleTheme = (id: QuizThemeId) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(t => t !== id));
        } else if (selected.length < 3) {
            setSelected([...selected, id]);
        }
    };

    const handleCreate = async () => {
        if (selected.length !== 3) return;
        setCreating(true);
        await createDuel(selected);
        setCreating(false);
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Duel Personnalisé</h1>
            </div>

            <p className="quiz-subtitle">Sélectionne 3 thèmes pour ce duel ({selected.length}/3)</p>
            <div className="quiz-theme-grid">
                {QUIZ_THEMES.map(theme => (
                    <div
                        key={theme.id}
                        className={`quiz-theme-card ${selected.includes(theme.id) ? 'active' : ''}`}
                        onClick={() => toggleTheme(theme.id)}
                        style={{ '--theme-gradient': theme.gradient } as any}
                    >
                        <div className="quiz-theme-emoji">{theme.emoji}</div>
                        <div className="quiz-theme-info">
                            <h3>{theme.name}</h3>
                            <p>{theme.nameAr}</p>
                        </div>
                        {selected.includes(theme.id) && <div className="quiz-theme-check">✓</div>}
                    </div>
                ))}
            </div>

            <button
                className="quiz-btn-primary"
                style={{ marginTop: '24px', width: '100%', opacity: selected.length === 3 ? 1 : 0.5 }}
                disabled={selected.length !== 3 || creating}
                onClick={handleCreate}
            >
                {creating ? <div className="quiz-spinner" /> : 'Générer le code de match'}
            </button>
        </div>
    );
}
