import { useId } from 'react';
import { useCompanionRuntimeStore } from '../stores/companionStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { speechRecognitionService, recognitionErrorMessage } from '../lib/speechRecognition';
import { recitationWords } from '../lib/recitationMatching';
import { coachTotals, persistCoachSession, COACH_REVIEW_EVENT, type CoachAssessments } from '../lib/coachSession';
import type { Ayah } from '../types';
import { tilawaService } from '../lib/tilawa/service';
import { useLearningStore } from '../stores/learningStore';
import type { RecognitionCallbacks } from '../lib/speechRecognition';

export type WordState = 'correct' | 'error' | 'current' | 'unread' | 'dismissed' | 'uncertain';
export type CoachMode = 'solo' | 'duo_echo' | 'link' | 'magic_reveal';
export type DuoPhase = 'reciter' | 'student' | 'waiting';
interface UseCoachOptions { ayahs: Ayah[]; scoreKey: string; playingIndex: number; continuous?: boolean }

export function useCoach({ ayahs, scoreKey, playingIndex, continuous = false }: UseCoachOptions) {
    const [isCoachMode, setIsCoachMode] = useState(false);
    const recognitionEngine = useLearningStore(state => state.engine);
    const [coachMode, setCoachMode] = useState<CoachMode | null>(null);
    const [duoPhase, setDuoPhase] = useState<DuoPhase | null>(null);
    const [blindMode, setBlindMode] = useState(false);
    const [assessments, setAssessments] = useState<CoachAssessments>({});
    const [currentWord, setCurrentWord] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const companionBusyId=useId();
    useEffect(()=>{useCompanionRuntimeStore.getState().setBusy(companionBusyId,isListening);return()=>useCompanionRuntimeStore.getState().setBusy(companionBusyId,false);},[companionBusyId,isListening]);
    const [isStarting, setIsStarting] = useState(false);
    const [coachError, setCoachError] = useState<string | null>(null);
    const [storageError, setStorageError] = useState(false);
    const [selectedError, setSelectedError] = useState<string | null>(null);
    const [showMistakesSummary, setShowMistakesSummary] = useState(false);
    const [coachInterimText, setCoachInterimText] = useState('');
    const [coachAtEnd, setCoachAtEnd] = useState(false);
    const [coachRevision, setCoachRevision] = useState(0);
    const [activeAyahIndex, setActiveAyahIndex] = useState(0);
    const sessionRef = useRef<CoachAssessments>({});
    const requestRef = useRef(0);
    const activeRef = useRef(false);
    const positionRef = useRef({ ayahIndex: 0, wordIndex: 0 });
    const modeRef = useRef<CoachMode | null>(null);

    const allCoachWords = useMemo(() => ayahs.flatMap((ayah, ayahIndex) =>
        recitationWords(ayah.text).map((text, wordIndex) => ({ text, ayahIndex, wordIndex }))), [ayahs]);
    const passageKey = ayahs.map(ayah => `${ayah.number}:${ayah.text}`).join('|');
    const totalWords = allCoachWords.length;

    const updateAssessments = useCallback((next: CoachAssessments) => {
        sessionRef.current = next;
        setAssessments(next);
    }, []);

    const saveSession = useCallback(() => {
        let saved = false;
        try { saved = persistCoachSession(localStorage, scoreKey, sessionRef.current, totalWords); } catch { /* Storage denied. */ }
        if (activeRef.current) setStorageError(!saved);
        if (saved) window.dispatchEvent(new Event(COACH_REVIEW_EVENT));
    }, [scoreKey, totalWords]);

    const stopCoachListening = useCallback(() => {
        ++requestRef.current;
        setIsListening(false);
        setIsStarting(false);
        setCoachAtEnd(false);
        saveSession();
        return Promise.all([speechRecognitionService.stop(), tilawaService.stop()]).then(() => undefined);
    }, [saveSession]);

    const resetCoach = useCallback(() => {
        saveSession();
        updateAssessments({});
        setCurrentWord(null);
        setCoachAtEnd(false);
        setCoachInterimText('');
        setCoachError(null);
        setSelectedError(null);
        setShowMistakesSummary(false);
    }, [saveSession, updateAssessments]);

    // End the old passage before accepting results for a new selection. Cleanup also
    // invalidates pending permission dialogs, so they cannot reopen a departed screen.
    useEffect(() => {
        activeRef.current = true;
        const pendingRequest = requestRef;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the UI when the externally owned recognition passage changes.
        updateAssessments({});
        setCurrentWord(null);
        setCoachAtEnd(false);
        setCoachInterimText('');
        setCoachError(null);
        setSelectedError(null);
        setShowMistakesSummary(false);
        setDuoPhase(modeRef.current ? 'waiting' : null);
        setIsListening(false);
        setIsStarting(false);
        positionRef.current = { ayahIndex: 0, wordIndex: 0 };
        const suspend = () => {
            if (document.hidden) { setCoachAtEnd(false); void stopCoachListening(); }
        };
        document.addEventListener('visibilitychange', suspend);
        return () => {
            activeRef.current = false;
            ++pendingRequest.current;
            saveSession();
            void speechRecognitionService.stop();
            void tilawaService.stop();
            document.removeEventListener('visibilitychange', suspend);
        };
    }, [scoreKey, passageKey, updateAssessments, saveSession, stopCoachListening]);

    const startCoachListening = useCallback(async (overrideAyahIndex?: number, wordIndex = 0) => {
        const ayahIndex = overrideAyahIndex ?? Math.max(0, playingIndex);
        const ayah = ayahs[ayahIndex];
        if (!ayah || !modeRef.current || !activeRef.current) return;
        const passage = continuous && (modeRef.current === 'solo' || modeRef.current === 'magic_reveal') ? ayahs.slice(ayahIndex) : [ayah];
        const positions = passage.flatMap((a, offset) => recitationWords(a.text).map((text, w) => ({text, ayahIndex: ayahIndex + offset, wordIndex:w})));
        const words = positions.map(p => p.text);
        const keyAt = (index:number) => `${positions[index].ayahIndex}-${positions[index].wordIndex}`;
        if (!words.length) return;
        const start = Math.max(0, Math.min(wordIndex, words.length - 1));
        const request = ++requestRef.current;
        setIsListening(false);
        setIsStarting(true);
        setCoachError(null);
        setCoachAtEnd(false);
        setCoachInterimText('');
        saveSession();
        await Promise.all([speechRecognitionService.stop(), tilawaService.stop()]);
        const current = () => activeRef.current && request === requestRef.current;
        if (!current()) return;
        // Only clear the retried part. Earlier verses remain in the session summary.
        const retained = { ...sessionRef.current };
        words.forEach((_, index) => { if (index >= start) delete retained[keyAt(index)]; });
        updateAssessments(retained);
        positionRef.current = { ayahIndex, wordIndex: start };
        setCurrentWord(keyAt(start));
        setActiveAyahIndex(ayahIndex);
        const callbacks: RecognitionCallbacks = {
            onWordMatch: (index, isCorrect, spoken) => {
                if (!current() || !words[index]) return;
                updateAssessments({ ...sessionRef.current, [keyAt(index)]: {
                    state: isCorrect ? 'correct' : spoken === '(non reconnu)' ? 'uncertain' : 'error', expected: words[index], spoken: spoken || '(non reconnu)',
                    revised: isCorrect && (sessionRef.current[keyAt(index)]?.state === 'error' || sessionRef.current[keyAt(index)]?.revised),
                } });
            },
            onUncertain: (index, message) => {
                if (!current() || !positions[index]) return;
                updateAssessments({...sessionRef.current, [keyAt(index)]: {state:'uncertain', expected:words[index], spoken:message}});
            },
            onWordReset: index => {
                if (!current() || !positions[index]) return;
                const next = { ...sessionRef.current };
                next[keyAt(index)] = { state: 'unread', expected: words[index], spoken: '' };
                updateAssessments(next);
            },
            onCurrentWord: index => {
                if (!current() || !Number.isInteger(index) || index < 0) return;
                const position = positions[Math.min(index, words.length - 1)];
                positionRef.current = { ayahIndex: position.ayahIndex, wordIndex: index >= words.length ? position.wordIndex + 1 : position.wordIndex };
                setActiveAyahIndex(position.ayahIndex);
                setCurrentWord(index < words.length ? keyAt(index) : null);
                setCoachAtEnd(index >= words.length);
                setCoachRevision(revision => revision + 1);
            },
            onInterimResult: text => { if (current()) setCoachInterimText(text); },
            onError: error => {
                if (!current()) return;
                setCoachError(recognitionEngine === 'tilawa' ? error : recognitionErrorMessage(error));
                setIsListening(false);
                setIsStarting(false);
                setCoachAtEnd(false);
            },
            onEnd: () => {
                if (!current()) return;
                setIsListening(false);
                setIsStarting(false);
                saveSession();
            },
        };
        const success = recognitionEngine === 'tilawa'
            ? continuous ? await tilawaService.startPassage(passage, callbacks, start) : await tilawaService.start(ayah.text, callbacks, start, { surah: ayah.surah, ayah: ayah.numberInSurah })
            : await speechRecognitionService.start(passage.map(a=>a.text).join(' '), callbacks, start);
        if (!current()) return;
        setIsStarting(false);
        setIsListening(success);
        if (!success) setCoachError(previous => previous || recognitionErrorMessage('unavailable'));
    }, [ayahs, playingIndex, saveSession, updateAssessments, recognitionEngine, continuous]);

    const resumeCoachListening = useCallback(() => {
        const position = positionRef.current;
        const words = recitationWords(ayahs[position.ayahIndex]?.text || '');
        return startCoachListening(position.ayahIndex, position.wordIndex < words.length ? position.wordIndex : 0);
    }, [ayahs, startCoachListening]);

    const coachJumpToWord = useCallback((ayahIndex: number, wordIndex: number) => {
        if (!modeRef.current) return;
        // Restart recognition at the new position; buffered old hypotheses are invalid.
        // No skipped word is counted as recognized.
        setDuoPhase('student');
        void startCoachListening(ayahIndex, wordIndex);
    }, [startCoachListening]);

    const selectCoachMode = useCallback((mode: CoachMode | null) => {
        void stopCoachListening();
        resetCoach();
        modeRef.current = mode;
        setIsCoachMode(mode !== null);
        setCoachMode(mode);
        setDuoPhase(mode ? 'waiting' : null);
        setBlindMode(mode === 'magic_reveal');
    }, [stopCoachListening, resetCoach]);

    const dismissCoachMistake = useCallback((key: string) => {
        const assessment = sessionRef.current[key];
        if (!assessment) return;
        updateAssessments({ ...sessionRef.current, [key]: { ...assessment, state: 'dismissed' } });
        saveSession();
        setSelectedError(null);
    }, [saveSession, updateAssessments]);

    // Persist partial sessions too, without requiring the entire selection to be recited.
    useEffect(() => {
        const timer = window.setTimeout(saveSession, 500);
        return () => window.clearTimeout(timer);
    }, [assessments, saveSession]);

    const wordStates = useMemo(() => {
        const states = new Map<string, WordState>(Object.entries(assessments).map(([key, result]) => [key, result.state]));
        if (currentWord && (!states.has(currentWord) || states.get(currentWord) === 'unread')) states.set(currentWord, 'current');
        return states;
    }, [assessments, currentWord]);
    const coachMistakes = useMemo(() => Object.fromEntries(Object.entries(assessments)
        .filter(([, result]) => result.state === 'error').map(([key, result]) => [key, { expected: result.expected, spoken: result.spoken }])), [assessments]);
    const totals = coachTotals(assessments);
    const verseWords = allCoachWords.filter(word => word.ayahIndex === playingIndex);
    const processedInVerse = verseWords.filter(word => {
        const state = assessments[`${word.ayahIndex}-${word.wordIndex}`]?.state;
        return state === 'correct' || state === 'error';
    }).length;

    return {
        isCoachMode, coachMode, duoPhase, blindMode, wordStates, isListening, isStarting, recognitionEngine,
        coachError, storageError, coachAtEnd, coachRevision, activeAyahIndex, assessments,
        coachUncertainCount: Object.values(assessments).filter(a=>a.state === 'uncertain').length,
        coachMistakes, coachMistakesCount: totals.mistakes, coachTotalProcessed: totals.processed,
        selectedError, setSelectedError, showMistakesSummary, setShowMistakesSummary,
        coachInterimText, allCoachWords, coachAccuracy: totals.accuracy,
        coachProgress: verseWords.length ? processedInVerse / verseWords.length : 0,
        resetCoach, coachJumpToWord, startCoachListening, resumeCoachListening, stopCoachListening,
        finishCoachListening: () => recognitionEngine === 'tilawa' && !isStarting ? tilawaService.finish() : stopCoachListening(),
        toggleCoachMode: () => selectCoachMode(isCoachMode ? null : 'solo'),
        toggleBlindMode: () => setBlindMode(previous => !previous),
        selectCoachMode, setDuoPhase, dismissCoachMistake,
    };
}
export type CoachState = ReturnType<typeof useCoach>;
