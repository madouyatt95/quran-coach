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

export interface MushafAudioState {
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
    const playAyahAtIndex = useCallback(async (idx: number) => {
        const ayahs = pageAyahsRef.current;
        if (!ayahs[idx] || !audioRef.current) return;

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
                if (vw) setVerseWordsMap(prev => new Map(prev).set(key, vw));
            });
        }

        audioRef.current.src = getAudioUrl(selectedReciter, ayah.number);
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => { });
    }, [selectedReciter, playbackSpeed, verseWordsMap]);

    // Play next ayah or advance surah
    const playNextAyah = useCallback(() => {
        const idx = playingIndexRef.current;
        const ayahs = pageAyahsRef.current;
        const surahNum = currentSurahRef.current;

        if (idx < ayahs.length - 1) {
            playAyahAtIndex(idx + 1);
        } else if (surahNum < 114) {
            shouldAutoPlay.current = true;
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
        if (playingIndexRef.current > 0) {
            playAyahAtIndex(playingIndexRef.current - 1);
        }
    }, [playAyahAtIndex]);

    // Stop audio
    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setAudioActive(false);
        setAudioPlaying(false);
        setPlayingIndex(-1);
        setCurrentPlayingAyah(0);
    }, []);

    // Toggle play/pause
    const toggleAudio = useCallback(() => {
        if (pageAyahsRef.current.length === 0 || !audioRef.current) return;

        if (audioPlaying) {
            audioRef.current.pause();
            setAudioPlaying(false);
        } else {
            setAudioPlaying(true);
            setAudioActive(true);
            const startIdx = playingIndexRef.current >= 0 ? playingIndexRef.current : 0;
            playAyahAtIndex(startIdx);
        }
    }, [audioPlaying, playAyahAtIndex]);

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
        if (shouldAutoPlay.current && pageAyahs.length > 0 && audioActive) {
            shouldAutoPlay.current = false;
            playAyahAtIndex(0);
        }
    }, [pageAyahs, audioActive, playAyahAtIndex]);

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

    // Seek to a specific word in an ayah
    const handleWordClick = useCallback(async (ayahIndex: number, wordIndex: number) => {
        const ayahs = pageAyahsRef.current;
        const ayah = ayahs[ayahIndex];
        if (!ayah || !audioRef.current) return;

        const seek = (vw?: VerseWords) => {
            if (vw && audioRef.current) {
                const word = vw.words[wordIndex];
                if (word) {
                    audioRef.current.currentTime = word.timestampFrom / 1000;
                    setActiveWordIndex(wordIndex);
                    return true;
                }
            }
            return false;
        };

        const key = `${ayah.surah}:${ayah.numberInSurah}`;
        const existingVW = verseWordsMap.get(key);

        // If it's a different ayah, start playing it first
        if (currentPlayingAyah !== ayah.number) {
            await playAyahAtIndex(ayahIndex);
            let attempts = 0;
            const checkTiming = setInterval(() => {
                attempts++;
                const newVW = verseWordsMap.get(key);
                if (seek(newVW) || attempts > 20) {
                    clearInterval(checkTiming);
                }
            }, 100);
        } else {
            seek(existingVW);
        }
    }, [currentPlayingAyah, verseWordsMap, playAyahAtIndex]);

    return {
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
