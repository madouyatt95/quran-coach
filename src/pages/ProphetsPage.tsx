import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Lightbulb, Sparkles, ChevronRight, Zap, GitBranch, MessageCircle, Clock, Quote } from 'lucide-react';
import { prophets } from '../data/prophets';
import type { Prophet } from '../data/prophets';
import { companions } from '../data/companions';
import type { Companion } from '../data/companions';
import { useQuranStore } from '../stores/quranStore';
import './ProphetsPage.css';

type TabMode = 'prophets' | 'companions';

function ProphetDetail({ prophet, onClose }: { prophet: Prophet; onClose: () => void }) {
    const navigate = useNavigate();
    const { goToSurah } = useQuranStore();

    const goToSurahPage = (surahNumber: number) => {
        goToSurah(surahNumber);
        onClose();
        navigate('/read');
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
                    <div className="prophet-modal__name-fr">{prophet.nameIslamic}</div>
                    <div className="prophet-modal__title-ar">{prophet.titleAr}</div>
                    <div className="prophet-modal__title-fr">{prophet.title}</div>
                    <div className="prophet-modal__badges">
                        <span className="prophet-modal__period">{prophet.period}</span>
                        <span className="prophet-modal__mention-badge">
                            📖 Cité {prophet.mentionCount}× dans le Coran
                        </span>
                    </div>
                </div>

                {/* Lineage */}
                {prophet.lineage && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <GitBranch size={16} />
                            Lignée
                        </h3>
                        <div className="prophet-modal__lineage">{prophet.lineage}</div>
                    </div>
                )}

                {/* Story */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <BookOpen size={16} />
                        Son histoire
                    </h3>
                    <p className="prophet-modal__text">{prophet.summary}</p>
                </div>

                {/* Key Verses */}
                {prophet.keyVerses.length > 0 && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <Sparkles size={16} />
                            Versets clés
                        </h3>
                        <div className="prophet-modal__verses">
                            {prophet.keyVerses.map((v, i) => (
                                <div key={i} className="prophet-modal__verse">
                                    <div className="prophet-modal__verse-arabic">{v.arabic}</div>
                                    <div className="prophet-modal__verse-translation">{v.translation}</div>
                                    <div className="prophet-modal__verse-ref">{v.reference}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Miracles */}
                {prophet.miracles && prophet.miracles.length > 0 && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <Zap size={16} />
                            Miracles
                        </h3>
                        <div className="prophet-modal__miracles">
                            {prophet.miracles.map((m, i) => (
                                <div key={i} className="prophet-modal__miracle">
                                    <span className="prophet-modal__miracle-icon">✦</span>
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Du'as */}
                {prophet.duas && prophet.duas.length > 0 && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <MessageCircle size={16} />
                            Du'as (Invocations)
                        </h3>
                        <div className="prophet-modal__duas">
                            {prophet.duas.map((d, i) => (
                                <div key={i} className="prophet-modal__dua">
                                    <div className="prophet-modal__dua-arabic">{d.arabic}</div>
                                    <div className="prophet-modal__dua-translation">{d.translation}</div>
                                    <div className="prophet-modal__dua-ref">{d.reference}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Surahs */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <BookOpen size={16} />
                        Sourates associées
                    </h3>
                    <div className="prophet-modal__surahs">
                        {prophet.surahs.map((s) => (
                            <button
                                key={s.number}
                                className="prophet-modal__surah-chip"
                                onClick={() => goToSurahPage(s.number)}
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

function CompanionDetail({ companion, onClose }: { companion: Companion; onClose: () => void }) {
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
                    <span className="prophet-modal__emoji">{companion.icon}</span>
                    <div className="prophet-modal__name-ar">{companion.nameAr}</div>
                    <div className="prophet-modal__name-fr">{companion.nameFr}</div>
                    <div className="prophet-modal__title-ar">{companion.titleAr}</div>
                    <div className="prophet-modal__title-fr">{companion.title}</div>
                    <div className="prophet-modal__badges">
                        {companion.category === 'ashara' && (
                            <span className="companion-badge companion-badge--ashara">
                                ⭐ Promis au Paradis
                            </span>
                        )}
                        {companion.category === 'sahabiyyah' && (
                            <span className="companion-badge companion-badge--sahabiyyah">
                                🌹 Compagnonne
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <BookOpen size={16} />
                        Son histoire
                    </h3>
                    <p className="prophet-modal__text">{companion.summary}</p>
                </div>

                {/* Timeline */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <Clock size={16} />
                        Chronologie
                    </h3>
                    <div className="companion-timeline">
                        <div className="companion-timeline__item">
                            <span className="companion-timeline__dot companion-timeline__dot--birth" />
                            <div>
                                <div className="companion-timeline__label">Naissance</div>
                                <div className="companion-timeline__value">{companion.timeline.birth}</div>
                            </div>
                        </div>
                        <div className="companion-timeline__item">
                            <span className="companion-timeline__dot companion-timeline__dot--conversion" />
                            <div>
                                <div className="companion-timeline__label">Conversion</div>
                                <div className="companion-timeline__value">{companion.timeline.conversion}</div>
                            </div>
                        </div>
                        {companion.timeline.keyEvents.map((event, i) => (
                            <div key={i} className="companion-timeline__item">
                                <span className="companion-timeline__dot companion-timeline__dot--event" />
                                <div>
                                    <div className="companion-timeline__value">{event}</div>
                                </div>
                            </div>
                        ))}
                        <div className="companion-timeline__item">
                            <span className="companion-timeline__dot companion-timeline__dot--death" />
                            <div>
                                <div className="companion-timeline__label">Décès</div>
                                <div className="companion-timeline__value">{companion.timeline.death}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Verses */}
                {companion.keyVerses && companion.keyVerses.length > 0 && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <Sparkles size={16} />
                            Versets clés
                        </h3>
                        <div className="prophet-modal__verses">
                            {companion.keyVerses.map((v, i) => (
                                <div key={i} className="prophet-modal__verse">
                                    <div className="prophet-modal__verse-arabic">{v.arabic}</div>
                                    <div className="prophet-modal__verse-translation">{v.translation}</div>
                                    <div className="prophet-modal__verse-ref">{v.reference}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hadiths */}
                {companion.hadiths.length > 0 && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <Quote size={16} />
                            Hadiths
                        </h3>
                        <div className="prophet-modal__duas">
                            {companion.hadiths.map((h, i) => (
                                <div key={i} className="prophet-modal__dua">
                                    <div className="prophet-modal__dua-arabic">{h.arabic}</div>
                                    <div className="prophet-modal__dua-translation">{h.translation}</div>
                                    <div className="prophet-modal__dua-ref">{h.source}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lessons */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <Lightbulb size={16} />
                        Traits & Leçons
                    </h3>
                    <div className="prophet-modal__lessons">
                        {companion.lessons.map((lesson, i) => (
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
    const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
    const [tab, setTab] = useState<TabMode>('prophets');

    const filteredProphets = useMemo(() => {
        if (!search.trim()) return prophets;
        const q = search.toLowerCase();
        return prophets.filter(
            (p) =>
                p.nameFr.toLowerCase().includes(q) ||
                p.nameEn.toLowerCase().includes(q) ||
                p.nameIslamic.toLowerCase().includes(q) ||
                p.nameAr.includes(q) ||
                p.title.toLowerCase().includes(q)
        );
    }, [search]);

    const filteredCompanions = useMemo(() => {
        if (!search.trim()) return companions;
        const q = search.toLowerCase();
        return companions.filter(
            (c) =>
                c.nameFr.toLowerCase().includes(q) ||
                c.nameEn.toLowerCase().includes(q) ||
                c.nameAr.includes(q) ||
                c.title.toLowerCase().includes(q)
        );
    }, [search]);

    const asharaCount = companions.filter(c => c.category === 'ashara').length;
    const otherCount = companions.filter(c => c.category !== 'ashara').length;

    return (
        <div className="prophets-page">
            {/* Hero */}
            <div className="prophets-hero">
                <span className="prophets-hero__icon">{tab === 'prophets' ? '📖' : '⭐'}</span>
                <h1 className="prophets-hero__title">
                    {tab === 'prophets' ? 'قَصَصُ الأَنْبِيَاء' : 'الصَّحَابَة'}
                </h1>
                <p className="prophets-hero__subtitle">
                    {tab === 'prophets'
                        ? 'Histoires des Prophètes dans le Coran'
                        : `${asharaCount} promis au Paradis · ${otherCount} autres compagnons`
                    }
                </p>
                <span className="prophets-hero__count">
                    {tab === 'prophets' ? `${prophets.length} prophètes` : `${companions.length} compagnons`}
                </span>
                {tab === 'prophets' && (
                    <span className="prophets-hero__source">Source : Coran & Tafsir Ibn Kathir — قصص الأنبياء</span>
                )}
            </div>

            {/* Tabs */}
            <div className="prophets-tabs">
                <button
                    className={`prophets-tabs__btn ${tab === 'prophets' ? 'prophets-tabs__btn--active' : ''}`}
                    onClick={() => { setTab('prophets'); setSearch(''); }}
                >
                    <span>📜</span> Prophètes
                </button>
                <button
                    className={`prophets-tabs__btn ${tab === 'companions' ? 'prophets-tabs__btn--active' : ''}`}
                    onClick={() => { setTab('companions'); setSearch(''); }}
                >
                    <span>⭐</span> Compagnons
                </button>
            </div>

            {/* Search */}
            <div className="prophets-search">
                <div className="prophets-search__wrapper">
                    <Search size={18} className="prophets-search__icon" />
                    <input
                        className="prophets-search__input"
                        type="text"
                        placeholder={tab === 'prophets' ? 'Rechercher un prophète…' : 'Rechercher un compagnon…'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="prophets-timeline">
                {tab === 'prophets' ? (
                    filteredProphets.length === 0 ? (
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
                                            <div className="prophet-card__name-islamic">{prophet.nameIslamic}</div>
                                            <div className="prophet-card__name-ar">{prophet.nameAr}</div>
                                        </div>
                                        <div className="prophet-card__meta">
                                            <span className="prophet-card__mentions">📖 {prophet.mentionCount}×</span>
                                            <span className="prophet-card__period">{prophet.period}</span>
                                        </div>
                                    </div>
                                    <div className="prophet-card__title">{prophet.titleAr} — {prophet.title}</div>
                                    <p className="prophet-card__summary">{prophet.summary}</p>
                                </div>
                            </motion.div>
                        ))
                    )
                ) : (
                    filteredCompanions.length === 0 ? (
                        <div className="prophets-empty">
                            <div className="prophets-empty__icon">🔍</div>
                            <p className="prophets-empty__text">Aucun compagnon trouvé</p>
                        </div>
                    ) : (
                        filteredCompanions.map((companion, index) => (
                            <motion.div
                                key={companion.id}
                                className="prophet-card"
                                onClick={() => setSelectedCompanion(companion)}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03, duration: 0.3 }}
                            >
                                <div
                                    className="prophet-card__dot"
                                    style={{ borderColor: companion.color, color: companion.color }}
                                />
                                <div className="prophet-card__body">
                                    <div className="prophet-card__header">
                                        <span className="prophet-card__emoji">{companion.icon}</span>
                                        <div className="prophet-card__names">
                                            <div className="prophet-card__name-islamic">{companion.nameFr}</div>
                                            <div className="prophet-card__name-ar">{companion.nameAr}</div>
                                        </div>
                                        <div className="prophet-card__meta">
                                            {companion.category === 'ashara' && (
                                                <span className="prophet-card__mentions">⭐ Paradis</span>
                                            )}
                                            {companion.category === 'sahabiyyah' && (
                                                <span className="prophet-card__mentions">🌹</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="prophet-card__title">{companion.titleAr} — {companion.title}</div>
                                    <p className="prophet-card__summary">{companion.summary}</p>
                                </div>
                            </motion.div>
                        ))
                    )
                )}
            </div>

            {/* Detail Modals */}
            <AnimatePresence>
                {selectedProphet && (
                    <ProphetDetail
                        prophet={selectedProphet}
                        onClose={() => setSelectedProphet(null)}
                    />
                )}
                {selectedCompanion && (
                    <CompanionDetail
                        companion={selectedCompanion}
                        onClose={() => setSelectedCompanion(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
