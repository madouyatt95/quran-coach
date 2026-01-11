import { useState, useRef, useCallback } from 'react';
import { Radio, Loader2, Volume2, BookOpen, ChevronRight, RefreshCcw, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuranStore } from '../stores/quranStore';
import { identifyReciter } from '../lib/audioFingerprint';
import './ShazamPage.css';

interface ShazamResult {
    surah: number;
    surahName: string;
    ayah: number;
    text: string;
    confidence: number;
    reciterName?: string;
    reciterNameAr?: string;
    reciterConfidence?: number;
}

export function ShazamPage() {
    const navigate = useNavigate();
    const { setCurrentSurah, setCurrentAyah } = useQuranStore();

    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [result, setResult] = useState<ShazamResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const capturedAudioRef = useRef<Blob | null>(null);

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
                    capturedAudioRef.current = audioBlob;

                    // Step 1: Transcribe using server API (OpenAI Whisper)
                    setProcessingStatus('Transcription IA...');

                    const reader = new FileReader();
                    const base64Audio = await new Promise<string>((resolve, reject) => {
                        reader.onload = () => {
                            const dataUrl = reader.result as string;
                            resolve(dataUrl.split(',')[1]);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(audioBlob);
                    });

                    const transcribeResponse = await fetch('/api/transcribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audio: base64Audio, mimeType }),
                    });

                    if (!transcribeResponse.ok) {
                        throw new Error('Transcription failed');
                    }

                    const transcribeData = await transcribeResponse.json();
                    const transcript = transcribeData.transcribed || '';

                    console.log('Transcript:', transcript); // Debug

                    if (!transcript || transcript.trim().length === 0) {
                        setError("Aucun son détecté. Approchez le téléphone de la source audio.");
                        setIsProcessing(false);
                        return;
                    }

                    // Step 2: Search in Quran.com API
                    setProcessingStatus('Recherche du verset...');

                    let foundResult: ShazamResult | null = null;

                    // Try full transcript first
                    const searchResponse = await fetch(
                        `https://api.alquran.cloud/v1/search/${encodeURIComponent(transcript)}/all/ar`
                    );

                    if (searchResponse.ok) {
                        const searchData = await searchResponse.json();
                        if (searchData.data?.matches && searchData.data.matches.length > 0) {
                            const match = searchData.data.matches[0];
                            foundResult = {
                                surah: match.surah.number,
                                surahName: match.surah.name,
                                ayah: match.numberInSurah,
                                text: match.text,
                                confidence: 0.9
                            };
                        }
                    }

                    // Fallback: try with first 5 words if full transcript didn't work
                    if (!foundResult) {
                        const words = transcript.split(/\s+/).filter((w: string) => w.length > 1);
                        if (words.length >= 3) {
                            setProcessingStatus('Recherche approfondie...');
                            const partial = words.slice(0, 5).join(' ');
                            const fallbackResponse = await fetch(
                                `https://api.alquran.cloud/v1/search/${encodeURIComponent(partial)}/all/ar`
                            );
                            if (fallbackResponse.ok) {
                                const fallbackData = await fallbackResponse.json();
                                if (fallbackData.data?.matches && fallbackData.data.matches.length > 0) {
                                    const match = fallbackData.data.matches[0];
                                    foundResult = {
                                        surah: match.surah.number,
                                        surahName: match.surah.name,
                                        ayah: match.numberInSurah,
                                        text: match.text,
                                        confidence: 0.7
                                    };
                                }
                            }
                        }
                    }

                    if (foundResult) {
                        // Step 3: Identify the reciter
                        setProcessingStatus('Identification du récitateur...');
                        const reciterMatch = await identifyReciter(
                            audioBlob,
                            foundResult.surah,
                            foundResult.ayah,
                            (name, progress) => {
                                setProcessingStatus(`Comparaison: ${name} (${Math.round(progress * 100)}%)`);
                            }
                        );

                        if (reciterMatch) {
                            console.log('Reciter identified:', reciterMatch); // Debug
                            foundResult.reciterName = reciterMatch.reciterName;
                            foundResult.reciterNameAr = reciterMatch.reciterNameAr;
                            foundResult.reciterConfidence = reciterMatch.confidence;
                        } else {
                            console.log('No reciter match found');
                        }

                        setResult(foundResult);
                    } else {
                        setError(`Verset non trouvé. Transcript: "${transcript}"`);
                    }
                } catch (err) {
                    setError("Erreur lors de l'identification. Réessayez.");
                    console.error(err);
                } finally {
                    setIsProcessing(false);
                    setProcessingStatus('');
                }
            };

            mediaRecorder.start();
            setIsListening(true);

            // Auto-stop after 10 seconds (longer for better transcription)
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, 10000);

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

    const goToVerse = () => {
        if (result) {
            setCurrentSurah(result.surah);
            setCurrentAyah(result.ayah);
            navigate('/');
        }
    };

    const goToTafsir = () => {
        if (result) {
            // Store result in sessionStorage for TafsirPage to read
            sessionStorage.setItem('shazamResult', JSON.stringify({
                surah: result.surah,
                ayah: result.ayah
            }));
            navigate('/tafsir');
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
                        isProcessing ? (processingStatus || 'Identification...') :
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

                        {/* Reciter Badge */}
                        {result.reciterName && (
                            <div className="shazam-result-reciter">
                                <User size={16} />
                                <span className="shazam-reciter-name">{result.reciterName}</span>
                                <span className="shazam-reciter-ar">{result.reciterNameAr}</span>
                                {result.reciterConfidence && (
                                    <span className="shazam-reciter-confidence">
                                        {Math.round(result.reciterConfidence * 100)}%
                                    </span>
                                )}
                            </div>
                        )}

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
