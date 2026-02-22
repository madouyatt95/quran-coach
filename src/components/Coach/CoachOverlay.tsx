import { useState } from 'react';
import { Volume2, X, GraduationCap, Users, Link2, Sparkles, BookOpenCheck, Square, Loader2 } from 'lucide-react';
import { playTts } from '../../lib/ttsService';
import type { CoachState, CoachMode } from '../../hooks/useCoach';
import { useDeepCoach } from '../../hooks/useDeepCoach';
import { ExamResultOverlay } from './ExamResultOverlay';

interface CoachOverlayProps {
    coach: CoachState;
    audioPlaying: boolean;
    stopAudio: () => void;
    playAyahAtIndex: (idx: number) => Promise<void> | void;
    pageAyahsLength: number;
    /** The full expected text of all currently loaded ayahs, for AI Exam comparison */
    expectedText: string;
}

const COACH_MODES = [
    {
        category: 'Apprentissage',
        modes: [
            { id: 'solo' as CoachMode, icon: GraduationCap, label: 'Solo', desc: 'Validation mot à mot' },
            { id: 'duo_echo' as CoachMode, icon: Users, label: 'Duo Écho', desc: 'Répétez après le Cheikh' }
        ]
    },
    {
        category: 'Examens',
        modes: [
            { id: 'link' as CoachMode, icon: Link2, label: "L'Enchaînement", desc: 'Récitez le verset suivant' },
            { id: 'magic_reveal' as CoachMode, icon: Sparkles, label: 'Révélation', desc: 'Dévoiler le Mus\'haf' }
        ]
    }
];

export function CoachOverlay({
    coach,
    audioPlaying,
    expectedText,
}: CoachOverlayProps) {
    const {
        isCoachMode,
        coachMode,
        duoPhase,
        coachTotalProcessed,
        coachProgress,
        coachAccuracy,
        coachMistakesCount,
        coachMistakes,
        coachInterimText,
        isListening,
        selectedError,
        setSelectedError,
        showMistakesSummary,
        setShowMistakesSummary,
        selectCoachMode,
    } = coach;

    const [isCenterOpen, setIsCenterOpen] = useState(false);

    // AI Exam Mode (completely independent of the real-time coach)
    const deepCoach = useDeepCoach();

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Build the exam overlay UI (always renders regardless of coach mode state)
    const examOverlayUI = (
        <>
            {/* Exam Recording Indicator */}
            {deepCoach.examState === 'recording' && (
                <div className="exam-recording-indicator">
                    <div className="exam-recording-indicator__dot" />
                    <span className="exam-recording-indicator__timer">
                        {formatDuration(deepCoach.recordingDuration)}
                    </span>
                    <span className="exam-recording-indicator__label">Récitez...</span>
                    <button
                        className="exam-recording-indicator__stop"
                        onClick={() => deepCoach.stopExamRecording(expectedText)}
                    >
                        <Square size={16} /> Arrêter
                    </button>
                </div>
            )}

            {/* Analyzing Spinner */}
            {deepCoach.examState === 'analyzing' && (
                <div className="exam-analyzing-overlay">
                    <div className="exam-analyzing-card">
                        <Loader2 size={32} className="exam-analyzing-spinner" />
                        <span>Analyse IA en cours...</span>
                    </div>
                </div>
            )}

            {/* Exam Error */}
            {deepCoach.examError && (
                <div className="exam-error-toast">
                    <span>{deepCoach.examError}</span>
                    <button onClick={() => deepCoach.clearExam()}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Exam Results */}
            {deepCoach.examState === 'results' && deepCoach.examResult && (
                <ExamResultOverlay
                    result={deepCoach.examResult}
                    onRetry={() => {
                        deepCoach.clearExam();
                        deepCoach.startExamRecording();
                    }}
                    onClose={() => deepCoach.clearExam()}
                />
            )}
        </>
    );

    // Coach Center modal content (shared)
    const coachCenterModal = isCenterOpen ? (
        <>
            <div className="mih-sheet-overlay" onClick={() => setIsCenterOpen(false)} />
            <div className="mih-coach-center">
                <div className="mih-coach-center__handle" />
                <div className="mih-coach-center__header">
                    <span className="mih-coach-center__title">
                        <GraduationCap size={20} />
                        Mode Coach
                    </span>
                    <button className="mih-sheet__close" onClick={() => setIsCenterOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="mih-coach-center__content">
                    {COACH_MODES.map(group => (
                        <div key={group.category} className="mih-coach-group">
                            <h4 className="mih-coach-group-title">{group.category}</h4>
                            <div className="mih-coach-grid">
                                {group.modes.map(mode => {
                                    const Icon = mode.icon;
                                    return (
                                        <button
                                            key={mode.id}
                                            className="mih-coach-card"
                                            onClick={() => {
                                                selectCoachMode(mode.id);
                                                setIsCenterOpen(false);
                                            }}
                                        >
                                            <div className="mih-coach-card-icon">
                                                <Icon size={24} />
                                            </div>
                                            <span className="mih-coach-card-label">{mode.label}</span>
                                            <span className="mih-coach-card-desc">{mode.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* AI-Powered Exam Mode */}
                    <div className="mih-coach-group">
                        <h4 className="mih-coach-group-title">🎯 Coach Expert</h4>
                        <div className="mih-coach-grid">
                            <button
                                className="mih-coach-card mih-coach-card--ai"
                                onClick={() => {
                                    setIsCenterOpen(false);
                                    deepCoach.startExamRecording();
                                }}
                            >
                                <div className="mih-coach-card-icon mih-coach-card-icon--ai">
                                    <BookOpenCheck size={24} />
                                </div>
                                <span className="mih-coach-card-label">Mode Examen</span>
                                <span className="mih-coach-card-desc">Récitez, l'IA analyse</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    ) : null;

    // If no mode is selected, show the floating FAB
    if (!isCoachMode) {
        return (
            <>
                <button
                    className="mih-coach-aura"
                    onClick={() => setIsCenterOpen(true)}
                    title="Ouvrir le Centre de Coaching"
                >
                    <GraduationCap size={24} />
                    <span className="mih-coach-aura-glow"></span>
                </button>

                {coachCenterModal}
                {examOverlayUI}
            </>
        );
    }

    // Active session UI (Coach is running)
    const activeIcon = COACH_MODES.flatMap(g => g.modes).find(m => m.id === coachMode)?.icon || GraduationCap;
    const ActiveIcon = activeIcon;

    return (
        <>
            {/* Active Session Floating Pill */}
            <div className={`mih-coach-session ${audioPlaying ? 'mih-coach-session--reciter' : ''}`}>
                <div className="mih-coach-session__header">
                    <button className="mih-coach-session__close" onClick={() => selectCoachMode(null)}>
                        <X size={16} />
                    </button>
                    <div className="mih-coach-session__status">
                        <ActiveIcon size={16} />
                        <span className="mih-coach-session__text">
                            {duoPhase === 'waiting' ? 'Sélectionnez un verset...' :
                                duoPhase === 'reciter' ? 'Le Cheikh récite...' :
                                    isListening ? 'À vous...' : 'Coach actif'}
                        </span>
                    </div>
                </div>

                <div className="mih-coach-progress">
                    <div className="mih-coach-progress__bar">
                        <div className="mih-coach-progress__fill" style={{ width: `${coachProgress * 100}%` }} />
                    </div>
                    {coachTotalProcessed > 0 && (
                        <div className="mih-coach-stats">
                            <span>{coachAccuracy}%</span>
                            <button
                                className={`mih-coach-errors-btn ${coachMistakesCount > 0 ? 'has-errors' : ''}`}
                                onClick={() => coachMistakesCount > 0 && setShowMistakesSummary(true)}
                                disabled={coachMistakesCount === 0}
                            >
                                {coachMistakesCount} {coachMistakesCount > 1 ? 'erreurs' : 'erreur'}
                            </button>
                        </div>
                    )}
                </div>

                {isListening && (
                    <div className="mih-coach-waveform">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                )}
            </div>

            {/* ===== Coach Interim Text ===== */}
            {coachInterimText && (
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

            {examOverlayUI}
        </>
    );
}
