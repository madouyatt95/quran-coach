import { Heart, Trash2, BookOpen } from 'lucide-react';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useQuranStore } from '../stores/quranStore';
import { useNavigate } from 'react-router-dom';
import './FavoritesPage.css';

export function FavoritesPage() {
    const { favorites, removeFavorite } = useFavoritesStore();
    const { goToPage, surahs } = useQuranStore();
    const navigate = useNavigate();

    const sortedFavorites = [...favorites].sort((a, b) => b.addedAt - a.addedAt);

    const handleGoToVerse = (fav: typeof favorites[0]) => {
        sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: fav.surah, ayah: fav.numberInSurah }));
        fetch(`https://api.alquran.cloud/v1/ayah/${fav.number}`)
            .then(res => res.json())
            .then(data => {
                if (data.code === 200 && data.data?.page) {
                    goToPage(data.data.page);
                }
            })
            .catch(() => { });
        navigate('/');
    };

    return (
        <div className="favorites-page">
            <div className="favorites-header">
                <h1 className="favorites-title">
                    <Heart size={24} fill="currentColor" />
                    Favoris
                </h1>
                <span className="favorites-count">{favorites.length} verset(s)</span>
            </div>

            {sortedFavorites.length === 0 ? (
                <div className="favorites-empty">
                    <Heart size={48} strokeWidth={1} />
                    <p>Aucun verset en favoris</p>
                    <p className="favorites-empty__hint">
                        Appuyez sur le <Heart size={14} fill="currentColor" style={{ verticalAlign: 'middle' }} /> sur un verset dans la page de lecture pour l'ajouter
                    </p>
                </div>
            ) : (
                <div className="favorites-list">
                    {sortedFavorites.map(fav => {
                        const surah = surahs.find(s => s.number === fav.surah);
                        return (
                            <div key={fav.number} className="favorites-card" onClick={() => handleGoToVerse(fav)}>
                                <div className="favorites-card__ref">
                                    <BookOpen size={14} />
                                    {surah?.name} ({surah?.englishName}) — Verset {fav.numberInSurah}
                                </div>
                                <div className="favorites-card__text" dir="rtl">
                                    {fav.text.length > 120 ? fav.text.slice(0, 120) + '…' : fav.text}
                                </div>
                                <div className="favorites-card__footer">
                                    <span className="favorites-card__date">
                                        {new Date(fav.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <button
                                        className="favorites-card__delete"
                                        onClick={(e) => { e.stopPropagation(); removeFavorite(fav.number); }}
                                        title="Retirer des favoris"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
