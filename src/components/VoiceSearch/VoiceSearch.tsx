import { useState, useRef } from 'react';
import { Mic, Square, Loader2, X } from 'lucide-react';
import { usePremiumStore } from '../../stores/premiumStore';
import './VoiceSearch.css';

interface VoiceSearchProps {
    onResult: (surah: number, ayah: number) => void;
    onClose: () => void;
}

// Remove Arabic diacritics (tashkeel) for fuzzy matching
function normalizeArabic(text: string): string {
    return text
        // Remove tashkeel (diacritical marks)
        .replace(/[\u064B-\u0652\u0670]/g, '')
        // Remove tatweel (stretching character)
        .replace(/\u0640/g, '')
        // Normalize alef variants to simple alef
        .replace(/[\u0622\u0623\u0625\u0627]/g, '\u0627')
        // Normalize taa marbuta to haa
        .replace(/\u0629/g, '\u0647')
        // Normalize yaa variants
        .replace(/[\u0649\u064A]/g, '\u064A')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim();
}

// Check if words from search appear in verse (very lenient)
function fuzzyMatch(searchText: string, verseText: string): number {
    const normalizedSearch = normalizeArabic(searchText);
    const normalizedVerse = normalizeArabic(verseText);

    // Direct substring match - highest score
    if (normalizedVerse.includes(normalizedSearch)) {
        return 100;
    }

    // Get words (filter out very short words)
    const searchWords = normalizedSearch.split(' ').filter(w => w.length > 2);
    if (searchWords.length === 0) {
        // For very short input, check if any part matches
        if (normalizedVerse.includes(normalizedSearch.slice(0, 3))) {
            return 50;
        }
        return 0;
    }

    // Check each search word
    let matchedWords = 0;
    for (const searchWord of searchWords) {
        // Very lenient: check if word appears anywhere (even as substring)
        if (normalizedVerse.includes(searchWord)) {
            matchedWords++;
        } else {
            // Even more lenient: check first 3 characters
            const prefix = searchWord.slice(0, 3);
            if (normalizedVerse.includes(prefix)) {
                matchedWords += 0.5;
            }
        }
    }

    return Math.round((matchedWords / searchWords.length) * 100);
}

export function VoiceSearch({ onResult, onClose }: VoiceSearchProps) {
    const { isPremium } = usePremiumStore();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<Array<{ surah: number; ayah: number; text: string; surahName: string; score: number }>>([]);
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
        } catch {
            setError("Impossible d'accéder au microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Search using multiple strategies
    const searchWithQuery = async (query: string): Promise<Array<{ surah: number; ayah: number; text: string; surahName: string }>> => {
        try {
            const response = await fetch(
                `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.data?.matches) {
                    return data.data.matches.slice(0, 15).map((m: any) => ({
                        surah: m.surah.number,
                        ayah: m.numberInSurah,
                        text: m.text,
                        surahName: m.surah.name,
                    }));
                }
            }
        } catch {
            // Ignore errors for individual searches
        }
        return [];
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
                setError("Aucun texte détecté. Parlez plus fort et clairement.");
                return;
            }

            const normalizedSearch = normalizeArabic(searchText);
            const words = normalizedSearch.split(' ').filter(w => w.length > 2);

            // Multiple search strategies in parallel
            const searchPromises: Promise<Array<{ surah: number; ayah: number; text: string; surahName: string }>>[] = [];

            // Strategy 1: Full normalized text
            searchPromises.push(searchWithQuery(normalizedSearch));

            // Strategy 2: First 2 words only (most important!)
            if (words.length >= 2) {
                searchPromises.push(searchWithQuery(words.slice(0, 2).join(' ')));
            }

            // Strategy 3: First word only
            if (words.length >= 1) {
                searchPromises.push(searchWithQuery(words[0]));
            }

            // Strategy 4: Last 2 words
            if (words.length >= 3) {
                searchPromises.push(searchWithQuery(words.slice(-2).join(' ')));
            }

            // Wait for all searches
            const allResults = await Promise.all(searchPromises);

            // Combine and deduplicate results
            const seenKeys = new Set<string>();
            const combinedResults: Array<{ surah: number; ayah: number; text: string; surahName: string; score: number }> = [];

            for (const resultSet of allResults) {
                for (const result of resultSet) {
                    const key = `${result.surah}:${result.ayah}`;
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        const score = fuzzyMatch(searchText, result.text);
                        if (score >= 15) { // Very low threshold
                            combinedResults.push({ ...result, score });
                        }
                    }
                }
            }

            // Sort by score and take top 8
            combinedResults.sort((a, b) => b.score - a.score);
            const topResults = combinedResults.slice(0, 8);

            if (topResults.length > 0) {
                setResults(topResults);
            } else {
                setError("Aucun verset trouvé. Essayez avec d'autres mots.");
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
                    Récitez 2-3 mots d'un verset pour le retrouver
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
                        <span className="voice-search__transcribed-label">Détecté :</span>
                        <span dir="rtl">{transcribed}</span>
                    </div>
                )}

                {error && (
                    <div className="voice-search__error">{error}</div>
                )}

                {results.length > 0 && (
                    <div className="voice-search__results">
                        <h3>Résultats ({results.length})</h3>
                        {results.map((result, i) => (
                            <button
                                key={i}
                                className="voice-search__result"
                                onClick={() => onResult(result.surah, result.ayah)}
                            >
                                <div className="voice-search__result-header">
                                    <span className="voice-search__result-ref">
                                        {result.surahName} ({result.surah}:{result.ayah})
                                    </span>
                                    <span className="voice-search__result-score">
                                        {result.score}%
                                    </span>
                                </div>
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
