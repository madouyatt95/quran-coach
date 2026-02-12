import { useState } from 'react';
import { ChevronDown, Check, Flame, BookOpen, Target, Calendar } from 'lucide-react';
import { useKhatmStore } from '../../stores/khatmStore';
import './KhatmTracker.css';

// Approximate Ramadan 1447 AH dates
const RAMADAN_START = '2026-02-18';
const RAMADAN_END = '2026-03-19';

function ProgressRing({ pct }: { pct: number }) {
    const r = 19;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="khatm-ring-container">
            <svg className="khatm-ring-svg" viewBox="0 0 48 48">
                <circle className="khatm-ring-bg" cx="24" cy="24" r={r} />
                <circle
                    className="khatm-ring-progress"
                    cx="24" cy="24" r={r}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="khatm-ring-text">{pct}%</div>
        </div>
    );
}

function getMotivation(pct: number, todayRead: number, dailyGoal: number): string {
    if (todayRead >= dailyGoal) return 'ما شاء الله ! Objectif atteint pour aujourd\'hui ! 🎉';
    if (dailyGoal - todayRead <= 3) return `Plus que ${dailyGoal - todayRead} page(s) ! Tu y es presque 💪`;
    if (pct >= 75) return 'Tu approches de la fin, courage ! 🤲';
    if (pct >= 50) return 'La moitié est faite, continue ! 📖';
    if (pct >= 25) return 'Bon début, reste régulier(e) 🌟';
    return 'بِسْمِ اللَّهِ – C\'est parti ! 🌙';
}

function SetupModal({ onClose }: { onClose: () => void }) {
    const { activate } = useKhatmStore();
    const [startDate, setStartDate] = useState(RAMADAN_START);
    const [endDate, setEndDate] = useState(RAMADAN_END);
    const [usePreset, setUsePreset] = useState(true);

    const handleStart = () => {
        const s = usePreset ? RAMADAN_START : startDate;
        const e = usePreset ? RAMADAN_END : endDate;
        if (s && e && s <= e) {
            activate(s, e);
            onClose();
        }
    };

    const isValid = usePreset || (startDate && endDate && startDate <= endDate);

    return (
        <>
            <div className="khatm-modal-backdrop" onClick={onClose} />
            <div className="khatm-modal">
                <h2>🌙 Objectif Khatm</h2>
                <p className="khatm-modal-desc">
                    Définissez votre période pour lire l'intégralité du Coran (604 pages).
                    L'objectif quotidien s'adaptera automatiquement à votre avancement.
                </p>

                {/* Ramadan Preset */}
                <div
                    className={`khatm-preset ${usePreset ? 'selected' : ''}`}
                    onClick={() => setUsePreset(true)}
                >
                    <span className="khatm-preset-icon">🌙</span>
                    <div className="khatm-preset-info">
                        <div className="khatm-preset-title">Ramadan 1447</div>
                        <div className="khatm-preset-dates">18 fév → 19 mars 2026 (30 jours)</div>
                    </div>
                    {usePreset && <Check size={20} color="#c9a84c" />}
                </div>

                {/* Custom dates */}
                <div
                    className={`khatm-preset ${!usePreset ? 'selected' : ''}`}
                    onClick={() => setUsePreset(false)}
                >
                    <span className="khatm-preset-icon">📅</span>
                    <div className="khatm-preset-info">
                        <div className="khatm-preset-title">Dates personnalisées</div>
                        <div className="khatm-preset-dates">Choisissez votre propre période</div>
                    </div>
                    {!usePreset && <Check size={20} color="#c9a84c" />}
                </div>

                {!usePreset && (
                    <div className="khatm-custom">
                        <div className="khatm-date-row">
                            <div className="khatm-date-field">
                                <label>Date de début</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="khatm-date-field">
                                <label>Date de fin</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    className="khatm-start-btn"
                    onClick={handleStart}
                    disabled={!isValid}
                >
                    🚀 Commencer le Khatm
                </button>
                <button className="khatm-cancel-btn" onClick={onClose}>
                    Annuler
                </button>
            </div>
        </>
    );
}

export function KhatmTracker() {
    const store = useKhatmStore();
    const [expanded, setExpanded] = useState(false);
    const [showSetup, setShowSetup] = useState(false);

    // Not active – show setup prompt
    if (!store.isActive) {
        return (
            <>
                <div className="khatm-setup-banner" onClick={() => setShowSetup(true)}>
                    <div className="khatm-setup-icon">🌙</div>
                    <div className="khatm-setup-text">Objectif Khatm</div>
                    <div className="khatm-setup-sub">Configurez votre lecture complète du Coran</div>
                </div>
                {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
            </>
        );
    }

    const progress = store.getOverallProgress();
    const dayNum = store.getDayNumber();
    const totalDays = store.getTotalDays();
    const todayRange = store.getTodayRange();
    const todayRead = store.getTodayRead();
    const dailyGoal = todayRange.end - todayRange.start + 1;
    const todayPct = Math.min(100, Math.round((todayRead / dailyGoal) * 100));
    const daysLeft = store.getDaysRemaining();
    const streak = store.getStreak();
    const adaptiveGoal = store.getDailyGoal();
    const motivation = getMotivation(progress.pct, todayRead, dailyGoal);

    return (
        <>
            <div className="khatm-banner">
                {/* Compact view */}
                <div className="khatm-compact" onClick={() => setExpanded(!expanded)}>
                    <ProgressRing pct={progress.pct} />

                    <div className="khatm-info">
                        <div className="khatm-title-row">
                            <span className="khatm-title">🌙 Khatm</span>
                            <span className="khatm-day-badge">Jour {dayNum}/{totalDays}</span>
                        </div>
                        <div className="khatm-today-goal">
                            Aujourd'hui : pages <strong>{todayRange.start}</strong> → <strong>{todayRange.end}</strong>
                            {' '}({todayRead}/{dailyGoal})
                        </div>
                        <div className="khatm-mini-bar">
                            <div className="khatm-mini-fill" style={{ width: `${todayPct}%` }} />
                        </div>
                    </div>

                    <ChevronDown size={18} className={`khatm-chevron ${expanded ? 'open' : ''}`} />
                </div>

                {/* Expanded view */}
                {expanded && (
                    <div className="khatm-expanded">
                        <div className="khatm-stats">
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">
                                    <BookOpen size={16} style={{ display: 'inline', verticalAlign: -2 }} />
                                    {' '}{progress.read}
                                </span>
                                <span className="khatm-stat-label">Pages lues</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">
                                    <Target size={16} style={{ display: 'inline', verticalAlign: -2 }} />
                                    {' '}{adaptiveGoal}
                                </span>
                                <span className="khatm-stat-label">Pages/jour</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">
                                    <Flame size={16} style={{ display: 'inline', verticalAlign: -2 }} />
                                    {' '}{streak}
                                </span>
                                <span className="khatm-stat-label">Streak 🔥</span>
                            </div>
                        </div>

                        <div className="khatm-message">{motivation}</div>

                        <div className="khatm-stats" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">
                                    <Calendar size={16} style={{ display: 'inline', verticalAlign: -2 }} />
                                    {' '}{daysLeft}
                                </span>
                                <span className="khatm-stat-label">Jours restants</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{604 - progress.read}</span>
                                <span className="khatm-stat-label">Pages restantes</span>
                            </div>
                        </div>

                        <div className="khatm-actions">
                            <button
                                className="khatm-btn khatm-btn-secondary"
                                onClick={() => setShowSetup(true)}
                            >
                                📅 Modifier
                            </button>
                            <button
                                className="khatm-btn khatm-btn-danger"
                                onClick={() => {
                                    if (confirm('Arrêter le Khatm en cours ?')) {
                                        store.deactivate();
                                        setExpanded(false);
                                    }
                                }}
                            >
                                Arrêter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
        </>
    );
}

// Exported page validation button for MushafPage
export function KhatmPageBadge({ currentPage }: { currentPage: number }) {
    const { isActive, isPageValidated, togglePage } = useKhatmStore();

    if (!isActive) return null;

    const validated = isPageValidated(currentPage);

    return (
        <button
            className={`khatm-page-badge ${validated ? 'validated' : ''}`}
            onClick={() => togglePage(currentPage)}
            title={validated ? 'Page validée – cliquez pour décocher' : 'Valider cette page'}
        >
            <Check size={22} />
        </button>
    );
}
