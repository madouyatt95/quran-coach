import { chapterBooks } from '../data/storyChapters';
import { ChapterPreview } from '../components/Journeys/ChapterPreview';
import {BookShelf} from '../components/Books/BookShelf';
import {bookEntryForOrigin,bookHref} from '../lib/bookLibrary';
import { JourneyLinks } from '../components/Journeys/JourneyShelf';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, Lightbulb, Share2, Volume2, Loader2, Square, Sparkles, MapPin, X } from 'lucide-react';
import { stories, STORY_CATEGORIES, type Story } from '../data/storiesData';
import { useOpenReader } from '../hooks/useOpenReader';
import { playTts, stopTts } from '../lib/ttsService';
import { ReligiousReference } from '../components/ReligiousReference';
import './StoriesPage.css';


function StoryDetail({ story, onClose }: { story: Story; onClose: () => void }) {
    const navigate = useNavigate();
    const openReader = useOpenReader('Histoires');
    const [imageError, setImageError] = useState(false);

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
                    lang: 'fr',
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
        onClose();
        openReader({ surah: surahNumber, ayah: startAyah ?? 1, page });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: story.title,
                    text: `${story.titleAr} — ${story.title}\n\n${story.summary}\n\n🕌 Moralités :\n${story.morals.map(m => `• ${m}`).join('\n')}\n\nDécouvrez cette histoire et bien plus sur Quran Coach\nhttps://www.quran-coach.fr/stories?story=${story.id}`
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
                <div className="story-modal__topbar"><div className="story-modal__handle" /><button type="button" className="story-modal__dismiss" onClick={onClose} aria-label="Fermer le récit"><X size={20} /></button></div>

                <JourneyLinks kind="story" id={story.id}/>
                {/* Hero */}
                <div className="story-modal__hero">
                    <span className="story-modal__emoji">{story.icon}</span>
                    <div className="story-modal__title-ar">{story.titleAr}</div>
                    <div className="story-modal__title">{story.title}</div>
                    <span className="story-modal__category-badge">
                        {categoryInfo.icon} {categoryInfo.label}
                    </span>
                </div>

                {/* Location Image */}
                {story.location?.imageUrl && !imageError && (
                    <div className="story-modal__image-container" style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
                        <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                            <img 
                                src={story.location.imageUrl} 
                                alt={story.title}
                                onError={() => setImageError(true)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                )}

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
                    {chapterBooks[`story:${story.id}`]?<ChapterPreview bookKey={`story:${story.id}`}/>:<p className="story-modal__text">{story.summary}</p>}
                    {story.sourceRefs?.length?story.sourceRefs.map(ref=><ReligiousReference key={ref} kind="Verset" source={ref}/>):<ReligiousReference kind="Récit" source="Synthèse pédagogique des passages associés"/>}
                    <p className="story-modal__source-note">Les sourates ci-dessous permettent de retrouver les passages associés. Les détails du résumé et les moralités sont une reformulation pédagogique, à vérifier dans les textes.</p>
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
                                <span className="story-modal__moral-icon"><Sparkles size={18} /></span>
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
                    {story.location && (
                        <button className="story-modal__action-btn" onClick={() => navigate(`/atlas?story=${story.id}`)} style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--color-accent)' }}>
                            <MapPin size={18} />
                            Carte
                        </button>
                    )}
                    <button className="story-modal__action-btn story-modal__action-btn--share" onClick={handleShare}>
                        <Share2 size={18} />
                        Partager
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function StoriesPage(){
 const [params,setParams]=useSearchParams(),navigate=useNavigate();
 const story=stories.find(s=>s.id===params.get('story'))||null,entry=story?bookEntryForOrigin('story',story.id):null;
 const entryHref=entry?bookHref(entry.book.id,entry.chapter):null;
 useEffect(()=>{if(entryHref)navigate(entryHref,{replace:true});},[entryHref,navigate]);
 return <div className="stories-page book-catalogue"><header className="book-catalogue-header"><span className="book-eyebrow">DES RÉCITS QUI NOUS ACCOMPAGNENT</span><h1>Histoires et moralités</h1><p>La patience, la confiance, la justice. Des histoires à lire et à écouter.</p></header><BookShelf kind="story" legacyEntries={stories.map(s=>({id:s.id,title:s.title,subtitle:s.summary,href:`/stories?story=${s.id}`,keywords:`${s.titleAr} ${STORY_CATEGORIES[s.category].label} ${s.morals.join(' ')}`}))}/><AnimatePresence>{story&&!entry&&<StoryDetail story={story} onClose={()=>setParams({}, {replace:true})}/>}</AnimatePresence></div>;
}
