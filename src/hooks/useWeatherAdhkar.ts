import { useState, useEffect } from 'react';
import { getCurrentWeather, type WeatherEvent } from '../lib/weatherService';

export interface WeatherAdhkar {
    id: number;
    event: WeatherEvent;
    title: string;
    emoji: string;
    textAr: string;
    textFr: string;
    phonetic: string;
    gradient: string;
}

const ADHKAR_DB: Record<Exclude<WeatherEvent, 'none'>, WeatherAdhkar> = {
    rain: {
        id: 9001,
        event: 'rain',
        title: 'Il pleut 🌧️',
        emoji: '🌧️',
        textAr: 'اللَّهُمَّ صَيِّداً نَافِعاً',
        phonetic: "Allâhumma sayyiban nâfi'an.",
        textFr: 'Ô Allah ! Fais que ce soit une pluie utile.',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    thunderstorm: {
        id: 9002,
        event: 'thunderstorm',
        title: 'Orage et Tonnerre ⚡',
        emoji: '⚡',
        textAr: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
        phonetic: "Subhâna l-ladhî yusabbihu r-ra'du bi-hamdihi wa-l-malâ'ikatu min khîfatihi.",
        textFr: 'Gloire à Celui dont le tonnerre Le glorifie par Ses louanges, ainsi que les Anges par crainte de Lui.',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Dark purple/blue
    },
    wind: {
        id: 9003,
        event: 'wind',
        title: 'Vent très violent 💨',
        emoji: '💨',
        textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا',
        phonetic: "Allâhumma innî as'aluka khayrahâ wa a'ûdhu bika min sharrihâ.",
        textFr: 'Ô Allah ! Je Te demande son bien et je cherche refuge auprès de Toi contre son mal.',
        gradient: 'linear-gradient(135deg, #8baaaa 0%, #ae8b9c 100%)', // Windy grey/purple
    }
};

export function useWeatherAdhkar() {
    const [adhkar, setAdhkar] = useState<WeatherAdhkar | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchLocalWeather() {
            setLoading(true);
            try {
                // Determine coords (try geolocation, fallback to Paris)
                let lat = 48.8566;
                let lng = 2.3522;

                try {
                    // Quick timeout for geolocation so we don't block the UI
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        setTimeout(() => reject(new Error('Timeout')), 3000);
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000, maximumAge: 1000 * 60 * 15 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (e) {
                    console.warn('[useWeatherAdhkar] Using default coordinates for weather');
                }

                if (!mounted) return;

                const weather = await getCurrentWeather(lat, lng);

                if (weather.event !== 'none') {
                    setAdhkar(ADHKAR_DB[weather.event]);
                } else {
                    setAdhkar(null);
                }
            } catch (error) {
                console.error('[useWeatherAdhkar] Weather logic failed:', error);
                setAdhkar(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchLocalWeather();

        return () => {
            mounted = false;
        };
    }, []);

    return { adhkar, loading };
}
