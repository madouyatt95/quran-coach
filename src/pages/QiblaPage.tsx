import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Navigation, AlertTriangle, Loader2, MapPin, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './QiblaPage.css';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQiblaDirection(lat: number, lng: number): number {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
    const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

    const dLng = kaabaLngRad - lngRad;

    const x = Math.sin(dLng);
    const y = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLng);

    let qibla = (Math.atan2(x, y) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;

    return qibla;
}

export function QiblaPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
    const [compassHeading, setCompassHeading] = useState<number>(0);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userCity, setUserCity] = useState<string>('');
    const [hasCompass, setHasCompass] = useState(false);

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError(t('qibla.geoNotSupported', "La géolocalisation n'est pas supportée par votre navigateur."));
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const angle = calculateQiblaDirection(latitude, longitude);
                setQiblaAngle(angle);
                setIsLoading(false);

                // Try reverse geocoding for city name
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
                    .then(r => r.json())
                    .then(data => {
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
                        setUserCity(city);
                    })
                    .catch(() => { });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError(t('qibla.permissionDenied', "Veuillez autoriser l'accès à votre position pour trouver la Qibla."));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError(t('qibla.positionUnavailable', "Position non disponible. Vérifiez votre GPS."));
                        break;
                    case error.TIMEOUT:
                        setLocationError(t('qibla.timeout', "Délai d'attente dépassé. Réessayez."));
                        break;
                    default:
                        setLocationError(t('qibla.geoError', "Erreur de géolocalisation."));
                }
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Device compass (DeviceOrientationEvent)
    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            // iOS compass
            if ('webkitCompassHeading' in event) {
                setCompassHeading((event as any).webkitCompassHeading);
                setHasCompass(true);
            }
            // Android / standard
            else if (event.alpha !== null) {
                setCompassHeading(360 - event.alpha);
                setHasCompass(true);
            }
        };

        // iOS 13+ requires permission
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            // Will be requested on user interaction
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, []);

    const requestCompassPermission = async () => {
        try {
            const response = await (DeviceOrientationEvent as any).requestPermission();
            if (response === 'granted') {
                window.addEventListener('deviceorientation', (event: DeviceOrientationEvent) => {
                    if ('webkitCompassHeading' in event) {
                        setCompassHeading((event as any).webkitCompassHeading);
                        setHasCompass(true);
                    } else if (event.alpha !== null) {
                        setCompassHeading(360 - event.alpha!);
                        setHasCompass(true);
                    }
                }, true);
            }
        } catch {
            // Permission denied or error
        }
    };

    const needsPermission = typeof (DeviceOrientationEvent as any).requestPermission === 'function' && !hasCompass;

    // Compute rotation: needle should point toward Qibla
    const rotation = qiblaAngle !== null ? qiblaAngle - compassHeading : 0;

    return (
        <div className="qibla-page">
            {/* Back button */}
            <button className="page-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={22} />
            </button>

            {/* Hero */}
            <div className="qibla-hero">
                <span className="qibla-hero__icon">🕋</span>
                <h1 className="qibla-hero__title">{t('qibla.titleAr', "اتِّجَاهُ القِبْلَة")}</h1>
                <p className="qibla-hero__subtitle">{t('qibla.subtitle', "Direction de la Qibla")}</p>
                {userCity && (
                    <span className="qibla-hero__city">
                        <MapPin size={14} /> {userCity}
                    </span>
                )}
            </div>

            <div className="qibla-content">
                {isLoading ? (
                    <div className="qibla-loading">
                        <Loader2 size={40} className="qibla-loading__spinner" />
                        <p>{t('qibla.locating', "Localisation en cours…")}</p>
                    </div>
                ) : locationError ? (
                    <div className="qibla-error">
                        <AlertTriangle size={40} />
                        <p>{locationError}</p>
                        <button className="qibla-retry-btn" onClick={() => window.location.reload()}>
                            {t('common.retry', "Réessayer")}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Compass */}
                        <div className="qibla-compass">
                            <div
                                className="qibla-compass__dial"
                                style={{ transform: `rotate(${-compassHeading}deg)` }}
                            >
                                {/* Cardinal directions */}
                                <span className="qibla-compass__cardinal qibla-compass__n">{t('qibla.north', 'N')}</span>
                                <span className="qibla-compass__cardinal qibla-compass__e">{t('qibla.east', 'E')}</span>
                                <span className="qibla-compass__cardinal qibla-compass__s">{t('qibla.south', 'S')}</span>
                                <span className="qibla-compass__cardinal qibla-compass__w">{t('qibla.west', 'O')}</span>

                                {/* Degree marks */}
                                {Array.from({ length: 72 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`qibla-compass__tick ${i % 6 === 0 ? 'qibla-compass__tick--major' : ''}`}
                                        style={{ transform: `rotate(${i * 5}deg)` }}
                                    />
                                ))}
                            </div>

                            {/* Qibla needle (always points to Qibla) */}
                            <div
                                className="qibla-needle"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                <div className="qibla-needle__arrow" />
                                <span className="qibla-needle__kaaba">🕋</span>
                            </div>

                            {/* Center dot */}
                            <div className="qibla-compass__center" />
                        </div>

                        {/* Info */}
                        <div className="qibla-info">
                            <div className="qibla-info__angle">
                                <Compass size={18} />
                                <span>{qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '—'}</span>
                                <span className="qibla-info__label">{t('qibla.fromNorth', "depuis le Nord")}</span>
                            </div>

                            {!hasCompass && (
                                <div className="qibla-info__hint">
                                    <Navigation size={16} />
                                    {needsPermission ? (
                                        <button className="qibla-compass-btn" onClick={requestCompassPermission}>
                                            {t('qibla.enableCompass', "Activer la boussole")}
                                        </button>
                                    ) : (
                                        <span>{t('qibla.orientAngle', "Orientez l'angle")} {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '—'} {t('qibla.fromNorth', "depuis le Nord")}</span>
                                    )}
                                </div>
                            )}

                            {hasCompass && (
                                <div className="qibla-info__hint qibla-info__hint--active">
                                    <Navigation size={16} />
                                    <span>{t('qibla.turnDevice', "Tournez votre appareil jusqu'à ce que 🕋 soit en haut")}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
