import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Minus,
    Plus,
    RotateCcw,
    Square,
    BookmarkCheck,
    Mic,
    MicOff,
    Eye,
    EyeOff,
    Lightbulb
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore, PLAYBACK_SPEEDS } from '../stores/settingsStore';
import { useStatsStore } from '../stores/statsStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import { fetchWordTimings, getCurrentWordIndex } from '../lib/wordTimings';
import { SRSControls } from '../components/SRS/SRSControls';
import { useSRSStore } from '../stores/srsStore';
import { useCoach } from '../hooks/useCoach';
import { CoachOverlay } from '../components/Coach/CoachOverlay';
import type { VerseWords } from '../lib/wordTimings';
import type { Ayah } from '../types';
import './HifdhPage.css';

// Hifdh always uses Mishari Al-Afasy — only reciter with reliable word-by-word timings
const HIFDH_RECITER = 'ar.alafasy';
const HIFDH_RECITER_QURAN_COM_ID = 7;

export function HifdhPage() {
    const location = useLocation();
    const { surahs } = useQuranStore();
    const { repeatCount, playbackSpeed, setPlaybackSpeed } = useSettingsStore();
    const { recordPageRead } = useStatsStore();
    const { getDueCards, cards, addSegmentCard } = useSRSStore();

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


    // Word timings
    const [wordTimings, setWordTimings] = useState<VerseWords | null>(null);
    const [activeWordIndex, setActiveWordIndex] = useState(-1);

    // Coach mode
    const coach = useCoach({
        ayahs,
        scoreKey: `${selectedSurah}:${startAyah}-${endAyah}`,
        playingIndex: currentAyahIndex,
    });

    // Auto-advance state
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(false);
    const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle incoming verse from navigation state (Deep link)
    useEffect(() => {
        const state = location.state as { surah?: number; ayah?: number };
        if (state?.surah && state?.ayah) {
            setSelectedSurah(state.surah);
            setStartAyah(state.ayah);
            setEndAyah(state.ayah);
            // Clear state so it doesn't re-trigger on every render
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const currentAyah = ayahs[currentAyahIndex];

    const dueCards = getDueCards();
    const allCards = Object.values(cards);

    // Load a verse or segment from SRS card
    const loadFromSRS = (surah: number, ayah: number, ayahEnd?: number) => {
        setSelectedSurah(surah);
        setStartAyah(ayah);
        setEndAyah(ayahEnd || ayah);
    };

    // Check if current range is already in SRS
    const currentSegmentId = startAyah === endAyah
        ? `${selectedSurah}:${startAyah}`
        : `${selectedSurah}:${startAyah}-${endAyah}`;
    const isCurrentRangeInSRS = !!cards[currentSegmentId];

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
        // EXCEPT if we just came from a deep link (location.state)
        const state = location.state as { surah?: number; ayah?: number };
        const isDeepLink = state?.surah === selectedSurah && state?.ayah === startAyah && state?.ayah === endAyah;

        if (surahChanged && surah && !isDeepLink) {
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
            setCurrentRepeat(1); // Reset repeat counter when changing verses
            setSelectionStart(null);
            setSelectionEnd(null);
        });
    }, [selectedSurah, startAyah, endAyah, surahs]);

    // Load audio and fetch timings
    useEffect(() => {
        if (ayahs.length > 0 && audioRef.current) {
            const ayah = ayahs[currentAyahIndex];
            if (!ayah) return;

            const audioUrl = getAudioUrl(HIFDH_RECITER, ayah.number);

            // Only update src if it changed to avoid restart loops
            if (audioRef.current.src !== audioUrl) {
                audioRef.current.src = audioUrl;
                audioRef.current.load();
            }

            audioRef.current.playbackRate = playbackSpeed;
            setActiveWordIndex(-1);

            fetchWordTimings(selectedSurah, ayah.numberInSurah, HIFDH_RECITER_QURAN_COM_ID).then(setWordTimings);
        }
    }, [ayahs, currentAyahIndex, playbackSpeed, selectedSurah]);

    // Handle Word Selection for Loop (disabled in Coach mode)
    const handleWordClick = (index: number) => {
        if (coach.isCoachMode) {
            // In coach mode, tapping a word jumps the ASR cursor
            coach.coachJumpToWord(currentAyahIndex, index);
            return;
        }
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

    // Poke hint — play first 2 words of current ayah
    const handlePoke = useCallback(() => {
        if (!wordTimings || !audioRef.current || wordTimings.words.length < 2) return;
        const startTime = wordTimings.words[0].timestampFrom / 1000;
        const endIdx = Math.min(1, wordTimings.words.length - 1);
        const endTime = wordTimings.words[endIdx].timestampTo / 1000;
        audioRef.current.currentTime = startTime;
        audioRef.current.play();
        setIsPlaying(true);

        const checkStop = () => {
            if (audioRef.current && audioRef.current.currentTime >= endTime) {
                audioRef.current.pause();
                setIsPlaying(false);
                audioRef.current.removeEventListener('timeupdate', checkStop);
            }
        };
        audioRef.current.addEventListener('timeupdate', checkStop);
    }, [wordTimings]);

    // Auto-advance: when coach reaches 100%, advance after 2s
    useEffect(() => {
        if (!coach.isCoachMode || coach.coachProgress < 1.0 || coach.allCoachWords.length === 0) {
            setAutoAdvanceCountdown(false);
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
            }
            return;
        }

        // 100% reached
        if (currentAyahIndex < ayahs.length - 1) {
            setAutoAdvanceCountdown(true);
            autoAdvanceTimerRef.current = setTimeout(() => {
                setAutoAdvanceCountdown(false);
                setCurrentAyahIndex(prev => prev + 1);
                coach.resetCoach();
                // Auto-restart listening on next verse
                setTimeout(() => coach.startCoachListening(), 300);
            }, 2000);
        }

        return () => {
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
            }
        };
    }, [coach.coachProgress, coach.isCoachMode, coach.allCoachWords.length, currentAyahIndex, ayahs.length]);

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
                                    const label = card.ayahEnd ? `V.${card.ayah}-${card.ayahEnd}` : `:${card.ayah}`;
                                    return (
                                        <button
                                            key={card.id}
                                            className="hifdh-srs-card"
                                            onClick={() => loadFromSRS(card.surah, card.ayah, card.ayahEnd)}
                                        >
                                            <span className="hifdh-srs-card__surah">{surahName}</span>
                                            <span className="hifdh-srs-card__ayah">{label}</span>
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
                                    const label = card.ayahEnd ? `V.${card.ayah}-${card.ayahEnd}` : `:${card.ayah}`;
                                    return (
                                        <button
                                            key={card.id}
                                            className="hifdh-srs-card"
                                            onClick={() => loadFromSRS(card.surah, card.ayah, card.ayahEnd)}
                                        >
                                            <span className="hifdh-srs-card__surah">{surahName}</span>
                                            <span className="hifdh-srs-card__ayah">{label}</span>
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

                {/* Add current range to SRS */}
                {startAyah !== endAyah && !isCurrentRangeInSRS && (
                    <button
                        className="hifdh-add-segment-btn"
                        onClick={() => addSegmentCard(selectedSurah, startAyah, endAyah)}
                    >
                        📌 Ajouter V.{startAyah}-{endAyah} au SRS
                    </button>
                )}
                {startAyah !== endAyah && isCurrentRangeInSRS && (
                    <span className="hifdh-segment-added">✓ Plage V.{startAyah}-{endAyah} dans le SRS</span>
                )}
            </div>

            {/* Main Player Area */}
            <div className="hifdh-main-card">
                <audio
                    ref={audioRef}
                    src={currentAyah ? getAudioUrl(HIFDH_RECITER, currentAyah.number) : undefined}
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

                                // Coach word state classes
                                let coachClass = '';
                                let wordState: string | undefined;
                                if (coach.isCoachMode) {
                                    const key = `${currentAyahIndex}-${idx}`;
                                    wordState = coach.wordStates.get(key);
                                    if (wordState === 'correct') coachClass = 'hifdh-word--correct';
                                    else if (wordState === 'error') coachClass = 'hifdh-word--error';
                                    else if (wordState === 'current') coachClass = 'hifdh-word--current';
                                }

                                // Blind mode: mask word unless correctly revealed
                                const isBlind = coach.isCoachMode && coach.blindMode;
                                const isRevealed = wordState === 'correct';
                                const showText = !isBlind || isRevealed;

                                return (
                                    <span
                                        key={idx}
                                        className={`hifdh-word 
                                            ${activeWordIndex === idx ? 'highlight' : ''} 
                                            ${isSelected ? 'range-selected' : ''}
                                            ${isPartiallySelected ? 'single-selected' : ''}
                                            ${coachClass}
                                            ${isBlind && !isRevealed ? 'hifdh-word--blind' : ''}
                                            ${isBlind && isRevealed ? 'hifdh-word--revealed' : ''}
                                        `}
                                        onClick={() => handleWordClick(idx)}
                                    >
                                        {showText ? word.text : '●●●'}{' '}
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
                        <button
                            className={`hifdh-coach-toggle ${coach.isCoachMode ? 'active' : ''}`}
                            onClick={coach.toggleCoachMode}
                            title={coach.isCoachMode ? 'Désactiver le Coach' : 'Activer le Coach'}
                        >
                            {coach.isCoachMode ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        {coach.isCoachMode && (
                            <>
                                <button
                                    className={`hifdh-coach-toggle ${coach.blindMode ? 'active' : ''}`}
                                    onClick={coach.toggleBlindMode}
                                    title={coach.blindMode ? 'Afficher les mots' : 'Récitation aveugle'}
                                >
                                    {coach.blindMode ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    className="hifdh-coach-toggle"
                                    onClick={handlePoke}
                                    title="Indice : écouter les 2 premiers mots"
                                >
                                    <Lightbulb size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions — Selection info */}
            {selectionStart !== null && !coach.isCoachMode && (
                <div className="hifdh-selection-bar">
                    <span>Boucle active de mots</span>
                    <button onClick={resetSelection}><RotateCcw size={14} /> Réinitialiser</button>
                </div>
            )}

            {/* Auto-advance toast */}
            {autoAdvanceCountdown && (
                <div className="hifdh-auto-advance-toast">
                    ✓ Verset suivant dans 2s…
                </div>
            )}

            {/* Coach Overlay (progress bar, mic, modals) */}
            <CoachOverlay
                coach={coach}
                audioPlaying={isPlaying}
                stopAudio={() => { if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); } }}
                playAyahAtIndex={async () => { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setIsPlaying(true); } }}
                pageAyahsLength={ayahs.length}
            />

            {/* SRS Memorization Controls */}
            {currentAyah && (
                <SRSControls
                    surah={selectedSurah}
                    ayah={currentAyah.numberInSurah}
                    onReviewComplete={handleNext}
                />
            )}

            {/* Secondary Controls (Speed, Repeat) */}
            <div className="hifdh-footer-controls">
                <div className="hifdh-control-group">
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
        </div>
    );
}
