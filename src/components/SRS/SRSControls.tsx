import { useSRSStore, QUALITY_LABELS } from '../../stores/srsStore';
import { BookmarkPlus, Calendar, Star } from 'lucide-react';
import './SRSControls.css';

interface SRSControlsProps {
    surah: number;
    ayah: number;
    onReviewComplete?: () => void;
}

export function SRSControls({ surah, ayah, onReviewComplete }: SRSControlsProps) {
    const { cards, addCard, reviewCard, getDueCards, isCardDue } = useSRSStore();

    const cardId = `${surah}:${ayah}`;
    const card = cards[cardId];
    const isDue = isCardDue(cardId);
    const dueCount = getDueCards().length;

    const handleAddToSRS = () => {
        addCard(surah, ayah);
    };

    const handleReview = (quality: number) => {
        reviewCard(cardId, quality);
        onReviewComplete?.();
    };

    // Format next review date
    const formatNextReview = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateStr === today.toISOString().split('T')[0]) return "Aujourd'hui";
        if (dateStr === tomorrow.toISOString().split('T')[0]) return "Demain";

        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) return `Dans ${diffDays} jours`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="srs-controls">
            {/* Due cards badge */}
            {dueCount > 0 && (
                <div className="srs-due-badge">
                    <Calendar size={14} />
                    <span>{dueCount} verset{dueCount > 1 ? 's' : ''} à réviser</span>
                </div>
            )}

            {!card ? (
                // Not in SRS yet - show add button
                <button className="srs-add-btn" onClick={handleAddToSRS}>
                    <BookmarkPlus size={18} />
                    <span>Ajouter à la mémorisation</span>
                </button>
            ) : isDue ? (
                // Due for review - show rating buttons
                <div className="srs-review">
                    <p className="srs-review__prompt">Comment était votre récitation ?</p>
                    <div className="srs-review__buttons">
                        {QUALITY_LABELS.slice(2).map((q) => (
                            <button
                                key={q.value}
                                className="srs-review__btn"
                                style={{ '--btn-color': q.color } as React.CSSProperties}
                                onClick={() => handleReview(q.value)}
                            >
                                <span className="srs-review__emoji">{q.emoji}</span>
                                <span className="srs-review__label">{q.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // In SRS but not due - show next review date
                <div className="srs-status">
                    <Star size={16} className="srs-status__icon" />
                    <span>En mémorisation</span>
                    <span className="srs-status__next">
                        Prochaine révision: {formatNextReview(card.nextReviewDate)}
                    </span>
                </div>
            )}
        </div>
    );
}
