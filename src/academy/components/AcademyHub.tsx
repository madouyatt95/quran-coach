// ─── Academy Hub — Premium Redesign ──────────────────────
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Trophy, Volume2, BookOpen, ArrowRight, Search, RotateCcw } from 'lucide-react';
import { useAcademyStore } from '../../stores/academyStore';
import { LEVEL_1_FONDATIONS } from '../data/level1-fondations';
import { LEVEL_2_PRATIQUE } from '../data/level2-pratique';
import { TAJWEED_RULES, TAJWEED_COLOR_LEGEND } from '../data/tajweed-rules';
import type { AcademyLevel, AcademyModule, AcademyLesson, AcademyQuiz } from '../data/types';
import { GlossaryText } from './GlossaryText';
import { CertificateModal } from './CertificateModal';
import './AcademyHub.css';

const LEVELS: AcademyLevel[] = [LEVEL_1_FONDATIONS, LEVEL_2_PRATIQUE];

// ─── TTS Helper ──────────────────────────────────────────
function playAudio(text: string, audioHint?: string) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const source = audioHint || text;
        const clean = source.replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s,،.]/g, '').trim();
        if (!clean) return;

        // Check if it's individual letters (short tokens separated by spaces)
        const tokens = clean.split(/\s+/).filter(t => t.length > 0);
        const isLetterList = tokens.length > 1 && tokens.every(t => t.length <= 2);

        if (isLetterList) {
            // Read each letter separately with a pause
            let delay = 0;
            tokens.forEach((letter) => {
                setTimeout(() => {
                    const utter = new SpeechSynthesisUtterance(letter);
                    utter.lang = 'ar-SA';
                    utter.rate = 0.6;
                    window.speechSynthesis.speak(utter);
                }, delay);
                delay += 900; // 900ms pause between letters
            });
        } else {
            const utter = new SpeechSynthesisUtterance(clean);
            utter.lang = 'ar-SA';
            utter.rate = 0.75;
            window.speechSynthesis.speak(utter);
        }
    }
}

// ─── Tajweed Visualizer ──────────────────────────────────
function TajweedVisualizer() {
    return (
        <div className="tajweed-viz">
            <div className="tajweed-legend">
                {TAJWEED_COLOR_LEGEND.map(r => (
                    <div key={r.id} className="tajweed-legend__item" style={{ background: r.bgColor }}>
                        <span className="tajweed-rule-card__color-dot" style={{ background: r.color }} />
                        {r.name}
                    </div>
                ))}
            </div>
            {TAJWEED_RULES.map(rule => (
                <div key={rule.id} className="tajweed-rule-card">
                    <div className="tajweed-rule-card__header">
                        <span className="tajweed-rule-card__color-dot" style={{ background: rule.color }} />
                        <span className="tajweed-rule-card__name">{rule.name}</span>
                        <span className="tajweed-rule-card__name-ar">{rule.nameAr}</span>
                    </div>
                    <div className="tajweed-rule-card__desc">{rule.description}</div>
                    <div className="tajweed-rule-card__example" style={{ background: rule.bgColor }}>
                        <div className="tajweed-rule-card__example-arabic" style={{ color: rule.color }}>
                            {rule.example.arabic}
                        </div>
                        <div className="tajweed-rule-card__example-ref">{rule.example.surah}</div>
                    </div>
                    <div className="tajweed-rule-card__desc" style={{ marginBottom: 6 }}>
                        <strong style={{ color: '#C9A84C' }}>Comment appliquer :</strong><br />
                        {rule.howTo}
                    </div>
                    <div className="tajweed-rule-card__mistakes">
                        {rule.commonMistake}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────
export function AcademyHub() {
    const navigate = useNavigate();
    const store = useAcademyStore();

    // Navigation state
    const [selectedLevel, setSelectedLevel] = useState<AcademyLevel | null>(null);
    const [activeModule, setActiveModule] = useState<AcademyModule | null>(null);
    const [contentIdx, setContentIdx] = useState(0);  // which content block (lesson/quiz)
    const [sectionIdx, setSectionIdx] = useState(0);   // within a lesson, which section
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizCorrect, setQuizCorrect] = useState(0);
    const [quizTotal, setQuizTotal] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showTajweed, setShowTajweed] = useState(false);
    // Feature 8: Search
    const [searchQuery, setSearchQuery] = useState('');
    // Feature 7: Tajwid practice mode
    const [tajwidPractice, setTajwidPractice] = useState(false);
    const [tajwidAnswer, setTajwidAnswer] = useState<number | null>(null);
    const [tajwidIdx, setTajwidIdx] = useState(0);
    const [showCertificate, setShowCertificate] = useState(false);

    const currentContent = activeModule?.content[contentIdx] ?? null;

    // Level progress
    const getLevelProgress = useCallback((level: AcademyLevel) => {
        const total = level.modules.length;
        if (total === 0) return 0;
        const done = level.modules.filter(m => store.progress[m.id]?.completed).length;
        return Math.round((done / total) * 100);
    }, [store.progress]);

    const getModuleProgress = useCallback((mod: AcademyModule) => {
        const p = store.progress[mod.id];
        if (p?.completed) return 100;
        // partial: count completed content blocks
        const total = mod.content.length;
        if (total === 0) return 0;
        // Use contentIdx as rough progress indicator when active
        if (activeModule?.id === mod.id) {
            return Math.round((contentIdx / total) * 100);
        }
        return 0;
    }, [store.progress, activeModule, contentIdx]);

    const isModuleUnlocked = useCallback((modId: string) => {
        return store.unlockedModules.includes(modId);
    }, [store.unlockedModules]);

    // Handlers
    const startModule = useCallback((mod: AcademyModule) => {
        if (!isModuleUnlocked(mod.id)) return;
        setActiveModule(mod);
        // Feature 1: Resume from saved position
        const saved = store.progress[mod.id];
        if (saved?.lastContentIdx !== undefined && !saved.completed) {
            setContentIdx(saved.lastContentIdx);
            setSectionIdx(saved.lastSectionIdx ?? 0);
        } else {
            setContentIdx(0);
            setSectionIdx(0);
        }
        setQuizIdx(0);
        setQuizAnswer(null);
        setQuizCorrect(0);
        setQuizTotal(0);
        setShowResult(false);
        setShowTajweed(false);
        setTajwidPractice(false);
        setTajwidAnswer(null);
    }, [isModuleUnlocked, store.progress]);

    // Feature 1: Save position on navigation
    const nextSection = useCallback(() => {
        if (!currentContent || currentContent.type !== 'lesson') return;
        const lesson = currentContent as AcademyLesson;
        if (sectionIdx < lesson.sections.length - 1) {
            const newIdx = sectionIdx + 1;
            setSectionIdx(newIdx);
            if (activeModule) store.savePosition(activeModule.id, contentIdx, newIdx);
        } else {
            if (activeModule && contentIdx < activeModule.content.length - 1) {
                const newContentIdx = contentIdx + 1;
                setContentIdx(newContentIdx);
                setSectionIdx(0);
                setQuizIdx(0);
                setQuizAnswer(null);
                if (activeModule) store.savePosition(activeModule.id, newContentIdx, 0);
            } else {
                finishModule();
            }
        }
    }, [currentContent, sectionIdx, contentIdx, activeModule, store]);

    const prevSection = useCallback(() => {
        if (sectionIdx > 0) {
            setSectionIdx(s => s - 1);
        }
    }, [sectionIdx]);

    const handleQuizAnswer = useCallback((answerIdx: number) => {
        if (quizAnswer !== null || !currentContent || currentContent.type !== 'quiz') return;
        const quiz = currentContent as AcademyQuiz;
        const correct = quiz.questions[quizIdx].answer === answerIdx;
        setQuizAnswer(answerIdx);
        setQuizTotal(t => t + 1);
        if (correct) setQuizCorrect(c => c + 1);
    }, [quizAnswer, currentContent, quizIdx]);

    const nextQuizQuestion = useCallback(() => {
        if (!currentContent || currentContent.type !== 'quiz') return;
        const quiz = currentContent as AcademyQuiz;
        if (quizIdx < quiz.questions.length - 1) {
            setQuizIdx(i => i + 1);
            setQuizAnswer(null);
        } else {
            // Quiz done — check if more content or module finished
            if (activeModule && contentIdx < activeModule.content.length - 1) {
                setContentIdx(c => c + 1);
                setSectionIdx(0);
                setQuizIdx(0);
                setQuizAnswer(null);
            } else {
                finishModule();
            }
        }
    }, [currentContent, quizIdx, contentIdx, activeModule]);

    const finishModule = useCallback(() => {
        const score = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 100;
        if (activeModule) {
            store.completeModule(activeModule.id, score);
        }
        setShowResult(true);
    }, [quizCorrect, quizTotal, activeModule, store]);

    const finalScore = useMemo(() => {
        return quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 100;
    }, [quizCorrect, quizTotal]);

    const passed = finalScore >= 80;

    // Feature 8: Filtered modules for search
    const allModules = useMemo(() => LEVELS.flatMap(l => l.modules), []);
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allModules.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.titleAr.includes(q) ||
            m.content.some(c => c.title.toLowerCase().includes(q))
        );
    }, [searchQuery, allModules]);

    // Feature 3: Modules due for review
    const reviewModuleIds = store.getModulesForReview();
    const reviewModules = useMemo(() =>
        allModules.filter(m => reviewModuleIds.includes(m.id)),
        [reviewModuleIds, allModules]);

    // Feature 7: Tajwid practice data (25 exercises, shuffled)
    const TAJWID_EXERCISES = useMemo(() => {
        const all = [
            // ── Iqlab (3) ──
            { verse: 'مِن بَعْدِ', rule: 'Iqlab', options: ['Idgham', 'Iqlab', 'Ikhfa', 'Izhar'], answer: 1, explanation: 'Nun sakin (ن) avant Baa (ب) → Iqlab : le nun se transforme en Mim (م).' },
            { verse: 'أَنبِئْهُمْ', rule: 'Iqlab', options: ['Izhar', 'Iqlab', 'Ikhfa', 'Madd'], answer: 1, explanation: 'Nun sakin suivie de Baa (ب) → Iqlab : transformation en Mim.' },
            { verse: 'سَمِيعٌ بَصِيرٌ', rule: 'Iqlab', options: ['Qalqalah', 'Ikhfa', 'Iqlab', 'Idgham'], answer: 2, explanation: 'Tanwin suivie de Baa (ب) → Iqlab.' },
            // ── Idgham avec Ghunna (4) ──
            { verse: 'مِن يَعْمَلْ', rule: 'Idgham bi ghunna', options: ['Izhar', 'Ikhfa', 'Idgham bi ghunna', 'Iqlab'], answer: 2, explanation: 'Nun sakin suivie de Ya (ي) → Idgham avec ghunna.' },
            { verse: 'مِن مَّاءٍ', rule: 'Idgham bi ghunna', options: ['Idgham bi ghunna', 'Izhar', 'Ikhfa', 'Iqlab'], answer: 0, explanation: 'Nun sakin suivie de Mim (م) → Idgham avec ghunna.' },
            { verse: 'مِن وَلِيٍّ', rule: 'Idgham bi ghunna', options: ['Ikhfa', 'Iqlab', 'Izhar', 'Idgham bi ghunna'], answer: 3, explanation: 'Nun sakin suivie de Waw (و) → Idgham avec ghunna.' },
            { verse: 'مِن نِّعْمَةٍ', rule: 'Idgham bi ghunna', options: ['Idgham bi ghunna', 'Idgham bila ghunna', 'Ikhfa', 'Izhar'], answer: 0, explanation: 'Nun sakin suivie de Nun (ن) → Idgham avec ghunna.' },
            // ── Idgham sans Ghunna (3) ──
            { verse: 'مَن رَّبُّكَ', rule: 'Idgham bila ghunna', options: ['Idgham bila ghunna', 'Ikhfa', 'Izhar', 'Qalqalah'], answer: 0, explanation: 'Nun sakin suivie de Ra (ر) → Idgham sans ghunna.' },
            { verse: 'مِن لَّدُنْهُ', rule: 'Idgham bila ghunna', options: ['Izhar', 'Idgham bila ghunna', 'Iqlab', 'Ikhfa'], answer: 1, explanation: 'Nun sakin suivie de Lam (ل) → Idgham sans ghunna.' },
            { verse: 'هُدًى لِّلْمُتَّقِينَ', rule: 'Idgham bila ghunna', options: ['Ikhfa', 'Iqlab', 'Idgham bila ghunna', 'Ghunna'], answer: 2, explanation: 'Tanwin suivie de Lam (ل) → Idgham sans ghunna.' },
            // ── Izhar (4) ──
            { verse: 'مِنْ خَيْرٍ', rule: 'Izhar', options: ['Ikhfa', 'Iqlab', 'Idgham', 'Izhar'], answer: 3, explanation: 'Nun sakin suivie de Kha (خ) → Izhar : prononciation claire.' },
            { verse: 'مَنْ آمَنَ', rule: 'Izhar', options: ['Izhar', 'Ikhfa', 'Idgham', 'Iqlab'], answer: 0, explanation: 'Nun sakin suivie de Hamza (أ) → Izhar halqi.' },
            { verse: 'مِنْ عِلْمٍ', rule: 'Izhar', options: ['Idgham', 'Ikhfa', 'Izhar', 'Madd'], answer: 2, explanation: 'Nun sakin suivie de Ayn (ع) → Izhar halqi.' },
            { verse: 'أَنْعَمْتَ', rule: 'Izhar', options: ['Iqlab', 'Izhar', 'Ikhfa', 'Idgham'], answer: 1, explanation: 'Nun sakin suivie de Ayn (ع) → Izhar : les 6 lettres de la gorge.' },
            // ── Ikhfa (4) ──
            { verse: 'أَنزَلْنَا', rule: 'Ikhfa', options: ['Ikhfa', 'Idgham', 'Izhar', 'Iqlab'], answer: 0, explanation: 'Nun sakin suivie de Za (ز) → Ikhfa : dissimulation partielle.' },
            { verse: 'مِنْ قَبْلِ', rule: 'Ikhfa', options: ['Izhar', 'Ikhfa', 'Idgham', 'Iqlab'], answer: 1, explanation: 'Nun sakin suivie de Qaf (ق) → Ikhfa.' },
            { verse: 'عَنْكَ', rule: 'Ikhfa', options: ['Ikhfa', 'Izhar', 'Iqlab', 'Idgham'], answer: 0, explanation: 'Nun sakin suivie de Kaf (ك) → Ikhfa.' },
            { verse: 'أَنْتُمْ', rule: 'Ikhfa', options: ['Idgham', 'Izhar', 'Iqlab', 'Ikhfa'], answer: 3, explanation: 'Nun sakin suivie de Ta (ت) → Ikhfa : entre Izhar et Idgham.' },
            // ── Qalqalah (3) ──
            { verse: 'قُلْ هُوَ', rule: 'Qalqalah', options: ['Madd', 'Ghunna', 'Qalqalah', 'Izhar'], answer: 2, explanation: 'Les 5 lettres de Qalqalah : ق ط ب ج د. Ici Qaf avec sukun.' },
            { verse: 'لَمْ يَلِدْ', rule: 'Qalqalah', options: ['Qalqalah', 'Ikhfa', 'Izhar', 'Idgham'], answer: 0, explanation: 'Dal (د) avec sukun en fin de verset → Qalqalah kubra.' },
            { verse: 'يَجْعَلُون', rule: 'Qalqalah', options: ['Ghunna', 'Madd', 'Izhar', 'Qalqalah'], answer: 3, explanation: 'Jim (ج) avec sukun → Qalqalah sughra (au milieu du mot).' },
            // ── Ghunna (2) ──
            { verse: 'إِنَّ', rule: 'Ghunna', options: ['Ghunna', 'Izhar', 'Ikhfa', 'Qalqalah'], answer: 0, explanation: 'Nun mushaddada (نّ) → Ghunna obligatoire de 2 temps.' },
            { verse: 'ثُمَّ', rule: 'Ghunna', options: ['Madd', 'Ghunna', 'Qalqalah', 'Izhar'], answer: 1, explanation: 'Mim mushaddada (مّ) → Ghunna obligatoire de 2 temps.' },
            // ── Madd (2) ──
            { verse: 'قَالُوا', rule: 'Madd tabii', options: ['Madd tabii', 'Ghunna', 'Ikhfa', 'Izhar'], answer: 0, explanation: 'Waw sakin précédée de damma → Madd tabii (2 temps).' },
            { verse: 'قِيلَ', rule: 'Madd tabii', options: ['Qalqalah', 'Izhar', 'Madd tabii', 'Ikhfa'], answer: 2, explanation: 'Ya sakin précédée de kasra → Madd tabii (allongement naturel de 2 temps).' },
        ];
        // Shuffle for variety
        return all.sort(() => Math.random() - 0.5);
    }, []);

    // ─── RENDER: Tajwid Practice Mode ────────────────────
    if (tajwidPractice) {
        const ex = TAJWID_EXERCISES[tajwidIdx];
        return (
            <div className="academy-hub">
                <div className="academy-quiz">
                    <div className="academy-quiz__header">
                        <button onClick={() => setTajwidPractice(false)}><ChevronLeft size={20} /></button>
                        <h2>🎯 Pratique Tajwid</h2>
                        <span className="academy-quiz__counter">{tajwidIdx + 1}/{TAJWID_EXERCISES.length}</span>
                    </div>

                    <div className="academy-lesson__arabic-block" style={{ margin: '20px 0' }}>
                        <div className="academy-lesson__arabic" style={{ fontSize: '2rem' }}>{ex.verse}</div>
                    </div>

                    <p className="academy-quiz__question">Quelle règle de Tajwid s'applique ici ?</p>

                    <div className="academy-quiz__options">
                        {ex.options.map((opt, i) => {
                            let cls = 'academy-quiz__option';
                            if (tajwidAnswer !== null) {
                                if (i === ex.answer) cls += ' correct';
                                else if (i === tajwidAnswer) cls += ' wrong';
                            }
                            return (
                                <button key={i} className={cls} onClick={() => setTajwidAnswer(i)} disabled={tajwidAnswer !== null}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {tajwidAnswer !== null && (
                        <>
                            <div className="academy-quiz__explanation">
                                {tajwidAnswer === ex.answer ? '✅ ' : '❌ '}{ex.explanation}
                            </div>
                            <button className="academy-quiz__next-btn" onClick={() => {
                                if (tajwidIdx < TAJWID_EXERCISES.length - 1) {
                                    setTajwidIdx(i => i + 1);
                                    setTajwidAnswer(null);
                                } else {
                                    setTajwidPractice(false);
                                }
                            }}>
                                {tajwidIdx === TAJWID_EXERCISES.length - 1 ? 'Terminer' : 'Suivant →'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ─── RENDER: Result Screen ───────────────────────────
    if (showResult && activeModule) {
        return (
            <div className="academy-hub">
                <div className="academy-result">
                    <div className="academy-result__icon">{passed ? '🏆' : '📚'}</div>
                    <h2 className={`academy-result__title ${passed ? 'success' : 'fail'}`}>
                        {passed ? 'Module Validé !' : 'Pas encore...'}
                    </h2>
                    <div className="academy-result__score">{finalScore}%</div>
                    <p className="academy-result__message">
                        {passed
                            ? `Bravo ! Vous avez obtenu ${quizCorrect}/${quizTotal} bonnes réponses.`
                            : `Vous avez obtenu ${quizCorrect}/${quizTotal}. Il faut 80% pour valider le module.`
                        }
                    </p>
                    <div className="academy-result__actions">
                        {passed && activeModule.linkedSurah && (
                            <button
                                className="academy-result__btn academy-result__btn-hifdh"
                                onClick={() => navigate(`/hifdh?surah=${activeModule.linkedSurah}`)}
                            >
                                <BookOpen size={18} />
                                Commencer la mémorisation
                            </button>
                        )}
                        <button
                            className="academy-result__btn academy-result__btn-primary"
                            onClick={() => { setActiveModule(null); setShowResult(false); }}
                        >
                            {passed ? 'Retour aux modules' : 'Réessayer plus tard'}
                        </button>
                        {!passed && (
                            <button
                                className="academy-result__btn academy-result__btn-secondary"
                                onClick={() => startModule(activeModule)}
                            >
                                Recommencer le module
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── RENDER: Lesson View ─────────────────────────────
    if (activeModule && currentContent?.type === 'lesson') {
        const lesson = currentContent as AcademyLesson;
        const section = lesson.sections[sectionIdx];
        const totalSections = lesson.sections.length;
        const progressPct = ((sectionIdx + 1) / totalSections) * 100;

        // Show Tajweed visualizer within Tajwid module
        const isTajweedModule = activeModule.id === 'tajweed-fondamental';

        return (
            <div className="academy-hub">
                <div className="academy-lesson">
                    <div className="academy-lesson__header">
                        <button onClick={() => setActiveModule(null)}><ChevronLeft size={20} /></button>
                        <h2>{lesson.title}</h2>
                    </div>
                    <div className="academy-lesson__progress">
                        <div className="academy-lesson__progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>

                    <div key={sectionIdx} className="academy-lesson__content">
                        {/* Premium Image */}
                        {section.image && (
                            <img
                                src={section.image}
                                alt={section.title || 'Illustration'}
                                className="academy-lesson__illustration"
                            />
                        )}
                        {section.title && <h3 className="academy-lesson__section-title">{section.title}</h3>}
                        {section.body && <div className="academy-lesson__body"><GlossaryText text={section.body} /></div>}

                        {section.arabic && (
                            <div className="academy-lesson__arabic-block">
                                <div className="academy-lesson__arabic">{section.arabic.split('\n').map((line, i) => <span key={i}>{line}{i < section.arabic!.split('\n').length - 1 && <br />}</span>)}</div>
                                {section.phonetic && (
                                    <div className="academy-lesson__phonetic">{section.phonetic.split('\n').map((line, i) => <span key={i}>{line}{i < section.phonetic!.split('\n').length - 1 && <br />}</span>)}</div>
                                )}
                                <button
                                    className="academy-lesson__audio-btn"
                                    onClick={() => playAudio(section.arabic!, section.audioHint)}
                                >
                                    <Volume2 size={16} /> Écouter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tajweed Visualizer (in Tajweed module only) */}
                    {isTajweedModule && sectionIdx === 0 && (
                        <>
                            <button
                                className="academy-lesson__audio-btn"
                                style={{ margin: '16px auto', display: 'flex' }}
                                onClick={() => setShowTajweed(!showTajweed)}
                            >
                                {showTajweed ? 'Masquer' : 'Voir'} les règles en détail
                            </button>
                            {showTajweed && <TajweedVisualizer />}
                        </>
                    )}

                    <div className="academy-lesson__nav">
                        {sectionIdx > 0 ? (
                            <button className="academy-lesson__nav-prev" onClick={prevSection}>
                                ← Précédent
                            </button>
                        ) : <span />}
                        <button className="academy-lesson__nav-next" onClick={nextSection}>
                            {sectionIdx === totalSections - 1
                                ? (contentIdx < activeModule.content.length - 1 ? 'Passer au quiz →' : 'Terminer ✓')
                                : 'Suivant →'
                            }
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── RENDER: Quiz View ───────────────────────────────
    if (activeModule && currentContent?.type === 'quiz') {
        const quiz = currentContent as AcademyQuiz;
        const q = quiz.questions[quizIdx];
        const isCorrect = quizAnswer !== null && q.answer === quizAnswer;

        return (
            <div className="academy-hub">
                <div className="academy-quiz">
                    <div className="academy-quiz__header">
                        <button onClick={() => setActiveModule(null)}><ChevronLeft size={20} /></button>
                        <h2>{quiz.title}</h2>
                        <span className="academy-quiz__counter">{quizIdx + 1}/{quiz.questions.length}</span>
                    </div>

                    <p className="academy-quiz__question">{q.q}</p>

                    <div className="academy-quiz__options">
                        {q.options.map((opt, i) => {
                            let cls = 'academy-quiz__option';
                            if (quizAnswer !== null) {
                                if (i === q.answer) cls += ' correct';
                                else if (i === quizAnswer) cls += ' wrong';
                            }
                            return (
                                <button
                                    key={i}
                                    className={cls}
                                    onClick={() => handleQuizAnswer(i)}
                                    disabled={quizAnswer !== null}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {quizAnswer !== null && (
                        <>
                            <div className="academy-quiz__explanation">
                                {isCorrect ? '✅ ' : '❌ '}{q.explanation}
                            </div>
                            <button className="academy-quiz__next-btn" onClick={nextQuizQuestion}>
                                {quizIdx === quiz.questions.length - 1
                                    ? (contentIdx < activeModule.content.length - 1 ? 'Continuer' : 'Voir le résultat')
                                    : 'Question suivante →'
                                }
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ─── RENDER: Module Grid ─────────────────────────────
    if (selectedLevel) {
        return (
            <div className="academy-hub">
                <div className="academy-modules-header">
                    <button onClick={() => setSelectedLevel(null)}><ChevronLeft size={20} /></button>
                    <h2>
                        {selectedLevel.image ? (
                            <img src={selectedLevel.image} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        ) : (
                            selectedLevel.icon
                        )}{' '}
                        {selectedLevel.title}
                    </h2>
                </div>
                {getLevelProgress(selectedLevel) === 100 && (
                    <button
                        className="academy-result__btn academy-result__btn-primary"
                        style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #c9a84c, #b8962d)', border: 'none', color: '#fff', width: 'calc(100% - 32px)' }}
                        onClick={() => setShowCertificate(true)}
                    >
                        🎓 Obtenir mon diplôme
                    </button>
                )}
                {showCertificate && (
                    <CertificateModal
                        userName={localStorage.getItem('qc_user_name') || ''}
                        levelTitle={selectedLevel.title}
                        onClose={() => setShowCertificate(false)}
                    />
                )}
                <div className="academy-modules-grid">
                    {selectedLevel.modules.map(mod => {
                        const unlocked = isModuleUnlocked(mod.id);
                        const completed = store.progress[mod.id]?.completed;
                        const score = store.progress[mod.id]?.score ?? 0;
                        const progress = getModuleProgress(mod);
                        const hasSavedPos = !completed && store.progress[mod.id]?.lastContentIdx !== undefined;
                        const isReviewDue = reviewModuleIds.includes(mod.id);

                        return (
                            <div
                                key={mod.id}
                                className={`academy-module-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
                                onClick={() => unlocked && startModule(mod)}
                            >
                                <div className="academy-module-card__top">
                                    {mod.image && (
                                        <img
                                            src={mod.image}
                                            alt={mod.title}
                                            className="academy-module-card__image"
                                        />
                                    )}
                                    {!mod.image && <div className="academy-module-card__icon">{mod.icon}</div>}
                                    <div className="academy-module-card__info">
                                        <h3 className="academy-module-card__title">{mod.title}</h3>
                                        <p className="academy-module-card__desc">{mod.description}</p>
                                    </div>
                                </div>
                                <div className="academy-module-card__meta">
                                    <span>⏱ {mod.estimatedMinutes} min</span>
                                    <span>{'⭐'.repeat(mod.difficulty)}</span>
                                    {completed && <span>Score: {score}%</span>}
                                    {!unlocked && <span>🔒 Verrouillé</span>}
                                    {mod.linkedSurah && <span>📖 Mémorisation</span>}
                                </div>
                                {completed && (
                                    <div className="academy-module-card__badge">
                                        <CheckCircle size={22} />
                                    </div>
                                )}
                                {/* Feature 1: Resume badge */}
                                {hasSavedPos && (
                                    <div className="academy-module-card__resume">▶ Reprendre</div>
                                )}
                                {/* Feature 3: Review due badge */}
                                {isReviewDue && (
                                    <div className="academy-module-card__review">
                                        <RotateCcw size={12} /> Réviser
                                    </div>
                                )}
                                {!completed && unlocked && progress > 0 && (
                                    <div className="academy-module-card__progress">
                                        <div className="academy-module-card__progress-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── RENDER: Level Selector (Hub) ────────────────────
    return (
        <div className="academy-hub">
            <header className="academy-header">
                <button className="academy-back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={22} />
                </button>
                <h1>📚 Académie</h1>
            </header>

            {/* Feature 8: Search Bar */}
            <div className="academy-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Rechercher un cours..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Feature 8: Search Results */}
            {searchQuery.trim() && (
                <div className="academy-search-results">
                    {searchResults.length === 0 && <p className="academy-search-empty">Aucun résultat pour "{searchQuery}"</p>}
                    {searchResults.map(mod => (
                        <button key={mod.id} className="academy-search-item" onClick={() => { setSearchQuery(''); startModule(mod); }}>
                            <span>{mod.icon}</span>
                            <div>
                                <strong>{mod.title}</strong>
                                <small>{mod.description}</small>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Feature 3: Review Banner */}
            {!searchQuery.trim() && reviewModules.length > 0 && (
                <div className="academy-review-banner">
                    <RotateCcw size={16} />
                    <div>
                        <strong>{reviewModules.length} module{reviewModules.length > 1 ? 's' : ''} à réviser</strong>
                        <small>La révision espacée renforce la mémorisation</small>
                    </div>
                    <button onClick={() => { startModule(reviewModules[0]); store.markReviewed(reviewModules[0].id); }}>
                        Réviser
                    </button>
                </div>
            )}

            {/* Feature 7: Tajwid Practice Button */}
            {!searchQuery.trim() && (
                <button className="academy-tajwid-practice-btn" onClick={() => { setTajwidPractice(true); setTajwidIdx(0); setTajwidAnswer(null); }}>
                    🎯 Mode Pratique Tajwid
                </button>
            )}

            {/* Overview */}
            <div className="academy-overview">
                <div className="academy-overview__xp">{store.totalXp}</div>
                <div className="academy-overview__xp-label">Points d'expérience</div>
                {Object.keys(store.progress).length > 0 && (
                    <div className="academy-overview__badges">
                        {Object.entries(store.progress)
                            .filter(([, p]) => p.completed)
                            .map(([id]) => {
                                const mod = LEVELS.flatMap(l => l.modules).find(m => m.id === id);
                                return mod ? (
                                    <span key={id} className="academy-badge">
                                        <Trophy size={12} /> {mod.title}
                                    </span>
                                ) : null;
                            })}
                    </div>
                )}
            </div>

            {/* Levels */}
            <div className="academy-levels">
                {LEVELS.map(level => {
                    const pct = getLevelProgress(level);
                    return (
                        <div
                            key={level.id}
                            className="academy-level-card"
                            onClick={() => setSelectedLevel(level)}
                        >
                            <div className="academy-level-card__banner" style={{ background: level.gradient }}>
                                <div className="academy-level-card__top">
                                    <div className="academy-level-card__icon">
                                        {level.image ? <img src={level.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : level.icon}
                                    </div>
                                    <div className="academy-level-card__info">
                                        <h2 className="academy-level-card__title">{level.title}</h2>
                                        <p className="academy-level-card__subtitle">{level.description}</p>
                                    </div>
                                    <ArrowRight size={20} color="rgba(255,255,255,0.6)" />
                                </div>
                                <div className="academy-level-card__progress">
                                    <div className="academy-level-card__progress-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="academy-level-card__pct">
                                    {pct}% • {level.modules.filter(m => store.progress[m.id]?.completed).length}/{level.modules.length} modules
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
