import { useState } from 'react';
import { Check } from 'lucide-react';
import { useKhatmStore } from '../../stores/khatmStore';
import { useQuranStore } from '../../stores/quranStore';
import type { Ayah } from '../../types';
import './KhatmTracker.css';

// Approximate Ramadan 1447 AH dates
const RAMADAN_START = '2026-02-18';
const RAMADAN_END = '2026-03-19';



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
            <div className="khatm-popup-backdrop" onClick={onClose} />
            <div className="khatm-popup">
                <div className="khatm-popup-header">
                    <h3>🌙 Objectif Khatm</h3>
                    <button className="khatm-popup-close" onClick={onClose}>&times;</button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 20, textAlign: 'center' }}>
                    Définissez votre période pour lire les 604 pages du Coran.
                </p>

                {/* Ramadan Preset */}
                <div
                    className={`khatm-preset ${usePreset ? 'selected' : ''}`}
                    onClick={() => setUsePreset(true)}
                >
                    <span className="khatm-preset-icon">🌙</span>
                    <div className="khatm-preset-info">
                        <div className="khatm-preset-title">Ramadan 1447</div>
                        <div className="khatm-preset-dates">18 fév → 19 mars (30j)</div>
                    </div>
                    {usePreset && <Check size={18} color="#c9a84c" />}
                </div>

                {/* Custom dates */}
                <div
                    className={`khatm-preset ${!usePreset ? 'selected' : ''}`}
                    onClick={() => setUsePreset(false)}
                >
                    <span className="khatm-preset-icon">📅</span>
                    <div className="khatm-preset-info">
                        <div className="khatm-preset-title">Période personnalisée</div>
                        <div className="khatm-preset-dates">Choisissez vos dates</div>
                    </div>
                    {!usePreset && <Check size={18} color="#c9a84c" />}
                </div>

                {!usePreset && (
                    <div className="khatm-custom" style={{ marginTop: 15 }}>
                        <div className="khatm-date-row">
                            <div className="khatm-popup-field">
                                <label>Début</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="khatm-popup-field">
                                <label>Fin</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="khatm-actions" style={{ marginTop: 24 }}>
                    <button
                        className="khatm-btn"
                        style={{ background: '#c9a84c', color: '#000' }}
                        onClick={handleStart}
                        disabled={!isValid}
                    >
                        Commencer
                    </button>
                    <button className="khatm-btn khatm-btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                </div>
            </div>
        </>
    );
}

export function KhatmTracker() {
    const store = useKhatmStore();
    const { goToAyah } = useQuranStore();
    const [showDetails, setShowDetails] = useState(false);
    const [showSetup, setShowSetup] = useState(false);

    const progress = store.getOverallProgress();
    const todayRange = store.getTodayRange();
    const todayRead = store.getTodayRead();
    const dailyGoal = todayRange.end - todayRange.start + 1;
    const adaptiveGoal = store.getDailyGoal();
    const streak = store.getStreak();
    const daysLeft = store.getDaysRemaining();
    const motivation = getMotivation(progress.pct, todayRead, dailyGoal);

    const handleResumeKhatm = () => {
        // Resume at the exact last khatm reading position (stored separately from general reading)
        const { lastKhatmSurah, lastKhatmAyah, lastKhatmPage } = store;
        console.log(`[Khatm] Resuming at S${lastKhatmSurah}:A${lastKhatmAyah} (Page ${lastKhatmPage})`);

        sessionStorage.setItem('isSilentJump', 'true');
        sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: lastKhatmSurah, ayah: lastKhatmAyah }));
        // Navigate WITHOUT silent flag — Khatm resume is legitimate, not exploration
        goToAyah(lastKhatmSurah, lastKhatmAyah, lastKhatmPage);
        // Ensure isExploring is cleared in case it was stuck
        useQuranStore.getState().stopExploring();
        setShowDetails(false);
    };

    const handleClick = () => {
        if (store.isActive) {
            setShowDetails(true);
        } else {
            setShowSetup(true);
        }
    };

    return (
        <>
            <div className="khatm-header-trigger" onClick={handleClick}>
                {!store.isActive ? (
                    <div className="khatm-trigger-inactive" title="Configurer l'objectif Khatm">
                        <span className="khatm-trigger-emoji">🌙</span>
                        <span className="khatm-trigger-label">Khatm</span>
                    </div>
                ) : (
                    <div className="khatm-trigger-active">
                        <div className="khatm-trigger-pct">{progress.pct}%</div>
                        <div className="khatm-trigger-pages">{progress.read}/604</div>
                    </div>
                )}
            </div>

            {/* Details Popup */}
            {showDetails && (
                <>
                    <div className="khatm-popup-backdrop" onClick={() => setShowDetails(false)} />
                    <div className="khatm-popup">
                        <div className="khatm-popup-header">
                            <h3>🌙 Objectif Khatm</h3>
                            <button className="khatm-popup-close" onClick={() => setShowDetails(false)}>&times;</button>
                        </div>

                        <div className="khatm-stats">
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{progress.pct}%</span>
                                <span className="khatm-stat-label">Total</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{todayRead}/{dailyGoal}</span>
                                <span className="khatm-stat-label">Aujourd'hui</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{streak} 🔥</span>
                                <span className="khatm-stat-label">Streak</span>
                            </div>
                        </div>

                        <div className="khatm-message">{motivation}</div>

                        <div className="khatm-stats" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{adaptiveGoal}</span>
                                <span className="khatm-stat-label">Pages / jour</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{daysLeft}</span>
                                <span className="khatm-stat-label">Jours restants</span>
                            </div>
                        </div>

                        <div className="khatm-actions-stack">
                            <button
                                className="khatm-btn khatm-btn-primary"
                                onClick={handleResumeKhatm}
                            >
                                Reprendre mon Khatm
                            </button>
                            <div className="khatm-actions">
                                <button className="khatm-btn khatm-btn-secondary" onClick={() => { setShowDetails(false); setShowSetup(true); }}>
                                    Modifier
                                </button>
                                <button
                                    className="khatm-btn khatm-btn-danger"
                                    onClick={() => {
                                        if (confirm('Arrêter le Khatm en cours ?')) {
                                            store.deactivate();
                                            setShowDetails(false);
                                        }
                                    }}
                                >
                                    Arrêter
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
        </>
    );
}

// Exported page validation button for MushafPage
export function KhatmPageBadge({ currentPage }: { currentPage: number }) {
    const { isActive, isPageValidated, togglePage } = useKhatmStore();
    const { currentAyah, currentSurahAyahs } = useQuranStore();

    if (!isActive) return null;

    const validated = isPageValidated(currentPage);

    // Find the first ayah of the current page in the current surah context
    const pageStartAyah = currentSurahAyahs.find((a: Ayah) => a.page === currentPage)?.numberInSurah;

    // Pulse only if not validated and we are near the start of this page (within first 3 verses)
    // This gives a visual "New Page" hint without being persistent throughout the whole page.
    const shouldPulse = !validated && (
        pageStartAyah !== undefined &&
        currentAyah >= pageStartAyah &&
        currentAyah < pageStartAyah + 3
    );

    return (
        <button
            className={`khatm-page-badge ${validated ? 'validated' : ''} ${shouldPulse ? 'pulse' : ''}`}
            onClick={() => togglePage(currentPage)}
            title={validated ? 'Page validée – cliquez pour décocher' : 'Valider cette page'}
        >
            <Check size={22} />
        </button>
    );
}
