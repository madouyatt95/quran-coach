import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Lightbulb, Sparkles, ChevronRight } from 'lucide-react';
import { prophets } from '../data/prophets';
import type { Prophet } from '../data/prophets';
import { useQuranStore } from '../stores/quranStore';
import './ProphetsPage.css';

function ProphetDetail({ prophet, onClose }: { prophet: Prophet; onClose: () => void }) {
    const navigate = useNavigate();
    const { setCurrentSurah, setCurrentAyah } = useQuranStore();

    const goToSurah = (surahNumber: number) => {
        setCurrentSurah(surahNumber);
        setCurrentAyah(1);
        onClose();
        navigate('/');
    };

    return (
        <motion.div
            className="prophet-modal__overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="prophet-modal"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
                <div className="prophet-modal__handle" />

                {/* Hero */}
                <div className="prophet-modal__hero">
                    <span className="prophet-modal__emoji">{prophet.icon}</span>
                    <div className="prophet-modal__name-ar">{prophet.nameAr}</div>
                    <div className="prophet-modal__name-fr">{prophet.nameFr}</div>
                    <div className="prophet-modal__title-ar">{prophet.titleAr}</div>
                    <div className="prophet-modal__title-fr">{prophet.title}</div>
                    <span className="prophet-modal__period">{prophet.period}</span>
                </div>

                {/* Story */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <BookOpen size={16} />
                        Son histoire
                    </h3>
                    <p className="prophet-modal__text">{prophet.summary}</p>
                </div>

                {/* Surahs */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <Sparkles size={16} />
                        Sourates associées
                    </h3>
                    <div className="prophet-modal__surahs">
                        {prophet.surahs.map((s) => (
                            <button
                                key={s.number}
                                className="prophet-modal__surah-chip"
                                onClick={() => goToSurah(s.number)}
                            >
                                <span className="prophet-modal__surah-number">#{s.number}</span>
                                {s.name}
                                <ChevronRight size={14} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lessons */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <Lightbulb size={16} />
                        Leçons à retenir
                    </h3>
                    <div className="prophet-modal__lessons">
                        {prophet.lessons.map((lesson, i) => (
                            <div key={i} className="prophet-modal__lesson">
                                <span className="prophet-modal__lesson-icon">✦</span>
                                {lesson}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Close */}
                <div className="prophet-modal__close">
                    <button className="prophet-modal__close-btn" onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function ProphetsPage() {
    const [search, setSearch] = useState('');
    const [selectedProphet, setSelectedProphet] = useState<Prophet | null>(null);

    const filteredProphets = useMemo(() => {
        if (!search.trim()) return prophets;
        const q = search.toLowerCase();
        return prophets.filter(
            (p) =>
                p.nameFr.toLowerCase().includes(q) ||
                p.nameEn.toLowerCase().includes(q) ||
                p.nameAr.includes(q) ||
                p.title.toLowerCase().includes(q)
        );
    }, [search]);

    return (
        <div className="prophets-page">
            {/* Hero */}
            <div className="prophets-hero">
                <span className="prophets-hero__icon">📖</span>
                <h1 className="prophets-hero__title">قَصَصُ الأَنْبِيَاء</h1>
                <p className="prophets-hero__subtitle">Histoires des Prophètes dans le Coran</p>
                <span className="prophets-hero__count">{prophets.length} prophètes</span>
            </div>

            {/* Search */}
            <div className="prophets-search">
                <div className="prophets-search__wrapper">
                    <Search size={18} className="prophets-search__icon" />
                    <input
                        className="prophets-search__input"
                        type="text"
                        placeholder="Rechercher un prophète…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="prophets-timeline">
                {filteredProphets.length === 0 ? (
                    <div className="prophets-empty">
                        <div className="prophets-empty__icon">🔍</div>
                        <p className="prophets-empty__text">Aucun prophète trouvé</p>
                    </div>
                ) : (
                    filteredProphets.map((prophet, index) => (
                        <motion.div
                            key={prophet.id}
                            className="prophet-card"
                            onClick={() => setSelectedProphet(prophet)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.3 }}
                        >
                            <div
                                className="prophet-card__dot"
                                style={{ borderColor: prophet.color, color: prophet.color }}
                            />
                            <div className="prophet-card__body">
                                <div className="prophet-card__header">
                                    <span className="prophet-card__emoji">{prophet.icon}</span>
                                    <div className="prophet-card__names">
                                        <div className="prophet-card__name-ar">{prophet.nameAr}</div>
                                        <div className="prophet-card__name-fr">{prophet.nameFr}</div>
                                    </div>
                                    <span className="prophet-card__period">{prophet.period}</span>
                                </div>
                                <div className="prophet-card__title">{prophet.titleAr} — {prophet.title}</div>
                                <p className="prophet-card__summary">{prophet.summary}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedProphet && (
                    <ProphetDetail
                        prophet={selectedProphet}
                        onClose={() => setSelectedProphet(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
