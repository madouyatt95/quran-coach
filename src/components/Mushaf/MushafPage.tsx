import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
    Settings,
    Menu,
    Search,
    Type,
    Layout,
    Music,
    Mic,
    CheckCircle2,
    Circle,
    X,
    Palette,
    Loader2,
    Eye,
    EyeOff,
    SkipBack,
    SkipForward,
    Play,
    Pause,
    Volume2,
    Languages,
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Copy,
    Check,
    Square,
    MicOff
} from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore, RECITERS } from '../../stores/settingsStore';
import { fetchPage, fetchSurahs, getAudioUrl, fetchPageTranslation, fetchPageTransliteration, searchQuran } from '../../lib/quranApi';
import { fetchTajweedPage, getTajweedCategories, type TajweedVerse } from '../../lib/tajweedService';
import { renderTajweedText } from '../../lib/tajweedParser';
import { SideMenu } from '../Navigation/SideMenu';
import { KhatmTracker, KhatmPageBadge } from '../Khatm/KhatmTracker';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { speechRecognitionService } from '../../lib/speechRecognition';
import { getSupportedMimeType } from '../../lib/audioUnlock';
import { playTts } from '../../lib/ttsService';
import type { Ayah } from '../../types';
import './MushafPage.css';

const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';

// French surah name translations
const SURAH_NAMES_FR: Record<number, string> = {
    1: "L'Ouverture", 2: "La Vache", 3: "La Famille d'Imran", 4: "Les Femmes", 5: "La Table Servie",
    6: "Les Bestiaux", 7: "Les Murailles", 8: "Le Butin", 9: "Le Repentir", 10: "Jonas",
    11: "Houd", 12: "Joseph", 13: "Le Tonnerre", 14: "Abraham", 15: "Al-Hijr",
    16: "Les Abeilles", 17: "Le Voyage Nocturne", 18: "La Caverne", 19: "Marie", 20: "Ta-Ha",
    21: "Les Prophètes", 22: "Le Pèlerinage", 23: "Les Croyants", 24: "La Lumière", 25: "Le Discernement",
    26: "Les Poètes", 27: "Les Fourmis", 28: "Le Récit", 29: "L'Araignée", 30: "Les Romains",
    31: "Luqman", 32: "La Prosternation", 33: "Les Coalisés", 34: "Saba", 35: "Le Créateur",
    36: "Ya-Sin", 37: "Les Rangées", 38: "Sad", 39: "Les Groupes", 40: "Le Pardonneur",
    41: "Les Versets Détaillés", 42: "La Consultation", 43: "L'Ornement", 44: "La Fumée", 45: "L'Agenouillée",
    46: "Al-Ahqaf", 47: "Muhammad", 48: "La Victoire", 49: "Les Appartements", 50: "Qaf",
    51: "Qui Éparpillent", 52: "Le Mont", 53: "L'Étoile", 54: "La Lune", 55: "Le Tout Miséricordieux",
    56: "L'Événement", 57: "Le Fer", 58: "La Discussion", 59: "L'Exode", 60: "L'Éprouvée",
    61: "Le Rang", 62: "Le Vendredi", 63: "Les Hypocrites", 64: "La Fausse Alerte", 65: "Le Divorce",
    66: "L'Interdiction", 67: "La Royauté", 68: "La Plume", 69: "Celle qui Montre la Vérité", 70: "Les Voies d'Ascension",
    71: "Noé", 72: "Les Djinns", 73: "L'Enveloppé", 74: "Le Revêtu d'un Manteau", 75: "La Résurrection",
    76: "L'Homme", 77: "Les Envoyés", 78: "La Nouvelle", 79: "Les Anges qui Arrachent", 80: "Il s'est Renfrogné",
    81: "L'Obscurcissement", 82: "La Rupture", 83: "Les Fraudeurs", 84: "La Déchirure", 85: "Les Constellations",
    86: "L'Astre Nocturne", 87: "Le Très-Haut", 88: "L'Enveloppante", 89: "L'Aube", 90: "La Cité",
    91: "Le Soleil", 92: "La Nuit", 93: "Le Jour Montant", 94: "L'Ouverture de la Poitrine", 95: "Le Figuier",
    96: "L'Adhérence", 97: "La Destinée", 98: "La Preuve", 99: "La Secousse", 100: "Les Coursiers",
    101: "Le Fracas", 102: "La Course aux Richesses", 103: "Le Temps", 104: "Le Calomniateur", 105: "L'Éléphant",
    106: "Quraych", 107: "L'Ustensile", 108: "L'Abondance", 109: "Les Infidèles", 110: "Le Secours Divin",
    111: "Les Fibres", 112: "Le Monothéisme Pur", 113: "L'Aube Naissante", 114: "Les Hommes"
};

// Juz start pages (1-indexed, 30 juz)
const JUZ_START_PAGES: number[] = [
    1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
    201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

// simple Mobile detection (Android + iOS)
const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

type WordState = 'correct' | 'error' | 'current' | 'unread';

// Masking modes
type MaskMode = 'visible' | 'hidden' | 'partial' | 'minimal';

// Convert Western numbers to Arabic-Indic numerals
function toArabicNumbers(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

// Juz info helper
function getJuzNumber(ayahs: Ayah[]): number {
    if (ayahs.length === 0) return 1;
    return ayahs[0].juz || 1;
}



export function MushafPage() {
    const {
        currentPage,
        surahs,
        setSurahs,
        nextPage,
        prevPage,
        setPageAyahs,
        pageAyahs,
        goToSurah,
        goToPage,
    } = useQuranStore();

    const { arabicFontSize, tajwidLayers, toggleTajwidLayer, selectedReciter, tajwidEnabled, toggleTajwid, setArabicFontSize, setReciter, showTranslation, toggleTranslation, showTransliteration, toggleTransliteration } = useSettingsStore();
    const { toggleFavorite, isFavorite } = useFavoritesStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tajweedVerses, setTajweedVerses] = useState<TajweedVerse[]>([]);
    const [translationMap, setTranslationMap] = useState<Map<number, string>>(new Map());
    const [transliterationMap, setTransliterationMap] = useState<Map<number, string>>(new Map());

    // Panels
    const [showTajweedSheet, setShowTajweedSheet] = useState(false);
    const [showMaskSheet, setShowMaskSheet] = useState(false);
    const [showFontSheet, setShowFontSheet] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [showReciterSheet, setShowReciterSheet] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Share modal
    const [shareAyah, setShareAyah] = useState<Ayah | null>(null);
    const [copied, setCopied] = useState(false);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    // Masking
    const [maskMode, setMaskMode] = useState<MaskMode>('visible');
    const [partialHidden, setPartialHidden] = useState<Set<string>>(new Set());

    // Coach mode
    const [isCoachMode, setIsCoachMode] = useState(false);
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

    // Background/visibility tracking
    const isHiddenRef = useRef(false);
    const pendingAutoAdvance = useRef(false);

    // Audio
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioActive, setAudioActive] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(0);
    const [playingIndex, setPlayingIndex] = useState(-1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const shouldAutoPlay = useRef(false);

    // Refs to avoid stale closures in audio callbacks
    const playingIndexRef = useRef(-1);
    const pageAyahsRef = useRef<Ayah[]>([]);
    const currentPageRef = useRef(currentPage);



    // Swipe gesture
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);

    // Page validation
    const [validatedPages, setValidatedPages] = useState<Set<number>>(() => {
        try {
            const saved = localStorage.getItem('quran-coach-validated-pages');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    // Sync currentPageRef synchronously (not via useEffect)
    currentPageRef.current = currentPage;

    const tajweedCategories = useMemo(() => getTajweedCategories(), []);

    // Current page surah names
    const pageSurahNames = useMemo(() => {
        const surahNums = [...new Set(pageAyahs.map(a => a.surah))];
        return surahNums.map(num => {
            const s = surahs.find(s => s.number === num);
            return s ? { number: num, name: s.name, englishName: s.englishName } : null;
        }).filter(Boolean) as { number: number; name: string; englishName: string }[];
    }, [pageAyahs, surahs]);



    // Juz
    const juzNumber = useMemo(() => getJuzNumber(pageAyahs), [pageAyahs]);

    // Fetch surahs list
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs).catch(() => { });
        }
    }, [surahs.length, setSurahs]);

    // Scroll to a specific verse with retry (waits for DOM render)
    const scrollToVerse = useCallback((surah: number, ayah: number) => {
        let attempts = 0;
        const tryScroll = () => {
            const el = document.querySelector(`[data-surah="${surah}"][data-ayah="${ayah}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlighted-from-shazam');
                setTimeout(() => el.classList.remove('highlighted-from-shazam'), 3000);
            } else if (attempts < 10) {
                attempts++;
                setTimeout(tryScroll, 150);
            }
        };
        setTimeout(tryScroll, 200);
    }, []);

    // Fetch page content
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetchPage(currentPage),
            fetchTajweedPage(currentPage),
            showTranslation ? fetchPageTranslation(currentPage) : Promise.resolve(new Map<number, string>()),
            showTransliteration ? fetchPageTransliteration(currentPage) : Promise.resolve(new Map<number, string>())
        ]).then(([ayahs, tajweed, translations, transliterations]) => {
            setPageAyahs(ayahs);
            pageAyahsRef.current = ayahs; // sync ref immediately
            setTajweedVerses(tajweed);
            setTranslationMap(translations);
            setTransliterationMap(transliterations);
            setIsLoading(false);

            // Generate partial hidden words
            if (maskMode === 'partial') {
                generatePartialMask(ayahs);
            }

            // Handle scrollToAyah from Shazam or Search
            const scrollData = sessionStorage.getItem('scrollToAyah');
            if (scrollData) {
                try {
                    const { surah, ayah } = JSON.parse(scrollData);
                    sessionStorage.removeItem('scrollToAyah');
                    scrollToVerse(surah, ayah);
                } catch (e) {
                    console.error('Failed to parse scrollToAyah', e);
                }
            }
        }).catch(() => {
            setError('Impossible de charger la page. Vérifiez votre connexion.');
            setIsLoading(false);
        });
    }, [currentPage, setPageAyahs, showTranslation, showTransliteration]);

    // Regenerate partial mask when mode changes
    useEffect(() => {
        if (maskMode === 'partial') {
            generatePartialMask(pageAyahs);
        }
    }, [maskMode]);

    // Generate partial mask (randomly hide ~50% of words)
    const generatePartialMask = useCallback((ayahs: Ayah[]) => {
        const hidden = new Set<string>();
        ayahs.forEach((ayah, ayahIndex) => {
            const words = ayah.text.split(/\s+/).filter(w => w.length > 0);
            words.forEach((_, wordIndex) => {
                if (Math.random() > 0.5) {
                    hidden.add(`${ayahIndex}-${wordIndex}`);
                }
            });
        });
        setPartialHidden(hidden);
    }, []);

    // Page validation
    const togglePageValidation = useCallback(() => {
        setValidatedPages(prev => {
            const next = new Set(prev);
            if (next.has(currentPage)) {
                next.delete(currentPage);
            } else {
                next.add(currentPage);
            }
            localStorage.setItem('quran-coach-validated-pages', JSON.stringify([...next]));
            return next;
        });
    }, [currentPage]);

    const isPageValidated = validatedPages.has(currentPage);

    // Audio playback - play all ayahs on page sequentially
    const playAyahAtIndex = useCallback((idx: number) => {
        const ayahs = pageAyahsRef.current;
        if (!ayahs[idx] || !audioRef.current) return;

        playingIndexRef.current = idx; // sync ref immediately before audio starts
        setAudioActive(true);
        setAudioPlaying(true);
        const ayah = ayahs[idx];
        setPlayingIndex(idx);
        setCurrentPlayingAyah(ayah.number);
        audioRef.current.src = getAudioUrl(selectedReciter, ayah.number);
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => { });
    }, [selectedReciter, playbackSpeed]);

    const playNextAyah = useCallback(() => {
        const idx = playingIndexRef.current;
        const ayahs = pageAyahsRef.current;
        const page = currentPageRef.current;

        if (idx < ayahs.length - 1) {
            playAyahAtIndex(idx + 1);
        } else if (page < 604) {
            // Auto-advance to next page
            shouldAutoPlay.current = true;
            nextPage();
        } else {
            setAudioPlaying(false);
            setAudioActive(false);
            setPlayingIndex(-1);
            setCurrentPlayingAyah(0);
        }
    }, [playAyahAtIndex, nextPage]);

    const playPrevAyah = useCallback(() => {
        if (playingIndexRef.current > 0) {
            playAyahAtIndex(playingIndexRef.current - 1);
        }
    }, [playAyahAtIndex]);

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

    // Handle audio ended - use ref to always have latest callback
    const playNextAyahRef = useRef(playNextAyah);
    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.onended = () => playNextAyahRef.current();
    }, []);

    // Auto-resume after page change
    useEffect(() => {
        if (shouldAutoPlay.current && pageAyahs.length > 0 && audioActive) {
            shouldAutoPlay.current = false;
            playAyahAtIndex(0);
        }
    }, [pageAyahs, audioActive, playAyahAtIndex]);

    // Visibility change handler - preserve audio & tracking in background
    useEffect(() => {
        const handleVisibilityChange = () => {
            isHiddenRef.current = document.hidden;

            // When user comes back and there's a pending page advance
            if (!document.hidden && pendingAutoAdvance.current) {
                pendingAutoAdvance.current = false;
                shouldAutoPlay.current = true;
                nextPage();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [nextPage]);



    // ======= Coach Mode Logic =======
    // Build a flat word list for ASR matching
    const allCoachWords = useMemo(() => {
        const words: Array<{ text: string; ayahIndex: number; wordIndex: number }> = [];
        pageAyahs.forEach((ayah, ayahIndex) => {
            const w = ayah.text.split(/\s+/).filter(w => w.length > 0);
            w.forEach((text, wordIndex) => {
                words.push({ text, ayahIndex, wordIndex });
            });
        });
        return words;
    }, [pageAyahs]);

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

            // Nettoyer les états visuels des mots "futurs"
            setWordStates(prev => {
                const next = new Map(prev);
                allCoachWords.forEach((_, i) => {
                    if (i > wordKeyIndex) {
                        const word = allCoachWords[i];
                        next.delete(`${word.ayahIndex}-${word.wordIndex}`);
                    }
                });
                // Marquer le mot cible comme actuel (doré)
                next.set(`${ayahIndex}-${wordIndex}`, 'current');
                return next;
            });
        }
    }, [isCoachMode, allCoachWords]);

    // Start listening (ASR)
    const startCoachListening = useCallback(() => {
        if (pageAyahs.length === 0) return;
        resetCoach();

        const expectedText = pageAyahs.map(a => a.text).join(' ');

        // Démarrer à partir du verset actuellement en lecture (ou 0 par défaut)
        const currentAyahIdx = playingIndex >= 0 ? playingIndex : 0;
        const startWordIndex = allCoachWords.findIndex(w => w.ayahIndex === currentAyahIdx);
        const safeStartIndex = startWordIndex >= 0 ? startWordIndex : 0;

        const success = speechRecognitionService.start(expectedText, {
            onWordMatch: (wordIndex, isCorrect, spokenWord) => {
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
            onInterimResult: (text) => setCoachInterimText(text),
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
    }, [pageAyahs, allCoachWords, resetCoach]);

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

    // Stop listening
    const stopCoachListening = useCallback(() => {
        speechRecognitionService.stop();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
        setIsListening(false);
    }, []);

    // Toggle coach mode on/off
    const toggleCoachMode = useCallback(() => {
        if (isCoachMode) {
            stopCoachListening();
            resetCoach();
            setIsCoachMode(false);
        } else {
            setIsCoachMode(true);
        }
    }, [isCoachMode, stopCoachListening, resetCoach]);

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

    // Save score when coach finishes a page
    useEffect(() => {
        if (isCoachMode && coachTotalProcessed > 0 && coachTotalProcessed >= allCoachWords.length) {
            try {
                const saved = JSON.parse(localStorage.getItem('quran-coach-scores') || '{}');
                saved[currentPage] = { accuracy: coachAccuracy, date: new Date().toISOString() };
                localStorage.setItem('quran-coach-scores', JSON.stringify(saved));
            } catch { /* ignore */ }
        }
    }, [isCoachMode, coachTotalProcessed, allCoachWords.length, coachAccuracy, currentPage]);


    // Group ayahs by surah
    const groupedAyahs = useMemo(() => {
        return pageAyahs.reduce((groups, ayah) => {
            const surahNum = ayah.surah;
            if (!groups[surahNum]) groups[surahNum] = [];
            groups[surahNum].push(ayah);
            return groups;
        }, {} as Record<number, Ayah[]>);
    }, [pageAyahs]);

    // Get Tajweed text for a verse
    const getTajweedText = (verseKey: string): string | null => {
        const verse = tajweedVerses.find(v => v.verseKey === verseKey);
        return verse?.textTajweed || null;
    };

    // Get word class (coach mode + masking)
    const getWordClass = (ayahIndex: number, wordIndex: number): string => {
        const key = `${ayahIndex}-${wordIndex}`;

        // Coach mode states take priority
        if (isCoachMode) {
            const state = wordStates.get(key);
            if (state === 'correct') return 'mih-word mih-word--correct';
            if (state === 'error') return 'mih-word mih-word--error';
            if (state === 'current') return 'mih-word mih-word--current';
        }

        // Masking mode
        switch (maskMode) {
            case 'hidden': return 'mih-word mih-word--hidden';
            case 'partial': return partialHidden.has(key) ? 'mih-word mih-word--hidden' : 'mih-word';
            case 'minimal': return 'mih-word mih-word--partial';
            default: return 'mih-word';
        }
    };

    // Filtered surahs for search (Arabic, English, French, number)
    const filteredSurahs = useMemo(() => {
        if (!searchQuery) return surahs;
        const q = searchQuery.toLowerCase();
        return surahs.filter(s => {
            const frName = SURAH_NAMES_FR[s.number] || '';
            return (
                s.name.includes(q) ||
                s.name.toLowerCase().includes(q) ||
                s.englishName.toLowerCase().includes(q) ||
                frName.toLowerCase().includes(q) ||
                (s.englishNameTranslation && s.englishNameTranslation.toLowerCase().includes(q)) ||
                s.number.toString().includes(q)
            );
        });
    }, [surahs, searchQuery]);

    // Verse search (Arabic + French)
    const [verseResults, setVerseResults] = useState<Array<{ number: number; surah: number; numberInSurah: number; text: string; translation?: string; page: number }>>([]);
    const [isSearchingVerses, setIsSearchingVerses] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

        // Only search verses if 3+ chars and not a pure number
        if (searchQuery.length >= 3 && !/^\d+$/.test(searchQuery)) {
            setIsSearchingVerses(true);
            searchTimerRef.current = setTimeout(async () => {
                try {
                    // Search Arabic text
                    const arabicResults = await searchQuran(searchQuery);

                    // Also search French via alquran.cloud
                    let frenchResults: typeof arabicResults = [];
                    try {
                        const frRes = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/fr.hamidullah`);
                        const frData = await frRes.json();
                        if (frData.code === 200 && frData.data?.matches) {
                            frenchResults = frData.data.matches.map((m: any) => ({
                                number: m.number,
                                numberInSurah: m.numberInSurah,
                                text: m.text,
                                surah: m.surah.number,
                                page: m.page || 0,
                            }));
                        }
                    } catch { /* ignore French search errors */ }

                    // Merge results, prefer Arabic, add French translation text
                    const merged = new Map<number, typeof verseResults[0]>();
                    for (const a of arabicResults) {
                        merged.set(a.number, { ...a, page: a.page || 0 });
                    }
                    for (const f of frenchResults) {
                        if (merged.has(f.number)) {
                            merged.get(f.number)!.translation = f.text;
                        } else {
                            merged.set(f.number, { ...f, translation: f.text, text: '' });
                        }
                    }

                    // Resolve missing page numbers
                    const results = Array.from(merged.values()).slice(0, 20);
                    const needsPage = results.filter(r => !r.page || r.page <= 0);
                    if (needsPage.length > 0) {
                        const pagePromises = needsPage.map(async r => {
                            try {
                                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${r.number}`);
                                const data = await res.json();
                                if (data.code === 200 && data.data?.page) {
                                    r.page = data.data.page;
                                }
                            } catch { /* ignore */ }
                        });
                        await Promise.all(pagePromises);
                    }

                    setVerseResults(results);
                } catch {
                    setVerseResults([]);
                }
                setIsSearchingVerses(false);
            }, 400);
        } else {
            setVerseResults([]);
            setIsSearchingVerses(false);
        }

        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    // Swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isSwiping.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - touchStartY.current;
        // Only consider horizontal swipes
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            isSwiping.current = true;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isSwiping.current) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const threshold = 60;
        // RTL: swipe left = next page, swipe right = prev page
        if (dx < -threshold && currentPage < 604) {
            nextPage();
        } else if (dx > threshold && currentPage > 1) {
            prevPage();
        }
    };

    // Keyboard navigation (← →)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't navigate if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowLeft' && currentPage < 604) {
                nextPage();
            } else if (e.key === 'ArrowRight' && currentPage > 1) {
                prevPage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, nextPage, prevPage]);

    // Get ayah index in pageAyahs
    const getAyahIndex = (ayah: Ayah) => pageAyahs.findIndex(a => a.number === ayah.number);

    // ============ RENDER ============

    if (isLoading) {
        return (
            <div className="mushaf-page">
                <div className="mih-loading">
                    <Loader2 size={32} className="animate-spin" />
                    <p>تحميل...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mushaf-page">
                <div className="mih-error">
                    <p>{error}</p>
                    <button className="mih-error__btn" onClick={() => window.location.reload()}>
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`mushaf-page ${isMobile ? 'is-mobile' : ''}`} data-arabic-size={arabicFontSize}>
            {/* ===== Compact Header ===== */}
            <div className="mih-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setShowSideMenu(true)} className="mih-header__icon-btn">
                        <Menu size={20} />
                    </button>
                    <div className="mih-header__info" onClick={() => setShowSearch(true)}>
                        <div className="mih-header__surah">
                            {pageSurahNames.map(s => s.englishName).join(' • ')}
                            <Search size={12} style={{ marginLeft: 4, opacity: 0.5 }} />
                        </div>
                        <div className="mih-header__page-num">
                            Page {toArabicNumbers(currentPage)} • Juz {juzNumber}
                        </div>
                    </div>
                </div>

                <div className="mih-header__right">
                    {showToolbar && (
                        <div className="mih-toolbar">
                            {!isMobile && (
                                <button
                                    className={`mih-toolbar__btn ${showTajweedSheet ? 'active' : ''}`}
                                    onClick={() => setShowTajweedSheet(true)}
                                    title="Tajweed"
                                >
                                    <Palette size={18} />
                                </button>
                            )}

                            <button
                                className={`mih-toolbar__btn ${showTranslation ? 'active' : ''}`}
                                onClick={toggleTranslation}
                                title="Traduction"
                            >
                                <Languages size={18} />
                            </button>

                            <button
                                className={`mih-toolbar__btn ${showTransliteration ? 'active' : ''}`}
                                onClick={toggleTransliteration}
                                title="Phonétique"
                            >
                                <span style={{ fontSize: 14, fontWeight: 700 }}>Aa</span>
                            </button>

                            <button
                                className={`mih-toolbar__btn ${showFontSheet ? 'active' : ''}`}
                                onClick={() => setShowFontSheet(true)}
                                title="Taille police"
                            >
                                <Type size={18} />
                            </button>

                            <button
                                className={`mih-toolbar__btn ${audioPlaying ? 'active' : ''}`}
                                onClick={toggleAudio}
                                title="Audio"
                            >
                                <Music size={18} />
                            </button>

                            <button
                                className={`mih-toolbar__btn ${showMaskSheet ? 'active' : ''}`}
                                onClick={() => setShowMaskSheet(true)}
                                title="Masquage"
                            >
                                <Layout size={18} />
                            </button>

                            <button
                                className={`mih-toolbar__btn ${isCoachMode ? 'active' : ''}`}
                                onClick={toggleCoachMode}
                                title={isCoachMode ? 'Désactiver le Coach' : 'Activer le Coach'}
                            >
                                {isCoachMode ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>

                            <div className="mih-toolbar__divider" />

                            <button
                                className={`mih-toolbar__validate ${isPageValidated ? 'validated' : ''}`}
                                onClick={togglePageValidation}
                                title="Valider la page"
                            >
                                {isPageValidated ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </button>
                        </div>
                    )}
                    <button
                        className={`mih-header__icon-btn ${showToolbar ? 'active' : ''}`}
                        onClick={() => setShowToolbar(!showToolbar)}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* ===== Khatm Tracker ===== */}
            <KhatmTracker />


            {/* ===== Khatm Page Badge ===== */}
            <KhatmPageBadge currentPage={currentPage} />

            {/* ===== Floating Navigation (desktop only, hidden on touch and mobile) ===== */}
            {!isMobile && (
                <>
                    <button
                        className="mih-float-nav mih-float-nav--left"
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                    >
                        <ChevronRight size={24} />
                    </button>
                    <button
                        className="mih-float-nav mih-float-nav--right"
                        onClick={nextPage}
                        disabled={currentPage >= 604}
                    >
                        <ChevronLeft size={24} />
                    </button>
                </>
            )}

            {/* ===== Mushaf Content ===== */}
            <div
                className="mih-mushaf"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="mih-mushaf__content">
                    {Object.entries(groupedAyahs).map(([surahNum, ayahs]) => {
                        const surahNumber = parseInt(surahNum);
                        const surah = surahs.find(s => s.number === surahNumber);
                        const isStartOfSurah = ayahs[0]?.numberInSurah === 1;
                        const showBismillah = isStartOfSurah && surahNumber !== 1 && surahNumber !== 9;

                        return (
                            <div key={surahNum}>
                                {/* Ornamental Surah Header */}
                                {isStartOfSurah && surah && (
                                    <div className="mih-surah-frame">
                                        <div className="mih-surah-frame__top-line" />
                                        <div className="mih-surah-frame__border">
                                            <span className="mih-surah-name">{surah.name}</span>
                                        </div>
                                        <div className="mih-surah-frame__bottom-line" />
                                    </div>
                                )}

                                {showBismillah && (
                                    <div className="mih-bismillah">{BISMILLAH}</div>
                                )}

                                <div className="mih-ayahs">
                                    {ayahs.map((ayah) => {
                                        const verseKey = `${ayah.surah}:${ayah.numberInSurah}`;
                                        const tajweedHtml = (tajwidEnabled && !isMobile) ? getTajweedText(verseKey) : null;
                                        const ayahIndex = getAyahIndex(ayah);
                                        const isCurrentlyPlaying = currentPlayingAyah === ayah.number;

                                        // Word-by-word render (coach mode or masking active)
                                        if (isCoachMode || maskMode !== 'visible') {
                                            const words = ayah.text.split(/\s+/).filter(w => w.length > 0);
                                            return (
                                                <span
                                                    key={ayah.number}
                                                    className={`mih-ayah${isCurrentlyPlaying ? ' mih-ayah--playing' : ''}`}
                                                    data-surah={ayah.surah}
                                                    data-ayah={ayah.numberInSurah}
                                                    style={{ cursor: 'pointer', ...(isCurrentlyPlaying ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}) }}
                                                    onClick={() => {
                                                        if (isCoachMode) {
                                                            coachJumpToWord(ayahIndex, 0);
                                                        } else if (!longPressTriggered.current) {
                                                            playAyahAtIndex(ayahIndex);
                                                        }
                                                    }}
                                                    onTouchStart={() => { longPressTriggered.current = false; longPressTimerRef.current = setTimeout(() => { longPressTriggered.current = true; setShareAyah(ayah); }, 600); }}
                                                    onTouchEnd={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                                    onTouchMove={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                                >
                                                    <button
                                                        className={`mih-fav-btn ${isFavorite(ayah.number) ? 'active' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite({ number: ayah.number, surah: ayah.surah, numberInSurah: ayah.numberInSurah, text: ayah.text }); }}
                                                    >
                                                        <Heart size={12} fill={isFavorite(ayah.number) ? 'currentColor' : 'none'} />
                                                    </button>
                                                    {words.map((word, wordIndex) => {
                                                        const key = `${ayahIndex}-${wordIndex}`;
                                                        return (
                                                            <span
                                                                key={key}
                                                                className={getWordClass(ayahIndex, wordIndex)}
                                                                onClick={(e) => {
                                                                    if (isCoachMode) {
                                                                        e.stopPropagation();
                                                                        coachJumpToWord(ayahIndex, wordIndex);
                                                                    }
                                                                }}
                                                            >
                                                                {word}
                                                            </span>
                                                        );
                                                    })}
                                                    <span className="mih-verse-num">
                                                        {toArabicNumbers(ayah.numberInSurah)}
                                                    </span>
                                                    {showTransliteration && transliterationMap.get(ayah.number) && (
                                                        <div className="mih-transliteration">{transliterationMap.get(ayah.number)}</div>
                                                    )}
                                                    {showTranslation && translationMap.get(ayah.number) && (
                                                        <div className="mih-translation">{translationMap.get(ayah.number)}</div>
                                                    )}
                                                    {' '}
                                                </span>
                                            );
                                        }

                                        // Normal render with Tajweed
                                        return (
                                            <span
                                                key={ayah.number}
                                                className={`mih-ayah${isCurrentlyPlaying ? ' mih-ayah--playing' : ''}`}
                                                data-surah={ayah.surah}
                                                data-ayah={ayah.numberInSurah}
                                                style={{ cursor: 'pointer', ...(isCurrentlyPlaying ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}) }}
                                                onClick={() => { if (!longPressTriggered.current) playAyahAtIndex(ayahIndex); }}
                                                onTouchStart={() => { longPressTriggered.current = false; longPressTimerRef.current = setTimeout(() => { longPressTriggered.current = true; setShareAyah(ayah); }, 600); }}
                                                onTouchEnd={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                                onTouchMove={() => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); }}
                                            >
                                                <button
                                                    className={`mih-fav-btn ${isFavorite(ayah.number) ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite({ number: ayah.number, surah: ayah.surah, numberInSurah: ayah.numberInSurah, text: ayah.text }); }}
                                                >
                                                    <Heart size={12} fill={isFavorite(ayah.number) ? 'currentColor' : 'none'} />
                                                </button>
                                                {tajweedHtml ? (
                                                    <>
                                                        {renderTajweedText(tajweedHtml as string, tajwidLayers)}
                                                        <span className="mih-verse-num">
                                                            {toArabicNumbers(ayah.numberInSurah)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {ayah.text}
                                                        <span className="mih-verse-num">
                                                            {toArabicNumbers(ayah.numberInSurah)}
                                                        </span>
                                                    </>
                                                )}
                                                {showTransliteration && transliterationMap.get(ayah.number) && (
                                                    <div className="mih-transliteration">{transliterationMap.get(ayah.number)}</div>
                                                )}
                                                {showTranslation && translationMap.get(ayah.number) && (
                                                    <div className="mih-translation">{translationMap.get(ayah.number)}</div>
                                                )}
                                                {' '}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>



            {/* ===== Coach Progress Bar ===== */}
            {isCoachMode && coachTotalProcessed > 0 && (
                <div className="mih-coach-bar">
                    <div className="mih-coach-bar__fill" style={{ width: `${coachProgress * 100}%` }} />
                    <span className="mih-coach-bar__text">
                        {coachAccuracy}% • {coachTotalProcessed}/{allCoachWords.length} mots
                        {coachMistakesCount > 0 && (
                            <button className="mih-coach-bar__errors" onClick={() => setShowMistakesSummary(true)}>
                                {coachMistakesCount} erreur{coachMistakesCount > 1 ? 's' : ''}
                            </button>
                        )}
                    </span>
                </div>
            )}
            {/* ===== Tajweed Sheet ===== */}
            {
                showTajweedSheet && (
                    <>
                        <div className="mih-sheet-overlay" onClick={() => setShowTajweedSheet(false)} />
                        <div className="mih-sheet">
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Règles de Tajweed</span>
                                <button className="mih-sheet__close" onClick={() => setShowTajweedSheet(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Global toggle */}
                            <div
                                className={`mih-tajweed-toggle ${tajwidEnabled ? '' : 'off'}`}
                                onClick={toggleTajwid}
                                style={{ cursor: 'pointer' }}
                            >
                                <span>Tajweed {tajwidEnabled ? 'activé' : 'désactivé'}</span>
                                <div className={`mih-toggle-switch ${tajwidEnabled ? 'on' : ''}`} />
                            </div>

                            {/* Rule cards */}
                            <div className="mih-tajweed-grid">
                                {tajweedCategories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`mih-tajweed-card ${tajwidLayers.includes(cat.id) ? 'active' : ''}`}
                                        style={{ color: cat.color, borderColor: tajwidLayers.includes(cat.id) ? cat.color : '#eee' }}
                                        onClick={() => toggleTajwidLayer(cat.id)}
                                    >
                                        <span className="mih-tajweed-card__name">{cat.name.split('(')[0].trim()}</span>
                                        <span className="mih-tajweed-card__arabic">{cat.nameArabic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

            {/* ===== Masquage Sheet ===== */}
            {
                showMaskSheet && (
                    <>
                        <div className="mih-sheet-overlay" onClick={() => setShowMaskSheet(false)} />
                        <div className="mih-sheet">
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Mode Masquage (Hifz)</span>
                                <button className="mih-sheet__close" onClick={() => setShowMaskSheet(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mih-mask-grid">
                                <div
                                    className={`mih-mask-card ${maskMode === 'visible' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('visible'); setShowMaskSheet(false); }}
                                >
                                    <Eye size={20} />
                                    <span>Visible</span>
                                </div>
                                <div
                                    className={`mih-mask-card ${maskMode === 'hidden' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('hidden'); setShowMaskSheet(false); }}
                                >
                                    <EyeOff size={20} />
                                    <span>Tout caché</span>
                                </div>
                                <div
                                    className={`mih-mask-card ${maskMode === 'partial' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('partial'); setShowMaskSheet(false); }}
                                >
                                    <Eye size={20} />
                                    <span>Partiel</span>
                                </div>
                                <div
                                    className={`mih-mask-card ${maskMode === 'minimal' ? 'active' : ''}`}
                                    onClick={() => { setMaskMode('minimal'); setShowMaskSheet(false); }}
                                >
                                    <EyeOff size={20} />
                                    <span>Minimal (flou)</span>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* ===== Font Size Sheet ===== */}
            {
                showFontSheet && (
                    <>
                        <div className="mih-sheet-overlay" onClick={() => setShowFontSheet(false)} />
                        <div className="mih-sheet">
                            <div className="mih-sheet__handle" />
                            <div className="mih-sheet__header">
                                <span className="mih-sheet__title">Taille de police</span>
                                <button className="mih-sheet__close" onClick={() => setShowFontSheet(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mih-fontsize-grid">
                                {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                                    <button
                                        key={size}
                                        className={`mih-fontsize-btn ${arabicFontSize === size ? 'active' : ''}`}
                                        onClick={() => { setArabicFontSize(size); setShowFontSheet(false); }}
                                    >
                                        <span style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : size === 'lg' ? '22px' : '26px', fontFamily: 'var(--font-arabic)' }}>
                                            بسم
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#999', marginTop: 4 }}>
                                            {size === 'sm' ? 'Petit' : size === 'md' ? 'Normal' : size === 'lg' ? 'Grand' : 'Très grand'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

            {/* ===== Search Overlay ===== */}
            {
                showSearch && (
                    <div className="mih-search-overlay">
                        <div className="mih-search-header">
                            <input
                                className="mih-search-input"
                                placeholder="Nom arabe, français, anglais ou n° de page..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button className="mih-search-cancel" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                                Annuler
                            </button>
                        </div>

                        {/* Direct page input */}
                        {/^\d+$/.test(searchQuery) && parseInt(searchQuery) >= 1 && parseInt(searchQuery) <= 604 && (
                            <div
                                className="mih-search-item"
                                onClick={() => { goToPage(parseInt(searchQuery)); setShowSearch(false); setSearchQuery(''); }}
                            >
                                <div className="mih-search-item__icon"><Search size={18} /></div>
                                <div className="mih-search-item__info">
                                    <div className="mih-search-item__name">Aller à la page {searchQuery}</div>
                                </div>
                            </div>
                        )}

                        {/* Juz Quick Navigation */}
                        {!searchQuery && (
                            <>
                                <div className="mih-search-label">Naviguer par Juz</div>
                                <div className="mih-juz-scroll">
                                    {JUZ_START_PAGES.map((page, idx) => (
                                        <button
                                            key={idx}
                                            className={`mih-juz-pill ${currentPage >= page && (idx === 29 || currentPage < JUZ_START_PAGES[idx + 1]) ? 'active' : ''}`}
                                            onClick={() => { goToPage(page); setShowSearch(false); setSearchQuery(''); }}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="mih-search-label">
                            {searchQuery ? `${filteredSurahs.length} sourate(s)` : '114 sourates'}
                        </div>

                        <div className="mih-search-list">
                            {filteredSurahs.map(s => (
                                <div
                                    key={s.number}
                                    className="mih-search-item"
                                    onClick={() => { goToSurah(s.number); setShowSearch(false); setSearchQuery(''); }}
                                >
                                    <div className="mih-search-item__icon">{s.number}</div>
                                    <div className="mih-search-item__info">
                                        <div className="mih-search-item__name">{s.englishName} — {SURAH_NAMES_FR[s.number] || s.englishNameTranslation}</div>
                                        <div className="mih-search-item__detail">
                                            {s.englishNameTranslation && <>{s.englishNameTranslation} • </>}{s.numberOfAyahs} versets • {s.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Verse text search results */}
                        {searchQuery.length >= 3 && !/^\d+$/.test(searchQuery) && (
                            <>
                                <div className="mih-search-label" style={{ marginTop: 12 }}>
                                    {isSearchingVerses
                                        ? 'Recherche dans les versets...'
                                        : `${verseResults.length} verset(s) trouvé(s)`
                                    }
                                </div>
                                <div className="mih-search-list">
                                    {verseResults.map(v => {
                                        const surah = surahs.find(s => s.number === v.surah);
                                        return (
                                            <div
                                                key={v.number}
                                                className="mih-search-item"
                                                onClick={() => {
                                                    if (v.page === currentPage) {
                                                        // Same page: just scroll directly
                                                        scrollToVerse(v.surah, v.numberInSurah);
                                                    } else {
                                                        // Different page: store scroll data and navigate
                                                        sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: v.surah, ayah: v.numberInSurah }));
                                                        goToPage(v.page);
                                                    }
                                                    setShowSearch(false);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <div className="mih-search-item__icon" style={{ fontSize: '0.7rem' }}>
                                                    {v.surah}:{v.numberInSurah}
                                                </div>
                                                <div className="mih-search-item__info">
                                                    {v.text && (
                                                        <div className="mih-search-item__name" dir="rtl" style={{ fontFamily: 'var(--font-arabic)', fontSize: '0.95rem' }}>
                                                            {v.text.length > 80 ? v.text.slice(0, 80) + '…' : v.text}
                                                        </div>
                                                    )}
                                                    {v.translation && (
                                                        <div className="mih-search-item__detail" style={{ fontStyle: 'italic' }}>
                                                            {v.translation.length > 100 ? v.translation.slice(0, 100) + '…' : v.translation}
                                                        </div>
                                                    )}
                                                    <div className="mih-search-item__detail" style={{ marginTop: 2 }}>
                                                        {surah?.englishName} • Page {v.page}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )
            }



            {/* ===== Floating Audio Player ===== */}
            {audioActive && (
                <div className="mih-audio-bar">
                    <div className="mih-audio-bar__info">
                        <div className="mih-audio-bar__title">Lecture en cours</div>
                        <div className="mih-audio-bar__subtitle">Ayat {currentPlayingAyah}</div>
                    </div>

                    <div className="mih-audio-bar__controls">
                        <button
                            className="mih-audio-bar__btn"
                            onClick={playPrevAyah}
                            disabled={playingIndex <= 0}
                        >
                            <SkipBack size={20} />
                        </button>

                        <button className="mih-audio-bar__play-btn" onClick={toggleAudio}>
                            {audioPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button
                            className="mih-audio-bar__btn"
                            onClick={playNextAyah}
                            disabled={playingIndex >= pageAyahs.length - 1}
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    <button
                        className="mih-audio-bar__btn"
                        onClick={() => setShowReciterSheet(true)}
                        title="Choisir un récitateur"
                    >
                        <Volume2 size={18} />
                    </button>

                    <div className="mih-audio-bar__speed" onClick={() => setPlaybackSpeed(s => s >= 2 ? 0.5 : s + 0.25)}>
                        {playbackSpeed}x
                    </div>

                    <button className="mih-audio-bar__stop" onClick={stopAudio}>
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* ===== Reciter Selection Sheet ===== */}
            {showReciterSheet && (
                <>
                    <div className="mih-sheet-overlay" onClick={() => setShowReciterSheet(false)} />
                    <div className="mih-sheet">
                        <div className="mih-sheet__handle" />
                        <div className="mih-sheet__header">
                            <span className="mih-sheet__title">Récitateur</span>
                            <button className="mih-sheet__close" onClick={() => setShowReciterSheet(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mih-reciter-list">
                            {RECITERS.map(r => (
                                <button
                                    key={r.id}
                                    className={`mih-reciter-item ${selectedReciter === r.id ? 'active' : ''}`}
                                    onClick={() => { setReciter(r.id); setShowReciterSheet(false); }}
                                >
                                    <span className="mih-reciter-item__flag">{r.country}</span>
                                    <span className="mih-reciter-item__name">{r.name}</span>
                                    <span className="mih-reciter-item__arabic">{r.nameArabic}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Share modal */}
            {shareAyah && (
                <>
                    <div className="mih-share-overlay" onClick={() => { setShareAyah(null); setCopied(false); }} />
                    <div className="mih-share-modal">
                        <div className="mih-share-modal__header">
                            <Share2 size={18} />
                            <span>Partager le verset</span>
                            <button onClick={() => { setShareAyah(null); setCopied(false); }}><X size={18} /></button>
                        </div>
                        <div className="mih-share-modal__ref">
                            Sourate {surahs.find(s => s.number === shareAyah.surah)?.englishName || shareAyah.surah}, Verset {shareAyah.numberInSurah}
                        </div>
                        <div className="mih-share-modal__text" dir="rtl">{shareAyah.text}</div>
                        {showTransliteration && transliterationMap.get(shareAyah.number) && (
                            <div className="mih-share-modal__transliteration" style={{ fontStyle: 'italic', color: '#ab9a6c', margin: '8px 0' }}>{transliterationMap.get(shareAyah.number)}</div>
                        )}
                        {showTranslation && translationMap.get(shareAyah.number) && (
                            <div className="mih-share-modal__translation">{translationMap.get(shareAyah.number)}</div>
                        )}
                        <div className="mih-share-modal__actions">
                            <button
                                className="mih-share-modal__btn"
                                onClick={() => {
                                    const surahName = surahs.find(s => s.number === shareAyah.surah)?.englishName || '';
                                    const text = `${shareAyah.text}\n\n— ${surahName}, Verset ${shareAyah.numberInSurah}\n\nQuran Coach`;
                                    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                            {'share' in navigator && (
                                <button
                                    className="mih-share-modal__btn mih-share-modal__btn--primary"
                                    onClick={() => {
                                        const surahName = surahs.find(s => s.number === shareAyah.surah)?.englishName || '';
                                        const translation = showTranslation ? translationMap.get(shareAyah.number) : '';
                                        const text = `${shareAyah.text}\n${translation ? `\n${translation}\n` : ''}\n— ${surahName}, Verset ${shareAyah.numberInSurah}`;
                                        navigator.share({ title: `${surahName} — Verset ${shareAyah.numberInSurah}`, text }).catch(() => { });
                                        setShareAyah(null);
                                    }}
                                >
                                    <Share2 size={16} />
                                    Partager
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ===== Coach Floating Mic ===== */}
            {isCoachMode && (
                <div className="mih-coach-controls">
                    <button
                        className="mih-coach-listen-btn"
                        onClick={() => {
                            if (pageAyahs.length === 0) return;
                            // Utiliser l'audio de haute qualité du récitateur
                            if (audioPlaying) {
                                stopAudio();
                            } else {
                                playAyahAtIndex(0);
                            }
                        }}
                        title={audioPlaying ? "Arrêter l'écoute" : "Écouter la page (Récitateur)"}
                    >
                        {audioPlaying ? <Square size={18} /> : <Volume2 size={18} />}
                    </button>

                    <button
                        className={`mih-coach-mic ${isListening ? 'mih-coach-mic--active' : ''}`}
                        onClick={isListening ? stopCoachListening : startCoachListening}
                    >
                        {isListening ? <Square size={28} /> : <Mic size={28} />}
                    </button>
                </div>
            )}

            {/* ===== Coach Interim Text ===== */}
            {isCoachMode && coachInterimText && (
                <div className="mih-coach-interim" dir="rtl">{coachInterimText}</div>
            )}

            {/* ===== Coach Error Modal ===== */}
            {selectedError && coachMistakes[selectedError] && (
                <>
                    <div className="mih-sheet-overlay" onClick={() => setSelectedError(null)} />
                    <div className="mih-coach-error-modal">
                        <div className="mih-coach-error-modal__header">
                            <h3>Comparaison</h3>
                            <button onClick={() => setSelectedError(null)}><X size={18} /></button>
                        </div>
                        <div className="mih-coach-error-modal__content">
                            <div className="mih-coach-error-row">
                                <span className="mih-coach-error-label">Attendu :</span>
                                <span className="mih-coach-error-text mih-coach-error-text--expected" dir="rtl">
                                    {coachMistakes[selectedError].expected}
                                </span>
                                <button
                                    className="mih-coach-error-play"
                                    onClick={() => playTts(coachMistakes[selectedError].expected, { rate: 0.7 })}
                                >
                                    <Volume2 size={14} />
                                </button>
                            </div>
                            <div className="mih-coach-error-row">
                                <span className="mih-coach-error-label">Entendu :</span>
                                <span className="mih-coach-error-text mih-coach-error-text--spoken" dir="rtl">
                                    {coachMistakes[selectedError].spoken}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== Coach Mistakes Summary Modal ===== */}
            {showMistakesSummary && (
                <>
                    <div className="mih-sheet-overlay" onClick={() => setShowMistakesSummary(false)} />
                    <div className="mih-sheet">
                        <div className="mih-sheet__handle" />
                        <div className="mih-sheet__header">
                            <span className="mih-sheet__title">
                                Résumé des erreurs ({coachMistakesCount})
                            </span>
                            <button className="mih-sheet__close" onClick={() => setShowMistakesSummary(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 16px 16px' }}>
                            {Object.keys(coachMistakes).length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999', padding: 24 }}>
                                    Aucune erreur. Mashallah ! 🌟
                                </p>
                            ) : (
                                Object.entries(coachMistakes).map(([key, data]) => (
                                    <div
                                        key={key}
                                        className="mih-coach-summary-item"
                                        onClick={() => { setSelectedError(key); setShowMistakesSummary(false); }}
                                    >
                                        <div className="mih-coach-summary-row">
                                            <span className="mih-coach-error-label">Attendu :</span>
                                            <span className="mih-coach-error-text mih-coach-error-text--expected" dir="rtl">{data.expected}</span>
                                            <button
                                                className="mih-coach-error-play"
                                                onClick={(e) => { e.stopPropagation(); playTts(data.expected, { rate: 0.7 }); }}
                                            >
                                                <Volume2 size={12} />
                                            </button>
                                        </div>
                                        <div className="mih-coach-summary-row">
                                            <span className="mih-coach-error-label">Entendu :</span>
                                            <span className="mih-coach-error-text mih-coach-error-text--spoken" dir="rtl">{data.spoken}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
        </div>
    );
}
