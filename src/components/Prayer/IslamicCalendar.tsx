import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Star, Moon } from 'lucide-react';
import './IslamicCalendar.css';

// ─── Hijri Conversion (Kuwaiti Algorithm) ─────────────────
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
    const format = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    const parts = format.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const month = parts.find(p => p.type === 'month')?.value || '1';
    const year = parts.find(p => p.type === 'year')?.value || '1445';

    return {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year.split(' ')[0], 10)
    };
}

const HIJRI_MONTHS = [
    '', 'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah'
];

const HIJRI_MONTHS_AR = [
    '', 'محرّم', 'صفر', 'ربيع الأوّل', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجّة'
];

// ─── Islamic Events Database ─────────────────────────────
interface IslamicEvent {
    month: number;
    day: number;
    emoji: string;
    title: string;
    titleAr: string;
    type: 'major' | 'sunnah' | 'monthly';
    description: string;
    link?: string;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
    // Muharram
    { month: 1, day: 1, emoji: '🌙', title: 'Nouvel An Islamique', titleAr: 'رأس السنة الهجرية', type: 'major', description: 'Premier jour de l\'année hégirienne' },
    { month: 1, day: 10, emoji: '🤍', title: 'Jour d\'Achoura', titleAr: 'يوم عاشوراء', type: 'major', description: 'Jeûne recommandé (9 et 10 Muharram). Expie les péchés d\'une année.', link: '/adhkar' },
    { month: 1, day: 9, emoji: '🤍', title: 'Tasu\'a', titleAr: 'تاسوعاء', type: 'sunnah', description: 'Jeûne du 9 Muharram avec Achoura' },
    // Rabi al-Awwal
    { month: 3, day: 12, emoji: '🕊️', title: 'Mawlid an-Nabi ﷺ', titleAr: 'المولد النبوي', type: 'major', description: 'Naissance du Prophète Muhammad ﷺ' },
    // Rajab
    { month: 7, day: 27, emoji: '✨', title: 'Isra wal Mi\'raj', titleAr: 'الإسراء والمعراج', type: 'major', description: 'Voyage nocturne et ascension du Prophète ﷺ' },
    // Sha'ban
    { month: 8, day: 15, emoji: '🌕', title: 'Nuit du 15 Sha\'ban', titleAr: 'ليلة النصف من شعبان', type: 'major', description: 'Nuit bénie — invocations et demandes de pardon' },
    // Ramadan
    { month: 9, day: 1, emoji: '🌙', title: 'Début du Ramadan', titleAr: 'أول رمضان', type: 'major', description: 'Premier jour du mois du jeûne' },
    { month: 9, day: 27, emoji: '💎', title: 'Laylat al-Qadr', titleAr: 'ليلة القدر', type: 'major', description: 'La Nuit du Destin — meilleure que 1000 mois. Cherchée les nuits impaires des 10 derniers jours.', link: '/adhkar' },
    // Shawwal
    { month: 10, day: 1, emoji: '🎉', title: 'Aïd al-Fitr', titleAr: 'عيد الفطر', type: 'major', description: 'Fête de la rupture du jeûne — Takbirat et prière de l\'Aïd' },
    // Dhul Hijjah
    { month: 12, day: 8, emoji: '🕋', title: 'Jour de Tarwiyah', titleAr: 'يوم التروية', type: 'sunnah', description: 'Début du Hajj — jeûne recommandé' },
    { month: 12, day: 9, emoji: '🤲', title: 'Jour d\'Arafat', titleAr: 'يوم عرفة', type: 'major', description: 'Meilleur jour de l\'année — jeûne expie 2 années de péchés', link: '/adhkar' },
    { month: 12, day: 10, emoji: '🎊', title: 'Aïd al-Adha', titleAr: 'عيد الأضحى', type: 'major', description: 'Fête du sacrifice — Takbirat pendant les jours de Tashreeq' },
];

function getUpcomingEvents(hijri: { year: number; month: number; day: number }, count: number): (IslamicEvent & { daysUntil: number; hijriDate: string })[] {
    const upcoming: (IslamicEvent & { daysUntil: number; hijriDate: string })[] = [];

    // Collect all events and compute days until each
    const allEvents = [
        ...ISLAMIC_EVENTS,
        // Add white days for current and next month
        ...getWhiteDays(hijri.month),
        ...getWhiteDays(hijri.month === 12 ? 1 : hijri.month + 1),
    ];

    for (const ev of allEvents) {
        let daysUntil: number;

        if (ev.month === hijri.month && ev.day === hijri.day) {
            daysUntil = 0; // Today!
        } else if (ev.month > hijri.month || (ev.month === hijri.month && ev.day > hijri.day)) {
            // Same year, later
            daysUntil = estimateDaysUntil(hijri, ev.month, ev.day);
        } else {
            // Next year
            daysUntil = estimateDaysUntil(hijri, ev.month, ev.day) + 354;
        }

        if (daysUntil >= 0 && daysUntil <= 90) {
            upcoming.push({
                ...ev,
                daysUntil,
                hijriDate: `${ev.day} ${HIJRI_MONTHS[ev.month]}`,
            });
        }
    }

    // Sort by proximity and dedupe
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    const seen = new Set<string>();
    return upcoming.filter(e => {
        const key = `${e.month}-${e.day}-${e.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, count);
}

function getWhiteDays(month: number): IslamicEvent[] {
    return [13, 14, 15].map(day => ({
        month,
        day,
        emoji: '⚪',
        title: `Jour Blanc (${day} ${HIJRI_MONTHS[month]})`,
        titleAr: `اليوم الأبيض`,
        type: 'monthly' as const,
        description: 'Jeûne surérogatoire recommandé les 13, 14 et 15 de chaque mois lunaire',
    }));
}

function estimateDaysUntil(current: { month: number; day: number }, targetMonth: number, targetDay: number): number {
    // Approximate: 29.5 days per Hijri month
    const currentDayOfYear = (current.month - 1) * 29.5 + current.day;
    const targetDayOfYear = (targetMonth - 1) * 29.5 + targetDay;
    let diff = targetDayOfYear - currentDayOfYear;
    if (diff < 0) diff += 354;
    return Math.round(diff);
}

function isMondayOrThursday(date: Date): boolean {
    const day = date.getDay();
    return day === 1 || day === 4;
}

// ─── Component ───────────────────────────────────────────
export function IslamicCalendar() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const today = new Date();
    const hijri = useMemo(() => gregorianToHijri(today), []);

    const upcomingEvents = useMemo(() => getUpcomingEvents(hijri, 8), [hijri]);

    const todayEvents = upcomingEvents.filter(e => e.daysUntil === 0);
    const futureEvents = upcomingEvents.filter(e => e.daysUntil > 0);

    const isSunnahFastDay = isMondayOrThursday(today);
    const todayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });

    return (
        <div className="islamic-calendar">
            <button className="islamic-calendar__header" onClick={() => setExpanded(!expanded)}>
                <div className="islamic-calendar__title">
                    <Calendar size={16} />
                    <span>Calendrier Islamique</span>
                </div>
                <ChevronRight size={16} className={expanded ? 'rotated' : ''} />
            </button>

            {expanded && (
                <div className="islamic-calendar__body">
                    {/* Today's Hijri Date */}
                    <div className="hijri-today">
                        <div className="hijri-today__date">
                            <span className="hijri-today__day">{hijri.day}</span>
                            <div className="hijri-today__month-year">
                                <span className="hijri-today__month">{HIJRI_MONTHS[hijri.month]}</span>
                                <span className="hijri-today__month-ar">{HIJRI_MONTHS_AR[hijri.month]}</span>
                                <span className="hijri-today__year">{hijri.year} H</span>
                            </div>
                        </div>
                    </div>

                    {/* Sunnah fasting badge */}
                    {isSunnahFastDay && (
                        <div className="calendar-badge calendar-badge--sunnah">
                            <Star size={14} />
                            <span>Jeûne Sunna — {todayName}</span>
                        </div>
                    )}

                    {/* Today's events */}
                    {todayEvents.length > 0 && (
                        <div className="calendar-section">
                            <div className="calendar-section__title">✨ Aujourd'hui</div>
                            {todayEvents.map((ev, i) => (
                                <div
                                    key={i}
                                    className={`calendar-event calendar-event--today calendar-event--${ev.type}`}
                                    onClick={() => ev.link && navigate(ev.link)}
                                >
                                    <span className="calendar-event__emoji">{ev.emoji}</span>
                                    <div className="calendar-event__content">
                                        <div className="calendar-event__name">{ev.title}</div>
                                        <div className="calendar-event__name-ar">{ev.titleAr}</div>
                                        <div className="calendar-event__desc">{ev.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upcoming events */}
                    <div className="calendar-section">
                        <div className="calendar-section__title">
                            <Moon size={14} />
                            <span>Prochains événements</span>
                        </div>
                        {futureEvents.map((ev, i) => (
                            <div
                                key={i}
                                className={`calendar-event calendar-event--${ev.type}`}
                                onClick={() => ev.link && navigate(ev.link)}
                            >
                                <span className="calendar-event__emoji">{ev.emoji}</span>
                                <div className="calendar-event__content">
                                    <div className="calendar-event__name">{ev.title}</div>
                                    <div className="calendar-event__date-badge">
                                        <span>{ev.hijriDate}</span>
                                        <span className="calendar-event__countdown">
                                            {ev.daysUntil === 1 ? 'Demain' : `dans ${ev.daysUntil} jours`}
                                        </span>
                                    </div>
                                    <div className="calendar-event__desc">{ev.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
