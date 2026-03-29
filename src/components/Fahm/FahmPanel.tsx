// ─── Fahm Panel — Panneau de compréhension du verset ─────────
// S'ouvre quand l'utilisateur tape sur le 💡 après le ﴾ du verset.
// 4 onglets : Mots clés | Structure | Contexte | Perle

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, BookOpen, Hash, MapPin, Sparkles } from 'lucide-react';
import { QURAN_VOCABULARY, type QuranWord } from '../../data/quranVocabulary';
import { EMOTIONAL_VERSES } from '../../data/coachData';
import { VERSE_HADITH_LINKS } from '../../data/coachData';
import { useFahmStore } from '../../stores/fahmStore';
import './FahmPanel.css';

interface FahmPanelProps {
    surah: number;
    ayah: number;
    surahName?: string;
    verseTextAr?: string;
    verseTextFr?: string;
    onClose: () => void;
}

type FahmTab = 'words' | 'structure' | 'context' | 'pearl';

export function FahmPanel({
    surah, ayah, surahName, verseTextAr, verseTextFr, onClose
}: FahmPanelProps) {
    const [activeTab, setActiveTab] = useState<FahmTab>('words');
    const fahmStore = useFahmStore();

    // Record this view
    useEffect(() => {
        fahmStore.recordFahmView(surah, ayah);
    }, [surah, ayah]); // eslint-disable-line react-hooks/exhaustive-deps

    // Find relevant vocabulary for this verse
    const relevantWords = useMemo(() => {
        if (!verseTextAr) return [];
        const cleanText = verseTextAr.replace(/[\u064B-\u065F\u0670]/g, '');
        return QURAN_VOCABULARY.filter(word => {
            const cleanWord = word.arabic.replace(/[\u064B-\u065F\u0670]/g, '');
            return cleanText.includes(cleanWord);
        });
    }, [verseTextAr]);

    // Find emotional annotation
    const emotion = useMemo(() =>
        EMOTIONAL_VERSES.find(e => e.surah === surah && e.ayah === ayah),
        [surah, ayah]
    );

    // Find hadith link
    const hadithLink = useMemo(() =>
        VERSE_HADITH_LINKS.find(l => l.surah === surah && l.ayah === ayah),
        [surah, ayah]
    );

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100) onClose();
    };

    const tabs = [
        { key: 'words' as const, icon: Hash, label: 'Mots' },
        { key: 'structure' as const, icon: BookOpen, label: 'Structure' },
        { key: 'context' as const, icon: MapPin, label: 'Contexte' },
        { key: 'pearl' as const, icon: Sparkles, label: 'Perle' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                className="fahm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="fahm-panel"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 300 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
            >
                <div className="fahm-panel__handle" />

                {/* Header */}
                <div className="fahm-panel__header">
                    <div className="fahm-panel__label">
                        <Sparkles size={16} />
                        <span>Comprendre — {surahName || `Sourate ${surah}`} : {ayah}</span>
                    </div>
                    <button className="fahm-panel__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Verse text */}
                {verseTextAr && (
                    <div className="fahm-panel__verse" dir="rtl">
                        {verseTextAr}
                    </div>
                )}
                {verseTextFr && (
                    <div className="fahm-panel__translation">
                        {verseTextFr}
                    </div>
                )}

                {/* Tabs */}
                <div className="fahm-panel__tabs">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                className={`fahm-tab ${activeTab === tab.key ? 'fahm-tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="fahm-panel__content">
                    {activeTab === 'words' && (
                        <WordsTab words={relevantWords} fahmStore={fahmStore} />
                    )}
                    {activeTab === 'structure' && (
                        <StructureTab verseAr={verseTextAr} verseFr={verseTextFr} />
                    )}
                    {activeTab === 'context' && (
                        <ContextTab surah={surah} ayah={ayah} emotion={emotion} />
                    )}
                    {activeTab === 'pearl' && (
                        <PearlTab emotion={emotion} hadithLink={hadithLink} />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Sub-components ──────────────────────────────────────────

function WordsTab({ words, fahmStore }: { words: QuranWord[]; fahmStore: { learnedWords: Record<number, { level: number }>; markWordReviewed: (id: number, correct: boolean) => void } }) {
    if (words.length === 0) {
        return (
            <div className="fahm-empty">
                <Hash size={32} />
                <p>Aucun mot clé identifié dans ce verset.</p>
                <p className="fahm-empty__hint">Le vocabulaire sera enrichi progressivement.</p>
            </div>
        );
    }

    return (
        <div className="fahm-words">
            {words.map(word => {
                const progress = fahmStore.learnedWords[word.id];
                const isLearned = progress && progress.level >= 1;
                return (
                    <div key={word.id} className={`fahm-word ${isLearned ? 'fahm-word--learned' : ''}`}>
                        <div className="fahm-word__arabic">{word.arabic}</div>
                        <div className="fahm-word__details">
                            <div className="fahm-word__meaning">{word.meaningFr}</div>
                            <div className="fahm-word__root">
                                Racine : {word.root} · {word.transliteration}
                            </div>
                            <div className="fahm-word__freq">
                                {word.frequency}x dans le Coran · {word.category}
                            </div>
                        </div>
                        <button
                            className={`fahm-word__learn ${isLearned ? 'fahm-word__learn--done' : ''}`}
                            onClick={() => fahmStore.markWordReviewed(word.id, true)}
                        >
                            {isLearned ? '✓' : '+'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function StructureTab({ verseAr, verseFr }: { verseAr?: string; verseFr?: string }) {
    if (!verseAr) {
        return (
            <div className="fahm-empty">
                <BookOpen size={32} />
                <p>Structure non disponible pour ce verset.</p>
            </div>
        );
    }

    // Simple word-by-word display
    const arWords = verseAr.split(/\s+/).filter(w => w.length > 0);

    return (
        <div className="fahm-structure">
            <p className="fahm-structure__intro">
                Décomposition mot par mot :
            </p>
            <div className="fahm-structure__words" dir="rtl">
                {arWords.map((word, i) => {
                    // Check if this word is in our vocabulary
                    const cleanWord = word.replace(/[\u064B-\u065F\u0670]/g, '');
                    const vocabMatch = QURAN_VOCABULARY.find(v =>
                        v.arabic.replace(/[\u064B-\u065F\u0670]/g, '') === cleanWord
                    );
                    return (
                        <span
                            key={i}
                            className={`struct-word ${vocabMatch ? 'struct-word--known' : ''}`}
                            title={vocabMatch ? `${vocabMatch.meaningFr} (${vocabMatch.transliteration})` : undefined}
                        >
                            {word}
                        </span>
                    );
                })}
            </div>
            {verseFr && (
                <div className="fahm-structure__translation">
                    <strong>Traduction :</strong> {verseFr}
                </div>
            )}
            <p className="fahm-structure__tip">
                💡 Les mots surlignés en <span style={{color: '#4ecdc4'}}>bleu-vert</span> font partie des 300 mots les plus fréquents du Coran.
            </p>
        </div>
    );
}

function ContextTab({ surah, ayah, emotion }: {
    surah: number;
    ayah: number;
    emotion?: typeof EMOTIONAL_VERSES[0];
}) {
    return (
        <div className="fahm-context">
            <div className="fahm-context__ref">
                📍 Sourate {surah}, Verset {ayah}
            </div>

            {emotion ? (
                <>
                    <div className="fahm-context__category">
                        Thème : <strong>{getCategoryLabel(emotion.category)}</strong>
                    </div>
                    <div className="fahm-context__reflection">
                        {emotion.reflection}
                    </div>
                </>
            ) : (
                <div className="fahm-context__empty">
                    <MapPin size={24} />
                    <p>Le contexte de révélation (Asbab an-Nuzul) sera ajouté prochainement pour ce verset.</p>
                </div>
            )}
        </div>
    );
}

function PearlTab({ emotion, hadithLink }: {
    emotion?: typeof EMOTIONAL_VERSES[0];
    hadithLink?: typeof VERSE_HADITH_LINKS[0];
}) {
    const hasSomething = emotion || hadithLink;

    if (!hasSomething) {
        return (
            <div className="fahm-empty">
                <Sparkles size={32} />
                <p>La perle de sagesse de ce verset sera ajoutée prochainement.</p>
            </div>
        );
    }

    return (
        <div className="fahm-pearl">
            {emotion && (
                <div className="fahm-pearl__reflection">
                    <h4>💎 Réflexion</h4>
                    <p>{emotion.reflection}</p>
                </div>
            )}

            {hadithLink && (
                <div className="fahm-pearl__hadith">
                    <h4>🔗 Hadith lié</h4>
                    <div className="fahm-pearl__hadith-ar" dir="rtl">
                        «&nbsp;{hadithLink.hadithAr}&nbsp;»
                    </div>
                    <div className="fahm-pearl__hadith-fr">
                        «&nbsp;{hadithLink.hadithFr}&nbsp;»
                    </div>
                    <div className="fahm-pearl__source">
                        — {hadithLink.source}
                    </div>
                    <p className="fahm-pearl__connection">
                        {hadithLink.connection}
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────

function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        mercy: 'Miséricorde (رحمة)',
        patience: 'Patience (صبر)',
        gratitude: 'Gratitude (شكر)',
        repentance: 'Repentir (توبة)',
        paradise: 'Paradis (جنة)',
        warning: 'Avertissement (تحذير)',
        trust: 'Confiance en Allah (توكل)',
        death: 'Mort et Au-delà (موت)',
        justice: 'Justice (عدل)',
        provision: 'Subsistance (رزق)',
        family: 'Famille (أسرة)',
        knowledge: 'Science (علم)',
        unity: 'Unité (وحدة)',
        supplication: 'Invocation (دعاء)',
        creation: 'Création (خلق)',
    };
    return labels[category] || category;
}
