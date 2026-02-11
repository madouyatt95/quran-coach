import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    Menu,
    Search,
    Type,
    Layout,
    Music,
    Mic,
    Square,
    CheckCircle2,
    Circle,
    X,
    Palette,
    Loader2,
    Eye,
    EyeOff,
    SkipBack,
    SkipForward,
    Play,
    Pause
} from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { fetchPage, fetchSurahs, getAudioUrl } from '../../lib/quranApi';
import { fetchTajweedPage, getTajweedCategories, type TajweedVerse } from '../../lib/tajweedService';
import { renderTajweedText } from '../../lib/tajweedParser';
import { speechRecognitionService, type WordState } from '../../lib/speechRecognition';
import { SideMenu } from '../Navigation/SideMenu';
import type { Ayah } from '../../types';
import './MushafPage.css';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

// Masking modes
type MaskMode = 'visible' | 'hidden' | 'partial' | 'minimal';

// Convert Western numbers to Arabic-Indic numerals
function toArabicNumbers(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

// Juz info helper
function getJuzNumber(ayahs: Ayah[]): number {
    if (ayahs.length === 0) return 1;
    return ayahs[0].juz || 1;
}



export function MushafPage() {
    const {
        currentPage,
        surahs,
        setSurahs,
        nextPage,
        prevPage,
        setPageAyahs,
        pageAyahs,
        goToSurah,
        goToPage,
    } = useQuranStore();

    const { arabicFontSize, tajwidLayers, toggleTajwidLayer, selectedReciter, tajwidEnabled, toggleTajwid, setArabicFontSize } = useSettingsStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tajweedVerses, setTajweedVerses] = useState<TajweedVerse[]>([]);

    // Panels
    const [showTajweedSheet, setShowTajweedSheet] = useState(false);
    const [showMaskSheet, setShowMaskSheet] = useState(false);
    const [showFontSheet, setShowFontSheet] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Masking
    const [maskMode, setMaskMode] = useState<MaskMode>('visible');
    const [partialHidden, setPartialHidden] = useState<Set<string>>(new Set());

    // Coach mode
    const [isCoachMode, setIsCoachMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
    const [mistakesCount, setMistakesCount] = useState(0);
    const [totalProcessed, setTotalProcessed] = useState(0);
    const [mistakes, setMistakes] = useState<Record<string, { expected: string; spoken: string }>>({});
    const [selectedError, setSelectedError] = useState<string | null>(null);

    // Audio
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioActive, setAudioActive] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(0);
    const [playingIndex, setPlayingIndex] = useState(-1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Page validation
    const [validatedPages, setValidatedPages] = useState<Set<number>>(() => {
        try {
            const saved = localStorage.getItem('quran-coach-validated-pages');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    const tajweedCategories = useMemo(() => getTajweedCategories(), []);

    // Current page surah names
    const pageSurahNames = useMemo(() => {
        const surahNums = [...new Set(pageAyahs.map(a => a.surah))];
        return surahNums.map(num => {
            const s = surahs.find(s => s.number === num);
            return s ? { number: num, name: s.name, englishName: s.englishName } : null;
        }).filter(Boolean) as { number: number; name: string; englishName: string }[];
    }, [pageAyahs, surahs]);

    // All words from page (for coach mode)
    const allWords = useMemo(() => {
        const words: { text: string; ayahIndex: number; wordIndex: number }[] = [];
        pageAyahs.forEach((ayah, ayahIndex) => {
            const ayahWords = ayah.text.split(/\s+/).filter(w => w.length > 0);
            ayahWords.forEach((word, wordIndex) => {
                words.push({ text: word, ayahIndex, wordIndex });
            });
        });
        return words;
    }, [pageAyahs]);

    // Juz
    const juzNumber = useMemo(() => getJuzNumber(pageAyahs), [pageAyahs]);

    // Fetch surahs list
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs).catch(() => { });
        }
    }, [surahs.length, setSurahs]);

    // Fetch page content
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetchPage(currentPage),
            fetchTajweedPage(currentPage)
        ]).then(([ayahs, tajweed]) => {
            setPageAyahs(ayahs);
            setTajweedVerses(tajweed);
            setIsLoading(false);
            // Reset coach state on page change
            setWordStates(new Map());
            setMistakesCount(0);
            setTotalProcessed(0);
            setMistakes({});
            setSelectedError(null);

            // Generate partial hidden words
            if (maskMode === 'partial') {
                generatePartialMask(ayahs);
            }

            // Handle scrollToAyah from Shazam
            const scrollData = sessionStorage.getItem('scrollToAyah');
            if (scrollData) {
                try {
                    const { surah, ayah } = JSON.parse(scrollData);
                    sessionStorage.removeItem('scrollToAyah');
                    setTimeout(() => {
                        const ayahElement = document.querySelector(`[data-surah="${surah}"][data-ayah="${ayah}"]`);
                        if (ayahElement) {
                            ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            ayahElement.classList.add('highlighted-from-shazam');
                            setTimeout(() => ayahElement.classList.remove('highlighted-from-shazam'), 3000);
                        }
                    }, 100);
                } catch (e) {
                    console.error('Failed to parse scrollToAyah', e);
                }
            }
        }).catch(() => {
            setError('Impossible de charger la page. Vérifiez votre connexion.');
            setIsLoading(false);
        });
    }, [currentPage, setPageAyahs]);

    // Regenerate partial mask when mode changes
    useEffect(() => {
        if (maskMode === 'partial') {
            generatePartialMask(pageAyahs);
        }
    }, [maskMode]);

    // Generate partial mask (randomly hide ~50% of words)
    const generatePartialMask = useCallback((ayahs: Ayah[]) => {
        const hidden = new Set<string>();
        ayahs.forEach((ayah, ayahIndex) => {
            const words = ayah.text.split(/\s+/).filter(w => w.length > 0);
            words.forEach((_, wordIndex) => {
                if (Math.random() > 0.5) {
                    hidden.add(`${ayahIndex}-${wordIndex}`);
                }
            });
        });
        setPartialHidden(hidden);
    }, []);

    // Page validation
    const togglePageValidation = useCallback(() => {
        setValidatedPages(prev => {
            const next = new Set(prev);
            if (next.has(currentPage)) {
                next.delete(currentPage);
            } else {
                next.add(currentPage);
            }
            localStorage.setItem('quran-coach-validated-pages', JSON.stringify([...next]));
            return next;
        });
    }, [currentPage]);

    const isPageValidated = validatedPages.has(currentPage);

    // Audio playback - play all ayahs on page sequentially
    const playAyahAtIndex = useCallback((idx: number) => {
        if (!pageAyahs[idx] || !audioRef.current) return;

        setAudioActive(true);
        setAudioPlaying(true);
        const ayah = pageAyahs[idx];
        setPlayingIndex(idx);
        setCurrentPlayingAyah(ayah.number);
        audioRef.current.src = getAudioUrl(selectedReciter, ayah.number);
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => { });
    }, [pageAyahs, selectedReciter, playbackSpeed]);

    const playNextAyah = useCallback(() => {
        if (playingIndex < pageAyahs.length - 1) {
            playAyahAtIndex(playingIndex + 1);
        } else {
            setAudioPlaying(false);
            setPlayingIndex(-1);
            setCurrentPlayingAyah(0);
        }
    }, [playingIndex, pageAyahs.length, playAyahAtIndex]);

    const playPrevAyah = useCallback(() => {
        if (playingIndex > 0) {
            playAyahAtIndex(playingIndex - 1);
        }
    }, [playingIndex, playAyahAtIndex]);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setAudioActive(false);
        setAudioPlaying(false);
        setPlayingIndex(-1);
        setCurrentPlayingAyah(0);
    }, []);

    const toggleAudio = useCallback(() => {
        if (pageAyahs.length === 0 || !audioRef.current) return;

        if (audioPlaying) {
            audioRef.current.pause();
            setAudioPlaying(false);
        } else {
            setAudioPlaying(true);
            setAudioActive(true);
            const startIdx = playingIndex >= 0 ? playingIndex : 0;
            playAyahAtIndex(startIdx);
        }
    }, [pageAyahs.length, audioPlaying, playingIndex, playAyahAtIndex]);

    // Handle audio ended
    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.onended = playNextAyah;
    }, [playNextAyah]);

    // Coach mode - speech recognition
    const startListening = useCallback(() => {
        const expectedText = pageAyahs.map(a => a.text).join(' ');

        speechRecognitionService.start(expectedText, {
            onWordMatch: (wordIndex, isCorrect, spokenWord) => {
                const word = allWords[wordIndex];
                if (!word) return;
                const key = `${word.ayahIndex}-${word.wordIndex}`;
                setWordStates(prev => {
                    const newStates = new Map(prev);
                    newStates.set(key, isCorrect ? 'correct' : 'error');
                    return newStates;
                });
                setTotalProcessed(prev => prev + 1);
                if (!isCorrect) {
                    setMistakesCount(prev => prev + 1);
                    setMistakes(prev => ({
                        ...prev,
                        [key]: { expected: word.text, spoken: spokenWord || '(non entendu)' }
                    }));
                    if ('vibrate' in navigator) navigator.vibrate(200);
                }
            },
            onCurrentWord: (wordIndex) => {
                const word = allWords[wordIndex];
                if (!word) return;
                const key = `${word.ayahIndex}-${word.wordIndex}`;
                setWordStates(prev => {
                    const newStates = new Map(prev);
                    newStates.set(key, 'current');
                    return newStates;
                });
            },
            onInterimResult: () => { },
            onError: () => { },
            onEnd: () => setIsListening(false)
        });
        setIsListening(true);
    }, [pageAyahs, allWords]);

    const stopListening = useCallback(() => {
        speechRecognitionService.stop();
        setIsListening(false);
    }, []);

    // Group ayahs by surah
    const groupedAyahs = useMemo(() => {
        return pageAyahs.reduce((groups, ayah) => {
            const surahNum = ayah.surah;
            if (!groups[surahNum]) groups[surahNum] = [];
            groups[surahNum].push(ayah);
            return groups;
        }, {} as Record<number, Ayah[]>);
    }, [pageAyahs]);

    // Get Tajweed text for a verse
    const getTajweedText = (verseKey: string): string | null => {
        const verse = tajweedVerses.find(v => v.verseKey === verseKey);
        return verse?.textTajweed || null;
    };

    // Get word class (coach mode + masking)
    const getWordClass = (ayahIndex: number, wordIndex: number): string => {
        const key = `${ayahIndex}-${wordIndex}`;

        // Coach mode states take priority
        if (isCoachMode) {
            const state = wordStates.get(key);
            if (state === 'correct') return 'mih-word mih-word--correct';
            if (state === 'error') return 'mih-word mih-word--error';
            if (state === 'current') return 'mih-word mih-word--current';
        }

        // Masking mode
        switch (maskMode) {
            case 'hidden': return 'mih-word mih-word--hidden';
            case 'partial': return partialHidden.has(key) ? 'mih-word mih-word--hidden' : 'mih-word';
            case 'minimal': return 'mih-word mih-word--partial';
            default: return 'mih-word';
        }
    };

    // Filtered surahs for search (Arabic, English, French, number)
    const filteredSurahs = useMemo(() => {
        if (!searchQuery) return surahs;
        const q = searchQuery.toLowerCase();
        return surahs.filter(s =>
            s.name.includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.englishName.toLowerCase().includes(q) ||
            (s.englishNameTranslation && s.englishNameTranslation.toLowerCase().includes(q)) ||
            s.number.toString().includes(q)
        );
    }, [surahs, searchQuery]);

    // Get ayah index in pageAyahs
    const getAyahIndex = (ayah: Ayah) => pageAyahs.findIndex(a => a.number === ayah.number);

    // ============ RENDER ============

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
        <div className="mushaf-page" data-arabic-size={arabicFontSize}>
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

                <div className="mih-header__right">
                    <button
                        className={`mih-header__icon-btn ${showToolbar ? 'active' : ''}`}
                        onClick={() => setShowToolbar(!showToolbar)}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* ===== Floating Navigation ===== */}
            <button
                className="mih-float-nav mih-float-nav--left"
                onClick={prevPage}
                disabled={currentPage <= 1}
            >
                <ChevronRight size={24} />
            </button>
            <button
                className="mih-float-nav mih-float-nav--right"
                onClick={nextPage}
                disabled={currentPage >= 604}
            >
                <ChevronLeft size={24} />
            </button>

            {/* ===== Mushaf Content ===== */}
            <div className="mih-mushaf">
                <div className="mih-mushaf__content">
                    {Object.entries(groupedAyahs).map(([surahNum, ayahs]) => {
                        const surahNumber = parseInt(surahNum);
                        const surah = surahs.find(s => s.number === surahNumber);
                        const isStartOfSurah = ayahs[0]?.numberInSurah === 1;
                        const showBismillah = isStartOfSurah && surahNumber !== 1 && surahNumber !== 9;

                        return (
                            <div key={surahNum}>
                                {/* Ornamental Surah Header */}
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
                                        const verseKey = `${ayah.surah}:${ayah.numberInSurah}`;
                                        const tajweedHtml = tajwidEnabled ? getTajweedText(verseKey) : null;
                                        const ayahIndex = getAyahIndex(ayah);
                                        const isCurrentlyPlaying = currentPlayingAyah === ayah.number;

                                        // Word-by-word render (coach mode or masking active)
                                        if (isCoachMode || maskMode !== 'visible') {
                                            const words = ayah.text.split(/\s+/).filter(w => w.length > 0);
                                            return (
                                                <span
                                                    key={ayah.number}
                                                    className="mih-ayah"
                                                    data-surah={ayah.surah}
                                                    data-ayah={ayah.numberInSurah}
                                                    style={isCurrentlyPlaying ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : undefined}
                                                >
                                                    {words.map((word, wordIndex) => {
                                                        const key = `${ayahIndex}-${wordIndex}`;
                                                        return (
                                                            <span
                                                                key={key}
                                                                className={getWordClass(ayahIndex, wordIndex)}
                                                                onClick={() => mistakes[key] && setSelectedError(key)}
                                                                style={{ cursor: mistakes[key] ? 'pointer' : 'default' }}
                                                            >
                                                                {word}
                                                            </span>
                                                        );
                                                    })}
                                                    <span className="mih-verse-num">
                                                        {toArabicNumbers(ayah.numberInSurah)}
                                                    </span>
                                                    {' '}
                                                </span>
                                            );
                                        }

                                        // Normal render with Tajweed
                                        return (
                                            <span
                                                key={ayah.number}
                                                className="mih-ayah"
                                                data-surah={ayah.surah}
                                                data-ayah={ayah.numberInSurah}
                                                style={isCurrentlyPlaying ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : undefined}
                                            >
                                                {tajweedHtml ? (
                                                    <>
                                                        {renderTajweedText(tajweedHtml, tajwidLayers)}
                                                        <span className="mih-verse-num">
                                                            {toArabicNumbers(ayah.numberInSurah)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {ayah.text}
                                                        <span className="mih-verse-num">
                                                            {toArabicNumbers(ayah.numberInSurah)}
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

            {/* ===== Toolbar (6 icons) ===== */}
            {/* Toolbar Toggle Panel */}
            {showToolbar && (
                <div className="mih-toolbar">
                    <button
                        className="mih-toolbar__btn"
                        onClick={() => setShowSearch(true)}
                        title="Rechercher une sourate"
                    >
                        <Search size={22} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${showTajweedSheet ? 'active' : ''}`}
                        onClick={() => setShowTajweedSheet(true)}
                        title="Tajweed"
                    >
                        <Palette size={22} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${showFontSheet ? 'active' : ''}`}
                        onClick={() => setShowFontSheet(true)}
                        title="Taille police"
                    >
                        <Type size={22} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${audioPlaying ? 'active' : ''}`}
                        onClick={toggleAudio}
                        title="Audio"
                    >
                        <Music size={22} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${showMaskSheet ? 'active' : ''}`}
                        onClick={() => setShowMaskSheet(true)}
                        title="Masquage"
                    >
                        <Layout size={22} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${isCoachMode ? 'active' : ''} ${isListening ? 'listening' : ''}`}
                        onClick={() => {
                            if (isListening) {
                                stopListening();
                            } else if (isCoachMode) {
                                startListening();
                            } else {
                                setIsCoachMode(true);
                                setWordStates(new Map());
                                setMistakesCount(0);
                                setTotalProcessed(0);
                                setMistakes({});
                            }
                        }}
                        title="Coach"
                    >
                        {isListening ? <Square size={22} /> : <Mic size={22} />}
                    </button>

                    <div className="mih-toolbar__divider" />

                    <button
                        className={`mih-toolbar__validate ${isPageValidated ? 'validated' : ''}`}
                        onClick={togglePageValidation}
                        title="Valider la page"
                    >
                        {isPageValidated ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                </div>
            )}

            {/* ===== Coach Mode Indicator ===== */}
            {
                isCoachMode && totalProcessed > 0 && (
                    <div style={{
                        position: 'fixed', top: 52, right: 12, zIndex: 50,
                        background: mistakesCount > 0 ? '#f44336' : '#4CAF50',
                        color: '#fff', padding: '4px 12px',
                        borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                        <Mic size={12} />
                        {mistakesCount} erreur{mistakesCount !== 1 ? 's' : ''} ({Math.round(((totalProcessed - mistakesCount) / totalProcessed) * 100)}%)
                        <button
                            onClick={() => { setIsCoachMode(false); stopListening(); setWordStates(new Map()); }}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            }

            {/* ===== Page Indicator (if coach mode is off) ===== */}
            {
                isCoachMode && totalProcessed === 0 && (
                    <div style={{
                        position: 'fixed', top: 52, right: 12, zIndex: 50,
                        background: '#4CAF50', color: '#fff', padding: '4px 12px',
                        borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <Mic size={12} />
                        Coach actif
                        <button
                            onClick={() => { setIsCoachMode(false); stopListening(); setWordStates(new Map()); }}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            }
            {/* ===== Tajweed Sheet ===== */}
            {
                showTajweedSheet && (
                    <>
                        <div className="mih-sheet-overlay" onClick={() => setShowTajweedSheet(false)} />
                        <div className="mih-sheet">
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Règles de Tajweed</span>
                                <button className="mih-sheet__close" onClick={() => setShowTajweedSheet(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Global toggle */}
                            <div
                                className={`mih-tajweed-toggle ${tajwidEnabled ? '' : 'off'}`}
                                onClick={toggleTajwid}
                                style={{ cursor: 'pointer' }}
                            >
                                <span>Tajweed {tajwidEnabled ? 'activé' : 'désactivé'}</span>
                                <div className={`mih-toggle-switch ${tajwidEnabled ? 'on' : ''}`} />
                            </div>

                            {/* Rule cards */}
                            <div className="mih-tajweed-grid">
                                {tajweedCategories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`mih-tajweed-card ${tajwidLayers.includes(cat.id) ? 'active' : ''}`}
                                        style={{ color: cat.color, borderColor: tajwidLayers.includes(cat.id) ? cat.color : '#eee' }}
                                        onClick={() => toggleTajwidLayer(cat.id)}
                                    >
                                        <span className="mih-tajweed-card__name">{cat.name.split('(')[0].trim()}</span>
                                        <span className="mih-tajweed-card__arabic">{cat.nameArabic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

            {/* ===== Masquage Sheet ===== */}
            {
                showMaskSheet && (
                    <>
                        <div className="mih-sheet-overlay" onClick={() => setShowMaskSheet(false)} />
                        <div className="mih-sheet">
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Mode Masquage (Hifz)</span>
                                <button className="mih-sheet__close" onClick={() => setShowMaskSheet(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mih-mask-grid">
                                <div
                                    className={`mih-mask-card ${maskMode === 'visible' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('visible'); setShowMaskSheet(false); }}
                                >
                                    <Eye size={20} />
                                    <span>Visible</span>
                                </div>
                                <div
                                    className={`mih-mask-card ${maskMode === 'hidden' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('hidden'); setShowMaskSheet(false); }}
                                >
                                    <EyeOff size={20} />
                                    <span>Tout caché</span>
                                </div>
                                <div
                                    className={`mih-mask-card ${maskMode === 'partial' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('partial'); setShowMaskSheet(false); }}
                                >
                                    <Eye size={20} />
                                    <span>Partiel</span>
                                </div>
                                <div
                                    className={`mih-mask-card ${maskMode === 'minimal' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('minimal'); setShowMaskSheet(false); }}
                                >
                                    <EyeOff size={20} />
                                    <span>Minimal (flou)</span>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* ===== Font Size Sheet ===== */}
            {
                showFontSheet && (
                    <>
                        <div className="mih-sheet-overlay" onClick={() => setShowFontSheet(false)} />
                        <div className="mih-sheet">
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Taille de police</span>
                                <button className="mih-sheet__close" onClick={() => setShowFontSheet(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mih-fontsize-grid">
                                {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                                    <button
                                        key={size}
                                        className={`mih-fontsize-btn ${arabicFontSize === size ? 'active' : ''}`}
                                        onClick={() => { setArabicFontSize(size); setShowFontSheet(false); }}
                                    >
                                        <span style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : size === 'lg' ? '22px' : '26px', fontFamily: 'var(--font-arabic)' }}>
                                            بسم
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#999', marginTop: 4 }}>
                                            {size === 'sm' ? 'Petit' : size === 'md' ? 'Normal' : size === 'lg' ? 'Grand' : 'Très grand'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

            {/* ===== Search Overlay ===== */}
            {
                showSearch && (
                    <div className="mih-search-overlay">
                        <div className="mih-search-header">
                            <input
                                className="mih-search-input"
                                placeholder="Nom arabe, français, anglais ou n° de page..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button className="mih-search-cancel" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                                Annuler
                            </button>
                        </div>

                        {/* Direct page input */}
                        {/^\d+$/.test(searchQuery) && parseInt(searchQuery) >= 1 && parseInt(searchQuery) <= 604 && (
                            <div
                                className="mih-search-item"
                                onClick={() => { goToPage(parseInt(searchQuery)); setShowSearch(false); setSearchQuery(''); }}
                            >
                                <div className="mih-search-item__icon"><Search size={18} /></div>
                                <div className="mih-search-item__info">
                                    <div className="mih-search-item__name">Aller à la page {searchQuery}</div>
                                </div>
                            </div>
                        )}

                        <div className="mih-search-label">
                            {searchQuery ? `${filteredSurahs.length} résultat(s)` : '114 sourates'}
                        </div>

                        <div className="mih-search-list">
                            {filteredSurahs.map(s => (
                                <div
                                    key={s.number}
                                    className="mih-search-item"
                                    onClick={() => { goToSurah(s.number); setShowSearch(false); setSearchQuery(''); }}
                                >
                                    <div className="mih-search-item__icon">{s.number}</div>
                                    <div className="mih-search-item__info">
                                        <div className="mih-search-item__name">{s.name} — {s.englishName}</div>
                                        <div className="mih-search-item__detail">
                                            {s.englishNameTranslation && <>{s.englishNameTranslation} • </>}{s.numberOfAyahs} versets • {s.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* ===== Error Comparison Modal ===== */}
            {
                selectedError && mistakes[selectedError] && (
                    <div className="mih-sheet-overlay" onClick={() => setSelectedError(null)}>
                        <div className="mih-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '30vh' }}>
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Comparaison d'erreur</span>
                                <button className="mih-sheet__close" onClick={() => setSelectedError(null)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>Attendu :</span>
                                    <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.3rem', color: '#2E7D32' }} dir="rtl">
                                        {selectedError && (mistakes as any)[selectedError]?.expected}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>Entendu :</span>
                                    <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.3rem', color: '#C62828' }} dir="rtl">
                                        {selectedError && (mistakes as any)[selectedError]?.spoken}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== Floating Audio Player ===== */}
            {audioActive && (
                <div className="mih-audio-bar">
                    <div className="mih-audio-bar__info">
                        <div className="mih-audio-bar__title">Lecture en cours</div>
                        <div className="mih-audio-bar__subtitle">Ayat {currentPlayingAyah}</div>
                    </div>

                    <div className="mih-audio-bar__controls">
                        <button
                            className="mih-audio-bar__btn"
                            onClick={playPrevAyah}
                            disabled={playingIndex <= 0}
                        >
                            <SkipBack size={20} />
                        </button>

                        <button className="mih-audio-bar__play-btn" onClick={toggleAudio}>
                            {audioPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button
                            className="mih-audio-bar__btn"
                            onClick={playNextAyah}
                            disabled={playingIndex >= pageAyahs.length - 1}
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    <div className="mih-audio-bar__speed" onClick={() => setPlaybackSpeed(s => s >= 2 ? 0.5 : s + 0.25)}>
                        {playbackSpeed}x
                    </div>

                    <button className="mih-audio-bar__stop" onClick={stopAudio}>
                        <X size={20} />
                    </button>
                </div>
            )}

            <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
        </div>
    );
}
