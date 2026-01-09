import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Settings2 } from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { fetchPage, fetchSurahs, fetchAyah } from '../../lib/quranApi';
import { fetchTajweedPage, getTajweedCategories, type TajweedVerse } from '../../lib/tajweedService';
import { renderTajweedText } from '../../lib/tajweedParser';
import type { Ayah } from '../../types';
import './MushafPage.css';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

// Convert Western numbers to Arabic-Indic numerals
function toArabicNumbers(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

export function MushafPage() {
    const {
        currentPage,
        currentSurah,
        currentAyah,
        surahs,
        setSurahs,
        nextPage,
        prevPage,
        setPageAyahs,
        pageAyahs,
        goToSurah,
        goToAyah
    } = useQuranStore();

    const { arabicFontSize, tajwidLayers, toggleTajwidLayer } = useSettingsStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tajweedVerses, setTajweedVerses] = useState<TajweedVerse[]>([]);
    const [showTajweedPanel, setShowTajweedPanel] = useState(false);

    const tajweedCategories = useMemo(() => getTajweedCategories(), []);

    // Current surah info for ayah count
    const currentSurahInfo = useMemo(() =>
        surahs.find(s => s.number === currentSurah),
        [surahs, currentSurah]
    );

    // Get current page surah names
    const pageSurahNames = useMemo(() => {
        const surahNums = [...new Set(pageAyahs.map(a => a.surah))];
        return surahNums.map(num => surahs.find(s => s.number === num)?.name || '').filter(Boolean);
    }, [pageAyahs, surahs]);

    // Fetch surahs list on mount
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs()
                .then(setSurahs)
                .catch(() => {/* Surahs will be empty */ });
        }
    }, [surahs.length, setSurahs]);

    // Fetch page content and Tajweed
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetchPage(currentPage),
            fetchTajweedPage(currentPage)
        ])
            .then(([ayahs, tajweed]) => {
                setPageAyahs(ayahs);
                setTajweedVerses(tajweed);
                setIsLoading(false);
            })
            .catch(() => {
                setError('Impossible de charger la page. Vérifiez votre connexion.');
                setIsLoading(false);
            });
    }, [currentPage, setPageAyahs]);

    // Group ayahs by surah
    const groupedAyahs = pageAyahs.reduce((groups, ayah) => {
        const surahNum = ayah.surah;
        if (!groups[surahNum]) {
            groups[surahNum] = [];
        }
        groups[surahNum].push(ayah);
        return groups;
    }, {} as Record<number, Ayah[]>);

    const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const surahNum = parseInt(e.target.value);
        if (surahNum) goToSurah(surahNum);
    };

    const handleAyahChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const ayahNum = parseInt(e.target.value);
        if (ayahNum && currentSurah) {
            try {
                const ayahData = await fetchAyah(currentSurah, ayahNum);
                goToAyah(currentSurah, ayahNum, ayahData.page);
            } catch {
                goToAyah(currentSurah, ayahNum);
            }
        }
    };

    // Get Tajweed text for a verse
    const getTajweedText = (verseKey: string): string | null => {
        const verse = tajweedVerses.find(v => v.verseKey === verseKey);
        return verse?.textTajweed || null;
    };

    if (isLoading) {
        return (
            <div className="mushaf-page">
                <div className="mushaf-page__loading">
                    <Loader2 size={32} className="animate-spin" />
                    <p>تحميل...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mushaf-page">
                <div className="mushaf-page__error">
                    <p>{error}</p>
                    <button
                        className="mushaf-page__retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mushaf-page" data-arabic-size={arabicFontSize}>
            {/* Mushaf Frame Header */}
            <div className="mushaf-frame-header">
                <div className="mushaf-page-info">
                    <span className="mushaf-surah-name">{pageSurahNames.join(' - ')}</span>
                    <span className="mushaf-page-number">صفحة {toArabicNumbers(currentPage)}</span>
                </div>
                <button
                    className="mushaf-tajweed-toggle"
                    onClick={() => setShowTajweedPanel(!showTajweedPanel)}
                >
                    <Settings2 size={20} />
                </button>
            </div>

            {/* Tajweed Controls Panel */}
            {showTajweedPanel && (
                <div className="tajweed-panel">
                    <div className="tajweed-panel-title">التجويد</div>
                    <div className="tajweed-controls">
                        {tajweedCategories.map(cat => (
                            <button
                                key={cat.id}
                                className={`tajweed-control ${tajwidLayers.includes(cat.id) ? 'active' : ''}`}
                                onClick={() => toggleTajwidLayer(cat.id)}
                            >
                                <span
                                    className="tajweed-color-dot"
                                    style={{ backgroundColor: tajwidLayers.includes(cat.id) ? cat.color : '#555' }}
                                />
                                <span className="tajweed-label">{cat.nameArabic}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Mushaf Content Frame */}
            <div className="mushaf-frame">
                <div className="mushaf-frame-corner mushaf-frame-corner--tl" />
                <div className="mushaf-frame-corner mushaf-frame-corner--tr" />
                <div className="mushaf-frame-corner mushaf-frame-corner--bl" />
                <div className="mushaf-frame-corner mushaf-frame-corner--br" />

                <div className="mushaf-content">
                    {Object.entries(groupedAyahs).map(([surahNum, ayahs]) => {
                        const surahNumber = parseInt(surahNum);
                        const surah = surahs.find(s => s.number === surahNumber);
                        const isStartOfSurah = ayahs[0]?.numberInSurah === 1;
                        const showBismillah = isStartOfSurah && surahNumber !== 1 && surahNumber !== 9;

                        return (
                            <div key={surahNum} className="mushaf-surah-section">
                                {isStartOfSurah && surah && (
                                    <div className="mushaf-surah-header">
                                        <div className="mushaf-surah-header-frame">
                                            <span className="mushaf-surah-title">{surah.name}</span>
                                        </div>
                                    </div>
                                )}

                                {showBismillah && (
                                    <div className="mushaf-bismillah">{BISMILLAH}</div>
                                )}

                                <div className="mushaf-ayahs">
                                    {ayahs.map((ayah) => {
                                        const verseKey = `${ayah.surah}:${ayah.numberInSurah}`;
                                        const tajweedHtml = getTajweedText(verseKey);

                                        return (
                                            <span key={ayah.number} className="mushaf-ayah">
                                                {tajweedHtml ? (
                                                    <>
                                                        {renderTajweedText(tajweedHtml, tajwidLayers)}
                                                        <span className="mushaf-verse-number">
                                                            ﴿{toArabicNumbers(ayah.numberInSurah)}﴾
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {ayah.text}
                                                        <span className="mushaf-verse-number">
                                                            ﴿{toArabicNumbers(ayah.numberInSurah)}﴾
                                                        </span>
                                                    </>
                                                )}
                                                {' '}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Page Navigation */}
            <div className="mushaf-nav">
                <div className="mushaf-nav-selectors">
                    <select
                        className="mushaf-nav-dropdown"
                        value={currentSurah}
                        onChange={handleSurahChange}
                    >
                        {surahs.map((s) => (
                            <option key={s.number} value={s.number}>
                                {s.number}. {s.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="mushaf-nav-dropdown mushaf-nav-dropdown--ayah"
                        value={currentAyah}
                        onChange={handleAyahChange}
                    >
                        {currentSurahInfo && Array.from(
                            { length: currentSurahInfo.numberOfAyahs },
                            (_, i) => i + 1
                        ).map((ayahNum) => (
                            <option key={ayahNum} value={ayahNum}>
                                آية {toArabicNumbers(ayahNum)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mushaf-nav-buttons">
                    <button
                        className="mushaf-nav-btn"
                        onClick={nextPage}
                        disabled={currentPage >= 604}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <span className="mushaf-nav-current">{toArabicNumbers(currentPage)}</span>

                    <button
                        className="mushaf-nav-btn"
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
