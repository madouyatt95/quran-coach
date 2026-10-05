import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { hasCompleteKhatm, khatmToday, useKhatmStore } from '../../stores/khatmStore';
import { useQuranStore } from '../../stores/quranStore';
import type { Ayah } from '../../types';
import './KhatmTracker.css';

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
    const [preset] = useState(() => {const end = new Date();end.setDate(end.getDate()+29);return {start:khatmToday(),end:khatmToday(end)};});
    const [startDate, setStartDate] = useState(preset.start);
    const [endDate, setEndDate] = useState(preset.end);
    const [usePreset, setUsePreset] = useState(true);

    const handleStart = () => {
        const s = usePreset ? preset.start : startDate;
        const e = usePreset ? preset.end : endDate;
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

                {/* Rolling 30-day plan */}
                <div
                    className={`khatm-preset ${usePreset ? 'selected' : ''}`}
                    onClick={() => setUsePreset(true)}
                >
                    <span className="khatm-preset-icon">🌙</span>
                    <div className="khatm-preset-info">
                        <div className="khatm-preset-title">En 30 jours</div>
                        <div className="khatm-preset-dates">À partir d’aujourd’hui</div>
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

export function KhatmTracker({dailyPreview = false}: {dailyPreview?:boolean} = {}) {
    const store = useKhatmStore();
    const [,setDay] = useState(khatmToday);
    useEffect(() => {
        const refresh = () => setDay(khatmToday());
        const timer = setInterval(refresh,60000);
        document.addEventListener('visibilitychange',refresh);
        return () => {clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};
    }, []);
    const { goToAyah, goToPage } = useQuranStore();
    const [showDetails, setShowDetails] = useState(false);
    const [showSetup, setShowSetup] = useState(false);

    const progress = store.getOverallProgress();
    const todayRead = store.getTodayRead();
    const adaptiveGoal = store.getDailyGoal();
    const remainingToday = Math.max(0,adaptiveGoal-todayRead);
    const dailyLabel = remainingToday === 0 ? 'Objectif du jour atteint' : `Encore ${remainingToday} page${remainingToday > 1 ? 's' : ''} aujourd’hui`;
    const streak = store.getStreak();
    const daysLeft = store.getDaysRemaining();
    const motivation = getMotivation(progress.pct, todayRead, adaptiveGoal);

    const handleResumeKhatm = () => {
        // Resume at the exact last khatm reading position (stored separately from general reading)
        const { lastKhatmSurah, lastKhatmAyah, lastKhatmPage } = store;
        console.log(`[Khatm] handleResumeKhatm CLICKED. Target: S${lastKhatmSurah}:A${lastKhatmAyah} (Page ${lastKhatmPage})`);

        if (lastKhatmAyah === 0) {
            sessionStorage.setItem('scrollToPage', String(lastKhatmPage));
            goToPage(lastKhatmPage, {silent:true,khatm:true});
            setShowDetails(false);
            return;
        }
        sessionStorage.setItem('isSilentJump', 'true');
        sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: lastKhatmSurah, ayah: lastKhatmAyah }));
        // Use silent: true to preserve general reading progress (Reprendre ma lecture)
        // isExploring deadlock is no longer an issue because updateProgress() always runs
        (goToAyah as any)(lastKhatmSurah, lastKhatmAyah, lastKhatmPage, { silent: true, khatm: true });
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
            <button type="button" aria-label="Objectif Khatm" aria-description={dailyPreview && store.isActive ? dailyLabel : undefined} className={`khatm-header-trigger ${dailyPreview ? 'khatm-header-trigger--daily' : ''}`} onClick={handleClick}>
                {!store.isActive ? (
                    <div className="khatm-trigger-inactive" title="Configurer l'objectif Khatm">
                        <span className="khatm-trigger-emoji">🌙</span>
                        <span className="khatm-trigger-label">Khatm</span>
                    </div>
                ) : (
                    <div className="khatm-trigger-active">
                        <div className="khatm-trigger-pct">{store.completedAt ? "Terminé" : hasCompleteKhatm(store.validatedPages) ? "Confirmer" : `${progress.pct.toLocaleString('fr-FR')}%`}</div>
                        <div className="khatm-trigger-pages">{store.validatedPages.length}/604</div>
                        {dailyPreview && !store.completedAt && <span className={`khatm-trigger-daily ${remainingToday === 0 ? 'is-reached' : ''}`} role={remainingToday === 0 ? 'status' : undefined}>{remainingToday === 0 && <Check size={12}/>} {dailyLabel}</span>}
                    </div>
                )}
            </button>

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
                                <span className="khatm-stat-value">{progress.pct.toLocaleString('fr-FR')}%</span>
                                <span className="khatm-stat-label">Total</span>
                            </div>
                            <div className="khatm-stat">
                                <span className="khatm-stat-value">{adaptiveGoal === 0 ? 'Atteint' : `${todayRead}/${adaptiveGoal}`}</span>
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

                        <p style={{fontSize:12,lineHeight:1.5,opacity:.75}}>Dans le lecteur texte, le défilement vers la page suivante valide la page parcourue. Dans les lecteurs image, consultez la page 15 secondes avant de passer à la suivante. Les recherches et sauts de navigation ne comptent pas. Le bouton ✓ permet de corriger ou valider une page, notamment la dernière.</p>
                        <div className="khatm-actions-stack">
                            {hasCompleteKhatm(store.validatedPages) && !store.completedAt && <>
                                <p>Les 604 pages sont validées. Confirmez lorsque vous avez terminé votre lecture.</p>
                                <button className="khatm-btn khatm-btn-primary" onClick={()=>{if(store.confirmCompletion())setShowDetails(false);}}>J’ai terminé mon Khatm</button>
                            </>}
                            {store.completedAt && <p role="status">Khatm terminé et enregistré.</p>}
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
                            <button
                                className="khatm-btn khatm-btn-danger"
                                style={{ marginTop: 12, width: '100%', background: '#d32f2f', color: '#fff' }}
                                onClick={() => {
                                    if (confirm('Voulez-vous vraiment TOUT effacer et recommencer à zéro ? Cette action est irréversible.')) {
                                        store.reset();
                                        setShowDetails(false);
                                    }
                                }}
                            >
                                Réinitialiser à zéro
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
        </>
    );
}

// Exported page validation button for MushafPage
export function KhatmPageBadge({ currentPage, pageOnly = false, disabled = false }: { currentPage: number; pageOnly?: boolean; disabled?: boolean }) {
    const { isActive, completedAt, isPageValidated, togglePage } = useKhatmStore();
    const { currentAyah, currentSurahAyahs } = useQuranStore();

    if (!isActive || completedAt) return null;

    const validated = isPageValidated(currentPage);

    // Find the first ayah of the current page in the current surah context
    const pageStartAyah = currentSurahAyahs.find((a: Ayah) => a.page === currentPage)?.numberInSurah;

    // Pulse only if not validated and we are near the start of this page (within first 3 verses)
    // This gives a visual "New Page" hint without being persistent throughout the whole page.
    const shouldPulse = !validated && (pageOnly || (
        pageStartAyah !== undefined &&
        currentAyah >= pageStartAyah &&
        currentAyah < pageStartAyah + 3
    ));

    return (
        <button
            className={`khatm-page-badge ${validated ? 'validated' : ''} ${shouldPulse ? 'pulse' : ''}`}
            disabled={disabled}
            aria-label={validated ? `Retirer la validation de la page ${currentPage}` : `Valider la page ${currentPage}`}
            onClick={() => togglePage(currentPage)}
            title={validated ? 'Page validée – cliquez pour décocher' : 'Valider cette page'}
        >
            <Check size={22} />
        </button>
    );
}
