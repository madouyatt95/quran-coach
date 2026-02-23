import { useSmartCoaching, type SmartCardData } from '../../hooks/useSmartCoaching';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { Heart, ShieldCheck, ChevronRight } from 'lucide-react';
import './SmartSentinel.css';

export function SmartSentinel() {
    const { cards, loading } = useSmartCoaching();

    if (loading || cards.length === 0) {
        return null;
    }

    return (
        <div className="smart-sentinel">
            <div className="smart-sentinel__header">
                <div className="smart-sentinel__title-row">
                    <ShieldCheck size={18} color="#c9a84c" />
                    <span>Sentinelle Spirituelle</span>
                </div>
                {cards.length > 1 && (
                    <div className="smart-sentinel__count">{cards.length} alertes</div>
                )}
            </div>

            <div className="smart-sentinel__carousel">
                {cards.map((card) => (
                    <SmartCard key={card.id} data={card} />
                ))}
            </div>
        </div>
    );
}

function SmartCard({ data }: { data: SmartCardData }) {
    const { toggleFavoriteHadith, isFavoriteHadith } = useFavoritesStore();
    const isFav = isFavoriteHadith(data.id as any); // Type hack for simplicity in this version

    return (
        <div className="smart-card" style={{ background: data.gradient }}>
            <div className="smart-card__badge">
                <span className="smart-card__emoji">{data.emoji}</span>
                <span>{data.title}</span>
            </div>

            <div className="smart-card__content">
                <div className="smart-card__arabic">{data.textAr}</div>
                <div className="smart-card__french">{data.textFr}</div>
                {data.phonetic && <div className="smart-card__phonetic">{data.phonetic}</div>}
            </div>

            <div className="smart-card__footer">
                <button
                    className={`smart-card__fav ${isFav ? 'active' : ''}`}
                    onClick={() => toggleFavoriteHadith({
                        id: 9000 + (data.id.length), // Dummy unique int ID
                        ar: data.textAr,
                        fr: data.textFr,
                        src: "Sentinelle",
                        nar: data.title,
                        cat: 'sentinel'
                    })}
                >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                </button>
                <div className="smart-card__action">
                    <span>Voir plus</span>
                    <ChevronRight size={14} />
                </div>
            </div>

            {data.progress !== undefined && (
                <div className="smart-card__progress-bg">
                    <div className="smart-card__progress-bar" style={{ width: `${data.progress}%` }} />
                </div>
            )}
        </div>
    );
}
