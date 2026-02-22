import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { speechRecognitionService } from '../lib/speechRecognition';
import { getSupportedMimeType } from '../lib/audioUnlock';
import type { Ayah } from '../types';

export type WordState = 'correct' | 'error' | 'current' | 'unread';
export type CoachMode = 'solo' | 'duo_echo' | 'link' | 'flash_start' | 'magic_reveal';
export type DuoPhase = 'reciter' | 'student';

interface UseCoachOptions {
    ayahs: Ayah[];
    /** Identifier for score persistence (page number, surah:ayah, etc.) */
    scoreKey: string;
    playingIndex: number;
}

export interface CoachState {
    isCoachMode: boolean;
    coachMode: CoachMode | null;
    duoPhase: DuoPhase | null;
    blindMode: boolean;
    wordStates: Map<string, WordState>;
    isListening: boolean;
    coachMistakes: Record<string, { expected: string; spoken: string }>;
    coachMistakesCount: number;
    coachTotalProcessed: number;
    selectedError: string | null;
    setSelectedError: React.Dispatch<React.SetStateAction<string | null>>;
    showMistakesSummary: boolean;
    setShowMistakesSummary: React.Dispatch<React.SetStateAction<boolean>>;
    coachInterimText: string;
    allCoachWords: Array<{ text: string; ayahIndex: number; wordIndex: number }>;
    coachAccuracy: number;
    coachProgress: number;
    resetCoach: () => void;
    coachJumpToWord: (ayahIndex: number, wordIndex: number) => void;
    startCoachListening: (overrideAyahIndex?: number) => void;
    stopCoachListening: () => void;
    toggleCoachMode: () => void;
    toggleBlindMode: () => void;
    selectCoachMode: (mode: CoachMode | null) => void;
    setDuoPhase: (phase: DuoPhase | null) => void;
}

export function useCoach({
    ayahs,
    scoreKey,
    playingIndex,
}: UseCoachOptions): CoachState {
    const [isCoachMode, setIsCoachMode] = useState(false);
    const [coachMode, setCoachMode] = useState<CoachMode | null>(null);
    const [duoPhase, setDuoPhase] = useState<DuoPhase | null>(null);
    const [blindMode, setBlindMode] = useState(false);
    const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
    const [isListening, setIsListening] = useState(false);
    const [coachMistakes, setCoachMistakes] = useState<Record<string, { expected: string; spoken: string }>>({});
    const [coachMistakesCount, setCoachMistakesCount] = useState(0);
    const [coachTotalProcessed, setCoachTotalProcessed] = useState(0);
    const [selectedError, setSelectedError] = useState<string | null>(null);
    const [showMistakesSummary, setShowMistakesSummary] = useState(false);
    const [coachInterimText, setCoachInterimText] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Build a flat word list for ASR matching
    const allCoachWords = useMemo(() => {
        const words: Array<{ text: string; ayahIndex: number; wordIndex: number }> = [];
        ayahs.forEach((ayah, ayahIndex) => {
            const w = ayah.text.split(/\s+/).filter(w => w.length > 0);
            w.forEach((text, wordIndex) => {
                words.push({ text, ayahIndex, wordIndex });
            });
        });
        return words;
    }, [ayahs]);

    // Reset coach state
    const resetCoach = useCallback(() => {
        setWordStates(new Map());
        setCoachMistakes({});
        setCoachMistakesCount(0);
        setCoachTotalProcessed(0);
        setCoachInterimText('');
        setSelectedError(null);
        setShowMistakesSummary(false);
    }, []);

    // Coach jump to word
    const coachJumpToWord = useCallback((ayahIndex: number, wordIndex: number) => {
        if (!isCoachMode) return;
        const wordKeyIndex = allCoachWords.findIndex(w => w.ayahIndex === ayahIndex && w.wordIndex === wordIndex);
        if (wordKeyIndex !== -1) {
            speechRecognitionService.setCurrentWordIndex(wordKeyIndex);

            setWordStates(prev => {
                const next = new Map(prev);
                allCoachWords.forEach((_, i) => {
                    if (i > wordKeyIndex) {
                        const word = allCoachWords[i];
                        next.delete(`${word.ayahIndex}-${word.wordIndex}`);
                    }
                });
                next.set(`${ayahIndex}-${wordIndex}`, 'current');
                return next;
            });
        }
    }, [isCoachMode, allCoachWords]);

    // Whisper backup recording
    const startWhisperBackup = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsListening(true);
        } catch (err) {
            console.error('Microphone error:', err);
        }
    }, []);

    // Start listening (ASR)
    const startCoachListening = useCallback((overrideAyahIndex?: number) => {
        if (ayahs.length === 0) return;
        resetCoach();

        const expectedText = ayahs.map(a => a.text).join(' ');

        const currentAyahIdx = overrideAyahIndex !== undefined ? overrideAyahIndex : (playingIndex >= 0 ? playingIndex : 0);
        const startWordIndex = allCoachWords.findIndex(w => w.ayahIndex === currentAyahIdx);
        const safeStartIndex = startWordIndex >= 0 ? startWordIndex : 0;

        const success = speechRecognitionService.start(expectedText, {
            onWordMatch: (wordIndex, isCorrect, spokenWord) => {
                const word = allCoachWords[wordIndex];
                if (!word) return;
                const key = `${word.ayahIndex}-${word.wordIndex}`;

                setWordStates(prev => {
                    const n = new Map(prev);
                    n.set(key, isCorrect ? 'correct' : 'error');
                    return n;
                });
                setCoachTotalProcessed(prev => prev + 1);

                if (!isCorrect) {
                    setCoachMistakesCount(prev => prev + 1);
                    setCoachMistakes(prev => ({
                        ...prev,
                        [key]: { expected: word.text, spoken: spokenWord || '(non entendu)' }
                    }));
                    if ('vibrate' in navigator) navigator.vibrate(200);
                }
            },
            onCurrentWord: (wordIndex) => {
                const word = allCoachWords[wordIndex];
                if (!word) return;
                const key = `${word.ayahIndex}-${word.wordIndex}`;
                setWordStates(prev => {
                    const n = new Map(prev);
                    n.set(key, 'current');
                    return n;
                });
            },
            onInterimResult: (text) => setCoachInterimText(text),
            onError: (error) => {
                console.warn('Speech recognition error:', error);
                if (error !== 'no-speech') startWhisperBackup();
            },
            onEnd: () => setIsListening(false)
        }, safeStartIndex);

        if (success) {
            setIsListening(true);
            startWhisperBackup();
        } else {
            startWhisperBackup();
        }
    }, [ayahs, allCoachWords, resetCoach, playingIndex, startWhisperBackup]);

    // Stop listening
    const stopCoachListening = useCallback(() => {
        speechRecognitionService.stop();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
        setIsListening(false);
    }, []);

    // Toggle coach mode on/off
    const toggleCoachMode = useCallback(() => {
        if (isCoachMode) {
            stopCoachListening();
            resetCoach();
            setIsCoachMode(false);
            setCoachMode(null);
            setDuoPhase(null);
        } else {
            setIsCoachMode(true);
            setCoachMode('solo');
        }
    }, [isCoachMode, stopCoachListening, resetCoach]);

    // Select a specific coach mode from the menu
    const selectCoachMode = useCallback((mode: CoachMode | null) => {
        stopCoachListening();
        resetCoach();
        if (!mode) {
            setIsCoachMode(false);
            setCoachMode(null);
            setDuoPhase(null);
            setBlindMode(false);
            return;
        }

        setIsCoachMode(true);
        setCoachMode(mode);
        if (mode === 'magic_reveal') {
            setBlindMode(true);
            setDuoPhase(null);
            startCoachListening();
        } else if (mode === 'solo') {
            setBlindMode(false);
            setDuoPhase(null);
            startCoachListening();
        } else if (mode === 'duo_echo' || mode === 'link' || mode === 'flash_start') {
            setBlindMode(false);
            setDuoPhase('reciter'); // Always start with the reciter
        }
    }, [stopCoachListening, resetCoach, startCoachListening]);

    // Toggle blind mode
    const toggleBlindMode = useCallback(() => {
        setBlindMode(prev => !prev);
    }, []);

    // Coach accuracy
    const coachAccuracy = useMemo(() => {
        if (coachTotalProcessed === 0) return 0;
        return Math.round(((coachTotalProcessed - coachMistakesCount) / coachTotalProcessed) * 100);
    }, [coachTotalProcessed, coachMistakesCount]);

    // Coach progress fraction
    const coachProgress = useMemo(() => {
        if (allCoachWords.length === 0) return 0;
        return coachTotalProcessed / allCoachWords.length;
    }, [coachTotalProcessed, allCoachWords.length]);

    // Save score when coach finishes
    useEffect(() => {
        if (isCoachMode && coachTotalProcessed > 0 && coachTotalProcessed >= allCoachWords.length) {
            try {
                const saved = JSON.parse(localStorage.getItem('quran-coach-scores') || '{}');
                saved[scoreKey] = { accuracy: coachAccuracy, date: new Date().toISOString() };
                localStorage.setItem('quran-coach-scores', JSON.stringify(saved));
            } catch { /* ignore */ }
        }
    }, [isCoachMode, coachTotalProcessed, allCoachWords.length, coachAccuracy, scoreKey]);

    return {
        isCoachMode,
        coachMode,
        duoPhase,
        blindMode,
        wordStates,
        isListening,
        coachMistakes,
        coachMistakesCount,
        coachTotalProcessed,
        selectedError,
        setSelectedError,
        showMistakesSummary,
        setShowMistakesSummary,
        coachInterimText,
        allCoachWords,
        coachAccuracy,
        coachProgress,
        resetCoach,
        coachJumpToWord,
        startCoachListening,
        stopCoachListening,
        toggleCoachMode,
        toggleBlindMode,
        selectCoachMode,
        setDuoPhase,
    };
}
