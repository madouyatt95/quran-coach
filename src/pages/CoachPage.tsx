import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Mic,
    Square,
    ChevronLeft,
    ChevronRight,
    Volume2,
    Eye,
    EyeOff,
    Crown,
    Settings2,
    CheckCircle,
    XCircle,
    RotateCcw,
    X
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePremiumStore } from '../stores/premiumStore';
import { fetchPage, fetchSurahs, getAudioUrl } from '../lib/quranApi';
import { fetchTajweedPage, getTajweedCategories } from '../lib/tajweedService';
import { speechRecognitionService, type WordState } from '../lib/speechRecognition';
import { getSupportedMimeType } from '../lib/audioUnlock';
import type { Ayah } from '../types';
import './CoachPage.css';

// Coach modes
type CoachMode = 'intro' | 'recitation' | 'test' | 'result';

// Word state for display
interface WordDisplay {
    text: string;
    state: WordState;
    ayahIndex: number;
    wordIndex: number;
}

// Convert Western numbers to Arabic-Indic numerals
function toArabicNumbers(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

export function CoachPage() {
    const { currentPage, surahs, setSurahs, nextPage, prevPage, setPageAyahs, pageAyahs } = useQuranStore();
    const { tajwidLayers, toggleTajwidLayer, selectedReciter } = useSettingsStore();
    const { isPremium, setPremium, checkPremium } = usePremiumStore();

    const [mode, setMode] = useState<CoachMode>('intro');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTajweedPanel, setShowTajweedPanel] = useState(false);
    const [interimText, setInterimText] = useState('');

    // Word states for highlighting
    const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
    const [mistakes, setMistakes] = useState<Record<string, { expected: string, spoken: string }>>({});
    const [selectedError, setSelectedError] = useState<string | null>(null);

    // Test mode: which words are hidden
    const [hiddenWords, setHiddenWords] = useState<Set<string>>(new Set());

    // Result state
    const [correctCount, setCorrectCount] = useState(0);
    const [totalWords, setTotalWords] = useState(0);

    // Audio for playback
    const audioRef = useRef<HTMLAudioElement | null>(null);
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    // Recording for Whisper validation
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const tajweedCategories = useMemo(() => getTajweedCategories(), []);

    // Get current page surah names
    const pageSurahNames = useMemo(() => {
        const surahNums = [...new Set(pageAyahs.map(a => a.surah))];
        return surahNums.map(num => surahs.find(s => s.number === num)?.name || '').filter(Boolean);
    }, [pageAyahs, surahs]);

    // Get all words from page
    const allWords = useMemo(() => {
        const words: WordDisplay[] = [];
        pageAyahs.forEach((ayah, ayahIndex) => {
            const ayahWords = ayah.text.split(/\s+/).filter(w => w.length > 0);
            ayahWords.forEach((word, wordIndex) => {
                const key = `${ayahIndex}-${wordIndex}`;
                words.push({
                    text: word,
                    state: wordStates.get(key) || 'pending',
                    ayahIndex,
                    wordIndex
                });
            });
        });
        return words;
    }, [pageAyahs, wordStates]);

    // Check premium on mount
    useEffect(() => {
        checkPremium();
    }, [checkPremium]);

    // Fetch surahs on mount
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs).catch(() => { });
        }
    }, [surahs.length, setSurahs]);

    // Fetch page content
    useEffect(() => {
        if (mode !== 'intro') {
            Promise.all([fetchPage(currentPage), fetchTajweedPage(currentPage)])
                .then(([ayahs]) => {
                    setPageAyahs(ayahs);
                    resetWordStates();
                })
                .catch(() => setError('Impossible de charger la page'));
        }
    }, [currentPage, mode, setPageAyahs]);

    // Reset word states
    const resetWordStates = () => {
        setWordStates(new Map());
        setHiddenWords(new Set());
        setCorrectCount(0);
        setTotalWords(0);
        setMistakes({});
        setSelectedError(null);
    };

    // Initialize test mode (hide random words)
    const initTestMode = () => {
        const hidden = new Set<string>();
        allWords.forEach((word) => {
            // Hide ~50% of words randomly
            if (Math.random() > 0.5) {
                hidden.add(`${word.ayahIndex}-${word.wordIndex}`);
            }
        });
        setHiddenWords(hidden);
        setTotalWords(hidden.size);
    };

    // Start real-time recognition
    const startListening = () => {
        if (!isPremium) return;

        const expectedText = pageAyahs.map(a => a.text).join(' ');

        const success = speechRecognitionService.start(expectedText, {
            onWordMatch: (wordIndex, isCorrect, spokenWord) => {
                const word = allWords[wordIndex];
                if (!word) return;

                const key = `${word.ayahIndex}-${word.wordIndex}`;
                setWordStates(prev => {
                    const newStates = new Map(prev);
                    newStates.set(key, isCorrect ? 'correct' : 'error');
                    return newStates;
                });

                // Handle error storage for comparison
                if (!isCorrect) {
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

                // In test mode, reveal hidden word
                if (mode === 'test' && hiddenWords.has(key)) {
                    if (isCorrect) {
                        setCorrectCount(prev => prev + 1);
                    }
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
            onInterimResult: (text) => {
                setInterimText(text);
            },
            onError: (error) => {
                console.error('Speech recognition error:', error);
                // Fallback to Whisper if Web Speech fails
                if (isPremium && error !== 'no-speech') {
                    startWhisperRecording();
                }
            },
            onEnd: () => {
                setIsListening(false);
                // Check if we should go to result
                if (mode === 'test' && hiddenWords.size === 0) {
                    setMode('result');
                }
            }
        });

        if (success) {
            setIsListening(true);
            // Also start recording for Whisper backup
            startWhisperRecording();
        } else {
            // Fallback to Whisper-only
            startWhisperRecording();
        }
    };

    // Start Whisper recording (backup)
    const startWhisperRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsListening(true);
        } catch (err) {
            console.error('Microphone error:', err);
            setError("Impossible d'accéder au microphone");
        }
    };

    // Stop listening
    const stopListening = async () => {
        speechRecognitionService.stop();

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }

        setIsListening(false);

        // In test mode, show result when done
        if (mode === 'test') {
            setMode('result');
        }
    };

    // Play ayah audio
    const playAyah = (ayah: Ayah) => {
        if (audioRef.current) {
            audioRef.current.src = getAudioUrl(selectedReciter, ayah.number);
            audioRef.current.play().catch(() => { });
        }
    };

    // Activate premium (demo)
    const activatePremium = () => {
        const until = new Date();
        setPremium(true, until.toISOString());
    };

    // Intro screen
    if (mode === 'intro') {
        return (
            <div className="coach-page">
                <div className="coach-intro">
                    <div className="coach-intro__icon">
                        <Mic size={48} />
                    </div>
                    <h1 className="coach-intro__title">Coach de Récitation IA</h1>
                    <p className="coach-intro__desc">
                        Récitez page par page avec feedback temps réel.<br />
                        Les mots s'illuminent au fur et à mesure.
                    </p>

                    {isPremium ? (
                        <div className="coach-intro__modes">
                            <button
                                className="coach-mode-btn"
                                onClick={() => { setMode('recitation'); }}
                            >
                                <Mic size={24} />
                                <span>Récitation libre</span>
                                <small>Feedback en temps réel</small>
                            </button>
                            <button
                                className="coach-mode-btn coach-mode-btn--test"
                                onClick={() => { setMode('test'); initTestMode(); }}
                            >
                                <EyeOff size={24} />
                                <span>Mode Test</span>
                                <small>Mots cachés à révéler</small>
                            </button>
                        </div>
                    ) : (
                        <div className="coach-premium-cta">
                            <Crown size={24} />
                            <p>Fonctionnalité Premium</p>
                            <button onClick={activatePremium}>
                                Activer Premium (Test 30j)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Result screen
    if (mode === 'result') {
        const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;

        return (
            <div className="coach-page">
                <div className="coach-result">
                    <div className={`coach-result__score ${accuracy >= 80 ? 'good' : accuracy >= 50 ? 'medium' : 'bad'}`}>
                        {accuracy >= 80 ? <CheckCircle size={48} /> : <XCircle size={48} />}
                        <span className="coach-result__percent">{accuracy}%</span>
                        <span className="coach-result__label">
                            {accuracy >= 80 ? 'Excellent!' : accuracy >= 50 ? 'Peut mieux faire' : 'À réviser'}
                        </span>
                    </div>

                    <p className="coach-result__detail">
                        {correctCount} / {totalWords} mots corrects
                    </p>

                    <div className="coach-result__actions">
                        <button onClick={() => { resetWordStates(); setMode('test'); initTestMode(); }}>
                            <RotateCcw size={20} />
                            Recommencer
                        </button>
                        <button onClick={() => setMode('intro')}>
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active mode (recitation or test)
    return (
        <div className="coach-page coach-page--active">
            {/* Header */}
            <div className="coach-header">
                <div className="coach-header__info">
                    <span className="coach-surah-name">{pageSurahNames.join(' - ')}</span>
                    <span className="coach-page-number">صفحة {toArabicNumbers(currentPage)}</span>
                </div>
                <div className="coach-header__mode">
                    {mode === 'test' ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{mode === 'test' ? 'Mode Test' : 'Récitation'}</span>
                </div>
                <button onClick={() => setShowTajweedPanel(!showTajweedPanel)}>
                    <Settings2 size={20} />
                </button>
            </div>

            {/* Tajweed Panel */}
            {showTajweedPanel && (
                <div className="coach-tajweed-panel">
                    {tajweedCategories.map(cat => (
                        <button
                            key={cat.id}
                            className={`coach-tajweed-btn ${tajwidLayers.includes(cat.id) ? 'active' : ''}`}
                            onClick={() => toggleTajwidLayer(cat.id)}
                        >
                            <span style={{ backgroundColor: tajwidLayers.includes(cat.id) ? cat.color : '#555' }} />
                            {cat.nameArabic}
                        </button>
                    ))}
                </div>
            )}

            {/* Mushaf Content */}
            <div className="coach-mushaf">
                <div className="coach-mushaf-content">
                    {pageAyahs.map((ayah, ayahIndex) => (
                        <div key={ayah.number} className="coach-ayah">
                            {ayah.text.split(/\s+/).map((word, wordIndex) => {
                                const key = `${ayahIndex}-${wordIndex}`;
                                const isHidden = mode === 'test' && hiddenWords.has(key);
                                const state = wordStates.get(key) || 'pending';

                                return (
                                    <span
                                        key={key}
                                        className={`coach-word coach-word--${state} ${isHidden ? 'coach-word--hidden' : ''}`}
                                        onClick={() => mistakes[key] && setSelectedError(key)}
                                        style={{ cursor: mistakes[key] ? 'pointer' : 'default' }}
                                    >
                                        {isHidden ? '████' : word}
                                    </span>
                                );
                            })}
                            <span className="coach-verse-num">﴿{toArabicNumbers(ayah.numberInSurah)}﴾</span>
                            <button className="coach-play-btn" onClick={() => playAyah(ayah)}>
                                <Volume2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interim transcript */}
            {interimText && (
                <div className="coach-interim">
                    <p dir="rtl">{interimText}</p>
                </div>
            )}

            {/* Controls */}
            <div className="coach-controls">
                <button
                    className="coach-nav-btn"
                    onClick={nextPage}
                    disabled={currentPage >= 604}
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    className={`coach-mic-btn ${isListening ? 'coach-mic-btn--active' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                >
                    {isListening ? <Square size={32} /> : <Mic size={32} />}
                </button>

                <button
                    className="coach-nav-btn"
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Progress */}
            {mode === 'test' && (
                <div className="coach-progress">
                    <div className="coach-progress-bar">
                        <div
                            className="coach-progress-fill"
                            style={{ width: `${((totalWords - hiddenWords.size) / totalWords) * 100}%` }}
                        />
                    </div>
                    <span>{totalWords - hiddenWords.size} / {totalWords}</span>
                </div>
            )}

            {error && <div className="coach-error">{error}</div>}

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
        </div>
    );
}
