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
import { fetchPage } from '../../lib/quranApi';
import type { Ayah } from '../../types';
import { useMushafAudio } from './hooks/useMushafAudio';
import { SideMenu } from '../Navigation/SideMenu';
import { MushafSearchOverlay } from './MushafSearchOverlay';
import { getJuzForPage } from '../../data/juzData';
import { SURAH_PAGE_STARTS } from './tajweedPageData';
import { fetchMadinahBoxes, type MadinahBox } from '../../lib/madinahService';
import { MadinahContextMenu } from './MadinahContextMenu';
import { useNavigate } from 'react-router-dom';
import './MadinahImagePage.css';

// Vector / High Quality image source for Madinah Mushaf
function getPageImageUrl(page: number): string {
    const fileNum = String(page).padStart(3, '0');
    // Using a reliable CDN for Madinah Mushaf pages
    return `https://surahquran.com/img/pages-quran/page${fileNum}.png`;
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

export function MadinahImagePage() {
    const { t } = useTranslation();
    const { currentPage, setCurrentPage, goToPage, goToSurah, goToAyah, surahs } = useQuranStore();
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
    const [showSearch, setShowSearch] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
    const [boxes, setBoxes] = useState<MadinahBox[]>([]);
    const [pageAyahs, setPageAyahs] = useState<Ayah[]>([]);
    const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
    const [contextMenuState, setContextMenuState] = useState<{ ayah: Ayah; x: number; y: number } | null>(null);
    const { selectedReciter } = useSettingsStore();
    const navigate = useNavigate();

    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    const audio = useMushafAudio({
        selectedReciter,
        pageAyahs,
        currentPage: page,
        nextPage: () => goToPage(page + 1),
        nextSurah: () => goToSurah(surahInfo.number + 1),
    });

    // Sync local page state with global currentPage when it changes from outside (e.g., search)
    useEffect(() => {
        if (currentPage && currentPage !== page) {
            setPage(currentPage);
        }
    }, [currentPage]);

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

        // Fetch interactive map and page ayahs
        fetchMadinahBoxes(page).then(setBoxes);
        fetchPage(page).then(setPageAyahs);
    }, [page]);

    // Show swipe hint on first visit
    useEffect(() => {
        if (isMobile && !sessionStorage.getItem('madinah-swipe-hint-shown')) {
            setShowSwipeHint(true);
            sessionStorage.setItem('madinah-swipe-hint-shown', '1');
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

        // Determine turning direction for 3D flip CSS animation
        if (newPage > page) setTurnDirection('next');
        else if (newPage < page) setTurnDirection('prev');
        else setTurnDirection(null);

        setPage(newPage);
        setImgLoading(true);
        setImgError(false);
        setCurrentPage(newPage);
    }, [page, setCurrentPage]);

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

    // Switch view mode
    const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = e.target.value as 'mushaf' | 'tajweed' | 'madinah';
        setViewMode(mode);
        if (mode === 'mushaf') {
            goToPage(page);
        }
    };

    return (
        <div className="madinah-page">
            {/* ===== Header ===== */}
            <div className="madinah-header">
                <div className="madinah-header__left">
                    <button className="madinah-header__icon-btn" onClick={() => setShowSideMenu(true)}>
                        <Menu size={20} />
                    </button>
                    <div className="madinah-header__info" onClick={() => setShowSearch(true)} style={{ cursor: 'pointer' }}>
                        <span className="madinah-header__surah">{surahInfo.name}</span>
                        <span className="madinah-header__meta">
                            {t('mushaf.page', 'Page')} {page} • {t('mushaf.juz', 'Juz')} {juzNumber}
                        </span>
                    </div>
                </div>

                <div className="madinah-header__center">
                    <KhatmTracker />
                </div>

                <div className="madinah-header__right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="view-mode-selector" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '4px 8px', border: '1px solid var(--border-color)' }}>
                        <BookOpen size={14} style={{ marginRight: '6px', color: 'var(--text-secondary)' }} />
                        <select
                            value="madinah"
                            onChange={handleViewModeChange}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer',
                                paddingRight: '4px'
                            }}
                        >
                            <option value="mushaf">{t('settings.textMode', 'Texte Interactif')}</option>
                            <option value="tajweed">Image (Tajweed)</option>
                            <option value="madinah">Madinah (Vectoriel)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ===== Progress Bar ===== */}
            <div className="madinah-progress">
                <div className="madinah-progress__bar" style={{ width: `${(page / 604) * 100}%` }} />
            </div>

            {/* ===== Image Viewer ===== */}
            <div
                className="madinah-viewer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Khatm validated badge */}
                {khatmActive && isPageValidated(page) && (
                    <div className="madinah-khatm-badge">
                        <CheckCircle2 size={14} />
                        {t('khatm.validated', 'Validée')}
                    </div>
                )}

                {imgLoading && (
                    <div className="madinah-viewer__loader">
                        <Loader2 size={32} className="animate-spin" />
                        <span>{t('mushaf.page', 'Page')} {page}</span>
                    </div>
                )}

                {imgError && (
                    <div className="madinah-viewer__error">
                        <p>{t('error.imageLoad', 'Impossible de charger l\'image')}</p>
                        <button onClick={() => { setImgError(false); setImgLoading(true); }}>
                            {t('common.retry', 'Réessayer')}
                        </button>
                    </div>
                )}

                <div className="madinah-image-wrapper" style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '1024px' }}>
                    <img
                        key={page}
                        src={getPageImageUrl(page)}
                        alt={`Mushaf Madinah - Page ${page}`}
                        className={`madinah-viewer__img ${imgLoading ? 'loading' : ''} ${turnDirection ? `madinah-turn-${turnDirection}` : ''}`}
                        onLoad={() => setImgLoading(false)}
                        onError={() => { setImgLoading(false); setImgError(true); }}
                        draggable={false}
                        style={{ width: '100%', height: 'auto', display: imgError ? 'none' : 'block' }}
                    />

                    {/* Bounding Boxes Layer */}
                    {!imgLoading && !imgError && boxes.map((box, idx) => {
                        const isPlaying = audio.currentPlayingAyah === box.ayah && audio.currentSurahRef.current === box.surah;
                        const isSelected = selectedVerse === box.verseKey || isPlaying;

                        return (
                            <div
                                key={`${box.verseKey}-${idx}`}
                                className={`madinah-box ${isSelected ? 'selected' : ''}`}
                                style={{
                                    position: 'absolute',
                                    top: `${box.top}%`,
                                    left: `${box.left}%`,
                                    width: `${box.width}%`,
                                    height: `${box.height}%`,
                                    transform: 'translateY(11%) scaleY(0.85) scaleX(0.90)',
                                    transformOrigin: 'top center',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    backgroundColor: isSelected ? 'rgba(200, 168, 76, 0.3)' : 'transparent',
                                    transition: 'background-color 0.2s ease',
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    const aIdx = pageAyahs.findIndex(a => a.surah === box.surah && a.numberInSurah === box.ayah);
                                    if (aIdx !== -1) {
                                        setContextMenuState({
                                            ayah: pageAyahs[aIdx],
                                            x: e.clientX,
                                            y: e.clientY
                                        });
                                    }
                                }}
                                onTouchStart={(e) => {
                                    longPressTriggered.current = false;
                                    const touch = e.touches[0];
                                    const x = touch.clientX;
                                    const y = touch.clientY;
                                    longPressTimerRef.current = setTimeout(() => {
                                        longPressTriggered.current = true;
                                        const aIdx = pageAyahs.findIndex(a => a.surah === box.surah && a.numberInSurah === box.ayah);
                                        if (aIdx !== -1) {
                                            setContextMenuState({
                                                ayah: pageAyahs[aIdx],
                                                x, y
                                            });
                                        }
                                    }, 500);
                                }}
                                onTouchEnd={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                onTouchMove={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                onClick={(e) => {
                                    if (longPressTriggered.current) {
                                        e.preventDefault();
                                        return;
                                    }
                                    setSelectedVerse(box.verseKey);
                                    // Find ayah index in pageAyahs to play it
                                    const aIdx = pageAyahs.findIndex(a => a.surah === box.surah && a.numberInSurah === box.ayah);
                                    if (aIdx !== -1) {
                                        if (audio.currentPlayingAyah === box.ayah && audio.audioPlaying) {
                                            audio.stopAudio();
                                        } else {
                                            audio.playAyahAtIndex(aIdx);
                                        }
                                    }
                                }}
                                title={`Verset ${box.surah}:${box.ayah}`}
                            />
                        );
                    })}
                </div>

                {/* Invisible Tap Zones for effortless navigation */}
                <div
                    className="madinah-tap-zone madinah-tap-zone--next"
                    onClick={nextPage}
                    title={t('mushaf.nextPage', 'Suivant')}
                />

                <div
                    className="madinah-tap-zone madinah-tap-zone--prev"
                    onClick={prevPage}
                    title={t('mushaf.prevPage', 'Précédent')}
                />

                {/* Swipe hint */}
                {showSwipeHint && (
                    <div className="madinah-swipe-hint">
                        ← {t('mushaf.swipeToNavigate', 'Glissez pour naviguer')} →
                    </div>
                )}
            </div>

            {/* ===== Bottom Navigation ===== */}
            <div className="madinah-nav">
                <button className="madinah-nav__btn" onClick={prevPage} disabled={page <= 1}>
                    <ChevronRight size={16} />
                    {t('mushaf.prevPage', 'Précédent')}
                </button>

                <div className="madinah-nav__page-input">
                    <input
                        type="number"
                        min={1}
                        max={604}
                        value={page}
                        onChange={handlePageInput}
                    />
                    <span>/ 604</span>
                </div>

                <button className="madinah-nav__btn" onClick={nextPage} disabled={page >= 604}>
                    {t('mushaf.nextPage', 'Suivant')}
                    <ChevronLeft size={16} />
                </button>
            </div>

            <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />

            {showSearch && (
                <MushafSearchOverlay
                    surahs={surahs}
                    currentPage={page}
                    goToSurah={(s) => {
                        goToSurah(s);
                        setShowSearch(false);
                    }}
                    goToPage={(p) => {
                        goToPage(p);
                        setShowSearch(false);
                    }}
                    goToAyah={(s, a) => {
                        goToAyah(s, a);
                        setShowSearch(false);
                    }}
                    onClose={() => setShowSearch(false)}
                />
            )}

            {contextMenuState && (
                <MadinahContextMenu
                    ayah={contextMenuState.ayah}
                    position={{ x: contextMenuState.x, y: contextMenuState.y }}
                    isPlaying={audio.currentPlayingAyah === contextMenuState.ayah.numberInSurah && audio.audioPlaying}
                    onClose={() => setContextMenuState(null)}
                    onPlay={() => {
                        const aIdx = pageAyahs.findIndex(a => a.number === contextMenuState.ayah.number);
                        if (aIdx !== -1) audio.playAyahAtIndex(aIdx);
                    }}
                    onTafsir={() => alert('Tafsir: Bientôt disponible.')}
                    onAsbab={() => alert('Asbab An-Nuzul: Bientôt disponible.')}
                    onHifdh={() => navigate(`/hifdh?surah=${contextMenuState.ayah.surah}&ayah=${contextMenuState.ayah.numberInSurah}`)}
                    onShare={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: 'Verset du Coran',
                                text: `${contextMenuState.ayah.text}\n\n[Sourate ${contextMenuState.ayah.surah}, Verset ${contextMenuState.ayah.numberInSurah}]`
                            }).catch(() => { });
                        } else {
                            navigator.clipboard.writeText(`${contextMenuState.ayah.text}\n\n[Sourate ${contextMenuState.ayah.surah}, Verset ${contextMenuState.ayah.numberInSurah}]`);
                            alert('Verset copié dans le presse-papier !');
                        }
                    }}
                    onCopy={() => {
                        navigator.clipboard.writeText(contextMenuState.ayah.text);
                        alert('Texte arabe copié !');
                    }}
                />
            )}
        </div>
    );
}
