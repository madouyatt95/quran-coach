import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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
import { fetchSurah, fetchSurahTranslation, fetchSurahTransliteration, fetchSurahs } from '../../lib/quranApi';
import { fetchWordTimings, type VerseWords } from '../../lib/wordTimings';
// import { fetchTajweedPage } from '../../lib/tajweedService'; // Optional, might need surah version later
import { SideMenu } from '../Navigation/SideMenu';
import { KhatmTracker, KhatmPageBadge } from '../Khatm/KhatmTracker';
import { useFavoritesStore } from '../../stores/favoritesStore';
import type { Ayah } from '../../types';

// Sub-components & hooks
import { useMushafAudio } from './hooks/useMushafAudio';
import { useMushafCoach } from './hooks/useMushafCoach';
import { useMushafNavigation } from './hooks/useMushafNavigation';
import { MushafToolbar } from './MushafToolbar';
import { MushafSearchOverlay } from './MushafSearchOverlay';
import { MushafShareModal } from './MushafShareModal';
import { CoachOverlay } from './CoachOverlay';
import { BISMILLAH, isMobile, toArabicNumbers, toVerseGlyph, getJuzNumber, SURAH_NAMES_FR } from './mushafConstants';
import type { MaskMode } from './mushafConstants';
import './MushafPage.css';

export function MushafPage() {
    const {
        currentPage, surahs, setSurahs,
        setCurrentPage, setCurrentAyah,
        currentSurah, currentAyah,
        setSurahAyahs, currentSurahAyahs,
        goToSurah, goToPage, goToAyah,
        nextSurah, updateProgress,
    } = useQuranStore();

    const {
        arabicFontSize, tajwidLayers, toggleTajwidLayer,
        selectedReciter, tajwidEnabled, toggleTajwid,
        setArabicFontSize, showTranslation, toggleTranslation,
        showTransliteration, toggleTransliteration,
    } = useSettingsStore();

    const { toggleFavorite, isFavorite } = useFavoritesStore();

    // ===== Local state =====
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [translationMap, setTranslationMap] = useState<Map<number, string>>(new Map());
    const [transliterationMap, setTransliterationMap] = useState<Map<number, string>>(new Map());

    // Progressive Rendering
    const [renderedCount, setRenderedCount] = useState(20);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);
    const isSilentJumpRef = useRef(false);

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

    const coach = useMushafCoach({
        pageAyahs: currentSurahAyahs,
        currentPage,
        playingIndex: audio.playingIndex,
    });

    const navigation = useMushafNavigation({
        currentPage,
        nextPage: () => goToPage(currentPage + 1),
        prevPage: () => goToPage(currentPage - 1),
    });

    const juzNumber = useMemo(() => currentSurahAyahs.length > 0 ? getJuzNumber(currentSurahAyahs) : 1, [currentSurahAyahs]);

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

                        // Update store only if changed to avoid loops
                        if (pageNum !== currentPage || ayahNum !== currentAyah) {
                            setCurrentPage(pageNum);
                            setCurrentAyah(ayahNum);

                            // Only update general reading bookmark if we are NOT in a silent search jump
                            if (!isSilentJumpRef.current && !sessionStorage.getItem('scrollToAyah')) {
                                updateProgress(); // No {force:true} here -> uses 10v threshold
                            }
                        }
                    }
                });
            },
            { root: container, threshold: 0.5 }
        );

        const updateObservedElements = () => {
            document.querySelectorAll('.mih-ayah').forEach(el => observer.observe(el));
        };

        const timeout = setTimeout(updateObservedElements, 1000);
        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [currentSurahAyahs, currentPage, currentAyah, setCurrentPage, setCurrentAyah, updateProgress]);

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
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlighted-from-shazam');
                setTimeout(() => el.classList.remove('highlighted-from-shazam'), 3000);
            } else if (attempts < 10) {
                attempts++;
                setTimeout(tryScroll, 150);
            }
        };
        setTimeout(tryScroll, 200);
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

            // Handle scrollToAyah from Shazam / Search
            const scrollData = sessionStorage.getItem('scrollToAyah');
            if (scrollData) {
                try {
                    const { surah, ayah } = JSON.parse(scrollData);
                    isSilentJumpRef.current = true;
                    scrollToVerse(surah, ayah);
                    // Clear the silent jump flag after a delay once the observer has had a chance to fire
                    setTimeout(() => {
                        isSilentJumpRef.current = false;
                        sessionStorage.removeItem('scrollToAyah');
                    }, 2000);
                } catch (e) { console.error('Failed to parse scrollToAyah', e); }
            }
        }).catch(() => {
            setError('Impossible de charger la sourate. Vérifiez votre connexion.');
            setIsLoading(false);
        });
    }, [currentSurah, showTranslation, showTransliteration]);

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



    // Word class helper (coach + mask + active)
    const getWordClass = (ayahIndex: number, wordIndex: number, ayahNumber: number): string => {
        const key = `${ayahIndex}-${wordIndex}`;
        const isActive = audio.currentPlayingAyah === ayahNumber && audio.activeWordIndex === wordIndex;

        let classes = 'mih-word';
        if (isActive) classes += ' mih-word--active';

        if (coach.isCoachMode) {
            const state = coach.wordStates.get(key);
            if (state === 'correct') return classes + ' mih-word--correct';
            if (state === 'error') return classes + ' mih-word--error';
            if (state === 'current') return classes + ' mih-word--current';
        }

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
                    <p>تحميل...</p>
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
                        Réessayer
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
                            Page {toArabicNumbers(currentPage)} • Juz {juzNumber}
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
                        showMaskSheet={showMaskSheet}
                        setShowMaskSheet={setShowMaskSheet}
                        maskMode={maskMode}
                        setMaskMode={setMaskMode}
                        isCoachMode={coach.isCoachMode}
                        toggleCoachMode={coach.toggleCoachMode}
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
                                ? (navigation.pullIndicator.direction === 'up' ? '← Page précédente' : 'Page suivante →')
                                : 'Tirez pour changer de page'
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
                                                ? <span dangerouslySetInnerHTML={{ __html: word.textTajweed }} />
                                                // NFC normalize fixes vowel/diacritic separation on mobile
                                                : word.text.normalize('NFC');

                                            return (
                                                <span
                                                    key={`${ayahIndex}-${wordIdx}`}
                                                    className={getWordClass(ayahIndex, wordIdx, ayah.number)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (coach.isCoachMode) coach.coachJumpToWord(ayahIndex, wordIdx);
                                                        else audio.handleWordClick(ayahIndex, wordIdx);
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
                                                    if (coach.isCoachMode) coach.coachJumpToWord(ayahIndex, wordIdx);
                                                    else audio.handleWordClick(ayahIndex, wordIdx);
                                                }}
                                            >
                                                {word}{' '}
                                            </span>
                                        ));

                                        return (
                                            <span
                                                key={ayah.number}
                                                className={`mih-ayah${isCurrentlyPlaying ? ' mih-ayah--playing' : ''} ${coach.isCoachMode || maskMode !== 'visible' ? 'mih-ayah--word-by-word' : ''}`}
                                                data-surah={ayah.surah}
                                                data-ayah={ayah.numberInSurah}
                                                data-page={ayah.page}
                                                style={{ cursor: 'pointer', ...(isCurrentlyPlaying ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}) }}
                                                onClick={() => {
                                                    if (!longPressTriggered.current) {
                                                        if (coach.isCoachMode) coach.coachJumpToWord(ayahIndex, 0);
                                                        else audio.playAyahAtIndex(ayahIndex);
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
                                                    <div className="mih-translation">{translationMap.get(ayah.number)}</div>
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

            {/* Coach Overlay (progress bar, mic, modals) */}
            <CoachOverlay
                coach={coach}
                audioPlaying={audio.audioPlaying}
                stopAudio={audio.stopAudio}
                playAyahAtIndex={audio.playAyahAtIndex}
                pageAyahsLength={currentSurahAyahs.length}
            />

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
