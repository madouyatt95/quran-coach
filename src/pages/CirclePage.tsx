import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Users, BookOpen, Trophy, Copy, Check, LogOut, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { useCircleStore, MEMBER_EMOJIS, type ReadingCircle } from '../stores/circleStore';
import { useKhatmStore } from '../stores/khatmStore';
import './CirclePage.css';

type CircleView = 'list' | 'detail' | 'create' | 'join';

const CIRCLE_EMOJIS = ['📖', '🌙', '🕌', '📿', '⭐', '🤲', '☪️', '🏅'];
const CIRCLE_GOALS = [
    'Khatm en 30 jours',
    'Khatm en 60 jours',
    'Khatm en 90 jours',
    'Juz par semaine',
    '1 page par jour',
    '5 pages par jour',
    'Mémorisation — 1 sourate/semaine',
    'Révision du Hizb quotidien',
    'Lire le Tafsir ensemble',
    'Lecture libre',
];

// ─── Auto Sync from Khatm ─────────────────────────────────
function AutoSyncButton({ circleId, myPages }: { circleId: string; myPages: number }) {
    const khatm = useKhatmStore();
    const circleStore = useCircleStore();
    const [syncing, setSyncing] = useState(false);
    const [synced, setSynced] = useState(false);

    const khatmPages = khatm.validatedPages.length;
    const diff = khatmPages - myPages;

    const handleSync = async () => {
        if (diff <= 0 || syncing) return;
        setSyncing(true);
        await circleStore.logPages(circleId, diff);
        setSyncing(false);
        setSynced(true);
        setTimeout(() => setSynced(false), 3000);
    };

    if (!khatm.isActive && khatmPages === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                Activez le suivi Khatm pour synchroniser automatiquement
            </div>
        );
    }

    return (
        <button
            className="circle-create-btn"
            style={{ margin: '8px 0', opacity: diff > 0 ? 1 : 0.5 }}
            onClick={handleSync}
            disabled={diff <= 0 || syncing}
        >
            {synced ? (
                <><Check size={16} /> Synchronisé !</>
            ) : syncing ? (
                <><RefreshCw size={16} className="spinning" /> Synchronisation...</>
            ) : diff > 0 ? (
                <><RefreshCw size={16} /> Synchroniser {diff} page{diff > 1 ? 's' : ''} depuis ma lecture</>
            ) : (
                <><Check size={16} /> À jour ({khatmPages} pages)</>
            )}
        </button>
    );
}

export function CirclePage() {
    const navigate = useNavigate();
    const store = useCircleStore();

    const [view, setView] = useState<CircleView>('list');
    const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Create circle form
    const [newName, setNewName] = useState('');
    const [newEmoji, setNewEmoji] = useState('📖');
    const [newGoal, setNewGoal] = useState(CIRCLE_GOALS[0]);

    // Join circle
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');

    // Log pages
    const [pagesToLog, setPagesToLog] = useState('');

    // Profile
    const [profileName, setProfileName] = useState(store.myName);
    const [profileEmoji, setProfileEmoji] = useState(store.myEmoji);

    const activeCircle = activeCircleId ? store.getCircle(activeCircleId) : null;
    const myId = store.myDeviceId;

    // Refresh from Supabase on mount
    useEffect(() => {
        store.refreshCircles();
    }, []);

    const handleCreate = useCallback(async () => {
        if (!newName.trim()) return;
        if (!store.myName) {
            store.setProfile(profileName || 'Anonyme', profileEmoji);
        }
        const circle = await store.createCircle(newName.trim(), newEmoji, newGoal);
        if (circle) {
            setActiveCircleId(circle.id);
            setView('detail');
            setNewName('');
        }
    }, [newName, newEmoji, newGoal, store, profileName, profileEmoji]);

    const handleJoin = useCallback(async () => {
        if (joinCode.length < 4) {
            setJoinError('Code trop court');
            return;
        }
        if (!store.myName) {
            store.setProfile(profileName || 'Anonyme', profileEmoji);
        }
        const result = await store.joinCircle(joinCode.toUpperCase());
        if (result.success && result.circleId) {
            setActiveCircleId(result.circleId);
            setView('detail');
            setJoinCode('');
            setJoinError('');
        } else {
            setJoinError(result.error || 'Erreur inconnue');
        }
    }, [joinCode, store, profileName, profileEmoji]);

    const handleCopyCode = useCallback((code: string) => {
        navigator.clipboard?.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const handleLogPages = useCallback(async () => {
        const pages = parseInt(pagesToLog);
        if (!pages || pages < 1 || !activeCircleId) return;
        await store.logPages(activeCircleId, pages);
        setPagesToLog('');
    }, [pagesToLog, activeCircleId, store]);

    const openCircle = useCallback((circle: ReadingCircle) => {
        setActiveCircleId(circle.id);
        setView('detail');
    }, []);

    // ─── Circle Detail View ──────────────────────────────

    if (view === 'detail' && activeCircle) {
        const totalGroupPages = activeCircle.members.reduce((s, m) => s + m.pagesRead, 0);
        const progressPercent = Math.min((totalGroupPages / activeCircle.totalPages) * 100, 100);
        const myPages = activeCircle.members.find(m => m.id === myId)?.pagesRead || 0;

        return (
            <div className="circle-page">
                <div className="circle-detail-header">
                    <button className="circle-back" onClick={() => setView('list')}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="circle-detail-title">
                        <span className="circle-detail-emoji">{activeCircle.emoji}</span>
                        <div>
                            <h2>{activeCircle.name}</h2>
                            <span className="circle-detail-goal">{activeCircle.goal}</span>
                        </div>
                    </div>
                </div>

                {/* Invite Code */}
                <div className="circle-invite-box">
                    <span className="circle-invite-label">Code d'invitation</span>
                    <div className="circle-invite-code">
                        <span>{activeCircle.inviteCode}</span>
                        <button onClick={() => handleCopyCode(activeCircle.inviteCode)}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Group Progress */}
                <div className="circle-progress">
                    <div className="circle-progress-header">
                        <Trophy size={16} />
                        <span>Progression du groupe</span>
                        <span className="circle-progress-percent">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="circle-progress-bar">
                        <div className="circle-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="circle-progress-stats">
                        <span>{totalGroupPages} / {activeCircle.totalPages} pages</span>
                    </div>
                </div>

                {/* Log Pages */}
                <div className="circle-log-section">
                    <div className="circle-log-header">
                        <BookOpen size={16} />
                        <span>Ma lecture</span>
                        <span className="circle-log-mine">{myPages} pages lues</span>
                    </div>

                    {/* Auto-sync from Quran reader */}
                    <AutoSyncButton circleId={activeCircle.id} myPages={myPages} />

                    {/* Manual fallback */}
                    <div className="circle-log-manual-label" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '12px 0 6px', textAlign: 'center' }}>ou ajouter manuellement</div>
                    <div className="circle-log-input">
                        <input
                            type="number"
                            min="1"
                            max="30"
                            placeholder="Nombre de pages..."
                            value={pagesToLog}
                            onChange={e => setPagesToLog(e.target.value)}
                        />
                        <button className="circle-log-btn" onClick={handleLogPages} disabled={!pagesToLog}>
                            <Plus size={16} /> Enregistrer
                        </button>
                    </div>
                </div>

                {/* Members */}
                <div className="circle-section">
                    <div className="circle-section-title">
                        <Users size={16} />
                        <span>{activeCircle.members.length} membres</span>
                    </div>
                    <div className="circle-members">
                        {activeCircle.members
                            .sort((a, b) => b.pagesRead - a.pagesRead)
                            .map((m, i) => (
                                <div key={m.id} className={`circle-member ${m.id === myId ? 'circle-member--me' : ''}`}>
                                    <span className="circle-member-rank">{i + 1}</span>
                                    <span className="circle-member-emoji">{m.emoji}</span>
                                    <div className="circle-member-info">
                                        <span className="circle-member-name">{m.name} {m.id === myId ? '(moi)' : ''}</span>
                                        <span className="circle-member-pages">{m.pagesRead} pages</span>
                                    </div>
                                    <div className="circle-member-bar">
                                        <div className="circle-member-bar-fill" style={{ width: `${Math.min((m.pagesRead / 20) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="circle-section">
                    <div className="circle-section-title">
                        <Clock size={16} />
                        <span>Activité récente</span>
                    </div>
                    <div className="circle-activities">
                        {activeCircle.activities.slice(0, 10).map(act => (
                            <div key={act.id} className={`circle-activity circle-activity--${act.type}`}>
                                <span className="circle-activity-dot" />
                                <span className="circle-activity-text">{act.message}</span>
                                <span className="circle-activity-time">
                                    {formatTimeAgo(act.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leave */}
                <button className="circle-leave-btn" onClick={async () => { await store.leaveCircle(activeCircle.id); setView('list'); }}>
                    <LogOut size={16} />
                    <span>Quitter le cercle</span>
                </button>
            </div>
        );
    }

    // ─── Create Circle View ──────────────────────────────

    if (view === 'create') {
        return (
            <div className="circle-page">
                <div className="circle-form-header">
                    <button className="circle-back" onClick={() => setView('list')}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2>Créer un Cercle</h2>
                </div>

                {/* Profile (first time) */}
                {!store.myName && (
                    <div className="circle-form-section">
                        <label>Votre nom</label>
                        <input
                            type="text"
                            placeholder="Votre prénom..."
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            className="circle-form-input"
                        />
                        <div className="circle-emoji-grid">
                            {MEMBER_EMOJIS.map(e => (
                                <button
                                    key={e}
                                    className={`circle-emoji-btn ${profileEmoji === e ? 'active' : ''}`}
                                    onClick={() => setProfileEmoji(e)}
                                >{e}</button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="circle-form-section">
                    <label>Nom du cercle</label>
                    <input
                        type="text"
                        placeholder="Ex: Cercle du Vendredi"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="circle-form-input"
                    />
                </div>

                <div className="circle-form-section">
                    <label>Icône</label>
                    <div className="circle-emoji-grid">
                        {CIRCLE_EMOJIS.map(e => (
                            <button
                                key={e}
                                className={`circle-emoji-btn ${newEmoji === e ? 'active' : ''}`}
                                onClick={() => setNewEmoji(e)}
                            >{e}</button>
                        ))}
                    </div>
                </div>

                <div className="circle-form-section">
                    <label>Objectif</label>
                    <div className="circle-goal-options">
                        {CIRCLE_GOALS.map(g => (
                            <button
                                key={g}
                                className={`circle-goal-btn ${newGoal === g ? 'active' : ''}`}
                                onClick={() => setNewGoal(g)}
                            >{g}</button>
                        ))}
                    </div>
                </div>

                <button
                    className="circle-create-btn"
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                >
                    <Sparkles size={18} />
                    <span>Créer le cercle</span>
                </button>
            </div>
        );
    }

    // ─── Join Circle View ────────────────────────────────

    if (view === 'join') {
        return (
            <div className="circle-page">
                <div className="circle-form-header">
                    <button className="circle-back" onClick={() => setView('list')}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2>Rejoindre un Cercle</h2>
                </div>

                {/* Profile (first time) */}
                {!store.myName && (
                    <div className="circle-form-section">
                        <label>Votre nom</label>
                        <input
                            type="text"
                            placeholder="Votre prénom..."
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            className="circle-form-input"
                        />
                        <div className="circle-emoji-grid">
                            {MEMBER_EMOJIS.map(e => (
                                <button
                                    key={e}
                                    className={`circle-emoji-btn ${profileEmoji === e ? 'active' : ''}`}
                                    onClick={() => setProfileEmoji(e)}
                                >{e}</button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="circle-form-section">
                    <label>Code d'invitation</label>
                    <input
                        type="text"
                        placeholder="Ex: ABC123"
                        value={joinCode}
                        onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                        className="circle-form-input circle-form-input--code"
                        maxLength={8}
                    />
                    {joinError && <p className="circle-form-error">{joinError}</p>}
                </div>

                <button
                    className="circle-create-btn"
                    onClick={handleJoin}
                    disabled={joinCode.length < 4}
                >
                    <Users size={18} />
                    <span>Rejoindre</span>
                </button>
            </div>
        );
    }

    // ─── Circle List View (default) ──────────────────────

    return (
        <div className="circle-page">
            <div className="circle-list-header">
                <button className="circle-back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1>📖 Cercles de Lecture</h1>
                    <p>Lisez le Coran ensemble</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="circle-actions">
                <button className="circle-action-btn circle-action-btn--create" onClick={() => setView('create')}>
                    <Plus size={20} />
                    <span>Créer un cercle</span>
                </button>
                <button className="circle-action-btn circle-action-btn--join" onClick={() => setView('join')}>
                    <Users size={20} />
                    <span>Rejoindre</span>
                </button>
            </div>

            {/* My Circles */}
            {store.myCircles.length > 0 ? (
                <div className="circle-list">
                    <div className="circle-list-title">Mes cercles</div>
                    {store.myCircles.map(circle => {
                        const totalPages = circle.members.reduce((s, m) => s + m.pagesRead, 0);
                        const progress = Math.min((totalPages / circle.totalPages) * 100, 100);
                        return (
                            <button
                                key={circle.id}
                                className="circle-card"
                                onClick={() => openCircle(circle)}
                            >
                                <span className="circle-card-emoji">{circle.emoji}</span>
                                <div className="circle-card-info">
                                    <div className="circle-card-name">{circle.name}</div>
                                    <div className="circle-card-meta">
                                        <span>{circle.members.length} membres</span>
                                        <span>•</span>
                                        <span>{circle.goal}</span>
                                    </div>
                                    <div className="circle-card-bar">
                                        <div className="circle-card-bar-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                                <ChevronLeft size={16} className="circle-card-arrow" />
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="circle-empty">
                    <div className="circle-empty-icon">📖</div>
                    <h3>Aucun cercle</h3>
                    <p>Créez un cercle ou rejoignez-en un avec un code d'invitation pour lire le Coran ensemble.</p>
                </div>
            )}
        </div>
    );
}

function formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
}
