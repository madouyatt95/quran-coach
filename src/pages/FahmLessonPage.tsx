import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronRight, CheckCircle2, Lightbulb, Hash, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { READING_PATHS } from '../data/readingPaths';
import { QURAN_VOCABULARY } from '../data/quranVocabulary';
import { fetchSurah, fetchSurahTranslation, fetchSurahTransliteration } from '../lib/quranApi';
import { useFahmStore } from '../stores/fahmStore';

import './FahmLessonPage.css';

const TOTAL_STEPS = 2; // Step 0: Read, Step 1: Understand

export function FahmLessonPage() {
    const { pathId, day } = useParams<{ pathId: string; day: string }>();
    const navigate = useNavigate();
    const fahm = useFahmStore();

    const [step, setStep] = useState(0);
    const [verses, setVerses] = useState<any[]>([]);
    const [translations, setTranslations] = useState<string[]>([]);
    const [transliterations, setTransliterations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Find Path and Day Data
    const path = useMemo(() => READING_PATHS.find(p => p.id === pathId), [pathId]);
    const dayData = useMemo(() => path?.days.find(d => d.day === Number(day)), [path, day]);

    useEffect(() => {
        if (!dayData) return;

        const loadContent = async () => {
            setIsLoading(true);
            try {
                const passages = dayData.passages || (dayData.surah ? [{ surah: dayData.surah, startAyah: dayData.startAyah!, endAyah: dayData.endAyah! }] : []);
                
                let allVerses: any[] = [];
                let allTrans: string[] = [];
                let allPhonetics: string[] = [];

                for (const p of passages) {
                    const surahData = await fetchSurah(p.surah);
                    const translationData = await fetchSurahTranslation(p.surah, 'fr');
                    const transliterationData = await fetchSurahTransliteration(p.surah);

                    const startIdx = p.startAyah - 1;
                    const endIdx = p.endAyah;

                    const extractedVerses = surahData.ayahs.slice(startIdx, endIdx);
                    allVerses = [...allVerses, ...extractedVerses];
                    allTrans = [...allTrans, ...extractedVerses.map(v => translationData.get(v.number) || '')];
                    allPhonetics = [...allPhonetics, ...extractedVerses.map(v => transliterationData.get(v.number) || '')];
                }

                setVerses(allVerses);
                setTranslations(allTrans);
                setTransliterations(allPhonetics);
            } catch (err) {
                console.error("Erreur lors du chargement des versets", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, [dayData]);

    // Extract Vocabulary Words that appear in the reading passage
    const relevantWords = useMemo(() => {
        if (!verses.length) return [];
        const fullTextAr = verses.map(v => v.text).join(' '); // Simple concat of verses

        return QURAN_VOCABULARY.filter(word => {
            // Strip harakat for a better match, or just use simple indexOf since the DB has harakat
            // We use simple indexOf for now (this represents an approximation)
            return fullTextAr.includes(word.arabic) || fullTextAr.includes(word.arabic.replace(/َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ/g, ''));
        }).slice(0, 5); // Limit to top 5 words per lesson to not overwhelm
    }, [verses]);

    if (!path || !dayData) {
        return (
            <div className="fahm-lesson-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <p>Leçon introuvable.</p>
                <button onClick={() => navigate(-1)} className="fahm-lesson-btn" style={{ width: '200px', marginTop: 20 }}>
                    Retour
                </button>
            </div>
        );
    }

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Finish lesson
            fahm.completePathDay(path.id, dayData.day);
            navigate('/fahm', { replace: true });
        }
    };

    const progressPct = ((step + 1) / TOTAL_STEPS) * 100;

    return (
        <div className="fahm-lesson-page">
            {/* Header */}
            <header className="fahm-lesson-header">
                <div className="fahm-lesson-header__top">
                    <button className="fahm-lesson-header__close" onClick={() => navigate(-1)}>
                        <X size={24} />
                    </button>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Jour {dayData.day}
                    </span>
                    <div style={{ width: 40 }} /> {/* Spacer */}
                </div>
                <div className="fahm-lesson-header__progress">
                    <div className="fahm-lesson-header__progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
            </header>

            {/* Content Container */}
            <div className="fahm-lesson-content">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Loader2 className="spin" size={32} color="var(--gold)" />
                        </motion.div>
                    ) : step === 0 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="fahm-lesson-verses"
                        >
                            <h2 style={{ marginBottom: 16, color: 'var(--gold)', textAlign: 'center' }}>
                                Lecture du jour
                            </h2>
                            {verses.map((ayah, i) => (
                                <div key={ayah.number} className="fahm-lesson-verse">
                                    <div className="fahm-lesson-verse__ar arabic">
                                        {ayah.text} 
                                        <span className="ayah-number">{ayah.numberInSurah}</span>
                                    </div>
                                    {transliterations[i] && (
                                        <div className="fahm-lesson-verse__transliteration" style={{ color: 'var(--color-primary)', fontStyle: 'italic', marginBottom: '12px', fontSize: '1.05rem', lineHeight: 1.5 }}>
                                            {transliterations[i]}
                                        </div>
                                    )}
                                    <div className="fahm-lesson-verse__fr" style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        {translations[i] || 'Traduction non disponible'}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="fahm-lesson-note">
                                <div className="fahm-lesson-note__title">
                                    <Lightbulb size={20} />
                                    <span>Compréhension</span>
                                </div>
                                <div className="fahm-lesson-note__text">
                                    {dayData.fahmNote}
                                </div>
                            </div>

                            {relevantWords.length > 0 && (
                                <div className="fahm-lesson-vocab">
                                    <div className="fahm-lesson-vocab__title">
                                        <Hash size={18} />
                                        Mots clés du verset
                                    </div>
                                    <div className="fahm-lesson-words">
                                        {relevantWords.map(word => (
                                            <div key={word.id} className="fahm-lesson-word">
                                                <div className="fahm-lesson-word__ar arabic">
                                                    {word.arabic}
                                                </div>
                                                <div className="fahm-lesson-word__fr">
                                                    {word.meaningFr}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="fahm-lesson-footer">
                <button
                    className={`fahm-lesson-btn ${step === TOTAL_STEPS - 1 ? 'fahm-lesson-btn--finish' : ''}`}
                    onClick={handleNext}
                    disabled={isLoading}
                >
                    {step === TOTAL_STEPS - 1 ? (
                        <>
                            <CheckCircle2 size={20} /> Terminer la leçon
                        </>
                    ) : (
                        <>
                            Explications <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
