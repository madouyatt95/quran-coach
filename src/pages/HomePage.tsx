import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, BookOpen, Star, BookMarked, Flame, RotateCcw, Heart, Plus, X, Calendar, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHadithOfDay, getHijriDate, formatHijriDate, formatHijriDateAr, getGreeting, getSeasonalTags, getUpcomingIslamicEvent } from '../lib/hadithEngine';
import { formatDivineNames } from '../lib/divineNames';
import { useStatsStore } from '../stores/statsStore';
import { useQuranStore } from '../stores/quranStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { SmartSentinel } from '../components/Home/SmartSentinel';
import { updateNextPrayerWidget, updateHadithWidget } from '../lib/widgetService';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { IslamicCalendar } from '../components/Prayer/IslamicCalendar';
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
const SHORTCUTS = [
    { path: '/prophets', emoji: '📜', labelKey: 'nav.prophets', desc: 'Prophètes', gradient: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' },
    { path: '/qibla', emoji: '🧭', labelKey: 'sideMenu.qibla', desc: 'Direction', gradient: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))' },
    { path: '/prayers', emoji: '🕌', labelKey: 'sideMenu.prayers', desc: 'Horaires', gradient: 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,152,0,0.05))' },
    { path: '/themes', emoji: '📚', labelKey: 'sideMenu.themes', desc: 'Coraniques', gradient: 'linear-gradient(135deg, rgba(88,166,255,0.2), rgba(88,166,255,0.05))' },
    { path: '/adhkar', emoji: '🤲', labelKey: 'sideMenu.adhkar', desc: 'Invocations', gradient: 'linear-gradient(135deg, rgba(231,76,60,0.2), rgba(231,76,60,0.05))' },
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
interface DhikrItem {
    id: string;
    text: string;
    textFr: string;
    descFr: string;
    target: number;
    daily: string;
    color: string;
    emoji: string;
    isCustom?: boolean;
}

const DHIKR_LIST: DhikrItem[] = [
    { id: 'subhanallah', text: 'سُبْحَانَ اللَّه', textFr: 'SubhanAllah', descFr: 'Gloire à Allah', target: 33, daily: '33×/jour', color: '#4facfe', emoji: '📿' },
    { id: 'alhamdulillah', text: 'الحَمْدُ لِلَّه', textFr: 'Alhamdulillah', descFr: 'Louange à Allah', target: 33, daily: '33×/jour', color: '#c9a84c', emoji: '🤲' },
    { id: 'allahu_akbar', text: 'اللَّهُ أَكْبَر', textFr: 'Allahu Akbar', descFr: 'Allah est le plus Grand', target: 33, daily: '33×/jour', color: '#38ef7d', emoji: '✨' },
    { id: 'tahlil_grand', text: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِير', textFr: 'Lâ ilâha illAllâh wahdahu lâ sharîka lah, lahul-mulk wa lahul-hamd, wa Huwa \'alâ kulli shay\'in qadîr', descFr: "L'Unicité d'Allah (Complet)", target: 100, daily: '100×/jour', color: '#F44336', emoji: '🥇' },
    { id: 'tahlil', text: 'لَا إِلَٰهَ إِلَّا اللَّه', textFr: 'Lâ ilâha illa-Llâh', descFr: "Pas de divinité digne d'être adorée sauf Allah", target: 100, daily: '100×/jour', color: '#FF6B6B', emoji: '❤️' },
    { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّه', textFr: 'Astaghfirullâh', descFr: 'Je demande pardon à Allah', target: 100, daily: '100×/jour', color: '#AB47BC', emoji: '💜' },
    { id: 'istighfar_sunnah', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', textFr: 'Astaghfirullâh wa atoûbu ilayh', descFr: 'Je demande pardon et me repens', target: 70, daily: '+70×/jour', color: '#FF9800', emoji: '🧡' },
    { id: 'subhan_bihamdi', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِه', textFr: 'SubhânAllâh wa bihamdihi', descFr: 'Gloire et louange à Allah', target: 0, daily: '∞ illimité', color: '#E91E63', emoji: '🌸' },
    { id: 'subhan_azim', text: 'سُبْحَانَ اللَّهِ الْعَظِيم', textFr: "SubhânAllâh al-'Azîm", descFr: 'Gloire à Allah le Magnifique', target: 0, daily: '∞ illimité', color: '#00BCD4', emoji: '💎' },
];

const CUSTOM_COLORS = ['#9C27B0', '#009688', '#FF5722', '#607D8B', '#E91E63', '#3F51B5', '#795548', '#00BCD4'];
const CUSTOM_EMOJIS = ['🤲', '📿', '💚', '🌙', '⭐', '🕌', '📖', '🤍'];

function loadUserDhikrs(): DhikrItem[] {
    try {
        const saved = localStorage.getItem('user-dhikrs-order');
        if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    
    try {
        const legacyCustom = localStorage.getItem('custom-dhikr');
        if (legacyCustom) {
            const parsed = JSON.parse(legacyCustom);
            return [...DHIKR_LIST, ...parsed];
        }
    } catch { /* ignore */ }
    
    return [...DHIKR_LIST];
}

function saveUserDhikrs(items: DhikrItem[]) {
    localStorage.setItem('user-dhikrs-order', JSON.stringify(items));
}

// ─── Dhikr Hook ──────────────────────────────────────────
function useDhikr() {
    const todayKey = `dhikr-v2-${new Date().toISOString().split('T')[0]}`;
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [allItems, setAllItems] = useState<DhikrItem[]>(loadUserDhikrs);

    useEffect(() => {
        saveUserDhikrs(allItems);
    }, [allItems]);

    useEffect(() => {
        const saved = localStorage.getItem(todayKey);
        if (saved) {
            try { setCounts(JSON.parse(saved)); } catch { /* ignore */ }
        }
    }, [todayKey]);

    const tap = useCallback((id: string) => {
        setCounts(prev => {
            const current = prev[id] || 0;
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

    const addCustom = useCallback((item: DhikrItem) => {
        setAllItems(prev => [...prev, { ...item, isCustom: true }]);
    }, []);

    const removeDhikr = useCallback((id: string) => {
        setAllItems(prev => prev.filter(d => d.id !== id));
    }, []);

    const getCountInSeries = useCallback((id: string) => {
        const item = allItems.find(d => d.id === id);
        const count = counts[id] || 0;
        if (!item || item.target === 0) return count;
        return count % item.target;
    }, [counts, allItems]);

    const reorderDhikrs = useCallback((newOrder: DhikrItem[]) => {
        setAllItems(newOrder);
    }, []);

    const restoreDefaults = useCallback(() => {
        if (window.confirm('Voulez-vous restaurer la liste de Dhikr par défaut ? Vos invocations personnelles et vos progressions seront supprimées.')) {
            localStorage.removeItem('user-dhikrs-order');
            localStorage.removeItem('custom-dhikr');
            // Supprimer toutes les clés de progression dhikr-v2-*
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('dhikr-v2-')) {
                    localStorage.removeItem(key);
                    i--; // Ajuster l'index après suppression
                }
            }
            window.location.reload();
        }
    }, [allItems]);

    const completedCount = allItems.filter(d => d.target > 0 && (counts[d.id] || 0) >= d.target).length;
    const targetedCount = allItems.filter(d => d.target > 0).length;
    const allTargetedDone = completedCount > 0 && completedCount >= targetedCount;

    return { counts, tap, reset, resetAll, getCount, getCountInSeries, completedCount, targetedCount, allTargetedDone, allItems, addCustom, removeDhikr, reorderDhikrs, restoreDefaults };
}

// ─── Next Prayer Hook ────────────────────────────────────
function useNextPrayer() {
    const [data, setData] = useState<{ name: string; nameAr: string; time: string; countdown: string } | null>(null);

    useEffect(() => {
        const PRAYER_NAMES: Record<string, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
        const PRAYER_NAMES_FR: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

        const computeNextPrayer = async () => {
            try {
                const { usePrayerStore } = await import('../stores/prayerStore');
                const { computeDay, DEFAULT_PRAYER_SETTINGS } = await import('../lib/prayerEngine');
                const store = usePrayerStore.getState();
                let lat = store.lat ?? 48.8566;
                let lng = store.lng ?? 2.3522;
                const settings = store.settings || DEFAULT_PRAYER_SETTINGS;
                const result = computeDay(new Date(), lat, lng, settings);
                updateCountdown(result.formattedTimes, PRAYER_NAMES, PRAYER_NAMES_FR);
            } catch {
                try {
                    const res = await fetch(`https://api.aladhan.com/v1/timings/${Date.now() / 1000}?latitude=48.8566&longitude=2.3522&method=2`);
                    const json = await res.json();
                    if (json.code === 200) updateCountdown(json.data.timings, PRAYER_NAMES, PRAYER_NAMES_FR);
                } catch { /* silent */ }
            }
        };

        const updateCountdown = (timings: Record<string, string>, namesAr: Record<string, string>, namesFr: Record<string, string>) => {
            const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
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
                    const nameLoc = namesFr[p] || p;
                    const timeLoc = timeStr;
                    setData({ name: nameLoc, nameAr: namesAr[p] || '', time: timeLoc, countdown: hrs > 0 ? `${hrs}h ${diff % 60}min` : `${diff % 60} min` });
                    updateNextPrayerWidget(nameLoc, timeLoc).catch(() => {});
                    return;
                }
            }
            const fajrStr = timings.fajr || timings.Fajr || '05:00';
            const [fH, fM] = fajrStr.split(':').map(Number);
            const diff = (24 * 60 - currentMin) + (fH || 5) * 60 + (fM || 0);
            const nameLocFajr = namesFr.fajr || 'Fajr';
            setData({ name: nameLocFajr, nameAr: namesAr.fajr || 'الفجر', time: fajrStr, countdown: `${Math.floor(diff / 60)}h ${diff % 60}min` });
            updateNextPrayerWidget(nameLocFajr, fajrStr).catch(() => {});
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
    const upcomingEvent = useMemo(() => getUpcomingIslamicEvent(hijri), [hijri]);

    const { currentPage, currentSurah, goToSurah, goToAyah, progress } = useQuranStore();
    const { readingStreak } = useStatsStore();
    const navigate = useNavigate();
    const nextPrayer = useNextPrayer();
    const dhikr = useDhikr();

    useEffect(() => {
        if (hadith) updateHadithWidget(hadith.textFr, hadith.source).catch(() => {});
    }, [hadith]);

    const [isEditingDhikr, setIsEditingDhikr] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dhikrSectionRef = useRef<HTMLDivElement>(null);
    const dhikrGroupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEditingDhikr) return;
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (dhikrSectionRef.current && !dhikrSectionRef.current.contains(e.target as Node)) {
                setIsEditingDhikr(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('touchstart', handleClickOutside, true);
        };
    }, [isEditingDhikr]);

    const [showAddDuaa, setShowAddDuaa] = useState(false);

    const moveDhikr = useCallback((id: string, delta: number) => {
        const oldIndex = dhikr.allItems.findIndex(d => d.id === id);
        const newIndex = Math.max(0, Math.min(dhikr.allItems.length - 1, oldIndex + delta));
        if (oldIndex === newIndex) return;
        const newList = [...dhikr.allItems];
        const [item] = newList.splice(oldIndex, 1);
        newList.splice(newIndex, 0, item);
        dhikr.reorderDhikrs(newList);
    }, [dhikr.allItems, dhikr.reorderDhikrs]);
    const [newDuaa, setNewDuaa] = useState({ text: '', textFr: '', descFr: '', target: 0, emoji: '🤲' });
    const [showIslamicCalendar, setShowIslamicCalendar] = useState(false);

    useEffect(() => {
        if (showIslamicCalendar) {
            document.body.classList.add('scroll-lock');
        } else {
            document.body.classList.remove('scroll-lock');
        }
        return () => document.body.classList.remove('scroll-lock');
    }, [showIslamicCalendar]);

    const handleTouchStartDhikr = () => {
        if (isEditingDhikr) return;
        longPressTimer.current = setTimeout(() => {
            if ('vibrate' in navigator) navigator.vibrate(50);
            setIsEditingDhikr(true);
        }, 500);
    };

    const handleTouchEndDhikr = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleSurahClick = useCallback((surahNumber: number) => {
        sessionStorage.setItem('isSilentJump', 'true');
        sessionStorage.setItem('scrollToPage', '0');
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
            try { await navigator.share({ title: 'Hadith du Jour', text }); } catch { /* ignore */ }
        } else {
            await navigator.clipboard.writeText(text);
        }
    };

    return (
        <div className="home-page">
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

            <div className="home-continue-row">
                <button className="home-continue" onClick={handleContinueReading}>
                    <div className="home-continue__icon"><BookMarked size={20} /></div>
                    <div className="home-continue__text">
                        <span className="home-continue__title">{t('home.continueReading', 'Reprendre ma lecture')}</span>
                        <span className="home-continue__page">{SURAH_NAMES[displaySurah] || `Sourate ${displaySurah}`} — Page {displayPage}</span>
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

            {upcomingEvent && (
                <div className="home-seasonal" onClick={() => setShowIslamicCalendar(true)} style={{ cursor: 'pointer' }}>
                    <span className="home-seasonal__emoji">{upcomingEvent.emoji}</span>
                    <div className="home-seasonal__text">
                        <strong>{upcomingEvent.title}</strong>
                        <span>{upcomingEvent.description}</span>
                    </div>
                </div>
            )}

            <SmartSentinel />

            <div className="hadith-card">
                <div className="hadith-card__label">
                    <span className="hadith-card__label-dot" />
                    <span>{t('home.hadithOfDay', 'Hadith du Jour')}</span>
                    {seasonalTags.length > 0 && <span style={{ opacity: 0.5, fontSize: '0.65rem' }}> • {seasonalTags[0]}</span>}
                </div>
                <div className="hadith-card__arabic">{formatDivineNames(hadith.textAr)}</div>
                <div className="hadith-card__french">{formatDivineNames(hadith.textFr)}</div>
                <div className="hadith-card__meta">
                    <div>
                        <div className="hadith-card__source"><BookOpen size={12} /> <strong>{hadith.source}</strong></div>
                        <div className="hadith-card__narrator">{t('home.narratedBy', 'Rapporté par')} {hadith.narrator}</div>
                    </div>
                    <div className="hadith-card__actions">
                        <button className={`hadith-card__action-btn ${useFavoritesStore.getState().isFavoriteHadith(hadith.id) ? 'hadith-fav-active' : ''}`} onClick={() => useFavoritesStore.getState().toggleFavoriteHadith({ id: hadith.id, ar: hadith.textAr, fr: hadith.textFr, src: hadith.source, nar: hadith.narrator, cat: 'general' })}>
                            <Heart size={14} fill={useFavoritesStore.getState().isFavoriteHadith(hadith.id) ? 'currentColor' : 'none'} /> {t('common.inFavs', 'Favoris')}
                        </button>
                        <button className="hadith-card__action-btn" onClick={handleShare}><Share2 size={14} /> {t('common.share', 'Partager')}</button>
                    </div>
                </div>
            </div>

            <div className="home-surahs">
                <div className="home-surahs__header">
                    <div className="home-surahs__title"><Star size={14} /> {t('home.essentialSurahs')}</div>
                </div>
                <div className="home-surahs__scroll">
                    {ESSENTIAL_SURAHS.map((surah, i) => (
                        <button key={surah.surahNumber} className="surah-card" onClick={() => handleSurahClick(surah.surahNumber)} style={{ animationDelay: `${0.4 + i * 0.06}s` }}>
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

            <div className="home-dhikr" ref={dhikrSectionRef}>
                <div className="home-dhikr__header">
                    <div className="home-dhikr__title">📿 {t('home.dhikr')}</div>
                    {dhikr.allTargetedDone && !isEditingDhikr && <span className="home-dhikr__badge">✅ {dhikr.completedCount}/{dhikr.targetedCount}</span>}
                    {isEditingDhikr ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="home-dhikr__reset-all" onClick={dhikr.restoreDefaults} style={{ color: '#E91E63' }}><RotateCcw size={12} /> Restaurer défauts</button>
                            <button className="home-dhikr__reset-all" onClick={() => setIsEditingDhikr(false)} style={{ color: '#4CAF50', fontWeight: 'bold' }}>Terminer</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="home-dhikr__reset-all" onClick={dhikr.resetAll}><RotateCcw size={12} /> {t('common.resetAll', 'Remise à zéro')}</button>
                            <button className="home-dhikr__reset-all" onClick={() => setIsEditingDhikr(true)}>⚙️ Éditer</button>
                        </div>
                    )}
                </div>

                <div ref={dhikrGroupRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
                    <LayoutGroup>
                        <div className="home-dhikr__flex-container" style={{ listStyle: 'none', padding: '4px', margin: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {dhikr.allItems.map(d => {
                                const count = dhikr.getCount(d.id);
                                const isUnlimited = d.target === 0;
                                const series = !isUnlimited && d.target > 0 ? Math.floor(count / d.target) : 0;
                                const countInSeries = dhikr.getCountInSeries(d.id);
                                const isDone = d.target > 0 && count >= d.target;
                                const progress = d.target > 0 ? ((countInSeries / d.target) * 100) : 0;
                                return (
                                    <motion.div
                                        key={d.id}
                                        layout
                                        className="dhikr-draggable"
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            zIndex: 1,
                                            width: 'calc(50% - 10px)',
                                            height: '110px'
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 40,
                                            layout: { duration: 0.3 }
                                        }}
                                    >
                                        <div
                                            className={`dhikr-card ${isDone ? 'dhikr-card--done' : ''} ${isEditingDhikr ? 'dhikr-card--editing' : ''}`}
                                            onClick={() => { if (!isEditingDhikr) dhikr.tap(d.id); }}
                                            onTouchStart={handleTouchStartDhikr}
                                            onTouchEnd={handleTouchEndDhikr}
                                            onTouchMove={handleTouchEndDhikr}
                                            onMouseDown={handleTouchStartDhikr}
                                            onMouseUp={handleTouchEndDhikr}
                                            onMouseLeave={handleTouchEndDhikr}
                                            style={{
                                                '--dhikr-color': d.color,
                                                cursor: isEditingDhikr ? 'default' : 'pointer',
                                                userSelect: 'none'
                                            } as React.CSSProperties}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            {series > 0 && <span className="dhikr-card__series">{series}×</span>}
                                            <span className="dhikr-card__daily">{d.daily}</span>
                                            <span className="dhikr-card__emoji">{d.emoji}</span>
                                            <span className="dhikr-card__ar">{formatDivineNames(d.text)}</span>
                                            <span className="dhikr-card__fr">{formatDivineNames(d.textFr)}</span>
                                            <span className="dhikr-card__desc">{formatDivineNames(d.descFr)}</span>
                                            <span className="dhikr-card__count">{isUnlimited ? count : `${countInSeries}/${d.target}`}</span>
                                            {!isUnlimited && <div className="dhikr-card__bar"><div className="dhikr-card__bar-fill" style={{ width: `${progress}%` }} /></div>}
                                            {count > 0 && <button className="dhikr-card__reset" onClick={(e) => { e.stopPropagation(); dhikr.reset(d.id); }} title="Réinitialiser"><RotateCcw size={14} /></button>}
                                            <AnimatePresence>
                                                {isEditingDhikr && (
                                                    <>
                                                        <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="dhikr-card__delete ios-delete-badge" onClick={(e) => { e.stopPropagation(); dhikr.removeDhikr(d.id); }} title="Supprimer">
                                                            <X size={12} strokeWidth={3} />
                                                        </motion.button>
                                                        
                                                        <div className="dhikr-card__arrows" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => moveDhikr(d.id, -2)} className="arrow-btn up"><ChevronUp size={16} /></button>
                                                            <div className="horizontal-arrows">
                                                                <button onClick={() => moveDhikr(d.id, -1)} className="arrow-btn left"><ChevronLeft size={16} /></button>
                                                                <button onClick={() => moveDhikr(d.id, 1)} className="arrow-btn right"><ChevronRight size={16} /></button>
                                                            </div>
                                                            <button onClick={() => moveDhikr(d.id, 2)} className="arrow-btn down"><ChevronDown size={16} /></button>
                                                        </div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {!isEditingDhikr && (
                                <button className="dhikr-card dhikr-card--add" onClick={() => setShowAddDuaa(true)} style={{ width: 'calc(50% - 5px)', height: '110px', '--dhikr-color': '#666' } as React.CSSProperties}>
                                    <span className="dhikr-card__emoji"><Plus size={24} /></span>
                                    <span className="dhikr-card__fr">Ajouter une duaa</span>
                                    <span className="dhikr-card__desc">Invocation personnelle</span>
                                </button>
                            )}
                        </div>
                    </LayoutGroup>
                </div>
            </div>

            {showAddDuaa && (
                <div className="duaa-modal-overlay" onClick={() => setShowAddDuaa(false)}>
                    <div className="duaa-modal" onClick={e => e.stopPropagation()}>
                        <div className="duaa-modal__header">
                            <h3>Ajouter une invocation</h3>
                            <button onClick={() => setShowAddDuaa(false)}><X size={20} /></button>
                        </div>
                        <div className="duaa-modal__body">
                            <label>Texte arabe (optionnel)</label>
                            <input dir="rtl" placeholder="ادخل الدعاء بالعربية" value={newDuaa.text} onChange={e => setNewDuaa(p => ({ ...p, text: e.target.value }))} />
                            <label>Texte français / phonétique</label>
                            <input placeholder="Ex: Allahumma inni as'aluka..." value={newDuaa.textFr} onChange={e => setNewDuaa(p => ({ ...p, textFr: e.target.value }))} />
                            <label>Description</label>
                            <input placeholder="Ex: Doua pour la science" value={newDuaa.descFr} onChange={e => setNewDuaa(p => ({ ...p, descFr: e.target.value }))} />
                            <label>Objectif quotidien (0 = illimité)</label>
                            <input type="number" min="0" value={newDuaa.target} onChange={e => setNewDuaa(p => ({ ...p, target: parseInt(e.target.value) || 0 }))} />
                            <div className="duaa-modal__emojis">
                                {CUSTOM_EMOJIS.map(e => <button key={e} className={newDuaa.emoji === e ? 'active' : ''} onClick={() => setNewDuaa(p => ({ ...p, emoji: e }))}>{e}</button>)}
                            </div>
                        </div>
                        <button className="duaa-modal__submit" disabled={!newDuaa.textFr.trim()} onClick={() => {
                            const target = newDuaa.target;
                            dhikr.addCustom({ id: `custom_${Date.now()}`, text: newDuaa.text || newDuaa.textFr, textFr: newDuaa.textFr, descFr: newDuaa.descFr, target, daily: target > 0 ? `${target}×/jour` : '∞ illimité', color: CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)], emoji: newDuaa.emoji, isCustom: true });
                            setNewDuaa({ text: '', textFr: '', descFr: '', target: 0, emoji: '🤲' });
                            setShowAddDuaa(false);
                        }}>Ajouter</button>
                    </div>
                </div>
            )}

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

            {showIslamicCalendar && (
                <div className="duaa-modal-overlay" onClick={() => setShowIslamicCalendar(false)} style={{ zIndex: 10000 }}>
                    <div className="duaa-modal duaa-modal--calendar" onClick={e => e.stopPropagation()} style={{ background: '#1a1a2e', boxShadow: 'none' }}>
                        <div className="duaa-modal__header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} color="#c9a84c" />
                                Calendrier Islamique
                            </h3>
                            <button onClick={() => setShowIslamicCalendar(false)} style={{ padding: '8px', color: 'var(--text-main)', display: 'flex' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="duaa-modal__scrollable">
                            <IslamicCalendar initiallyExpanded={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
