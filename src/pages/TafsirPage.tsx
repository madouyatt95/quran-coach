import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, Loader2, Users, MessageCircle } from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { fetchTafsir, fetchVerseText, AVAILABLE_TAFSIRS } from '../lib/tafsirApi';
import './TafsirPage.css';

// List of narrative surahs with dialogues
const NARRATIVE_SURAHS = [12, 18, 19, 20, 26, 27, 28]; // Yusuf, Kahf, Maryam, Ta-Ha, Shu'ara, Naml, Qasas

export function TafsirPage() {
    const { surahs } = useQuranStore();

    // Selection state
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [selectedAyah, setSelectedAyah] = useState(1);
    const [maxAyahs, setMaxAyahs] = useState(7);
    const [selectedTafsir, setSelectedTafsir] = useState<number | string>(AVAILABLE_TAFSIRS[0].id);

    // Content state
    const [verseText, setVerseText] = useState<{ arabic: string; translation: string } | null>(null);
    const [tafsirContent, setTafsirContent] = useState<string | null>(null);
    const [tafsirSource, setTafsirSource] = useState<string>('');

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dialogue Narratif mode
    const [narrativeMode, setNarrativeMode] = useState(false);
    const isNarrativeSurah = NARRATIVE_SURAHS.includes(selectedSurah);

    // Flag to track if we're initializing from Shazam (to avoid resetting ayah)
    const [initializedFromShazam, setInitializedFromShazam] = useState(false);

    // Read from sessionStorage on mount (from Shazam navigation)
    useEffect(() => {
        const shazamResult = sessionStorage.getItem('shazamResult');
        if (shazamResult) {
            try {
                const { surah, ayah } = JSON.parse(shazamResult);
                if (surah) setSelectedSurah(surah);
                if (ayah) {
                    setSelectedAyah(ayah);
                    setInitializedFromShazam(true);
                }
                sessionStorage.removeItem('shazamResult'); // Clear after reading
            } catch (e) {
                console.error('Failed to parse shazamResult', e);
            }
        }
    }, []);

    // Update max ayahs when surah changes
    useEffect(() => {
        const surah = surahs.find(s => s.number === selectedSurah);
        if (surah) {
            setMaxAyahs(surah.numberOfAyahs);
            // Only reset ayah to 1 if NOT initialized from Shazam
            if (!initializedFromShazam) {
                setSelectedAyah(1);
            } else {
                // Clear the flag after first render
                setInitializedFromShazam(false);
            }
        }
    }, [selectedSurah, surahs, initializedFromShazam]);

    // Fetch tafsir when selection changes
    useEffect(() => {
        const loadTafsir = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch verse text and tafsir in parallel
                const [verse, tafsir] = await Promise.all([
                    fetchVerseText(selectedSurah, selectedAyah),
                    fetchTafsir(selectedTafsir, selectedSurah, selectedAyah)
                ]);

                if (verse) {
                    setVerseText(verse);
                }

                if (tafsir) {
                    // Clean HTML tags from tafsir text
                    const cleanText = tafsir.text
                        .replace(/<[^>]*>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/\\n/g, '\n'); // Handle escaped newlines from some APIs

                    setTafsirContent(cleanText);
                    setTafsirSource(tafsir.resource_name || 'Ibn Kathir');
                } else {
                    setTafsirContent(null);
                    setError('Tafsir non disponible pour ce verset');
                }
            } catch (err) {
                setError('Erreur lors du chargement du tafsir');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadTafsir();
    }, [selectedSurah, selectedAyah, selectedTafsir]);

    const currentSurah = surahs.find(s => s.number === selectedSurah);

    return (
        <div className="tafsir-page">
            {/* Header */}
            <div className="tafsir-header">
                <h1 className="tafsir-title">
                    <BookOpen size={24} />
                    Tafsir
                </h1>
                <span className="tafsir-subtitle">التفسير</span>

                {/* Narrative Mode Toggle */}
                {isNarrativeSurah && (
                    <button
                        className={`tafsir-narrative-toggle ${narrativeMode ? 'active' : ''}`}
                        onClick={() => setNarrativeMode(!narrativeMode)}
                        title="Mode Dialogue Narratif"
                    >
                        <Users size={18} />
                        Dialogues
                    </button>
                )}
            </div>

            {/* Selectors */}
            <div className="tafsir-selectors">
                {/* Surah Selector */}
                <div className="tafsir-selector">
                    <label>Sourate</label>
                    <div className="tafsir-select-wrapper">
                        <select
                            value={selectedSurah}
                            onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                        >
                            {surahs.map((s) => (
                                <option key={s.number} value={s.number}>
                                    {s.number}. {s.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                {/* Ayah Selector */}
                <div className="tafsir-selector">
                    <label>Verset</label>
                    <div className="tafsir-select-wrapper">
                        <select
                            value={selectedAyah}
                            onChange={(e) => setSelectedAyah(parseInt(e.target.value))}
                        >
                            {Array.from({ length: maxAyahs }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                {/* Tafsir Source Selector */}
                <div className="tafsir-selector tafsir-selector--wide">
                    <label>Source d'Exégèse</label>
                    <div className="tafsir-select-wrapper">
                        <select
                            value={selectedTafsir}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedTafsir(isNaN(Number(val)) ? val : Number(val));
                            }}
                        >
                            {AVAILABLE_TAFSIRS.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.language.toUpperCase()})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Current Verse Display */}
            {verseText && (
                <div className="tafsir-verse-card">
                    <div className="tafsir-verse-header">
                        <span className="tafsir-verse-ref">
                            {currentSurah?.name} - Verset {selectedAyah}
                        </span>
                    </div>
                    <div className="tafsir-verse-arabic" dir="rtl">
                        {verseText.arabic}
                    </div>
                    <div className="tafsir-verse-translation">
                        {verseText.translation.replace(/<[^>]*>/g, '')}
                    </div>
                </div>
            )}

            {/* Tafsir Content */}
            <div className="tafsir-content-card">
                <div className="tafsir-content-header">
                    <span className="tafsir-content-label">Exégèse</span>
                    <span className="tafsir-content-source">{tafsirSource}</span>
                </div>

                {isLoading ? (
                    <div className="tafsir-loading">
                        <Loader2 size={32} className="spin" />
                        <span>Chargement du tafsir...</span>
                    </div>
                ) : error ? (
                    <div className="tafsir-error">
                        <p>{error}</p>
                    </div>
                ) : tafsirContent ? (
                    <div className={`tafsir-text ${narrativeMode ? 'narrative-mode' : ''}`}>
                        {narrativeMode ? (
                            // Dialogue Narratif rendering
                            tafsirContent.split('\n').map((paragraph, idx) => {
                                const trimmed = paragraph.trim();
                                if (!trimmed) return null;

                                // Detect dialogue patterns (quotes, colons after names)
                                const isDialogue = /^[\"\u00AB\u201C]|:\s*[\"\u00AB\u201C]|\u0642\u0627\u0644/.test(trimmed);
                                const isSpeaker = /^[A-Z\u0600-\u06FF][^:]+:/.test(trimmed);

                                if (isDialogue || isSpeaker) {
                                    return (
                                        <div key={idx} className="dialogue-bubble">
                                            <MessageCircle size={14} className="dialogue-icon" />
                                            <p>{trimmed}</p>
                                        </div>
                                    );
                                }
                                return <p key={idx} className="narrator-text">{trimmed}</p>;
                            })
                        ) : (
                            // Standard rendering
                            tafsirContent.split('\n').map((paragraph, idx) => (
                                paragraph.trim() && <p key={idx}>{paragraph}</p>
                            ))
                        )}
                    </div>
                ) : null}
            </div>

            {/* Navigation Hint */}
            <div className="tafsir-nav-hint">
                <button
                    onClick={() => setSelectedAyah(Math.max(1, selectedAyah - 1))}
                    disabled={selectedAyah <= 1}
                >
                    ← Précédent
                </button>
                <span>{selectedAyah} / {maxAyahs}</span>
                <button
                    onClick={() => setSelectedAyah(Math.min(maxAyahs, selectedAyah + 1))}
                    disabled={selectedAyah >= maxAyahs}
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
}
