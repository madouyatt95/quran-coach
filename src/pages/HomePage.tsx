import { useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Clock, Bookmark, BookHeart, Share2, BookOpen, Star } from 'lucide-react';
import { getHadithOfDay, getHijriDate, formatHijriDate, formatHijriDateAr, getGreeting, getSeasonalTags } from '../lib/hadithEngine';
import { useStatsStore } from '../stores/statsStore';
import { useQuranStore } from '../stores/quranStore';
import './HomePage.css';

const HIJRI_MONTH_EVENTS: Record<number, { emoji: string; title: string; description: string }> = {
    1: { emoji: '🌙', title: 'Mois de Muharram', description: 'Premier mois sacré du calendrier hégirien' },
    7: { emoji: '✨', title: 'Mois de Rajab', description: 'Mois sacré — préparation spirituelle' },
    8: { emoji: '🌿', title: "Mois de Sha'ban", description: 'Préparation au mois de Ramadan' },
    9: { emoji: '🕌', title: 'Ramadan Mubarak', description: 'Mois béni du jeûne et de la prière' },
    10: { emoji: '🎉', title: 'Mois de Shawwal', description: "Aïd al-Fitr — fête de la rupture du jeûne" },
    12: { emoji: '🕋', title: 'Dhul Hijjah', description: 'Mois du pèlerinage — les 10 meilleurs jours' },
};

const SHORTCUTS = [
    { path: '/qibla', icon: Compass, label: 'Qibla', color: '#c9a84c', bg: 'rgba(201,168,76,0.15)' },
    { path: '/prayers', icon: Clock, label: 'Prières', color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
    { path: '/themes', icon: Bookmark, label: 'Thèmes', color: '#58A6FF', bg: 'rgba(88,166,255,0.15)' },
    { path: '/adhkar', icon: BookHeart, label: 'Invocations', color: '#e74c3c', bg: 'rgba(231,76,60,0.15)' },
];

interface EssentialSurah {
    surahNumber: number;
    nameAr: string;
    nameFr: string;
    emoji: string;
    verseCount: number;
    benefit: string;
    gradient: string;
}

const ESSENTIAL_SURAHS: EssentialSurah[] = [
    {
        surahNumber: 36, nameAr: 'يس', nameFr: 'Ya-Sin',
        emoji: '💎', verseCount: 83, benefit: 'Cœur du Coran',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        surahNumber: 67, nameAr: 'المُلك', nameFr: 'Al-Mulk',
        emoji: '👑', verseCount: 30, benefit: 'Protection dans la tombe',
        gradient: 'linear-gradient(135deg, #c9a84c 0%, #8B6914 100%)'
    },
    {
        surahNumber: 18, nameAr: 'الكهف', nameFr: 'Al-Kahf',
        emoji: '🏔️', verseCount: 110, benefit: 'Lumière du vendredi',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    {
        surahNumber: 55, nameAr: 'الرحمن', nameFr: 'Ar-Rahman',
        emoji: '🌸', verseCount: 78, benefit: 'Les bienfaits d\'Allah',
        gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)'
    },
    {
        surahNumber: 56, nameAr: 'الواقعة', nameFr: 'Al-Waqi\'a',
        emoji: '⚡', verseCount: 96, benefit: 'Protection contre la pauvreté',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        surahNumber: 112, nameAr: 'الإخلاص', nameFr: 'Al-Ikhlas',
        emoji: '✨', verseCount: 4, benefit: 'Vaut le tiers du Coran',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        surahNumber: 2, nameAr: 'البقرة', nameFr: 'Al-Baqara',
        emoji: '🛡️', verseCount: 286, benefit: 'Protection du foyer',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    },
    {
        surahNumber: 32, nameAr: 'السجدة', nameFr: 'As-Sajda',
        emoji: '🤲', verseCount: 30, benefit: 'Lecture avant de dormir',
        gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    },
];

export function HomePage() {
    const now = useMemo(() => new Date(), []);
    const hadith = useMemo(() => getHadithOfDay(now), [now]);
    const hijri = useMemo(() => getHijriDate(now), [now]);
    const greeting = useMemo(() => getGreeting(), []);
    const seasonalTags = useMemo(() => getSeasonalTags(now), [now]);
    const seasonalEvent = HIJRI_MONTH_EVENTS[hijri.month];

    const { totalPagesRead, totalMinutesSpent } = useStatsStore();
    const goToSurah = useQuranStore(s => s.goToSurah);
    const navigate = useNavigate();

    const handleSurahClick = useCallback((surahNumber: number) => {
        goToSurah(surahNumber);
        navigate('/read');
    }, [goToSurah, navigate]);

    const handleShare = async () => {
        const text = `📜 Hadith du Jour\n\n${hadith.textAr}\n\n${hadith.textFr}\n\n— ${hadith.source} (${hadith.narrator})\n\nvia Quran Coach`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Hadith du Jour', text });
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(text);
        }
    };

    return (
        <div className="home-page">
            {/* Header */}
            <div className="home-header">
                <div className="home-header__left">
                    <div className="home-header__greeting">
                        <span className="home-header__greeting-emoji">{greeting.emoji}</span>
                        <span>{greeting.text}</span>
                    </div>
                    <div className="home-header__hijri">{formatHijriDate(hijri)}</div>
                    <div className="home-header__hijri-ar">{formatHijriDateAr(hijri)}</div>
                </div>
            </div>

            {/* Seasonal Banner */}
            {seasonalEvent && (
                <div className="home-seasonal">
                    <span className="home-seasonal__emoji">{seasonalEvent.emoji}</span>
                    <div className="home-seasonal__text">
                        <strong>{seasonalEvent.title}</strong>
                        <span>{seasonalEvent.description}</span>
                    </div>
                </div>
            )}

            {/* Hadith Card */}
            <div className="hadith-card">
                <div className="hadith-card__label">
                    <span className="hadith-card__label-dot" />
                    <span>Hadith du Jour</span>
                    {seasonalTags.length > 0 && (
                        <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>
                            • {seasonalTags[0]}
                        </span>
                    )}
                </div>

                <div className="hadith-card__arabic">{hadith.textAr}</div>
                <div className="hadith-card__french">{hadith.textFr}</div>

                <div className="hadith-card__meta">
                    <div>
                        <div className="hadith-card__source">
                            <BookOpen size={12} />
                            <strong>{hadith.source}</strong>
                        </div>
                        <div className="hadith-card__narrator">
                            Rapporté par {hadith.narrator}
                        </div>
                    </div>
                    <div className="hadith-card__actions">
                        <button className="hadith-card__action-btn" onClick={handleShare}>
                            <Share2 size={14} />
                            Partager
                        </button>
                    </div>
                </div>
            </div>

            {/* Essential Surahs */}
            <div className="home-surahs">
                <div className="home-surahs__header">
                    <div className="home-surahs__title">
                        <Star size={14} />
                        Sourates essentielles
                    </div>
                </div>
                <div className="home-surahs__scroll">
                    {ESSENTIAL_SURAHS.map((surah, i) => (
                        <button
                            key={surah.surahNumber}
                            className="surah-card"
                            onClick={() => handleSurahClick(surah.surahNumber)}
                            style={{ animationDelay: `${0.4 + i * 0.06}s` }}
                        >
                            <div className="surah-card__gradient" style={{ background: surah.gradient }} />
                            <span className="surah-card__emoji">{surah.emoji}</span>
                            <div className="surah-card__name-ar">{surah.nameAr}</div>
                            <div className="surah-card__name-fr">{surah.nameFr}</div>
                            <div className="surah-card__benefit">{surah.benefit}</div>
                            <div className="surah-card__verses">{surah.verseCount} versets</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="home-shortcuts">
                <div className="home-shortcuts__title">Accès rapide</div>
                <div className="home-shortcuts__grid">
                    {SHORTCUTS.map(s => (
                        <Link key={s.path} to={s.path} className="home-shortcut">
                            <div
                                className="home-shortcut__icon"
                                style={{ background: s.bg, color: s.color }}
                            >
                                <s.icon size={22} />
                            </div>
                            <span className="home-shortcut__label">{s.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="home-stats">
                <div className="home-stats__title">Ma progression</div>
                <div className="home-stats__grid">
                    <div className="home-stat">
                        <div className="home-stat__value">{totalPagesRead || 0}</div>
                        <div className="home-stat__label">Pages lues</div>
                    </div>
                    <div className="home-stat">
                        <div className="home-stat__value">{totalMinutesSpent || 0}</div>
                        <div className="home-stat__label">Minutes</div>
                    </div>
                    <div className="home-stat">
                        <div className="home-stat__value">{Math.floor((totalPagesRead || 0) / 20)}</div>
                        <div className="home-stat__label">Juz lus</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
