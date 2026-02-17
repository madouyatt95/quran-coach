import React, { useMemo } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { computeDay, type DayResult, PRAYER_NAMES_FR, SALAT_KEYS } from '../../lib/prayerEngine';
import './PrayerCalendarModal.css';

interface PrayerCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number;
    lng: number;
    settings: any;
}

export const PrayerCalendarModal: React.FC<PrayerCalendarModalProps> = ({ isOpen, onClose, lat, lng, settings }) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const lastDay = new Date(year, month + 1, 0);

        const days: DayResult[] = [];
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            days.push(computeDay(date, lat, lng, settings));
        }
        return days;
    }, [currentMonth, lat, lng, settings]);

    const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    if (!isOpen) return null;

    return (
        <div className="prayer-modal-overlay" onClick={onClose}>
            <div className="prayer-calendar-modal" onClick={e => e.stopPropagation()}>
                <div className="prayer-calendar-modal__header">
                    <div className="prayer-calendar-modal__title">
                        <CalendarIcon size={18} />
                        <span>Calendrier des prières</span>
                    </div>
                    <button className="prayer-calendar-modal__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="prayer-calendar-modal__nav">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="prayer-calendar-modal__nav-btn"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="prayer-calendar-modal__month">{monthLabel}</span>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="prayer-calendar-modal__nav-btn"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="prayer-calendar-modal__table-wrapper">
                    <table className="prayer-calendar-table">
                        <thead>
                            <tr>
                                <th>Jour</th>
                                {SALAT_KEYS.map(k => (
                                    <th key={k}>{PRAYER_NAMES_FR[k]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {daysInMonth.map((day, idx) => {
                                const dayDate = day.times.fajr;
                                const isToday = dayDate.toDateString() === new Date().toDateString();
                                return (
                                    <tr key={idx} className={isToday ? 'is-today' : ''}>
                                        <td className="day-cell">
                                            <span className="day-num">{dayDate.getDate()}</span>
                                            <span className="day-name">{dayDate.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</span>
                                        </td>
                                        {SALAT_KEYS.map(k => (
                                            <td key={k}>{day.formattedTimes[k]}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
