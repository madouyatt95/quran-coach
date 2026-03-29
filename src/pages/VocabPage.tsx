// ─── Vocab Page — Flashcards SRS pour le vocabulaire coranique ─

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Check, X, Hash, Filter, ChevronDown } from 'lucide-react';
import { QURAN_VOCABULARY } from '../data/quranVocabulary';
import { useFahmStore } from '../stores/fahmStore';
import './VocabPage.css';

type ViewMode = 'browse' | 'review' | 'learn';
type FilterCategory = 'all' | 'noun' | 'verb' | 'particle' | 'name' | 'adjective';

export function VocabPage() {
    const navigate = useNavigate();
    const fahm = useFahmStore();
    const [mode, setMode] = useState<ViewMode>('browse');
    const [filterCat, setFilterCat] = useState<FilterCategory>('all');
    const [showFilter, setShowFilter] = useState(false);

    // Flashcard state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [reviewQueue, setReviewQueue] = useState<number[]>([]);

    const wordsForReview = useMemo(() => fahm.getWordsForReview(), [fahm.learnedWords]);

    const filteredWords = useMemo(() => {
        if (filterCat === 'all') return QURAN_VOCABULARY;
        return QURAN_VOCABULARY.filter(w => w.category === filterCat);
    }, [filterCat]);

    const newWords = useMemo(() =>
        QURAN_VOCABULARY.filter(w => !fahm.learnedWords[w.id] || fahm.learnedWords[w.id].level === 0),
        [fahm.learnedWords]
    );

    const startReview = useCallback(() => {
        const ids = wordsForReview.length > 0 ? wordsForReview : newWords.slice(0, 10).map(w => w.id);
        setReviewQueue(ids);
        setCurrentIndex(0);
        setFlipped(false);
        setMode('review');
    }, [wordsForReview, newWords]);

    const startLearn = useCallback(() => {
        const ids = newWords.slice(0, 10).map(w => w.id);
        setReviewQueue(ids);
        setCurrentIndex(0);
        setFlipped(false);
        setMode('learn');
    }, [newWords]);

    const handleAnswer = (correct: boolean) => {
        const wordId = reviewQueue[currentIndex];
        fahm.markWordReviewed(wordId, correct);

        if (currentIndex < reviewQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFlipped(false);
        } else {
            setMode('browse');
        }
    };

    const currentWord = useMemo(() => {
        if (mode === 'browse') return null;
        const id = reviewQueue[currentIndex];
        return QURAN_VOCABULARY.find(w => w.id === id) || null;
    }, [mode, reviewQueue, currentIndex]);

    const getLevelLabel = (level: number) => {
        const labels = ['Nouveau', 'Appris', 'Révisé', 'Consolidé', 'Maîtrisé', 'Expert'];
        return labels[Math.min(level, 5)];
    };

    const getLevelColor = (level: number) => {
        const colors = ['#666', '#4ecdc4', '#58A6FF', '#c9a84c', '#FF9800', '#4CAF50'];
        return colors[Math.min(level, 5)];
    };

    // ─── Flashcard View ──────────────────────────────────
    if (mode !== 'browse' && currentWord) {
        const progress = fahm.learnedWords[currentWord.id];
        const level = progress?.level || 0;

        return (
            <div className="vocab-page">
                <header className="vocab-page__header">
                    <button className="vocab-page__back" onClick={() => setMode('browse')}>
                        <ArrowLeft size={20} />
                    </button>
                    <span className="vocab-page__counter">
                        {currentIndex + 1} / {reviewQueue.length}
                    </span>
                    <div className="vocab-page__progress-dots">
                        {reviewQueue.map((_, i) => (
                            <div key={i} className={`vocab-dot ${i === currentIndex ? 'active' : i < currentIndex ? 'done' : ''}`} />
                        ))}
                    </div>
                </header>

                <div className="vocab-flashcard-container">
                    <div
                        className={`vocab-flashcard ${flipped ? 'vocab-flashcard--flipped' : ''}`}
                        onClick={() => setFlipped(!flipped)}
                    >
                        <div className="vocab-flashcard__front">
                            <div className="vocab-flashcard__level" style={{ color: getLevelColor(level) }}>
                                {getLevelLabel(level)}
                            </div>
                            <div className="vocab-flashcard__arabic">{currentWord.arabic}</div>
                            <div className="vocab-flashcard__root">{currentWord.root}</div>
                            <div className="vocab-flashcard__hint">Tape pour retourner</div>
                        </div>

                        <div className="vocab-flashcard__back">
                            <div className="vocab-flashcard__meaning">{currentWord.meaningFr}</div>
                            <div className="vocab-flashcard__translit">{currentWord.transliteration}</div>
                            <div className="vocab-flashcard__freq">{currentWord.frequency}× dans le Coran</div>

                            {currentWord.examples[0] && (
                                <div className="vocab-flashcard__example">
                                    <div className="vocab-flashcard__example-ar" dir="rtl">
                                        {currentWord.examples[0].contextAr}
                                    </div>
                                    <div className="vocab-flashcard__example-fr">
                                        {currentWord.examples[0].contextFr}
                                    </div>
                                    <div className="vocab-flashcard__example-ref">
                                        — S{currentWord.examples[0].surah}:V{currentWord.examples[0].ayah}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {flipped && (
                    <div className="vocab-actions">
                        <button className="vocab-action vocab-action--wrong" onClick={() => handleAnswer(false)}>
                            <X size={20} />
                            <span>À revoir</span>
                        </button>
                        <button className="vocab-action vocab-action--correct" onClick={() => handleAnswer(true)}>
                            <Check size={20} />
                            <span>Je sais</span>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ─── Browse View ─────────────────────────────────────
    return (
        <div className="vocab-page">
            <header className="vocab-page__header">
                <button className="vocab-page__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Vocabulaire</h1>
                <button className="vocab-page__filter" onClick={() => setShowFilter(!showFilter)}>
                    <Filter size={18} />
                    <ChevronDown size={14} />
                </button>
            </header>

            {/* Quick action buttons */}
            <div className="vocab-quick-actions">
                {wordsForReview.length > 0 && (
                    <button className="vocab-quick-btn vocab-quick-btn--review" onClick={startReview}>
                        <RotateCcw size={16} />
                        Réviser ({wordsForReview.length})
                    </button>
                )}
                {newWords.length > 0 && (
                    <button className="vocab-quick-btn vocab-quick-btn--learn" onClick={startLearn}>
                        <Hash size={16} />
                        Apprendre ({Math.min(10, newWords.length)} mots)
                    </button>
                )}
            </div>

            {/* Filter dropdown */}
            {showFilter && (
                <div className="vocab-filter-dropdown">
                    {(['all', 'noun', 'verb', 'particle', 'name', 'adjective'] as const).map(cat => (
                        <button
                            key={cat}
                            className={`vocab-filter-item ${filterCat === cat ? 'active' : ''}`}
                            onClick={() => { setFilterCat(cat); setShowFilter(false); }}
                        >
                            {cat === 'all' ? 'Tous' :
                                cat === 'noun' ? 'Noms' :
                                    cat === 'verb' ? 'Verbes' :
                                        cat === 'particle' ? 'Particules' :
                                            cat === 'name' ? 'Noms divins' :
                                                'Adjectifs'}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats strip */}
            <div className="vocab-stats-strip">
                <span>{fahm.totalWordsLearned} appris</span>
                <span>•</span>
                <span>{wordsForReview.length} à réviser</span>
                <span>•</span>
                <span>{filteredWords.length} mots</span>
            </div>

            {/* Word list */}
            <div className="vocab-list">
                {filteredWords.map(word => {
                    const progress = fahm.learnedWords[word.id];
                    const level = progress?.level || 0;

                    return (
                        <div
                            key={word.id}
                            className="vocab-word-row"
                            onClick={() => {
                                setReviewQueue([word.id]);
                                setCurrentIndex(0);
                                setFlipped(false);
                                setMode('review');
                            }}
                        >
                            <div className="vocab-word-row__arabic">{word.arabic}</div>
                            <div className="vocab-word-row__info">
                                <span className="vocab-word-row__meaning">{word.meaningFr}</span>
                                <span className="vocab-word-row__meta">
                                    {word.transliteration} · {word.frequency}×
                                </span>
                            </div>
                            <div
                                className="vocab-word-row__level"
                                style={{ background: `${getLevelColor(level)}20`, color: getLevelColor(level) }}
                            >
                                {getLevelLabel(level)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
