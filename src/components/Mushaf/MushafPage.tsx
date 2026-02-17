import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
    Settings,
    Menu,
    Search,
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
import { fetchPage, fetchSurahs, fetchPageTranslation, fetchPageTransliteration } from '../../lib/quranApi';
import { fetchWordTimings, type VerseWords } from '../../lib/wordTimings';
import { fetchTajweedPage } from '../../lib/tajweedService';
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
import { BISMILLAH, isMobile, toArabicNumbers, getJuzNumber } from './mushafConstants';
import type { MaskMode } from './mushafConstants';
import './MushafPage.css';

export function MushafPage() {
    const {
        currentPage, surahs, setSurahs,
        nextPage, prevPage,
        setPageAyahs, pageAyahs,
        goToSurah, goToPage,
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

    // Page validation
    const [validatedPages, setValidatedPages] = useState<Set<number>>(() => {
        try {
            const saved = localStorage.getItem('quran-coach-validated-pages');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    // ===== Hooks =====
    const audio = useMushafAudio({
        selectedReciter,
        pageAyahs,
        currentPage,
        nextPage,
    });

    const coach = useMushafCoach({
        pageAyahs,
        currentPage,
        playingIndex: audio.playingIndex,
    });

    const navigation = useMushafNavigation({
        currentPage,
        nextPage,
        prevPage,
    });

    // ===== Derived state =====
    const pageSurahNames = useMemo(() => {
        const surahNums = [...new Set(pageAyahs.map(a => a.surah))];
        return surahNums.map(num => {
            const s = surahs.find(s => s.number === num);
            return s ? { number: num, name: s.name, englishName: s.englishName } : null;
        }).filter(Boolean) as { number: number; name: string; englishName: string }[];
    }, [pageAyahs, surahs]);

    const juzNumber = useMemo(() => getJuzNumber(pageAyahs), [pageAyahs]);

    const groupedAyahs = useMemo(() => {
        return pageAyahs.reduce((groups, ayah) => {
            const surahNum = ayah.surah;
            if (!groups[surahNum]) groups[surahNum] = [];
            groups[surahNum].push(ayah);
            return groups;
        }, {} as Record<number, Ayah[]>);
    }, [pageAyahs]);

    const isPageValidated = validatedPages.has(currentPage);

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

        Promise.all([
            fetchPage(currentPage),
            fetchTajweedPage(currentPage),
            showTranslation ? fetchPageTranslation(currentPage) : Promise.resolve(new Map<number, string>()),
            showTransliteration ? fetchPageTransliteration(currentPage) : Promise.resolve(new Map<number, string>())
        ]).then(async ([ayahs, , translations, transliterations]) => {
            setPageAyahs(ayahs);
            audio.pageAyahsRef.current = ayahs;
            setTranslationMap(translations);
            setTransliterationMap(transliterations);
            setIsLoading(false);

            // Fetch word timings
            const wordsMap = new Map<string, VerseWords>();
            await Promise.all(ayahs.map(async (a) => {
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
                    sessionStorage.removeItem('scrollToAyah');
                    scrollToVerse(surah, ayah);
                } catch (e) { console.error('Failed to parse scrollToAyah', e); }
            }
        }).catch(() => {
            setError('Impossible de charger la page. Vérifiez votre connexion.');
            setIsLoading(false);
        });
    }, [currentPage, setPageAyahs, showTranslation, showTransliteration]);

    // Regenerate partial mask when mode changes
    useEffect(() => {
        if (maskMode === 'partial') generatePartialMask(pageAyahs);
    }, [maskMode]);

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

    const togglePageValidation = useCallback(() => {
        setValidatedPages(prev => {
            const next = new Set(prev);
            if (next.has(currentPage)) next.delete(currentPage);
            else next.add(currentPage);
            localStorage.setItem('quran-coach-validated-pages', JSON.stringify([...next]));
            return next;
        });
    }, [currentPage]);

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

    const getAyahIndex = (ayah: Ayah) => pageAyahs.findIndex(a => a.number === ayah.number);

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setShowSideMenu(true)} className="mih-header__icon-btn">
                        <Menu size={20} />
                    </button>
                    <div className="mih-header__info" onClick={() => setShowSearch(true)}>
                        <div className="mih-header__surah">
                            {pageSurahNames.map(s => s.englishName).join(' • ')}
                            <Search size={12} style={{ marginLeft: 4, opacity: 0.5 }} />
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
                        <button className="mih-header-player__btn" onClick={audio.playNextAyah} disabled={audio.playingIndex >= pageAyahs.length - 1}>
                            <SkipForward size={16} />
                        </button>
                        <div className="mih-header-player__divider" />
                        <div className="mih-header-player__speed" onClick={() => audio.setPlaybackSpeed(s => s >= 2 ? 0.5 : s + 0.25)}>
                            {audio.playbackSpeed}x
                        </div>
                        <button className="mih-header-player__stop" onClick={audio.stopAudio}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="mih-header__right">
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
                        audioPlaying={audio.audioPlaying}
                        toggleAudio={audio.toggleAudio}
                        isCoachMode={coach.isCoachMode}
                        toggleCoachMode={coach.toggleCoachMode}
                        isPageValidated={isPageValidated}
                        togglePageValidation={togglePageValidation}
                    />
                    <button
                        className={`mih-header__icon-btn ${showToolbar ? 'active' : ''}`}
                        onClick={() => setShowToolbar(!showToolbar)}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <KhatmTracker />
            <KhatmPageBadge currentPage={currentPage} />

            {/* Floating Navigation (desktop) */}
            {!isMobile && (
                <>
                    <button className="mih-float-nav mih-float-nav--left" onClick={prevPage} disabled={currentPage <= 1}>
                        <ChevronRight size={24} />
                    </button>
                    <button className="mih-float-nav mih-float-nav--right" onClick={nextPage} disabled={currentPage >= 604}>
                        <ChevronLeft size={24} />
                    </button>
                </>
            )}

            {/* ===== Mushaf Content ===== */}
            <div
                className="mih-mushaf"
                onTouchStart={navigation.handleTouchStart}
                onTouchMove={navigation.handleTouchMove}
                onTouchEnd={navigation.handleTouchEnd}
                onScroll={navigation.handleScroll}
            >
                <div className="mih-mushaf__content">
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
                                    {ayahs.map((ayah) => {
                                        const ayahIndex = getAyahIndex(ayah);
                                        const isCurrentlyPlaying = audio.currentPlayingAyah === ayah.number;
                                        const vw = audio.verseWordsMap.get(`${ayah.surah}:${ayah.numberInSurah}`);

                                        const wordElements = vw ? vw.words.map((word, wordIdx) => {
                                            // On mobile with Tajweed disabled, use plain text to avoid vowel separation
                                            const useRawText = !tajwidEnabled && isMobile;
                                            const content = (tajwidEnabled && word.textTajweed)
                                                ? <span dangerouslySetInnerHTML={{ __html: word.textTajweed }} />
                                                : useRawText
                                                    ? (ayah.text.split(/\s+/).filter(w => w.length > 0)[wordIdx] || word.text)
                                                    : word.text;

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
                                        }) : ayah.text.split(/\s+/).filter(w => w.length > 0).map((word, wordIdx) => (
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
                                                    {toArabicNumbers(ayah.numberInSurah)}
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
                </div>
            </div>

            {/* Coach Overlay (progress bar, mic, modals) */}
            <CoachOverlay
                coach={coach}
                audioPlaying={audio.audioPlaying}
                stopAudio={audio.stopAudio}
                playAyahAtIndex={audio.playAyahAtIndex}
                pageAyahsLength={pageAyahs.length}
            />

            {/* Search Overlay */}
            {showSearch && (
                <MushafSearchOverlay
                    surahs={surahs}
                    currentPage={currentPage}
                    goToSurah={goToSurah}
                    goToPage={goToPage}
                    scrollToVerse={scrollToVerse}
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
