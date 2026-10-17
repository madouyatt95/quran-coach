import {AUDIO_SESSION_KEY,saveReaderAudioSession,type ReaderAudioSession,type PassageCuts} from '../../../lib/readerAudioSession';
import { useId } from 'react';
import {useRecitationPause,recitationSeconds,type RecitationDelay,type RecitationPause} from './useRecitationPause';
import { useCompanionRuntimeStore } from '../../../stores/companionStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAudioUrl, mushafReciter } from '../../../lib/quranApi';
import { useListeningEvidenceStore } from '../../../stores/listeningEvidenceStore';
import { fetchWordTimings, type VerseWords } from '../../../lib/wordTimings';
import type {WordRecitationStart} from '../../../lib/verseRecitation';
import type { Ayah } from '../../../types';

interface UseMushafAudioOptions {
    rememberSession?:boolean;
    selectedReciter: string;
    pageAyahs: Ayah[];
    currentPage: number;
    nextPage: () => void;
    nextSurah: () => void;
    pageMode?: boolean;
    onPassageAyah?: (ayah: Ayah) => void;
    recitationMode?: boolean;
    recitationDelay?: RecitationDelay;
}

export interface AudioPassage {
    surah: number;
    startAyah: number;
    endAyah: number;
    repetitions: number;
    iteration: number;
}

export interface MushafAudioState {
    snapshot:()=>ReaderAudioSession|null;
    restoreSession:(session:ReaderAudioSession)=>Promise<void>;
    stopAt:number|null;
    setStopAt:(verse:number|null)=>void;

    recitationPause: RecitationPause | null;
    repeatCurrentAyah: () => void;
    finishRecitation: () => void;
    passage: AudioPassage | null;
    passageComplete: boolean;
    audioError: string | null;
    startPassage: (startAyah: number, endAyah: number, repetitions: number, surah?: number) => boolean;
    startPassageFromAyahs: (ayahs: Ayah[], repetitions: number, cuts?:PassageCuts) => boolean;
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
    startContinuousAt:(idx:number,start?:WordRecitationStart)=>Promise<void>;
    playNextAyah: () => void;
    playPrevAyah: () => void;
    stopAudio: () => void;
    toggleAudio: () => void;
    pauseForReading: () => (() => void);
    handleWordClick: (ayahIndex: number, wordIndex: number) => Promise<void>;
    // Refs for stale-closure avoidance
    pageAyahsRef: React.MutableRefObject<Ayah[]>;
    playingIndexRef: React.MutableRefObject<number>;
    currentSurahRef: React.MutableRefObject<number>;
    currentAyahRef: React.MutableRefObject<number>;
}

export function useMushafAudio({
    selectedReciter,
    rememberSession=false,
    pageAyahs,
    currentPage,
    nextSurah,
    nextPage,
    pageMode = false,
    onPassageAyah,
    recitationMode = false,
    recitationDelay = 'duration',
}: UseMushafAudioOptions): MushafAudioState {
    const nextAfterRecitation=useRef<()=>void>(()=>{});
    const recitation=useRecitationPause(()=>nextAfterRecitation.current());
    const recitationConfig=useRef({enabled:recitationMode,delay:recitationDelay});
    recitationConfig.current={enabled:recitationMode,delay:recitationDelay};
    const {clear:clearRecitation,pause:pauseRecitation}=recitation;
    const timingReciterId = mushafReciter(selectedReciter).quranComId;
    const reciterRef = useRef(selectedReciter);
    reciterRef.current = selectedReciter;
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioActive, setAudioActive] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const companionBusyId=useId();
    useEffect(()=>{useCompanionRuntimeStore.getState().setBusy(companionBusyId,audioPlaying||!!recitation.state);return()=>useCompanionRuntimeStore.getState().setBusy(companionBusyId,false);},[companionBusyId,audioPlaying,!!recitation.state]);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(0);
    const [playingIndex, setPlayingIndex] = useState(-1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const shouldAutoPlay = useRef(false);
    const expectedSurah = useRef<number | null>(null);
    const expectedPage = useRef<number | null>(null);
    const [passage, setPassage] = useState<AudioPassage | null>(null);
    const passageQueue = useRef<Ayah[] | null>(null);
    const onPassageAyahRef = useRef(onPassageAyah);
    onPassageAyahRef.current = onPassageAyah;
    const passageRef = useRef<AudioPassage | null>(null);
    const [passageComplete, setPassageComplete] = useState(false);
    const passageCompleteRef = useRef(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const playRequest = useRef(0);
    const [stopAt,setStopAtState]=useState<number|null>(null);
    const stopAtRef=useRef<number|null>(null);
    const setStopAt=useCallback((value:number|null)=>{stopAtRef.current=value;setStopAtState(value);},[]);
    const cutsRef=useRef<PassageCuts|null>(null);
    const sessionActive=useRef(false);
    const activeVerse=useRef<Ayah|null>(null),sourceReciter=useRef(selectedReciter);
    const captureRef=useRef<()=>ReaderAudioSession|null>(()=>null);
    const rememberRef=useRef(rememberSession);rememberRef.current=rememberSession;
    const forgetCompleted=()=>{sessionActive.current=false;if(rememberRef.current)try{localStorage.removeItem(AUDIO_SESSION_KEY);}catch{/* storage unavailable */}};
    const persistCurrent=()=>{if(rememberRef.current){const value=captureRef.current();if(value)saveReaderAudioSession(value);}};
    const pairedSources=useRef(new Map<string,string>());
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
            pauseRecitation();
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
    }, [location.pathname, audioPlaying,pauseRecitation]);

    // Sync refs synchronously
    currentPageRef.current = currentPage;
    pageAyahsRef.current = pageAyahs;

    // Play a specific ayah by index
    const playAyahAtIndex = useCallback(async (idx: number, keepPassage = false, start?:WordRecitationStart) => {
        persistCurrent();
        clearRecitation();
        if (!keepPassage) cutsRef.current=null;
        if (!keepPassage) {passageQueue.current = null;shouldAutoPlay.current=false;expectedPage.current=null;expectedSurah.current=null;}
        const ayahs = passageQueue.current ?? pageAyahsRef.current;
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
        sessionActive.current=true;activeVerse.current=ayah;sourceReciter.current=selectedReciter;
        const cuts=cutsRef.current;
        if(cuts){if(ayah.numberInSurah===passageRef.current?.startAyah)start=cuts.start;else if(ayah.numberInSurah===passageRef.current?.endAyah)start={...cuts.end,offset:0};}
        if (passageQueue.current && onPassageAyahRef.current) {
            expectedPage.current = ayah.page;
            onPassageAyahRef.current(ayah);
        }
        setPlayingIndex(idx);
        setCurrentPlayingAyah(ayah.number);
        currentSurahRef.current = ayah.surah;
        currentAyahRef.current = ayah.numberInSurah;

        // Fetch word timing for this ayah (if not already in map)
        setActiveWordIndex(-1);
        const key = `${ayah.surah}:${ayah.numberInSurah}`;
        if(start){pairedSources.current.set(key,start.url);setVerseWordsMap(previous=>new Map(previous).set(key,start.timings));}
        if (!start&&!verseWordsMap.has(key)) {
            fetchWordTimings(ayah.surah, ayah.numberInSurah, timingReciterId).then(vw => {
                if (vw && mounted.current && !pairedSources.current.has(key) && reciterRef.current === selectedReciter) setVerseWordsMap(prev => new Map(prev).set(key, vw));
            }).catch(() => {});
        }

        const element=audioRef.current;
        element.onloadedmetadata=null;
        element.src = pairedSources.current.get(key)??getAudioUrl(selectedReciter, ayah.number);
        // Apply a source-matched word offset before sound becomes playable, including Safari.
        if(start){
            const seek=()=>{if(request===playRequest.current){if(Number.isFinite(element.duration)&&start.offset>=element.duration){element.pause();setAudioPlaying(false);setAudioError('Ce départ au mot est indisponible. Choisissez le début du verset.');return;}element.currentTime=start.offset;}};
            element.onloadedmetadata=seek;
            try{element.currentTime=start.offset;}catch{/* loadedmetadata applies the offset once seekable. */}
        }else element.currentTime=0;
        audioRef.current.playbackRate = playbackSpeed;
        try { await audioRef.current.play(); }
        catch { if (mounted.current && request === playRequest.current) {setAudioPlaying(false);setAudioError('Écoute indisponible. Réessayez.');} }
    }, [selectedReciter, timingReciterId, playbackSpeed, verseWordsMap,clearRecitation]);

    const startContinuousAt=useCallback((idx:number,start?:WordRecitationStart)=>playAyahAtIndex(idx,false,start),[playAyahAtIndex]);

    const startPassage = useCallback((startAyah: number, endAyah: number, repetitions: number, surah?: number) => {
        const ayahs = pageAyahsRef.current;
        if (![startAyah,endAyah,repetitions].every(Number.isInteger) || startAyah < 1 || endAyah < startAyah || repetitions < 1 || repetitions > 20) return false;
        const first = ayahs.findIndex(a => a.numberInSurah === startAyah && (!surah || a.surah === surah));
        const selected = ayahs.slice(first, first + endAyah - startAyah + 1);
        if (first < 0 || selected.length !== endAyah-startAyah+1 || !selected.every((a,i)=>a.surah === ayahs[first].surah && a.numberInSurah === startAyah+i)) return false;
        cutsRef.current=null;
        setStopAt(null);
        passageQueue.current = null;
        const value = {surah:ayahs[first].surah,startAyah,endAyah,repetitions,iteration:1};
        passageRef.current = value;setPassage(value);
        shouldAutoPlay.current = false;
        void playAyahAtIndex(first, true);
        return true;
    }, [playAyahAtIndex]);

    const startPassageFromAyahs = useCallback((verses: Ayah[], repetitions: number,cuts?:PassageCuts) => {
        const first = verses[0];
        if (!first || !Number.isInteger(repetitions) || repetitions < 1 || repetitions > 20 ||
            !verses.every((a,i) => a.surah === first.surah && a.numberInSurah === first.numberInSurah+i && a.number === first.number+i && Number.isInteger(a.page) && a.page >= 1 && a.page <= 604)) return false;
        cutsRef.current=cuts??null;
        setStopAt(null);
        passageQueue.current = [...verses];
        const value = {surah:first.surah,startAyah:first.numberInSurah,endAyah:verses.at(-1)!.numberInSurah,repetitions,iteration:1};
        passageRef.current = value;setPassage(value);shouldAutoPlay.current = false;
        void playAyahAtIndex(0, true);
        return true;
    }, [playAyahAtIndex]);

    // Play next ayah or advance surah
    const playNextAyah = useCallback(() => {
        clearRecitation();
        const idx = playingIndexRef.current;
        if (idx < 0) return;
        const ayahs = passageQueue.current ?? pageAyahsRef.current;
        const surahNum = currentSurahRef.current;
        const range = passageRef.current;
        if(stopAtRef.current!==null&&ayahs[idx]?.number>=stopAtRef.current){
            forgetCompleted();playingIndexRef.current=-1;
            audioRef.current?.pause();setAudioPlaying(false);setAudioActive(false);setPlayingIndex(-1);setActiveWordIndex(-1);return;
        }
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
                    forgetCompleted();passageCompleteRef.current = true;setPassageComplete(true);
                    audioRef.current?.pause();setAudioPlaying(false);setActiveWordIndex(-1);
                }
            } else void playAyahAtIndex(idx + 1, true);
            return;
        }

        if (idx < ayahs.length - 1) {
            playAyahAtIndex(idx + 1);
        } else if (pageMode && currentPageRef.current < 604) {
            shouldAutoPlay.current = true;
            expectedPage.current = currentPageRef.current + 1;
            expectedSurah.current = null;
            nextPage();
        } else if (!pageMode && surahNum < 114) {
            shouldAutoPlay.current = true;
            expectedSurah.current = surahNum + 1;
            nextSurah();
        } else {
            forgetCompleted();setAudioPlaying(false);
            setAudioActive(false);
            setPlayingIndex(-1);
            setCurrentPlayingAyah(0);
        }
    }, [playAyahAtIndex, nextSurah, nextPage, pageMode,clearRecitation]);

    nextAfterRecitation.current=playNextAyah;
    const repeatCurrentAyah=useCallback(()=>{if(playingIndexRef.current>=0)void playAyahAtIndex(playingIndexRef.current,true);},[playAyahAtIndex]);

    // Play previous ayah
    const playPrevAyah = useCallback(() => {
        const range = passageRef.current;
        const previous = (passageQueue.current ?? pageAyahsRef.current)[playingIndexRef.current - 1];
        if (playingIndexRef.current > 0 && (!range || (previous?.surah === range.surah && previous.numberInSurah >= range.startAyah))) {
            void playAyahAtIndex(playingIndexRef.current - 1, true);
        }
    }, [playAyahAtIndex]);

    // Stop audio
    const stopAudio = useCallback(() => {
        persistCurrent();sessionActive.current=false;cutsRef.current=null;
        clearRecitation();
        playRequest.current++;
        passageQueue.current = null;
        passageRef.current = null;setPassage(null);
        passageCompleteRef.current = false;setPassageComplete(false);
        setAudioError(null);setActiveWordIndex(-1);
        playingIndexRef.current = -1;
        expectedSurah.current = null;
        expectedPage.current = null;
        wasPlayingRef.current = false;
        shouldAutoPlay.current = false;
        pendingAutoAdvance.current = false;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onloadedmetadata=null;
            audioRef.current.currentTime = 0;
        }
        setAudioActive(false);
        setAudioPlaying(false);
        setPlayingIndex(-1);
        setCurrentPlayingAyah(0);
    }, [clearRecitation]);

    useEffect(() => {
        stopAudio();
        setVerseWordsMap(new Map());pairedSources.current.clear();
    }, [selectedReciter, stopAudio]);

    useEffect(() => {
        window.addEventListener('quran-stop-playback', stopAudio);
        return () => window.removeEventListener('quran-stop-playback', stopAudio);
    }, [stopAudio]);

    useEffect(()=>{if(!recitationMode)clearRecitation();},[recitationMode,clearRecitation]);

    // Resume the same media position; a completed selection restarts its first round.
    const toggleAudio = useCallback(() => {
        if(recitation.current.current){recitation.toggle();return;}
        const element = audioRef.current;
        if (!(passageQueue.current ?? pageAyahsRef.current).length || !element) return;
        if (audioPlaying) {playRequest.current++;element.pause();setAudioPlaying(false);return;}
        const range = passageRef.current;
        if (range && passageCompleteRef.current) {if(passageQueue.current) startPassageFromAyahs(passageQueue.current,range.repetitions,cutsRef.current??undefined);else startPassage(range.startAyah,range.endAyah,range.repetitions,range.surah);return;}
        if (playingIndexRef.current < 0 || !element.src) {void playAyahAtIndex(0);return;}
        setAudioError(null);setAudioPlaying(true);setAudioActive(true);
        const request = ++playRequest.current;
        void element.play().catch(()=>{if(mounted.current && request === playRequest.current){setAudioPlaying(false);setAudioError('Écoute indisponible. Réessayez.');}});
    }, [audioPlaying, playAyahAtIndex, startPassage, startPassageFromAyahs,recitation.current,recitation.toggle]);

    // A temporary reading pause may resume only the same playback session.
    const routeRef=useRef(location.pathname);
    useEffect(()=>{routeRef.current=location.pathname;},[location.pathname]);
    const pauseForReading=useCallback(()=>{
        const element=audioRef.current,request=++playRequest.current,source=element?.src;
        const wasPlaying=!!element&&!element.paused;
        const silence=recitation.current.current;
        const wasCounting=!!silence&&!silence.paused;
        element?.pause();setAudioPlaying(false);pauseRecitation();
        let used=false;
        return()=>{
            if(used)return;used=true;
            if(!mounted.current||request!==playRequest.current||routeRef.current!=='/read'||audioRef.current!==element||element?.src!==source)return;
            if(wasCounting&&recitation.current.current?.paused){recitation.toggle();return;}
            if(wasPlaying&&element){setAudioPlaying(true);void element.play().catch(()=>{if(mounted.current&&request===playRequest.current){setAudioPlaying(false);setAudioError('Touchez Lecture pour reprendre.');}});}
        };
    },[pauseRecitation,recitation.current,recitation.toggle]);

    useEffect(() => {if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;}, [playbackSpeed]);
    useEffect(() => {
        mounted.current = true;
        const element = audioRef.current;
        const error = () => {setAudioPlaying(false);setAudioError('Écoute indisponible. Réessayez.');};
        element?.addEventListener('error',error);
        return () => {persistCurrent();sessionActive.current=false;mounted.current=false;playRequest.current++;element?.pause();element?.removeEventListener('error',error);};
    }, []);

    // Handle audio 'ended' event
    const playNextAyahRef = useRef(playNextAyah);
    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        const handleEnded = () => {
            if(recitation.current.current||playingIndexRef.current<0||passageCompleteRef.current)return;
            const verse = (passageQueue.current ?? pageAyahsRef.current)[playingIndexRef.current];
            if (verse && verse.surah === currentSurahRef.current && verse.numberInSurah === currentAyahRef.current)
                useListeningEvidenceStore.getState().recordVerse(verse.surah, verse.numberInSurah, 'mushaf');
            if(recitationConfig.current.enabled&&verse){
                setAudioPlaying(false);setActiveWordIndex(-1);
                recitation.start(recitationSeconds(recitationConfig.current.delay,audio.duration,audio.playbackRate));
            }else playNextAyahRef.current();
        };
        audio.addEventListener('ended', handleEnded);
        return () => { audio.removeEventListener('ended', handleEnded); };
    }, [recitation.current,recitation.start]);

    useEffect(()=>{
        const element=audioRef.current;if(!element)return;
        let timer:ReturnType<typeof setTimeout>|undefined;
        const clear=()=>{if(timer)clearTimeout(timer);timer=undefined;};
        const tick=()=>{
            clear();const cuts=cutsRef.current,range=passageRef.current;
            if(!cuts||!range||element.paused||passageCompleteRef.current||currentAyahRef.current!==range.endAyah)return;
            const remaining=(cuts.endTime-element.currentTime)/element.playbackRate;
            if(remaining<=.015){element.pause();playNextAyahRef.current();}
            else timer=setTimeout(tick,Math.max(10,remaining*1000));
        };
        const events=['timeupdate','play','seeked','ratechange'];events.forEach(event=>element.addEventListener(event,tick));element.addEventListener('pause',clear);
        return()=>{clear();events.forEach(event=>element.removeEventListener(event,tick));element.removeEventListener('pause',clear);};
    },[]);

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

    const lastDisplayedPage = useRef(currentPage);
    useEffect(() => {
        if(pageMode && lastDisplayedPage.current !== currentPage && expectedPage.current !== currentPage) stopAudio();
        lastDisplayedPage.current = currentPage;
    }, [currentPage,pageMode,stopAudio]);

    // Auto-resume after page change
    useEffect(() => {
        if (shouldAutoPlay.current && pageAyahs.length && (pageMode ? currentPage === expectedPage.current && pageAyahs[0].page === currentPage : pageAyahs[0].surah === expectedSurah.current) && audioActive) {
            shouldAutoPlay.current = false;
            expectedSurah.current = null;
            expectedPage.current = null;
            void playAyahAtIndex(0);
        } else if (!passageQueue.current && passageRef.current && pageAyahs.length && !pageAyahs.some(a => a.surah === passageRef.current!.surah && a.numberInSurah === passageRef.current!.startAyah)) {
            stopAudio();
        }
    }, [pageAyahs, currentPage, pageMode, audioActive, playAyahAtIndex, stopAudio]);

    // Auto-scroll to current ayah
    useEffect(() => {
        if (currentPlayingAyah && audioPlaying) {
            const ayah = (passageQueue.current ?? pageAyahsRef.current)[playingIndexRef.current];
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
        const timings = verseWordsMap.get(key) ?? await fetchWordTimings(ayah.surah,ayah.numberInSurah,timingReciterId).catch(()=>null);
        if (!mounted.current || request !== playRequest.current || currentSurahRef.current !== ayah.surah || currentAyahRef.current !== ayah.numberInSurah) return;
        const word = timings?.words[wordIndex];
        if (word && audioRef.current) {audioRef.current.currentTime = word.timestampFrom/1000;setActiveWordIndex(wordIndex);}
    }, [currentPlayingAyah, audioActive, verseWordsMap, playAyahAtIndex, timingReciterId]);

    const snapshot=():ReaderAudioSession|null=>{
        const element=audioRef.current,verse=activeVerse.current;
        if(!sessionActive.current||!verse||!element?.src||!Number.isFinite(element.currentTime))return null;
        return {verse,reciter:sourceReciter.current,url:element.src,offset:element.currentTime,speed:element.playbackRate||1,stopAt:stopAtRef.current,
            queue:passageQueue.current,range:passageRef.current,cuts:cutsRef.current,
            timings:verseWordsMap.get(`${verse.surah}:${verse.numberInSurah}`)||{verseKey:`${verse.surah}:${verse.numberInSurah}`,words:[]},savedAt:Date.now()};
    };
    captureRef.current=snapshot;
    useEffect(()=>{
        if(!rememberSession)return;
        const save=()=>persistCurrent();const element=audioRef.current;
        const timer=setInterval(save,1000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',save);element?.addEventListener('pause',save);
        return()=>{save();clearInterval(timer);window.removeEventListener('pagehide',save);document.removeEventListener('visibilitychange',save);element?.removeEventListener('pause',save);};
    },[rememberSession]);
    const restoreSession=async(saved:ReaderAudioSession)=>{
        passageQueue.current=saved.queue;passageRef.current=saved.range;setPassage(saved.range);cutsRef.current=saved.cuts;setStopAt(saved.stopAt);setPlaybackSpeed(saved.speed);
        const list=saved.queue??pageAyahsRef.current,index=list.findIndex(a=>a.number===saved.verse.number);
        if(index<0)return;
        // Explicit resume offsets take priority over the selected passage's first word.
        const cuts=cutsRef.current;cutsRef.current=null;
        const request=playRequest.current+1;
        await playAyahAtIndex(index,true,{url:saved.url,offset:saved.offset,timings:saved.timings});if(playRequest.current!==request)return;cutsRef.current=cuts;
        if(audioRef.current)audioRef.current.playbackRate=saved.speed;
    };

    return {
        snapshot,restoreSession,stopAt,setStopAt,
        recitationPause:recitation.state,
        repeatCurrentAyah,
        finishRecitation:recitation.advance,
        passage,
        passageComplete,
        audioError,
        startPassage,
        startPassageFromAyahs,
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
        startContinuousAt,
        playNextAyah,
        playPrevAyah,
        stopAudio,
        toggleAudio,
        pauseForReading,
        handleWordClick,
        pageAyahsRef,
        playingIndexRef,
        currentSurahRef,
        currentAyahRef,
    };
}
