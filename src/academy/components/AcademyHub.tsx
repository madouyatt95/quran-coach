import {usePageState,useSmartBack} from '../../hooks/usePageState';
import {ArabicEntry} from '../../arabic/ArabicEntry';
// ─── Academy Hub — Premium Redesign ──────────────────────
import { useState, useCallback, useMemo, useEffect, useEffectEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Trophy, Volume2, BookOpen, ArrowRight, Search, RotateCcw } from 'lucide-react';
import { useAcademyStore } from '../../stores/academyStore';
import { LEVEL_1_FONDATIONS } from '../data/level1-fondations';
import { LEVEL_2_PRATIQUE } from '../data/level2-pratique';
import { TAJWEED_RULES, TAJWEED_COLOR_LEGEND } from '../data/tajweed-rules';
import type { AcademyLevel, AcademyModule, AcademyLesson, AcademyQuiz } from '../data/types';
import { GlossaryText } from './GlossaryText';
import { CertificateModal } from './CertificateModal';
import { AcademyJunior } from './AcademyJunior';
import './AcademyHub.css';
import './AcademyLearning.css';
import {COURSE_LEVELS} from '../data/courseLibrary';
import {moduleProgress,attemptResult,questionKey,moduleQuestions} from '../learning';
import {AcademyStart} from './AcademyStart';
import {AcademyReview} from './AcademyReview';
import {CoursePersonalReview} from './CoursePersonalReview';
import {useAcademyKnowledgeStore} from '../../stores/academyKnowledgeStore';
import {AcademyCourse} from './AcademyCourse';
import {CourseSyllabus} from './CourseSyllabus';
import {chapterTeaching} from '../data/courseExplanations';
import {PronunciationWorkshop} from './PronunciationWorkshop';
import {TajwidBridge} from './TajwidBridge';
import {AcademyNotebook} from './AcademyNotebook';
import {masteryDue,masteryLevel} from '../mastery';

const LEVELS: AcademyLevel[] = [LEVEL_1_FONDATIONS, LEVEL_2_PRATIQUE,...COURSE_LEVELS];

// Pending letter timers are cancelled on every page/lesson transition.
let speechTimers:ReturnType<typeof setTimeout>[]=[];
function stopAcademySpeech(){speechTimers.forEach(clearTimeout);speechTimers=[];window.speechSynthesis?.cancel();}
function playAudio(text:string,audioHint?:string){
 stopAcademySpeech();if(!window.speechSynthesis)return;
 const clean=(audioHint||text).replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s,،.]/g,'').trim();if(!clean)return;
 const words=clean.split(/\s+/),letters=words.length>1&&words.every(w=>w.length<=2);
 (letters?words:[clean]).forEach((word,index)=>speechTimers.push(setTimeout(()=>{const u=new SpeechSynthesisUtterance(word);u.lang='ar-SA';u.rate=.65;speechSynthesis.speak(u);},index*900)));
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
    const navigate = useNavigate(),location=useLocation();
    const store = useAcademyStore();

    // Navigation state
    const goBack=useSmartBack('/');
    const [levelId,setLevelId]=usePageState<string|null>('level',null);
    const selectedLevel=LEVELS.find(level=>level.id===levelId)||null;
    const setSelectedLevel=(level:AcademyLevel|null)=>setLevelId(level?.id||null);
    const [activeModule, setActiveModule] = useState<AcademyModule | null>(null);
    const [contentIdx, setContentIdx] = useState(0);  // which content block (lesson/quiz)
    const [sectionIdx, setSectionIdx] = useState(0);   // within a lesson, which section
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

    const [showResult, setShowResult] = useState(false);
    const [showTajweed, setShowTajweed] = useState(false);
    // Feature 8: Search
    const [searchQuery, setSearchQuery] = usePageState('searchQuery', '');
    // Feature 7: Tajwid practice mode
    const [tajwidPractice, setTajwidPractice] = useState(false);
    const [tajwidAnswer, setTajwidAnswer] = useState<number | null>(null);
    const [tajwidIdx, setTajwidIdx] = useState(0);
    const [showCertificate, setShowCertificate] = useState(false);
    const [juniorMode, setJuniorMode] = useState(false);

    const [reviewMode,setReviewMode]=useState(false),[workshop,setWorkshop]=useState(false),[lockedNotice,setLockedNotice]=useState('');
    const [notebookMode,setNotebookMode]=useState(false),[notebookInitial,setNotebookInitial]=useState('');
    useEffect(()=>{const stop=()=>stopAcademySpeech();window.addEventListener('quran-stop-playback',stop);return()=>{stop();window.removeEventListener('quran-stop-playback',stop);};},[activeModule?.id,contentIdx,sectionIdx]);
    const currentContent = activeModule?.content[contentIdx] ?? null;

    // Level progress
    const getLevelProgress = useCallback((level: AcademyLevel) => {
        const total = level.modules.length;
        if (total === 0) return 0;
        const done = level.modules.filter(m => store.progress[m.id]?.completed).length;
        return Math.round((done / total) * 100);
    }, [store.progress]);

    const getModuleProgress=(mod:AcademyModule)=>{const p=store.progress[mod.id];return moduleProgress(mod,!!p?.completed,p?.lastContentIdx,p?.quizIdx||p?.lastSectionIdx);};
    const isModuleUnlocked = useCallback((id:string)=>id.startsWith('sabirin-')||store.unlockedModules.includes(id),[store.unlockedModules]);

    // Handlers
    const startModule = useCallback((mod: AcademyModule) => {
        if (!isModuleUnlocked(mod.id)) {setLockedNotice('Pour ouvrir ce cours, termine d’abord son parcours de fondations. Tu peux aussi adapter ton parcours depuis le repérage de niveau.');return;}
        setLockedNotice('');store.setCurrentModule(mod.id);
        setActiveModule(mod);
        if(new URLSearchParams(location.search).get('module')!==mod.id)navigate(`/academy?module=${mod.id}`);
        // Feature 1: Resume from saved position
        const saved = store.progress[mod.id];
        const explicitSection=new URLSearchParams(location.search).get('section');
        const restarting=!mod.sourceDocument&&!!saved?.completed&&saved.lastContentIdx===undefined;
        if(explicitSection!==null&&/^[0-2]$/.test(explicitSection)){
            setContentIdx(0);setSectionIdx(Number(explicitSection));store.savePosition(mod.id,0,Number(explicitSection));
        } else if (saved?.lastContentIdx !== undefined) {
            setContentIdx(saved.lastContentIdx);
            setSectionIdx(saved.lastSectionIdx ?? 0);
        } else {
            setContentIdx(0);
            setSectionIdx(0);
        }
        if(restarting)store.resetAttempt(mod.id);
        const qi=restarting?0:saved?.quizIdx||0,ci=restarting?0:saved?.lastContentIdx||0;
        setQuizIdx(qi);setQuizAnswer(restarting?null:saved?.answers?.[questionKey(mod.id,ci,qi)]??null);
        setShowResult(false);
        setShowTajweed(false);
        setTajwidPractice(false);
        setTajwidAnswer(null);
    }, [isModuleUnlocked, store,location.search,navigate]);

    const finishModule=useCallback(()=>{
      if(!activeModule)return;const result=attemptResult(activeModule,store.progress[activeModule.id]?.answers||{});
      if(activeModule.sourceDocument){const answers=store.progress[activeModule.id]?.answers||{};store.startNotebook(activeModule.id,{understood:store.notes[`${activeModule.id}:reflection:0`],example:store.notes[`${activeModule.id}:reflection:3`],review:[store.notes[`${activeModule.id}:course-question`],...moduleQuestions(activeModule).filter(q=>answers[q.key]!==q.answer).map(q=>q.q)].filter(Boolean).join('\n')});}
      if(result.complete&&result.passed){if(store.progress[activeModule.id]?.completed)store.markReviewed(activeModule.id);else store.completeModule(activeModule.id,result.score);}
      setShowResult(true);
    },[activeModule,store]);
    const openLinkedModule=useEffectEvent(()=>{const id=new URLSearchParams(location.search).get('module');const mod=LEVELS.flatMap(l=>l.modules).find(m=>m.id===id);if(mod&&(mod.id!==activeModule?.id||new URLSearchParams(location.search).has('section')))startModule(mod);else if(!id&&activeModule)setActiveModule(null);});
    useEffect(()=>{openLinkedModule();},[location.key]);

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
    }, [currentContent, sectionIdx, contentIdx, activeModule, store, finishModule]);

    const prevSection = useCallback(() => {
        if (sectionIdx > 0) {
            setSectionIdx(s => s - 1);
            if(activeModule)store.savePosition(activeModule.id,contentIdx,sectionIdx-1);
        }
    }, [sectionIdx,activeModule,contentIdx,store]);

    const handleQuizAnswer = useCallback((answerIdx: number) => {
        if (quizAnswer !== null || !currentContent || currentContent.type !== 'quiz') return;
        const quiz = currentContent as AcademyQuiz;
        const correct = quiz.questions[quizIdx].answer === answerIdx;
        setQuizAnswer(answerIdx);
        if(activeModule){store.recordAnswer(activeModule.id,questionKey(activeModule.id,contentIdx,quizIdx),answerIdx,correct);if(activeModule.sourceDocument&&contentIdx===1)useAcademyKnowledgeStore.getState().answer(activeModule.id,quizIdx,'quiz',answerIdx,correct);}
    }, [quizAnswer, currentContent, quizIdx,activeModule,contentIdx,store]);

    const nextQuizQuestion = useCallback(() => {
        if (!currentContent || currentContent.type !== 'quiz') return;
        const quiz = currentContent as AcademyQuiz;
        if (quizIdx < quiz.questions.length - 1) {
            setQuizIdx(i => i + 1);
            if(activeModule)store.saveQuiz(activeModule.id,contentIdx,quizIdx+1);
            setQuizAnswer(activeModule?store.progress[activeModule.id]?.answers?.[questionKey(activeModule.id,contentIdx,quizIdx+1)]??null:null);
        } else {
            // Quiz done — check if more content or module finished
            if (activeModule && contentIdx < activeModule.content.length - 1) {
                store.savePosition(activeModule.id,contentIdx+1,0);
                setContentIdx(c => c + 1);
                setSectionIdx(0);
                setQuizIdx(0);
                setQuizAnswer(null);
            } else {
                finishModule();
            }
        }
    }, [currentContent, quizIdx, contentIdx, activeModule, finishModule,store]);


    const result=activeModule?attemptResult(activeModule,store.progress[activeModule.id]?.answers||{}):{score:0,complete:false,passed:false};
    const finalScore=result.score,passed=result.complete&&result.passed;

    // Feature 8: Filtered modules for search
    const allModules = useMemo(() => LEVELS.flatMap(l => l.modules), []);
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allModules.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.titleAr.includes(q) ||
            m.content.some(c => c.title.toLowerCase().includes(q)||c.type==='lesson'&&c.sections.some(s=>(s.title+' '+s.body).toLowerCase().includes(q)))
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
        return all;
    }, []);

    // ─── RENDER: Tajwid Practice Mode ────────────────────
    if(new URLSearchParams(location.search).get('review')==='personal')return <CoursePersonalReview onOtherReviews={()=>{setReviewMode(true);navigate('/academy');}} modules={allModules} onBack={()=>navigate(activeModule?`/academy?module=${activeModule.id}`:'/academy')} onRead={(id,index)=>navigate(`/academy?module=${id}&section=${index}`)}/>;
    if(reviewMode)return <AcademyReview modules={allModules} onBack={()=>setReviewMode(false)}/>;
    if(workshop)return <PronunciationWorkshop onBack={()=>setWorkshop(false)}/>;
    if(notebookMode)return <AcademyNotebook modules={allModules} initial={notebookInitial} onBack={()=>{setNotebookMode(false);setNotebookInitial('');}} onOpen={mod=>{setNotebookMode(false);setNotebookInitial('');startModule(mod);}}/>;
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
                        {passed ? 'Chapitre validé !' : 'Des points à reprendre'}
                    </h2>
                    <div className="academy-result__score">{finalScore}%</div>
                    <p className="academy-result__message">
                        {passed
                            ? `Parcours compris · ${finalScore}% de bonnes réponses. Une question différente reviendra plus tard pour le consolider.`
                            : `Score : ${finalScore}%. Reprends les exercices à consolider pour valider chaque étape.`
                        }
                    </p>
                    <div className="academy-result__actions">
                        {passed&&activeModule.sourceDocument&&<button className="academy-result__btn academy-result__btn-secondary" onClick={()=>{setNotebookInitial(activeModule.id);setNotebookMode(true);}}>📓 Écrire ma fiche dans le carnet</button>}
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
                            {passed ? 'Retour aux cours' : 'Réessayer plus tard'}
                        </button>
                        {!passed && (
                            <button
                                className="academy-result__btn academy-result__btn-secondary"
                                onClick={() => {store.resetAttempt(activeModule.id);setContentIdx(0);setSectionIdx(0);setQuizIdx(0);setQuizAnswer(null);setShowResult(false);}}
                            >
                                Reprendre le chapitre
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (activeModule?.sourceDocument && currentContent?.type === 'lesson') {
        const level=COURSE_LEVELS.find(level=>level.id===activeModule.sourceDocument)!;
        const next=level.modules[level.modules.findIndex(course=>course.id===activeModule.id)+1];
        const goToQuiz=()=>{const target=contentIdx===0?1:3;const saved=store.progress[activeModule.id];setContentIdx(target);setSectionIdx(0);setQuizIdx(0);setQuizAnswer(saved?.answers?.[questionKey(activeModule.id,target,0)]??null);store.saveQuiz(activeModule.id,target,0);};
        return <AcademyCourse key={`${activeModule.id}-${contentIdx}`} course={activeModule} application={contentIdx===2} onReview={()=>navigate(`/academy?module=${activeModule.id}&review=personal`)}
          onBack={()=>{setActiveModule(null);setSelectedLevel(level);navigate('/academy',{replace:true});}}
          onPractice={goToQuiz}
          onRead={()=>{setContentIdx(0);setSectionIdx(0);store.savePosition(activeModule.id,0,0);}}
          onNextChapter={next?()=>startModule(next):undefined}/>;
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
                        {!activeModule.sourceDocument&&section.title && <h3 className="academy-lesson__section-title">{section.title}</h3>}
                        {!activeModule.sourceDocument&&section.body && <div className="academy-lesson__body"><GlossaryText text={section.body} /></div>}

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
                                    <Volume2 size={16} /> Écouter · voix de l’appareil
                                </button>
                            </div>
                        )}
                        {['alphabet-arabe','makharij-al-huruf','tajweed-fondamental'].includes(activeModule.id)&&<button onClick={()=>setWorkshop(true)}>🎧 M’exercer avec une récitation enregistrée</button>}
                    </div>
                    {isTajweedModule&&<TajwidBridge moduleId={activeModule.id}/>}

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
                        {<button className="academy-lesson__nav-next" onClick={nextSection}>
                            {sectionIdx === totalSections - 1
                                ? (contentIdx < activeModule.content.length - 1 ? activeModule.content[contentIdx+1].type==='quiz'?'M’exercer →':'Continuer →' : 'Terminer ✓')
                                : 'Suivant →'
                            }
                        </button>}
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

                    {activeModule.sourceDocument&&<details className="academy-course-recall"><summary>Relire les explications sans perdre mes réponses</summary>{activeModule.content[0].type==='lesson'&&activeModule.content[0].sections.map((section,index)=><section key={section.title}><h3>{section.title}</h3><p>{section.body}</p>{chapterTeaching(activeModule.id)?.developments[index].split('\n\n').map((paragraph,n)=><p key={n}>{paragraph}</p>)}</section>)}</details>}
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
                                {isCorrect ? '✅ ' : '❌ '}{q.feedbacks?.[quizAnswer]||q.explanation}
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

    if (selectedLevel?.id.startsWith('sabirin-')) return <CourseSyllabus level={selectedLevel} onBack={()=>setSelectedLevel(null)} onOpen={startModule}/>;

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
                        🎓 Mon attestation de parcours
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
                                role="button"
                                tabIndex={unlocked?0:-1}
                                aria-disabled={!unlocked}
                                aria-label={`${mod.title}${mod.sourceDocument?` · ${masteryLevel(store.progress[mod.id],store.mastery[mod.id])}`:''}`}
                                onKeyDown={event=>{if(unlocked&&(event.key==='Enter'||event.key===' ')){event.preventDefault();startModule(mod);}}}
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
                                    {mod.sourceDocument&&<span className="academy-module-card__mastery">{masteryLevel(store.progress[mod.id],store.mastery[mod.id])}</span>}
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
                                {(isReviewDue||mod.sourceDocument&&masteryDue(store.progress[mod.id],store.mastery[mod.id])) && (
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

    // ─── RENDER: Junior Mode ─────────────────────────────
    if (juniorMode) {
        return <AcademyJunior onBack={() => setJuniorMode(false)} />;
    }

    // ─── RENDER: Level Selector (Hub) ────────────────────
    return (
        <div className="academy-hub">
            <header className="academy-header">
                <button className="academy-back-btn" onClick={goBack}>
                    <ChevronLeft size={22} />
                </button>
                <h1>📚 Académie</h1>
            </header>

            {lockedNotice&&<p className="academy-notice" role="status">{lockedNotice}</p>}
            <AcademyStart modules={allModules} onStart={startModule} onReview={()=>navigate('/academy?review=personal')} onWorkshop={()=>setWorkshop(true)} onNotebook={()=>setNotebookMode(true)}/>
            <ArabicEntry/>
            {/* Mode Toggle: Classique / Junior */}
            <div style={{ display: 'flex', gap: 4, margin: '0 16px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 4 }}>
                <button
                    onClick={() => setJuniorMode(false)}
                    style={{
                        flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                        background: !juniorMode ? 'linear-gradient(135deg, #c9a84c, #b8962d)' : 'transparent',
                        color: !juniorMode ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.2s'
                    }}>
                    📚 Classique
                </button>
                <button
                    onClick={() => setJuniorMode(true)}
                    style={{
                        flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                        background: juniorMode ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: juniorMode ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.2s'
                    }}>
                    🧒 Junior
                </button>
            </div>

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
                        <strong>{reviewModules.length} chapitre{reviewModules.length > 1 ? 's' : ''} à réviser</strong>
                        <small>La révision espacée renforce la mémorisation</small>
                    </div>
                    <button onClick={() => { startModule(reviewModules[0]); }}>
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
                            role="button" tabIndex={0} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelectedLevel(level);}}}
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
                                    {pct}% • {level.modules.filter(m => store.progress[m.id]?.completed).length}/{level.modules.length} chapitres
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
