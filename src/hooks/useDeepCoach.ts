/**
 * useDeepCoach — Hook for the AI-powered Exam Mode.
 * 
 * Manages a state machine: idle → recording → analyzing → results.
 * Completely independent of the real-time useCoach hook.
 * Audio blobs are released from memory after transcription.
 */

import { useState, useRef, useCallback } from 'react';
import { transcribeAudio, compareWithExpected, type ExamResult } from '../lib/deepSpeechService';
import { getSupportedMimeType } from '../lib/audioUnlock';

export type ExamState = 'idle' | 'recording' | 'analyzing' | 'results';

export interface UseDeepCoachReturn {
    examState: ExamState;
    examResult: ExamResult | null;
    examError: string | null;
    recordingDuration: number;
    startExamRecording: () => Promise<void>;
    stopExamRecording: (expectedText: string) => Promise<void>;
    clearExam: () => void;
}

export function useDeepCoach(): UseDeepCoachReturn {
    const [examState, setExamState] = useState<ExamState>('idle');
    const [examResult, setExamResult] = useState<ExamResult | null>(null);
    const [examError, setExamError] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        // Stop and release the media stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        // Release audio chunks
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
    }, []);

    const startExamRecording = useCallback(async () => {
        try {
            setExamError(null);
            setExamResult(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // Collect chunks every second

            startTimeRef.current = Date.now();
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

            setExamState('recording');
        } catch (err) {
            console.error('[DeepCoach] Microphone error:', err);
            setExamError('Impossible d\'accéder au microphone.');
            cleanup();
        }
    }, [cleanup]);

    const stopExamRecording = useCallback(async (expectedText: string) => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            return;
        }

        // Stop the recorder and wait for the final chunk
        const recorder = mediaRecorderRef.current;

        const audioBlob = await new Promise<Blob>((resolve) => {
            recorder.onstop = () => {
                const mimeType = getSupportedMimeType();
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                resolve(blob);
            };
            recorder.stop();
        });

        // Stop stream tracks and timer
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Transition to analyzing
        setExamState('analyzing');

        try {
            // Send to HuggingFace Whisper
            const transcription = await transcribeAudio(audioBlob);

            // Compare with expected text
            const result = compareWithExpected(transcription, expectedText);

            setExamResult(result);
            setExamState('results');
        } catch (err) {
            console.error('[DeepCoach] Analysis failed:', err);
            setExamError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse.');
            setExamState('idle');
        } finally {
            // Release the blob from memory
            audioChunksRef.current = [];
            mediaRecorderRef.current = null;
        }
    }, []);

    const clearExam = useCallback(() => {
        cleanup();
        setExamState('idle');
        setExamResult(null);
        setExamError(null);
        setRecordingDuration(0);
    }, [cleanup]);

    return {
        examState,
        examResult,
        examError,
        recordingDuration,
        startExamRecording,
        stopExamRecording,
        clearExam,
    };
}
