import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPage } from '../lib/quranApi';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { renderTajweedText } from '../lib/tajweedParser';
import type { Ayah } from '../types';
import './Mushaf3DPage.css';

export function Mushaf3DPage() {
    const navigate = useNavigate();
    const { currentPage, setCurrentPage, surahs } = useQuranStore();
    const { tajwidEnabled, tajwidLayers, arabicFontSize } = useSettingsStore();

    const [leftPage, setLeftPage] = useState<Ayah[]>([]);
    const [rightPage, setRightPage] = useState<Ayah[]>([]);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
    const [loading, setLoading] = useState(true);

    const bookRef = useRef<HTMLDivElement>(null);

    // Load pages (current and next)
    useEffect(() => {
        const loadPages = async () => {
            setLoading(true);
            try {
                // In Arabic books, right page is the "first" (odd), left is "second" (even)
                const rightPageNum = currentPage % 2 === 1 ? currentPage : currentPage - 1;
                const leftPageNum = rightPageNum + 1;

                const [rightAyahs, leftAyahs] = await Promise.all([
                    fetchPage(rightPageNum),
                    leftPageNum <= 604 ? fetchPage(leftPageNum) : Promise.resolve([])
                ]);

                setRightPage(rightAyahs);
                setLeftPage(leftAyahs);
            } catch (error) {
                console.error('Error loading pages:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPages();
    }, [currentPage]);

    const goToNextPage = () => {
        if (currentPage >= 603 || isFlipping) return;
        setFlipDirection('next');
        setIsFlipping(true);

        setTimeout(() => {
            setCurrentPage(currentPage + 2);
            setIsFlipping(false);
        }, 600);
    };

    const goToPrevPage = () => {
        if (currentPage <= 1 || isFlipping) return;
        setFlipDirection('prev');
        setIsFlipping(true);

        setTimeout(() => {
            setCurrentPage(currentPage - 2);
            setIsFlipping(false);
        }, 600);
    };

    const renderPageContent = (ayahs: Ayah[]) => {
        if (ayahs.length === 0) {
            return <div className="mushaf3d-empty">Fin du Coran</div>;
        }

        return (
            <div className="mushaf3d-text" dir="rtl">
                {ayahs.map((ayah) => (
                    <span key={ayah.number} className="mushaf3d-ayah">
                        {tajwidEnabled && tajwidLayers.length > 0
                            ? renderTajweedText(ayah.text, tajwidLayers)
                            : ayah.text
                        }
                        <span className="mushaf3d-ayah-num">۝{ayah.numberInSurah}</span>
                    </span>
                ))}
            </div>
        );
    };

    const getSurahName = (ayahs: Ayah[]) => {
        if (ayahs.length === 0) return '';
        const surahNum = ayahs[0].surah;
        const surah = surahs.find(s => s.number === surahNum);
        return surah?.name || `Sourate ${surahNum}`;
    };

    return (
        <div className="mushaf3d-container" data-arabic-size={arabicFontSize}>
            {/* Header */}
            <div className="mushaf3d-header">
                <button className="mushaf3d-header-btn" onClick={() => navigate('/read')}>
                    <X size={24} />
                </button>
                <span className="mushaf3d-title">Mode Livre</span>
                <button className="mushaf3d-header-btn" onClick={() => navigate('/')}>
                    <Home size={24} />
                </button>
            </div>

            {/* Book */}
            <div className="mushaf3d-book-wrapper">
                <div
                    ref={bookRef}
                    className={`mushaf3d-book ${isFlipping ? `flipping-${flipDirection}` : ''}`}
                >
                    {loading ? (
                        <div className="mushaf3d-loading">Chargement...</div>
                    ) : (
                        <>
                            {/* Left Page (Even) */}
                            <div className="mushaf3d-page mushaf3d-page-left">
                                <div className="mushaf3d-page-inner">
                                    <div className="mushaf3d-page-header">
                                        <span>{getSurahName(leftPage)}</span>
                                        <span>Page {(currentPage % 2 === 1 ? currentPage : currentPage - 1) + 1}</span>
                                    </div>
                                    {renderPageContent(leftPage)}
                                </div>
                            </div>

                            {/* Spine */}
                            <div className="mushaf3d-spine"></div>

                            {/* Right Page (Odd) */}
                            <div className="mushaf3d-page mushaf3d-page-right">
                                <div className="mushaf3d-page-inner">
                                    <div className="mushaf3d-page-header">
                                        <span>Page {currentPage % 2 === 1 ? currentPage : currentPage - 1}</span>
                                        <span>{getSurahName(rightPage)}</span>
                                    </div>
                                    {renderPageContent(rightPage)}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="mushaf3d-nav">
                <button
                    className="mushaf3d-nav-btn"
                    onClick={goToNextPage}
                    disabled={currentPage >= 603 || isFlipping}
                >
                    <ChevronRight size={32} />
                </button>
                <span className="mushaf3d-page-info">
                    {currentPage % 2 === 1 ? currentPage : currentPage - 1}-{Math.min((currentPage % 2 === 1 ? currentPage : currentPage - 1) + 1, 604)} / 604
                </span>
                <button
                    className="mushaf3d-nav-btn"
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1 || isFlipping}
                >
                    <ChevronLeft size={32} />
                </button>
            </div>
        </div>
    );
}
