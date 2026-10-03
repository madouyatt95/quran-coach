import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { SpeechRecognitionService, type RecognitionCallbacks } from './speechRecognition';
import { alignRecitation, recitationWords } from './recitationMatching';

const native = vi.hoisted(() => ({
    enabled: false,
    available: vi.fn(), requestPermissions: vi.fn(), start: vi.fn(), stop: vi.fn(), addListener: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.enabled } }));
vi.mock('@capacitor-community/speech-recognition', () => ({ SpeechRecognition: native }));

class FakeRecognition {
    static instances: FakeRecognition[] = [];
    lang = ''; continuous = false; interimResults = false; maxAlternatives = 0;
    onresult: ((event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null = null;
    onerror: ((event: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;
    start = vi.fn(); abort = vi.fn();
    constructor() { FakeRecognition.instances.push(this); }
    emit(...segments: string[]) {
        this.onresult?.({ results: segments.map(transcript => ({ isFinal: false, 0: { transcript } })) });
    }
}
const callbacks = (): RecognitionCallbacks => ({
    onWordMatch: vi.fn(), onWordReset: vi.fn(), onCurrentWord: vi.fn(),
    onInterimResult: vi.fn(), onEnd: vi.fn(), onError: vi.fn(),
});
let service: SpeechRecognitionService;
beforeEach(() => {
    vi.clearAllMocks();
    native.enabled = false;
    native.available.mockResolvedValue({ available: true });
    native.requestPermissions.mockResolvedValue({ speechRecognition: 'granted' });
    native.start.mockResolvedValue({}); native.stop.mockResolvedValue(undefined);
    FakeRecognition.instances = [];
    service = new SpeechRecognitionService();
    vi.stubGlobal('window', { SpeechRecognition: FakeRecognition });
});
afterEach(async () => { await service.stop(); vi.unstubAllGlobals(); });

describe('cumulative speech recognition', () => {
    it('counts growing and repeated hypotheses once and retracts a revised suffix', async () => {
        const cb = callbacks();
        await service.start('قل هو الله أحد', cb);
        const recognizer = FakeRecognition.instances[0];
        recognizer.emit('قل');
        recognizer.emit('قل هو');
        recognizer.emit('قل هو');
        expect(cb.onWordMatch).toHaveBeenCalledTimes(2);
        expect(cb.onWordMatch).toHaveBeenNthCalledWith(2, 1, true, 'هو');
        recognizer.emit('قل');
        expect(cb.onWordReset).toHaveBeenCalledWith(1);
        expect(cb.onCurrentWord).toHaveBeenLastCalledWith(1);
    });
    it('consumes distinct web segments, including a legitimate repeated word', async () => {
        const cb = callbacks();
        await service.start('الله الله أحد', cb);
        FakeRecognition.instances[0].emit('الله');
        FakeRecognition.instances[0].emit('الله', 'الله أحد');
        expect(cb.onWordMatch).toHaveBeenCalledTimes(3);
        expect(cb.onCurrentWord).toHaveBeenLastCalledWith(3);
    });
    it('revises a misrecognized word instead of keeping an old error', async () => {
        const cb = callbacks();
        await service.start('قل هو الله أحد', cb);
        FakeRecognition.instances[0].emit('قل هي');
        FakeRecognition.instances[0].emit('قل هو');
        expect(cb.onWordMatch).toHaveBeenLastCalledWith(1, true, 'هو');
        expect(cb.onCurrentWord).toHaveBeenLastCalledWith(2);
    });
    it('ignores an old recognizer after another verse starts', async () => {
        const old = callbacks(); const next = callbacks();
        await service.start('قل هو الله أحد', old);
        const recognizer = FakeRecognition.instances[0];
        const lateResult = recognizer.onresult!; const lateEnd = recognizer.onend!;
        await service.start('الله الصمد', next);
        lateResult({ results: [{ isFinal: true, 0: { transcript: 'قل هو الله أحد' } }] });
        lateEnd();
        expect(old.onWordMatch).not.toHaveBeenCalled();
        expect(old.onEnd).not.toHaveBeenCalled();
        FakeRecognition.instances[1].emit('الله الصمد');
        expect(next.onWordMatch).toHaveBeenCalledTimes(2);
        expect(recognizer.abort).toHaveBeenCalledOnce();
    });
    it('stops on errors and reports unsupported environments explicitly', async () => {
        const cb = callbacks();
        await service.start('قل', cb);
        FakeRecognition.instances[0].onerror?.({ error: 'network' });
        expect(cb.onError).toHaveBeenCalledWith('network');
        expect(cb.onEnd).toHaveBeenCalledOnce();
        await service.stop();
        vi.stubGlobal('window', {});
        expect(await service.start('قل', cb)).toBe(false);
        expect(cb.onError).toHaveBeenLastCalledWith('unsupported');
    });
});

describe('native lifecycle', () => {
    it('does not start the microphone if cancelled while permission is pending', async () => {
        native.enabled = true;
        let resolvePermission!: (value: { speechRecognition: string }) => void;
        native.requestPermissions.mockImplementation(() => new Promise(resolve => { resolvePermission = resolve; }));
        const pending = service.start('قل', callbacks());
        await vi.waitFor(() => expect(native.requestPermissions).toHaveBeenCalled());
        const stopped = service.stop();
        resolvePermission({ speechRecognition: 'granted' });
        expect(await pending).toBe(false);
        await stopped;
        expect(native.start).not.toHaveBeenCalled();
        expect(native.addListener).not.toHaveBeenCalled();
    });
    it('handles cumulative native partials and removes both listeners on stop', async () => {
        native.enabled = true;
        const listeners: Record<string, (value: unknown) => void> = {};
        const remove = vi.fn().mockResolvedValue(undefined);
        native.addListener.mockImplementation(async (name: string, handler: (value: unknown) => void) => {
            listeners[name] = handler;
            return { remove };
        });
        const cb = callbacks();
        await service.start('قل هو الله أحد', cb);
        listeners.partialResults({ matches: ['قل'] });
        listeners.partialResults({ matches: ['قل هو'] });
        expect(cb.onWordMatch).toHaveBeenCalledTimes(2);
        listeners.listeningState({ status: 'stopped' });
        await service.stop();
        listeners.partialResults({ matches: ['قل هو الله أحد'] });
        expect(cb.onWordMatch).toHaveBeenCalledTimes(2);
        expect(remove).toHaveBeenCalledTimes(2);
        expect(native.stop).toHaveBeenCalledOnce();
        expect(cb.onEnd).toHaveBeenCalledOnce();
    });
});

describe('Quran text matching', () => {
    it('does not count verse numbers or stop signs as spoken words', () => {
        expect(recitationWords('قُلْ ۞ هُوَ ٱللَّهُ أَحَدٌ ۝١')).toHaveLength(4);
        expect(alignRecitation(recitationWords('قُلْ هُوَ ٱللَّهُ أَحَدٌ'), 'قل هو الله أحد').cursor).toBe(4);
    });
    it('does not turn different short words into a correct match', () => {
        expect(alignRecitation(['من'], 'ما').matches.get(0)?.isCorrect).toBe(false);
    });
    it('prefers an exact following word over a fuzzy preceding word', () => {
        const result = alignRecitation(['الرحمن', 'الرحيم'], 'الرحيم');
        expect(result.matches.get(0)?.isCorrect).toBe(false);
        expect(result.matches.get(1)?.isCorrect).toBe(true);
    });
});
