import { useWeatherAdhkar } from '../../hooks/useWeatherAdhkar';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { Heart, Umbrella } from 'lucide-react';
import './WeatherAdhkarCard.css';

export function WeatherAdhkarCard() {
    const { adhkar, loading } = useWeatherAdhkar();
    const { toggleFavoriteHadith, isFavoriteHadith } = useFavoritesStore();

    if (loading || !adhkar) {
        return null;
    }

    const { id, emoji, title, textAr, phonetic, textFr, gradient } = adhkar;
    const isFav = isFavoriteHadith(id);

    return (
        <div className="weather-adhkar-card" style={{ background: gradient }}>
            <div className="weather-adhkar-card__header">
                <div className="weather-adhkar-card__label">
                    <span className="weather-adhkar-card__icon">{emoji}</span>
                    <span>{title}</span>
                </div>
            </div>

            <div className="weather-adhkar-card__arabic">
                {textAr}
            </div>

            <div className="weather-adhkar-card__phonetic">
                {phonetic}
            </div>

            <div className="weather-adhkar-card__french">
                {textFr}
            </div>

            <div className="weather-adhkar-card__footer">
                <div className="weather-adhkar-card__source">
                    <Umbrella size={12} />
                    <span>Husnul Muslim</span>
                </div>
                <button
                    className={`weather-adhkar-card__fav ${isFav ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFavoriteHadith({
                            id: id,
                            ar: textAr,
                            fr: textFr,
                            src: "Hisnul Muslim",
                            nar: "Invocation Météo",
                            cat: 'weather',
                        });
                    }}
                >
                    <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                </button>
            </div>
        </div>
    );
}
