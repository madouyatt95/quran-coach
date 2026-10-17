import DOMPurify from 'dompurify';
import {Link,useLocation} from 'react-router-dom';
import {exactVocabulary,sourceUrl} from '../../lib/fahm/learning';
import {fahmExplanation} from '../../lib/fahm/content';
import {FahmWordExplorer} from './FahmWordExplorer';
import type {TafsirContent} from '../../lib/tafsirApi';
// ─── Fahm Panel — Panneau de compréhension du verset ─────────
// S'ouvre quand l'utilisateur tape sur le 💡 après le ﴾ du verset.
// 4 onglets : Mots clés | Structure | Contexte | Perle

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Hash, MapPin, Sparkles } from 'lucide-react';
import { QURAN_VOCABULARY, type QuranWord } from '../../data/quranVocabulary';
import { EMOTIONAL_VERSES } from '../../data/coachData';
import { VERSE_HADITH_LINKS } from '../../data/coachData';
import { useFahmStore } from '../../stores/fahmStore';
import './FahmPanel.css';
import { PassageActions } from '../Learning/PassageActions';

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
    const location=useLocation();
    const dialog=useRef<HTMLDialogElement>(null);
    useEffect(()=>{const el=dialog.current;el?.showModal();return()=>el?.close();},[]);
    const [activeTab, setActiveTab] = useState<FahmTab>('words');
    const fahmStore = useFahmStore();

    // Record this view
    useEffect(() => {
        fahmStore.recordFahmView(surah, ayah);
    }, [surah, ayah]); // eslint-disable-line react-hooks/exhaustive-deps

    // Find relevant vocabulary for this verse
    const relevantWords = useMemo(() => {
        if (!verseTextAr) return [];
        return exactVocabulary(verseTextAr,QURAN_VOCABULARY);
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


    const tabs = [
        { key: 'words' as const, icon: Hash, label: 'Mots' },
        { key: 'structure' as const, icon: BookOpen, label: 'Mot à mot' },
        { key: 'context' as const, icon: MapPin, label: 'Exégèse' },
        ...(emotion||hadithLink?[{ key: 'pearl' as const, icon: Sparkles, label: 'Réflexion' }]:[]),
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
            <motion.dialog ref={dialog} onCancel={onClose} aria-label="Comprendre le verset"
                className="fahm-panel"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
                <div
                    className="fahm-panel__drag-zone"
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        e.currentTarget.dataset.startY = String(touch.clientY);
                    }}
                    onTouchEnd={(e) => {
                        const startY = Number(e.currentTarget.dataset.startY);
                        if (startY != null) {
                            const endY = e.changedTouches[0].clientY;
                            if (endY - startY > 80) onClose();
                        }
                    }}
                >
                    <div className="fahm-panel__handle" />
                </div>

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

                <div style={{padding:"0 20px"}}><PassageActions surah={surah} ayah={ayah} /><Link to={`/fahm?surah=${surah}&ayah=${ayah}`} state={{readerReturn:{to:location.pathname==='/read'?`/read?surah=${surah}&ayah=${ayah}`:location.pathname+location.search,label:"Retour au passage"}}}>Approfondir avec Fahm →</Link></div>
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

                {/* Tab content — scrollable independently */}
                <div className="fahm-panel__content">
                    {activeTab === 'words' && (
                        <WordsTab words={relevantWords} fahmStore={fahmStore} />
                    )}
                    {activeTab === 'structure' && (
                        <FahmWordExplorer key={`${surah}:${ayah}`} surah={surah} ayah={ayah} text={verseTextAr||''}/>
                    )}
                    {activeTab === 'context' && (
                        <ContextTab key={`${surah}:${ayah}`} surah={surah} ayah={ayah} emotion={emotion} />
                    )}
                    {activeTab === 'pearl' && (
                        <PearlTab emotion={emotion} hadithLink={hadithLink} />
                    )}
                </div>
            </motion.dialog>
        </AnimatePresence>
    );
}

// ─── Sub-components ──────────────────────────────────────────

function WordsTab({ words, fahmStore }: { words: QuranWord[]; fahmStore: { learnedWords: Record<number, { level: number }>; markWordReviewed: (id: number, correct: boolean) => void; resetWord: (id: number) => void } }) {
    if (words.length === 0) {
        return (
            <div className="fahm-empty">
                <Hash size={32} />
                <p>Aucun mot clé identifié dans ce verset.</p>
                <p className="fahm-empty__hint">Ouvrez « Mot à mot » pour explorer les mots de ce verset.</p>
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
                                {word.category}
                            </div>
                        </div>
                        <button
                            className={`fahm-word__learn ${isLearned ? 'fahm-word__learn--done' : ''}`}
                            onClick={() => {
                                if (isLearned) {
                                    fahmStore.resetWord(word.id);
                                } else {
                                    fahmStore.markWordReviewed(word.id, true);
                                }
                            }}
                        >
                            {isLearned ? '✓' : '+'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function ContextTab({ surah, ayah, emotion }: {
    surah: number;
    ayah: number;
    emotion?: typeof EMOTIONAL_VERSES[0];
}) {
    const [content,setContent]=useState<TafsirContent|null>(null),[loading,setLoading]=useState(true);
    useEffect(()=>{let gone=false;void fahmExplanation({surah,ayah}).then(data=>{if(!gone){setContent(data);setLoading(false);}});return()=>{gone=true;};},[surah,ayah]);
    return <div className="fahm-context"><h3>Exégèse du verset {surah}:{ayah}</h3>{loading?<p>Chargement…</p>:content?<div style={{whiteSpace:'pre-line',lineHeight:1.8}} dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(content.text,{ALLOWED_TAGS:['p','br','sup','strong'],ALLOWED_ATTR:[]})}}/>:<p>L’explication n’a pas pu être chargée.</p>}<a href={sourceUrl({surah,ayah})} target="_blank" rel="noreferrer">Al-Mokhtasar · QuranEnc ↗</a>{emotion&&<p>Thème de réflexion : {getCategoryLabel(emotion.category)}</p>}</div>;
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
                <p>Aucune perle (hadith ou réflexion profonde) n'est encore liée à ce verset spécifique.</p>
                <p className="fahm-empty__hint" style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>
                    Nous ajoutons de nouvelles connexions chaque semaine pour approfondir votre compréhension.
                </p>
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
