import { useState, useEffect, useRef } from 'react';
import {
    Brain,
    Mic,
    Square,
    ChevronLeft,
    ChevronRight,
    Volume2,
    Eye,
    RotateCcw,
    Loader2,
    Crown
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePremiumStore } from '../stores/premiumStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import type { Ayah } from '../types';
import './MemorizePage.css';

type MemorizeMode = 'intro' | 'selection' | 'practice' | 'result';

interface WordState {
    word: string;
    hidden: boolean;
    revealed: boolean;
    correct: boolean | null;
}

export function MemorizePage() {
    const { surahs } = useQuranStore();
    const { selectedReciter } = useSettingsStore();
    const { isPremium, setPremium, checkPremium } = usePremiumStore();

    const [mode, setMode] = useState<MemorizeMode>('intro');
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hideLevel, setHideLevel] = useState(25); // 25%, 50%, 75%, 100%

    // Word states for current ayah
    const [wordStates, setWordStates] = useState<WordState[]>([]);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Audio
    const [audio] = useState(new Audio());

    const currentSurah = surahs.find(s => s.number === selectedSurah);
    const currentAyah = ayahs[currentIndex];

    // Check premium status on mount
    useEffect(() => {
        checkPremium();
    }, [checkPremium]);

    // Load surah
    useEffect(() => {
        if (mode !== 'intro') {
            fetchSurah(selectedSurah).then(({ ayahs: surahAyahs }) => {
                setAyahs(surahAyahs);
            });
        }
    }, [selectedSurah, mode]);

    // Initialize word states when ayah changes
    useEffect(() => {
        if (currentAyah) {
            const words = currentAyah.text.split(' ');
            const totalWords = words.length;
            const wordsToHide = Math.ceil((totalWords * hideLevel) / 100);

            // Randomly select words to hide
            const hiddenIndices = new Set<number>();
            while (hiddenIndices.size < wordsToHide) {
                hiddenIndices.add(Math.floor(Math.random() * totalWords));
            }

            setWordStates(words.map((word, index) => ({
                word,
                hidden: hiddenIndices.has(index),
                revealed: false,
                correct: null,
            })));
        }
    }, [currentAyah, hideLevel]);

    // Activate premium
    const activatePremium = () => {
        const until = new Date();
        until.setDate(until.getDate() + 30);
        setPremium(true, until.toISOString());
    };

    // Start recording
    const startRecording = async () => {
        if (!isPremium) return;

        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                await processAudio();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone error:', err);
            setError("Impossible d'accéder au microphone.");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Process audio and reveal correct words
    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) return;

        setIsProcessing(true);

        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            const reader = new FileReader();
            const base64Audio = await new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    expectedText: currentAyah?.text,
                }),
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json();
            const matchedWords = data.comparison?.matchedWords || [];

            // Normalize function
            const normalize = (text: string) =>
                text.replace(/[\u064B-\u0652\u0670]/g, '').trim();

            // Update word states - reveal matched hidden words
            setWordStates(prev => prev.map(ws => {
                const normalizedWord = normalize(ws.word);
                const isMatched = matchedWords.some((m: string) => normalize(m) === normalizedWord);

                if (ws.hidden && isMatched) {
                    return { ...ws, revealed: true, correct: true };
                } else if (ws.hidden && !ws.revealed) {
                    return { ...ws, correct: false };
                }
                return ws;
            }));

            // Vibrate if there are errors
            const hasErrors = wordStates.some(ws => ws.hidden && !matchedWords.includes(normalize(ws.word)));
            if (hasErrors && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }

            // Check if all hidden words are revealed
            const allRevealed = wordStates.every(ws => !ws.hidden || ws.revealed);
            if (allRevealed) {
                setMode('result');
            }
        } catch (err) {
            console.error('Error:', err);
            setError("Erreur de transcription");
        } finally {
            setIsProcessing(false);
        }
    };

    // Play ayah
    const playAyah = () => {
        if (currentAyah) {
            audio.src = getAudioUrl(selectedReciter, currentAyah.number);
            audio.play();
        }
    };

    // Navigation
    const goNext = () => {
        if (currentIndex < ayahs.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setMode('practice');
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setMode('practice');
        }
    };

    const retry = () => {
        // Re-initialize word states
        if (currentAyah) {
            const words = currentAyah.text.split(' ');
            const totalWords = words.length;
            const wordsToHide = Math.ceil((totalWords * hideLevel) / 100);

            const hiddenIndices = new Set<number>();
            while (hiddenIndices.size < wordsToHide) {
                hiddenIndices.add(Math.floor(Math.random() * totalWords));
            }

            setWordStates(words.map((word, index) => ({
                word,
                hidden: hiddenIndices.has(index),
                revealed: false,
                correct: null,
            })));
        }
        setMode('practice');
    };

    const revealAll = () => {
        setWordStates(prev => prev.map(ws => ({ ...ws, revealed: true })));
    };

    // Intro Screen
    if (mode === 'intro') {
        return (
            <div className="memorize-page">
                <div className="memorize-page__header">
                    <h1 className="memorize-page__title">Mode Mémorisation</h1>
                </div>

                <div className="memorize-intro">
                    <div className="memorize-intro__icon">
                        <Brain size={36} />
                    </div>
                    <h2 className="memorize-intro__title">Testez votre mémoire</h2>
                    <p className="memorize-intro__description">
                        Des mots du verset seront masqués. Récitez le verset complet
                        et les mots corrects se révèleront automatiquement.
                    </p>

                    {isPremium ? (
                        <button className="memorize-intro__btn" onClick={() => setMode('selection')}>
                            Commencer
                        </button>
                    ) : (
                        <div className="memorize-premium-cta">
                            <div className="memorize-premium-badge">
                                <Crown size={24} />
                                <span>Fonctionnalité Premium</span>
                            </div>
                            <button className="memorize-intro__btn memorize-intro__btn--premium" onClick={activatePremium}>
                                <Crown size={20} />
                                Activer Premium (Test 30 jours)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Selection Screen
    if (mode === 'selection') {
        return (
            <div className="memorize-page">
                <div className="memorize-page__header">
                    <h1 className="memorize-page__title">Configuration</h1>
                </div>

                <div className="memorize-selection">
                    <div className="memorize-selection__group">
                        <label>Sourate</label>
                        <select
                            value={selectedSurah}
                            onChange={(e) => {
                                setSelectedSurah(parseInt(e.target.value));
                                setCurrentIndex(0);
                            }}
                        >
                            {surahs.map((s) => (
                                <option key={s.number} value={s.number}>
                                    {s.number}. {s.name} - {s.englishName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="memorize-selection__group">
                        <label>Niveau de difficulté</label>
                        <div className="memorize-levels">
                            {[25, 50, 75, 100].map((level) => (
                                <button
                                    key={level}
                                    className={`memorize-level ${hideLevel === level ? 'active' : ''}`}
                                    onClick={() => setHideLevel(level)}
                                >
                                    {level}%
                                    <span>{level === 25 ? 'Facile' : level === 50 ? 'Moyen' : level === 75 ? 'Difficile' : 'Expert'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="memorize-intro__btn" onClick={() => setMode('practice')}>
                        <Brain size={20} />
                        Démarrer
                    </button>
                </div>
            </div>
        );
    }

    // Result Screen
    if (mode === 'result') {
        const correctCount = wordStates.filter(ws => ws.hidden && ws.revealed && ws.correct).length;
        const hiddenCount = wordStates.filter(ws => ws.hidden).length;
        const accuracy = hiddenCount > 0 ? Math.round((correctCount / hiddenCount) * 100) : 100;

        return (
            <div className="memorize-page">
                <div className="memorize-page__header">
                    <h1 className="memorize-page__title">Résultat</h1>
                </div>

                <div className="memorize-result">
                    <div className={`memorize-result__score ${accuracy >= 80 ? 'good' : accuracy >= 50 ? 'medium' : 'bad'}`}>
                        <span className="memorize-result__percent">{accuracy}%</span>
                        <span className="memorize-result__label">
                            {correctCount}/{hiddenCount} mots trouvés
                        </span>
                    </div>

                    <div className="memorize-ayah" dir="rtl">
                        {wordStates.map((ws, i) => (
                            <span key={i} className={`memorize-word ${ws.hidden ? (ws.correct ? 'correct' : 'incorrect') : ''}`}>
                                {ws.word}{' '}
                            </span>
                        ))}
                    </div>

                    <div className="memorize-result__actions">
                        <button className="memorize-btn memorize-btn--primary" onClick={retry}>
                            <RotateCcw size={20} />
                            Réessayer
                        </button>
                        <button className="memorize-btn" onClick={goNext} disabled={currentIndex >= ayahs.length - 1}>
                            Suivant
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Practice Screen
    return (
        <div className="memorize-page">
            <div className="memorize-page__header">
                <h1 className="memorize-page__title">{currentSurah?.name}</h1>
                <span className="memorize-page__progress">
                    Verset {currentIndex + 1} / {ayahs.length}
                </span>
            </div>

            <div className="memorize-difficulty">
                Difficulté: {hideLevel}% masqué
            </div>

            {/* Ayah with hidden words */}
            <div className="memorize-ayah-container">
                <div className="memorize-ayah" dir="rtl">
                    {wordStates.map((ws, i) => (
                        <span
                            key={i}
                            className={`memorize-word ${ws.hidden && !ws.revealed ? 'hidden' : ''} ${ws.revealed ? 'revealed' : ''}`}
                        >
                            {ws.hidden && !ws.revealed ? '●●●' : ws.word}{' '}
                        </span>
                    ))}
                </div>

                <div className="memorize-ayah__actions">
                    <button onClick={playAyah}>
                        <Volume2 size={18} />
                        Écouter
                    </button>
                    <button onClick={revealAll}>
                        <Eye size={18} />
                        Révéler tout
                    </button>
                </div>
            </div>

            {/* Recording Controls */}
            <div className="memorize-controls">
                {isProcessing ? (
                    <div className="memorize-processing">
                        <Loader2 size={32} className="memorize-spinner" />
                        <span>Analyse en cours...</span>
                    </div>
                ) : isRecording ? (
                    <button className="memorize-record memorize-record--active" onClick={stopRecording}>
                        <Square size={32} />
                        <span>Arrêter</span>
                    </button>
                ) : (
                    <button className="memorize-record" onClick={startRecording}>
                        <Mic size={32} />
                        <span>Réciter</span>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="memorize-nav">
                <button onClick={goPrev} disabled={currentIndex === 0}>
                    <ChevronLeft size={24} />
                    Précédent
                </button>
                <button onClick={goNext} disabled={currentIndex >= ayahs.length - 1}>
                    Suivant
                    <ChevronRight size={24} />
                </button>
            </div>

            {error && <div className="memorize-error">{error}</div>}
        </div>
    );
}
