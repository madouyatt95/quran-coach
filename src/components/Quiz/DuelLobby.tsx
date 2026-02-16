import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function DuelLobby() {
    const { matchCode, createDuel, setView, opponent } = useQuizStore();
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!matchCode && !creating) {
            setCreating(true);
            createDuel().then(() => setCreating(false));
        }
    }, [matchCode, creating, createDuel]);

    const copyCode = async () => {
        if (matchCode) {
            await navigator.clipboard.writeText(matchCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareCode = async () => {
        if (matchCode && typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: 'Duel Quiz - Quran Coach',
                    text: `Rejoins mon duel ! Code: ${matchCode}`,
                });
            } catch { /* user cancelled */ }
        }
    };

    if (opponent) return null; // Will transition to playing

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Duel</h1>
            </div>

            <div className="quiz-lobby">
                {creating ? (
                    <div className="quiz-lobby-loading">
                        <div className="quiz-spinner" />
                        <p>Préparation de la partie...</p>
                    </div>
                ) : (
                    <>
                        <p className="quiz-lobby-label">Code de la partie</p>
                        <div className="quiz-code-display">
                            {matchCode?.split('').map((char, i) => (
                                <span key={i} className="quiz-code-char">{char}</span>
                            ))}
                        </div>
                        <div className="quiz-lobby-actions">
                            <button className="quiz-btn-secondary" onClick={copyCode}>
                                <Copy size={18} />
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                            {typeof navigator.share === 'function' && (
                                <button className="quiz-btn-secondary" onClick={shareCode}>
                                    <Share2 size={18} />
                                    Partager
                                </button>
                            )}
                        </div>
                        <div className="quiz-lobby-waiting">
                            <div className="quiz-spinner" />
                            <p>En attente d'un adversaire...</p>
                        </div>
                        <p className="quiz-lobby-hint">
                            Si ton adversaire a déjà rejoint et que tu es bloqué ici,
                            la resynchronisation automatique devrait s'en charger...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
