import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Star, Trash2 } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useQuranStore } from '../stores/quranStore';
import './FavoritesPage.css';

type Tab = 'bookmarks' | 'favorites';

export function FavoritesPage() {
    const [activeTab, setActiveTab] = useState<Tab>('bookmarks');
    const navigate = useNavigate();

    const { bookmarks, favorites, removeBookmark, removeFavorite } = useProgressStore();
    const { goToAyah, surahs } = useQuranStore();

    const getSurahName = (surahNum: number) => {
        return surahs.find(s => s.number === surahNum)?.name || `Sourate ${surahNum}`;
    };

    const handleBookmarkClick = (surah: number, ayah: number) => {
        goToAyah(surah, ayah);
        navigate('/');
    };

    return (
        <div className="favorites-page">
            <h1 className="favorites-page__header">Favoris & Signets</h1>

            <div className="favorites-page__tabs">
                <button
                    className={`favorites-page__tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookmarks')}
                >
                    <Bookmark size={16} style={{ marginRight: '8px' }} />
                    Signets ({bookmarks.length})
                </button>
                <button
                    className={`favorites-page__tab ${activeTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setActiveTab('favorites')}
                >
                    <Star size={16} style={{ marginRight: '8px' }} />
                    Favoris ({favorites.length})
                </button>
            </div>

            {activeTab === 'bookmarks' && (
                <>
                    {bookmarks.length === 0 ? (
                        <div className="favorites-empty">
                            <Bookmark size={48} className="favorites-empty__icon" />
                            <p>Aucun marque-page</p>
                            <p>Appuyez sur l'icône signet pendant la lecture pour en ajouter</p>
                        </div>
                    ) : (
                        bookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className="favorite-item"
                                onClick={() => handleBookmarkClick(bookmark.surah, bookmark.ayah)}
                            >
                                <div className="favorite-item__header">
                                    <span className="favorite-item__title">
                                        {getSurahName(bookmark.surah)} - Verset {bookmark.ayah}
                                    </span>
                                    <button
                                        className="favorite-item__delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeBookmark(bookmark.id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                {bookmark.label && (
                                    <p className="favorite-item__meta">{bookmark.label}</p>
                                )}
                                <p className="favorite-item__meta">
                                    Page {bookmark.page} • {new Date(bookmark.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        ))
                    )}
                </>
            )}

            {activeTab === 'favorites' && (
                <>
                    {favorites.length === 0 ? (
                        <div className="favorites-empty">
                            <Star size={48} className="favorites-empty__icon" />
                            <p>Aucun favori</p>
                            <p>Sauvegardez vos passages préférés ici</p>
                        </div>
                    ) : (
                        favorites.map((favorite) => (
                            <div
                                key={favorite.id}
                                className="favorite-item"
                                onClick={() => handleBookmarkClick(favorite.surah, favorite.startAyah)}
                            >
                                <div className="favorite-item__header">
                                    <span className="favorite-item__title">
                                        {getSurahName(favorite.surah)} ({favorite.startAyah}-{favorite.endAyah})
                                    </span>
                                    <button
                                        className="favorite-item__delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(favorite.id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                {favorite.note && (
                                    <p className="favorite-item__text">{favorite.note}</p>
                                )}
                                <p className="favorite-item__meta">
                                    {new Date(favorite.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}
