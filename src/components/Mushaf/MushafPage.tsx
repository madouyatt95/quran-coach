import { useEffect, useState } from 'react';
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
        surahs,
        setSurahs,
        nextPage,
        prevPage,
        setPageAyahs,
        pageAyahs
    } = useQuranStore();

    const { arabicFontSize } = useSettingsStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                <button
                    className="page-nav__btn"
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft size={20} />
                    Précédent
                </button>

                <span className="page-nav__current">{currentPage} / 604</span>

                <button
                    className="page-nav__btn"
                    onClick={nextPage}
                    disabled={currentPage >= 604}
                >
                    Suivant
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
