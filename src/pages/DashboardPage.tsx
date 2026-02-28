import { useMemo } from 'react';
import { useStatsStore } from '../stores/statsStore';
import { BarChart3, Flame, BookOpen, Clock, Trophy } from 'lucide-react';
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

function getWeekDates(): string[] {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toISOString().split('T')[0];
    });
}

function getCalendarDates(): string[] {
    const today = new Date();
    const todayDay = today.getDay(); // 0=Sun
    // Go back 4 weeks from current week's Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((todayDay + 6) % 7) - 21);

    return Array.from({ length: 28 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toISOString().split('T')[0];
    });
}

function getDhikrTotal(id: string, weekDates: string[]): number {
    let total = 0;
    for (const date of weekDates) {
        try {
            const key = `dhikr-v2-${date}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const data = JSON.parse(saved);
                total += data[id] || 0;
            }
        } catch { /* ignore */ }
    }
    return total;
}

export function DashboardPage() {
    const { totalPagesRead, totalMinutesSpent, readingStreak, activityHistory } = useStatsStore();

    const weekDates = useMemo(() => getWeekDates(), []);
    const calendarDates = useMemo(() => getCalendarDates(), []);
    const today = new Date().toISOString().split('T')[0];

    // Weekly data
    const weeklyData = useMemo(() => {
        return weekDates.map(date => ({
            date,
            pages: activityHistory[date] || 0,
        }));
    }, [weekDates, activityHistory]);

    const weeklyTotal = weeklyData.reduce((s, d) => s + d.pages, 0);
    const maxPages = Math.max(...weeklyData.map(d => d.pages), 1);

    // Khatm progress
    const khatmPercent = Math.min((totalPagesRead / 604) * 100, 100);

    // Dhikr totals
    const dhikrTotals = useMemo(() => {
        return DHIKR_ITEMS.map(item => ({
            ...item,
            total: getDhikrTotal(item.id, weekDates),
        }));
    }, [weekDates]);

    // Calendar levels
    const calLevels = useMemo(() => {
        return calendarDates.map(date => {
            const pages = activityHistory[date] || 0;
            if (pages === 0) return 0;
            if (pages <= 1) return 1;
            if (pages <= 3) return 2;
            if (pages <= 5) return 3;
            return 4;
        });
    }, [calendarDates, activityHistory]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <BarChart3 size={20} />
                    Tableau de Bord Spirituel
                </div>
                <div className="dashboard-subtitle">Votre progression cette semaine</div>
            </div>

            {/* Stats Row */}
            <div className="dashboard-stats">
                <div className="dashboard-stat">
                    <span className="dashboard-stat-value">{totalPagesRead}</span>
                    <span className="dashboard-stat-label">Pages totales</span>
                </div>
                <div className="dashboard-stat">
                    <span className="dashboard-stat-value">
                        <Flame size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#c9a84c' }} /> {readingStreak}
                    </span>
                    <span className="dashboard-stat-label">Jours de suite</span>
                </div>
                <div className="dashboard-stat">
                    <span className="dashboard-stat-value">
                        <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#c9a84c' }} /> {totalMinutesSpent}
                    </span>
                    <span className="dashboard-stat-label">Minutes</span>
                </div>
            </div>

            {/* Khatm Progress */}
            <div className="dashboard-khatm">
                <div className="dashboard-khatm-header">
                    <span className="dashboard-khatm-title">
                        <Trophy size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Progression Khatm
                    </span>
                    <span className="dashboard-khatm-percent">{khatmPercent.toFixed(1)}%</span>
                </div>
                <div className="dashboard-khatm-bar">
                    <div className="dashboard-khatm-fill" style={{ width: `${khatmPercent}%` }} />
                </div>
                <div className="dashboard-khatm-detail">
                    {totalPagesRead} / 604 pages — {Math.max(0, 604 - totalPagesRead)} restantes
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="dashboard-section">
                <div className="dashboard-section-title">
                    <BookOpen size={14} /> Pages cette semaine : {weeklyTotal}
                </div>
                <div className="dashboard-chart">
                    {weeklyData.map((d, i) => (
                        <div key={d.date} className="dashboard-bar-col">
                            <span className="dashboard-bar-count">{d.pages || ''}</span>
                            <div
                                className={`dashboard-bar ${d.pages === 0 ? 'dashboard-bar-empty' : ''}`}
                                style={{ height: `${Math.max((d.pages / maxPages) * 80, 4)}%` }}
                            />
                            <span className="dashboard-bar-day">{DAY_LABELS[i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Calendar */}
            <div className="dashboard-section">
                <div className="dashboard-section-title">📅 Activité (4 semaines)</div>
                <div className="dashboard-calendar">
                    {DAY_LABELS.map(d => (
                        <div key={d} className="dashboard-cal-header">{d}</div>
                    ))}
                    {calendarDates.map((date, i) => (
                        <div
                            key={date}
                            className={`dashboard-cal-cell ${date === today ? 'today' : ''}`}
                            data-level={calLevels[i]}
                            title={`${date}: ${activityHistory[date] || 0} pages`}
                        />
                    ))}
                </div>
            </div>

            {/* Dhikr Summary */}
            <div className="dashboard-section">
                <div className="dashboard-section-title">📿 Dhikr cette semaine</div>
                <div className="dashboard-dhikr-grid">
                    {dhikrTotals.map(d => (
                        <div key={d.id} className="dashboard-dhikr-item">
                            <span className="dashboard-dhikr-emoji">{d.emoji}</span>
                            <span className="dashboard-dhikr-count">{d.total}</span>
                            <span className="dashboard-dhikr-name">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
