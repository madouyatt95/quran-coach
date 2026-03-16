import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Heart, Share2, Search, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HADITH_CATEGORIES, EXPANDED_HADITHS, type HadithCategory, type HadithEntry, type BulughChapter } from '../data/hadithsExpanded';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useTranslation } from 'react-i18next';
import { formatDivineNames } from '../lib/divineNames';
import './HadithsPage.css';

const BULUGH_CHAPTERS: { id: BulughChapter; name: string; nameAr: string; emoji: string; color: string }[] = [
    { id: 'tahara', name: 'Purification', nameAr: 'الطهارة', emoji: '💧', color: '#4FC3F7' },
    { id: 'salat', name: 'Prière', nameAr: 'الصلاة', emoji: '🕌', color: '#81C784' },
    { id: 'zakat', name: 'Zakat', nameAr: 'الزكاة', emoji: '🪙', color: '#FFD54F' },
    { id: 'siyam', name: 'Jeûne', nameAr: 'الصيام', emoji: '🌙', color: '#7986CB' },
    { id: 'hajj', name: 'Pèlerinage', nameAr: 'الحج', emoji: '🕋', color: '#D4AF37' },
    { id: 'buyu', name: 'Transactions', nameAr: 'البيوع', emoji: '⚖️', color: '#A1887F' },
    { id: 'jami', name: 'Comportement', nameAr: 'الجامع', emoji: '🤝', color: '#FF8A65' }
];

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
    const [selectedSubcat, setSelectedSubcat] = useState<BulughChapter | null>(null);
    const [search, setSearch] = useState(() => searchParams.get('search') || '');
    const navigate = useNavigate();
    const { toggleFavoriteHadith, isFavoriteHadith } = useFavoritesStore();

    const filteredHadiths = useMemo(() => {
        let list = EXPANDED_HADITHS;
        
        if (selectedCat) {
            list = list.filter(h => h.cat === selectedCat);
            if (selectedCat === 'bulugh' && selectedSubcat) {
                list = list.filter(h => h.subcat === selectedSubcat);
            }
        }
        
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

    const subcatInfo = useMemo(
        () => selectedSubcat ? BULUGH_CHAPTERS.find(c => c.id === selectedSubcat) : null,
        [selectedSubcat]
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

    // — Bulugh Chapters Sub-Menu —
    if (selectedCat === 'bulugh' && !selectedSubcat && !search.trim()) {
        return (
            <div className="hadiths-page">
                <div className="hadiths-header">
                    <button className="hadiths-back" onClick={() => setSelectedCat(null)}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="hadiths-title">
                        {catInfo?.emoji} {catInfo?.name}
                    </h1>
                </div>
                
                <div className="hadiths-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder={t('hadiths.searchChapters', 'Rechercher un chapitre...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="hadiths-categories" style={{ display: 'flex', flexDirection: 'column', padding: '12px 20px' }}>
                    {BULUGH_CHAPTERS.map(subcat => {
                        const count = EXPANDED_HADITHS.filter(h => h.cat === 'bulugh' && h.subcat === subcat.id).length;
                        return (
                            <button
                                key={subcat.id}
                                className="hadiths-cat-card"
                                onClick={() => setSelectedSubcat(subcat.id)}
                                style={{ 
                                    '--cat-color': subcat.color,
                                    flexDirection: 'row',
                                    padding: '16px',
                                    justifyContent: 'flex-start',
                                    gap: '16px'
                                } as React.CSSProperties}
                            >
                                <span className="hadiths-cat-emoji" style={{ fontSize: '1.5rem' }}>{subcat.emoji}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                                    <span className="hadiths-cat-name" style={{ fontSize: '1rem' }}>{subcat.name}</span>
                                    <span className="hadiths-cat-nameAr">{subcat.nameAr}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="hadiths-cat-count" style={{ fontSize: '0.8rem' }}>{count}</span>
                                    <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // — Hadith List View —
    return (
        <div className="hadiths-page">
            <div className="hadiths-header">
                <button className="hadiths-back" onClick={() => {
                    if (selectedCat === 'bulugh' && selectedSubcat) {
                        setSelectedSubcat(null);
                    } else {
                        setSelectedCat(null);
                    }
                }}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="hadiths-title">
                    {selectedSubcat ? `${subcatInfo?.emoji} ${subcatInfo?.name}` : `${catInfo?.emoji} ${catInfo?.name}`}
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
    const [showCommentary, setShowCommentary] = useState(false);

    return (
        <div className="hadith-card">
            <div className="hadith-card__arabic" dir="rtl">{formatDivineNames(hadith.ar)}</div>
            <div className="hadith-card__french">{formatDivineNames(hadith.fr)}</div>
            <div className="hadith-card__meta">
                <span className="hadith-card__source">📕 {hadith.src}</span>
                <span className="hadith-card__narrator">🗣️ {hadith.nar}</span>
            </div>

            {hadith.commentaryFr && (
                <div className="hadith-card__commentary-section">
                    <button 
                        className="hadith-card__commentary-toggle"
                        onClick={(e) => { e.stopPropagation(); setShowCommentary(!showCommentary); }}
                    >
                        <span>{showCommentary ? t('hadiths.hideCommentary', 'Masquer le commentaire') : t('hadiths.showCommentary', 'Lire le commentaire')}</span>
                        {showCommentary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showCommentary && (
                        <div className="hadith-card__commentary-content">
                            {formatDivineNames(hadith.commentaryFr)}
                        </div>
                    )}
                </div>
            )}

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
