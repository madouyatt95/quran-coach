import { useState, useMemo } from 'react';
import { Heart, Trash2, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useQuranStore } from '../stores/quranStore';
import './FavoritesPage.css';

type Tab = 'verses' | 'hadiths' | 'duas';

export function FavoritesPage() {
    const [tab, setTab] = useState<Tab>('verses');
    const { favorites, removeFavorite, favoriteHadiths, removeFavoriteHadith, favoriteDuas, removeFavoriteDua } = useFavoritesStore();
    const { goToPage, surahs } = useQuranStore();
    const navigate = useNavigate();

    const sortedVerses = useMemo(() => [...favorites].sort((a, b) => b.addedAt - a.addedAt), [favorites]);
    const sortedHadiths = useMemo(() => [...favoriteHadiths].sort((a, b) => b.addedAt - a.addedAt), [favoriteHadiths]);
    const sortedDuas = useMemo(() => [...favoriteDuas].sort((a, b) => b.addedAt - a.addedAt), [favoriteDuas]);

    const totalCount = favorites.length + favoriteHadiths.length + favoriteDuas.length;

    const handleGoToVerse = (fav: typeof favorites[0]) => {
        sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: fav.surah, ayah: fav.numberInSurah }));
        fetch(`https://api.alquran.cloud/v1/ayah/${fav.number}`)
            .then(res => res.json())
            .then(data => {
                if (data.code === 200 && data.data?.page) { goToPage(data.data.page); }
            })
            .catch(() => { });
        navigate('/');
    };

    const tabs: { id: Tab; emoji: string; label: string; count: number }[] = [
        { id: 'verses', emoji: '📖', label: 'Versets', count: favorites.length },
        { id: 'hadiths', emoji: '📜', label: 'Hadiths', count: favoriteHadiths.length },
        { id: 'duas', emoji: '🤲', label: 'Duas', count: favoriteDuas.length },
    ];

    return (
        <div className="favorites-page">
            <div className="favorites-header">
                <button className="favorites-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="favorites-title">
                    <Heart size={24} fill="currentColor" />
                    Favoris
                </h1>
                <span className="favorites-count">{totalCount}</span>
            </div>

            {/* Tabs */}
            <div className="favorites-tabs">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`favorites-tab ${tab === t.id ? 'active' : ''}`}
                        onClick={() => setTab(t.id)}
                    >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                        {t.count > 0 && <span className="favorites-tab__badge">{t.count}</span>}
                    </button>
                ))}
            </div>

            {/* === VERSES TAB === */}
            {tab === 'verses' && (
                sortedVerses.length === 0 ? (
                    <div className="favorites-empty">
                        <Heart size={48} strokeWidth={1} />
                        <p>Aucun verset en favoris</p>
                        <p className="favorites-empty__hint">
                            Appuyez sur le <Heart size={14} fill="currentColor" style={{ verticalAlign: 'middle' }} /> dans la page de lecture
                        </p>
                    </div>
                ) : (
                    <div className="favorites-list">
                        {sortedVerses.map(fav => {
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
                                        <button className="favorites-card__delete" onClick={e => { e.stopPropagation(); removeFavorite(fav.number); }} title="Retirer">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* === HADITHS TAB === */}
            {tab === 'hadiths' && (
                sortedHadiths.length === 0 ? (
                    <div className="favorites-empty">
                        <Heart size={48} strokeWidth={1} />
                        <p>Aucun hadith en favoris</p>
                        <p className="favorites-empty__hint">
                            Appuyez sur le ❤️ dans la page Hadiths
                        </p>
                    </div>
                ) : (
                    <div className="favorites-list">
                        {sortedHadiths.map(h => (
                            <div key={h.id} className="favorites-card favorites-card--hadith">
                                <div className="favorites-card__text" dir="rtl">{h.ar}</div>
                                <div className="favorites-card__french">{h.fr}</div>
                                <div className="favorites-card__meta">
                                    <span>📕 {h.src}</span>
                                    <span>🗣️ {h.nar}</span>
                                </div>
                                <div className="favorites-card__footer">
                                    <span className="favorites-card__date">
                                        {new Date(h.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <button className="favorites-card__delete" onClick={() => removeFavoriteHadith(h.id)} title="Retirer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* === DUAS TAB === */}
            {tab === 'duas' && (
                sortedDuas.length === 0 ? (
                    <div className="favorites-empty">
                        <Heart size={48} strokeWidth={1} />
                        <p>Aucune invocation en favoris</p>
                        <p className="favorites-empty__hint">
                            Appuyez sur le ❤️ dans la page Invocations
                        </p>
                    </div>
                ) : (
                    <div className="favorites-list">
                        {sortedDuas.map(d => (
                            <div key={`${d.chapterId}-${d.duaId}`} className="favorites-card favorites-card--dua">
                                <div className="favorites-card__ref">🤲 {d.chapterTitle}</div>
                                <div className="favorites-card__text" dir="rtl">{d.arabic}</div>
                                <div className="favorites-card__french">{d.translation}</div>
                                <div className="favorites-card__footer">
                                    <span className="favorites-card__date">
                                        {new Date(d.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <button className="favorites-card__delete" onClick={() => removeFavoriteDua(d.chapterId, d.duaId)} title="Retirer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
