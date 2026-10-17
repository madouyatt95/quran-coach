import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Trophy } from 'lucide-react';
import { useCompanionStore } from '../stores/companionStore';
import { useHifdhJourneyStore } from '../stores/hifdhJourneyStore';
import { useKhatmStore } from '../stores/khatmStore';
import { useListeningEvidenceStore } from '../stores/listeningEvidenceStore';
import { confirmedRecall, latestVerseAttempts } from '../lib/progressEvidence';
import { outcomeLabels } from '../lib/hifdhJourney';
import './DashboardPage.css';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DHIKR_ITEMS = [
    { id: 'subhanallah', emoji: '📿', name: 'SubhanAllah' },
    { id: 'alhamdulillah', emoji: '🤲', name: 'Alhamdulillah' },
    { id: 'allahu_akbar', emoji: '✨', name: 'Allahu Akbar' },
    { id: 'tahlil', emoji: '❤️', name: 'La ilaha illa-Llah' },
    { id: 'istighfar', emoji: '💜', name: 'Astaghfirullah' },
    { id: 'subhan_bihamdi', emoji: '🌸', name: 'Subhan w bihamdihi' },
];
function localDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function getWeekDates() {
    const monday = new Date();
    monday.setHours(12, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday); date.setDate(monday.getDate() + index);
        return localDate(date);
    });
}
function dhikrTotal(id: string, dates: string[]) {
    return dates.reduce((total, date) => {
        try { return total + (JSON.parse(localStorage.getItem(`dhikr-v2-${date}`) || '{}')[id] || 0); }
        catch { return total; }
    }, 0);
}
function when(value: string | number) {
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function DashboardPage() {
    const evidence = useCompanionStore(s => s.evidence);
    const removeEvidence = useCompanionStore(s => s.removeEvidence);
    const attempts = useHifdhJourneyStore(s => s.attempts);
    const removeAttempt = useHifdhJourneyStore(s => s.removeAttempt);
    const listens = useListeningEvidenceStore(s => s.entries);
    const removeListen = useListeningEvidenceStore(s => s.remove);
    const khatm = useKhatmStore();
    const [pageInput, setPageInput] = useState('');
    const [pageError, setPageError] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const days = useMemo(getWeekDates, []);
    const consultedPages = useMemo(() => new Set(evidence.map(e => e.page)), [evidence]);
    const listenedVerses = useMemo(() => new Set(listens.filter(e => e.ayah).map(e => `${e.surah}:${e.ayah}`)), [listens]);
    const listenedSurahs = useMemo(() => new Set(listens.filter(e => !e.ayah).map(e => e.surah)), [listens]);
    const recited = useMemo(() => latestVerseAttempts(attempts.filter(a => ['independent', 'assisted', 'self-corrected'].includes(a.outcome))), [attempts]);
    const acquired = useMemo(() => confirmedRecall(attempts), [attempts]);
    const progress = khatm.getOverallProgress();
    const recentPages = [...khatm.validatedPages].sort((a, b) => {
        const aTime = Date.parse(khatm.validationDetails?.[a]?.at || '') || 0;
        const bTime = Date.parse(khatm.validationDetails?.[b]?.at || '') || 0;
        return bTime - aTime || b - a;
    }).slice(0, 8);
    const weekly = days.map(day => ({ day, pages: new Set(evidence.filter(e => e.day === day).map(e => e.page)).size }));
    const maxWeekly = Math.max(1, ...weekly.map(item => item.pages));
    const calendarStart = new Date();
    calendarStart.setHours(12, 0, 0, 0);
    calendarStart.setDate(calendarStart.getDate() - ((calendarStart.getDay() + 6) % 7) - 21);
    function changePage() {
        const page = Number(pageInput);
        if (!/^[1-9]\d*$/.test(pageInput) || page < 1 || page > 604) { setPageError('Indiquez une page entre 1 et 604.'); return; }
        if (!khatm.isActive || khatm.completedAt) { setPageError('Activez un Khatm en cours pour corriger ses pages.'); return; }
        khatm.togglePage(page);
        setPageInput(''); setPageError('');
    }
    return <div className="dashboard-page">
        <header className="dashboard-header">
            <div className="dashboard-title"><BarChart3 size={20}/> Ma progression</div>
            <p className="dashboard-subtitle">Chaque chiffre indique ce que l’application a réellement enregistré.</p>
        </header>

        <section className="dashboard-evidence-grid" aria-label="Types de progression">
            <article className="dashboard-evidence-card"><span>📖 Consulté à l’écran</span><strong>{consultedPages.size}</strong><small>pages distinctes · 35 derniers jours</small></article>
            <article className="dashboard-evidence-card"><span>🎧 Audio terminé</span><strong>{listenedVerses.size}</strong><small>versets distincts · {listenedSurahs.size} sourate(s) complètes · depuis cette version</small></article>
            <article className="dashboard-evidence-card"><span>🎙️ Récité</span><strong>{recited.length}</strong><small>versets autoévalués dans le parcours</small></article>
            <article className="dashboard-evidence-card"><span>✨ Acquis en mémorisation</span><strong>{acquired.length}</strong><small>rappels seuls espacés d’au moins 3 jours</small></article>
        </section>
        <p className="dashboard-evidence-note">Ces catégories ne s’additionnent pas. Une page affichée n’est pas une page lue. « Audio terminé » indique que le lecteur est arrivé à la fin, sans prouver une écoute attentive ou intégrale. Les écoutes antérieures à cette version n’ont pas d’historique fiable.</p>

        <section className="dashboard-khatm">
            <div className="dashboard-khatm-header"><span className="dashboard-khatm-title"><Trophy size={16}/> Khatm {khatm.isActive ? 'en cours' : 'inactif'}</span><strong className="dashboard-khatm-percent">{progress.pct.toLocaleString('fr-FR')} %</strong></div>
            <div className="dashboard-khatm-bar"><div className="dashboard-khatm-fill" style={{ width: `${progress.pct}%` }}/></div>
            <p className="dashboard-khatm-detail">{progress.read} / 604 pages validées dans le suivi du Khatm</p>
            {khatm.isActive && <>
                <div className="dashboard-page-correction"><label htmlFor="dashboard-page-input">Corriger une page</label><input id="dashboard-page-input" type="number" min="1" max="604" value={pageInput} onChange={e => {setPageInput(e.target.value);setPageError('');}} placeholder="N° de page"/><button type="button" onClick={changePage}>{khatm.validatedPages.includes(Number(pageInput)) ? 'Retirer' : 'Valider'}</button></div>
                {pageError && <p role="alert" className="dashboard-error">{pageError}</p>}
                {khatm.autoExcludedPages.length > 0 && <p className="dashboard-excluded">{khatm.autoExcludedPages.length} page(s) retirée(s) : elles ne seront pas revalidées automatiquement. Saisissez leur numéro pour les valider de nouveau.</p>}
                <div className="dashboard-proof-list">{recentPages.map(page => <div className="dashboard-proof" key={page}><div><strong>Page {page}</strong><small>{khatm.validationDetails?.[page]?.source === 'automatic' ? khatm.validationDetails[page].method === 'vertical-scroll' ? 'Défilement vertical jusqu’à la page suivante' : 'Passage à la page suivante après 15 s au premier plan' : khatm.validationDetails?.[page]?.source === 'manual' ? 'Validée manuellement' : 'Historique ancien · origine indisponible'}{khatm.validationDetails?.[page]?.at ? ` · ${when(khatm.validationDetails[page].at)}` : ''}</small></div>{!khatm.completedAt && <button type="button" onClick={() => khatm.togglePage(page)} aria-label={`Retirer la validation de la page ${page}`}>Corriger</button>}</div>)}</div>
            </>}
        </section>

        <section className="dashboard-section"><h2 className="dashboard-section-title">📅 Pages consultées cette semaine : {weekly.reduce((sum, item) => sum + item.pages, 0)}</h2><div className="dashboard-chart">{weekly.map((item, index) => <div key={item.day} className="dashboard-bar-col"><span className="dashboard-bar-count">{item.pages || ''}</span><div className={`dashboard-bar ${item.pages ? '' : 'dashboard-bar-empty'}`} style={{ height: `${Math.max(4, item.pages / maxWeekly * 80)}%` }}/><span className="dashboard-bar-day">{DAY_LABELS[index]}</span></div>)}</div></section>
        <section className="dashboard-section"><h2 className="dashboard-section-title">🗓️ Activité visible (4 semaines)</h2><div className="dashboard-calendar">{DAY_LABELS.map(day => <div key={day} className="dashboard-cal-header">{day}</div>)}{Array.from({length:28},(_,i)=>{const date=new Date(calendarStart);date.setDate(calendarStart.getDate()+i);const day=localDate(date);const count=new Set(evidence.filter(e=>e.day===day).map(e=>e.page)).size;return <div key={day} className="dashboard-cal-cell" data-level={Math.min(4,count)} title={`${day} : ${count} page(s) consultée(s)`}/>;})}</div></section>

        <section className="dashboard-section"><div className="dashboard-section-title dashboard-section-heading"><h2>🧾 Pourquoi ces validations ?</h2><button type="button" onClick={() => setShowHistory(value => !value)} aria-expanded={showHistory}>{showHistory ? 'Masquer' : 'Voir et corriger'}</button></div>
            {showHistory && <div className="dashboard-history">
                <h3>Consultations récentes</h3>{[...evidence].reverse().slice(0, 8).map(e => <div className="dashboard-proof" key={`${e.at}-${e.page}`}><div><strong>Page {e.page} · {e.surah}:{e.ayah}</strong><small>Affichée au premier plan · {when(e.at)} · indice de consultation, pas de lecture</small></div><button type="button" onClick={() => removeEvidence(e.at)}>Corriger</button></div>)}
                <h3>Écoutes récentes</h3>{listens.slice(0, 8).map(e => <div className="dashboard-proof" key={e.id}><div><strong>{e.ayah ? `Verset ${e.surah}:${e.ayah}` : `Sourate ${e.surah}`}</strong><small>Audio terminé · {e.source} · {when(e.at)}</small></div><button type="button" onClick={() => removeListen(e.id)}>Corriger</button></div>)}
                <h3>Récitations récentes</h3>{attempts.slice(0, 8).map(a => <div className="dashboard-proof" key={a.id}><div><strong><Link to={`/passage?surah=${a.surah}&ayah=${a.ayah}`}>{a.surah}:{a.ayah}</Link> · {outcomeLabels[a.outcome]}</strong><small>{a.scope === 'phrase' ? 'Portion de verset' : 'Verset entier'} · autoévaluation · {when(a.at)}{a.hints ? ` · ${a.hints} aide(s)` : ''}</small></div><button type="button" onClick={() => removeAttempt(a.id)}>Corriger</button></div>)}
                <p className="dashboard-evidence-note">« Corriger » retire cette preuve du tableau. La carte de révision peut rester programmée dans la mémorisation.</p>
            </div>}
        </section>
        <section className="dashboard-section"><h2 className="dashboard-section-title">📿 Dhikr cette semaine</h2><div className="dashboard-dhikr-grid">{DHIKR_ITEMS.map(item => <div key={item.id} className="dashboard-dhikr-item"><span className="dashboard-dhikr-emoji">{item.emoji}</span><span className="dashboard-dhikr-count">{dhikrTotal(item.id, days)}</span><span className="dashboard-dhikr-name">{item.name}</span></div>)}</div></section>
    </div>;
}
