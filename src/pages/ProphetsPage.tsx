import {usePageState} from '../hooks/usePageState';
import { chapterBooks } from '../data/storyChapters';
import { ChapterPreview } from '../components/Journeys/ChapterPreview';
import {BookShelf} from '../components/Books/BookShelf';
import {bookEntryForOrigin,bookHref} from '../lib/bookLibrary';
import { prophetEpisodes } from '../data/editorialExpansion';
import { JourneyLinks } from '../components/Journeys/JourneyShelf';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GitBranch, ChevronRight, BookOpen, Lightbulb, Sparkles, Zap, MessageCircle, Share2, MapPin, X } from 'lucide-react';
import { prophets } from '../data/prophets';
import type { Prophet } from '../data/prophets';
import {companionPortraitById} from '../data/companionPortraits';
import {CompanionCollection,CompanionPortraitDialog} from '../components/Companions/CompanionCollection';
import { useOpenReader } from '../hooks/useOpenReader';
import { ProphetsGraph } from '../components/Prophets/ProphetsGraph';
import { SanadGraph } from '../components/Companions/SanadGraph';
import { ReligiousReference } from '../components/ReligiousReference';
import './ProphetsPage.css';

type TabMode = 'prophets' | 'companions';

function ProphetDetail({ prophet, onClose }: { prophet: Prophet; onClose: () => void }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const openReader = useOpenReader('Prophètes');
    const [imageError, setImageError] = useState(false);

    const goToSurahPage = (surahNumber: number, startAyah?: number) => {
        onClose();
        openReader({ surah: surahNumber, ayah: startAyah ?? 1 });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Histoire du Prophète ${prophet.nameFr}`,
                    text: `${prophet.nameAr} - ${prophet.nameIslamic}\n\n${prophet.summary}\n\nSachez que vous pouvez trouver cette histoire et bien plus sur l'application Quran Coach 🕌\nhttps://www.quran-coach.fr/prophets?prophet=${prophet.id}`
                });
            } catch (err) {
                console.log("Partage annulé ou échoué", err);
            }
        }
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
                <div className="prophet-modal__topbar"><div className="prophet-modal__handle" /><button type="button" className="prophet-modal__dismiss" onClick={onClose} aria-label="Fermer la fiche"><X size={20} /></button></div>

                <JourneyLinks kind="prophet" id={prophet.id}/>
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

                {/* Location Image */}
                {prophet.location?.imageUrl && !imageError && (
                    <div className="prophet-modal__image-container" style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
                        <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                            <img 
                                src={prophet.location.imageUrl} 
                                alt={prophet.nameFr}
                                onError={() => setImageError(true)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                )}

                {/* Lineage */}
                {prophet.lineage && (
                    <div className="prophet-modal__section">
                        <h3 className="prophet-modal__section-title">
                            <GitBranch size={16} />
                            {t('prophets.lineage', 'Lignée')}
                        </h3>
                        <div className="prophet-modal__lineage">{prophet.lineage}</div>
                    </div>
                )}

                {/* Story */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <BookOpen size={16} />
                        {t('prophets.details', 'Son histoire')}
                    </h3>

                    {chapterBooks[`prophet:${prophet.id}`]?<ChapterPreview bookKey={`prophet:${prophet.id}`}/>:<><p className="prophet-modal__text">{prophet.summary}</p><ReligiousReference kind="Récit" source="Synthèse pédagogique des passages associés"/></>}
                </div>

                {!chapterBooks[`prophet:${prophet.id}`]&&!!prophetEpisodes[prophet.id]?.length&&<section className="journey-extra"><h3>Pour aller plus loin</h3>{prophetEpisodes[prophet.id].map(e=><details key={e.id}><summary>{e.title}</summary><p>{e.text}</p><ReligiousReference kind="Verset" source={e.reference}/></details>)}</section>}
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
                                    <ReligiousReference kind="Verset" source={v.reference}/>
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
                            {t('prophets.miracles', 'Miracles')}
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
                                    <ReligiousReference kind="Invocation" source={d.reference}/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Surahs */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <BookOpen size={16} />
                        {t('prophets.associatedSurahs', 'Sourates associées')}
                    </h3>
                    <div className="prophet-modal__surahs">
                        {prophet.surahs.map((s) => (
                            <button
                                key={s.number}
                                className="prophet-modal__surah-chip"
                                onClick={() => goToSurahPage(s.number, s.startAyah)}
                            >
                                <span className="prophet-modal__surah-number">#{s.number}</span>
                                {s.name}
                                {s.startAyah && <span className="story-modal__ayah-badge">:v{s.startAyah}</span>}
                                <ChevronRight size={14} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lessons */}
                <div className="prophet-modal__section">
                    <h3 className="prophet-modal__section-title">
                        <Lightbulb size={16} />
                        {t('prophets.lessons', 'Leçons à retenir')}
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
                <div className="prophet-modal__close" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="prophet-modal__close-btn" onClick={onClose} style={{ flex: 1 }}>
                        {t('common.close', 'Fermer')}
                    </button>
                    {prophet.location && (
                        <button className="prophet-modal__close-btn" onClick={() => { onClose(); navigate(`/atlas?prophet=${prophet.id}`); }} style={{ flex: 1, background: 'rgba(201,168,76,0.1)', color: 'var(--color-accent)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <MapPin size={18} />
                            Carte
                        </button>
                    )}
                    <button className="prophet-modal__close-btn" onClick={handleShare} style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Share2 size={18} />
                        {t('common.share', 'Partager')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function ProphetsPage(){
 const [params,setParams]=useSearchParams(),navigate=useNavigate();
 const location=useLocation(),[graph,setGraph]=usePageState('graph',false);
 const tab:TabMode=location.pathname==='/companions'||params.get('tab')==='companions'||params.has('companion')?'companions':'prophets';
 const companion=companionPortraitById(params.get('companion')||'');
 useEffect(()=>{if(location.pathname==='/prophets'&&(params.get('tab')==='companions'||params.has('companion')))navigate(`/companions${params.has('companion')?`?companion=${encodeURIComponent(params.get('companion')!)}`:''}`,{replace:true});},[location.pathname,params,navigate]);
 const prophet=prophets.find(p=>p.id===params.get('prophet'))||null;
 const entry=prophet?bookEntryForOrigin('prophet',prophet.id):null;
 const entryHref=entry?bookHref(entry.book.id,entry.chapter):null;
 useEffect(()=>{if(entryHref)navigate(entryHref,{replace:true});},[entryHref,navigate]);
 const close=()=>setParams({}, {replace:true});
 const chooseTab=(next:TabMode)=>{setGraph(false);navigate(next==='companions'?'/companions':'/prophets');};
 return <div className="prophets-page book-catalogue"><header className="book-catalogue-header"><span className="book-eyebrow">DES VIES, DES ENSEIGNEMENTS</span><h1>{tab==='prophets'?'Les Prophètes':'Les Compagnons'}</h1><p>Parcourir leur histoire. Écouter, comprendre et garder ce qui nous éclaire.</p></header><nav className="book-themes" aria-label="Prophètes et compagnons"><button aria-pressed={tab==='prophets'} onClick={()=>chooseTab('prophets')}>Prophètes</button><button aria-pressed={tab==='companions'} onClick={()=>chooseTab('companions')}>Compagnons</button><button aria-pressed={graph} onClick={()=>setGraph(v=>!v)}>Explorer les liens</button></nav>
 {tab==='prophets'?(graph?<ProphetsGraph search="" onSelectProphet={p=>setParams({prophet:p.id})}/>:<BookShelf kind="prophet" legacyEntries={prophets.map(p=>({id:p.id,title:p.nameIslamic,subtitle:p.title,href:`/prophets?prophet=${p.id}`,keywords:`${p.nameAr} ${p.nameFr} ${p.nameEn}`}))}/>):<>{graph?<SanadGraph/>:<CompanionCollection/>}</>}
 <AnimatePresence>{prophet&&!entry&&<ProphetDetail prophet={prophet} onClose={close}/>} {companion&&<CompanionPortraitDialog key={companion.id} portrait={companion} onClose={close}/>}</AnimatePresence></div>;
}
