import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Menu,
    BookOpen,
    CheckCircle2,
} from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useKhatmStore } from '../../stores/khatmStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';
import { KhatmTracker } from '../Khatm/KhatmTracker';
import { SideMenu } from '../Navigation/SideMenu';
import { getJuzForPage } from '../../data/juzData';
import { SURAH_PAGE_STARTS } from './tajweedPageData';
import './TajweedImagePage.css';

// CDN source for Quran pages (color-coded Tajweed Mushaf)
function getPageImageUrl(page: number): string {
    const padded = String(page).padStart(3, '0');
    return `https://sufraat.com/quran-images/color/${padded}.png`;
}

// Determine which surah a page belongs to
function getSurahForPage(page: number): { number: number; name: string } {
    let surah = { number: 1, name: 'الفاتحة' };
    for (const entry of SURAH_PAGE_STARTS) {
        if (page >= entry.page) {
            surah = { number: entry.surah, name: entry.name };
        } else {
            break;
        }
    }
    return surah;
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function TajweedImagePage() {
    const { t } = useTranslation();
    const { currentPage, setCurrentPage, goToPage } = useQuranStore();
    const {
        isActive: khatmActive,
        isPageValidated,
        togglePage: khatmTogglePage,
        updateLastRead: khatmUpdateLastRead,
    } = useKhatmStore();
    const lastKhatmPage = useKhatmStore(state => state.lastKhatmPage);
    const { setViewMode } = useSettingsStore();

    const [page, setPage] = useState(currentPage || 1);
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(false);

    // Touch swipe state
    const touchStartX = useRef(0);
    const touchDeltaX = useRef(0);

    // Surah and Juz info for current page
    const surahInfo = getSurahForPage(page);
    const juzInfo = getJuzForPage(page);
    const juzNumber = juzInfo?.number ?? 1;

    // Preload adjacent pages
    useEffect(() => {
        if (page > 1) {
            const prev = new Image();
            prev.src = getPageImageUrl(page - 1);
        }
        if (page < 604) {
            const next = new Image();
            next.src = getPageImageUrl(page + 1);
        }
    }, [page]);

    // Show swipe hint on first visit
    useEffect(() => {
        if (isMobile && !sessionStorage.getItem('tajweed-swipe-hint-shown')) {
            setShowSwipeHint(true);
            sessionStorage.setItem('tajweed-swipe-hint-shown', '1');
        }
    }, []);

    // ===== KHATM INTEGRATION (same logic as MushafPage) =====
    // Update Khatm reading position
    useEffect(() => {
        if (!khatmActive) return;
        // updateLastRead needs surah + ayah + page; for image mode we use page's first surah + ayah=1
        khatmUpdateLastRead(surahInfo.number, 1, page);
    }, [page, khatmActive]);

    // Auto-validate page (sequential ±1 only, same as MushafPage)
    useEffect(() => {
        if (!khatmActive || isPageValidated(page)) return;
        const pageDiff = Math.abs(page - lastKhatmPage);
        if (pageDiff > 1) return;
        console.log(`[Khatm-Tajweed] Auto-validating page ${page}`);
        khatmTogglePage(page);
    }, [page, khatmActive, isPageValidated, lastKhatmPage]);

    // ===== NAVIGATION =====
    const goTo = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > 604) return;
        setPage(newPage);
        setImgLoading(true);
        setImgError(false);
        setCurrentPage(newPage);
    }, [setCurrentPage]);

    const prevPage = useCallback(() => goTo(page - 1), [page, goTo]);
    const nextPage = useCallback(() => goTo(page + 1), [page, goTo]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') nextPage();
            else if (e.key === 'ArrowRight') prevPage();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [nextPage, prevPage]);

    // Touch swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchDeltaX.current = 0;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    };
    const handleTouchEnd = () => {
        // Arabic: swipe left = next page, swipe right = prev page
        if (touchDeltaX.current < -60) nextPage();
        else if (touchDeltaX.current > 60) prevPage();
        touchDeltaX.current = 0;
    };

    // Page input handler
    const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 604) {
            goTo(val);
        }
    };

    // Switch back to Mushaf text mode
    const switchToMushaf = () => {
        setViewMode('mushaf');
        goToPage(page);
    };

    return (
        <div className="tajweed-page">
            {/* ===== Header ===== */}
            <div className="tajweed-header">
                <div className="tajweed-header__left">
                    <button className="tajweed-header__icon-btn" onClick={() => setShowSideMenu(true)}>
                        <Menu size={20} />
                    </button>
                    <div className="tajweed-header__info">
                        <span className="tajweed-header__surah">{surahInfo.name}</span>
                        <span className="tajweed-header__meta">
                            {t('mushaf.page', 'Page')} {page} • {t('mushaf.juz', 'Juz')} {juzNumber}
                        </span>
                    </div>
                </div>

                <div className="tajweed-header__center">
                    <KhatmTracker />
                </div>

                <div className="tajweed-header__right">
                    <button
                        className="tajweed-mode-toggle"
                        onClick={switchToMushaf}
                        title={t('settings.viewModeMushaf', 'Mode Mushaf interactif')}
                    >
                        <BookOpen size={14} />
                        <span>{t('settings.textMode', 'Texte')}</span>
                    </button>
                </div>
            </div>

            {/* ===== Progress Bar ===== */}
            <div className="tajweed-progress">
                <div className="tajweed-progress__bar" style={{ width: `${(page / 604) * 100}%` }} />
            </div>

            {/* ===== Image Viewer ===== */}
            <div
                className="tajweed-viewer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Khatm validated badge */}
                {khatmActive && isPageValidated(page) && (
                    <div className="tajweed-khatm-badge">
                        <CheckCircle2 size={14} />
                        {t('khatm.validated', 'Validée')}
                    </div>
                )}

                {imgLoading && (
                    <div className="tajweed-viewer__loader">
                        <Loader2 size={32} className="animate-spin" />
                        <span>{t('mushaf.page', 'Page')} {page}</span>
                    </div>
                )}

                {imgError && (
                    <div className="tajweed-viewer__error">
                        <p>{t('error.imageLoad', 'Impossible de charger l\'image')}</p>
                        <button onClick={() => { setImgError(false); setImgLoading(true); }}>
                            {t('common.retry', 'Réessayer')}
                        </button>
                    </div>
                )}

                <img
                    key={page}
                    src={getPageImageUrl(page)}
                    alt={`Mushaf Tajweed - Page ${page}`}
                    className={`tajweed-viewer__img ${imgLoading ? 'loading' : ''}`}
                    onLoad={() => setImgLoading(false)}
                    onError={() => { setImgLoading(false); setImgError(true); }}
                    draggable={false}
                    style={imgError ? { display: 'none' } : undefined}
                />

                {/* Float navigation (desktop) */}
                {!isMobile && (
                    <>
                        <button
                            className="tajweed-float-nav tajweed-float-nav--left"
                            onClick={prevPage}
                            disabled={page <= 1}
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            className="tajweed-float-nav tajweed-float-nav--right"
                            onClick={nextPage}
                            disabled={page >= 604}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </>
                )}

                {/* Swipe hint */}
                {showSwipeHint && (
                    <div className="tajweed-swipe-hint">
                        ← {t('mushaf.swipeToNavigate', 'Glissez pour naviguer')} →
                    </div>
                )}
            </div>

            {/* ===== Bottom Navigation ===== */}
            <div className="tajweed-nav">
                <button className="tajweed-nav__btn" onClick={prevPage} disabled={page <= 1}>
                    <ChevronRight size={16} />
                    {t('mushaf.prevPage', 'Précédent')}
                </button>

                <div className="tajweed-nav__page-input">
                    <input
                        type="number"
                        min={1}
                        max={604}
                        value={page}
                        onChange={handlePageInput}
                    />
                    <span>/ 604</span>
                </div>

                <button className="tajweed-nav__btn" onClick={nextPage} disabled={page >= 604}>
                    {t('mushaf.nextPage', 'Suivant')}
                    <ChevronLeft size={16} />
                </button>
            </div>

            <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
        </div>
    );
}
