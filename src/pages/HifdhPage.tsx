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
    Brain,
    Mic,
    Square,
    Loader2,
    Eye,
    Crown
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore, RECITERS, PLAYBACK_SPEEDS } from '../stores/settingsStore';
import { useStatsStore } from '../stores/statsStore';
import { usePremiumStore } from '../stores/premiumStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import { fetchWordTimings, getCurrentWordIndex } from '../lib/wordTimings';
import { SRSControls } from '../components/SRS/SRSControls';
import { pokeController } from '../lib/pokeService';
import { getSharedAudioContext, getSupportedMimeType } from '../lib/audioUnlock';
import type { VerseWords } from '../lib/wordTimings';
import type { Ayah } from '../types';
import './HifdhPage.css';

interface WordState {
    id: number;
    text: string;
    hidden: boolean;
    revealed: boolean;
    correct: boolean | null;
}

export function HifdhPage() {
    const { surahs } = useQuranStore();
    const { selectedReciter, repeatCount, playbackSpeed, setReciter, setPlaybackSpeed } = useSettingsStore();
    const { recordPageRead } = useStatsStore();
    const { isPremium, checkPremium, setPremium } = usePremiumStore();

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

    // Word timings & Test mode
    const [wordTimings, setWordTimings] = useState<VerseWords | null>(null);
    const [activeWordIndex, setActiveWordIndex] = useState(-1);
    const [isTestMode, setIsTestMode] = useState(false);
    const [hideLevel, setHideLevel] = useState(50); // 25, 50, 75, 100
    const [wordStates, setWordStates] = useState<WordState[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pokeHint, setPokeHint] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const silenceTimeoutRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const currentMimeTypeRef = useRef<string>('audio/webm');
    const isRecordingRef = useRef(false); // Use ref to avoid stale closure

    const currentAyah = ayahs[currentAyahIndex];
    const currentReciterInfo = RECITERS.find(r => r.id === selectedReciter);

    // Check premium on mount
    useEffect(() => { checkPremium(); }, [checkPremium]);

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

    // Cleanup AudioContext on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error);
            }
            if (silenceTimeoutRef.current) {
                cancelAnimationFrame(silenceTimeoutRef.current);
            }
        };
    }, []);

    // Initialize/Update word states for test mode
    useEffect(() => {
        if (wordTimings && isTestMode) {
            const totalWords = wordTimings.words.length;
            const wordsToHideCount = Math.ceil((totalWords * hideLevel) / 100);
            const hiddenIndices = new Set<number>();

            while (hiddenIndices.size < wordsToHideCount) {
                hiddenIndices.add(Math.floor(Math.random() * totalWords));
            }

            setWordStates(wordTimings.words.map((w, i) => ({
                id: w.id,
                text: w.text,
                hidden: hiddenIndices.has(i),
                revealed: false,
                correct: null
            })));
        }
    }, [wordTimings, isTestMode, hideLevel, currentAyahIndex]);

    // Handle Word Selection for Loop
    const handleWordClick = (index: number) => {
        if (isTestMode) return; // Disable selection in test mode for now or use it differently

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

        const updateTime = () => {
            setCurrentTime(audio.currentTime);

            // Loop logic for partial selection
            // Use a small margin (50ms) before the endpoint for mobile precision
            if (selectedTimeRange && isPlaying) {
                const endWithMargin = selectedTimeRange.end - 0.05;
                if (audio.currentTime >= endWithMargin) {
                    if (currentRepeat < maxRepeats) {
                        setCurrentRepeat(prev => prev + 1);
                        audio.currentTime = selectedTimeRange.start;
                    } else {
                        audio.pause();
                        setIsPlaying(false);
                        setCurrentRepeat(1);
                    }
                }
            }

            // Sync highlighting
            if (wordTimings) {
                const index = getCurrentWordIndex(audio.currentTime * 1000, wordTimings.words);
                setActiveWordIndex(index);
            }
        };

        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [handleAudioEnded, wordTimings, selectedTimeRange, isPlaying, currentRepeat, maxRepeats]);

    // Test Mode logic
    const startRecording = async () => {
        if (!isPremium) {
            setError("Premium requis");
            return;
        }
        setError(null);
        setPokeHint(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();
            currentMimeTypeRef.current = mimeType;

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            // Use shared AudioContext for iOS PWA compatibility
            audioContextRef.current = getSharedAudioContext();

            // iOS requires resume() after user interaction
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            // Mark recording as active (use ref to avoid stale closure)
            isRecordingRef.current = true;

            const checkSilence = () => {
                // Use ref instead of state to avoid stale closure
                if (!analyserRef.current || !isRecordingRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

                if (avg > 10) {
                    pokeController.reset();
                    setPokeHint(null);
                } else {
                    const firstHiddenWord = wordStates.find(ws => ws.hidden && !ws.revealed);
                    if (firstHiddenWord) {
                        pokeController.onSilence([firstHiddenWord.text], 0);
                    }
                }
                silenceTimeoutRef.current = requestAnimationFrame(checkSilence);
            };

            pokeController.setOnHint((hint: string) => setPokeHint(hint));

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.onstop = () => {
                isRecordingRef.current = false;
                stream.getTracks().forEach(t => t.stop());
                if (silenceTimeoutRef.current) cancelAnimationFrame(silenceTimeoutRef.current);
                if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
                pokeController.reset();
                processTestAudio();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            checkSilence();
        } catch (err) {
            console.error('Recording error:', err);
            setError("Erreur microphone: " + (err instanceof Error ? err.message : 'Accès refusé'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecordingRef.current) {
            isRecordingRef.current = false;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setPokeHint(null);
            pokeController.reset();
        }
    };

    const processTestAudio = async () => {
        if (audioChunksRef.current.length === 0) return;
        setIsProcessing(true);
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: currentMimeTypeRef.current });
            const reader = new FileReader();
            const base64Audio = await new Promise<string>((res, rej) => {
                reader.onload = () => res((reader.result as string).split(',')[1]);
                reader.onerror = rej;
                reader.readAsDataURL(audioBlob);
            });

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    expectedText: currentAyah?.text,
                    mimeType: currentMimeTypeRef.current
                }),
            });

            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            const matchedWords = data.comparison?.matchedWords || [];

            const normalize = (t: string) => t.replace(/[\u064B-\u0652\u0670]/g, '').trim();

            setWordStates(prev => prev.map(ws => {
                const norm = normalize(ws.text);
                const match = matchedWords.some((m: string) => normalize(m) === norm);
                if (ws.hidden && match) return { ...ws, revealed: true, correct: true };
                return ws;
            }));

            if (data.comparison?.accuracy < 80 && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        } catch (err) {
            setError("Erreur transcription");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTestMode = () => {
        setIsTestMode(!isTestMode);
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
    };

    const activatePremium = () => {
        const until = new Date();
        until.setDate(until.getDate() + 30);
        setPremium(true, until.toISOString());
    };

    return (
        <div className="hifdh-page">
            <div className="hifdh-page__header-row">
                <h1 className="hifdh-page__header">Studio Hifdh</h1>
                <button
                    className={`hifdh-test-toggle ${isTestMode ? 'active' : ''}`}
                    onClick={toggleTestMode}
                >
                    <Brain size={20} />
                    {isTestMode ? 'Mode Écoute' : 'Mode Test'}
                </button>
            </div>

            {/* Selection */}
            {!isTestMode && (
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
                        <div className="hifdh-verse-range__inputs">
                            <input
                                type="number"
                                className="hifdh-verse-range__input"
                                value={startAyah}
                                min={1}
                                max={endAyah}
                                onChange={(e) => setStartAyah(Math.max(1, Math.min(parseInt(e.target.value) || 1, endAyah)))}
                            />
                            <span className="hifdh-verse-range__separator">à</span>
                            <input
                                type="number"
                                className="hifdh-verse-range__input"
                                value={endAyah}
                                min={startAyah}
                                max={maxAyahs}
                                onChange={(e) => setEndAyah(Math.max(startAyah, Math.min(parseInt(e.target.value) || startAyah, maxAyahs)))}
                            />
                            <span className="hifdh-verse-range__total">/ {maxAyahs}</span>
                        </div>
                        <button
                            className="hifdh-verse-range__all-btn"
                            onClick={() => { setStartAyah(1); setEndAyah(maxAyahs); }}
                        >
                            Toute la sourate
                        </button>
                    </div>
                </div>
            )}

            {/* Main Player/Test Area */}
            <div className={`hifdh-main-card ${isTestMode ? 'test-active' : ''}`}>
                <audio
                    ref={audioRef}
                    src={currentAyah ? getAudioUrl(selectedReciter, currentAyah.number) : undefined}
                    onEnded={handleAudioEnded}
                />

                {/* Ayah View */}
                <div className="hifdh-ayah-container" dir="rtl">
                    {wordTimings ? (
                        <div className="hifdh-words-grid">
                            {(isTestMode ? wordStates : wordTimings.words).map((word, idx) => {
                                const isHidden = isTestMode && (word as WordState).hidden && !(word as WordState).revealed;
                                const isSelected = !isTestMode && selectionStart !== null && selectionEnd !== null &&
                                    idx >= selectionStart && idx <= selectionEnd;
                                const isPartiallySelected = !isTestMode && selectionStart !== null && idx === selectionStart && selectionEnd === null;

                                return (
                                    <span
                                        key={idx}
                                        className={`hifdh-word 
                                            ${activeWordIndex === idx && !isTestMode ? 'highlight' : ''} 
                                            ${isHidden ? 'hidden-word' : ''} 
                                            ${(word as WordState).revealed ? 'revealed-word' : ''}
                                            ${isSelected ? 'range-selected' : ''}
                                            ${isPartiallySelected ? 'single-selected' : ''}
                                        `}
                                        onClick={() => handleWordClick(idx)}
                                    >
                                        {isHidden ? '●●●' : (word.text)}{' '}
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

                {/* Controls Area */}
                {isTestMode ? (
                    <div className="hifdh-test-controls">
                        {!isPremium ? (
                            <div className="hifdh-premium-gate">
                                <Crown size={24} color="#FFD700" />
                                <p>Le mode Test IA est une fonctionnalité Premium</p>
                                <button className="hifdh-premium-btn" onClick={activatePremium}>
                                    Activer l'essai gratuit (30 jours)
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="hifdh-difficulty-selector">
                                    {[25, 50, 75, 100].map(level => (
                                        <button
                                            key={level}
                                            className={hideLevel === level ? 'active' : ''}
                                            onClick={() => setHideLevel(level)}
                                        >
                                            {level}%
                                        </button>
                                    ))}
                                </div>
                                <div className="hifdh-mic-area">
                                    {isProcessing ? (
                                        <div className="hifdh-processing">
                                            <Loader2 size={32} className="hifdh-spinner" />
                                            <span>Analyse...</span>
                                        </div>
                                    ) : (
                                        <button
                                            className={`hifdh-mic-btn ${isRecording ? 'recording' : ''}`}
                                            onClick={isRecording ? stopRecording : startRecording}
                                        >
                                            {isRecording ? <Square size={32} /> : <Mic size={32} />}
                                            <span>{isRecording ? 'Arrêter' : 'Réciter'}</span>
                                        </button>
                                    )}
                                    {/* Poke Hint Display */}
                                    {pokeHint && isRecording && (
                                        <div className="hifdh-poke-hint">
                                            💡 <span dir="rtl">{pokeHint}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        <button className="hifdh-action-btn" onClick={() => {
                            setWordStates(prev => prev.map(ws => ({ ...ws, revealed: true })));
                        }}>
                            <Eye size={18} /> Tout révéler
                        </button>
                    </div>
                ) : (
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
                )}
            </div>

            {/* Bottom Actions Selection info */}
            {!isTestMode && selectionStart !== null && (
                <div className="hifdh-selection-bar">
                    <span>Boucle active de mots</span>
                    <button onClick={resetSelection}><RotateCcw size={14} /> Réinitialiser</button>
                </div>
            )}

            {/* SRS Memorization Controls */}
            {currentAyah && !isTestMode && (
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

            {error && <div className="hifdh-error-msg">{error}</div>}
        </div>
    );
}
