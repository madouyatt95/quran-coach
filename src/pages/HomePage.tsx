import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, BookOpen, Star, BookMarked, Flame, RotateCcw, Heart } from 'lucide-react';
import { getHadithOfDay, getHijriDate, formatHijriDate, formatHijriDateAr, getGreeting, getSeasonalTags } from '../lib/hadithEngine';
import { formatDivineNames } from '../lib/divineNames';
import { useStatsStore } from '../stores/statsStore';
import { useQuranStore } from '../stores/quranStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { SmartSentinel } from '../components/Home/SmartSentinel';
import './HomePage.css';

// ─── Surah names (compact subset for display) ────────────
const SURAH_NAMES: Record<number, string> = {
    1: 'Al-Fatiha', 2: 'Al-Baqara', 3: 'Al-Imran', 4: 'An-Nisa', 5: 'Al-Ma\'ida',
    6: 'Al-An\'am', 7: 'Al-A\'raf', 8: 'Al-Anfal', 9: 'At-Tawba', 10: 'Yunus',
    11: 'Hud', 12: 'Yusuf', 13: 'Ar-Ra\'d', 14: 'Ibrahim', 15: 'Al-Hijr',
    16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
    21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Mu\'minun', 24: 'An-Nur',
    25: 'Al-Furqan', 26: 'Ash-Shu\'ara', 27: 'An-Naml', 28: 'Al-Qasas',
    29: 'Al-Ankabut', 30: 'Ar-Rum', 31: 'Luqman', 32: 'As-Sajda', 33: 'Al-Ahzab',
    34: 'Saba', 35: 'Fatir', 36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad',
    39: 'Az-Zumar', 40: 'Ghafir', 41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf',
    44: 'Ad-Dukhan', 45: 'Al-Jathiya', 46: 'Al-Ahqaf', 47: 'Muhammad',
    48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf', 51: 'Adh-Dhariyat', 52: 'At-Tur',
    53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman', 56: 'Al-Waqi\'a', 57: 'Al-Hadid',
    58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahana', 61: 'As-Saff',
    62: 'Al-Jumu\'a', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
    66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqa', 70: 'Al-Ma\'arij',
    71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddathir',
    75: 'Al-Qiyama', 76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba',
    79: 'An-Nazi\'at', 80: 'Abasa', 81: 'At-Takwir', 82: 'Al-Infitar',
    83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj', 86: 'At-Tariq',
    87: 'Al-A\'la', 88: 'Al-Ghashiya', 89: 'Al-Fajr', 90: 'Al-Balad',
    91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Ash-Sharh',
    95: 'At-Tin', 96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyina',
    99: 'Az-Zalzala', 100: 'Al-Adiyat', 101: 'Al-Qari\'a', 102: 'At-Takathur',
    103: 'Al-Asr', 104: 'Al-Humaza', 105: 'Al-Fil', 106: 'Quraysh',
    107: 'Al-Ma\'un', 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
    111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};

// ─── Events / Seasonal data ─────────────────────────────
const HIJRI_MONTH_EVENTS: Record<number, { emoji: string; title: string; description: string }> = {
    1: { emoji: '🌙', title: 'Mois de Muharram', description: 'Premier mois sacré du calendrier hégirien' },
    7: { emoji: '✨', title: 'Mois de Rajab', description: 'Mois sacré — préparation spirituelle' },
    8: { emoji: '🌿', title: "Mois de Sha'ban", description: 'Préparation au mois de Ramadan' },
    9: { emoji: '🕌', title: 'Ramadan Mubarak', description: 'Mois béni du jeûne et de la prière' },
    10: { emoji: '🎉', title: 'Mois de Shawwal', description: "Aïd al-Fitr — fête de la rupture du jeûne" },
    12: { emoji: '🕋', title: 'Dhul Hijjah', description: 'Mois du pèlerinage — les 10 meilleurs jours' },
};

const SHORTCUTS = [
    { path: '/quiz', emoji: '⚔️', labelKey: 'sideMenu.quiz', desc: 'Défis', gradient: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' },
    { path: '/qibla', emoji: '🧭', labelKey: 'sideMenu.qibla', desc: 'Direction', gradient: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' },
    { path: '/prayers', emoji: '🕌', labelKey: 'sideMenu.prayers', desc: 'Horaires', gradient: 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,152,0,0.05))' },
    { path: '/themes', emoji: '📚', labelKey: 'sideMenu.themes', desc: 'Coraniques', gradient: 'linear-gradient(135deg, rgba(88,166,255,0.2), rgba(88,166,255,0.05))' },
    { path: '/adhkar', emoji: '🤲', labelKey: 'sideMenu.adhkar', desc: 'Adhkar', gradient: 'linear-gradient(135deg, rgba(231,76,60,0.2), rgba(231,76,60,0.05))' },
    { path: '/listen', emoji: '🎧', labelKey: 'sideMenu.listen', desc: 'Récitations', gradient: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))' },
    { path: '/hadiths', emoji: '📜', labelKey: 'sideMenu.hadiths', desc: 'Prophétiques', gradient: 'linear-gradient(135deg, rgba(156,39,176,0.2), rgba(156,39,176,0.05))' },
    { path: '/tafsir', emoji: '📖', labelKey: 'sideMenu.tafsir', desc: 'Exégèse', gradient: 'linear-gradient(135deg, rgba(121,85,72,0.2), rgba(121,85,72,0.05))' },
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
    { surahNumber: 36, nameAr: 'يس', nameFr: 'Ya-Sin', emoji: '💎', verseCount: 83, benefit: 'Cœur du Coran', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { surahNumber: 67, nameAr: 'المُلك', nameFr: 'Al-Mulk', emoji: '👑', verseCount: 30, benefit: 'Protection dans la tombe', gradient: 'linear-gradient(135deg, #c9a84c 0%, #8B6914 100%)' },
    { surahNumber: 18, nameAr: 'الكهف', nameFr: 'Al-Kahf', emoji: '🏔️', verseCount: 110, benefit: 'Lumière du vendredi', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { surahNumber: 55, nameAr: 'الرحمن', nameFr: 'Ar-Rahman', emoji: '🌸', verseCount: 78, benefit: "Les bienfaits d'Allah", gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
    { surahNumber: 56, nameAr: 'الواقعة', nameFr: "Al-Waqi'a", emoji: '⚡', verseCount: 96, benefit: 'Protection contre la pauvreté', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { surahNumber: 112, nameAr: 'الإخلاص', nameFr: 'Al-Ikhlas', emoji: '✨', verseCount: 4, benefit: 'Vaut le tiers du Coran', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { surahNumber: 2, nameAr: 'البقرة', nameFr: 'Al-Baqara', emoji: '🛡️', verseCount: 286, benefit: 'Protection du foyer', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { surahNumber: 32, nameAr: 'السجدة', nameFr: 'As-Sajda', emoji: '🤲', verseCount: 30, benefit: 'Lecture avant de dormir', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
];

// ─── Dhikr data ──────────────────────────────────────────
const DHIKR_LIST = [
    { id: 'subhanallah', text: 'سُبْحَانَ اللَّه', textFr: 'SubhanAllah', descFr: 'Gloire à Allah', target: 33, daily: '33×/jour', color: '#4facfe', emoji: '📿' },
    { id: 'alhamdulillah', text: 'الحَمْدُ لِلَّه', textFr: 'Alhamdulillah', descFr: 'Louange à Allah', target: 33, daily: '33×/jour', color: '#c9a84c', emoji: '🤲' },
    { id: 'allahu_akbar', text: 'اللَّهُ أَكْبَر', textFr: 'Allahu Akbar', descFr: 'Allah est le plus Grand', target: 33, daily: '33×/jour', color: '#38ef7d', emoji: '✨' },
    { id: 'tahlil_grand', text: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِير', textFr: 'Lâ ilâha illAllâh wahdahu...', descFr: "L'Unicité d'Allah (Complet)", target: 100, daily: '100×/jour', color: '#F44336', emoji: '🥇' },
    { id: 'tahlil', text: 'لَا إِلَٰهَ إِلَّا اللَّه', textFr: 'Lâ ilâha illa-Llâh', descFr: "Pas de divinité digne d'être adorée sauf Allah", target: 100, daily: '100×/jour', color: '#FF6B6B', emoji: '❤️' },
    { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّه', textFr: 'Astaghfirullâh', descFr: 'Je demande pardon à Allah', target: 100, daily: '100×/jour', color: '#AB47BC', emoji: '💜' },
    { id: 'istighfar_sunnah', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', textFr: 'Astaghfirullâh wa atoûbu ilayh', descFr: 'Je demande pardon et me repens', target: 70, daily: '+70×/jour', color: '#FF9800', emoji: '🧡' },
    { id: 'subhan_bihamdi', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِه', textFr: 'SubhânAllâh wa bihamdihi', descFr: 'Gloire et louange à Allah', target: 0, daily: '∞ illimité', color: '#E91E63', emoji: '🌸' },
    { id: 'subhan_azim', text: 'سُبْحَانَ اللَّهِ الْعَظِيم', textFr: "SubhânAllâh al-'Azîm", descFr: 'Gloire à Allah le Magnifique', target: 0, daily: '∞ illimité', color: '#00BCD4', emoji: '💎' },
];

// ─── Dhikr Hook (localStorage persisted, independent counters) ─
function useDhikr() {
    const todayKey = `dhikr-v2-${new Date().toISOString().split('T')[0]}`;
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const saved = localStorage.getItem(todayKey);
        if (saved) {
            try { setCounts(JSON.parse(saved)); } catch { /* ignore */ }
        }
    }, [todayKey]);

    const tap = useCallback((id: string) => {
        setCounts(prev => {
            const dhikr = DHIKR_LIST.find(d => d.id === id);
            if (!dhikr) return prev;
            const current = prev[id] || 0;
            // No cap — counter always increments, series are tracked
            const next = { ...prev, [id]: current + 1 };
            localStorage.setItem(todayKey, JSON.stringify(next));
            return next;
        });
    }, [todayKey]);

    const reset = useCallback((id: string) => {
        setCounts(prev => {
            const next = { ...prev, [id]: 0 };
            localStorage.setItem(todayKey, JSON.stringify(next));
            return next;
        });
    }, [todayKey]);

    const resetAll = useCallback(() => {
        setCounts({});
        localStorage.setItem(todayKey, JSON.stringify({}));
    }, [todayKey]);

    const getCount = useCallback((id: string) => counts[id] || 0, [counts]);

    const completedCount = DHIKR_LIST.filter(d => d.target > 0 && (counts[d.id] || 0) >= d.target).length;
    const targetedCount = DHIKR_LIST.filter(d => d.target > 0).length;
    const allTargetedDone = completedCount >= targetedCount;

    return { counts, tap, reset, resetAll, getCount, completedCount, targetedCount, allTargetedDone };
}
// ─── Next Prayer Hook (uses local engine) ────────────────
function useNextPrayer() {
    const [data, setData] = useState<{ name: string; nameAr: string; time: string; countdown: string } | null>(null);

    useEffect(() => {
        const PRAYER_NAMES: Record<string, string> = {
            fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
        };
        const PRAYER_NAMES_FR: Record<string, string> = {
            fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha'
        };

        const computeNextPrayer = async () => {
            try {
                const { usePrayerStore } = await import('../stores/prayerStore');
                const { computeDay, DEFAULT_PRAYER_SETTINGS } = await import('../lib/prayerEngine');
                const store = usePrayerStore.getState();

                let lat = store.lat;
                let lng = store.lng;

                // If no coords in store yet, get from geolocation
                if (lat == null || lng == null) {
                    try {
                        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                        );
                        lat = pos.coords.latitude;
                        lng = pos.coords.longitude;
                    } catch {
                        // Fallback: Paris
                        lat = 48.8566;
                        lng = 2.3522;
                    }
                }

                const settings = store.settings || DEFAULT_PRAYER_SETTINGS;
                const result = computeDay(new Date(), lat, lng, settings);
                const timings = result.formattedTimes;
                updateCountdown(timings, PRAYER_NAMES, PRAYER_NAMES_FR);
            } catch {
                // Fallback: API as last resort
                try {
                    const res = await fetch(`https://api.aladhan.com/v1/timings/${Date.now() / 1000}?latitude=48.8566&longitude=2.3522&method=2`);
                    const json = await res.json();
                    if (json.code === 200) {
                        updateCountdown(json.data.timings, PRAYER_NAMES, PRAYER_NAMES_FR);
                    }
                } catch { /* silent */ }
            }
        };

        const updateCountdown = (timings: Record<string, string>, namesAr: Record<string, string>, namesFr: Record<string, string>) => {
            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            // Also check original API keys if fallback
            const apiKeys: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
            const now = new Date();
            const currentMin = now.getHours() * 60 + now.getMinutes();

            for (const p of prayers) {
                const timeStr = timings[p] || timings[apiKeys[p]] || '';
                if (!timeStr) continue;
                const [h, m] = timeStr.split(':').map(Number);
                if (isNaN(h) || isNaN(m)) continue;
                const pMin = h * 60 + m;
                if (pMin > currentMin) {
                    const diff = pMin - currentMin;
                    const hrs = Math.floor(diff / 60);
                    setData({
                        name: namesFr[p] || p,
                        nameAr: namesAr[p] || '',
                        time: timeStr,
                        countdown: hrs > 0 ? `${hrs}h ${diff % 60}min` : `${diff % 60} min`,
                    });
                    return;
                }
            }
            // All passed → Fajr tomorrow
            const fajrStr = timings.fajr || timings.Fajr || '05:00';
            const [fH, fM] = fajrStr.split(':').map(Number);
            const diff = (24 * 60 - currentMin) + (fH || 5) * 60 + (fM || 0);
            setData({
                name: namesFr.fajr || 'Fajr', nameAr: namesAr.fajr || 'الفجر', time: fajrStr,
                countdown: `${Math.floor(diff / 60)}h ${diff % 60}min`,
            });
        };

        computeNextPrayer();
        const interval = setInterval(computeNextPrayer, 60000);
        return () => clearInterval(interval);
    }, []);

    return data;
}



// ═══════════════════════════════════════════════════════════
// HomePage Component
// ═══════════════════════════════════════════════════════════
export function HomePage() {
    const { t } = useTranslation();
    const now = useMemo(() => new Date(), []);
    const hadith = useMemo(() => getHadithOfDay(now), [now]);
    const hijri = useMemo(() => getHijriDate(now), [now]);
    const greeting = useMemo(() => getGreeting(), []);
    const seasonalTags = useMemo(() => getSeasonalTags(now), [now]);
    const seasonalEvent = HIJRI_MONTH_EVENTS[hijri.month];

    const { currentPage, currentSurah, goToSurah, goToAyah, progress } = useQuranStore();
    const { readingStreak } = useStatsStore();
    const navigate = useNavigate();
    const nextPrayer = useNextPrayer();
    const dhikr = useDhikr();


    const handleSurahClick = useCallback((surahNumber: number) => {
        sessionStorage.setItem('isSilentJump', 'true');
        sessionStorage.setItem('scrollToPage', '0'); // Scroll to top of surah
        goToSurah(surahNumber, { silent: true });
        navigate('/read');
    }, [goToSurah, navigate]);

    const handleContinueReading = useCallback(() => {
        if (progress) {
            sessionStorage.setItem('isSilentJump', 'true');
            sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: progress.lastSurah, ayah: progress.lastAyah }));
            goToAyah(progress.lastSurah, progress.lastAyah, progress.lastPage, { silent: false });
        }
        navigate('/read');
    }, [navigate, progress, goToAyah]);

    const displaySurah = progress?.lastSurah ?? currentSurah;
    const displayPage = progress?.lastPage ?? currentPage;

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

            {/* Continue Reading + Streak */}
            <div className="home-continue-row">
                <button className="home-continue" onClick={handleContinueReading}>
                    <div className="home-continue__icon">
                        <BookMarked size={20} />
                    </div>
                    <div className="home-continue__text">
                        <span className="home-continue__title">{t('home.continueReading', 'Reprendre ma lecture')}</span>
                        <span className="home-continue__page">
                            {SURAH_NAMES[displaySurah] || `${t('mushaf.surah', 'Sourate')} ${displaySurah}`} — {t('mushaf.page', 'Page')} {displayPage}
                        </span>
                    </div>
                    <span className="home-continue__arrow">→</span>
                </button>
                {readingStreak > 0 && (
                    <div className="home-streak">
                        <Flame size={18} className="home-streak__flame" />
                        <span className="home-streak__count">{readingStreak}</span>
                        <span className="home-streak__label">{t('home.days', 'jours')}</span>
                    </div>
                )}
            </div>


            {/* Next Prayer */}
            {nextPrayer && (
                <Link to="/prayers" className="home-prayer-link">
                    <div className="home-prayer">
                        <div className="home-prayer__left">
                            <span className="home-prayer__emoji">🕌</span>
                            <div>
                                <span className="home-prayer__name">{t(`prayer.${nextPrayer.name.toLowerCase()}`, nextPrayer.name)}</span>
                                <span className="home-prayer__name-ar">{nextPrayer.nameAr}</span>
                            </div>
                        </div>
                        <div className="home-prayer__right">
                            <span className="home-prayer__time">{nextPrayer.time}</span>
                            <span className="home-prayer__countdown">{t('home.in')} {nextPrayer.countdown}</span>
                        </div>
                    </div>
                </Link>
            )}

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


            {/* Sentinelle Spirituelle (Météo, Voyage, Sahar, etc.) */}
            <SmartSentinel />

            {/* Hadith Card */}
            <div className="hadith-card">
                <div className="hadith-card__label">
                    <span className="hadith-card__label-dot" />
                    <span>{t('home.hadithOfDay', 'Hadith du Jour')}</span>
                    {seasonalTags.length > 0 && (
                        <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>
                            • {seasonalTags[0]}
                        </span>
                    )}
                </div>
                <div className="hadith-card__arabic">{formatDivineNames(hadith.textAr)}</div>
                <div className="hadith-card__french">{formatDivineNames(hadith.textFr)}</div>
                <div className="hadith-card__meta">
                    <div>
                        <div className="hadith-card__source">
                            <BookOpen size={12} />
                            <strong>{hadith.source}</strong>
                        </div>
                        <div className="hadith-card__narrator">{t('home.narratedBy', 'Rapporté par')} {hadith.narrator}</div>
                    </div>
                    <div className="hadith-card__actions">
                        <button
                            className={`hadith-card__action-btn ${useFavoritesStore.getState().isFavoriteHadith(hadith.id) ? 'hadith-fav-active' : ''}`}
                            onClick={() => {
                                useFavoritesStore.getState().toggleFavoriteHadith({
                                    id: hadith.id,
                                    ar: hadith.textAr,
                                    fr: hadith.textFr,
                                    src: hadith.source,
                                    nar: hadith.narrator,
                                    cat: 'general',
                                });
                            }}
                        >
                            <Heart size={14} fill={useFavoritesStore.getState().isFavoriteHadith(hadith.id) ? 'currentColor' : 'none'} /> {t('common.inFavs', 'Favoris')}
                        </button>
                        <button className="hadith-card__action-btn" onClick={handleShare}>
                            <Share2 size={14} /> {t('common.share', 'Partager')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Essential Surahs */}
            <div className="home-surahs">
                <div className="home-surahs__header">
                    <div className="home-surahs__title"><Star size={14} /> {t('home.essentialSurahs')}</div>
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
                            <div className="surah-card__verses">{surah.verseCount} {t('common.verses')}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dhikr Counters Grid */}
            <div className="home-dhikr">
                <div className="home-dhikr__header">
                    <div className="home-dhikr__title">📿 {t('home.dhikr')}</div>
                    {dhikr.allTargetedDone && (
                        <span className="home-dhikr__badge">✅ {dhikr.completedCount}/{dhikr.targetedCount}</span>
                    )}
                    <button className="home-dhikr__reset-all" onClick={dhikr.resetAll}>
                        <RotateCcw size={12} /> {t('common.resetAll', 'Tout réinitialiser')}
                    </button>
                </div>

                <div className="home-dhikr__grid">
                    {DHIKR_LIST.map(d => {
                        const count = dhikr.getCount(d.id);
                        const isUnlimited = d.target === 0;
                        const series = !isUnlimited && d.target > 0 ? Math.floor(count / d.target) : 0;
                        const countInSeries = !isUnlimited && d.target > 0 ? count % d.target : count;
                        const isDone = series >= 1;
                        const progress = d.target > 0 ? ((countInSeries / d.target) * 100) : 0;
                        return (
                            <button
                                key={d.id}
                                className={`dhikr-card ${isDone ? 'dhikr-card--done' : ''}`}
                                onClick={() => dhikr.tap(d.id)}
                                style={{ '--dhikr-color': d.color } as React.CSSProperties}
                            >
                                {series > 0 && <span className="dhikr-card__series">{series}×</span>}
                                <span className="dhikr-card__daily">{d.daily}</span>
                                <span className="dhikr-card__emoji">{d.emoji}</span>
                                <span className="dhikr-card__ar">{formatDivineNames(d.text)}</span>
                                <span className="dhikr-card__fr">{formatDivineNames(d.textFr)}</span>
                                <span className="dhikr-card__desc">{formatDivineNames(d.descFr)}</span>
                                <span className="dhikr-card__count">
                                    {isUnlimited ? count : `${countInSeries}/${d.target}`}
                                </span>
                                {!isUnlimited && (
                                    <div className="dhikr-card__bar">
                                        <div className="dhikr-card__bar-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                )}
                                {(count > 0) && (
                                    <button
                                        className="dhikr-card__reset"
                                        onClick={(e) => { e.stopPropagation(); dhikr.reset(d.id); }}
                                        title="Réinitialiser"
                                    >
                                        <RotateCcw size={10} />
                                    </button>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="home-shortcuts">
                <div className="home-shortcuts__title">{t('sideMenu.quickAccess')}</div>
                <div className="home-shortcuts__grid">
                    {SHORTCUTS.map(s => (
                        <Link key={s.path} to={s.path} className="home-shortcut" style={{ background: s.gradient }}>
                            <span className="home-shortcut__emoji">{s.emoji}</span>
                            <span className="home-shortcut__label">{t(s.labelKey)}</span>
                            <span className="home-shortcut__desc">{s.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
