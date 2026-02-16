import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function JoinDuel() {
    const { joinDuel, setView } = useQuizStore();
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        if (code.length < 6) return;
        setJoining(true);
        setError('');
        const success = await joinDuel(code);
        if (!success) {
            setError('Partie introuvable ou déjà commencée');
            setJoining(false);
        }
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Rejoindre</h1>
            </div>

            <div className="quiz-join">
                <p className="quiz-join-label">Entre le code de la partie</p>
                <input
                    type="text"
                    className="quiz-join-input"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="ABC123"
                    maxLength={6}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                {error && <p className="quiz-join-error">{error}</p>}
                <button
                    className="quiz-btn-primary"
                    onClick={handleJoin}
                    disabled={code.length < 6 || joining}
                >
                    {joining ? 'Connexion...' : 'Rejoindre'}
                </button>
            </div>
        </div>
    );
}
