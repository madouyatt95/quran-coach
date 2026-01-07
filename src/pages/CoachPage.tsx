import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Mic,
    Square,
    ChevronLeft,
    ChevronRight,
    Volume2,
    RotateCcw,
    CheckCircle,
    XCircle,
    Loader2,
    Crown
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePremiumStore } from '../stores/premiumStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import type { Ayah } from '../types';
import './CoachPage.css';

type CoachMode = 'intro' | 'selection' | 'active' | 'result';

interface TranscriptionResult {
    transcribed: string;
    accuracy: number;
    correct: boolean;
    matchedWords: string[];
    missedWords: string[];
}

export function CoachPage() {
    const { surahs } = useQuranStore();
    const { selectedReciter } = useSettingsStore();
    const { isPremium, setPremium, checkPremium } = usePremiumStore();

    const [mode, setMode] = useState<CoachMode>('intro');
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // MediaRecorder for API approach
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Result state
    const [result, setResult] = useState<TranscriptionResult | null>(null);

    // Audio for playback help
    const [audio] = useState(new Audio());

    const currentSurah = surahs.find(s => s.number === selectedSurah);
    const currentAyah = ayahs[currentIndex];

    // Check premium status on mount
    useEffect(() => {
        checkPremium();
    }, [checkPremium]);

    // Load surah when selected
    useEffect(() => {
        if (mode !== 'intro') {
            fetchSurah(selectedSurah).then(({ ayahs: surahAyahs }) => {
                setAyahs(surahAyahs);
            });
        }
    }, [selectedSurah, mode]);

    // Activate premium (for demo - in production use payment system)
    const activatePremium = () => {
        // Set premium for 30 days
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

            // Use best available format
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/mp4';

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
            setError("Impossible d'accéder au microphone. Autorisez l'accès dans les paramètres.");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Process audio with API
    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            // Convert to base64
            const reader = new FileReader();
            const base64Audio = await new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]); // Remove data URL prefix
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            // Call API
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    expectedText: currentAyah?.text,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transcription failed');
            }

            const data = await response.json();

            setResult({
                transcribed: data.transcribed,
                accuracy: data.comparison?.accuracy || 0,
                correct: data.comparison?.correct || false,
                matchedWords: data.comparison?.matchedWords || [],
                missedWords: data.comparison?.missedWords || [],
            });
            setMode('result');
        } catch (err) {
            console.error('API error:', err);
            setError("Erreur de transcription: " + (err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Play current ayah audio
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
            setResult(null);
            setMode('active');
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setResult(null);
            setMode('active');
        }
    };

    const retry = () => {
        setResult(null);
        setError(null);
        setMode('active');
    };

    // Render highlighted text
    const renderHighlightedText = useCallback(() => {
        if (!currentAyah || !result) return null;

        const words = currentAyah.text.split(' ');
        const normalizedMatched = result.matchedWords.map(w =>
            w.replace(/[\u064B-\u0652\u0670]/g, '')
        );

        return (
            <div className="coach-result__text" dir="rtl">
                {words.map((word, index) => {
                    const normalized = word.replace(/[\u064B-\u0652\u0670]/g, '');
                    const isMatched = normalizedMatched.includes(normalized);
                    return (
                        <span
                            key={index}
                            className={`coach-word ${isMatched ? 'correct' : 'incorrect'}`}
                        >
                            {word}{' '}
                        </span>
                    );
                })}
            </div>
        );
    }, [currentAyah, result]);

    // Intro Screen
    if (mode === 'intro') {
        return (
            <div className="coach-page">
                <div className="coach-page__header">
                    <h1 className="coach-page__title">Coach de Récitation</h1>
                    {isPremium && <Crown className="coach-premium-badge" size={20} />}
                </div>

                <div className="coach-intro">
                    <div className="coach-intro__icon">
                        <Mic size={36} />
                    </div>
                    <h2 className="coach-intro__title">Correction IA avancée</h2>
                    <p className="coach-intro__description">
                        Récitez un verset et notre IA analysera votre prononciation avec précision.
                        Les mots corrects seront surlignés en vert, les erreurs en rouge.
                    </p>

                    {isPremium ? (
                        <button className="coach-intro__btn" onClick={() => setMode('selection')}>
                            Commencer une session
                        </button>
                    ) : (
                        <div className="coach-premium-cta">
                            <div className="coach-premium-badge-large">
                                <Crown size={24} />
                                <span>Fonctionnalité Premium</span>
                            </div>
                            <p className="coach-premium-desc">
                                Accédez à la correction IA avec Whisper d'OpenAI pour une transcription
                                précise de votre récitation en arabe.
                            </p>
                            <button className="coach-intro__btn coach-intro__btn--premium" onClick={activatePremium}>
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
            <div className="coach-page">
                <div className="coach-page__header">
                    <h1 className="coach-page__title">Sélection de sourate</h1>
                </div>

                <div className="coach-selection">
                    <select
                        className="coach-selection__select"
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

                    <button className="coach-intro__btn" onClick={() => setMode('active')}>
                        <Mic size={20} />
                        Démarrer le coaching
                    </button>
                </div>
            </div>
        );
    }

    // Result Screen
    if (mode === 'result' && result) {
        return (
            <div className="coach-page">
                <div className="coach-page__header">
                    <h1 className="coach-page__title">Résultat</h1>
                </div>

                <div className="coach-result">
                    <div className={`coach-result__score ${result.accuracy >= 80 ? 'good' : result.accuracy >= 50 ? 'medium' : 'bad'}`}>
                        {result.correct ? (
                            <CheckCircle size={48} />
                        ) : (
                            <XCircle size={48} />
                        )}
                        <span className="coach-result__percent">{result.accuracy}%</span>
                        <span className="coach-result__label">
                            {result.accuracy >= 80 ? 'Excellent!' : result.accuracy >= 50 ? 'Peut mieux faire' : 'À réviser'}
                        </span>
                    </div>

                    {renderHighlightedText()}

                    <div className="coach-result__transcribed">
                        <h4>Votre récitation :</h4>
                        <p dir="rtl">{result.transcribed || '(aucun son détecté)'}</p>
                    </div>

                    <div className="coach-result__actions">
                        <button className="coach-btn coach-btn--primary" onClick={retry}>
                            <RotateCcw size={20} />
                            Réessayer
                        </button>
                        <button className="coach-btn" onClick={playAyah}>
                            <Volume2 size={20} />
                            Écouter
                        </button>
                        <button className="coach-btn coach-btn--outline" onClick={goNext} disabled={currentIndex >= ayahs.length - 1}>
                            Suivant
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active Session
    return (
        <div className="coach-page">
            <div className="coach-page__header">
                <h1 className="coach-page__title">{currentSurah?.name}</h1>
                <span className="coach-page__progress">
                    Verset {currentIndex + 1} / {ayahs.length}
                </span>
            </div>

            {/* Current Ayah */}
            {currentAyah && (
                <div className="coach-ayah">
                    <p className="coach-ayah__text" dir="rtl">
                        {currentAyah.text}
                    </p>
                    <button className="coach-ayah__play" onClick={playAyah}>
                        <Volume2 size={20} />
                        Écouter
                    </button>
                </div>
            )}

            {/* Recording Controls */}
            <div className="coach-controls">
                {isProcessing ? (
                    <div className="coach-processing">
                        <Loader2 size={32} className="coach-loading__spinner" />
                        <span>Analyse IA en cours...</span>
                    </div>
                ) : isRecording ? (
                    <button className="coach-record coach-record--active" onClick={stopRecording}>
                        <Square size={32} />
                        <span>Arrêter l'enregistrement</span>
                    </button>
                ) : (
                    <button className="coach-record" onClick={startRecording}>
                        <Mic size={32} />
                        <span>Réciter ce verset</span>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="coach-nav">
                <button className="coach-nav__btn" onClick={goPrev} disabled={currentIndex === 0}>
                    <ChevronLeft size={24} />
                    Précédent
                </button>
                <button className="coach-nav__btn" onClick={goNext} disabled={currentIndex >= ayahs.length - 1}>
                    Suivant
                    <ChevronRight size={24} />
                </button>
            </div>

            {error && (
                <div className="coach-error">{error}</div>
            )}
        </div>
    );
}
