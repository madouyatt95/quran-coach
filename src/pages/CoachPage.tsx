import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Mic,
    Square,
    ChevronLeft,
    ChevronRight,
    Volume2,
    RotateCcw,
    Download,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import { whisperService, compareArabicTexts } from '../lib/whisperService';
import type { Ayah } from '../types';
import './CoachPage.css';

type CoachMode = 'intro' | 'selection' | 'loading' | 'active' | 'result';

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

    const [mode, setMode] = useState<CoachMode>('intro');
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Model loading state
    const [modelProgress, setModelProgress] = useState(0);
    const [modelError, setModelError] = useState<string | null>(null);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Result state
    const [result, setResult] = useState<TranscriptionResult | null>(null);

    // Audio for playback help
    const [audio] = useState(new Audio());

    const currentSurah = surahs.find(s => s.number === selectedSurah);
    const currentAyah = ayahs[currentIndex];

    // Load surah when selected
    useEffect(() => {
        if (mode === 'active' || mode === 'selection' || mode === 'result') {
            fetchSurah(selectedSurah).then(({ ayahs: surahAyahs }) => {
                setAyahs(surahAyahs);
            });
        }
    }, [selectedSurah, mode]);

    // Load Whisper model
    const loadModel = async () => {
        setMode('loading');
        setModelError(null);

        const success = await whisperService.loadModel((progress) => {
            setModelProgress(Math.round(progress));
        });

        if (success) {
            setMode('active');
        } else {
            setModelError("Impossible de charger le modèle. Vérifiez votre connexion.");
            setMode('selection');
        }
    };

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Process audio
                await processAudio();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            setModelError("Impossible d'accéder au microphone. Autorisez l'accès.");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Process recorded audio
    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) return;

        setIsProcessing(true);

        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            // Transcribe
            const transcribed = await whisperService.transcribe(audioBlob);

            // Compare with expected text
            if (currentAyah) {
                const comparison = compareArabicTexts(transcribed, currentAyah.text);
                setResult({
                    transcribed,
                    accuracy: comparison.accuracy,
                    correct: comparison.correct,
                    matchedWords: comparison.matchedWords,
                    missedWords: comparison.missedWords,
                });
                setMode('result');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            setModelError("Erreur lors de la transcription.");
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
        setMode('active');
    };

    // Render highlighted text with correct/incorrect words
    const renderHighlightedText = useCallback(() => {
        if (!currentAyah || !result) return null;

        const words = currentAyah.text.split(' ');

        return (
            <div className="coach-result__text" dir="rtl">
                {words.map((word, index) => {
                    const isMatched = result.matchedWords.includes(
                        word.replace(/[\u064B-\u0652\u0670]/g, '')
                    );
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
                </div>

                <div className="coach-intro">
                    <div className="coach-intro__icon">
                        <Mic size={36} />
                    </div>
                    <h2 className="coach-intro__title">Correction en temps réel</h2>
                    <p className="coach-intro__description">
                        Récitez un verset et l'IA analysera votre prononciation.
                        Les mots corrects seront surlignés en vert, les erreurs en rouge.
                    </p>
                    <button className="coach-intro__btn" onClick={() => setMode('selection')}>
                        Commencer une session
                    </button>
                </div>

                <div className="coach-info">
                    <p>
                        <strong>💡 Info :</strong> Le premier chargement télécharge le modèle IA (~75 MB).
                        C'est gratuit et tout se passe sur votre appareil.
                    </p>
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

                    <button className="coach-intro__btn" onClick={loadModel}>
                        <Download size={20} />
                        Charger le modèle IA
                    </button>

                    {modelError && (
                        <div className="coach-error">{modelError}</div>
                    )}
                </div>
            </div>
        );
    }

    // Loading Screen
    if (mode === 'loading') {
        return (
            <div className="coach-page">
                <div className="coach-page__header">
                    <h1 className="coach-page__title">Chargement du modèle</h1>
                </div>

                <div className="coach-loading">
                    <Loader2 size={48} className="coach-loading__spinner" />
                    <p className="coach-loading__text">
                        Téléchargement du modèle Whisper...
                    </p>
                    <div className="coach-loading__progress">
                        <div
                            className="coach-loading__bar"
                            style={{ width: `${modelProgress}%` }}
                        />
                    </div>
                    <span className="coach-loading__percent">{modelProgress}%</span>
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
                        <span>Analyse en cours...</span>
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

            {modelError && (
                <div className="coach-error">{modelError}</div>
            )}
        </div>
    );
}
