import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Minus,
    Plus,
    RotateCcw,
    Volume2,
    Square,
    BookmarkCheck
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore, RECITERS, PLAYBACK_SPEEDS } from '../stores/settingsStore';
import { useStatsStore } from '../stores/statsStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import { fetchWordTimings, getCurrentWordIndex } from '../lib/wordTimings';
import { SRSControls } from '../components/SRS/SRSControls';
import { useSRSStore } from '../stores/srsStore';
import type { VerseWords } from '../lib/wordTimings';
import type { Ayah } from '../types';
import './HifdhPage.css';

export function HifdhPage() {
    const { surahs } = useQuranStore();
    const { selectedReciter, repeatCount, playbackSpeed, setReciter, setPlaybackSpeed } = useSettingsStore();
    const { recordPageRead } = useStatsStore();
    const { getDueCards, cards } = useSRSStore();

    // Selection state
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [startAyah, setStartAyah] = useState(1);
    const [endAyah, setEndAyah] = useState(7);
    const [maxAyahs, setMaxAyahs] = useState(7);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

    // Partial selection (Word loop)
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

    // Player state
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(true);
    const [currentRepeat, setCurrentRepeat] = useState(1);
    const [maxRepeats, setMaxRepeats] = useState(repeatCount);
    const [showReciters, setShowReciters] = useState(false);

    // Word timings
    const [wordTimings, setWordTimings] = useState<VerseWords | null>(null);
    const [activeWordIndex, setActiveWordIndex] = useState(-1);

    const currentAyah = ayahs[currentAyahIndex];
    const currentReciterInfo = RECITERS.find(r => r.id === selectedReciter);
    const dueCards = getDueCards();
    const allCards = Object.values(cards);

    // Load a verse from SRS card
    const loadFromSRS = (surah: number, ayah: number) => {
        setSelectedSurah(surah);
        setStartAyah(ayah);
        setEndAyah(ayah);
    };

    // Update max ayahs when surah changes
    useEffect(() => {
        const surah = surahs.find(s => s.number === selectedSurah);
        if (surah) {
            setMaxAyahs(surah.numberOfAyahs);
        }
    }, [selectedSurah, surahs]);

    // Load surah ayahs - use a ref to track if this is a surah change
    const prevSurahRef = useRef(selectedSurah);

    useEffect(() => {
        const surah = surahs.find(s => s.number === selectedSurah);
        const surahChanged = prevSurahRef.current !== selectedSurah;
        prevSurahRef.current = selectedSurah;

        // Determine the range to use
        let fetchStart = startAyah;
        let fetchEnd = endAyah;

        // If surah changed, always load full surah and reset range
        if (surahChanged && surah) {
            fetchStart = 1;
            fetchEnd = surah.numberOfAyahs;
            setStartAyah(1);
            setEndAyah(surah.numberOfAyahs);
        }

        fetchSurah(selectedSurah).then(({ ayahs: allAyahs }) => {
            const filtered = allAyahs.filter(
                a => a.numberInSurah >= fetchStart && a.numberInSurah <= fetchEnd
            );
            setAyahs(filtered);
            setCurrentAyahIndex(0);
            setSelectionStart(null);
            setSelectionEnd(null);
        });
    }, [selectedSurah, startAyah, endAyah, surahs]);

    // Load audio and fetch timings
    useEffect(() => {
        if (ayahs.length > 0 && audioRef.current) {
            const ayah = ayahs[currentAyahIndex];
            if (!ayah) return;

            const audioUrl = getAudioUrl(selectedReciter, ayah.number);

            // Only update src if it changed to avoid restart loops
            if (audioRef.current.src !== audioUrl) {
                audioRef.current.src = audioUrl;
                audioRef.current.load();
            }

            audioRef.current.playbackRate = playbackSpeed;
            setActiveWordIndex(-1);

            const reciterInfo = RECITERS.find(r => r.id === selectedReciter);
            const quranComReciterId = reciterInfo?.quranComId || 7;
            fetchWordTimings(selectedSurah, ayah.numberInSurah, quranComReciterId).then(setWordTimings);
        }
    }, [ayahs, currentAyahIndex, selectedReciter, playbackSpeed, selectedSurah]);

    // Handle Word Selection for Loop
    const handleWordClick = (index: number) => {
        if (selectionStart === null || (selectionStart !== null && selectionEnd !== null)) {
            setSelectionStart(index);
            setSelectionEnd(null);
        } else {
            if (index < selectionStart) {
                setSelectionEnd(selectionStart);
                setSelectionStart(index);
            } else {
                setSelectionEnd(index);
            }
        }
    };

    const resetSelection = () => {
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    const selectedTimeRange = useMemo(() => {
        if (!wordTimings || selectionStart === null || selectionEnd === null) return null;
        const startWord = wordTimings.words[selectionStart];
        const endWord = wordTimings.words[selectionEnd];
        return { start: startWord.timestampFrom / 1000, end: endWord.timestampTo / 1000 };
    }, [wordTimings, selectionStart, selectionEnd]);

    // Player logic
    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                if (selectedTimeRange) {
                    if (audioRef.current.currentTime < selectedTimeRange.start || audioRef.current.currentTime > selectedTimeRange.end) {
                        audioRef.current.currentTime = selectedTimeRange.start;
                    }
                }
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = useCallback(() => {
        if (currentAyahIndex < ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
            setCurrentRepeat(1);
            resetSelection();
        } else if (isLooping) {
            setCurrentAyahIndex(0);
            setCurrentRepeat(1);
            resetSelection();
            recordPageRead();
        }
    }, [currentAyahIndex, ayahs.length, isLooping, recordPageRead]);

    const handlePrev = () => {
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
            setCurrentRepeat(1);
            resetSelection();
        }
    };

    const handleAudioEnded = useCallback(() => {
        if (currentRepeat < maxRepeats) {
            setCurrentRepeat(prev => prev + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = selectedTimeRange ? selectedTimeRange.start : 0;
                audioRef.current.play();
            }
        } else {
            handleNext();
            if (audioRef.current && isPlaying) {
                setTimeout(() => audioRef.current?.play(), 100);
            }
        }
    }, [currentRepeat, maxRepeats, handleNext, isPlaying, selectedTimeRange]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let rafId: number | null = null;

        // Detect iOS for special handling
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Use requestAnimationFrame for precise loop timing (60fps vs timeupdate ~4fps)
        const checkLoopPoint = () => {
            if (!audio || audio.paused) {
                rafId = null;
                return;
            }

            setCurrentTime(audio.currentTime);

            // Loop logic with larger margin for iOS
            if (selectedTimeRange && isPlaying) {
                // iOS needs much larger margin due to audio processing delays
                const margin = isIOS ? 0.3 : 0.05;
                const endWithMargin = selectedTimeRange.end - margin;

                if (audio.currentTime >= endWithMargin) {
                    if (currentRepeat < maxRepeats) {
                        setCurrentRepeat(prev => prev + 1);

                        // iOS: pause-seek-play for reliable seeking
                        if (isIOS) {
                            audio.pause();
                            audio.currentTime = selectedTimeRange.start;
                            audio.play().catch(() => { });
                        } else {
                            audio.currentTime = selectedTimeRange.start;
                        }
                    } else {
                        audio.pause();
                        setIsPlaying(false);
                        setCurrentRepeat(1);
                        return;
                    }
                }
            }

            // Sync highlighting
            if (wordTimings) {
                const index = getCurrentWordIndex(audio.currentTime * 1000, wordTimings.words);
                setActiveWordIndex(index);
            }

            rafId = requestAnimationFrame(checkLoopPoint);
        };

        const startRAF = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(checkLoopPoint);
            }
        };

        const stopRAF = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('play', startRAF);
        audio.addEventListener('pause', stopRAF);
        audio.addEventListener('loadedmetadata', updateDuration);

        // Start RAF if already playing
        if (isPlaying && !audio.paused) {
            startRAF();
        }

        return () => {
            stopRAF();
            audio.removeEventListener('play', startRAF);
            audio.removeEventListener('pause', stopRAF);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [wordTimings, selectedTimeRange, isPlaying, currentRepeat, maxRepeats]);

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="hifdh-page">
            <div className="hifdh-page__header-row">
                <h1 className="hifdh-page__header">Studio Hifdh</h1>
            </div>

            {/* Due Cards Section */}
            {(dueCards.length > 0 || allCards.length > 0) && (
                <div className="hifdh-srs-section">
                    {dueCards.length > 0 && (
                        <div className="hifdh-srs-due">
                            <div className="hifdh-srs-due__header">
                                <BookmarkCheck size={16} />
                                <span>{dueCards.length} verset{dueCards.length > 1 ? 's' : ''} à réviser</span>
                            </div>
                            <div className="hifdh-srs-due__list">
                                {dueCards.slice(0, 5).map(card => {
                                    const surahName = surahs.find(s => s.number === card.surah)?.name || '';
                                    return (
                                        <button
                                            key={card.id}
                                            className="hifdh-srs-card"
                                            onClick={() => loadFromSRS(card.surah, card.ayah)}
                                        >
                                            <span className="hifdh-srs-card__surah">{surahName}</span>
                                            <span className="hifdh-srs-card__ayah">:{card.ayah}</span>
                                        </button>
                                    );
                                })}
                                {dueCards.length > 5 && (
                                    <span className="hifdh-srs-more">+{dueCards.length - 5} autres</span>
                                )}
                            </div>
                        </div>
                    )}
                    {dueCards.length === 0 && allCards.length > 0 && (
                        <div className="hifdh-srs-all">
                            <span className="hifdh-srs-all__label">Mes versets mémorisés :</span>
                            <div className="hifdh-srs-due__list">
                                {allCards.slice(0, 5).map(card => {
                                    const surahName = surahs.find(s => s.number === card.surah)?.name || '';
                                    return (
                                        <button
                                            key={card.id}
                                            className="hifdh-srs-card"
                                            onClick={() => loadFromSRS(card.surah, card.ayah)}
                                        >
                                            <span className="hifdh-srs-card__surah">{surahName}</span>
                                            <span className="hifdh-srs-card__ayah">:{card.ayah}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Selection */}
            <div className="hifdh-selection">
                <div className="hifdh-selection__row">
                    <select
                        className="hifdh-selection__select"
                        value={selectedSurah}
                        onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                    >
                        {surahs.map((s) => (
                            <option key={s.number} value={s.number}>
                                {s.number}. {s.name} ({s.englishName})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="hifdh-verse-range">
                    <label className="hifdh-verse-range__label">Versets :</label>
                    <div className="hifdh-verse-range__controls">
                        <div className="hifdh-verse-range__group">
                            <button
                                className="hifdh-verse-btn"
                                onClick={() => setStartAyah(Math.max(1, startAyah - 1))}
                                disabled={startAyah <= 1}
                            >−</button>
                            <select
                                className="hifdh-verse-select"
                                value={startAyah}
                                onChange={(e) => setStartAyah(parseInt(e.target.value))}
                            >
                                {Array.from({ length: endAyah }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <button
                                className="hifdh-verse-btn"
                                onClick={() => setStartAyah(Math.min(endAyah, startAyah + 1))}
                                disabled={startAyah >= endAyah}
                            >+</button>
                        </div>
                        <span className="hifdh-verse-range__separator">→</span>
                        <div className="hifdh-verse-range__group">
                            <button
                                className="hifdh-verse-btn"
                                onClick={() => setEndAyah(Math.max(startAyah, endAyah - 1))}
                                disabled={endAyah <= startAyah}
                            >−</button>
                            <select
                                className="hifdh-verse-select"
                                value={endAyah}
                                onChange={(e) => setEndAyah(parseInt(e.target.value))}
                            >
                                {Array.from({ length: maxAyahs - startAyah + 1 }, (_, i) => startAyah + i).map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <button
                                className="hifdh-verse-btn"
                                onClick={() => setEndAyah(Math.min(maxAyahs, endAyah + 1))}
                                disabled={endAyah >= maxAyahs}
                            >+</button>
                        </div>
                        <span className="hifdh-verse-range__total">/ {maxAyahs}</span>
                    </div>
                    <div className="hifdh-verse-range__actions">
                        <button
                            className="hifdh-verse-range__preset"
                            onClick={() => { setStartAyah(1); setEndAyah(maxAyahs); }}
                        >
                            Tout
                        </button>
                        <button
                            className="hifdh-verse-range__preset"
                            onClick={() => { setEndAyah(startAyah); }}
                        >
                            1 verset
                        </button>
                        <button
                            className="hifdh-verse-range__preset"
                            onClick={() => { setEndAyah(Math.min(startAyah + 4, maxAyahs)); }}
                        >
                            5 versets
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Player Area */}
            <div className="hifdh-main-card">
                <audio
                    ref={audioRef}
                    src={currentAyah ? getAudioUrl(selectedReciter, currentAyah.number) : undefined}
                    onEnded={handleAudioEnded}
                />

                {/* Ayah View */}
                <div className="hifdh-ayah-container" dir="rtl">
                    {wordTimings ? (
                        <div className="hifdh-words-grid">
                            {wordTimings.words.map((word, idx) => {
                                const isSelected = selectionStart !== null && selectionEnd !== null &&
                                    idx >= selectionStart && idx <= selectionEnd;
                                const isPartiallySelected = selectionStart !== null && idx === selectionStart && selectionEnd === null;

                                return (
                                    <span
                                        key={idx}
                                        className={`hifdh-word 
                                            ${activeWordIndex === idx ? 'highlight' : ''} 
                                            ${isSelected ? 'range-selected' : ''}
                                            ${isPartiallySelected ? 'single-selected' : ''}
                                        `}
                                        onClick={() => handleWordClick(idx)}
                                    >
                                        {word.text}{' '}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="hifdh-loading-ayah">
                            {currentAyah?.text || "Chargement..."}
                        </div>
                    )}
                </div>

                {/* Player Controls */}
                <div className="hifdh-player-ui">
                    <div className="hifdh-player__progress">
                        <span className="hifdh-player__time">{formatTime(currentTime)}</span>
                        <div className="hifdh-player__progress-bar">
                            <div
                                className="hifdh-player__progress-fill"
                                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            />
                        </div>
                        <span className="hifdh-player__time">{formatTime(duration)}</span>
                    </div>

                    <div className="hifdh-player__controls">
                        <button className="hifdh-player__btn" onClick={handlePrev}><SkipBack size={20} /></button>
                        <button className="hifdh-player__btn" onClick={handlePlayPause}>
                            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                        </button>
                        <button className="hifdh-player__btn" onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                setIsPlaying(false);
                            }
                        }}><Square size={18} /></button>
                        <button className="hifdh-player__btn" onClick={handleNext}><SkipForward size={20} /></button>
                        <button className={`hifdh-player__btn ${isLooping ? 'hifdh-player__btn--active' : ''}`} onClick={() => setIsLooping(!isLooping)}>
                            <Repeat size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Selection info */}
            {selectionStart !== null && (
                <div className="hifdh-selection-bar">
                    <span>Boucle active de mots</span>
                    <button onClick={resetSelection}><RotateCcw size={14} /> Réinitialiser</button>
                </div>
            )}

            {/* SRS Memorization Controls */}
            {currentAyah && (
                <SRSControls
                    surah={selectedSurah}
                    ayah={currentAyah.numberInSurah}
                    onReviewComplete={handleNext}
                />
            )}

            {/* Secondary Controls (Reciters, Speed, Repeat) */}
            <div className="hifdh-footer-controls">
                <div className="hifdh-control-group">
                    <button className="hifdh-config-btn" onClick={() => setShowReciters(!showReciters)}>
                        <Volume2 size={18} /> {currentReciterInfo?.name}
                    </button>
                    <div className="hifdh-speed-row">
                        {PLAYBACK_SPEEDS.filter(s => s >= 0.75).map(speed => (
                            <button
                                key={speed}
                                className={playbackSpeed === speed ? 'active' : ''}
                                onClick={() => setPlaybackSpeed(speed)}
                            >{speed}x</button>
                        ))}
                    </div>
                </div>

                <div className="hifdh-repeat-control">
                    <button onClick={() => setMaxRepeats(prev => Math.max(1, prev - 1))}><Minus size={16} /></button>
                    <span className="hifdh-repeat-stat">{currentRepeat}/{maxRepeats} reps</span>
                    <button onClick={() => setMaxRepeats(prev => Math.min(20, prev + 1))}><Plus size={16} /></button>
                </div>
            </div>

            {showReciters && (
                <div className="hifdh-reciter-overlay" onClick={() => setShowReciters(false)}>
                    <div className="hifdh-reciter-modal" onClick={e => e.stopPropagation()}>
                        {RECITERS.map(r => (
                            <button key={r.id} className={selectedReciter === r.id ? 'active' : ''} onClick={() => { setReciter(r.id); setShowReciters(false); }}>
                                {r.country} {r.name} <span>{r.nameArabic}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
