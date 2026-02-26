import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Heart, Share2, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HADITH_CATEGORIES, EXPANDED_HADITHS, type HadithCategory, type HadithEntry } from '../data/hadithsExpanded';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useTranslation } from 'react-i18next';
import { formatDivineNames } from '../lib/divineNames';
import './HadithsPage.css';

export function HadithsPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [selectedCat, setSelectedCat] = useState<HadithCategory | null>(() => {
        const catParam = searchParams.get('cat') as HadithCategory | null;
        if (catParam && HADITH_CATEGORIES.some(c => c.id === catParam)) {
            return catParam;
        }
        return null;
    });
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { toggleFavoriteHadith, isFavoriteHadith } = useFavoritesStore();

    const filteredHadiths = useMemo(() => {
        let list = selectedCat
            ? EXPANDED_HADITHS.filter(h => h.cat === selectedCat)
            : EXPANDED_HADITHS;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(h =>
                h.fr.toLowerCase().includes(q) ||
                h.ar.includes(q) ||
                h.nar.toLowerCase().includes(q) ||
                h.src.toLowerCase().includes(q)
            );
        }
        return list;
    }, [selectedCat, search]);

    const catInfo = useMemo(
        () => selectedCat ? HADITH_CATEGORIES.find(c => c.id === selectedCat) : null,
        [selectedCat]
    );

    const handleFav = useCallback((h: HadithEntry) => {
        toggleFavoriteHadith({ id: h.id, ar: h.ar, fr: h.fr, src: h.src, nar: h.nar, cat: h.cat });
    }, [toggleFavoriteHadith]);

    const handleShare = useCallback(async (h: HadithEntry) => {
        const text = `${h.ar}\n\n${h.fr}\n\n— ${h.src} (${h.nar})`;
        if (navigator.share) {
            try { await navigator.share({ text }); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(text);
        }
    }, []);

    // — Categories Grid —
    if (!selectedCat) {
        return (
            <div className="hadiths-page">
                <div className="hadiths-header">
                    <button className="hadiths-back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="hadiths-title">📜 {t('sideMenu.hadiths', 'Hadiths')}</h1>
                    <span className="hadiths-badge">{EXPANDED_HADITHS.length}</span>
                </div>

                <div className="hadiths-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder={t('hadiths.searchPlaceholder', 'Rechercher un hadith...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {search.trim() ? (
                    <div className="hadiths-list">
                        {filteredHadiths.length === 0 ? (
                            <div className="hadiths-empty">{t('common.noResultsFor', 'Aucun résultat pour "{{query}}"', { query: search })}</div>
                        ) : (
                            filteredHadiths.map(h => (
                                <HadithCard
                                    key={h.id}
                                    hadith={h}
                                    isFav={isFavoriteHadith(h.id)}
                                    onFav={() => handleFav(h)}
                                    onShare={() => handleShare(h)}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="hadiths-categories">
                        {HADITH_CATEGORIES.map(cat => {
                            const count = EXPANDED_HADITHS.filter(h => h.cat === cat.id).length;
                            return (
                                <button
                                    key={cat.id}
                                    className="hadiths-cat-card"
                                    onClick={() => setSelectedCat(cat.id)}
                                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                                >
                                    <span className="hadiths-cat-emoji">{cat.emoji}</span>
                                    <span className="hadiths-cat-name">{cat.name}</span>
                                    <span className="hadiths-cat-nameAr">{cat.nameAr}</span>
                                    <span className="hadiths-cat-count">{count} {t('hadiths.count', 'hadiths')}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // — Hadith List View —
    return (
        <div className="hadiths-page">
            <div className="hadiths-header">
                <button className="hadiths-back" onClick={() => setSelectedCat(null)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="hadiths-title">
                    {catInfo?.emoji} {catInfo?.name}
                </h1>
                <span className="hadiths-badge">{filteredHadiths.length}</span>
            </div>

            <div className="hadiths-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder={t('common.search', 'Rechercher...')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="hadiths-list">
                {filteredHadiths.length === 0 ? (
                    <div className="hadiths-empty">{t('common.noResults', 'Aucun résultat')}</div>
                ) : (
                    filteredHadiths.map(h => (
                        <HadithCard
                            key={h.id}
                            hadith={h}
                            isFav={isFavoriteHadith(h.id)}
                            onFav={() => handleFav(h)}
                            onShare={() => handleShare(h)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function HadithCard({ hadith, isFav, onFav, onShare }: {
    hadith: HadithEntry;
    isFav: boolean;
    onFav: () => void;
    onShare: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="hadith-card">
            <div className="hadith-card__arabic" dir="rtl">{formatDivineNames(hadith.ar)}</div>
            <div className="hadith-card__french">{formatDivineNames(hadith.fr)}</div>
            <div className="hadith-card__meta">
                <span className="hadith-card__source">📕 {hadith.src}</span>
                <span className="hadith-card__narrator">🗣️ {hadith.nar}</span>
            </div>
            <div className="hadith-card__actions">
                <button
                    className={`hadith-card__fav ${isFav ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); onFav(); }}
                    title={isFav ? t('common.removeFromFavs', 'Retirer des favoris') : t('common.addToFavs', 'Ajouter aux favoris')}
                >
                    <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
                <button
                    className="hadith-card__share"
                    onClick={e => { e.stopPropagation(); onShare(); }}
                    title={t('common.share', 'Partager')}
                >
                    <Share2 size={18} />
                </button>
            </div>
        </div>
    );
}
