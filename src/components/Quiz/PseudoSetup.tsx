import { useState } from 'react';
import { useQuizStore } from '../../stores/quizStore';

export function PseudoSetup({ onDone }: { onDone: () => void }) {
    const { setPlayer } = useQuizStore();
    const [pseudo, setPseudo] = useState('');
    const [emoji, setEmoji] = useState('🎓');
    const emojis = ['🎓', '🕌', '📖', '⭐', '🌙', '🤲', '🏆', '💎', '🦁', '🌟', '🔥', '👑'];

    const handleSubmit = () => {
        if (pseudo.trim().length < 2) return;
        setPlayer({
            id: crypto.randomUUID(),
            pseudo: pseudo.trim(),
            avatar_emoji: emoji,
            total_wins: 0,
            total_played: 0,
            total_xp: 0,
            level: 1,
            title: 'Mubtadi'
        });
        onDone();
    };

    return (
        <div className="quiz-pseudo-setup">
            <div className="quiz-pseudo-card">
                <h2>Choisis ton pseudo</h2>
                <div className="quiz-emoji-grid">
                    {emojis.map(e => (
                        <button
                            key={e}
                            className={`quiz-emoji-btn ${emoji === e ? 'active' : ''}`}
                            onClick={() => setEmoji(e)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    className="quiz-pseudo-input"
                    placeholder="Ton pseudo..."
                    value={pseudo}
                    onChange={e => setPseudo(e.target.value)}
                    maxLength={15}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                />
                <button
                    className="quiz-btn-primary"
                    onClick={handleSubmit}
                    disabled={pseudo.trim().length < 2}
                >
                    C'est parti !
                </button>
            </div>
        </div>
    );
}
