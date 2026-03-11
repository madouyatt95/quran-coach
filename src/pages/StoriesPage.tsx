import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Lightbulb, ChevronRight, Share2, Volume2, Loader2, Square } from 'lucide-react';
import { stories, STORY_CATEGORIES, type Story, type StoryCategory } from '../data/storiesData';
import { useQuranStore } from '../stores/quranStore';
import { playTts, stopTts } from '../lib/ttsService';
import './StoriesPage.css';

type FilterMode = 'all' | StoryCategory;

function StoryDetail({ story, onClose }: { story: Story; onClose: () => void }) {
    const navigate = useNavigate();
    const { goToSurah, goToAyah } = useQuranStore();

    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    useEffect(() => {
        return () => stopTts();
    }, []);

    const toggleAudio = async () => {
        if (isAudioPlaying || isAudioLoading) {
            stopTts();
            setIsAudioPlaying(false);
            setIsAudioLoading(false);
        } else {
            setIsAudioLoading(true);
            try {
                setIsAudioPlaying(true);
                await playTts(story.summary, {
                    onEnd: () => {
                        setIsAudioPlaying(false);
                        setIsAudioLoading(false);
                    }
                });
            } catch (e) {
                console.error("Audio error", e);
                setIsAudioPlaying(false);
            } finally {
                setIsAudioLoading(false);
            }
        }
    };

    const goToSurahPage = (surahNumber: number, startAyah?: number, page?: number) => {
        if (startAyah) {
            goToAyah(surahNumber, startAyah, page);
        } else {
            goToSurah(surahNumber);
        }
        onClose();
        navigate('/read');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: story.title,
                    text: `${story.titleAr} — ${story.title}\n\n${story.summary}\n\n🕌 Moralités :\n${story.morals.map(m => `• ${m}`).join('\n')}\n\nDécouvrez cette histoire et bien plus sur Quran Coach\nhttps://qurancoach.com`
                });
            } catch (err) {
                console.log("Partage annulé", err);
            }
        }
    };

    const categoryInfo = STORY_CATEGORIES[story.category];

    return (
        <motion.div
            className="story-modal__overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="story-modal"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
                <div className="story-modal__handle" />

                {/* Hero */}
                <div className="story-modal__hero">
                    <span className="story-modal__emoji">{story.icon}</span>
                    <div className="story-modal__title-ar">{story.titleAr}</div>
                    <div className="story-modal__title">{story.title}</div>
                    <span className="story-modal__category-badge">
                        {categoryInfo.icon} {categoryInfo.label}
                    </span>
                </div>

                {/* Story */}
                <div className="story-modal__section">
                    <div className="story-modal__section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="story-modal__section-title" style={{ margin: 0 }}>
                            <BookOpen size={16} />
                            Le récit
                        </h3>
                        <button 
                            className="story-modal__tts-btn"
                            onClick={toggleAudio}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', 
                                padding: '6px 12px', borderRadius: '20px', 
                                border: 'none', background: 'var(--color-bg-tertiary)', 
                                color: 'var(--color-primary)', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 600
                            }}
                        >
                            {isAudioLoading ? <Loader2 size={16} className="spin" /> : (isAudioPlaying ? <Square size={14} fill="currentColor" /> : <Volume2 size={16} />)}
                            {isAudioPlaying ? 'Arrêter' : 'Écouter'}
                        </button>
                    </div>
                    <p className="story-modal__text">{story.summary}</p>
                </div>

                {/* Morals */}
                <div className="story-modal__section">
                    <h3 className="story-modal__section-title">
                        <Lightbulb size={16} />
                        Moralités à retenir
                    </h3>
                    <div className="story-modal__morals">
                        {story.morals.map((moral, i) => (
                            <div key={i} className="story-modal__moral">
                                <span className="story-modal__moral-icon">✦</span>
                                <span className="story-modal__moral-text">{moral}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Surahs */}
                <div className="story-modal__section">
                    <h3 className="story-modal__section-title">
                        <BookOpen size={16} />
                        Sourates associées — Lire dans le Mushaf
                    </h3>
                    <div className="story-modal__surahs">
                        {story.surahs.map((s) => (
                            <button
                                key={s.number}
                                className="story-modal__surah-chip"
                                onClick={() => goToSurahPage(s.number, s.startAyah, s.page)}
                            >
                                <span className="story-modal__surah-number">#{s.number}</span>
                                {s.name}
                                {s.startAyah && <span className="story-modal__ayah-badge">:v{s.startAyah}</span>}
                                <ChevronRight size={14} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="story-modal__actions">
                    <button className="story-modal__action-btn story-modal__action-btn--close" onClick={onClose}>
                        Fermer
                    </button>
                    <button className="story-modal__action-btn story-modal__action-btn--share" onClick={handleShare}>
                        <Share2 size={18} />
                        Partager
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function StoriesPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterMode>('all');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

    const filteredStories = useMemo(() => {
        let result = stories;

        if (filter !== 'all') {
            result = result.filter(s => s.category === filter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                s =>
                    s.title.toLowerCase().includes(q) ||
                    s.titleAr.includes(q) ||
                    s.summary.toLowerCase().includes(q) ||
                    s.morals.some(m => m.toLowerCase().includes(q))
            );
        }

        return result;
    }, [search, filter]);

    // Group by category for display
    const groupedStories = useMemo(() => {
        if (filter !== 'all') {
            return [{ category: filter as StoryCategory, stories: filteredStories }];
        }

        const groups: { category: StoryCategory; stories: Story[] }[] = [];
        const categoryOrder: StoryCategory[] = ['peuples', 'personnages', 'paraboles', 'evenements', 'divers'];

        for (const cat of categoryOrder) {
            const catStories = filteredStories.filter(s => s.category === cat);
            if (catStories.length > 0) {
                groups.push({ category: cat, stories: catStories });
            }
        }

        return groups;
    }, [filteredStories, filter]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: stories.length };
        for (const s of stories) {
            counts[s.category] = (counts[s.category] || 0) + 1;
        }
        return counts;
    }, []);

    return (
        <div className="stories-page">
            {/* Hero */}
            <div className="stories-hero">
                <span className="stories-hero__icon">📖</span>
                <h1 className="stories-hero__title">قِصَصٌ وَعِبَر</h1>
                <p className="stories-hero__subtitle">Histoires et Moralités du Coran</p>
                <span className="stories-hero__count">
                    {stories.length} récits coraniques
                </span>
            </div>

            {/* Search */}
            <div className="stories-search">
                <div className="stories-search__wrapper">
                    <Search size={18} className="stories-search__icon" />
                    <input
                        className="stories-search__input"
                        type="text"
                        placeholder="Rechercher une histoire, un thème…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="stories-filters">
                <button
                    className={`stories-filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    📚 Tout
                    <span className="stories-filter-btn__count">{categoryCounts.all}</span>
                </button>
                {(Object.entries(STORY_CATEGORIES) as [StoryCategory, typeof STORY_CATEGORIES[StoryCategory]][]).map(([key, cat]) => (
                    <button
                        key={key}
                        className={`stories-filter-btn ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {cat.icon} {cat.label}
                        <span className="stories-filter-btn__count">{categoryCounts[key] || 0}</span>
                    </button>
                ))}
            </div>

            {/* Stories List */}
            {filteredStories.length === 0 ? (
                <div className="stories-empty">
                    <div className="stories-empty__icon">🔍</div>
                    <p className="stories-empty__text">Aucune histoire trouvée</p>
                </div>
            ) : (
                groupedStories.map(group => {
                    const catInfo = STORY_CATEGORIES[group.category];
                    return (
                        <div key={group.category}>
                            {/* Category Header */}
                            <div className="stories-category-header">
                                <span className="stories-category-header__icon">{catInfo.icon}</span>
                                <div className="stories-category-header__text">
                                    <h2>{catInfo.label}</h2>
                                    <span>{catInfo.labelAr}</span>
                                </div>
                            </div>

                            {/* Story Cards */}
                            {group.stories.map((story, index) => (
                                <motion.div
                                    key={story.id}
                                    className="story-card"
                                    style={{ '--card-accent': story.color } as React.CSSProperties}
                                    onClick={() => setSelectedStory(story)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03, duration: 0.3 }}
                                >
                                    <div className="story-card__header">
                                        <div className="story-card__icon">{story.icon}</div>
                                        <div className="story-card__titles">
                                            <h3 className="story-card__title">{story.title}</h3>
                                            <div className="story-card__title-ar">{story.titleAr}</div>
                                        </div>
                                    </div>
                                    <p className="story-card__summary">{story.summary}</p>
                                    <div className="story-card__footer">
                                        <span className="story-card__surah-count">
                                            📖 {story.surahs.length} sourate{story.surahs.length > 1 ? 's' : ''}
                                        </span>
                                        <span className="story-card__moral-count">
                                            💡 {story.morals.length} leçon{story.morals.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    );
                })
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <StoryDetail
                        story={selectedStory}
                        onClose={() => setSelectedStory(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
