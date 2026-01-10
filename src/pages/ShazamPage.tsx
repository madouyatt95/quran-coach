import { useState, useRef, useCallback, useEffect } from 'react';
import { Radio, Loader2, Volume2, BookOpen, ChevronRight, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuranStore } from '../stores/quranStore';
import { transcribeAudio } from '../lib/openai';
import { fetchPage } from '../lib/quranApi';
import type { Ayah } from '../types';
import './ShazamPage.css';

interface ShazamResult {
    surah: number;
    surahName: string;
    ayah: number;
    text: string;
    confidence: number;
}

interface CachedAyah {
    surahNumber: number;
    numberInSurah: number;
    text: string;
}

export function ShazamPage() {
    const navigate = useNavigate();
    const { surahs } = useQuranStore();

    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ShazamResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cachedAyahs, setCachedAyahs] = useState<CachedAyah[]>([]);
    const [_isLoadingAyahs, setIsLoadingAyahs] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Load ayahs for search (first 10 pages for quick search)
    useEffect(() => {
        const loadAyahs = async () => {
            if (cachedAyahs.length > 0) return;
            setIsLoadingAyahs(true);
            try {
                const allAyahs: CachedAyah[] = [];
                // Load first 50 pages for quick search
                for (let page = 1; page <= 50; page++) {
                    const pageAyahs: Ayah[] = await fetchPage(page);
                    allAyahs.push(...pageAyahs.map((a: Ayah) => ({
                        surahNumber: a.surah,
                        numberInSurah: a.numberInSurah,
                        text: a.text
                    })));
                }
                setCachedAyahs(allAyahs);
            } catch (err) {
                console.error('Failed to load ayahs for search:', err);
            } finally {
                setIsLoadingAyahs(false);
            }
        };
        loadAyahs();
    }, [cachedAyahs.length]);

    const startListening = useCallback(async () => {
        setError(null);
        setResult(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Determine MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/mp4')
                    ? 'audio/mp4'
                    : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                setIsListening(false);
                setIsProcessing(true);

                // Stop the stream
                stream.getTracks().forEach(track => track.stop());

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                    // Transcribe the audio
                    const transcript = await transcribeAudio(audioBlob);

                    if (!transcript || transcript.trim().length === 0) {
                        setError("Aucun son détecté. Approchez le téléphone de la source audio.");
                        setIsProcessing(false);
                        return;
                    }

                    // Search for the verse in the Quran
                    const foundResult = searchVerseInQuran(transcript);

                    if (foundResult) {
                        setResult(foundResult);
                    } else {
                        setError(`Verset non trouvé. Transcript: "${transcript.substring(0, 50)}..."`);
                    }
                } catch (err) {
                    setError("Erreur lors de l'identification. Réessayez.");
                    console.error(err);
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.start();
            setIsListening(true);

            // Auto-stop after 5 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, 5000);

        } catch (err) {
            setError("Accès au microphone refusé.");
            console.error(err);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const searchVerseInQuran = useCallback((transcript: string): ShazamResult | null => {
        // Normalize the transcript
        const normalizedTranscript = normalizeArabic(transcript);

        // Search through cached ayahs
        for (const ayah of cachedAyahs) {
            const normalizedAyah = normalizeArabic(ayah.text);

            // Check if the transcript is a substring of any ayah
            if (normalizedAyah.includes(normalizedTranscript) ||
                normalizedTranscript.includes(normalizedAyah.substring(0, 20))) {
                const surah = surahs.find(s => s.number === ayah.surahNumber);
                return {
                    surah: ayah.surahNumber,
                    surahName: surah?.name || `Sourate ${ayah.surahNumber}`,
                    ayah: ayah.numberInSurah,
                    text: ayah.text,
                    confidence: 0.85
                };
            }
        }

        // Fuzzy search fallback - look for significant word matches
        const words = normalizedTranscript.split(/\s+/).filter(w => w.length > 2);
        if (words.length >= 2) {
            for (const ayah of cachedAyahs) {
                const normalizedAyah = normalizeArabic(ayah.text);
                let matchCount = 0;
                for (const word of words) {
                    if (normalizedAyah.includes(word)) matchCount++;
                }
                if (matchCount >= Math.min(3, words.length)) {
                    const surah = surahs.find(s => s.number === ayah.surahNumber);
                    return {
                        surah: ayah.surahNumber,
                        surahName: surah?.name || `Sourate ${ayah.surahNumber}`,
                        ayah: ayah.numberInSurah,
                        text: ayah.text,
                        confidence: 0.6
                    };
                }
            }
        }

        return null;
    }, [cachedAyahs, surahs]);

    const normalizeArabic = (text: string): string => {
        return text
            .replace(/[\u064B-\u0652]/g, '') // Remove tashkeel
            .replace(/[ٱأإآ]/g, 'ا') // Normalize alif
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const goToVerse = () => {
        if (result) {
            // Navigate to the Mushaf page for this verse
            navigate(`/?surah=${result.surah}&ayah=${result.ayah}`);
        }
    };

    const goToTafsir = () => {
        if (result) {
            navigate(`/tafsir?surah=${result.surah}&ayah=${result.ayah}`);
        }
    };

    return (
        <div className="shazam-page">
            {/* Header */}
            <div className="shazam-header">
                <h1 className="shazam-title">
                    <Radio size={28} />
                    Shazam Coran
                </h1>
                <p className="shazam-subtitle">Identifiez n'importe quel passage coranique</p>
            </div>

            {/* Main Content */}
            <div className="shazam-content">
                {/* Listening Animation */}
                <div className={`shazam-visualizer ${isListening ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}>
                    <div className="shazam-wave">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="shazam-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                    <div className="shazam-rings">
                        <div className="shazam-ring" />
                        <div className="shazam-ring" />
                        <div className="shazam-ring" />
                    </div>
                </div>

                {/* Status Text */}
                <p className="shazam-status">
                    {isListening ? 'Écoute en cours...' :
                        isProcessing ? 'Identification...' :
                            'Appuyez pour écouter'}
                </p>

                {/* Main Button */}
                <button
                    className={`shazam-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 size={48} className="spin" />
                    ) : isListening ? (
                        <Volume2 size={48} />
                    ) : (
                        <Radio size={48} />
                    )}
                </button>

                {/* Instructions */}
                {!result && !error && !isListening && !isProcessing && (
                    <div className="shazam-instructions">
                        <p>1. Approchez le téléphone de la source audio</p>
                        <p>2. Appuyez sur le bouton</p>
                        <p>3. L'app identifie le verset en quelques secondes</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="shazam-error">
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>
                            <RefreshCcw size={16} />
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="shazam-result">
                        <div className="shazam-result-header">
                            <span className="shazam-result-surah">{result.surahName}</span>
                            <span className="shazam-result-ayah">Verset {result.ayah}</span>
                        </div>
                        <p className="shazam-result-text" dir="rtl">
                            {result.text.substring(0, 100)}...
                        </p>
                        <div className="shazam-result-actions">
                            <button onClick={goToVerse}>
                                <BookOpen size={18} />
                                Voir dans le Mushaf
                                <ChevronRight size={16} />
                            </button>
                            <button onClick={goToTafsir}>
                                Tafsir
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
