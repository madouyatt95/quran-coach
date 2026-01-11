import { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Settings2, Volume2, Mic, BookOpen, GraduationCap, FileQuestion, Crown, Square, X } from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { usePremiumStore } from '../../stores/premiumStore';
import { fetchPage, fetchSurahs, fetchAyah, getAudioUrl } from '../../lib/quranApi';
import { fetchTajweedPage, getTajweedCategories, type TajweedVerse } from '../../lib/tajweedService';
import { renderTajweedText } from '../../lib/tajweedParser';
import { speechRecognitionService, type WordState } from '../../lib/speechRecognition';
import type { Ayah } from '../../types';
import './MushafPage.css';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

// View modes
type ViewMode = 'lecture' | 'coach' | 'test';

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

    const { arabicFontSize, tajwidLayers, toggleTajwidLayer, selectedReciter } = useSettingsStore();
    const { isPremium, setPremium } = usePremiumStore();

    const [viewMode, setViewMode] = useState<ViewMode>('lecture');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tajweedVerses, setTajweedVerses] = useState<TajweedVerse[]>([]);
    const [showTajweedPanel, setShowTajweedPanel] = useState(false);

    // Coach mode state
    const [isListening, setIsListening] = useState(false);
    const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
    const [mistakesCount, setMistakesCount] = useState(0);
    const [totalProcessed, setTotalProcessed] = useState(0);
    // Stores: { [key]: { expected: string, spoken: string } }
    const [mistakes, setMistakes] = useState<Record<string, { expected: string, spoken: string }>>({});
    const [selectedError, setSelectedError] = useState<string | null>(null);
    const [showMistakesSummary, setShowMistakesSummary] = useState(false);

    // Test mode state
    const [hiddenWords, setHiddenWords] = useState<Set<string>>(new Set());

    // Audio
    const audioRef = useRef<HTMLAudioElement | null>(null);
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

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

    // Get all words from page
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

    // Fetch surahs list on mount
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs()
                .then(setSurahs)
                .catch(() => { });
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
                // Reset states on page change
                setWordStates(new Map());
                setMistakesCount(0);
                setTotalProcessed(0);
                setMistakes({});
                setSelectedError(null);
                setHiddenWords(new Set());

                // Check for scrollToAyah from Shazam
                const scrollData = sessionStorage.getItem('scrollToAyah');
                if (scrollData) {
                    try {
                        const { surah, ayah } = JSON.parse(scrollData);
                        sessionStorage.removeItem('scrollToAyah');

                        // Find the ayah in the loaded page and scroll to it
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
            })
            .catch(() => {
                setError('Impossible de charger la page. Vérifiez votre connexion.');
                setIsLoading(false);
            });
    }, [currentPage, setPageAyahs]);

    // Initialize test mode
    const initTestMode = () => {
        const hidden = new Set<string>();
        allWords.forEach((word) => {
            if (Math.random() > 0.5) {
                hidden.add(`${word.ayahIndex}-${word.wordIndex}`);
            }
        });
        setHiddenWords(hidden);
    };

    // Handle mode change
    const handleModeChange = (mode: ViewMode) => {
        if ((mode === 'coach' || mode === 'test') && !isPremium) {
            return; // Premium required
        }
        setViewMode(mode);
        setWordStates(new Map());
        setMistakesCount(0);
        setTotalProcessed(0);
        setMistakes({});
        setSelectedError(null);
        if (mode === 'test') {
            initTestMode();
        } else {
            setHiddenWords(new Set());
        }
    };

    // Start listening (Coach/Test mode)
    const startListening = () => {
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

                // Handle error storage for comparison
                if (!isCorrect) {
                    setMistakesCount(prev => prev + 1);
                    setMistakes(prev => ({
                        ...prev,
                        [key]: {
                            expected: word.text,
                            spoken: spokenWord || '(non entendu)'
                        }
                    }));

                    // Vibrate on error
                    if ('vibrate' in navigator) {
                        navigator.vibrate(200);
                    }
                }

                // In test mode, reveal hidden word if they got it right OR wrong (to show the correction)
                if (viewMode === 'test' && hiddenWords.has(key)) {
                    setHiddenWords(prev => {
                        const newHidden = new Set(prev);
                        newHidden.delete(key);
                        return newHidden;
                    });
                }
            },
            onCurrentWord: (wordIndex) => {
                // Highlight current word being expected
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
    };

    // Stop listening
    const stopListening = () => {
        speechRecognitionService.stop();
        setIsListening(false);
    };

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

    // Play audio for first ayah on page
    const playAudio = () => {
        if (pageAyahs.length > 0 && audioRef.current) {
            audioRef.current.src = getAudioUrl(selectedReciter, pageAyahs[0].number);
            audioRef.current.play().catch(() => { });
        }
    };

    // Activate premium (demo)
    const activatePremium = () => {
        const until = new Date();
        until.setDate(until.getDate() + 30);
        setPremium(true, until.toISOString());
    };

    // Get word class based on mode and state
    const getWordClass = (ayahIndex: number, wordIndex: number): string => {
        const key = `${ayahIndex}-${wordIndex}`;

        if (viewMode === 'test' && hiddenWords.has(key)) {
            return 'mushaf-word--hidden';
        }

        const state = wordStates.get(key);
        if (state === 'correct') return 'mushaf-word--correct';
        if (state === 'error') return 'mushaf-word--error';

        return '';
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
        <div className="mushaf-page" data-arabic-size={arabicFontSize} data-mode={viewMode}>
            {/* Header */}
            <div className="mushaf-frame-header">
                <div className="mushaf-page-info">
                    <span className="mushaf-surah-name">{pageSurahNames.join(' - ')}</span>
                    <span className="mushaf-page-number">
                        صفحة {toArabicNumbers(currentPage)}
                        {(viewMode === 'coach' || viewMode === 'test') && totalProcessed > 0 && (
                            <button className="mushaf-stats" onClick={() => setShowMistakesSummary(true)}>
                                {' • '} {mistakesCount} خطأ ({Math.round(((totalProcessed - mistakesCount) / totalProcessed) * 100)}%)
                            </button>
                        )}
                    </span>
                </div>
                <div className="mushaf-header-actions">
                    <button
                        className="mushaf-tajweed-toggle"
                        onClick={() => setShowTajweedPanel(!showTajweedPanel)}
                    >
                        <Settings2 size={18} />
                    </button>
                    {(viewMode === 'coach' || viewMode === 'test') && (
                        <button
                            className={`mushaf-mic-btn ${isListening ? 'active' : ''}`}
                            onClick={isListening ? stopListening : startListening}
                        >
                            {isListening ? <Square size={18} /> : <Mic size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="mushaf-mode-toggle">
                <button
                    className={`mushaf-mode-btn ${viewMode === 'lecture' ? 'active' : ''}`}
                    onClick={() => handleModeChange('lecture')}
                >
                    <BookOpen size={16} />
                    <span>Lecture</span>
                </button>
                <button
                    className={`mushaf-mode-btn ${viewMode === 'coach' ? 'active' : ''} ${!isPremium ? 'premium' : ''}`}
                    onClick={() => handleModeChange('coach')}
                >
                    <GraduationCap size={16} />
                    <span>Coach</span>
                    {!isPremium && <Crown size={12} className="premium-badge" />}
                </button>
                <button
                    className={`mushaf-mode-btn ${viewMode === 'test' ? 'active' : ''} ${!isPremium ? 'premium' : ''}`}
                    onClick={() => handleModeChange('test')}
                >
                    <FileQuestion size={16} />
                    <span>Test</span>
                    {!isPremium && <Crown size={12} className="premium-badge" />}
                </button>
            </div>

            {/* Premium prompt */}
            {!isPremium && (viewMode === 'lecture') && (
                <div className="mushaf-premium-prompt">
                    <button onClick={activatePremium}>
                        <Crown size={14} />
                        Activer Premium (30j)
                    </button>
                </div>
            )}

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

                        // Get ayah index in pageAyahs
                        const getAyahIndex = (ayah: Ayah) => pageAyahs.findIndex(a => a.number === ayah.number);

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
                                        const ayahIndex = getAyahIndex(ayah);

                                        // For coach/test mode, render word by word
                                        if (viewMode !== 'lecture') {
                                            const words = ayah.text.split(/\s+/).filter(w => w.length > 0);
                                            return (
                                                <span key={ayah.number} className="mushaf-ayah" data-surah={ayah.surah} data-ayah={ayah.numberInSurah}>
                                                    {words.map((word, wordIndex) => {
                                                        const key = `${ayahIndex}-${wordIndex}`;
                                                        const isHidden = viewMode === 'test' && hiddenWords.has(key);

                                                        return (
                                                            <span
                                                                key={key}
                                                                className={`mushaf-word ${getWordClass(ayahIndex, wordIndex)}`}
                                                                onClick={() => mistakes[key] && setSelectedError(key)}
                                                                style={{ cursor: mistakes[key] ? 'pointer' : 'default' }}
                                                            >
                                                                {isHidden ? '████' : word}
                                                            </span>
                                                        );
                                                    })}
                                                    <span className="mushaf-verse-number">
                                                        ﴿{toArabicNumbers(ayah.numberInSurah)}﴾
                                                    </span>
                                                    {' '}
                                                </span>
                                            );
                                        }

                                        // Lecture mode - normal render with Tajweed
                                        return (
                                            <span key={ayah.number} className="mushaf-ayah" data-surah={ayah.surah} data-ayah={ayah.numberInSurah}>
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

                    <button className="mushaf-play-btn" onClick={playAudio}>
                        <Volume2 size={20} />
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

            {/* Error Comparison Modal */}
            {selectedError && mistakes[selectedError] && (
                <div className="error-modal-overlay" onClick={() => setSelectedError(null)}>
                    <div className="error-modal" onClick={e => e.stopPropagation()}>
                        <div className="error-modal__header">
                            <h3>Comparaison d'erreur</h3>
                            <button onClick={() => setSelectedError(null)}><X size={20} /></button>
                        </div>
                        <div className="error-modal__content">
                            <div className="error-item">
                                <span className="error-label">Attendu :</span>
                                <span className="error-text expected" dir="rtl">{mistakes[selectedError].expected}</span>
                            </div>
                            <div className="error-item">
                                <span className="error-label">Entendu :</span>
                                <span className="error-text spoken" dir="rtl">{mistakes[selectedError].spoken}</span>
                            </div>
                        </div>
                        <p className="error-modal__hint">Le feedback vous aide à corriger votre prononciation.</p>
                    </div>
                </div>
            )}
            {/* Mistakes Summary Modal */}
            {showMistakesSummary && (
                <div className="error-modal-overlay" onClick={() => setShowMistakesSummary(false)}>
                    <div className="error-modal error-modal--large" onClick={e => e.stopPropagation()}>
                        <div className="error-modal__header">
                            <h3>Toutes mes erreurs</h3>
                            <button onClick={() => setShowMistakesSummary(false)}><X size={20} /></button>
                        </div>
                        <div className="error-modal__content error-modal__content--scrollable">
                            {Object.keys(mistakes).length === 0 ? (
                                <p className="error-modal__empty">Aucune erreur détectée pour le moment. Mashallah !</p>
                            ) : (
                                Object.entries(mistakes).map(([key, data]) => (
                                    <div key={key} className="error-summary-item" onClick={() => {
                                        setSelectedError(key);
                                        setShowMistakesSummary(false);
                                    }}>
                                        <div className="error-summary-row">
                                            <span className="error-summary-label">Attendu :</span>
                                            <span className="error-summary-text expected">{data.expected}</span>
                                        </div>
                                        <div className="error-summary-row">
                                            <span className="error-summary-label">Entendu :</span>
                                            <span className="error-summary-text spoken">{data.spoken}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
