/**
 * PrayerTimesPage — Advanced Fiqh Module (Sprint 3)
 * Replaces the old AlAdhan API-based page with local computation + fiqh windows.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronLeft, ChevronRight, MapPin, Bell, Clock, Sun, Moon, AlertTriangle, Info, RefreshCw, Compass, Trophy, Navigation, Check } from 'lucide-react';
import { usePrayerStore } from '../stores/prayerStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
    computeDay, computeStandard, compareWithStandard, formatDate, type DayResult,
    ANGLE_PRESETS, getHijriDate, PRAYER_NAMES_FR, SALAT_KEYS
} from '../lib/prayerEngine';
import { computeWindows, formatWindow, formatIshaWindow, type FiqhWindows } from '../lib/windowsEngine';
import { isHighLatitude, getHighLatWarning } from '../lib/highLatResolver';
import { schedulePrayerNotifications, hashSettings, cancelAllScheduled } from '../lib/prayerNotificationScheduler';
import { updatePushPreferences, updatePushLocation } from '../lib/notificationService';
// PrayerCalendarModal removed — replaced by Sunnan Rawatib tracker
import { LocationSearchModal } from '../components/Prayer/LocationSearchModal';
import { IslamicCalendar } from '../components/Prayer/IslamicCalendar';
import { SideMenu } from '../components/Navigation/SideMenu';
import { resolveCoords } from '../lib/locationService';
import './PrayerTimesPage.css';

// ─── Constants ───────────────────────────────────────────

const PRAYER_NAMES_AR: Record<string, string> = {
    fajr: 'الصبح', sunrise: 'الشروق', dhuhr: 'الظهر',
    asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};

const PRAYER_EMOJIS: Record<string, string> = {
    fajr: '🌅', sunrise: '☀️', dhuhr: '🌤️',
    asr: '🌇', maghrib: '🌆', isha: '🌙',
};

const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

// ─── Sunnan Rawatib Data ─────────────────────────────────

interface SunnahEntry {
    prayer: string;
    label: string;
    labelAr: string;
    emoji: string;
    before: number; // rak'at avant
    after: number;  // rak'at après
    muakkadah: boolean; // confirmée (prioritaire)
    note?: string;
}

const SUNNAN_RAWATIB: SunnahEntry[] & { noteKey?: string }[] = [
    { prayer: 'fajr', label: 'Fajr', labelAr: 'الصبح', emoji: '🌅', before: 2, after: 0, muakkadah: true, note: 'Les plus confirmées de toutes les Sunnan', noteKey: 'mostConfirmed' },
    { prayer: 'dhuhr', label: 'Dhouhr', labelAr: 'الظهر', emoji: '🌤️', before: 4, after: 2, muakkadah: true },
    { prayer: 'asr', label: 'Asr', labelAr: 'العصر', emoji: '🌇', before: 0, after: 0, muakkadah: false, note: 'Pas de Sunna Mu\'akkadah', noteKey: 'noMuakkadah' },
    { prayer: 'maghrib', label: 'Maghrib', labelAr: 'المغرب', emoji: '🌆', before: 0, after: 2, muakkadah: true },
    { prayer: 'isha', label: 'Ishaa', labelAr: 'العشاء', emoji: '🌙', before: 0, after: 2, muakkadah: true, note: '+ Witr (1 à 11 rak\'at)', noteKey: 'witrNote' },
];

const TOTAL_MUAKKADAH_RAKAAT = SUNNAN_RAWATIB
    .filter(s => s.muakkadah)
    .reduce((sum, s) => sum + s.before + s.after, 0); // = 12

// ─── Nawafil Data (other categories) ───────────────────

interface NafilEntry {
    id: string;
    name: string;
    nameAr: string;
    emoji: string;
    rakaat: string;
    desc: string;
}

const PRIERES_NOCTURNES: NafilEntry[] = [
    { id: 'witr', name: 'Witr', nameAr: 'الوتر', emoji: '🌙', rakaat: '1, 3, 5, 7 ou 11', desc: 'Après Isha — très recommandée, quasi-obligatoire' },
    { id: 'tahajjud', name: 'Tahajjud', nameAr: 'التهجد', emoji: '🌃', rakaat: '2 par 2 + Witr', desc: 'Dernier tiers de la nuit — la meilleure après les obligatoires' },
    { id: 'tarawih', name: 'Tarawih', nameAr: 'التراويح', emoji: '✨', rakaat: '8 ou 20', desc: 'Après Isha, spécifique au Ramadan' },
];

const PRIERES_MOMENT: NafilEntry[] = [
    { id: 'ishraq', name: 'Ishraq', nameAr: 'الإشراق', emoji: '☀️', rakaat: '2', desc: '~15-20 min après le lever du soleil' },
    { id: 'doha', name: 'Doha', nameAr: 'الضحى', emoji: '🌞', rakaat: '2 à 12', desc: 'Matinée (entre lever du soleil et Dhouhr)' },
];

const PRIERES_CAUSE: NafilEntry[] = [
    { id: 'istikharah', name: 'Istikhârah', nameAr: 'الاستخارة', emoji: '🧩', rakaat: '2', desc: 'Avant une décision importante' },
    { id: 'tawbah', name: 'Tawbah', nameAr: 'التوبة', emoji: '🙏', rakaat: '2', desc: 'Repentir sincère' },
    { id: 'hajah', name: 'Hâjah', nameAr: 'الحاجة', emoji: '🤲', rakaat: '2', desc: 'Besoin ou demande' },
    { id: 'shukr', name: 'Shukr', nameAr: 'الشكر', emoji: '💚', rakaat: '2', desc: 'Gratitude envers Allah' },
    { id: 'tahiyyat', name: 'Tahiyyat al-Masjid', nameAr: 'تحية المسجد', emoji: '🕌', rakaat: '2', desc: 'En entrant à la mosquée' },
    { id: 'wudu', name: 'Sunnat al-Woudou', nameAr: 'سنة الوضوء', emoji: '💧', rakaat: '2', desc: 'Après les ablutions' },
    { id: 'kusuf', name: 'Kusuf / Khusuf', nameAr: 'الكسوف', emoji: '🌑', rakaat: '2 (spéciales)', desc: 'Éclipse solaire ou lunaire' },
    { id: 'istisqaa', name: 'Istisqâ', nameAr: 'الاستسقاء', emoji: '🌧️', rakaat: '2', desc: 'Demande de pluie' },
];

// ─── Sunnan Tracker Hook ─────────────────────────────────

function useSunnanTracker() {
    const todayKey = `sunnan-${new Date().toISOString().split('T')[0]}`;
    const [checked, setChecked] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const saved = localStorage.getItem(todayKey);
        if (saved) {
            try { setChecked(JSON.parse(saved)); } catch { /* ignore */ }
        }
    }, [todayKey]);

    const toggle = useCallback((key: string) => {
        setChecked(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(todayKey, JSON.stringify(next));
            return next;
        });
    }, [todayKey]);

    const isChecked = useCallback((key: string) => !!checked[key], [checked]);

    const doneRakaat = SUNNAN_RAWATIB.reduce((sum, s) => {
        let r = 0;
        if (s.before > 0 && checked[`${s.prayer}-before`]) r += s.before;
        if (s.after > 0 && checked[`${s.prayer}-after`]) r += s.after;
        return sum + r;
    }, 0);

    return { toggle, isChecked, doneRakaat };
}

// ─── Theme Helper ────────────────────────────────────────

function getThemeClass(nextPrayerName: string): string {
    const p = nextPrayerName.toLowerCase();
    if (p.includes('fajr')) return 'theme--fajr';
    if (p.includes('dhuhr')) return 'theme--dhuhr';
    if (p.includes('asr')) return 'theme--asr';
    if (p.includes('maghrib')) return 'theme--maghrib';
    if (p.includes('isha')) return 'theme--isha';
    return 'theme--default';
}

// ─── Radial Progress Component ───────────────────────────

function RadialProgress({ progress }: { progress: number }) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="radial-progress-container">
            <svg width="44" height="44" viewBox="0 0 44 44">
                <circle
                    className="radial-progress-bg"
                    cx="22" cy="22" r={radius}
                    fill="none" strokeWidth="3"
                />
                <circle
                    className="radial-progress-value"
                    cx="22" cy="22" r={radius}
                    fill="none" strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                />
            </svg>
            <div className="radial-progress-text">{Math.round(progress)}%</div>
        </div>
    );
}

// ─── Express Qibla Component ───────────────────────────

function ExpressQibla({ lat, lng }: { lat: number, lng: number }) {
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;

    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
    const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

    const dLng = kaabaLngRad - lngRad;
    const x = Math.sin(dLng);
    const y = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLng);

    let qibla = (Math.atan2(x, y) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;

    return (
        <div className="express-qibla">
            <div className="express-qibla__dial">
                <Compass size={16} />
                <div className="express-qibla__arrow" style={{ transform: `rotate(${qibla}deg)` }}>
                    <Navigation size={12} fill="currentColor" />
                </div>
            </div>
            <div className="express-qibla__text">Qibla {Math.round(qibla)}°</div>
        </div>
    );
}


// ─── Component ───────────────────────────────────────────

export function PrayerTimesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    // Subscribe only to the specific slices we display in JSX
    const cityName = usePrayerStore((s) => s.cityName);
    const lat = usePrayerStore((s) => s.lat);
    const lng = usePrayerStore((s) => s.lng);
    const settings = usePrayerStore((s) => s.settings);
    const daruriSobhEnabled = useNotificationStore((s) => s.daruriSobhEnabled);
    const daruriAsrEnabled = useNotificationStore((s) => s.daruriAsrEnabled);
    const akhirIshaEnabled = useNotificationStore((s) => s.akhirIshaEnabled);
    const setDaruriSobhEnabled = useNotificationStore((s) => s.setDaruriSobhEnabled);
    const setDaruriAsrEnabled = useNotificationStore((s) => s.setDaruriAsrEnabled);
    const setAkhirIshaEnabled = useNotificationStore((s) => s.setAkhirIshaEnabled);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showComparator, setShowComparator] = useState(false);
    const [showTransparency, setShowTransparency] = useState(false);
    const sunnan = useSunnanTracker();
    const [showNawafil, setShowNawafil] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [dayResult, setDayResult] = useState<DayResult | null>(null);
    const [windows, setWindows] = useState<FiqhWindows | null>(null);
    const [deltas, setDeltas] = useState<Record<string, number> | null>(null);
    const [countdown, setCountdown] = useState('');
    const [nextPrayerName, setNextPrayerName] = useState('');
    const [progressValue, setProgressValue] = useState(0);
    const [hijriDateLabel, setHijriDateLabel] = useState('');

    const shouldOpenCalendar = location.state?.openIslamicCalendar;

    useEffect(() => {
        if (shouldOpenCalendar) {
            setTimeout(() => {
                const el = document.getElementById('islamic-calendar');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300); // Wait for render
        }
    }, [shouldOpenCalendar]);

    const themeClass = getThemeClass(nextPrayerName);

    // Keep a ref to avoid stale closures but NOT in dependency arrays
    const computeIdRef = useRef(0);

    // ─── Compute times for selected date ──────────────────

    const computeTimes = async () => {
        const id = ++computeIdRef.current; // debounce: only latest wins
        setLoading(true);
        setError(null);

        try {
            const { lat: cLat, lng: cLng } = await resolveCoords();

            // If a newer compute started, bail out
            if (id !== computeIdRef.current) return;

            const currentSettings = usePrayerStore.getState().settings;

            // Compute today
            const result = computeDay(selectedDate, cLat, cLng, currentSettings);
            setDayResult(result);

            // Compute tomorrow for night duration
            const tomorrow = new Date(selectedDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowResult = computeDay(tomorrow, cLat, cLng, currentSettings);

            // Compute fiqh windows
            const w = computeWindows(result.times, tomorrowResult.times.fajr, currentSettings);
            setWindows(w);

            // Compute comparison deltas
            const standard = computeStandard(selectedDate, cLat, cLng);
            const d = compareWithStandard(result.times, standard);
            setDeltas(d);

            // Schedule notifications (only for today)
            const today = new Date();
            if (formatDate(selectedDate) === formatDate(today)) {
                const notifState = useNotificationStore.getState();
                const settHash = hashSettings(currentSettings);
                schedulePrayerNotifications(w, result.date, cLat, cLng, settHash, {
                    daruriSobhEnabled: notifState.daruriSobhEnabled,
                    daruriAsrEnabled: notifState.daruriAsrEnabled,
                    akhirIshaEnabled: notifState.akhirIshaEnabled,
                });

                // Also sync coordinates with Supabase Push Notification service
                updatePushLocation(cLat, cLng);
            }

            // Cache range (fire-and-forget)
            usePrayerStore.getState().computeAndCache(selectedDate, 7);
        } catch (err) {
            if (id !== computeIdRef.current) return;
            console.error('[Prayer] Computation error:', err);
            setError('Erreur de calcul. Vérifiez votre connexion et réessayez.');
        } finally {
            if (id === computeIdRef.current) {
                setLoading(false);
            }
        }
    };

    // Re-run when selectedDate, settings or location change
    useEffect(() => {
        computeTimes();
        return () => cancelAllScheduled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, settings, lat, lng]);

    // ─── Countdown timer ──────────────────────────────────

    useEffect(() => {
        if (!dayResult) return;

        const update = () => {
            const now = new Date();
            const nowMs = now.getTime();

            setHijriDateLabel(getHijriDate(now));

            let nextP = 'fajr';
            let nextPMs = 0;
            let prevPMs = 0;

            // Find next prayer and previous prayer for progress bar
            for (let i = 0; i < SALAT_KEYS.length; i++) {
                const key = SALAT_KEYS[i];
                const t = dayResult.times[key];
                if (t.getTime() > nowMs) {
                    nextP = key;
                    nextPMs = t.getTime();
                    if (i > 0) {
                        prevPMs = dayResult.times[SALAT_KEYS[i - 1]].getTime();
                    } else {
                        // Previous was Isha yesterday
                        const yesterday = new Date(now);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayTimes = computeDay(yesterday, lat || 0, usePrayerStore.getState().lng || 0, settings).times;
                        prevPMs = yesterdayTimes.isha.getTime();
                    }
                    break;
                }
            }

            // If all prayers passed (after Isha), next is Fajr tomorrow
            if (nextPMs === 0) {
                nextP = 'fajr';
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowTimes = computeDay(tomorrow, lat || 0, usePrayerStore.getState().lng || 0, settings).times;
                nextPMs = tomorrowTimes.fajr.getTime();
                prevPMs = dayResult.times.isha.getTime();
            }

            setNextPrayerName(nextP);

            // Countdown string
            const diffMs = nextPMs - nowMs;
            const diffSec = Math.floor(diffMs / 1000);
            const hrs = Math.floor(diffSec / 3600);
            const mins = Math.floor((diffSec % 3600) / 60);
            const secs = diffSec % 60;

            const countdownStr = hrs > 0
                ? `${hrs}h ${mins}m ${secs}s`
                : `${mins}m ${secs}s`;
            setCountdown(countdownStr);

            // Progress percentage
            const totalWindow = nextPMs - prevPMs;
            const elapsed = nowMs - prevPMs;
            const pct = Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));
            setProgressValue(pct);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [dayResult, lat, settings]);

    // ─── Day navigation ───────────────────────────────────

    const goDay = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d);
    };

    const isToday = useMemo(() =>
        formatDate(selectedDate) === formatDate(new Date()),
        [selectedDate]);

    const dateLabel = useMemo(() => {
        if (isToday) return "Aujourd'hui";
        return selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long',
        });
    }, [selectedDate, isToday]);

    // ─── High latitude warning ────────────────────────────

    const highLatWarning = useMemo(() => {
        if (!lat || !dayResult) return null;
        return getHighLatWarning(lat, dayResult.times);
    }, [lat, dayResult]);

    // ─── Active rules (transparency) ─────────────────────

    const activeRules = useMemo(() => {
        const s = settings;
        const preset = ANGLE_PRESETS[s.anglePreset];
        const rules = [
            `Angles : ${preset.label} (Fajr ${s.fajrAngle}° / Isha ${s.ishaAngle}°)`,
            `Asr : ombre × ${s.asrShadow}`,
            `Akhir Isha : ${s.ishaIkhtiyari === 'HALF_NIGHT' ? '1/2 nuit' : '1/3 nuit'}`,
        ];
        if (s.highLatFajrIsha !== 'NONE') {
            rules.push(`Haute latitude : ${s.highLatFajrIsha.replace(/_/g, ' ')}`);
        }
        const adj = Object.entries(s.adjustmentsMin).filter(([, v]) => v !== 0);
        if (adj.length > 0) {
            rules.push(`Ajustements : ${adj.map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}min`).join(', ')}`);
        }
        return rules;
    }, [settings]);

    // ─── Render ───────────────────────────────────────────

    if (loading) {
        return (
            <div className="prayer-page">
                <div className="prayer-loading">
                    <div className="prayer-loading__spinner" />
                    <span>{t('prayer.calculating')}</span>
                </div>
            </div>
        );
    }

    if (error || !dayResult) {
        return (
            <div className="prayer-page">
                <div className="prayer-error">
                    <AlertTriangle size={32} />
                    <p>{error || t('prayer.impossible')}</p>
                    <button onClick={() => { setError(null); computeTimes(); }}>
                        <RefreshCw size={16} /> {t('prayer.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`prayer-times-page ${themeClass}`}>
            {/* Header / Hero */}
            <div className="prayer-hero">
                <div className="prayer-hero__top">
                    <button className="prayer-hero__back" onClick={() => navigate('/')}>
                        <ChevronLeft size={24} />
                    </button>
                    <button className="prayer-hero__location" onClick={() => setShowLocationModal(true)}>
                        <MapPin size={14} />
                        <span>{cityName || 'Localisation...'}</span>
                    </button>
                    <button className="prayer-hero__settings-btn" onClick={() => navigate('/prayer-settings')}>
                        <Settings size={22} />
                    </button>
                </div>

                <div className="prayer-hero__main">
                    <div className="prayer-hero__countdown-box">
                        <RadialProgress progress={progressValue} />
                        <div className="prayer-hero__countdown-text">
                            <span className="prayer-hero__next-label">{PRAYER_NAMES_FR[nextPrayerName] || nextPrayerName} dans</span>
                            <span className="prayer-hero__timer">{countdown || '--:--'}</span>
                        </div>
                    </div>

                    <div className="prayer-hero__hijri-box">
                        <span className="prayer-hero__hijri">{hijriDateLabel}</span>
                        {lat && usePrayerStore.getState().lng && (
                            <ExpressQibla lat={lat} lng={usePrayerStore.getState().lng!} />
                        )}
                    </div>
                </div>
            </div>

            <div className="prayer-content">
                {/* Secondary Actions Row */}
                <div className="prayer-actions-row">
                    <button className="prayer-action-card" onClick={() => navigate('/adhkar')}>
                        <Trophy size={18} />
                        <span>{t('prayer.adhkarAfter')}</span>
                    </button>
                    <button className={`prayer-action-card prayer-action-card--badge ${showNawafil ? 'prayer-action-card--active' : ''}`} onClick={() => setShowNawafil(!showNawafil)}>
                        <Sun size={18} />
                        <span>{t('prayer.nawafil')}</span>
                        <span className="prayer-action-badge">{sunnan.doneRakaat}/{TOTAL_MUAKKADAH_RAKAAT}</span>
                    </button>
                </div>

                {/* Islamic Calendar */}
                <IslamicCalendar initiallyExpanded={shouldOpenCalendar} />

                {/* Nawafil Section (collapsible) */}
                {showNawafil && (
                    <div className="nawafil-panel">

                        {/* 1. Sunnan Rawatib */}
                        <div className="sunnan-section">
                            <div className="sunnan-section__title">
                                <Sun size={14} />
                                <span>{t('nawafil.sunnanRawatib')}</span>
                                <span className="sunnan-section__badge">
                                    {sunnan.doneRakaat}/{TOTAL_MUAKKADAH_RAKAAT} {t('nawafil.rakaatCount')}
                                </span>
                            </div>
                            <div className="sunnan-section__subtitle">
                                {t('nawafil.confirmed12')}
                            </div>
                            <div className="sunnan-grid">
                                {SUNNAN_RAWATIB.map(s => {
                                    const beforeKey = `${s.prayer}-before`;
                                    const afterKey = `${s.prayer}-after`;
                                    const hasBefore = s.before > 0;
                                    const hasAfter = s.after > 0;
                                    const beforeDone = sunnan.isChecked(beforeKey);
                                    const afterDone = sunnan.isChecked(afterKey);
                                    const allDone = (!hasBefore || beforeDone) && (!hasAfter || afterDone);
                                    const noSunna = !hasBefore && !hasAfter;

                                    return (
                                        <div key={s.prayer} className={`sunnan-card ${allDone && !noSunna ? 'sunnan-card--done' : ''} ${noSunna ? 'sunnan-card--empty' : ''}`}>
                                            <div className="sunnan-card__header">
                                                <span className="sunnan-card__emoji">{s.emoji}</span>
                                                <span className="sunnan-card__name">{t(`prayer.${s.prayer}`, s.label)}</span>
                                                {s.muakkadah && <span className="sunnan-card__star">⭐</span>}
                                            </div>
                                            {noSunna ? (
                                                <div className="sunnan-card__empty">—</div>
                                            ) : (
                                                <div className="sunnan-card__checks">
                                                    {hasBefore && (
                                                        <button
                                                            className={`sunnan-check ${beforeDone ? 'sunnan-check--done' : ''}`}
                                                            onClick={() => sunnan.toggle(beforeKey)}
                                                        >
                                                            {beforeDone ? <Check size={12} /> : <span className="sunnan-check__circle" />}
                                                            <span>{s.before} {t('nawafil.beforePrayer')}</span>
                                                        </button>
                                                    )}
                                                    {hasAfter && (
                                                        <button
                                                            className={`sunnan-check ${afterDone ? 'sunnan-check--done' : ''}`}
                                                            onClick={() => sunnan.toggle(afterKey)}
                                                        >
                                                            {afterDone ? <Check size={12} /> : <span className="sunnan-check__circle" />}
                                                            <span>{s.after} {t('nawafil.afterPrayer')}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {s.note && <div className="sunnan-card__note">{t(`nawafil.${(s as any).noteKey}`, s.note)}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Prières Nocturnes */}
                        <div className="nawafil-category">
                            <div className="nawafil-category__title">
                                <Moon size={14} />
                                <span>{t('nawafil.nocturnal')}</span>
                            </div>
                            <div className="nawafil-list">
                                {PRIERES_NOCTURNES.map(p => (
                                    <div key={p.id} className="nawafil-item">
                                        <span className="nawafil-item__emoji">{p.emoji}</span>
                                        <div className="nawafil-item__content">
                                            <div className="nawafil-item__header">
                                                <span className="nawafil-item__name">{t(`nawafil.${p.id}`, p.name)}</span>
                                                <span className="nawafil-item__ar">{p.nameAr}</span>
                                            </div>
                                            <div className="nawafil-item__rakaat">{p.rakaat} {t('nawafil.rakaatCount')}</div>
                                            <div className="nawafil-item__desc">{t(`nawafil.${p.id}Desc`, p.desc)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Prières liées à un moment */}
                        <div className="nawafil-category">
                            <div className="nawafil-category__title">
                                <Clock size={14} />
                                <span>{t('nawafil.momentLinked')}</span>
                            </div>
                            <div className="nawafil-list">
                                {PRIERES_MOMENT.map(p => (
                                    <div key={p.id} className="nawafil-item">
                                        <span className="nawafil-item__emoji">{p.emoji}</span>
                                        <div className="nawafil-item__content">
                                            <div className="nawafil-item__header">
                                                <span className="nawafil-item__name">{t(`nawafil.${p.id}`, p.name)}</span>
                                                <span className="nawafil-item__ar">{p.nameAr}</span>
                                            </div>
                                            <div className="nawafil-item__rakaat">{p.rakaat} {t('nawafil.rakaatCount')}</div>
                                            <div className="nawafil-item__desc">{t(`nawafil.${p.id}Desc`, p.desc)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Prières liées à une cause */}
                        <div className="nawafil-category">
                            <div className="nawafil-category__title">
                                <Info size={14} />
                                <span>{t('nawafil.causeLinked')}</span>
                            </div>
                            <div className="nawafil-list">
                                {PRIERES_CAUSE.map(p => (
                                    <div key={p.id} className="nawafil-item">
                                        <span className="nawafil-item__emoji">{p.emoji}</span>
                                        <div className="nawafil-item__content">
                                            <div className="nawafil-item__header">
                                                <span className="nawafil-item__name">{t(`nawafil.${p.id}`, p.name)}</span>
                                                <span className="nawafil-item__ar">{p.nameAr}</span>
                                            </div>
                                            <div className="nawafil-item__rakaat">{p.rakaat} {t('nawafil.rakaatCount')}</div>
                                            <div className="nawafil-item__desc">{t(`nawafil.${p.id}Desc`, p.desc)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* High latitude warning */}
                {highLatWarning && (
                    <div className="prayer-warning">
                        <AlertTriangle size={14} />
                        <span>{highLatWarning}</span>
                    </div>
                )}

                <div className="prayer-list">
                    <div className="prayer-list__title">
                        <Clock size={14} />
                        <span>{t('prayer.todayTimes')}</span>
                    </div>
                    {PRAYER_KEYS.map((key) => {
                        const isNext = nextPrayerName === key && isToday;
                        const prayerTime = dayResult.times[key];
                        const isPassed = isToday && new Date() > prayerTime && !isNext;

                        return (
                            <div
                                key={key}
                                className={`prayer-row ${isNext ? 'prayer-row--active' : ''} ${isPassed ? 'prayer-row--passed' : ''} ${key === 'sunrise' ? 'prayer-row--sunrise' : ''}`}
                            >
                                <div className="prayer-row__left">
                                    <span className="prayer-row__emoji">{PRAYER_EMOJIS[key]}</span>
                                    <div className="prayer-row__names">
                                        <span className="prayer-row__name">{t(`prayer.${key}`, PRAYER_NAMES_FR[key])}</span>
                                        <span className="prayer-row__name-ar">{PRAYER_NAMES_AR[key]}</span>
                                    </div>
                                </div>
                                <div className="prayer-row__time-box">
                                    <span className="prayer-row__time">{dayResult.formattedTimes[key]}</span>
                                    {isNext && <span className="prayer-row__active-badge">{t('prayer.nextPrayer', 'PROCHAINE PRIÈRE')}</span>}
                                </div>
                            </div>
                        );
                    })}

                    {/* Extra Prayers (Tahajjud/Ishraq) */}
                    {(settings.showTahajjud || settings.showIshraq) && (
                        <div className="prayer-extra-section">
                            <div className="prayer-extra-divider">Options</div>
                            {settings.showTahajjud && dayResult.formattedTimes.tahajjud && (
                                <div className="prayer-row prayer-row--extra">
                                    <div className="prayer-row__left">
                                        <span className="prayer-row__emoji">🌙</span>
                                        <div className="prayer-row__names">
                                            <span className="prayer-row__name">Tahajjud</span>
                                            <span className="prayer-row__desc">Dernier tiers</span>
                                        </div>
                                    </div>
                                    <span className="prayer-row__time">{dayResult.formattedTimes.tahajjud}</span>
                                </div>
                            )}
                            {settings.showIshraq && dayResult.formattedTimes.ishraq && (
                                <div className="prayer-row prayer-row--extra">
                                    <div className="prayer-row__left">
                                        <span className="prayer-row__emoji">☀️</span>
                                        <div className="prayer-row__names">
                                            <span className="prayer-row__name">Ishraq</span>
                                            <span className="prayer-row__desc">15m après Shuruq</span>
                                        </div>
                                    </div>
                                    <span className="prayer-row__time">{dayResult.formattedTimes.ishraq}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="prayer-page-footer">
                    <div className="prayer-date-selector">
                        <button onClick={() => goDay(-1)} className="prayer-date-selector__btn">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="prayer-date-selector__label">{dateLabel}</span>
                        <button onClick={() => goDay(1)} className="prayer-date-selector__btn">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Fiqh Windows */}
                {windows && (
                    <div className="prayer-windows">
                        <div className="prayer-windows__title">
                            <Sun size={14} />
                            <span>Fenêtres Fiqh</span>
                        </div>

                        {/* Sobh */}
                        <div className="fiqh-card">
                            <div className="fiqh-card__header">
                                <span className="fiqh-card__emoji">🌅</span>
                                <span className="fiqh-card__name">Sobh (الصبح)</span>
                            </div>
                            {(() => {
                                const fw = formatWindow(windows.sobh);
                                return (
                                    <>
                                        <div className="fiqh-bar">
                                            <div className="fiqh-bar__segment fiqh-bar__segment--ikhtiyari" />
                                            <div className="fiqh-bar__segment fiqh-bar__segment--daruri" />
                                        </div>
                                        <div className="fiqh-times">
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--start" />
                                                <span>Début</span>
                                                <span className="fiqh-time__val">{fw.start}</span>
                                            </div>
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--ikhtiyari" />
                                                <span>Fin Ikhtiyârî (temps recommandé)</span>
                                                <span className="fiqh-time__val">{fw.endIkhtiyari}</span>
                                            </div>
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--daruri" />
                                                <span>Fin Darûrî (temps limite)</span>
                                                <span className="fiqh-time__val">{fw.endDaruri}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Asr */}
                        <div className="fiqh-card">
                            <div className="fiqh-card__header">
                                <span className="fiqh-card__emoji">🌇</span>
                                <span className="fiqh-card__name">Asr (العصر)</span>
                            </div>
                            {(() => {
                                const fw = formatWindow(windows.asr);
                                return (
                                    <>
                                        <div className="fiqh-bar">
                                            <div className="fiqh-bar__segment fiqh-bar__segment--ikhtiyari" />
                                            <div className="fiqh-bar__segment fiqh-bar__segment--daruri" />
                                        </div>
                                        <div className="fiqh-times">
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--start" />
                                                <span>Début</span>
                                                <span className="fiqh-time__val">{fw.start}</span>
                                            </div>
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--ikhtiyari" />
                                                <span>Fin Ikhtiyârî</span>
                                                <span className="fiqh-time__val">{fw.endIkhtiyari}</span>
                                            </div>
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--daruri" />
                                                <span>Fin Darûrî</span>
                                                <span className="fiqh-time__val">{fw.endDaruri}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Isha */}
                        <div className="fiqh-card">
                            <div className="fiqh-card__header">
                                <span className="fiqh-card__emoji">🌙</span>
                                <span className="fiqh-card__name">Isha (العشاء)</span>
                            </div>
                            {(() => {
                                const fw = formatIshaWindow(windows.isha);
                                return (
                                    <>
                                        <div className="fiqh-bar">
                                            <div className="fiqh-bar__segment fiqh-bar__segment--ikhtiyari" style={{ flex: 1 }} />
                                        </div>
                                        <div className="fiqh-times">
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--start" />
                                                <span>Début</span>
                                                <span className="fiqh-time__val">{fw.start}</span>
                                            </div>
                                            <div className="fiqh-time">
                                                <span className="fiqh-time__dot fiqh-time__dot--ikhtiyari" />
                                                <span>Akhir Isha (temps recommandé) ({settings.ishaIkhtiyari === 'HALF_NIGHT' ? '½ nuit' : '⅓ nuit'})</span>
                                                <span className="fiqh-time__val">{fw.endIkhtiyari}</span>
                                            </div>
                                        </div>
                                        <div className="fiqh-night">
                                            <Moon size={12} />
                                            <span>Nuit légale : {windows.nightDurationMin} min ({Math.floor(windows.nightDurationMin / 60)}h{(windows.nightDurationMin % 60).toString().padStart(2, '0')})</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Comparator */}
                <button className="prayer-section-toggle" onClick={() => setShowComparator(!showComparator)}>
                    <span>📊 Comparateur Standard</span>
                    <ChevronRight size={16} className={showComparator ? 'rotated' : ''} />
                </button>
                {showComparator && deltas && (
                    <div className="prayer-comparator">
                        <div className="prayer-comparator__info">
                            <Info size={12} />
                            <span>Différence avec Standard (MWL 18/17, Asr ×1)</span>
                        </div>
                        {SALAT_KEYS.map((key) => {
                            const d = deltas[key] || 0;
                            return (
                                <div key={key} className="comparator-row">
                                    <span className="comparator-row__name">{PRAYER_NAMES_FR[key]}</span>
                                    <span className={`comparator-row__delta ${d === 0 ? 'zero' : d > 0 ? 'positive' : 'negative'}`}>
                                        {d === 0 ? '=' : d > 0 ? `+${d} min` : `${d} min`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Transparency */}
                <button className="prayer-section-toggle" onClick={() => setShowTransparency(!showTransparency)}>
                    <span>🔍 Transparence</span>
                    <ChevronRight size={16} className={showTransparency ? 'rotated' : ''} />
                </button>
                {showTransparency && (
                    <div className="prayer-transparency">
                        <div className="prayer-transparency__title">Règles actives</div>
                        {activeRules.map((rule, i) => (
                            <div key={i} className="transparency-rule">
                                <span className="transparency-rule__dot" />
                                <span>{rule}</span>
                            </div>
                        ))}
                        {isHighLatitude(lat || 0) && (
                            <div className="transparency-rule transparency-rule--warning">
                                <AlertTriangle size={12} />
                                <span>Latitude élevée détectée ({lat?.toFixed(1)}°)</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Notification toggles */}
                <div className="prayer-notifs">
                    <div className="prayer-notifs__title">
                        <Bell size={14} />
                        <span>Notifications avancées</span>
                    </div>
                    <label className="prayer-notif-toggle">
                        <span>⚠️ Darûrî Sobh</span>
                        <input
                            type="checkbox"
                            checked={daruriSobhEnabled}
                            onChange={(e) => {
                                setDaruriSobhEnabled(e.target.checked);
                                updatePushPreferences({ daruriSobhEnabled: e.target.checked });
                            }}
                        />
                        <span className="toggle-slider" />
                    </label>
                    <label className="prayer-notif-toggle">
                        <span>⚠️ Darûrî Asr</span>
                        <input
                            type="checkbox"
                            checked={daruriAsrEnabled}
                            onChange={(e) => {
                                setDaruriAsrEnabled(e.target.checked);
                                updatePushPreferences({ daruriAsrEnabled: e.target.checked });
                            }}
                        />
                        <span className="toggle-slider" />
                    </label>
                    <label className="prayer-notif-toggle">
                        <span>🌙 Akhir Isha</span>
                        <input
                            type="checkbox"
                            checked={akhirIshaEnabled}
                            onChange={(e) => {
                                setAkhirIshaEnabled(e.target.checked);
                                updatePushPreferences({ akhirIshaEnabled: e.target.checked });
                            }}
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>

                {/* PrayerCalendarModal removed — replaced by Sunnan Rawatib */}

                <LocationSearchModal
                    isOpen={showLocationModal}
                    onClose={() => setShowLocationModal(false)}
                />

                <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
            </div>
        </div>
    );
}
