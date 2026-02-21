import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { speechRecognitionService } from '../lib/speechRecognition';
import { getSupportedMimeType } from '../lib/audioUnlock';
import type { Ayah } from '../types';

export type WordState = 'correct' | 'error' | 'current' | 'unread';

interface UseCoachOptions {
    ayahs: Ayah[];
    /** Identifier for score persistence (page number, surah:ayah, etc.) */
    scoreKey: string;
    playingIndex: number;
}

export interface CoachState {
    isCoachMode: boolean;
    blindMode: boolean;
    isMushafBlanc: boolean;
    isDuoMode: boolean;
    isFlashcardMode: boolean;
    isHandsFree: boolean;
    isPassiveMode: boolean;
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
    isAyahComplete: (ayahIndex: number) => boolean;
    resetCoach: () => void;
    coachJumpToWord: (ayahIndex: number, wordIndex: number) => void;
    startCoachListening: (startIndex?: number, isPassive?: boolean) => void;
    stopCoachListening: () => void;
    toggleCoachMode: () => void;
    toggleBlindMode: () => void;
    toggleMushafBlancMode: () => void;
    toggleDuoMode: () => void;
    toggleFlashcardMode: () => void;
    toggleHandsFreeMode: () => void;
}

export function useCoach({
    ayahs,
    scoreKey,
    playingIndex,
}: UseCoachOptions): CoachState {
    const [isCoachMode, setIsCoachMode] = useState(false);
    const [blindMode, setBlindMode] = useState(false);
    const [isMushafBlanc, setIsMushafBlanc] = useState(false);
    const [isDuoMode, setIsDuoMode] = useState(false);
    const [isFlashcardMode, setIsFlashcardMode] = useState(false);
    const [isHandsFree, setIsHandsFree] = useState(false);
    const [isPassiveMode, setIsPassiveMode] = useState(false);

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

    // Voice command keywords (French/Arabic loosely)
    const COMMANDS = useMemo(() => ({
        next: ['suivant', 'après', 'tali', 'taali'],
        prev: ['précédent', 'avant', 'qabl'],
        repeat: ['répète', 'encore', 'iida', 'id'],
        hint: ['indice', 'aide-moi', 'mousaada', 'hint'],
        handsfree: ['mains libres', 'activer mains libres', 'vocal'],
        stop: ['stop', 'arrête', 'pause', 'qif'],
        listen: ['coach', 'écoute-moi', 'ecoute', 'ijaba']
    }), []);

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
    const startCoachListening = useCallback((startIndex?: number, isPassive: boolean = false) => {
        if (ayahs.length === 0) return;
        setIsPassiveMode(isPassive);
        // Only reset if we are starting from the very beginning of the range
        if (startIndex === undefined && playingIndex === 0) {
            resetCoach();
        }

        const expectedText = ayahs.map(a => a.text).join(' ');

        // Determine actual start index
        let safeStartIndex = 0;
        if (startIndex !== undefined) {
            safeStartIndex = startIndex;
        } else {
            const currentAyahIdx = playingIndex >= 0 ? playingIndex : 0;
            const wordIdx = allCoachWords.findIndex(w => w.ayahIndex === currentAyahIdx);
            safeStartIndex = wordIdx >= 0 ? wordIdx : 0;
        }

        const success = speechRecognitionService.start(expectedText, {
            onWordMatch: (wordIndex, isCorrect, spokenWord) => {
                if (isPassive) return; // Ignore validation in passive mode
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
            onInterimResult: (text) => {
                setCoachInterimText(text);

                // Hands-free command detection
                const lower = text.toLowerCase();

                // Allow vocal toggle even if handsFree is off (but mic must be on)
                if (COMMANDS.handsfree.some(c => lower.includes(c))) {
                    speechRecognitionService.abortCurrentSegment();
                    toggleHandsFreeMode();
                    if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
                    return;
                }

                if (isHandsFree) {
                    if (COMMANDS.next.some(c => lower.includes(c))) {
                        speechRecognitionService.abortCurrentSegment();
                        // Dispatch custom event for HifdhPage to handle
                        window.dispatchEvent(new CustomEvent('coach-command', { detail: 'next' }));
                        stopCoachListening();
                    } else if (COMMANDS.prev.some(c => lower.includes(c))) {
                        speechRecognitionService.abortCurrentSegment();
                        window.dispatchEvent(new CustomEvent('coach-command', { detail: 'prev' }));
                        stopCoachListening();
                    } else if (COMMANDS.repeat.some(c => lower.includes(c))) {
                        speechRecognitionService.abortCurrentSegment();
                        window.dispatchEvent(new CustomEvent('coach-command', { detail: 'repeat' }));
                        stopCoachListening();
                    } else if (COMMANDS.hint.some(c => lower.includes(c))) {
                        speechRecognitionService.abortCurrentSegment();
                        window.dispatchEvent(new CustomEvent('coach-command', { detail: 'hint' }));
                        // hint doesn't stop listening as it's a momentary help
                    } else if (COMMANDS.stop.some(c => lower.includes(c))) {
                        speechRecognitionService.abortCurrentSegment();
                        window.dispatchEvent(new CustomEvent('coach-command', { detail: 'stop' }));
                        stopCoachListening();
                    } else if (COMMANDS.listen.some(c => lower.includes(c))) {
                        speechRecognitionService.abortCurrentSegment();
                        window.dispatchEvent(new CustomEvent('coach-command', { detail: 'listen' }));
                        stopCoachListening();
                    }
                }
            },
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
    }, [ayahs, allCoachWords, resetCoach, playingIndex, startWhisperBackup, isHandsFree, COMMANDS]);

    // Stop listening
    const stopCoachListening = useCallback(() => {
        speechRecognitionService.stop();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
        setIsListening(false);
    }, []);

    // Toggle states
    const toggleCoachMode = useCallback(() => {
        if (isCoachMode) {
            stopCoachListening();
            resetCoach();
            setIsCoachMode(false);
        } else {
            setIsCoachMode(true);
        }
    }, [isCoachMode, stopCoachListening, resetCoach]);

    const toggleBlindMode = useCallback(() => setBlindMode(p => !p), []);
    const toggleMushafBlancMode = useCallback(() => setIsMushafBlanc(p => !p), []);
    const toggleDuoMode = useCallback(() => setIsDuoMode(p => !p), []);
    const toggleFlashcardMode = useCallback(() => setIsFlashcardMode(p => !p), []);
    const toggleHandsFreeMode = useCallback(() => setIsHandsFree(p => !p), []);

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

    // Check if a specific ayah is fully correct
    const isAyahComplete = useCallback((ayahIndex: number) => {
        const words = allCoachWords.filter(w => w.ayahIndex === ayahIndex);
        if (words.length === 0) return false;
        return words.every(w => wordStates.get(`${w.ayahIndex}-${w.wordIndex}`) === 'correct');
    }, [allCoachWords, wordStates]);

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
        blindMode,
        isMushafBlanc,
        isDuoMode,
        isFlashcardMode,
        isHandsFree,
        isPassiveMode,
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
        isAyahComplete,
        resetCoach,
        coachJumpToWord,
        startCoachListening,
        stopCoachListening,
        toggleCoachMode,
        toggleBlindMode,
        toggleMushafBlancMode,
        toggleDuoMode,
        toggleFlashcardMode,
        toggleHandsFreeMode,
    };
}
