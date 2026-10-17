import { ArrowLeft, Zap, Trophy, CheckCircle } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function DailyChallengeView() {
    const { startDaily, dailyChallengeLastDate, dailyDraft, setView } = useQuizStore();
    const today = new Date().toISOString().split('T')[0];
    const hasPlayedToday = dailyChallengeLastDate === today;

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="quiz-title">Défi du Jour</h1>
            </div>

            <div className="quiz-daily-intro">
                <div className="quiz-daily-icon">📅</div>
                <h2>Le Défi du Jour</h2>
                <p>
                    Chaque jour, un nouveau quiz de 10 questions est généré.
                    Tout le monde reçoit les mêmes questions !
                </p>

                <div className="quiz-daily-perks">
                    <div className="quiz-perk">
                        <Zap size={18} color="#ffc107" />
                        <span>XP doublée (x2)</span>
                    </div>
                    <div className="quiz-perk">
                        <Trophy size={18} color="#FFD700" />
                        <span>Même défi pour tous · renouvelé à 00 h UTC</span>
                    </div>
                </div>

                {hasPlayedToday ? (
                    <div className="quiz-daily-played">
                        <CheckCircle size={24} color="#4CAF50" />
                        <p>Tu as déjà relevé le défi aujourd'hui ! Reviens demain.</p>
                        <button className="quiz-join-btn" onClick={() => setView('home')}>
                            Retour à l'accueil
                        </button>
                    </div>
                ) : (
                    <button className="quiz-btn-primary" onClick={startDaily} style={{ marginTop: '20px' }}>
                        {dailyDraft?.date===today?'Reprendre mon défi':'Relever le défi'}
                    </button>
                )}
            </div>
        </div>
    );
}
