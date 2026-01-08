import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { fetchPage, fetchSurahs } from '../../lib/quranApi';
import { AyahDisplay } from './AyahDisplay';
import type { Ayah } from '../../types';
import './MushafPage.css';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

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

    const { arabicFontSize } = useSettingsStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Current surah info for ayah count
    const currentSurahInfo = useMemo(() =>
        surahs.find(s => s.number === currentSurah),
        [surahs, currentSurah]
    );

    // Fetch surahs list on mount
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs()
                .then(setSurahs)
                .catch(() => {/* Surahs will be empty */ });
        }
    }, [surahs.length, setSurahs]);

    // Fetch page content
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        fetchPage(currentPage)
            .then((ayahs) => {
                setPageAyahs(ayahs);
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

    const handleAyahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const ayahNum = parseInt(e.target.value);
        if (ayahNum && currentSurah) {
            goToAyah(currentSurah, ayahNum);
        }
    };

    if (isLoading) {
        return (
            <div className="mushaf-page">
                <div className="mushaf-page__loading">
                    <Loader2 size={32} className="animate-pulse" />
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
            <div className="mushaf-page__content">
                {Object.entries(groupedAyahs).map(([surahNum, ayahs]) => {
                    const surahNumber = parseInt(surahNum);
                    const surah = surahs.find(s => s.number === surahNumber);
                    const isStartOfSurah = ayahs[0]?.numberInSurah === 1;
                    const showBismillah = isStartOfSurah && surahNumber !== 1 && surahNumber !== 9;

                    return (
                        <div key={surahNum}>
                            {isStartOfSurah && surah && (
                                <div className="surah-header">
                                    <span className="surah-header__name">{surah.name}</span>
                                    <span className="surah-header__info">
                                        {surah.englishName} • {surah.numberOfAyahs} versets
                                    </span>
                                </div>
                            )}

                            {showBismillah && (
                                <div className="bismillah">{BISMILLAH}</div>
                            )}

                            <div className="arabic">
                                {ayahs.map((ayah) => (
                                    <AyahDisplay key={ayah.number} ayah={ayah} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="page-nav">
                <div className="page-nav__selectors">
                    <select
                        className="page-nav__dropdown"
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
                        className="page-nav__dropdown page-nav__dropdown--ayah"
                        value={currentAyah}
                        onChange={handleAyahChange}
                    >
                        {currentSurahInfo && Array.from(
                            { length: currentSurahInfo.numberOfAyahs },
                            (_, i) => i + 1
                        ).map((ayahNum) => (
                            <option key={ayahNum} value={ayahNum}>
                                Verset {ayahNum}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="page-nav__buttons">
                    <button
                        className="page-nav__btn"
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="page-nav__current">{currentPage}</span>

                    <button
                        className="page-nav__btn"
                        onClick={nextPage}
                        disabled={currentPage >= 604}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
