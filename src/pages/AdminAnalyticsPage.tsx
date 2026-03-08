import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
} from 'recharts';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminAnalyticsPage.css';

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || crypto.randomUUID();
const SESSION_AUTH_KEY = 'qc-admin-auth';

// ─── Types ───────────────────────────────────────────
interface AnalyticsEvent {
    id: string;
    device_id: string;
    event: string;
    page: string;
    metadata: Record<string, unknown>;
    device_info: {
        platform?: string;
        browser?: string;
        pwa?: boolean;
        screen?: string;
        lang?: string;
    };
    created_at: string;
}

type Period = '7d' | '30d' | '90d';

// ─── Password Gate ───────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pass === ADMIN_PASS) {
            sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
            onAuth();
        } else {
            setError(true);
        }
    };

    return (
        <div className="admin-gate">
            <form className="admin-gate__box" onSubmit={handleSubmit}>
                <h2>🔒 Admin Analytics</h2>
                <p>Accès réservé à l'administrateur</p>
                <input
                    className="admin-gate__input"
                    type="password"
                    placeholder="Mot de passe..."
                    value={pass}
                    onChange={e => { setPass(e.target.value); setError(false); }}
                    autoFocus
                />
                <button className="admin-gate__btn" type="submit">Accéder</button>
                {error && <p className="admin-gate__error">Mot de passe incorrect</p>}
            </form>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────
const COLORS_PIE = ['#C9A84C', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E74C3C'];

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function periodDays(p: Period): number {
    return p === '7d' ? 7 : p === '30d' ? 30 : 90;
}

// ─── Main Dashboard ──────────────────────────────────
function Dashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('7d');
    const [eventFilter, setEventFilter] = useState('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const since = daysAgo(periodDays(period));
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(5000);

        if (!error && data) {
            setEvents(data as AnalyticsEvent[]);
        }
        setLoading(false);
    }, [period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── KPI Calculations ────────────────────────────
    const kpis = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const appOpens = events.filter(e => e.event === 'app_open');
        const todayOpens = appOpens.filter(e => e.created_at.startsWith(todayStr));

        const uniqueToday = new Set(todayOpens.map(e => e.device_id)).size;
        const uniqueTotal = new Set(appOpens.map(e => e.device_id)).size;
        const totalSessions = appOpens.length;

        const pwaUsers = new Set(
            events.filter(e => e.device_info?.pwa === true).map(e => e.device_id)
        ).size;

        const mobileUsers = new Set(
            events.filter(e => e.device_info?.platform === 'ios' || e.device_info?.platform === 'android')
                .map(e => e.device_id)
        ).size;

        const returningCount = appOpens.filter(e => (e.metadata as any)?.returning === true).length;

        return { uniqueToday, uniqueTotal, totalSessions, pwaUsers, mobileUsers, returningCount };
    }, [events]);

    // ─── Daily Visitors Chart ────────────────────────
    const dailyData = useMemo(() => {
        const days = periodDays(period);
        const map = new Map<string, Set<string>>();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            map.set(key, new Set());
        }

        events
            .filter(e => e.event === 'app_open')
            .forEach(e => {
                const day = e.created_at.split('T')[0];
                map.get(day)?.add(e.device_id);
            });

        return Array.from(map.entries()).map(([date, devices]) => ({
            date: formatDate(date),
            visitors: devices.size,
        }));
    }, [events, period]);

    // ─── Platform Distribution ───────────────────────
    const platformData = useMemo(() => {
        const counts: Record<string, Set<string>> = { ios: new Set(), android: new Set(), desktop: new Set() };
        events.forEach(e => {
            const p = e.device_info?.platform || 'desktop';
            if (!counts[p]) counts[p] = new Set();
            counts[p].add(e.device_id);
        });
        return Object.entries(counts)
            .map(([name, set]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: set.size }))
            .filter(d => d.value > 0);
    }, [events]);

    // ─── Browser Distribution ────────────────────────
    const browserData = useMemo(() => {
        const counts: Record<string, Set<string>> = {};
        events.forEach(e => {
            const b = e.device_info?.browser || 'other';
            if (!counts[b]) counts[b] = new Set();
            counts[b].add(e.device_id);
        });
        return Object.entries(counts)
            .map(([name, set]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: set.size }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [events]);

    // ─── Top Pages ───────────────────────────────────
    const topPages = useMemo(() => {
        const counts: Record<string, number> = {};
        events
            .filter(e => e.event === 'page_view')
            .forEach(e => {
                const page = e.page || '/';
                counts[page] = (counts[page] || 0) + 1;
            });
        return Object.entries(counts)
            .map(([page, views]) => ({ page, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);
    }, [events]);

    // ─── Event Types for Filter ──────────────────────
    const eventTypes = useMemo(() => {
        const types = new Set(events.map(e => e.event));
        return ['all', ...Array.from(types).sort()];
    }, [events]);

    // ─── Filtered Events Table ───────────────────────
    const tableEvents = useMemo(() => {
        const filtered = eventFilter === 'all' ? events : events.filter(e => e.event === eventFilter);
        return filtered.slice(0, 100);
    }, [events, eventFilter]);

    if (loading) {
        return <div className="admin-loading">Chargement des données analytiques...</div>;
    }

    const platformEmoji = (p?: string) => {
        if (p === 'ios') return '🍎';
        if (p === 'android') return '🤖';
        return '🖥️';
    };

    return (
        <div className="admin-analytics">
            {/* Header */}
            <div className="admin-header">
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', padding: 4 }}>
                    <ArrowLeft size={20} />
                </button>
                <h1>📊 Analytics</h1>
                <button className="admin-refresh-btn" onClick={fetchData}>
                    <RefreshCw size={14} /> Actualiser
                </button>
                <div className="admin-header__period">
                    {(['7d', '30d', '90d'] as Period[]).map(p => (
                        <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
                            {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="admin-kpis">
                <div className="admin-kpi">
                    <div className="admin-kpi__icon">👤</div>
                    <div className="admin-kpi__value">{kpis.uniqueToday}</div>
                    <div className="admin-kpi__label">Visiteurs Aujourd'hui</div>
                </div>
                <div className="admin-kpi">
                    <div className="admin-kpi__icon">👥</div>
                    <div className="admin-kpi__value">{kpis.uniqueTotal}</div>
                    <div className="admin-kpi__label">Visiteurs Uniques</div>
                    <div className="admin-kpi__sub">sur {periodDays(period)} jours</div>
                </div>
                <div className="admin-kpi">
                    <div className="admin-kpi__icon">🔄</div>
                    <div className="admin-kpi__value">{kpis.totalSessions}</div>
                    <div className="admin-kpi__label">Sessions</div>
                    <div className="admin-kpi__sub">{kpis.returningCount} retours</div>
                </div>
                <div className="admin-kpi">
                    <div className="admin-kpi__icon">📱</div>
                    <div className="admin-kpi__value">{kpis.mobileUsers}</div>
                    <div className="admin-kpi__label">Mobile</div>
                    <div className="admin-kpi__sub">{kpis.pwaUsers} en PWA</div>
                </div>
            </div>

            {/* Charts */}
            <div className="admin-charts">
                {/* Daily Visitors */}
                <div className="admin-chart-card admin-chart-card--wide">
                    <h3>📈 Visiteurs Uniques / Jour</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1e2e', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12 }}
                                labelStyle={{ color: '#C9A84C' }}
                            />
                            <Area type="monotone" dataKey="visitors" stroke="#C9A84C" fill="url(#goldGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Platform Distribution */}
                <div className="admin-chart-card">
                    <h3>📱 Plateformes</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {platformData.map((_, i) => (
                                    <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a1e2e', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Browser Distribution */}
                <div className="admin-chart-card">
                    <h3>🌐 Navigateurs</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {browserData.map((_, i) => (
                                    <Cell key={i} fill={COLORS_PIE[(i + 2) % COLORS_PIE.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a1e2e', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Pages */}
                <div className="admin-chart-card admin-chart-card--wide">
                    <h3>🏆 Pages les plus visitées</h3>
                    <ResponsiveContainer width="100%" height={Math.max(200, topPages.length * 30)}>
                        <BarChart data={topPages} layout="vertical" margin={{ left: 80 }}>
                            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="page" type="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip contentStyle={{ background: '#1a1e2e', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="views" fill="#C9A84C" radius={[0, 4, 4, 0]} barSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Events Table */}
            <div className="admin-events">
                <h3>🔍 Événements Récents</h3>
                <div className="admin-events__filters">
                    <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
                        {eventTypes.map(t => (
                            <option key={t} value={t}>{t === 'all' ? 'Tous les événements' : t}</option>
                        ))}
                    </select>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Événement</th>
                            <th>Page</th>
                            <th>Plateforme</th>
                            <th>Navigateur</th>
                            <th>PWA</th>
                            <th>Appareil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableEvents.map(e => {
                            const badgeClass = ['app_open', 'page_view', 'audio_play', 'search'].includes(e.event)
                                ? `admin-events__badge--${e.event}` : 'admin-events__badge--default';
                            return (
                                <tr key={e.id}>
                                    <td>{formatDate(e.created_at)} {formatTime(e.created_at)}</td>
                                    <td><span className={`admin-events__badge ${badgeClass}`}>{e.event}</span></td>
                                    <td>{e.page || '—'}</td>
                                    <td>
                                        <span className="admin-events__platform">
                                            {platformEmoji(e.device_info?.platform)} {e.device_info?.platform || '—'}
                                        </span>
                                    </td>
                                    <td>{e.device_info?.browser || '—'}</td>
                                    <td>{e.device_info?.pwa ? '✅' : '—'}</td>
                                    <td style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{e.device_id.slice(0, 8)}…</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {tableEvents.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 20 }}>Aucun événement trouvé</p>
                )}
            </div>
        </div>
    );
}

// ─── Exported Component ──────────────────────────────
export function AdminAnalyticsPage() {
    const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_AUTH_KEY) === 'true');

    if (!authed) {
        return <PasswordGate onAuth={() => setAuthed(true)} />;
    }

    return <Dashboard />;
}
