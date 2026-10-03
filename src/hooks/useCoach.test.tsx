// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useCoach, type CoachState } from './useCoach';
import { createMemoryStorage } from '../test/memoryStorage';
import type { RecognitionCallbacks } from '../lib/speechRecognition';
import type { Ayah } from '../types';

const recognizer = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock('../lib/speechRecognition', () => ({ speechRecognitionService: recognizer, recognitionErrorMessage: (error: string) => error }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const ayahs: Ayah[] = [
    { number: 6222, numberInSurah: 1, surah: 112, text: 'قل هو الله أحد', juz: 30, page: 604, hizbQuarter: 240 },
    { number: 6223, numberInSurah: 2, surah: 112, text: 'الله الصمد', juz: 30, page: 604, hizbQuarter: 240 },
];
let coach: CoachState;
let root: Root;
let container: HTMLDivElement;
let options: Parameters<typeof useCoach>[0];
function Harness() {
    const value = useCoach(options);
    useLayoutEffect(() => { coach = value; });
    return null;
}
function latest(): RecognitionCallbacks { return recognizer.start.mock.calls.at(-1)![1] as RecognitionCallbacks; }
async function render() { await act(async () => root.render(<Harness />)); }
beforeEach(async () => {
    vi.stubGlobal('localStorage', createMemoryStorage()); vi.clearAllMocks();
    recognizer.start.mockResolvedValue(true); recognizer.stop.mockResolvedValue(undefined);
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    options = { ayahs, scoreKey: '112:1-2', playingIndex: 0 };
    await render();
    await act(async () => coach.selectCoachMode('solo'));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('coach sessions', () => {
    it('keeps previous verses, saves partial sessions and resolves a successful retry', async () => {
        await act(async () => coach.startCoachListening(0));
        await act(async () => {
            latest().onWordMatch(0, true, 'قل');
            latest().onWordMatch(1, false, 'هي');
        });
        await act(async () => coach.startCoachListening(1));
        expect(coach.coachTotalProcessed).toBe(2);
        await act(async () => latest().onWordMatch(0, true, 'الله'));
        await act(async () => coach.stopCoachListening());
        expect(coach.coachTotalProcessed).toBe(3);
        expect(coach.coachMistakesCount).toBe(1);
        const score = JSON.parse(localStorage.getItem('quran-coach-scores')!)['112:1-2'];
        expect(score).toMatchObject({ processed: 3, totalWords: 6, complete: false, accuracy: 67 });
        expect(JSON.parse(localStorage.getItem('hifdh-error-log')!)).toHaveLength(1);
        await act(async () => coach.startCoachListening(0));
        await act(async () => { latest().onWordMatch(0, true, 'قل'); latest().onWordMatch(1, true, 'هو'); });
        await act(async () => coach.stopCoachListening());
        expect(coach.coachMistakesCount).toBe(0);
        expect(JSON.parse(localStorage.getItem('hifdh-error-log')!)).toHaveLength(0);
        expect(coach.wordStates.get('1-0')).toBe('correct');
    });
    it('never validates unread words when the user jumps forward', async () => {
        await act(async () => coach.coachJumpToWord(0, 2));
        expect(recognizer.start).toHaveBeenLastCalledWith(ayahs[0].text, expect.any(Object), 2);
        expect(coach.coachTotalProcessed).toBe(0);
        expect(coach.wordStates.get('0-0')).toBeUndefined();
        expect(coach.wordStates.get('0-1')).toBeUndefined();
        await act(async () => { latest().onWordMatch(2, true, 'الله'); latest().onCurrentWord(3); });
        expect(coach.coachTotalProcessed).toBe(1);
        expect(coach.coachProgress).toBe(0.25);
    });
    it('updates rather than double-counting revised results, including retracted errors', async () => {
        await act(async () => coach.startCoachListening(0));
        await act(async () => latest().onWordMatch(0, false, 'خطأ'));
        await act(async () => latest().onWordMatch(0, true, 'قل'));
        expect(coach.coachTotalProcessed).toBe(1);
        expect(coach.coachMistakesCount).toBe(0);
        await act(async () => latest().onWordMatch(1, false, 'هي'));
        await act(async () => coach.stopCoachListening());
        // A fresh attempt with a revised/shorter partial retracts its error.
        await act(async () => coach.startCoachListening(0));
        await act(async () => { latest().onWordMatch(1, false, 'هي'); latest().onWordReset?.(1); });
        await act(async () => coach.stopCoachListening());
        expect(JSON.parse(localStorage.getItem('hifdh-error-log')!)).toEqual([]);
    });
    it('ignores late recognition callbacks after pause and saves immediately', async () => {
        await act(async () => coach.startCoachListening(0));
        const stale = latest();
        await act(async () => stale.onWordMatch(0, true, 'قل'));
        await act(async () => coach.stopCoachListening());
        await act(async () => stale.onWordMatch(1, false, 'هي'));
        expect(coach.isListening).toBe(false);
        expect(coach.coachTotalProcessed).toBe(1);
        expect(coach.coachMistakesCount).toBe(0);
        expect(JSON.parse(localStorage.getItem('quran-coach-scores')!)['112:1-2'].processed).toBe(1);
    });
    it('does not reopen a cancelled microphone request', async () => {
        let resolveStart!: (value: boolean) => void;
        recognizer.start.mockImplementation(() => new Promise(resolve => { resolveStart = resolve; }));
        let pending!: Promise<void>;
        await act(async () => { pending = coach.startCoachListening(0); });
        expect(coach.isStarting).toBe(true);
        await act(async () => coach.selectCoachMode(null));
        await act(async () => { resolveStart(true); await pending; });
        expect(coach.isListening).toBe(false);
        expect(coach.isCoachMode).toBe(false);
    });
    it('keeps the old results under the old selection when the passage changes', async () => {
        await act(async () => coach.startCoachListening(0));
        const stale = latest();
        await act(async () => stale.onWordMatch(0, false, 'خطأ'));
        options = { ayahs: [ayahs[1]], scoreKey: '112:2-2', playingIndex: 0 };
        await render();
        await act(async () => stale.onWordMatch(1, false, 'هي'));
        expect(coach.coachTotalProcessed).toBe(0);
        expect(coach.isListening).toBe(false);
        const scores = JSON.parse(localStorage.getItem('quran-coach-scores')!);
        expect(scores['112:1-2'].processed).toBe(1);
        expect(scores['112:2-2']).toBeUndefined();
        expect(JSON.parse(localStorage.getItem('hifdh-error-log')!)[0].scoreKey).toBe('112:1-2');
    });
    it('dismisses a doubtful signal without grading it correct', async () => {
        await act(async () => coach.startCoachListening(0));
        await act(async () => { latest().onWordMatch(0, true, 'قل'); latest().onWordMatch(1, false, 'هي'); });
        await act(async () => coach.dismissCoachMistake('0-1'));
        expect(coach.wordStates.get('0-1')).toBe('dismissed');
        expect(coach.coachMistakesCount).toBe(0);
        expect(coach.coachTotalProcessed).toBe(1);
    });
    it('saves and stops the recognizer on unmount', async () => {
        await act(async () => coach.startCoachListening(0));
        const stale = latest();
        await act(async () => stale.onWordMatch(0, false, 'خطأ'));
        await act(async () => root.render(null));
        expect(recognizer.stop).toHaveBeenCalled();
        expect(JSON.parse(localStorage.getItem('hifdh-error-log')!)).toHaveLength(1);
        stale.onWordMatch(1, false, 'هي');
        expect(JSON.parse(localStorage.getItem('hifdh-error-log')!)).toHaveLength(1);
    });
});
