import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun, MapPin, RefreshCw, ArrowLeft } from 'lucide-react';
import './PrayerTimesPage.css';

interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

interface PrayerInfo {
    name: string;
    nameAr: string;
    icon: React.ReactNode;
    startTime: string;
    endTime: string;
    color: string;
}

const PRAYER_ICONS: Record<string, React.ReactNode> = {
    Fajr: <Sunrise size={24} />,
    Dhuhr: <Sun size={24} />,
    Asr: <CloudSun size={24} />,
    Maghrib: <Sunset size={24} />,
    Isha: <Moon size={24} />,
};

const PRAYER_NAMES_AR: Record<string, string> = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
};

const PRAYER_COLORS: Record<string, string> = {
    Fajr: '#4FC3F7',
    Dhuhr: '#FFD54F',
    Asr: '#FFB74D',
    Maghrib: '#FF8A65',
    Isha: '#7986CB',
};

export function PrayerTimesPage() {
    const navigate = useNavigate();
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>('');

    // Get today's date in Hijri
    const getHijriDate = () => {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        return formatter.format(new Date());
    };

    // Fetch prayer times from AlAdhan API
    const fetchPrayerTimes = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://api.aladhan.com/v1/timings/${Date.now() / 1000}?latitude=${lat}&longitude=${lng}&method=2`
            );
            const data = await response.json();

            if (data.code === 200) {
                setPrayerTimes(data.data.timings);
            } else {
                throw new Error('Failed to fetch prayer times');
            }
        } catch (err) {
            setError('Impossible de récupérer les horaires');
            console.error(err);
        }
    };

    // Get city name from coordinates
    const fetchCityName = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`
            );
            const data = await response.json();
            setLocation({
                city: data.city || data.locality || 'Ville inconnue',
                country: data.countryName || '',
            });
        } catch {
            setLocation({ city: 'Position actuelle', country: '' });
        }
    };

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await Promise.all([
                    fetchPrayerTimes(latitude, longitude),
                    fetchCityName(latitude, longitude),
                ]);
                setLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                // Fallback to Paris
                fetchPrayerTimes(48.8566, 2.3522);
                setLocation({ city: 'Paris', country: 'France' });
                setLoading(false);
            }
        );
    }, []);

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate next prayer and countdown
    useEffect(() => {
        if (!prayerTimes) return;

        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const now = currentTime;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let foundNext = false;
        for (const prayer of prayers) {
            const [hours, minutes] = prayerTimes[prayer as keyof PrayerTimes].split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            if (prayerMinutes > currentMinutes) {
                setNextPrayer(prayer);

                // Calculate countdown
                const diffMinutes = prayerMinutes - currentMinutes;
                const h = Math.floor(diffMinutes / 60);
                const m = diffMinutes % 60;
                setCountdown(h > 0 ? `${h}h ${m}min` : `${m} min`);
                foundNext = true;
                break;
            }
        }

        if (!foundNext) {
            // Next prayer is Fajr tomorrow
            setNextPrayer('Fajr');
            const [fajrH, fajrM] = prayerTimes.Fajr.split(':').map(Number);
            const fajrMinutes = fajrH * 60 + fajrM;
            const diffMinutes = (24 * 60 - currentMinutes) + fajrMinutes;
            const h = Math.floor(diffMinutes / 60);
            const m = diffMinutes % 60;
            setCountdown(`${h}h ${m}min`);
        }
    }, [prayerTimes, currentTime]);

    const getPrayersList = (): PrayerInfo[] => {
        if (!prayerTimes) return [];

        // Calculate Islamic midnight (midpoint between Maghrib and Fajr)
        const calculateIslamicMidnight = (): string => {
            const [maghribH, maghribM] = prayerTimes.Maghrib.split(':').map(Number);
            const [fajrH, fajrM] = prayerTimes.Fajr.split(':').map(Number);

            const maghribMinutes = maghribH * 60 + maghribM;
            const fajrMinutes = fajrH * 60 + fajrM;

            // Night duration (Fajr is next day, so add 24h if needed)
            const nightDuration = fajrMinutes < maghribMinutes
                ? (24 * 60 - maghribMinutes) + fajrMinutes
                : fajrMinutes - maghribMinutes;

            // Islamic midnight = Maghrib + half of night duration
            const midnightMinutes = (maghribMinutes + Math.floor(nightDuration / 2)) % (24 * 60);
            const midnightH = Math.floor(midnightMinutes / 60);
            const midnightM = midnightMinutes % 60;

            return `${midnightH.toString().padStart(2, '0')}:${midnightM.toString().padStart(2, '0')}`;
        };

        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const endTimeMap: Record<string, string> = {
            Fajr: prayerTimes.Sunrise,
            Dhuhr: prayerTimes.Asr,
            Asr: prayerTimes.Maghrib,
            Maghrib: prayerTimes.Isha,
            Isha: calculateIslamicMidnight(), // Islamic midnight (midpoint Maghrib-Fajr)
        };

        return prayers.map((prayer) => ({
            name: prayer,
            nameAr: PRAYER_NAMES_AR[prayer],
            icon: PRAYER_ICONS[prayer],
            startTime: prayerTimes[prayer as keyof PrayerTimes],
            endTime: endTimeMap[prayer],
            color: PRAYER_COLORS[prayer],
        }));
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="prayer-times-page">
                <div className="prayer-loading">
                    <RefreshCw size={48} className="spin" />
                    <p>Chargement des horaires...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="prayer-times-page">
            {/* Back button */}
            <button className="page-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={22} />
            </button>

            {/* Header */}
            <div className="prayer-header">
                <div className="prayer-header-top">
                    <div className="prayer-location">
                        <MapPin size={16} />
                        <span>{location?.city}{location?.country ? `, ${location.country}` : ''}</span>
                    </div>
                    <div className="prayer-current-time">
                        <Clock size={16} />
                        <span>{formatTime(currentTime)}</span>
                    </div>
                </div>
                <div className="prayer-hijri-date">
                    {getHijriDate()}
                </div>
            </div>

            {/* Next Prayer Highlight */}
            {nextPrayer && prayerTimes && (
                <div className="next-prayer-card" style={{ borderColor: PRAYER_COLORS[nextPrayer] }}>
                    <div className="next-prayer-label">Prochaine prière</div>
                    <div className="next-prayer-info">
                        <div className="next-prayer-icon" style={{ color: PRAYER_COLORS[nextPrayer] }}>
                            {PRAYER_ICONS[nextPrayer]}
                        </div>
                        <div className="next-prayer-details">
                            <span className="next-prayer-name">{nextPrayer}</span>
                            <span className="next-prayer-name-ar">{PRAYER_NAMES_AR[nextPrayer]}</span>
                        </div>
                        <div className="next-prayer-time">
                            <span className="next-prayer-hour">{prayerTimes[nextPrayer as keyof PrayerTimes]}</span>
                            <span className="next-prayer-countdown">dans {countdown}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Prayer Times List */}
            <div className="prayer-times-list">
                {error ? (
                    <div className="prayer-error">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Réessayer</button>
                    </div>
                ) : (
                    getPrayersList().map((prayer) => (
                        <div
                            key={prayer.name}
                            className={`prayer-time-item ${prayer.name === nextPrayer ? 'next' : ''}`}
                        >
                            <div className="prayer-time-icon" style={{ color: prayer.color }}>
                                {prayer.icon}
                            </div>
                            <div className="prayer-time-names">
                                <span className="prayer-time-name">{prayer.name}</span>
                                <span className="prayer-time-name-ar">{prayer.nameAr}</span>
                            </div>
                            <div className="prayer-time-value">
                                <span className="prayer-start">{prayer.startTime}</span>
                                <span className="prayer-end">→ {prayer.endTime}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer note */}
            <div className="prayer-footer">
                <p>Méthode de calcul : Muslim World League</p>
            </div>
        </div>
    );
}
