import { useState, useRef, useCallback } from 'react';
import { Radio, Mic, Square, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { getSupportedMimeType } from '../lib/audioUnlock';
import { useQuranStore } from '../stores/quranStore';
import './ShazamPage.css';

interface ShazamResult {
    surah: number;
    ayah: number;
    text: string;
    surahName: string;
}

type ShazamState = 'idle' | 'listening' | 'processing' | 'result' | 'error';

export function ShazamPage() {
    const [state, setState] = useState<ShazamState>('idle');
    const [transcribed, setTranscribed] = useState('');
    const [results, setResults] = useState<ShazamResult[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const { goToAyah } = useQuranStore();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startListening = useCallback(async () => {
        setState('listening');
        setTranscribed('');
        setResults([]);
        setErrorMsg('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                await processAudio();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
        } catch (_err) {
            setState('error');
            setErrorMsg("Impossible d'accéder au microphone. Vérifiez les permissions.");
        }
    }, []);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && state === 'listening') {
            mediaRecorderRef.current.stop();
            setState('processing');
        }
    }, [state]);

    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) {
            setState('error');
            setErrorMsg("Aucun audio enregistré.");
            return;
        }

        setState('processing');

        try {
            const mimeType = getSupportedMimeType();
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

            // Convert to base64
            const reader = new FileReader();
            const base64Audio = await new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            // Transcribe via free HuggingFace Space
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio, mimeType }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Erreur serveur: ${response.status}`);
            }

            const data = await response.json();
            const searchText = data.transcribed || '';
            setTranscribed(searchText);

            if (!searchText.trim()) {
                setState('error');
                setErrorMsg("Aucun texte détecté. Essayez de parler plus fort ou plus près du micro.");
                return;
            }

            // Search in Quran API
            const searchResponse = await fetch(
                `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchText)}/all/ar`
            );

            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.data?.matches && searchData.data.matches.length > 0) {
                    const matched = searchData.data.matches.slice(0, 5).map((m: {
                        surah: { number: number; name: string };
                        numberInSurah: number;
                        text: string;
                    }) => ({
                        surah: m.surah.number,
                        ayah: m.numberInSurah,
                        text: m.text,
                        surahName: m.surah.name,
                    }));
                    setResults(matched);
                    setState('result');
                } else {
                    setState('error');
                    setErrorMsg("Aucun verset correspondant trouvé. Essayez de réciter plus clairement.");
                }
            } else {
                setState('error');
                setErrorMsg("Erreur de recherche dans le Coran. Réessayez.");
            }

        } catch (err) {
            console.error('Shazam error:', err);
            setState('error');
            setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue. Réessayez.");
        }
    };

    const reset = () => {
        setState('idle');
        setTranscribed('');
        setResults([]);
        setErrorMsg('');
    };

    const goToVerse = (surah: number, ayah: number) => {
        goToAyah(surah, ayah);
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
                {/* Visualizer */}
                <div className={`shazam-visualizer ${state === 'listening' ? 'active' : ''} ${state === 'processing' ? 'processing' : ''}`}>
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

                {/* Status text */}
                <p className="shazam-status">
                    {state === 'idle' && "Appuyez pour identifier un passage"}
                    {state === 'listening' && "🎤 Écoute en cours... Récitez un passage"}
                    {state === 'processing' && "🔍 Analyse en cours..."}
                    {state === 'result' && `✅ ${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`}
                    {state === 'error' && ""}
                </p>

                {/* Main Button */}
                {(state === 'idle' || state === 'result' || state === 'error') && (
                    <button
                        className={`shazam-btn ${state === 'result' ? '' : ''}`}
                        onClick={state === 'idle' ? startListening : reset}
                    >
                        {state === 'idle' ? <Mic size={40} /> : <RefreshCw size={32} />}
                    </button>
                )}

                {state === 'listening' && (
                    <button className="shazam-btn listening" onClick={stopListening}>
                        <Square size={32} />
                    </button>
                )}

                {state === 'processing' && (
                    <button className="shazam-btn processing" disabled>
                        <Loader2 size={32} className="spin" />
                    </button>
                )}

                {/* Instructions */}
                {state === 'idle' && (
                    <div className="shazam-instructions">
                        <p>🎤 Récitez ou jouez un passage coranique</p>
                        <p>🔍 L'IA identifie la sourate et le verset</p>
                        <p>📖 Naviguez directement vers le passage</p>
                    </div>
                )}

                {/* Transcription */}
                {transcribed && (
                    <div className="shazam-result" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="shazam-result-header">
                            <span className="shazam-result-surah" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Texte détecté :</span>
                        </div>
                        <p className="shazam-result-text" style={{ fontSize: '1.2rem' }} dir="rtl">{transcribed}</p>
                    </div>
                )}

                {/* Error */}
                {state === 'error' && errorMsg && (
                    <div className="shazam-error">
                        <p>{errorMsg}</p>
                        <button onClick={reset}>
                            <RefreshCw size={16} />
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="shazam-result">
                        <div className="shazam-result-actions">
                            {results.map((r, i) => (
                                <button key={i} onClick={() => goToVerse(r.surah, r.ayah)}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div className="shazam-result-surah">
                                            {r.surahName}
                                        </div>
                                        <div className="shazam-result-ayah" style={{ background: 'none', padding: 0 }}>
                                            Verset {r.ayah}
                                        </div>
                                        <div className="shazam-result-text" dir="rtl" style={{ fontSize: '1.1rem', margin: '8px 0 0', lineHeight: 1.8 }}>
                                            {r.text.length > 120 ? r.text.substring(0, 120) + '...' : r.text}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} style={{ flexShrink: 0, opacity: 0.5 }} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* New search after result */}
                {state === 'result' && (
                    <button
                        className="shazam-btn"
                        onClick={reset}
                        style={{ width: '64px', height: '64px', marginTop: '8px' }}
                    >
                        <Mic size={28} />
                    </button>
                )}
            </div>
        </div>
    );
}
