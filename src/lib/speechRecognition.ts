import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import type { SpeechRecognitionPlugin } from '@capacitor-community/speech-recognition';
import { alignRecitation, recitationWords, type RecognizedWord } from './recitationMatching';

export interface RecognitionCallbacks {
    onWordMatch: (wordIndex: number, isCorrect: boolean, spokenWord?: string) => void;
    onWordReset?: (wordIndex: number) => void;
    onInterimResult: (text: string) => void;
    onCurrentWord: (wordIndex: number) => void;
    onError: (error: string) => void;
    onEnd: () => void;
}

interface WebResult { isFinal: boolean; 0: { transcript: string } }
interface WebRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: { results: ArrayLike<WebResult> }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start(): void;
    abort(): void;
}
interface SpeechWindow extends Window {
    SpeechRecognition?: new () => WebRecognition;
    webkitSpeechRecognition?: new () => WebRecognition;
}

export function recognitionErrorMessage(error: string): string {
    switch (error) {
        case 'not-allowed':
        case 'service-not-allowed': return 'Autorisez le microphone et la reconnaissance vocale dans les réglages, puis réessayez.';
        case 'audio-capture': return 'Le microphone est indisponible. Fermez les autres applications qui l’utilisent, puis réessayez.';
        case 'network': return 'La reconnaissance vocale nécessite une connexion disponible. Vérifiez votre réseau, puis réessayez.';
        case 'unsupported': return 'La reconnaissance vocale n’est pas disponible ici. Essayez un navigateur compatible ou l’application iOS.';
        case 'no-speech': return 'Aucune parole détectée. Rapprochez-vous du microphone et reprenez l’écoute.';
        default: return 'L’écoute a été interrompue. Vous pouvez la reprendre depuis le dernier mot.';
    }
}

/** One owner at a time. Generation guards also cover delayed permissions and old callbacks. */
export class SpeechRecognitionService {
    private recognition: WebRecognition | null = null;
    private native: SpeechRecognitionPlugin | null = null;
    private handles: PluginListenerHandle[] = [];
    private generation = 0;
    private queue: Promise<unknown> = Promise.resolve();

    isSupported(): boolean {
        if (Capacitor.isNativePlatform()) return true;
        const host = typeof window === 'undefined' ? undefined : window as SpeechWindow;
        return !!(host?.SpeechRecognition || host?.webkitSpeechRecognition);
    }

    private serialize<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.queue.then(operation, operation);
        this.queue = result.catch(() => undefined);
        return result;
    }

    private async release(): Promise<void> {
        const recognition = this.recognition;
        this.recognition = null;
        if (recognition) {
            recognition.onresult = recognition.onerror = recognition.onend = null;
            try { recognition.abort(); } catch { /* Already stopped. */ }
        }
        const handles = this.handles.splice(0);
        await Promise.allSettled(handles.map(handle => handle.remove()));
        const native = this.native;
        this.native = null;
        if (native) {
            try { await native.stop(); } catch { /* Already stopped or unavailable. */ }
        }
    }

    async start(expectedText: string, callbacks: RecognitionCallbacks, startIndex = 0): Promise<boolean> {
        const generation = ++this.generation;
        return this.serialize(async () => {
            await this.release();
            if (generation !== this.generation) return false;
            const words = recitationWords(expectedText);
            if (!words.length) return false;
            let previous = new Map<number, RecognizedWord>();
            let lastTranscript: string | null = null;
            let ended = false;
            const current = () => generation === this.generation && !ended;
            const receive = (transcript: string) => {
                if (!current() || transcript === lastTranscript) return;
                lastTranscript = transcript;
                const next = alignRecitation(words, transcript, startIndex);
                for (const index of previous.keys()) {
                    if (!next.matches.has(index)) callbacks.onWordReset?.(index);
                }
                for (const [index, match] of next.matches) {
                    const old = previous.get(index);
                    if (!old || old.isCorrect !== match.isCorrect || old.spoken !== match.spoken) {
                        callbacks.onWordMatch(index, match.isCorrect, match.spoken);
                    }
                }
                previous = next.matches;
                callbacks.onInterimResult(transcript);
                callbacks.onCurrentWord(next.cursor);
            };
            const finish = () => {
                if (!current()) return;
                ended = true;
                callbacks.onEnd();
                void this.stop();
            };
            const fail = (error: string) => {
                if (!current()) return;
                callbacks.onError(error);
                finish();
            };

            try {
                if (Capacitor.isNativePlatform()) {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    if (!current()) return false;
                    if (!(await SpeechRecognition.available()).available) {
                        fail('unsupported');
                        return false;
                    }
                    const permission = await SpeechRecognition.requestPermissions();
                    if (!current()) return false;
                    if (permission.speechRecognition !== 'granted') {
                        fail('not-allowed');
                        return false;
                    }
                    this.native = SpeechRecognition;
                    this.handles.push(await SpeechRecognition.addListener('partialResults', data => receive(data.matches[0] ?? '')));
                    this.handles.push(await SpeechRecognition.addListener('listeningState', data => {
                        if (data.status === 'stopped') finish();
                    }));
                    if (current()) await SpeechRecognition.start({ language: 'ar-SA', partialResults: true, popup: false });
                } else {
                    const host = window as SpeechWindow;
                    const Constructor = host.SpeechRecognition || host.webkitSpeechRecognition;
                    if (!Constructor) {
                        fail('unsupported');
                        return false;
                    }
                    const recognition = new Constructor();
                    this.recognition = recognition;
                    recognition.lang = 'ar-SA';
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.maxAlternatives = 1;
                    // Results contain all finalized segments plus the current, revisable hypothesis.
                    recognition.onresult = event => receive(Array.from(event.results, result => result[0].transcript).join(' '));
                    recognition.onerror = event => fail(event.error);
                    recognition.onend = finish;
                    recognition.start();
                }
                if (!current()) { await this.release(); return false; }
                if (lastTranscript === null) callbacks.onCurrentWord(startIndex);
                return true;
            } catch {
                fail('unavailable');
                await this.release();
                return false;
            }
        });
    }

    stop(): Promise<void> {
        ++this.generation; // Invalidate callbacks immediately, before awaiting native cleanup.
        return this.serialize(() => this.release());
    }
}

export const speechRecognitionService = new SpeechRecognitionService();
