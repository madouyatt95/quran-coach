// ─── Académie Junior — Composant Principal ───────────────
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CLEF_DU_PARADIS } from '../data/junior/clef-du-paradis';
import type { JuniorModule, JuniorStep } from '../data/junior/types';
import './AcademyJunior.css';

// Future modules (placeholders)
const JUNIOR_MODULES: (JuniorModule | { id: string; title: string; emoji: string; description: string; color: string; locked: true })[] = [
    CLEF_DU_PARADIS,
    { id: 'jr-alphabet', title: 'J\'apprends l\'alphabet arabe', emoji: '🔤', description: 'Découvre les lettres arabes en t\'amusant !', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', locked: true },
    { id: 'jr-sourates', title: 'Mes premières sourates', emoji: '📖', description: 'Mémorise tes premières sourates du Coran.', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', locked: true },
    { id: 'jr-invocations', title: 'Les invocations du quotidien', emoji: '🤲', description: 'Apprends les douas de tous les jours.', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', locked: true },
    { id: 'jr-prophets', title: 'Histoires des prophètes', emoji: '🕊️', description: 'Les plus belles histoires des prophètes.', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', locked: true },
];

const STORAGE_KEY = 'qc_junior_progress';

interface JuniorProgress {
    completedSteps: string[];
    stepStars: Record<string, number>;
}

function loadProgress(): JuniorProgress {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return { completedSteps: [], stepStars: {} };
}

function saveProgress(p: JuniorProgress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── Sound feedback ──────────────────────────────────────
function playSound(type: 'correct' | 'wrong' | 'victory') {
    try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = 0.15;
        if (type === 'correct') {
            osc.frequency.value = 523; // C5
            osc.type = 'sine';
            osc.start(); osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'wrong') {
            osc.frequency.value = 200;
            osc.type = 'square';
            gain.gain.value = 0.08;
            osc.start(); osc.stop(ctx.currentTime + 0.2);
        } else {
            osc.frequency.value = 523;
            osc.type = 'sine';
            osc.start();
            setTimeout(() => { osc.frequency.value = 659; }, 150);
            setTimeout(() => { osc.frequency.value = 784; }, 300);
            osc.stop(ctx.currentTime + 0.5);
        }
    } catch { /* noop */ }
}

// ─── Confetti effect ─────────────────────────────────────
function Confetti() {
    const emojis = ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '💛', '💚'];
    const [pieces, setPieces] = useState<{ id: number; emoji: string; left: number; delay: number }[]>([]);
    useEffect(() => {
        const items = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            left: Math.random() * 100,
            delay: Math.random() * 2,
        }));
        setPieces(items);
    }, []);

    return (
        <>
            {pieces.map(p => (
                <span key={p.id} className="junior-confetti" style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }}>
                    {p.emoji}
                </span>
            ))}
        </>
    );
}

// ─── Main Component ──────────────────────────────────────
export function AcademyJunior({ onBack }: { onBack: () => void }) {
    const [progress, setProgress] = useState<JuniorProgress>(loadProgress);
    const [selectedModule, setSelectedModule] = useState<JuniorModule | null>(null);
    const [activeStep, setActiveStep] = useState<JuniorStep | null>(null);
    const [phase, setPhase] = useState<'lesson' | 'activity' | 'quiz' | 'recap' | 'victory'>('lesson');

    // Activity state
    const [activityAnswers, setActivityAnswers] = useState<Record<number, boolean>>({});
    const [activityDone, setActivityDone] = useState(false);
    // Match activity — now sequential
    const [matchIdx, setMatchIdx] = useState(0);
    const [matchAnswer, setMatchAnswer] = useState<number | null>(null);
    const [matchCorrectCount, setMatchCorrectCount] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState<number[]>([]);

    // Quiz state
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizCorrect, setQuizCorrect] = useState(0);
    const [shuffledQuizOptions, setShuffledQuizOptions] = useState<number[]>([]);

    // Final badge
    const [showFinalBadge, setShowFinalBadge] = useState(false);

    // Persist progress
    useEffect(() => { saveProgress(progress); }, [progress]);

    // Shuffle helper
    const shuffleArray = (arr: number[]) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    // Shuffle quiz options
    useEffect(() => {
        if (activeStep && phase === 'quiz') {
            const numOptions = activeStep.quiz[quizIdx].options.length;
            setShuffledQuizOptions(shuffleArray(Array.from({ length: numOptions }, (_, i) => i)));
        }
    }, [activeStep, phase, quizIdx]);

    // Reset states when entering a step
    const enterStep = (step: JuniorStep) => {
        setActiveStep(step);
        setPhase('lesson');
        setActivityAnswers({});
        setActivityDone(false);
        setMatchIdx(0);
        setMatchAnswer(null);
        setMatchCorrectCount(0);
        setQuizIdx(0);
        setQuizAnswer(null);
        setQuizCorrect(0);
        // Shuffle options for match activity
        if (step.activity.type === 'match' && step.activity.pairs) {
            setShuffledOptions(shuffleArray(step.activity.pairs.map((_, i) => i)));
        }
    };

    const isStepUnlocked = (step: JuniorStep, module: JuniorModule): boolean => {
        if (step.number === 1) return true;
        const prevStep = module.steps.find(s => s.number === step.number - 1);
        return prevStep ? progress.completedSteps.includes(prevStep.id) : false;
    };

    const completeStep = () => {
        if (!activeStep || !selectedModule) return;
        const stars = quizCorrect === activeStep.quiz.length ? 3 : quizCorrect >= 1 ? 2 : 1;
        const newProgress = {
            completedSteps: [...new Set([...progress.completedSteps, activeStep.id])],
            stepStars: { ...progress.stepStars, [activeStep.id]: Math.max(stars, progress.stepStars[activeStep.id] || 0) },
        };
        setProgress(newProgress);
        playSound('victory');

        // Check if all steps complete → final badge
        const allDone = selectedModule.steps.every(s => newProgress.completedSteps.includes(s.id));
        if (allDone) {
            setShowFinalBadge(true);
        }

        // Go to recap phase first, then victory
        setPhase('recap');
    };

    // ─── RENDER: Final Badge ─────────────────────────────
    if (showFinalBadge && selectedModule) {
        return (
            <div className="junior-hub">
                <Confetti />
                <div className="junior-victory">
                    <div className="junior-victory__emoji">🏆</div>
                    <h2 className="junior-victory__title">Félicitations !</h2>
                    <p className="junior-victory__subtitle">Tu as terminé tout le module !</p>
                    <div className="junior-victory__badge">
                        <div className="junior-victory__badge-emoji">{selectedModule.badge.emoji}</div>
                        <div className="junior-victory__badge-title">{selectedModule.badge.title}</div>
                    </div>
                    <p className="junior-victory__subtitle">Tu as obtenu le badge « {selectedModule.badge.title} » 🎊</p>
                    <button className="junior-action-btn junior-action-btn--gold" onClick={() => { setShowFinalBadge(false); setActiveStep(null); }}>
                        Retour au module
                    </button>
                </div>
            </div>
        );
    }

    // ─── RENDER: Recap Screen (Improvement #2) ───────────
    if (activeStep && phase === 'recap') {
        const stars = progress.stepStars[activeStep.id] || 1;
        return (
            <div className="junior-content">
                <Confetti />
                <div className="junior-recap">
                    <div className="junior-recap__header">
                        <span className="junior-recap__emoji">🎉</span>
                        <h2>Bravo ! Étape {activeStep.number} terminée !</h2>
                        <div className="junior-victory__stars">
                            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                        </div>
                    </div>

                    <div className="junior-recap__section">
                        <h3>📝 Ce que tu as appris</h3>
                        <p>{activeStep.lessonTitle}</p>
                    </div>

                    {activeStep.verse && (
                        <div className="junior-recap__section">
                            <h3>📖 Verset à retenir</h3>
                            <div className="junior-verse-box">
                                <div className="junior-verse-box__arabic">{activeStep.verse}</div>
                                {activeStep.versePhonetic && <div className="junior-verse-box__phonetic">{activeStep.versePhonetic}</div>}
                                {activeStep.verseTranslation && <div className="junior-verse-box__translation">{activeStep.verseTranslation}</div>}
                                <div className="junior-verse-box__ref">{activeStep.verseRef}</div>
                            </div>
                        </div>
                    )}

                    {activeStep.hadith && (
                        <div className="junior-recap__section">
                            <h3>📜 Hadith à retenir</h3>
                            <div className="junior-hadith-box">
                                <div className="junior-hadith-box__arabic">{activeStep.hadith}</div>
                                {activeStep.hadithPhonetic && <div className="junior-hadith-box__phonetic">{activeStep.hadithPhonetic}</div>}
                                {activeStep.hadithTranslation && <div className="junior-hadith-box__translation">{activeStep.hadithTranslation}</div>}
                                <div className="junior-hadith-box__ref">{activeStep.hadithRef}</div>
                            </div>
                        </div>
                    )}

                    <div className="junior-recap__section">
                        <h3>🧠 Ton score</h3>
                        <p>{quizCorrect}/{activeStep.quiz.length} bonnes réponses au quiz</p>
                    </div>

                    <button className="junior-action-btn junior-action-btn--primary" onClick={() => {
                        if (selectedModule) {
                            const nextStep = selectedModule.steps.find(s => s.number === activeStep.number + 1);
                            if (nextStep) {
                                enterStep(nextStep);
                            } else {
                                setActiveStep(null);
                            }
                        }
                    }}>
                        {selectedModule && activeStep.number < selectedModule.steps.length ? 'Étape suivante ➡️' : 'Retour au module 🏠'}
                    </button>
                </div>
            </div>
        );
    }

    // ─── RENDER: Step Content ────────────────────────────
    if (activeStep) {
        const phaseIdx = phase === 'lesson' ? 0 : phase === 'activity' ? 1 : 2;
        return (
            <div className="junior-content">
                <div className="junior-content__header">
                    <button className="junior-steps__back" onClick={() => setActiveStep(null)}>
                        <ChevronLeft size={20} />
                    </button>
                    <span className="junior-content__step-badge">Étape {activeStep.number}</span>
                    <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{activeStep.title}</span>
                </div>

                {/* Phase tabs */}
                <div className="junior-content__phase-tabs">
                    {['lesson', 'activity', 'quiz'].map((p, i) => (
                        <div key={p} className={`junior-phase-tab ${i < phaseIdx ? 'junior-phase-tab--done' : ''} ${i === phaseIdx ? 'junior-phase-tab--active' : ''}`} />
                    ))}
                </div>

                {/* LESSON PHASE */}
                {phase === 'lesson' && (
                    <>
                        <div className="junior-lesson-card">
                            <div className="junior-lesson-card__illustration">{activeStep.illustration}</div>
                            <h2>{activeStep.lessonTitle}</h2>
                            <div className="junior-lesson-card__body">{activeStep.lessonBody}</div>

                            {activeStep.verse && (
                                <div className="junior-verse-box">
                                    <div className="junior-verse-box__arabic">{activeStep.verse}</div>
                                    {activeStep.versePhonetic && <div className="junior-verse-box__phonetic">{activeStep.versePhonetic}</div>}
                                    {activeStep.verseTranslation && <div className="junior-verse-box__translation">{activeStep.verseTranslation}</div>}
                                    <div className="junior-verse-box__ref">{activeStep.verseRef}</div>
                                </div>
                            )}
                            {activeStep.hadith && (
                                <div className="junior-hadith-box">
                                    <div className="junior-hadith-box__arabic">{activeStep.hadith}</div>
                                    {activeStep.hadithPhonetic && <div className="junior-hadith-box__phonetic">{activeStep.hadithPhonetic}</div>}
                                    {activeStep.hadithTranslation && <div className="junior-hadith-box__translation">{activeStep.hadithTranslation}</div>}
                                    <div className="junior-hadith-box__ref">{activeStep.hadithRef}</div>
                                </div>
                            )}
                        </div>
                        <button className="junior-action-btn junior-action-btn--primary" onClick={() => setPhase('activity')}>
                            J'ai compris ! ➡️
                        </button>
                    </>
                )}

                {/* ACTIVITY PHASE */}
                {phase === 'activity' && (
                    <>
                        <div className="junior-activity">
                            <h3>{activeStep.activity.instruction}</h3>

                            {/* TRUE/FALSE */}
                            {activeStep.activity.type === 'truefalse' && activeStep.activity.statements && (
                                <div className="junior-activity__items">
                                    {activeStep.activity.statements.map((st, i) => {
                                        const answered = activityAnswers[i] !== undefined;
                                        const isCorrect = activityAnswers[i];
                                        return (
                                            <div key={i} className={`junior-activity__item ${answered ? (isCorrect ? 'junior-activity__item--correct' : 'junior-activity__item--wrong') : ''}`}>
                                                <span style={{ flex: 1 }}>{st.text}</span>
                                                {!answered && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button style={{ background: 'rgba(46,213,115,0.2)', border: '1px solid #2ed573', borderRadius: 10, padding: '6px 14px', color: '#2ed573', cursor: 'pointer', fontWeight: 700 }}
                                                            onClick={() => {
                                                                const correct = st.correct === true;
                                                                playSound(correct ? 'correct' : 'wrong');
                                                                setActivityAnswers(prev => ({ ...prev, [i]: correct }));
                                                                const newAnswers = { ...activityAnswers, [i]: correct };
                                                                if (Object.keys(newAnswers).length === activeStep.activity.statements!.length) setActivityDone(true);
                                                            }}>Vrai</button>
                                                        <button style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid #ff4757', borderRadius: 10, padding: '6px 14px', color: '#ff4757', cursor: 'pointer', fontWeight: 700 }}
                                                            onClick={() => {
                                                                const correct = st.correct === false;
                                                                playSound(correct ? 'correct' : 'wrong');
                                                                setActivityAnswers(prev => ({ ...prev, [i]: correct }));
                                                                const newAnswers = { ...activityAnswers, [i]: correct };
                                                                if (Object.keys(newAnswers).length === activeStep.activity.statements!.length) setActivityDone(true);
                                                            }}>Faux</button>
                                                    </div>
                                                )}
                                                {answered && <span>{isCorrect ? '✅' : '❌'}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ORDER */}
                            {activeStep.activity.type === 'order' && activeStep.activity.items && (
                                <div className="junior-activity__items">
                                    {activeStep.activity.items.map((item, i) => (
                                        <div key={i} className="junior-activity__item junior-activity__item--correct">
                                            <span style={{ background: 'rgba(102,126,234,0.3)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{i + 1}</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                    {!activityDone && (
                                        <button className="junior-action-btn junior-action-btn--success" onClick={() => { setActivityDone(true); playSound('correct'); }} style={{ marginTop: 8 }}>
                                            C'est dans le bon ordre ! ✅
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* MATCH — Sequential (Improvement #1) */}
                            {activeStep.activity.type === 'match' && activeStep.activity.pairs && (
                                <div className="junior-match-sequential">
                                    {matchIdx < activeStep.activity.pairs.length ? (
                                        <>
                                            {/* Current item to match */}
                                            <div className="junior-match-prompt">
                                                <span className="junior-match-prompt__label">Trouve la bonne réponse pour :</span>
                                                <div className="junior-match-prompt__item">{activeStep.activity.pairs[matchIdx].left}</div>
                                            </div>

                                            {/* Counter */}
                                            <div className="junior-match-counter">
                                                {matchIdx + 1} / {activeStep.activity.pairs.length}
                                            </div>

                                            {/* Options */}
                                            <div className="junior-match-options">
                                                {shuffledOptions.map(origIdx => {
                                                    const pair = activeStep.activity.pairs![origIdx];
                                                    const isAnswered = matchAnswer !== null;
                                                    const isCorrectOption = origIdx === matchIdx;
                                                    const isSelected = matchAnswer === origIdx;
                                                    return (
                                                        <button key={origIdx}
                                                            className={`junior-match-option ${isAnswered && isCorrectOption ? 'junior-match-option--correct' : ''} ${isAnswered && isSelected && !isCorrectOption ? 'junior-match-option--wrong' : ''}`}
                                                            disabled={isAnswered}
                                                            onClick={() => {
                                                                setMatchAnswer(origIdx);
                                                                const correct = origIdx === matchIdx;
                                                                playSound(correct ? 'correct' : 'wrong');
                                                                if (correct) setMatchCorrectCount(prev => prev + 1);
                                                                // Auto-advance after delay
                                                                setTimeout(() => {
                                                                    const nextIdx = matchIdx + 1;
                                                                    if (nextIdx >= activeStep.activity.pairs!.length) {
                                                                        setActivityDone(true);
                                                                    } else {
                                                                        setMatchIdx(nextIdx);
                                                                        setMatchAnswer(null);
                                                                        // Re-shuffle for next
                                                                        setShuffledOptions(prev => {
                                                                            const a = [...prev];
                                                                            for (let i = a.length - 1; i > 0; i--) {
                                                                                const j = Math.floor(Math.random() * (i + 1));
                                                                                [a[i], a[j]] = [a[j], a[i]];
                                                                            }
                                                                            return a;
                                                                        });
                                                                    }
                                                                }, 1000);
                                                            }}>
                                                            {pair.right}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#2ed573', fontSize: '1.1rem', fontWeight: 600, padding: 20 }}>
                                            ✅ Toutes les associations sont terminées !<br />
                                            {matchCorrectCount}/{activeStep.activity.pairs.length} bonnes réponses
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {activityDone && (
                            <button className="junior-action-btn junior-action-btn--primary" onClick={() => setPhase('quiz')}>
                                Passer au quiz ! 🧠
                            </button>
                        )}
                    </>
                )}

                {/* QUIZ PHASE */}
                {phase === 'quiz' && (
                    <>
                        <div className="junior-quiz">
                            <h3>Mini Quiz 🧠</h3>
                            <div className="junior-quiz__counter">Question {quizIdx + 1} / {activeStep.quiz.length}</div>
                            <div className="junior-quiz__question">{activeStep.quiz[quizIdx].question}</div>
                            <div className="junior-quiz__options">
                                {shuffledQuizOptions.map((origIdx) => {
                                    const opt = activeStep.quiz[quizIdx].options[origIdx];
                                    const answered = quizAnswer !== null;
                                    const isCorrectOption = origIdx === activeStep.quiz[quizIdx].answer;
                                    const isSelected = quizAnswer === origIdx;
                                    return (
                                        <button key={origIdx}
                                            className={`junior-quiz__option ${answered && isCorrectOption ? 'junior-quiz__option--correct' : ''} ${answered && isSelected && !isCorrectOption ? 'junior-quiz__option--wrong' : ''}`}
                                            disabled={answered}
                                            onClick={() => {
                                                setQuizAnswer(origIdx);
                                                const correct = origIdx === activeStep.quiz[quizIdx].answer;
                                                playSound(correct ? 'correct' : 'wrong');
                                                if (correct) setQuizCorrect(prev => prev + 1);
                                            }}>
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {quizAnswer !== null && (
                                <div className={`junior-quiz__feedback ${quizAnswer === activeStep.quiz[quizIdx].answer ? 'junior-quiz__feedback--correct' : 'junior-quiz__feedback--wrong'}`}>
                                    {activeStep.quiz[quizIdx].feedback}
                                </div>
                            )}
                        </div>

                        {quizAnswer !== null && (
                            <button className="junior-action-btn junior-action-btn--primary" onClick={() => {
                                if (quizIdx < activeStep.quiz.length - 1) {
                                    setQuizIdx(quizIdx + 1);
                                    setQuizAnswer(null);
                                } else {
                                    completeStep();
                                }
                            }}>
                                {quizIdx < activeStep.quiz.length - 1 ? 'Question suivante ➡️' : 'Voir le résumé ✅'}
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    }

    // ─── RENDER: Step Map ────────────────────────────────
    if (selectedModule) {
        const completedCount = selectedModule.steps.filter(s => progress.completedSteps.includes(s.id)).length;
        const totalStars = selectedModule.steps.reduce((sum, s) => sum + (progress.stepStars[s.id] || 0), 0);
        const pct = Math.round((completedCount / selectedModule.steps.length) * 100);

        return (
            <div className="junior-steps">
                <div className="junior-steps__header">
                    <button className="junior-steps__back" onClick={() => setSelectedModule(null)}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="junior-steps__title">{selectedModule.emoji} {selectedModule.title}</h2>
                </div>

                <div className="junior-progress-overview">
                    <div className="junior-progress-overview__stars">⭐ {totalStars}</div>
                    <div className="junior-progress-overview__bar">
                        <div className="junior-progress-overview__label">{completedCount}/{selectedModule.steps.length} étapes • {pct}%</div>
                        <div className="junior-progress-overview__track">
                            <div className="junior-progress-overview__fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                </div>

                <div className="junior-step-list">
                    {selectedModule.steps.map(step => {
                        const completed = progress.completedSteps.includes(step.id);
                        const unlocked = isStepUnlocked(step, selectedModule);
                        const stars = progress.stepStars[step.id] || 0;
                        const isNext = !completed && unlocked;

                        return (
                            <div key={step.id}
                                className={`junior-step-item ${completed ? 'junior-step-item--completed' : ''} ${isNext ? 'junior-step-item--active' : ''} ${!unlocked ? 'junior-step-item--locked' : ''}`}
                                onClick={() => unlocked && enterStep(step)}>
                                <div className={`junior-step-item__dot ${completed ? 'junior-step-item__dot--completed' : ''} ${isNext ? 'junior-step-item__dot--active' : ''} ${!unlocked ? 'junior-step-item__dot--locked' : ''}`}>
                                    {completed ? '✓' : step.number}
                                </div>
                                <div className="junior-step-item__info">
                                    <h4>{step.emoji} {step.title}</h4>
                                    {/* Improvement #3: Redo steps */}
                                    <small>
                                        {!unlocked ? '🔒 Termine l\'étape précédente'
                                            : completed ? `Terminée — Appuie pour améliorer (${stars}/3 ⭐)`
                                                : 'Prêt à commencer'}
                                    </small>
                                </div>
                                {completed && <div className="junior-step-item__stars">{'⭐'.repeat(stars)}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── RENDER: Module Selection ─────────────────────────
    return (
        <div className="junior-hub">
            <div className="junior-header">
                <button className="junior-steps__back" onClick={onBack}>
                    <ChevronLeft size={20} />
                </button>
                <h1>🧒 Académie Junior</h1>
                <span className="junior-header__badge">ENFANTS</span>
            </div>

            <div className="junior-modules">
                {JUNIOR_MODULES.map((mod, idx) => {
                    const isLocked = 'locked' in mod;
                    const completedCount = !isLocked ? (mod as JuniorModule).steps.filter(s => progress.completedSteps.includes(s.id)).length : 0;
                    const totalSteps = !isLocked ? (mod as JuniorModule).steps.length : 0;
                    const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

                    return (
                        <div key={mod.id}
                            className={`junior-module-card ${isLocked ? 'junior-module-card--locked' : ''}`}
                            style={{ background: mod.color }}
                            onClick={() => !isLocked && setSelectedModule(mod as JuniorModule)}>
                            <div className="junior-module-card__top">
                                {/* Improvement #5: Animated emoji icons */}
                                <div className="junior-module-card__emoji" style={{ animationDelay: `${idx * 0.15}s` }}>{mod.emoji}</div>
                                <div className="junior-module-card__info">
                                    <h3>{mod.title}</h3>
                                    <p>{mod.description}</p>
                                </div>
                            </div>
                            {!isLocked && (
                                <>
                                    <div className="junior-module-card__progress-bar">
                                        <div className="junior-module-card__progress-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="junior-module-card__stats">
                                        <span>{completedCount}/{totalSteps} étapes</span>
                                        <span>{pct}%</span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
