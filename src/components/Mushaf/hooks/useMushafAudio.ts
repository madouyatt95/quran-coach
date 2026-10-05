import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAudioUrl } from '../../../lib/quranApi';
import { fetchWordTimings, type VerseWords } from '../../../lib/wordTimings';
import type { Ayah } from '../../../types';

interface UseMushafAudioOptions {
    selectedReciter: string;
    pageAyahs: Ayah[];
    currentPage: number;
    nextPage: () => void;
    nextSurah: () => void;
}

export interface AudioPassage {
    surah: number;
    startAyah: number;
    endAyah: number;
    repetitions: number;
    iteration: number;
}

export interface MushafAudioState {
    passage: AudioPassage | null;
    passageComplete: boolean;
    audioError: string | null;
    startPassage: (startAyah: number, endAyah: number, repetitions: number) => boolean;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    audioActive: boolean;
    audioPlaying: boolean;
    currentPlayingAyah: number;
    playingIndex: number;
    playbackSpeed: number;
    setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>;
    verseWordsMap: Map<string, VerseWords>;
    setVerseWordsMap: React.Dispatch<React.SetStateAction<Map<string, VerseWords>>>;
    activeWordIndex: number;
    setActiveWordIndex: React.Dispatch<React.SetStateAction<number>>;
    playAyahAtIndex: (idx: number) => Promise<void>;
    playNextAyah: () => void;
    playPrevAyah: () => void;
    stopAudio: () => void;
    toggleAudio: () => void;
    handleWordClick: (ayahIndex: number, wordIndex: number) => Promise<void>;
    // Refs for stale-closure avoidance
    pageAyahsRef: React.MutableRefObject<Ayah[]>;
    playingIndexRef: React.MutableRefObject<number>;
    currentSurahRef: React.MutableRefObject<number>;
    currentAyahRef: React.MutableRefObject<number>;
}

export function useMushafAudio({
    selectedReciter,
    pageAyahs,
    currentPage,
    nextSurah,
}: UseMushafAudioOptions): MushafAudioState {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioActive, setAudioActive] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(0);
    const [playingIndex, setPlayingIndex] = useState(-1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const shouldAutoPlay = useRef(false);
    const expectedSurah = useRef<number | null>(null);
    const [passage, setPassage] = useState<AudioPassage | null>(null);
    const passageRef = useRef<AudioPassage | null>(null);
    const [passageComplete, setPassageComplete] = useState(false);
    const passageCompleteRef = useRef(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const playRequest = useRef(0);
    const mounted = useRef(true);

    // Timing state for word-by-word
    const [verseWordsMap, setVerseWordsMap] = useState<Map<string, VerseWords>>(new Map());
    const [activeWordIndex, setActiveWordIndex] = useState(-1);

    // Refs to avoid stale closures in audio callbacks
    const currentSurahRef = useRef(0);
    const currentAyahRef = useRef(0);
    const playingIndexRef = useRef(-1);
    const pageAyahsRef = useRef<Ayah[]>([]);
    const currentPageRef = useRef(currentPage);

    // Background/visibility tracking
    const location = useLocation();
    const wasPlayingRef = useRef(false);
    const isHiddenRef = useRef(false);
    const pendingAutoAdvance = useRef(false);

    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    // Auto-pause when leaving /read, resume when returning
    useEffect(() => {
        const isActive = location.pathname === '/read';
        if (!isActive) {
            if (audioPlaying) {
                wasPlayingRef.current = true;
                audioRef.current?.pause();
                setAudioPlaying(false);
            }
        } else {
            if (wasPlayingRef.current) {
                wasPlayingRef.current = false;
                audioRef.current?.play().catch(() => { });
                setAudioPlaying(true);
            }
        }
    }, [location.pathname, audioPlaying]);

    // Sync refs synchronously
    currentPageRef.current = currentPage;
    pageAyahsRef.current = pageAyahs;

    // Play a specific ayah by index
    const playAyahAtIndex = useCallback(async (idx: number, keepPassage = false) => {
        const ayahs = pageAyahsRef.current;
        if (!ayahs[idx] || !audioRef.current) return;

        if (!keepPassage) {passageRef.current = null; setPassage(null);}
        passageCompleteRef.current = false;
        setPassageComplete(false);
        setAudioError(null);
        const request = ++playRequest.current;
        playingIndexRef.current = idx;
        setAudioActive(true);
        setAudioPlaying(true);
        const ayah = ayahs[idx];
        setPlayingIndex(idx);
        setCurrentPlayingAyah(ayah.number);
        currentSurahRef.current = ayah.surah;
        currentAyahRef.current = ayah.numberInSurah;

        // Fetch word timing for this ayah (if not already in map)
        setActiveWordIndex(-1);
        const key = `${ayah.surah}:${ayah.numberInSurah}`;
        if (!verseWordsMap.has(key)) {
            fetchWordTimings(ayah.surah, ayah.numberInSurah).then(vw => {
                if (vw && mounted.current) setVerseWordsMap(prev => new Map(prev).set(key, vw));
            }).catch(() => {});
        }

        audioRef.current.src = getAudioUrl(selectedReciter, ayah.number);
        audioRef.current.playbackRate = playbackSpeed;
        try { await audioRef.current.play(); }
        catch { if (mounted.current && request === playRequest.current) {setAudioPlaying(false);setAudioError('Écoute indisponible. Réessayez.');} }
    }, [selectedReciter, playbackSpeed, verseWordsMap]);

    const startPassage = useCallback((startAyah: number, endAyah: number, repetitions: number) => {
        const ayahs = pageAyahsRef.current;
        if (![startAyah,endAyah,repetitions].every(Number.isInteger) || startAyah < 1 || endAyah < startAyah || repetitions < 1 || repetitions > 20) return false;
        const first = ayahs.findIndex(a => a.numberInSurah === startAyah);
        const selected = ayahs.slice(first, first + endAyah - startAyah + 1);
        if (first < 0 || selected.length !== endAyah-startAyah+1 || !selected.every((a,i)=>a.surah === ayahs[first].surah && a.numberInSurah === startAyah+i)) return false;
        const value = {surah:ayahs[first].surah,startAyah,endAyah,repetitions,iteration:1};
        passageRef.current = value;setPassage(value);
        shouldAutoPlay.current = false;
        void playAyahAtIndex(first, true);
        return true;
    }, [playAyahAtIndex]);

    // Play next ayah or advance surah
    const playNextAyah = useCallback(() => {
        const idx = playingIndexRef.current;
        if (idx < 0) return;
        const ayahs = pageAyahsRef.current;
        const surahNum = currentSurahRef.current;
        const range = passageRef.current;
        if (range) {
            if (passageCompleteRef.current) return;
            const ayah = ayahs[idx];
            if (!ayah || ayah.surah !== range.surah) return;
            if (ayah.numberInSurah >= range.endAyah) {
                if (range.iteration < range.repetitions) {
                    const next = {...range,iteration:range.iteration+1};
                    passageRef.current = next;setPassage(next);
                    void playAyahAtIndex(ayahs.findIndex(a=>a.surah===range.surah && a.numberInSurah===range.startAyah), true);
                } else {
                    passageCompleteRef.current = true;setPassageComplete(true);
                    audioRef.current?.pause();setAudioPlaying(false);setActiveWordIndex(-1);
                }
            } else void playAyahAtIndex(idx + 1, true);
            return;
        }

        if (idx < ayahs.length - 1) {
            playAyahAtIndex(idx + 1);
        } else if (surahNum < 114) {
            shouldAutoPlay.current = true;
            expectedSurah.current = surahNum + 1;
            nextSurah();
        } else {
            setAudioPlaying(false);
            setAudioActive(false);
            setPlayingIndex(-1);
            setCurrentPlayingAyah(0);
        }
    }, [playAyahAtIndex, nextSurah]);

    // Play previous ayah
    const playPrevAyah = useCallback(() => {
        const range = passageRef.current;
        const previous = pageAyahsRef.current[playingIndexRef.current - 1];
        if (playingIndexRef.current > 0 && (!range || (previous?.surah === range.surah && previous.numberInSurah >= range.startAyah))) {
            void playAyahAtIndex(playingIndexRef.current - 1, true);
        }
    }, [playAyahAtIndex]);

    // Stop audio
    const stopAudio = useCallback(() => {
        playRequest.current++;
        passageRef.current = null;setPassage(null);
        passageCompleteRef.current = false;setPassageComplete(false);
        setAudioError(null);setActiveWordIndex(-1);
        playingIndexRef.current = -1;
        expectedSurah.current = null;
        wasPlayingRef.current = false;
        shouldAutoPlay.current = false;
        pendingAutoAdvance.current = false;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setAudioActive(false);
        setAudioPlaying(false);
        setPlayingIndex(-1);
        setCurrentPlayingAyah(0);
    }, []);

    useEffect(() => {
        window.addEventListener('quran-stop-playback', stopAudio);
        return () => window.removeEventListener('quran-stop-playback', stopAudio);
    }, [stopAudio]);

    // Resume the same media position; a completed selection restarts its first round.
    const toggleAudio = useCallback(() => {
        const element = audioRef.current;
        if (!pageAyahsRef.current.length || !element) return;
        if (audioPlaying) {playRequest.current++;element.pause();setAudioPlaying(false);return;}
        const range = passageRef.current;
        if (range && passageCompleteRef.current) {startPassage(range.startAyah,range.endAyah,range.repetitions);return;}
        if (playingIndexRef.current < 0 || !element.src) {void playAyahAtIndex(0);return;}
        setAudioError(null);setAudioPlaying(true);setAudioActive(true);
        const request = ++playRequest.current;
        void element.play().catch(()=>{if(mounted.current && request === playRequest.current){setAudioPlaying(false);setAudioError('Écoute indisponible. Réessayez.');}});
    }, [audioPlaying, playAyahAtIndex, startPassage]);

    useEffect(() => {if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;}, [playbackSpeed]);
    useEffect(() => {
        mounted.current = true;
        const element = audioRef.current;
        const error = () => {setAudioPlaying(false);setAudioError('Écoute indisponible. Réessayez.');};
        element?.addEventListener('error',error);
        return () => {mounted.current=false;playRequest.current++;element?.pause();element?.removeEventListener('error',error);};
    }, []);

    // Handle audio 'ended' event
    const playNextAyahRef = useRef(playNextAyah);
    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        const handleEnded = () => playNextAyahRef.current();
        audio.addEventListener('ended', handleEnded);
        return () => { audio.removeEventListener('ended', handleEnded); };
    }, []);

    // High-precision word synchronization (RAF loop)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let rafId: number | null = null;

        const checkSync = () => {
            if (!audio || audio.paused) {
                rafId = null;
                return;
            }

            const timeMs = audio.currentTime * 1000;
            const key = `${currentSurahRef.current}:${currentAyahRef.current}`;
            const vw = verseWordsMap.get(key);

            if (vw) {
                const index = vw.words.findIndex(w => timeMs >= w.timestampFrom && timeMs <= w.timestampTo);
                if (index !== -1) setActiveWordIndex(index);
            }

            rafId = requestAnimationFrame(checkSync);
        };

        const onPlay = () => {
            if (!rafId) rafId = requestAnimationFrame(checkSync);
        };

        const onPause = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        if (!audio.paused) onPlay();

        return () => {
            onPause();
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, [verseWordsMap]);

    // Auto-resume after page change
    useEffect(() => {
        if (shouldAutoPlay.current && pageAyahs[0]?.surah === expectedSurah.current && audioActive) {
            shouldAutoPlay.current = false;
            expectedSurah.current = null;
            void playAyahAtIndex(0);
        } else if (passageRef.current && pageAyahs.length && pageAyahs[0].surah !== passageRef.current.surah) {
            stopAudio();
        }
    }, [pageAyahs, audioActive, playAyahAtIndex, stopAudio]);

    // Auto-scroll to current ayah
    useEffect(() => {
        if (currentPlayingAyah && audioPlaying) {
            const ayah = pageAyahsRef.current[playingIndexRef.current];
            if (ayah) {
                const el = document.querySelector(`[data-surah="${ayah.surah}"][data-ayah="${ayah.numberInSurah}"]`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [currentPlayingAyah, audioPlaying]);

    // Visibility change handler - preserve audio in background
    useEffect(() => {
        const handleVisibilityChange = () => {
            isHiddenRef.current = document.hidden;
            if (!document.hidden && pendingAutoAdvance.current) {
                pendingAutoAdvance.current = false;
                shouldAutoPlay.current = true;
                nextSurah();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [nextSurah]);

    // Resolve word timing once, and ignore it if the user has moved on.
    const handleWordClick = useCallback(async (ayahIndex: number, wordIndex: number) => {
        const ayah = pageAyahsRef.current[ayahIndex];
        if (!ayah || !audioRef.current) return;
        const playback = currentPlayingAyah !== ayah.number || !audioActive ? playAyahAtIndex(ayahIndex) : Promise.resolve();
        const request = playRequest.current;
        await playback;
        if (request !== playRequest.current || playingIndexRef.current !== ayahIndex) return;
        const key = `${ayah.surah}:${ayah.numberInSurah}`;
        const timings = verseWordsMap.get(key) ?? await fetchWordTimings(ayah.surah,ayah.numberInSurah).catch(()=>null);
        if (!mounted.current || request !== playRequest.current || currentSurahRef.current !== ayah.surah || currentAyahRef.current !== ayah.numberInSurah) return;
        const word = timings?.words[wordIndex];
        if (word && audioRef.current) {audioRef.current.currentTime = word.timestampFrom/1000;setActiveWordIndex(wordIndex);}
    }, [currentPlayingAyah, audioActive, verseWordsMap, playAyahAtIndex]);

    return {
        passage,
        passageComplete,
        audioError,
        startPassage,
        audioRef,
        audioActive,
        audioPlaying,
        currentPlayingAyah,
        playingIndex,
        playbackSpeed,
        setPlaybackSpeed,
        verseWordsMap,
        setVerseWordsMap,
        activeWordIndex,
        setActiveWordIndex,
        playAyahAtIndex,
        playNextAyah,
        playPrevAyah,
        stopAudio,
        toggleAudio,
        handleWordClick,
        pageAyahsRef,
        playingIndexRef,
        currentSurahRef,
        currentAyahRef,
    };
}
