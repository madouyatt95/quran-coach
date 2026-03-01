import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import {
    Settings,
    Menu,
    Loader2,
    SkipBack,
    SkipForward,
    Play,
    Pause,
    X,
    ChevronLeft,
    ChevronRight,
    Heart,
} from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useKhatmStore } from '../../stores/khatmStore';
import { useTranslation } from 'react-i18next';
import { fetchSurah, fetchSurahTranslation, fetchSurahTransliteration, fetchSurahs } from '../../lib/quranApi';
import { fetchWordTimings, type VerseWords } from '../../lib/wordTimings';
import { formatDivineNames } from '../../lib/divineNames';
// import { fetchTajweedPage } from '../../lib/tajweedService'; // Optional, might need surah version later
import { SideMenu } from '../Navigation/SideMenu';
import { KhatmTracker, KhatmPageBadge } from '../Khatm/KhatmTracker';
import { useFavoritesStore } from '../../stores/favoritesStore';
import type { Ayah } from '../../types';

// Sub-components & hooks
import { useMushafAudio } from './hooks/useMushafAudio';

import { useMushafNavigation } from './hooks/useMushafNavigation';
import { MushafToolbar } from './MushafToolbar';
import { MushafSearchOverlay } from './MushafSearchOverlay';
import { MushafShareModal } from './MushafShareModal';

import { BISMILLAH, isMobile, toArabicNumbers, toVerseGlyph, getJuzNumber, SURAH_NAMES_FR } from './mushafConstants';
import type { MaskMode } from './mushafConstants';
import './MushafPage.css';

export function MushafPage() {
    const { t } = useTranslation();
    const {
        currentPage, surahs, setSurahs,
        setCurrentPage, setCurrentAyah,
        currentSurah, currentAyah,
        setSurahAyahs, currentSurahAyahs,
        goToSurah, goToPage, goToAyah,
        nextSurah, updateProgress,
        jumpSignal,
    } = useQuranStore();

    const {
        arabicFontSize, tajwidLayers, toggleTajwidLayer,
        selectedReciter, tajwidEnabled, toggleTajwid,
        setArabicFontSize, showTranslation, toggleTranslation,
        showTransliteration, toggleTransliteration,
        arabicFontFamily, setArabicFontFamily,
    } = useSettingsStore();

    const { toggleFavorite, isFavorite } = useFavoritesStore();
    const { isActive: khatmActive, isPageValidated, togglePage: khatmTogglePage, updateLastRead: khatmUpdateLastRead } = useKhatmStore();
    // isExploring is used by quranStore for general reading progress, not needed for Khatm

    // ===== Local state =====
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [translationMap, setTranslationMap] = useState<Map<number, string>>(new Map());
    const [transliterationMap, setTransliterationMap] = useState<Map<number, string>>(new Map());

    // Progressive Rendering
    const [renderedCount, setRenderedCount] = useState(20);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);
    const isSilentJumpRef = useRef(false);

    // Diagnostic version log
    useEffect(() => {
        console.log('[Quran Coach] v1.3.0 - Natural Khatm Logic Active');
    }, []);

    // Immediate Khatm Reading Position Update
    // Note: updateLastRead has its own page ±1 sequential check, so no need for isExploring guard
    useEffect(() => {
        if (!khatmActive) return;

        // Update Khatm position — updateLastRead rejects non-sequential jumps
        khatmUpdateLastRead(currentSurah, currentAyah, currentPage);
    }, [currentPage, currentSurah, currentAyah, khatmActive]);

    // Immediate Khatm Page Validation (Sequential reading only)
    const lastKhatmPage = useKhatmStore(state => state.lastKhatmPage);
    useEffect(() => {
        if (!khatmActive || isPageValidated(currentPage)) return;

        // Only auto-validate if reading sequentially (same page or ±1)
        const pageDiff = Math.abs(currentPage - lastKhatmPage);
        if (pageDiff > 1) return;

        console.log(`[Khatm] Auto-validating page ${currentPage}`);
        khatmTogglePage(currentPage);
    }, [currentPage, khatmActive, isPageValidated, lastKhatmPage]);

    // Panels
    const [showTajweedSheet, setShowTajweedSheet] = useState(false);
    const [showMaskSheet, setShowMaskSheet] = useState(false);
    const [showFontSheet, setShowFontSheet] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);

    // Share
    const [shareAyah, setShareAyah] = useState<Ayah | null>(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    // Masking
    const [maskMode, setMaskMode] = useState<MaskMode>('visible');
    const [partialHidden, setPartialHidden] = useState<Set<string>>(new Set());



    // ===== Hooks =====
    const audio = useMushafAudio({
        selectedReciter,
        pageAyahs: currentSurahAyahs,
        currentPage,
        nextPage: () => goToPage(currentPage + 1),
        nextSurah,
    });



    const navigation = useMushafNavigation({
        currentPage,
        nextPage: () => goToPage(currentPage + 1),
        prevPage: () => goToPage(currentPage - 1),
    });

    const juzNumber = useMemo(() => currentSurahAyahs.length > 0 ? getJuzNumber(currentSurahAyahs) : 1, [currentSurahAyahs]);

    const currentSurahRef = useRef(currentSurah);
    useEffect(() => { currentSurahRef.current = currentSurah; }, [currentSurah]);

    // Track visible ayah/page for Header sync
    useEffect(() => {
        const container = document.querySelector('.mih-mushaf');
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target as HTMLElement;
                        const pageNum = parseInt(target.getAttribute('data-page') || '1');
                        const ayahNum = parseInt(target.getAttribute('data-ayah') || '1');

                        const elementSurah = parseInt(target.getAttribute('data-surah') || '0');

                        // CRITICAL: Only process elements that belong to THE LATEST current surah.
                        // We use currentSurahRef.current because the currentSurah closure value
                        // might be stale during a transition (e.g. going Mulk -> Baqarah).
                        if (elementSurah !== currentSurahRef.current) {
                            return;
                        }

                        // Update store only if changed to avoid loops
                        if (pageNum !== currentPage || ayahNum !== currentAyah) {
                            // Only update store/bookmark if we are NOT in a silent jump
                            const isSilent = isSilentJumpRef.current || !!sessionStorage.getItem('isSilentJump');

                            if (!isSilent) {
                                setCurrentPage(pageNum);
                                setCurrentAyah(ayahNum);

                                // Always update general reading progress (independent from Khatm)
                                updateProgress();
                            }
                        }
                    }
                });
            },
            { root: container, threshold: 0.1 }
        );

        const updateObservedElements = () => {
            document.querySelectorAll('.mih-ayah').forEach(el => observer.observe(el));
        };

        const timeout = setTimeout(updateObservedElements, 1000);
        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [currentSurah, currentSurahAyahs, currentPage, currentAyah, setCurrentPage, setCurrentAyah, updateProgress]);

    // Infinite rendering trigger
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && renderedCount < currentSurahAyahs.length) {
                    setRenderedCount(prev => Math.min(prev + 20, currentSurahAyahs.length));
                }
            },
            { threshold: 0.1 }
        );

        if (observerTargetRef.current) observer.observe(observerTargetRef.current);
        return () => observer.disconnect();
    }, [renderedCount, currentSurahAyahs.length]);

    // ===== Fetch logic =====
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs).catch(() => { });
        }
    }, [surahs.length, setSurahs]);

    const scrollToVerse = useCallback((surah: number, ayah: number) => {
        let attempts = 0;
        const tryScroll = () => {
            const el = document.querySelector(`[data-surah="${surah}"][data-ayah="${ayah}"]`);
            if (el) {
                console.log(`[Mushaf] Found scroll target S${surah}:A${ayah}, scrolling...`);
                // Use 'auto' behavior for jumps to be more resilient than 'smooth'
                el.scrollIntoView({ behavior: 'auto', block: 'center' });
                el.classList.add('highlighted-from-shazam');
                setTimeout(() => el.classList.remove('highlighted-from-shazam'), 3000);
            } else if (attempts < 40) {
                attempts++;
                setTimeout(tryScroll, 100);
            } else {
                console.warn(`[Mushaf] Scroll target S${surah}:A${ayah} not found after 40 attempts`);
            }
        };
        setTimeout(tryScroll, 50);
    }, []);

    const scrollToPageStart = useCallback((page: number) => {
        let attempts = 0;
        const tryScroll = () => {
            const el = document.querySelector(`[data-page="${page}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'start' });
            } else if (attempts < 30) {
                attempts++;
                setTimeout(tryScroll, 100);
            }
        };
        setTimeout(tryScroll, 50);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setRenderedCount(20); // Reset progressive render

        Promise.all([
            fetchSurah(currentSurah),
            showTranslation ? fetchSurahTranslation(currentSurah) : Promise.resolve(new Map<number, string>()),
            showTransliteration ? fetchSurahTransliteration(currentSurah) : Promise.resolve(new Map<number, string>())
        ]).then(async ([surahData, translations, transliterations]) => {
            const { ayahs } = surahData;
            setSurahAyahs(ayahs);
            audio.pageAyahsRef.current = ayahs;
            setTranslationMap(translations);
            setTransliterationMap(transliterations);
            setIsLoading(false);

            // Fetch word timings (limited to visible range or first 50 for start)
            const wordsMap = new Map<string, VerseWords>();
            const initialTimingAyahs = ayahs.slice(0, 50);
            await Promise.all(initialTimingAyahs.map(async (a) => {
                const vw = await fetchWordTimings(a.surah, a.numberInSurah);
                if (vw) wordsMap.set(`${a.surah}:${a.numberInSurah}`, vw);
            }));
            audio.setVerseWordsMap(wordsMap);

            if (maskMode === 'partial') generatePartialMask(ayahs);

            // Handle pending jumps that were waiting for surah data
            const ayahScroll = sessionStorage.getItem('scrollToAyah');
            const pageScroll = sessionStorage.getItem('scrollToPage');
            if (ayahScroll || pageScroll) {
                if (ayahScroll) {
                    try {
                        const { surah, ayah } = JSON.parse(ayahScroll);
                        const idx = ayahs.findIndex(a => a.surah === surah && a.numberInSurah === ayah);
                        if (idx !== -1) {
                            setRenderedCount(Math.max(20, idx + 10));
                            // Trigger scroll now that we have data and updated count
                            setTimeout(() => scrollToVerse(surah, ayah), 100);
                        }
                    } catch (e) { /* ignore */ }
                } else if (pageScroll) {
                    const p = parseInt(pageScroll);
                    const idx = ayahs.findIndex(a => a.page === p);
                    if (idx !== -1) {
                        setRenderedCount(Math.max(20, idx + 10));
                        setTimeout(() => scrollToPageStart(p), 100);
                    }
                }
                // Clear scroll items after processing — they've served their purpose
                sessionStorage.removeItem('scrollToAyah');
                sessionStorage.removeItem('scrollToPage');
            }

        }).catch(() => {
            setError(t('error.fetchSurah', 'Impossible de charger la sourate. Vérifiez votre connexion.'));
            setIsLoading(false);
        });
    }, [currentSurah, showTranslation, showTransliteration]);

    // Dedicated Jump Handling Effect - react to signal even if surah stays the same
    useEffect(() => {
        if (jumpSignal === 0) return;

        const isSilentJump = sessionStorage.getItem('isSilentJump');
        const pageScroll = sessionStorage.getItem('scrollToPage');
        const ayahScroll = sessionStorage.getItem('scrollToAyah');

        if (isSilentJump || pageScroll || ayahScroll) {
            isSilentJumpRef.current = true;

            if (ayahScroll) {
                try {
                    const { surah, ayah } = JSON.parse(ayahScroll);
                    // Ensure renderedCount is large enough for existing data
                    const idx = currentSurahAyahs.findIndex(a => a.surah === surah && a.numberInSurah === ayah);
                    if (idx !== -1) setRenderedCount(Math.max(renderedCount, idx + 10));

                    scrollToVerse(surah, ayah);
                } catch (e) { console.error('Verse jump parse failed', e); }
            } else if (pageScroll) {
                const p = parseInt(pageScroll);
                // Ensure renderedCount is large enough
                const idx = currentSurahAyahs.findIndex(a => a.page === p);
                if (idx !== -1) setRenderedCount(Math.max(renderedCount, idx + 10));

                if (p > 0) scrollToPageStart(p);
                else window.scrollTo({ top: 0, behavior: 'auto' });
            }

            // Clear only the observer-blocking flag after a shorter delay
            // to ensure automatic scrolling has fully stabilized without blocking progress.
            setTimeout(() => {
                isSilentJumpRef.current = false;
                sessionStorage.removeItem('isSilentJump');
            }, 800);
        }
    }, [jumpSignal, scrollToVerse, scrollToPageStart, currentSurahAyahs]);

    // Regenerate partial mask when mode changes
    useEffect(() => {
        if (maskMode === 'partial') generatePartialMask(currentSurahAyahs);
    }, [maskMode, currentSurahAyahs]);

    const generatePartialMask = useCallback((ayahs: Ayah[]) => {
        const hidden = new Set<string>();
        ayahs.forEach((ayah, ayahIndex) => {
            const words = ayah.text.split(/\s+/).filter(w => w.length > 0);
            words.forEach((_, wordIndex) => {
                if (Math.random() > 0.5) hidden.add(`${ayahIndex}-${wordIndex}`);
            });
        });
        setPartialHidden(hidden);
    }, []);



    // Word class helper (mask + active)
    const getWordClass = (ayahIndex: number, wordIndex: number, ayahNumber: number): string => {
        const key = `${ayahIndex}-${wordIndex}`;
        const isActive = audio.currentPlayingAyah === ayahNumber && audio.activeWordIndex === wordIndex;

        let classes = 'mih-word';
        if (isActive) classes += ' mih-word--active';

        switch (maskMode) {
            case 'hidden': return classes + ' mih-word--hidden';
            case 'partial': return partialHidden.has(key) ? classes + ' mih-word--hidden' : classes;
            case 'minimal': return classes + ' mih-word--partial';
            default: return classes;
        }
    };

    const groupedAyahs = useMemo(() => {
        const limitedAyahs = currentSurahAyahs.slice(0, renderedCount);
        return limitedAyahs.reduce((groups, ayah) => {
            const surahNum = ayah.surah;
            if (!groups[surahNum]) groups[surahNum] = [];
            groups[surahNum].push(ayah);
            return groups;
        }, {} as Record<number, Ayah[]>);
    }, [currentSurahAyahs, renderedCount]);

    const getAyahIndex = (ayah: Ayah) => currentSurahAyahs.findIndex(a => a.number === ayah.number);

    // ===== RENDER =====
    if (isLoading) {
        return (
            <div className="mushaf-page">
                <div className="mih-loading">
                    <Loader2 size={32} className="animate-spin" />
                    <p>{t('common.loading', 'تحميل...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mushaf-page">
                <div className="mih-error">
                    <p>{error}</p>
                    <button className="mih-error__btn" onClick={() => window.location.reload()}>
                        {t('common.retry', 'Réessayer')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`mushaf-page ${isMobile ? 'is-mobile' : ''}`} data-arabic-size={arabicFontSize}>
            {/* ===== Compact Header ===== */}
            <div className="mih-header">
                <div className="mih-header-left">
                    <button onClick={() => setShowSideMenu(true)} className="mih-header__icon-btn">
                        <Menu size={20} />
                    </button>
                    <div className="mih-header__info" onClick={() => setShowSearch(true)}>
                        <div className="mih-header__surah-name">
                            {SURAH_NAMES_FR[currentSurah]}
                        </div>
                        <div className="mih-header__page-num">
                            {t('mushaf.page', 'Page')} {toArabicNumbers(currentPage)} • {t('mushaf.juz', 'Juz')} {juzNumber}
                        </div>
                    </div>
                </div>

                {/* Header Audio Player */}
                {audio.audioActive && (
                    <div className="mih-header-player">
                        <button className="mih-header-player__btn" onClick={audio.playPrevAyah} disabled={audio.playingIndex <= 0}>
                            <SkipBack size={16} />
                        </button>
                        <button className="mih-header-player__play-btn" onClick={audio.toggleAudio}>
                            {audio.audioPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button className="mih-header-player__btn" onClick={audio.playNextAyah} disabled={audio.playingIndex >= currentSurahAyahs.length - 1}>
                            <SkipForward size={16} />
                        </button>
                        <div className="mih-header-player__divider" />
                        <div className="mih-header-player__speed" onClick={() => audio.setPlaybackSpeed((s: number) => s >= 2 ? 0.5 : s + 0.25)}>
                            {audio.playbackSpeed}x
                        </div>
                        <button className="mih-header-player__stop" onClick={audio.stopAudio}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Center: Khatm Tracker (Compact) */}
                <div className="mih-header-center">
                    <KhatmTracker />
                    <button
                        onClick={() => useSettingsStore.getState().setViewMode('tajweed')}
                        style={{
                            marginLeft: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                        }}
                        title={t('settings.viewModeTajweed', 'Mode Image Tajweed')}
                    >
                        <img src="/images/tajweed-btn.png" alt="Tajweed" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover', display: 'block', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                </div>

                <div className="mih-header-right">
                    <MushafToolbar
                        showToolbar={showToolbar}
                        isMobile={isMobile}
                        showTajweedSheet={showTajweedSheet}
                        setShowTajweedSheet={setShowTajweedSheet}
                        tajwidEnabled={tajwidEnabled}
                        toggleTajwid={toggleTajwid}
                        tajwidLayers={tajwidLayers}
                        toggleTajwidLayer={toggleTajwidLayer}
                        showTranslation={showTranslation}
                        toggleTranslation={toggleTranslation}
                        showTransliteration={showTransliteration}
                        toggleTransliteration={toggleTransliteration}
                        showFontSheet={showFontSheet}
                        setShowFontSheet={setShowFontSheet}
                        arabicFontSize={arabicFontSize}
                        setArabicFontSize={setArabicFontSize}
                        arabicFontFamily={arabicFontFamily}
                        setArabicFontFamily={setArabicFontFamily}
                        showMaskSheet={showMaskSheet}
                        setShowMaskSheet={setShowMaskSheet}
                        maskMode={maskMode}
                        setMaskMode={setMaskMode}

                    />
                    <button
                        className={`mih-toolbar__btn ${showToolbar ? 'active' : ''}`}
                        style={{ marginLeft: 4 }}
                        onClick={() => setShowToolbar(!showToolbar)}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <KhatmPageBadge currentPage={currentPage} />

            {/* Floating Navigation (desktop) */}
            {!isMobile && (
                <>
                    <button className="mih-float-nav mih-float-nav--left" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                        <ChevronRight size={24} />
                    </button>
                    <button className="mih-float-nav mih-float-nav--right" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604}>
                        <ChevronLeft size={24} />
                    </button>
                </>
            )}

            {/* ===== Mushaf Content ===== */}
            <div
                className="mih-mushaf"
                ref={navigation.containerRef}
                onTouchStart={navigation.handleTouchStart}
                onTouchMove={navigation.handleTouchMove}
                onTouchEnd={navigation.handleTouchEnd}
            >
                {/* Pull indicator */}
                {navigation.pullIndicator.visible && (
                    <div className={`mih-pull-indicator mih-pull-indicator--${navigation.pullIndicator.direction}`}>
                        <div
                            className="mih-pull-indicator__bar"
                            style={{ transform: `scaleX(${navigation.pullIndicator.progress})` }}
                        />
                        <span className="mih-pull-indicator__text">
                            {navigation.pullIndicator.progress >= 1
                                ? (navigation.pullIndicator.direction === 'up' ? `← ${t('mushaf.prevPage', 'Page précédente')}` : `${t('mushaf.nextPage', 'Page suivante')} →`)
                                : t('mushaf.pullToChange', 'Tirez pour changer de page')
                            }
                        </span>
                    </div>
                )}
                <div className={`mih-mushaf__content ${navigation.pageTransitionClass}`}>
                    {Object.entries(groupedAyahs).map(([surahNum, ayahs]) => {
                        const surahNumber = parseInt(surahNum);
                        const surah = surahs.find(s => s.number === surahNumber);
                        const isStartOfSurah = ayahs[0]?.numberInSurah === 1;
                        const showBismillah = isStartOfSurah && surahNumber !== 1 && surahNumber !== 9;

                        return (
                            <div key={surahNum}>
                                {isStartOfSurah && surah && (
                                    <div className="mih-surah-frame">
                                        <div className="mih-surah-frame__top-line" />
                                        <div className="mih-surah-frame__border">
                                            <span className="mih-surah-name">{surah.name}</span>
                                        </div>
                                        <div className="mih-surah-frame__bottom-line" />
                                    </div>
                                )}

                                {showBismillah && (
                                    <div className="mih-bismillah">{BISMILLAH}</div>
                                )}

                                <div className="mih-ayahs">
                                    {ayahs.map((ayah: Ayah) => {
                                        const ayahIndex = getAyahIndex(ayah);
                                        const isCurrentlyPlaying = audio.currentPlayingAyah === ayah.number;
                                        const vw = audio.verseWordsMap.get(`${ayah.surah}:${ayah.numberInSurah}`);

                                        const rawWords = ayah.text.split(/\s+/).filter((w: string) => w.length > 0);

                                        const wordElements = vw ? vw.words.map((word: any, wordIdx: number) => {
                                            const content = (tajwidEnabled && word.textTajweed)
                                                ? <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(word.textTajweed) }} />
                                                // NFC normalize fixes vowel/diacritic separation on mobile
                                                : word.text.normalize('NFC');

                                            return (
                                                <span
                                                    key={`${ayahIndex}-${wordIdx}`}
                                                    className={getWordClass(ayahIndex, wordIdx, ayah.number)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        audio.handleWordClick(ayahIndex, wordIdx);
                                                    }}
                                                >
                                                    {content}{' '}
                                                </span>
                                            );
                                        }) : rawWords.map((word: string, wordIdx: number) => (
                                            <span
                                                key={`${ayahIndex}-${wordIdx}`}
                                                className={getWordClass(ayahIndex, wordIdx, ayah.number)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    audio.handleWordClick(ayahIndex, wordIdx);
                                                }}
                                            >
                                                {word}{' '}
                                            </span>
                                        ));

                                        return (
                                            <span
                                                key={ayah.number}
                                                className={`mih-ayah${isCurrentlyPlaying ? ' mih-ayah--playing' : ''} ${maskMode !== 'visible' ? 'mih-ayah--word-by-word' : ''}`}
                                                data-surah={ayah.surah}
                                                data-ayah={ayah.numberInSurah}
                                                data-page={ayah.page}
                                                style={{ cursor: 'pointer', ...(isCurrentlyPlaying ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}) }}
                                                onClick={() => {
                                                    if (!longPressTriggered.current) {
                                                        audio.playAyahAtIndex(ayahIndex);
                                                    }
                                                }}
                                                onTouchStart={() => { longPressTriggered.current = false; longPressTimerRef.current = setTimeout(() => { longPressTriggered.current = true; setShareAyah(ayah); }, 600); }}
                                                onTouchEnd={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                                onTouchMove={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                            >
                                                <button
                                                    className={`mih-fav-btn ${isFavorite(ayah.number) ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite({ number: ayah.number, surah: ayah.surah, numberInSurah: ayah.numberInSurah, text: ayah.text }); }}
                                                >
                                                    <Heart size={12} fill={isFavorite(ayah.number) ? 'currentColor' : 'none'} />
                                                </button>

                                                {wordElements}

                                                <span className="mih-verse-num">
                                                    {toVerseGlyph(ayah.numberInSurah)}
                                                </span>

                                                {showTransliteration && transliterationMap.get(ayah.number) && (
                                                    <div className="mih-transliteration">{transliterationMap.get(ayah.number)}</div>
                                                )}
                                                {showTranslation && translationMap.get(ayah.number) && (
                                                    <div className="mih-translation">{formatDivineNames(translationMap.get(ayah.number))}</div>
                                                )}
                                                {' '}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Intersection target for progressive rendering */}
                    <div ref={observerTargetRef} style={{ height: 40, width: '100%' }} />
                </div>
            </div>



            {/* Search Overlay */}
            {showSearch && (
                <MushafSearchOverlay
                    surahs={surahs}
                    currentPage={currentPage}
                    goToSurah={goToSurah}
                    goToPage={goToPage}
                    goToAyah={goToAyah}
                    onClose={() => setShowSearch(false)}
                />
            )}

            {/* Share Modal */}
            {shareAyah && (
                <MushafShareModal
                    ayah={shareAyah}
                    surahs={surahs}
                    translationMap={translationMap}
                    transliterationMap={transliterationMap}
                    showTranslation={showTranslation}
                    showTransliteration={showTransliteration}
                    onClose={() => setShareAyah(null)}
                />
            )}

            <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
        </div>
    );
}
