import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getHijriDate } from '../../lib/hadithEngine';
import './LastNightsDashboard.css';

const CHECKLIST_ITEMS = [
    { id: 'tahajjud', emoji: '🌌', label: "Tahajjud" },
    { id: 'tarawih', emoji: '🌙', label: 'Tarawih' },
    { id: 'quran', emoji: '📖', label: 'Coran' },
    { id: 'dua_qadr', emoji: '🤲', label: 'Doua Qadr' },
    { id: 'sadaqah', emoji: '💰', label: 'Sadaqah' },
    { id: 'dhikr', emoji: '📿', label: 'Dhikr & Istighfar' },
    { id: 'itikaf', emoji: '⛺', label: "I'tikaf (Retraite)" },
    { id: 'qiyam', emoji: '🕐', label: 'Qiyam' },
    { id: 'witr', emoji: '🌟', label: 'Witr' },
];

const STORAGE_KEY = 'qc-last-nights-v1';

interface NightData {
    [itemId: string]: boolean;
}

function loadProgress(): Record<string, NightData> {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

function saveProgress(data: Record<string, NightData>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function LastNightsDashboard() {
    const navigate = useNavigate();
    const hijri = useMemo(() => getHijriDate(new Date()), []);
    const [progress, setProgress] = useState<Record<string, NightData>>(loadProgress);

    const nights = useMemo(() => {
        // Generate nights 21-30 (standard)
        return Array.from({ length: 10 }, (_, i) => 21 + i);
    }, []);

    const currentNight = hijri.month === 9 ? hijri.day : 0;

    const toggleItem = (night: number, itemId: string) => {
        setProgress(prev => {
            const key = `night-${night}`;
            const nightData = prev[key] || {};
            const next = {
                ...prev,
                [key]: { ...nightData, [itemId]: !nightData[itemId] }
            };
            saveProgress(next);
            return next;
        });
    };

    const getNightScore = (night: number): number => {
        const key = `night-${night}`;
        const data = progress[key] || {};
        const checked = CHECKLIST_ITEMS.filter(i => data[i.id]).length;
        return Math.round((checked / CHECKLIST_ITEMS.length) * 100);
    };

    const getNightChecked = (night: number): number => {
        const key = `night-${night}`;
        const data = progress[key] || {};
        return CHECKLIST_ITEMS.filter(i => data[i.id]).length;
    };

    // Streak
    const streak = useMemo(() => {
        let count = 0;
        for (let i = nights.length - 1; i >= 0; i--) {
            const n = nights[i];
            if (n > currentNight) continue;
            if (getNightChecked(n) >= 3) { // At least 3 items checked = active night
                count++;
            } else {
                break;
            }
        }
        return count;
    }, [progress, currentNight, nights]);

    // Expanded night
    const [expandedNight, setExpandedNight] = useState<number | null>(currentNight >= 21 ? currentNight : 21);

    return (
        <div className="last-nights-page">
            <div className="last-nights-header">
                <button className="last-nights-back" onClick={() => navigate('/')}>
                    <ChevronLeft size={20} />
                </button>
                <h1>🌙 Les 10 Dernières Nuits</h1>
                {streak > 0 && (
                    <div className="last-nights-streak">🔥 {streak} nuits</div>
                )}
            </div>

            {/* Doua reminder */}
            <div className="last-nights-dua-reminder">
                <div className="last-nights-dua-reminder__ar">
                    اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
                </div>
                <div className="last-nights-dua-reminder__fr">
                    Ô Allah, Tu es Pardonneur, Tu aimes le pardon, alors pardonne-moi.
                </div>
            </div>

            {/* Nights Grid */}
            <div className="last-nights-grid">
                {nights.map(night => {
                    const isOdd = night % 2 === 1;
                    const isCurrent = night === currentNight;
                    const isPast = night < currentNight;
                    const isFuture = night > currentNight;
                    const score = getNightScore(night);
                    const isExpanded = expandedNight === night;
                    const key = `night-${night}`;
                    const nightData = progress[key] || {};

                    return (
                        <div
                            key={night}
                            className={`last-night-card ${isOdd ? 'last-night-card--odd' : ''} ${isCurrent ? 'last-night-card--current' : ''} ${isPast ? 'last-night-card--past' : ''} ${isFuture ? 'last-night-card--future' : ''} ${isExpanded ? 'last-night-card--expanded' : ''}`}
                        >
                            <button
                                className="last-night-card__header"
                                onClick={() => setExpandedNight(isExpanded ? null : night)}
                            >
                                <div className="last-night-card__left">
                                    <span className="last-night-card__number">{night}</span>
                                    <div className="last-night-card__labels">
                                        <span className="last-night-card__title">Nuit {night}</span>
                                        {isOdd && <span className="last-night-card__odd-tag">★ Impaire</span>}
                                        {isCurrent && <span className="last-night-card__current-tag">Ce soir</span>}
                                    </div>
                                </div>
                                <div className="last-night-card__right">
                                    <div className="last-night-card__score" style={{
                                        '--score-color': score >= 80 ? '#38ef7d' : score >= 50 ? '#e8d48b' : 'rgba(255,255,255,0.3)'
                                    } as React.CSSProperties}>
                                        {score}%
                                    </div>
                                    <div className="last-night-card__mini-bar">
                                        <div className="last-night-card__mini-fill" style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="last-night-card__checklist">
                                    {CHECKLIST_ITEMS.map(item => (
                                        <button
                                            key={item.id}
                                            className={`last-night-check ${nightData[item.id] ? 'last-night-check--done' : ''}`}
                                            onClick={() => toggleItem(night, item.id)}
                                        >
                                            <span className="last-night-check__emoji">{item.emoji}</span>
                                            <span className="last-night-check__label">{item.label}</span>
                                            <span className="last-night-check__mark">
                                                {nightData[item.id] ? '✅' : '○'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
