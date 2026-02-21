import { Mic, Square, Volume2, X, Users, Zap, EyeOff, Radio } from 'lucide-react';
import { playTts } from '../../lib/ttsService';
import type { CoachState } from '../../hooks/useCoach';

interface CoachOverlayProps {
    coach: CoachState;
    audioPlaying: boolean;
    stopAudio: () => void;
    playAyahAtIndex: (idx: number) => Promise<void> | void;
    pageAyahsLength: number;
}

export function CoachOverlay({
    coach,
    audioPlaying,
    stopAudio,
    playAyahAtIndex,
    pageAyahsLength,
}: CoachOverlayProps) {
    const {
        isCoachMode,
        coachTotalProcessed,
        coachProgress,
        coachAccuracy,
        allCoachWords,
        coachMistakesCount,
        coachMistakes,
        coachInterimText,
        isListening,
        selectedError,
        setSelectedError,
        showMistakesSummary,
        setShowMistakesSummary,
        startCoachListening,
        stopCoachListening,
        toggleMushafBlancMode,
        toggleDuoMode,
        toggleFlashcardMode,
        toggleHandsFreeMode,
        isMushafBlanc,
        isDuoMode,
        isFlashcardMode,
        isHandsFree,
    } = coach;

    if (!isCoachMode) return null;

    return (
        <>
            {/* ===== Coach Progress Bar ===== */}
            {coachTotalProcessed > 0 && (
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

            {/* ===== Coach Floating Mic ===== */}
            <div className="mih-coach-controls">
                <div className="mih-coach-extra-modes">
                    <button
                        className={`mih-coach-mode-btn ${isHandsFree ? 'active' : ''}`}
                        onClick={toggleHandsFreeMode}
                        title="Mode Mains Libres (Logiciel)"
                    >
                        <Radio size={18} />
                    </button>
                    <button
                        className={`mih-coach-mode-btn ${isDuoMode ? 'active' : ''}`}
                        onClick={toggleDuoMode}
                        title="Mode Duo (Alternance)"
                    >
                        <Users size={18} />
                    </button>
                    <button
                        className={`mih-coach-mode-btn ${isFlashcardMode ? 'active' : ''}`}
                        onClick={toggleFlashcardMode}
                        title="Mode Flashcards (3 mots)"
                    >
                        <Zap size={18} />
                    </button>
                    <button
                        className={`mih-coach-mode-btn ${isMushafBlanc ? 'active' : ''}`}
                        onClick={toggleMushafBlancMode}
                        title="Mode Mushaf Blanc"
                    >
                        <EyeOff size={18} />
                    </button>
                </div>

                <div className="mih-coach-main-row">
                    <button
                        className="mih-coach-listen-btn"
                        onClick={() => {
                            if (pageAyahsLength === 0) return;
                            if (audioPlaying) {
                                stopAudio();
                            } else {
                                playAyahAtIndex(0);
                            }
                        }}
                        title={audioPlaying ? "Arrêter l'écoute" : "Écouter le verset (Récitateur)"}
                    >
                        {audioPlaying ? <Square size={18} /> : <Volume2 size={18} />}
                    </button>

                    <button
                        className={`mih-coach-mic ${isListening ? 'mih-coach-mic--active' : ''}`}
                        onClick={isListening ? stopCoachListening : () => startCoachListening()}
                    >
                        {isListening ? <Square size={28} /> : <Mic size={28} />}
                    </button>
                </div>
            </div>

            {/* ===== Coach Interim Text & Waveform ===== */}
            {isListening && (
                <div className="mih-coach-listening-area">
                    <div className="mih-waveform">
                        <div className="mih-waveform__bar" />
                        <div className="mih-waveform__bar" />
                        <div className="mih-waveform__bar" />
                        <div className="mih-waveform__bar" />
                        <div className="mih-waveform__bar" />
                    </div>
                    {coachInterimText && (
                        <div className="mih-coach-interim" dir="rtl">{coachInterimText}</div>
                    )}
                </div>
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
        </>
    );
}
