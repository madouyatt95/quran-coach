import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { parsePassage, passageUrl } from '../lib/learning';
import {
    Play,
    Pause,
    Repeat,
    Minus,
    Plus,
    RotateCcw,
    Square,
    Languages,
    AlignJustify,
    BookOpen,
    MousePointerClick,
    MoreVertical,
    Bookmark,
    Copy,
    Maximize
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore, PLAYBACK_SPEEDS } from '../stores/settingsStore';
import {readHifdhSession,HIFDH_SESSION_KEY,difficultPassages,type HifdhStep,type ReviewPassage} from '../lib/hifdhSession';
import { fetchSurah, fetchSurahTransliteration, fetchSurahTranslation, getAudioUrl } from '../lib/quranApi';
import { fetchWordTimings, getCurrentWordIndex } from '../lib/wordTimings';
import { SRSControls } from '../components/SRS/SRSControls';
import { useSRSStore } from '../stores/srsStore';
import { useCoach } from '../hooks/useCoach';
import { recitationWords } from '../lib/recitationMatching';
import { readCoachReviews, COACH_REVIEW_EVENT } from '../lib/coachSession';
import { CoachOverlay } from '../components/Coach/CoachOverlay';
import { useTranslation } from 'react-i18next';
import type { VerseWords } from '../lib/wordTimings';
import type { Ayah } from '../types';
import './HifdhPage.css';

// Hifdh always uses Mishari Al-Afasy — only reciter with reliable word-by-word timings
const HIFDH_RECITER = 'ar.alafasy';
const HIFDH_RECITER_QURAN_COM_ID = 7;

export function HifdhPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const incoming = parsePassage(new URLSearchParams(location.search));
    const { surahs } = useQuranStore();
    const { playbackSpeed, setPlaybackSpeed } = useSettingsStore();
    const [savedSession,setSavedSession] = useState(()=>readHifdhSession(localStorage));
    const [step,setStep] = useState<HifdhStep>('listen');
    const [settingsOpen,setSettingsOpen] = useState(false);
    const [libraryOpen,setLibraryOpen] = useState(false);
    const [queue,setQueue] = useState<ReviewPassage[]>([]);
    const [queueIndex,setQueueIndex] = useState(0);
    const queueStep = useRef<HifdhStep>('review');
    const resumeAyah = useRef<number|null>(null);
    const sessionTouched = useRef(false);
    const [audioError,setAudioError] = useState('');
    const playIntent = useRef(false);
    const playbackRequest = useRef(0);
    const passageGeneration = useRef(0);
    const [sessionSaved,setSessionSaved] = useState(true);
    const { getDueCards, cards, addCard } = useSRSStore();
    const [reviewLog, setReviewLog] = useState(() => {
        try { return readCoachReviews(localStorage); } catch { return []; }
    });
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadPassage, setReloadPassage] = useState(0);
    useEffect(() => {
        const refresh = () => {
            try { setReviewLog(readCoachReviews(localStorage)); } catch { /* Keep the current history. */ }
        };
        window.addEventListener(COACH_REVIEW_EVENT, refresh);
        window.addEventListener("storage", refresh);
        return () => {
            window.removeEventListener(COACH_REVIEW_EVENT, refresh);
            window.removeEventListener("storage", refresh);
        };
    }, []);

    // Selection state
    const [selectedSurah, setSelectedSurah] = useState(incoming.surah);
    const [startAyah, setStartAyah] = useState(incoming.ayah);
    const [endAyah, setEndAyah] = useState(location.search ? incoming.ayah : 5);
    const [maxAyahs, setMaxAyahs] = useState(5);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

    // Partial selection (Word loop)
    const [selectionStart, setSelectionStart] = useState<{ ayahIndex: number; wordIndex: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ ayahIndex: number; wordIndex: number } | null>(null);

    // Timing cache for all ayahs in the current range
    const [allTimings, setAllTimings] = useState<Map<number, VerseWords>>(new Map());

    // Context Menu State
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    // Phonetics and Translations state
    const [showPhonetics, setShowPhonetics] = useState(false);
    const [transliterations, setTransliterations] = useState<Map<number, string>>(new Map());
    const [translations, setTranslations] = useState<Map<number, string>>(new Map());

    // Single verse display mode (localStorage persisted)
    const [singleVerseMode, setSingleVerseMode] = useState(() => {
        try { return localStorage.getItem('hifdh-single-verse') === 'true'; } catch { return false; }
    });

    // Word selection mode
    const [isWordSelectionMode, setIsWordSelectionMode] = useState(false);

    // Player state
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [currentRepeat, setCurrentRepeat] = useState(1);
    const [maxRepeats, setMaxRepeats] = useState(1);

    // Seeking state for cross-audio transitions
    const [seekOnLoad, setSeekOnLoad] = useState<number | null>(null);
    const [pokeEndTime, setPokeEndTime] = useState<number | null>(null);


    // Word timings
    const [wordTimings, setWordTimings] = useState<VerseWords | null>(null);
    const [activeWordIndex, setActiveWordIndex] = useState(-1);

    // Coach mode
    const coach = useCoach({
        ayahs,
        scoreKey: `${selectedSurah}:${startAyah}-${endAyah}`,
        playingIndex: currentAyahIndex,
    });

    const coachRef = useRef(coach);
    useEffect(() => {
        coachRef.current = coach;
    }, [coach]);

    const currentAyahIndexRef = useRef(currentAyahIndex);
    useEffect(() => {
        currentAyahIndexRef.current = currentAyahIndex;
    }, [currentAyahIndex]);

    // Auto-advance state
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(false);
    const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleCoachReciterFinished = useCallback((currentCoach: typeof coach) => {
        playIntent.current=false;++playbackRequest.current;
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
        }
        setIsPlaying(false);
        setPokeEndTime(null);

        const currentIndex = currentAyahIndexRef.current;

        if (currentCoach.coachMode === 'link') {
            // L'Enchaînement: Reciter played N -> Student plays N+1
            if (currentIndex < ayahs.length - 1) {
                setCurrentAyahIndex(currentIndex + 1);
                currentCoach.setDuoPhase('student');
                void currentCoach.startCoachListening(currentIndex + 1);
            } else {
                currentCoach.setDuoPhase(null);
            }
        } else {
            // Duo Echo: Reciter played N -> Student repeats N
            currentCoach.setDuoPhase('student');
            void currentCoach.startCoachListening(currentIndex);
        }
    }, [ayahs.length]);

    // Handle incoming verse from navigation state (Deep link)
    useEffect(() => {
        const state = location.search ? parsePassage(new URLSearchParams(location.search)) : location.state as { surah?: number; ayah?: number };
        if (state?.surah && state?.ayah) {
            setSelectedSurah(state.surah);
            setStartAyah(state.ayah);
            setEndAyah(state.ayah);

        }
    }, [location.state, location.search]);

    const currentAyah = ayahs[currentAyahIndex];

    const dueCards = getDueCards();
    const allCards = Object.values(cards);

    const openPassage = (passage:ReviewPassage, nextStep:HifdhStep='listen') => {
        playIntent.current=false;++playbackRequest.current;audioRef.current?.pause();setIsPlaying(false);
        coach.selectCoachMode(null);setStep(nextStep);sessionTouched.current=true;
        setSelectedSurah(passage.surah);setStartAyah(passage.start);setEndAyah(passage.end);
        setCurrentAyahIndex(0);setLibraryOpen(false);setSettingsOpen(false);setReloadPassage(n=>n+1);
    };
    const startQueue = (passages:ReviewPassage[], nextStep:HifdhStep='review') => {
        if(!passages.length)return;
        queueStep.current=nextStep;
        setQueue(passages);setQueueIndex(0);openPassage(passages[0],nextStep);
    };
    const loadFromSRS = (surah:number,ayah:number) => startQueue([{surah,start:ayah,end:ayah}]);
    const advanceReview = () => {
        if(queueIndex+1<queue.length){const index=queueIndex+1;setQueueIndex(index);openPassage(queue[index],queueStep.current);}
        else if(queue.length){stopPlayback();void coach.stopCoachListening();coach.setDuoPhase('waiting');setQueue([]);setStep('review');}
        else if(currentAyahIndex<ayahs.length-1)setCurrentAyahIndex(i=>i+1);
    };
    const hardPassages = useMemo(()=>difficultPassages(reviewLog),[reviewLog]);
    const resumeSession = () => {
        if(!savedSession)return;
        resumeAyah.current=savedSession.ayah;
        setPlaybackSpeed(savedSession.speed);setMaxRepeats(savedSession.repeats);setShowPhonetics(savedSession.phonetics);setSingleVerseMode(savedSession.focus);
        setQueue([]);openPassage({surah:savedSession.surah,start:savedSession.start,end:savedSession.end},savedSession.step);
    };
    useEffect(()=>{
        if(!sessionTouched.current || !currentAyah || currentAyah.surah!==selectedSurah || currentAyah.numberInSurah<startAyah || currentAyah.numberInSurah>endAyah)return;
        try{const session={surah:selectedSurah,start:startAyah,end:endAyah,ayah:currentAyah.numberInSurah,speed:playbackSpeed,repeats:maxRepeats,phonetics:showPhonetics,focus:singleVerseMode,step};localStorage.setItem(HIFDH_SESSION_KEY,JSON.stringify(session));setSavedSession(session);setSessionSaved(true);}
        catch{setSessionSaved(false);}
    },[selectedSurah,startAyah,endAyah,currentAyah,playbackSpeed,maxRepeats,showPhonetics,singleVerseMode,step,isPlaying]);

    // Update max ayahs when surah changes
    useEffect(() => {
        const surah = surahs.find(s => s.number === selectedSurah);
        if (surah) {
            setMaxAyahs(surah.numberOfAyahs);
        }
    }, [selectedSurah, surahs]);

    useEffect(() => {
        const fetchStart = startAyah;
        const fetchEnd = endAyah;
        let cancelled = false;
        setLoadError(null);
        coachRef.current.selectCoachMode(null);
        audioRef.current?.pause();
        setIsPlaying(false);
        setAyahs([]);
        setWordTimings(null);
        setAllTimings(new Map());
        playIntent.current=false;++playbackRequest.current;++passageGeneration.current;
        setAudioError('');setCurrentTime(0);setDuration(0);setSeekOnLoad(null);setPokeEndTime(null);
        fetchSurah(selectedSurah).then(surahData => {
            if (cancelled) return;
            const filtered = surahData.ayahs.filter(
                a => a.numberInSurah >= fetchStart && a.numberInSurah <= fetchEnd
            );
            if(!filtered.length){setLoadError('Ce passage ne contient aucun verset. Modifiez la sélection.');return;}
            setAyahs(filtered);
            setMaxAyahs(surahData.surah.numberOfAyahs);
            const resumed=filtered.findIndex(a=>a.numberInSurah===resumeAyah.current);
            setCurrentAyahIndex(Math.max(0,resumed));resumeAyah.current=null;
            setCurrentRepeat(1);
            setSelectionStart(null);
            setSelectionEnd(null);
        }).catch(() => {
            if (!cancelled) setLoadError('Impossible de charger ce passage. Vérifiez votre connexion puis réessayez.');
        });
        return () => { cancelled = true; };
    }, [selectedSurah, startAyah, endAyah, reloadPassage]);

    useEffect(()=>{
        let cancelled=false;setTranslations(new Map());
        fetchSurahTranslation(selectedSurah).then(data=>{if(!cancelled)setTranslations(data);}).catch(()=>{});
        return ()=>{cancelled=true;};
    },[selectedSurah]);
    useEffect(()=>{
        if(!showPhonetics)return;
        let cancelled=false;setTransliterations(new Map());
        fetchSurahTransliteration(selectedSurah).then(data=>{if(!cancelled)setTransliterations(data);}).catch(()=>{});
        return ()=>{cancelled=true;};
    },[selectedSurah,showPhonetics]);

    const safePlay = useCallback(async()=>{
        const audio=audioRef.current;if(!audio)return;
        const request=++playbackRequest.current;playIntent.current=true;setAudioError('');
        try{await audio.play();if(request!==playbackRequest.current)return;setIsPlaying(true);}
        catch{if(request!==playbackRequest.current)return;playIntent.current=false;setIsPlaying(false);setAudioError('Lecture audio indisponible. Réessayez avec le bouton Écouter.');}
    },[]);
    const stopPlayback = useCallback(()=>{
        playIntent.current=false;++playbackRequest.current;audioRef.current?.pause();setIsPlaying(false);
    },[]);
    useEffect(()=>{const audio=audioRef.current;return ()=>{playIntent.current=false;++playbackRequest.current;audio?.pause();};},[]);

    // Load audio and fetch current timings
    useEffect(() => {
        if (ayahs.length > 0 && audioRef.current) {
            const ayah = ayahs[currentAyahIndex];
            if (!ayah) return;

            const audioUrl = getAudioUrl(HIFDH_RECITER, ayah.number);
            const audio = audioRef.current;

            const handleMetadata = () => {
                if (seekOnLoad !== null) {
                    audio.currentTime = seekOnLoad;
                    setSeekOnLoad(null);
                }
                // Only auto-play if we were already playing or if it's a specific seekOnLoad
                if (playIntent.current) void safePlay();
            };

            // Only update src if it's actually different (ignoring domain/relative mapping)
            // audio.src returns absolute URL, so we compare directly
            const currentSrc = audio.src;
            if (!currentSrc || !currentSrc.includes(audioUrl.split('/').pop()!)) {
                ++playbackRequest.current;
                audio.addEventListener('loadedmetadata', handleMetadata, { once: true });
                audio.src = audioUrl;
                audio.load();
                setCurrentTime(0);setDuration(0);
            } else if (seekOnLoad !== null) {
                // If src is same but we have a seek request
                if (audio.readyState >= 1) { // metadata loaded
                    handleMetadata();
                } else {
                    audio.addEventListener('loadedmetadata', handleMetadata, { once: true });
                }
            }

            audio.playbackRate = playbackSpeed;
            setActiveWordIndex(-1);

            let cancelled = false;
            setWordTimings(null);
            fetchWordTimings(selectedSurah, ayah.numberInSurah, HIFDH_RECITER_QURAN_COM_ID).then(timings => {
                if (!cancelled) setWordTimings(timings);
            }).catch(() => { /* Plain text remains available without timings. */ });

            return () => {
                cancelled = true;
                audio.removeEventListener('loadedmetadata', handleMetadata);
            };
        }
    }, [ayahs, currentAyahIndex, playbackSpeed, selectedSurah, seekOnLoad, safePlay]);

    // Pre-fetch all timings in the selected range for cross-verse loops
    useEffect(() => {
        let cancelled = false;
        if (ayahs.length > 0) {
            const fetchAll = async () => {
                const newMap = new Map<number, VerseWords>();
                const results = await Promise.all(ayahs.map(async (ayah, idx) => {
                    const timings = await fetchWordTimings(selectedSurah, ayah.numberInSurah, HIFDH_RECITER_QURAN_COM_ID).catch(() => null);
                    return { idx, timings };
                }));

                results.forEach(({ idx, timings }) => {
                    if (timings) newMap.set(idx, timings);
                });

                if (!cancelled) setAllTimings(newMap);
            };
            void fetchAll();
        }
        return () => { cancelled = true; };
    }, [ayahs, selectedSurah]);

    // Handle Word Selection for Loop or Coach Initiation
    const handleWordClick = (aIdx: number, wIdx: number) => {
        setPokeEndTime(null);

        // Coach Initiation Logic
        if (coach.isCoachMode) {
            if (coach.duoPhase === 'waiting') {
                // Start the session explicitly from the clicked verse
                setCurrentAyahIndex(aIdx);

                if (coach.coachMode === 'solo' || coach.coachMode === 'magic_reveal') {
                    coach.setDuoPhase('student');
                    stopPlayback();
                    void coach.startCoachListening(aIdx);
                } else {
                    coach.setDuoPhase('reciter');
                }
                return;
            } else {
                // During active session, clicking a word provides a hint/jump
                stopPlayback();
                setCurrentAyahIndex(aIdx);
                coach.coachJumpToWord(aIdx, wIdx);
                return;
            }
        }

        const clickPos = aIdx * 1000 + wIdx;
        const clickedAyah = ayahs[aIdx];

        const processClick = (timings: VerseWords) => {
            const word = timings.words[wIdx];
            if (!word) return;
            const startTime = word.timestampFrom / 1000;

            if (!isWordSelectionMode) {
                // Lecture au clic (just play from this word immediately)
                resetSelection();
                playIntent.current=true;
                setIsPlaying(true);
                if(aIdx !== currentAyahIndex){setCurrentAyahIndex(aIdx);setSeekOnLoad(startTime);return;}
                setCurrentAyahIndex(aIdx);

                if (audioRef.current) {
                    if (audioRef.current.readyState >= 1) {
                        try {
                            audioRef.current.currentTime = startTime;
                            void safePlay();
                        } catch (err) {
                            console.warn("Could not seek before load completed.", err);
                        }
                    } else {
                        setSeekOnLoad(startTime);
                    }
                } else {
                    setSeekOnLoad(startTime);
                }
                return;
            }

            // Mode sélection de boucle (prevent playback on click, just select)
            if (selectionStart === null || (selectionStart !== null && selectionEnd !== null)) {
                // Start of a new selection
                setSelectionStart({ ayahIndex: aIdx, wordIndex: wIdx });
                setSelectionEnd(null);
                setCurrentAyahIndex(aIdx);
                setSeekOnLoad(startTime);
            } else {
                // Completing a selection range
                const startPos = selectionStart.ayahIndex * 1000 + selectionStart.wordIndex;

                if (clickPos < startPos) {
                    setSelectionEnd(selectionStart);
                    setSelectionStart({ ayahIndex: aIdx, wordIndex: wIdx });
                    setCurrentAyahIndex(aIdx);
                    setSeekOnLoad(startTime);
                } else {
                    setSelectionEnd({ ayahIndex: aIdx, wordIndex: wIdx });

                    // Auto-play the loop once selection is complete
                    const startT = allTimings.get(selectionStart.ayahIndex);
                    if (startT) {
                        const startW = startT.words[selectionStart.wordIndex];
                        if (startW) {
                            const loopStartTime = startW.timestampFrom / 1000;
                            if (selectionStart.ayahIndex === currentAyahIndex && audioRef.current && audioRef.current.readyState >= 1) {
                                audioRef.current.currentTime = loopStartTime;
                                void safePlay();
                            } else {
                                setCurrentAyahIndex(selectionStart.ayahIndex);
                                setSeekOnLoad(loopStartTime);
                            }
                            playIntent.current=true;setIsPlaying(true);
                        }
                    }
                }
            }
        };

        // If timings are already cached, process synchronously so mobile browsers don't block `play()`
        const cachedTimings = allTimings.get(aIdx);
        if (cachedTimings) {
            processClick(cachedTimings);
        } else {
            const generation=passageGeneration.current;
            fetchWordTimings(selectedSurah, clickedAyah.numberInSurah, HIFDH_RECITER_QURAN_COM_ID).then(fetched => {
                if (fetched && generation===passageGeneration.current) {
                    setAllTimings(prev => new Map(prev).set(aIdx, fetched));
                    processClick(fetched);
                }
            }).catch(()=>setAudioError('Le repérage des mots est indisponible. Utilisez Écouter pour lire le verset.'));
        }
    };

    const resetSelection = () => {
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    // Coach: Auto-play reciter audio when entering 'reciter' phase
    useEffect(() => {
        if (!coach.isCoachMode || coach.duoPhase !== 'reciter' || !audioRef.current || ayahs.length === 0) return;

        void coachRef.current.stopCoachListening();
        resetSelection(); // Ensure no loop selection interferes
        playIntent.current=true;setIsPlaying(true);

        const triggerPlayback = async () => {
            const audio = audioRef.current;
            if (!audio) return;

            try {
                // Play full current verse
                setPokeEndTime(null);
                if (audio.readyState >= 1) {
                    audio.currentTime = 0;
                    await safePlay();
                } else {
                    setSeekOnLoad(0);
                }
            } catch (err) {
                console.warn('Autoplay prevented or interrupted:', err);
                setIsPlaying(false);
            }
        };

        // Brief timeout allows React to update DOM elements and sync the new src if needed
        const timer = setTimeout(triggerPlayback, 100);
        return () => clearTimeout(timer);
    }, [coach.isCoachMode, coach.duoPhase, currentAyahIndex, coach.coachMode, ayahs.length]);

    // Auto-advance: when coach reaches 100% (student finishes)
    useEffect(() => {
        if (!coach.isCoachMode || !coach.coachAtEnd || coach.duoPhase !== 'student' || coach.showMistakesSummary || coach.selectedError || coach.allCoachWords.length === 0) {
            setAutoAdvanceCountdown(false);
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
            }
            return;
        }

        // 100% reached
        setAutoAdvanceCountdown(true);
        autoAdvanceTimerRef.current = setTimeout(() => {
            setAutoAdvanceCountdown(false);
            void coach.stopCoachListening();
            if (currentAyahIndex >= ayahs.length - 1) {
                coach.setDuoPhase('waiting');
                coach.setShowMistakesSummary(true);
                setStep('review');
                return;
            }

            if (coach.coachMode === 'solo' || coach.coachMode === 'magic_reveal') {
                if (currentAyahIndex < ayahs.length - 1) {
                    setCurrentAyahIndex(prev => prev + 1);
                    void coach.startCoachListening(currentAyahIndex + 1);
                }
            } else if (coach.coachMode === 'link') {
                if (currentAyahIndex < ayahs.length - 1) {
                    setCurrentAyahIndex(prev => prev + 1); // Student finished N+1 -> Reciter starts N+2
                    coach.setDuoPhase('reciter');
                }
            } else if (coach.coachMode === 'duo_echo') {
                if (currentAyahIndex < ayahs.length - 1) {
                    setCurrentAyahIndex(prev => prev + 1); // Student finished N -> Reciter starts N+1
                    coach.setDuoPhase('reciter');
                }
            }

        }, 1500); // 1.5s delay before advancing

        return () => {
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
            }
        };
    }, [coach.coachAtEnd, coach.coachRevision, coach.isCoachMode, coach.coachMode, coach.duoPhase, coach.showMistakesSummary, coach.selectedError, coach.allCoachWords.length, currentAyahIndex, ayahs.length]);

    const selectedTimeRange = useMemo(() => {
        if (selectionStart === null || selectionEnd === null) return null;

        const startT = allTimings.get(selectionStart.ayahIndex);
        const endT = allTimings.get(selectionEnd.ayahIndex);

        if (!startT || !endT) return null;

        const startWord = startT.words[selectionStart.wordIndex];
        const endWord = endT.words[selectionEnd.wordIndex];

        if (!startWord || !endWord) return null;

        return {
            start: startWord.timestampFrom / 1000,
            end: endWord.timestampTo / 1000,
            startAyahIdx: selectionStart.ayahIndex,
            endAyahIdx: selectionEnd.ayahIndex
        };
    }, [allTimings, selectionStart, selectionEnd]);

    // Player logic
    const handlePlayPause = () => {
        sessionTouched.current=true;setPokeEndTime(null);
        if(!currentAyah)return;
        if(isPlaying){stopPlayback();return;}
        if(selectedTimeRange && audioRef.current){
            playIntent.current=true;
            if(currentAyahIndex!==selectedTimeRange.startAyahIdx){setCurrentAyahIndex(selectedTimeRange.startAyahIdx);setSeekOnLoad(selectedTimeRange.start);return;}
            audioRef.current.currentTime=selectedTimeRange.start;
        }
        void safePlay();
    };

    const handleNext = useCallback(() => {
        setPokeEndTime(null);
        if (currentAyahIndex < ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
            setCurrentRepeat(1);
            resetSelection();
        } else if (isLooping) {
            setCurrentAyahIndex(0);
            setCurrentRepeat(1);
            resetSelection();
        } else {stopPlayback();setStep('recite');}
    }, [currentAyahIndex, ayahs.length, isLooping, stopPlayback]);

    const handleAudioEnded = useCallback(() => {
        const currentCoach = coachRef.current;
        if (currentCoach.isCoachMode && currentCoach.duoPhase === 'reciter') {
            handleCoachReciterFinished(currentCoach);
            return;
        }

        if (currentRepeat < maxRepeats) {
            setCurrentRepeat(prev => prev + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = selectedTimeRange ? selectedTimeRange.start : 0;
                void safePlay();
            }
        } else if(currentAyahIndex===ayahs.length-1 && isLooping && ayahs.length===1){
            if(audioRef.current)audioRef.current.currentTime=0;setCurrentRepeat(1);void safePlay();
        } else {
            handleNext();
        }
    }, [currentRepeat, maxRepeats, handleNext, selectedTimeRange, handleCoachReciterFinished, currentAyahIndex, ayahs.length, isLooping, safePlay]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let rafId: number | null = null;

        // Detect iOS for special handling
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Use requestAnimationFrame for precise loop timing (60fps vs timeupdate ~4fps)
        const checkLoopPoint = () => {
            if (!audio || audio.paused) {
                rafId = null;
                return;
            }

            setCurrentTime(audio.currentTime);

            // Poke stop logic
            if (pokeEndTime !== null && audio.currentTime >= pokeEndTime) {
                stopPlayback();
                setPokeEndTime(null);

                const currentCoach = coachRef.current;
                if (currentCoach.isCoachMode && currentCoach.duoPhase === 'reciter') {
                    handleCoachReciterFinished(currentCoach);
                }
                return;
            }

            // Loop logic with larger margin for iOS
            if (selectedTimeRange && isPlaying) {
                const margin = isIOS ? 0.3 : 0.05;
                const isFinalVerseInRange = currentAyahIndex === selectedTimeRange.endAyahIdx;
                const isStartVerseInRange = currentAyahIndex === selectedTimeRange.startAyahIdx;

                // Handle end of range
                if (isFinalVerseInRange && audio.currentTime >= (selectedTimeRange.end - margin)) {
                    const currentCoach = coachRef.current;
                    if (currentCoach.isCoachMode && currentCoach.duoPhase === 'reciter') {
                        audio.pause();
                        setIsPlaying(false);
                        handleCoachReciterFinished(currentCoach);
                        return;
                    }

                    if (currentRepeat < maxRepeats) {
                        setCurrentRepeat(prev => prev + 1);

                        audio.pause(); // Prevent another animation frame from advancing twice.
                        // Restart at start position
                        setCurrentAyahIndex(selectedTimeRange.startAyahIdx);
                        setSeekOnLoad(selectedTimeRange.start);
                        return;
                    } else {
                        stopPlayback();
                        setCurrentRepeat(1);
                        return;
                    }
                } else if (!isFinalVerseInRange && audio.currentTime >= (audio.duration - margin)) {
                    audio.pause();
                    // Navigate to next ayah normally within the range
                    setCurrentAyahIndex(prev => prev + 1);
                    setSeekOnLoad(0); // Ensure next start from 0
                    return;
                }

                // Force seek on start verse if needed (extra safety)
                if (isStartVerseInRange && seekOnLoad === null && audio.currentTime < selectedTimeRange.start - 0.2) {
                    audio.currentTime = selectedTimeRange.start;
                }
            } else if (isPlaying && audio.currentTime >= (audio.duration - (isIOS ? 0.3 : 0.05))) {
                // Fallback for when no time range is selected (playing entire surah/page without selection)
                // Or in Duo Mode when playing a single un-selected verse
                const currentCoach = coachRef.current;
                if (currentCoach.isCoachMode && currentCoach.duoPhase === 'reciter') {
                    audio.pause();
                    setIsPlaying(false);
                    handleCoachReciterFinished(currentCoach);
                    return;
                }
            }

            // Sync highlighting
            if (wordTimings) {
                const index = getCurrentWordIndex(audio.currentTime * 1000, wordTimings.words);
                setActiveWordIndex(index);
            }

            rafId = requestAnimationFrame(checkLoopPoint);
        };

        const startRAF = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(checkLoopPoint);
            }
        };

        const stopRAF = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('play', startRAF);
        audio.addEventListener('pause', stopRAF);
        // React's onEnded owns this event. A second listener would advance twice
        // and accumulate on every player effect refresh.
        audio.addEventListener('loadedmetadata', updateDuration);

        // Start RAF if already playing
        if (isPlaying && !audio.paused) {
            startRAF();
        }

        return () => {
            stopRAF();
            audio.removeEventListener('play', startRAF);
            audio.removeEventListener('pause', stopRAF);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [wordTimings, selectedTimeRange, isPlaying, currentRepeat, maxRepeats, pokeEndTime, currentAyahIndex, seekOnLoad, handleCoachReciterFinished, stopPlayback]);

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="hifdh-page">
            <div className="hifdh-page__header-row">
                <h1 className="hifdh-page__header">{t('hifdh.title', 'Studio Hifdh')}</h1>
            </div>

            <div style={{padding:"0 16px"}}><Link className="learning-btn" to={passageUrl({surah:selectedSurah,ayah:ayahs[currentAyahIndex]?.numberInSurah || startAyah}) + (new URLSearchParams(location.search).get('step') ? '&step=' + encodeURIComponent(new URLSearchParams(location.search).get('step')!) : '')}>Comprendre et noter ma progression</Link></div>
            {loadError && <div className="coach-feedback" role="alert">
                <p>{loadError}</p>
                <button className="coach-action" onClick={() => setReloadPassage(value => value + 1)}>Réessayer le chargement</button>
            </div>}

            <section className="hifdh-session-home" aria-label="Ma séance">
                {savedSession && <button onClick={resumeSession}>Reprendre ma séance <small>{surahs.find(s=>s.number===savedSession.surah)?.englishName || `Sourate ${savedSession.surah}`} · verset {savedSession.ayah}</small></button>}
                <button onClick={()=>setLibraryOpen(v=>!v)} aria-expanded={libraryOpen}>Mes révisions <small>{dueCards.length} aujourd’hui · {allCards.length} au total</small></button>
            </section>
            {!sessionSaved && <p role="alert">La sauvegarde de séance est indisponible sur cet appareil.</p>}
            {libraryOpen && <section className="hifdh-review-library" aria-label="Toutes mes révisions">
                <h2>Mes révisions du jour</h2>
                {dueCards.length ? <button className="hifdh-primary" onClick={()=>startQueue(dueCards.map(c=>({surah:c.surah,start:c.ayah,end:c.ayah})))}>Commencer les {dueCards.length} révisions</button> : <p>Aucune révision prévue aujourd’hui.</p>}
                <div className="hifdh-review-list">{[...allCards].sort((a,b)=>a.nextReviewDate.localeCompare(b.nextReviewDate)).map(card=><button key={card.id} onClick={()=>loadFromSRS(card.surah,card.ayah)}><strong>{surahs.find(s=>s.number===card.surah)?.englishName || `Sourate ${card.surah}`} · {card.ayah}</strong><small>{dueCards.some(c=>c.id===card.id)?'À réviser aujourd’hui':`Prochaine révision : ${new Date(card.nextReviewDate+'T12:00:00').toLocaleDateString('fr-FR')}`}</small></button>)}</div>
            </section>}
            <nav className="hifdh-steps" aria-label="Étapes de la séance">{(['listen','recite','review'] as const).map((value,i)=><button key={value} aria-current={step===value?'step':undefined} onClick={()=>{sessionTouched.current=true;stopPlayback();void coach.stopCoachListening();coach.setDuoPhase('waiting');setStep(value);}}><span>{i+1}</span>{['Écouter','Réciter','Réviser'][i]}</button>)}</nav>
            {queue.length>0 && <div className="hifdh-queue-status" role="status">Passage {queueIndex+1} sur {queue.length}<button onClick={advanceReview}>{queueIndex+1<queue.length?'Passage suivant':'Terminer la série'}</button></div>}
            <section className="hifdh-guided-action">
                <p>{step==='listen'?'Écoutez le passage, puis récitez à votre rythme.':step==='recite'?'Récitez le passage. Le suivi vocal vous aide à repérer les mots à retravailler.':'Évaluez votre rappel et préparez votre prochaine séance.'}</p>
                <button className="hifdh-primary" disabled={!currentAyah} onClick={()=>{
                    sessionTouched.current=true;
                    if(step==='listen'){if(coach.isCoachMode)coach.selectCoachMode(null);handlePlayPause();}
                    else if(step==='recite'){
                        stopPlayback();
                        if(coach.isListening || coach.isStarting){void coach.stopCoachListening();setStep('review');}
                        else{if(!coach.isCoachMode)coach.selectCoachMode('solo');coach.setDuoPhase('student');void coach.startCoachListening(currentAyahIndex);}
                    } else {stopPlayback();void coach.stopCoachListening();document.getElementById('hifdh-review-summary')?.scrollIntoView({behavior:'smooth',block:'start'});}
                }}>{step==='listen'?(isPlaying?'Mettre en pause':'Écouter le passage'):step==='recite'?(coach.isStarting?'Arrêter la préparation':coach.isListening?'Terminer ma récitation':'Commencer ma récitation'):'Voir mon bilan et mes révisions'}</button>
                {step==='listen' && <button className="hifdh-text-action" disabled={!currentAyah} onClick={()=>{stopPlayback();setStep('recite');sessionTouched.current=true;}}>Passer à la récitation →</button>}
            </section>
            {/* Selection */}
            <details className="hifdh-passage-settings" onClickCapture={()=>{sessionTouched.current=true;}} onChangeCapture={()=>{sessionTouched.current=true;}}>
            <summary>{surahs.find(s=>s.number===selectedSurah)?.englishName || 'Choisir un passage'} · versets {startAyah}–{endAyah}<span>Modifier</span></summary>
            <div className="hifdh-selection">
                <div className="hifdh-selection__row">
                    <select
                        className="hifdh-selection__select"
                        value={selectedSurah}
                        aria-label="Sourate à mémoriser"
                        onChange={(e) => {const number=Number(e.target.value);setSelectedSurah(number);setStartAyah(1);setEndAyah(Math.min(5,surahs.find(s=>s.number===number)?.numberOfAyahs||5));sessionTouched.current=true;setQueue([]);}}
                    >
                        {surahs.map((s) => (
                            <option key={s.number} value={s.number}>
                                {s.number}. {s.name} ({s.englishName})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="hifdh-verse-range">
                    <label className="hifdh-verse-range__label">{t('hifdh.versesRange', 'Versets :')}</label>
                    <div className="hifdh-verse-range__controls">
                        <div className="hifdh-verse-range__group">
                            <button
                                className="hifdh-verse-btn"
                                aria-label="Reculer le début du passage" onClick={() => setStartAyah(Math.max(1, startAyah - 1))}
                                disabled={startAyah <= 1}
                            >−</button>
                            <select
                                className="hifdh-verse-select"
                                aria-label="Premier verset" value={startAyah}
                                onChange={(e) => setStartAyah(parseInt(e.target.value))}
                            >
                                {Array.from({ length: endAyah }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <button
                                className="hifdh-verse-btn"
                                aria-label="Avancer le début du passage" onClick={() => setStartAyah(Math.min(endAyah, startAyah + 1))}
                                disabled={startAyah >= endAyah}
                            >+</button>
                        </div>
                        <span className="hifdh-verse-range__separator">→</span>
                        <div className="hifdh-verse-range__group">
                            <button
                                className="hifdh-verse-btn"
                                aria-label="Reculer la fin du passage" onClick={() => setEndAyah(Math.max(startAyah, endAyah - 1))}
                                disabled={endAyah <= startAyah}
                            >−</button>
                            <select
                                className="hifdh-verse-select"
                                aria-label="Dernier verset" value={endAyah}
                                onChange={(e) => setEndAyah(parseInt(e.target.value))}
                            >
                                {Array.from({ length: maxAyahs - startAyah + 1 }, (_, i) => startAyah + i).map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <button
                                className="hifdh-verse-btn"
                                aria-label="Avancer la fin du passage" onClick={() => setEndAyah(Math.min(maxAyahs, endAyah + 1))}
                                disabled={endAyah >= maxAyahs}
                            >+</button>
                        </div>
                        <span className="hifdh-verse-range__total">/ {maxAyahs}</span>
                    </div>
                    <div className="hifdh-verse-range__actions">
                        <button
                            className="hifdh-verse-range__preset"
                            onClick={() => { setStartAyah(1); setEndAyah(maxAyahs); }}
                        >
                            {t('common.all', 'Tout')}
                        </button>
                        <button
                            className="hifdh-verse-range__preset"
                            onClick={() => { setEndAyah(startAyah); }}
                        >
                            {t('hifdh.oneVerse', '1 verset')}
                        </button>
                        <button
                            className="hifdh-verse-range__preset"
                            onClick={() => { setEndAyah(Math.min(startAyah + 4, maxAyahs)); }}
                        >
                            {t('hifdh.fiveVerses', '5 versets')}
                        </button>
                        <button
                            className={`hifdh-verse-range__preset ${singleVerseMode ? 'hifdh-verse-range__preset--active' : ''}`}
                            onClick={() => {
                                const next = !singleVerseMode;
                                setSingleVerseMode(next);
                                try { localStorage.setItem('hifdh-single-verse', String(next)); } catch { }
                            }}
                            title={singleVerseMode ? t('hifdh.showAllVerses', 'Afficher tous les versets') : t('hifdh.showOneVerse', 'Afficher 1 seul verset')}
                        >
                            {singleVerseMode ? <AlignJustify size={14} /> : <BookOpen size={14} />}
                            {singleVerseMode ? ` ${t('common.all', 'Tous')}` : ` ${t('hifdh.focus', 'Focus')}`}
                        </button>
                    </div>
                </div>
            </div>

            </details>
            {audioError && <p className="hifdh-audio-error" role="alert">{audioError}</p>}
            {/* Main Player Area */}
            <div className="hifdh-main-card">
                <audio
                    ref={audioRef}
                    onEnded={handleAudioEnded}
                    onPlay={()=>setIsPlaying(true)}
                    onPause={()=>setIsPlaying(false)}
                    onError={()=>{stopPlayback();setAudioError('Impossible de charger cet audio. Réessayez avec Écouter.');}}
                />

                {/* Surah Header Ornament */}
                {surahs.find(s => s.number === selectedSurah) && (
                    <div className="hifdh-surah-header-ornament">
                        <div className="hifdh-surah-header-text">{surahs.find(s => s.number === selectedSurah)?.name}</div>
                    </div>
                )}

                {/* Ayah View — Vertical List */}
                <div className="hifdh-ayah-container">
                    {ayahs.length > 0 ? (
                        <div className="hifdh-verses-list">
                            {(singleVerseMode ? [{ ayah: ayahs[currentAyahIndex], aIdx: currentAyahIndex }] : ayahs.map((ayah, aIdx) => ({ ayah, aIdx }))).map(({ ayah, aIdx }) => {
                                const isActive = aIdx === currentAyahIndex;
                                const wordsContent = isActive && wordTimings && (!coach.isCoachMode || wordTimings.words.length === recitationWords(ayah.text).length)
                                    ? wordTimings.words.map((word, wIdx) => {
                                        const isSelected = selectionStart !== null && selectionEnd !== null &&
                                            (aIdx * 1000 + wIdx) >= (selectionStart.ayahIndex * 1000 + selectionStart.wordIndex) &&
                                            (aIdx * 1000 + wIdx) <= (selectionEnd.ayahIndex * 1000 + selectionEnd.wordIndex);
                                        const isPartiallySelected = selectionStart !== null && selectionEnd === null &&
                                            selectionStart.ayahIndex === aIdx && selectionStart.wordIndex === wIdx;

                                        let coachClass = '';
                                        let wordState: string | undefined;
                                        if (coach.isCoachMode) {
                                            const key = `${aIdx}-${wIdx}`;
                                            wordState = coach.wordStates.get(key);
                                            if (wordState === 'correct') coachClass = 'hifdh-word--correct';
                                            else if (wordState === 'error') coachClass = 'hifdh-word--error';
                                            else if (wordState === 'current') coachClass = 'hifdh-word--current';
                                        }

                                        const isBlind = coach.isCoachMode && coach.blindMode;
                                        const isRevealed = wordState === 'correct';
                                        const showText = !isBlind || isRevealed;

                                        return (
                                            <span
                                                key={`${aIdx}-${wIdx}`}
                                                className={`hifdh-word hifdh-word--active-ayah
                                                    ${activeWordIndex === wIdx ? 'highlight' : ''}
                                                    ${isSelected ? 'range-selected' : ''}
                                                    ${isPartiallySelected ? 'single-selected' : ''}
                                                    ${coachClass}
                                                    ${isBlind && !isRevealed ? 'hifdh-word--blind' : ''}
                                                    ${isBlind && isRevealed ? 'hifdh-word--revealed' : ''}
                                                `}
                                                onClick={() => handleWordClick(aIdx, wIdx)}
                                            >
                                                {showText ? word.text : '●●●'}{' '}
                                            </span>
                                        );
                                    })
                                    : recitationWords(ayah.text).map((wordText, wIdx) => {
                                        const isSelected = selectionStart !== null && selectionEnd !== null &&
                                            (aIdx * 1000 + wIdx) >= (selectionStart.ayahIndex * 1000 + selectionStart.wordIndex) &&
                                            (aIdx * 1000 + wIdx) <= (selectionEnd.ayahIndex * 1000 + selectionEnd.wordIndex);
                                        const isPartiallySelected = selectionStart !== null && selectionEnd === null &&
                                            selectionStart.ayahIndex === aIdx && selectionStart.wordIndex === wIdx;

                                        let coachClass = '';
                                        let wordState: string | undefined;
                                        if (coach.isCoachMode) {
                                            const key = `${aIdx}-${wIdx}`;
                                            wordState = coach.wordStates.get(key);
                                            if (wordState === 'correct') coachClass = 'hifdh-word--correct';
                                            else if (wordState === 'error') coachClass = 'hifdh-word--error';
                                            else if (wordState === 'current') coachClass = 'hifdh-word--current';
                                        }

                                        const isBlind = coach.isCoachMode && coach.blindMode;
                                        const isRevealed = wordState === 'correct';
                                        const showText = !isBlind || isRevealed;

                                        return (
                                            <span
                                                key={`${aIdx}-${wIdx}`}
                                                className={`hifdh-word hifdh-word--dimmed
                                                    ${isSelected ? 'range-selected' : ''}
                                                    ${isPartiallySelected ? 'single-selected' : ''}
                                                    ${coachClass}
                                                    ${isBlind && !isRevealed ? 'hifdh-word--blind' : ''}
                                                    ${isBlind && isRevealed ? 'hifdh-word--revealed' : ''}
                                                `}
                                                onClick={() => handleWordClick(aIdx, wIdx)}
                                            >
                                                {showText ? wordText : '●●●'}{' '}
                                            </span>
                                        );
                                    });

                                return (
                                    <div key={ayah.number} className={`hifdh-verse-card ${isActive ? 'hifdh-verse-card--active' : ''}`}>
                                        <div className="hifdh-verse-card__header">
                                            <span className="hifdh-verse-card__badge">{selectedSurah}:{ayah.numberInSurah}</span>
                                            <div style={{ position: 'relative' }}>
                                                <button 
                                                    className="hifdh-verse-card__more" aria-label={`Options du verset ${ayah.numberInSurah}`}
                                                    onClick={() => setActiveMenu(activeMenu === ayah.number ? null : ayah.number)}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeMenu === ayah.number && (
                                                    <div className="hifdh-verse-card__menu">
                                                        <button 
                                                            onClick={() => {
                                                                setActiveMenu(null);
                                                                // Bookmark (sauvegarde locale dans un 1er temps)
                                                                localStorage.setItem('hifdh-bookmark', JSON.stringify({ surah: selectedSurah, ayah: ayah.numberInSurah }));
                                                                const saved={surah:selectedSurah,start:startAyah,end:endAyah,ayah:ayah.numberInSurah,speed:playbackSpeed,repeats:maxRepeats,phonetics:showPhonetics,focus:singleVerseMode,step};
                                                                localStorage.setItem(HIFDH_SESSION_KEY,JSON.stringify(saved));setSavedSession(saved);
                                                                alert(`Verset ${selectedSurah}:${ayah.numberInSurah} mis en favori !`);
                                                            }}
                                                        >
                                                            <Bookmark size={14} style={{ marginRight: '8px' }} />
                                                            Mettre en favori
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setActiveMenu(null);
                                                                let textToCopy = ayah.text;
                                                                if (translations.has(ayah.number)) {
                                                                    textToCopy += `\n\n${translations.get(ayah.number)}`;
                                                                }
                                                                navigator.clipboard.writeText(textToCopy);
                                                                alert('Texte copié !');
                                                            }}
                                                        >
                                                            <Copy size={14} style={{ marginRight: '8px' }} />
                                                            Copier le texte
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setActiveMenu(null);
                                                                setCurrentAyahIndex(aIdx);
                                                                setSingleVerseMode(true); // Enable Focus Mode equivalent
                                                                localStorage.setItem('hifdh-single-verse', 'true');
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                        >
                                                            <Maximize size={14} style={{ marginRight: '8px' }} />
                                                            Isoler ce verset
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="hifdh-verse-card__arabic" dir="rtl">
                                            {wordsContent}
                                            <span className={`hifdh-verse-marker ${isActive ? 'hifdh-verse-marker--active' : ''}`}>
                                                ﴿{ayah.numberInSurah}﴾
                                            </span>
                                        </div>

                                        {showPhonetics && transliterations.has(ayah.number) && (
                                            <div className="hifdh-verse-card__phonetics" dir="ltr">
                                                {transliterations.get(ayah.number)}
                                            </div>
                                        )}

                                        {translations.has(ayah.number) && (
                                            <div className="hifdh-verse-card__translation" dir="ltr">
                                                {translations.get(ayah.number)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="hifdh-loading-ayah">
                            {currentAyah?.text || t('common.loading', 'Chargement...')}
                        </div>
                    )}

                    {/* Phonetics Display moved per card */}
                </div>

                {/* Player Controls */}
                <div className="hifdh-player-ui" aria-label="Commandes audio">
                    <div className="hifdh-player__progress">
                        <span className="hifdh-player__time">{formatTime(currentTime)}</span>
                        <div className="hifdh-player__progress-bar">
                            <div
                                className="hifdh-player__progress-fill"
                                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            />
                        </div>
                        <span className="hifdh-player__time">{formatTime(duration)}</span>
                    </div>

                    <div className="hifdh-player__controls">
                        <button className="hifdh-player__btn" aria-label={isPlaying?'Mettre en pause':'Écouter le passage'} disabled={!currentAyah} onClick={handlePlayPause}>
                            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                        </button>
                        <button className="hifdh-player__btn" aria-label="Arrêter l’écoute" onClick={() => {
                            stopPlayback();
                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                setIsPlaying(false);
                            }
                        }}><Square size={18} /></button>
                        <button className={`hifdh-player__btn ${isLooping ? 'hifdh-player__btn--active' : ''}`} aria-label="Répéter la plage en continu" aria-pressed={isLooping} onClick={() => setIsLooping(!isLooping)}>
                            <Repeat size={20} />
                        </button>
                        <button
                            className={`hifdh-coach-toggle ${isWordSelectionMode ? 'active' : ''}`}
                            onClick={() => {
                                setIsWordSelectionMode(!isWordSelectionMode);
                                if (isWordSelectionMode) resetSelection();
                            }}
                            title={isWordSelectionMode ? t('hifdh.disableWordSelection', 'Désactiver la sélection de mots') : t('hifdh.enableWordSelection', 'Activer la sélection de mots en boucle')}
                        >
                            <MousePointerClick size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions — Selection info */}
            {selectionStart !== null && !coach.isCoachMode && (
                <div className="hifdh-selection-bar">
                    <span>{t('hifdh.activeWordLoop', 'Boucle active de mots')}</span>
                    <button onClick={resetSelection}><RotateCcw size={14} /> {t('common.reset', 'Réinitialiser')}</button>
                </div>
            )}

            {/* Auto-advance toast */}
            {
                autoAdvanceCountdown && (
                    <div className="hifdh-auto-advance-toast">
                        {currentAyahIndex < ayahs.length - 1 ? 'Verset suivant…' : 'Fin de la séance…'}
                    </div>
                )
            }

            {/* Coach Overlay (progress bar, mic, modals) */}
            <CoachOverlay
                coach={coach}
                audioPlaying={isPlaying}
                stopAudio={stopPlayback}
                playAyahAtIndex={async () => { if (audioRef.current) { audioRef.current.currentTime = 0; await safePlay(); } }}
                onRetryAyah={(index) => {
                    stopPlayback();
                    setCurrentAyahIndex(index);
                    coach.setDuoPhase('student');
                    void coach.startCoachListening(index);
                }}
                onReviewAyah={(index) => {
                    const ayah = ayahs[index];
                    if (ayah) addCard(selectedSurah, ayah.numberInSurah);
                }}
                pageAyahsLength={ayahs.length}
                expectedText={ayahs.map(a => a.text).join(' ')}
            />

            <section id="hifdh-review-summary" className="hifdh-summary">
                <h2>Mon bilan</h2>
                {coach.coachTotalProcessed>0 ? <><p><strong>{coach.coachTotalProcessed-coach.coachMistakesCount}</strong> mots reconnus · <strong>{coach.coachMistakesCount}</strong> à retravailler</p><small>Indication de reconnaissance vocale. Confirmez vous-même votre mémorisation.</small></> : <p>Après votre récitation, évaluez votre rappel pour planifier la prochaine révision.</p>}
                {hardPassages.length>0 && <><button className="hifdh-primary" onClick={()=>startQueue(hardPassages,'recite')}>Refaire mes {hardPassages.length} passages difficiles</button><details><summary>Mots à retravailler ({reviewLog.length})</summary><div className="hifdh-review-list">{hardPassages.map(p=><button key={`${p.surah}:${p.start}`} onClick={()=>startQueue([p],'recite')}><strong>{surahs.find(s=>s.number===p.surah)?.englishName || `Sourate ${p.surah}`} · verset {p.start}</strong><span lang="ar" dir="rtl">{reviewLog.filter(e=>difficultPassages([e]).some(v=>v.surah===p.surah&&v.start===p.start)).map(e=>e.expected).join(' · ')}</span></button>)}</div></details></>}
                {currentAyah && <SRSControls surah={selectedSurah} ayah={currentAyah.numberInSurah} onReviewComplete={advanceReview}/>}
                <p className="hifdh-next-review">{dueCards.length ? `${dueCards.length} verset(s) à réviser aujourd’hui` : allCards.length ? `Prochaine révision : ${new Date([...allCards].sort((a,b)=>a.nextReviewDate.localeCompare(b.nextReviewDate))[0].nextReviewDate+'T12:00:00').toLocaleDateString('fr-FR')}` : 'Ajoutez un verset pour programmer vos révisions.'}</p>
            </section>

            {/* Secondary Controls (Speed, Repeat) */}
            <details className="hifdh-extra-settings" open={settingsOpen} onToggle={e=>setSettingsOpen(e.currentTarget.open)} onClickCapture={()=>{sessionTouched.current=true;}} onChangeCapture={()=>{sessionTouched.current=true;}}><summary>Réglages · vitesse, répétitions, phonétique</summary>
            <div className="hifdh-footer-controls">
                <div className="hifdh-control-group">
                    <button
                        className={`hifdh-footer-btn hifdh-phonetics-toggle ${showPhonetics ? 'active' : ''}`}
                        onClick={() => setShowPhonetics(!showPhonetics)}
                        title={t('hifdh.showPhonetics', 'Afficher la phonétique')}
                    >
                        <Languages size={18} />
                        <span>{t('hifdh.phonetics', 'Phonétique')}</span>
                    </button>
                    <div className="hifdh-speed-row">
                        {PLAYBACK_SPEEDS.filter(s => s >= 0.75).map(speed => (
                            <button
                                key={speed}
                                className={playbackSpeed === speed ? 'active' : ''}
                                onClick={() => setPlaybackSpeed(speed)}
                            >{speed}x</button>
                        ))}
                    </div>
                </div>

                <div className="hifdh-repeat-control">
                    <button aria-label="Diminuer les répétitions" onClick={() => setMaxRepeats(prev => Math.max(1, prev - 1))}><Minus size={16} /></button>
                    <span className="hifdh-repeat-stat">{t('hifdh.reps', '{{current}}/{{max}} reps', { current: currentRepeat, max: maxRepeats })}</span>
                    <button aria-label="Augmenter les répétitions" onClick={() => setMaxRepeats(prev => Math.min(20, prev + 1))}><Plus size={16} /></button>
                </div>
            </div>

            </details>
        </div >
    );
}
