import { useState, useRef } from 'react';
import { Mic, Square, Search, Loader2, X } from 'lucide-react';
import { usePremiumStore } from '../../stores/premiumStore';
import './VoiceSearch.css';

interface VoiceSearchProps {
    onResult: (surah: number, ayah: number) => void;
    onClose: () => void;
}

export function VoiceSearch({ onResult, onClose }: VoiceSearchProps) {
    const { isPremium } = usePremiumStore();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<Array<{ surah: number; ayah: number; text: string; surahName: string }>>([]);
    const [error, setError] = useState<string | null>(null);
    const [transcribed, setTranscribed] = useState<string>('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (!isPremium) {
            setError("Fonctionnalité Premium requise");
            return;
        }

        setError(null);
        setResults([]);
        setTranscribed('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                await searchVerse();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setError("Impossible d'accéder au microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const searchVerse = async () => {
        if (audioChunksRef.current.length === 0) return;

        setIsProcessing(true);

        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            const reader = new FileReader();
            const base64Audio = await new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            // Send to API for transcription
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio }),
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json();
            const searchText = data.transcribed || '';
            setTranscribed(searchText);

            if (!searchText.trim()) {
                setError("Aucun texte détecté. Essayez de parler plus fort.");
                return;
            }

            // Search in Quran API
            const searchResponse = await fetch(
                `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchText)}/all/ar`
            );

            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.data?.matches && searchData.data.matches.length > 0) {
                    setResults(searchData.data.matches.slice(0, 5).map((m: {
                        surah: { number: number; name: string };
                        numberInSurah: number;
                        text: string;
                    }) => ({
                        surah: m.surah.number,
                        ayah: m.numberInSurah,
                        text: m.text,
                        surahName: m.surah.name,
                    })));
                } else {
                    setError("Aucun verset trouvé. Essayez de réciter différemment.");
                }
            }
        } catch (err) {
            console.error('Search error:', err);
            setError("Erreur lors de la recherche");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="voice-search-overlay" onClick={onClose}>
            <div className="voice-search" onClick={(e) => e.stopPropagation()}>
                <div className="voice-search__header">
                    <h2>Recherche vocale</h2>
                    <button className="voice-search__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <p className="voice-search__hint">
                    Récitez quelques mots d'un verset pour le retrouver
                </p>

                <div className="voice-search__controls">
                    {isProcessing ? (
                        <div className="voice-search__processing">
                            <Loader2 size={32} className="voice-search__spinner" />
                            <span>Recherche en cours...</span>
                        </div>
                    ) : isRecording ? (
                        <button className="voice-search__record voice-search__record--active" onClick={stopRecording}>
                            <Square size={32} />
                            <span>Arrêter</span>
                        </button>
                    ) : (
                        <button className="voice-search__record" onClick={startRecording}>
                            <Mic size={32} />
                            <span>Réciter</span>
                        </button>
                    )}
                </div>

                {transcribed && (
                    <div className="voice-search__transcribed">
                        <Search size={16} />
                        <span dir="rtl">{transcribed}</span>
                    </div>
                )}

                {error && (
                    <div className="voice-search__error">{error}</div>
                )}

                {results.length > 0 && (
                    <div className="voice-search__results">
                        <h3>Résultats</h3>
                        {results.map((result, i) => (
                            <button
                                key={i}
                                className="voice-search__result"
                                onClick={() => onResult(result.surah, result.ayah)}
                            >
                                <span className="voice-search__result-ref">
                                    {result.surahName} ({result.surah}:{result.ayah})
                                </span>
                                <span className="voice-search__result-text" dir="rtl">
                                    {result.text.substring(0, 100)}...
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
