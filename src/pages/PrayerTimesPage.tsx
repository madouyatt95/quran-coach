/**
 * PrayerTimesPage — Advanced Fiqh Module (Sprint 3)
 * Replaces the old AlAdhan API-based page with local computation + fiqh windows.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronLeft, ChevronRight, MapPin, Bell, Clock, Sun, Moon, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { usePrayerStore } from '../stores/prayerStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
    computeDay, computeStandard, compareWithStandard, formatDate, type DayResult,
    ANGLE_PRESETS, getHijriDate, PRAYER_NAMES_FR, SALAT_KEYS
} from '../lib/prayerEngine';
import { computeWindows, formatWindow, formatIshaWindow, type FiqhWindows } from '../lib/windowsEngine';
import { isHighLatitude, getHighLatWarning } from '../lib/highLatResolver';
import { schedulePrayerNotifications, hashSettings, cancelAllScheduled } from '../lib/prayerNotificationScheduler';
import { updatePushPreferences } from '../lib/notificationService';
import { PrayerCalendarModal } from '../components/Prayer/PrayerCalendarModal';
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

// ─── Geolocation helper (standalone, no hooks) ───────────

async function resolveCoords(): Promise<{ lat: number; lng: number }> {
    // 1) Check store for existing coords
    const state = usePrayerStore.getState();
    if (state.lat != null && state.lng != null) {
        return { lat: state.lat, lng: state.lng };
    }

    // 2) Try browser geolocation (3s timeout — fast fail)
    try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        );
        const { latitude, longitude } = pos.coords;

        // Reverse geocode (non-blocking — don't await if slow)
        let city = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        let country = '';
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
                { signal: controller.signal }
            );
            clearTimeout(timer);
            const geo = await res.json();
            city = geo.city || geo.locality || city;
            country = geo.countryName || '';
        } catch { /* use coord fallback */ }

        usePrayerStore.getState().updateCoords(latitude, longitude, city, country);
        return { lat: latitude, lng: longitude };
    } catch {
        // 3) Fallback: Paris
        usePrayerStore.getState().updateCoords(48.8566, 2.3522, 'Paris', 'France');
        return { lat: 48.8566, lng: 2.3522 };
    }
}

// ─── Component ───────────────────────────────────────────

export function PrayerTimesPage() {
    const navigate = useNavigate();

    // Subscribe only to the specific slices we display in JSX
    const cityName = usePrayerStore((s) => s.cityName);
    const countryName = usePrayerStore((s) => s.countryName);
    const lat = usePrayerStore((s) => s.lat);
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
    const [showCalendar, setShowCalendar] = useState(false);
    const [dayResult, setDayResult] = useState<DayResult | null>(null);
    const [windows, setWindows] = useState<FiqhWindows | null>(null);
    const [deltas, setDeltas] = useState<Record<string, number> | null>(null);
    const [countdown, setCountdown] = useState('');
    const [nextPrayerName, setNextPrayerName] = useState('');
    const [progress, setProgress] = useState(0);
    const [hijriDateLabel, setHijriDateLabel] = useState('');

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

    // Re-run when selectedDate or settings change
    useEffect(() => {
        computeTimes();
        return () => cancelAllScheduled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, settings]);

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
            setProgress(pct);
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
                    <span>Calcul des horaires…</span>
                </div>
            </div>
        );
    }

    if (error || !dayResult) {
        return (
            <div className="prayer-page">
                <div className="prayer-error">
                    <AlertTriangle size={32} />
                    <p>{error || 'Impossible de calculer les horaires.'}</p>
                    <button onClick={() => { setError(null); computeTimes(); }}>
                        <RefreshCw size={16} /> Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="prayer-page">
            {/* Header */}
            <div className="prayer-header">
                <div className="prayer-header__top">
                    <div className="prayer-header__location">
                        <MapPin size={14} />
                        <span>{cityName || 'Localisation…'}</span>
                        {countryName && <span className="prayer-header__country">{countryName}</span>}
                    </div>
                    <button
                        className="prayer-header__settings-btn"
                        onClick={() => navigate('/prayer-settings')}
                        title="Réglages prières"
                    >
                        <Settings size={18} />
                    </button>
                </div>

                {/* Day navigation */}
                <div className="prayer-day-nav">
                    <button onClick={() => goDay(-1)} className="prayer-day-nav__btn">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="prayer-day-nav__center">
                        <span className="prayer-day-nav__label">{dateLabel}</span>
                        <div className="prayer-day-nav__hijri">{hijriDateLabel}</div>
                    </div>
                    <button onClick={() => goDay(1)} className="prayer-day-nav__btn">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Next Prayer Card */}
            {isToday && nextPrayerName && (
                <div className={`prayer-next prayer-next--${nextPrayerName}`}>
                    <div className="prayer-next__left">
                        <span className="prayer-next__emoji">{PRAYER_EMOJIS[nextPrayerName]}</span>
                        <div>
                            <div className="prayer-next__name">
                                {PRAYER_NAMES_FR[nextPrayerName]}
                                <span className="prayer-next__name-ar">{PRAYER_NAMES_AR[nextPrayerName]}</span>
                            </div>
                            <div className="prayer-next__label">Prochaine prière</div>
                        </div>
                    </div>
                    <div className="prayer-next__right">
                        <div className="prayer-next__time">{dayResult.formattedTimes[nextPrayerName]}</div>
                        <div className="prayer-next__countdown">
                            <Clock size={12} /> dans {countdown}
                        </div>
                        <div className="prayer-next__progress-wrap">
                            <div
                                className="prayer-next__progress-bar"
                                style={{ width: `${progress}%` }}
                            />
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

            {/* Prayer Times List */}
            <div className="prayer-list">
                <div className="prayer-list__title">
                    <div className="prayer-list__title-left">
                        <Clock size={14} />
                        <span>Horaires</span>
                    </div>
                    <button
                        className="prayer-list__month-btn"
                        onClick={() => setShowCalendar(true)}
                    >
                        Voir le mois
                    </button>
                </div>
                {PRAYER_KEYS.map((key) => (
                    <div
                        key={key}
                        className={`prayer-row ${nextPrayerName === key && isToday ? 'prayer-row--active' : ''} ${key === 'sunrise' ? 'prayer-row--sunrise' : ''}`}
                    >
                        <div className="prayer-row__left">
                            <span className="prayer-row__emoji">{PRAYER_EMOJIS[key]}</span>
                            <div className="prayer-row__names">
                                <span className="prayer-row__name">{PRAYER_NAMES_FR[key]}</span>
                                <span className="prayer-row__name-ar">{PRAYER_NAMES_AR[key]}</span>
                            </div>
                        </div>
                        <div className="prayer-row__time">{dayResult.formattedTimes[key]}</div>
                    </div>
                ))}
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

            {/* Month View Modal */}
            <PrayerCalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                lat={lat || 0}
                lng={usePrayerStore.getState().lng || 0}
                settings={settings}
            />

            <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
        </div>
    );
}
