import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home, Compass, Navigation, MapPin, AlertCircle } from 'lucide-react';
import './QiblaARPage.css';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Calculate bearing to Kaaba from current position
function calculateQiblaDirection(lat: number, lng: number): number {
    const lat1 = lat * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const diffLng = (KAABA_LNG - lng) * Math.PI / 180;

    const x = Math.sin(diffLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(diffLng);

    let bearing = Math.atan2(x, y) * 180 / Math.PI;
    return (bearing + 360) % 360;
}

// Calculate distance to Kaaba in km
function calculateDistance(lat: number, lng: number): number {
    const R = 6371; // Earth radius in km
    const lat1 = lat * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const diffLat = (KAABA_LAT - lat) * Math.PI / 180;
    const diffLng = (KAABA_LNG - lng) * Math.PI / 180;

    const a = Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(diffLng / 2) * Math.sin(diffLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

export function QiblaARPage() {
    const navigate = useNavigate();
    const [_position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [heading, setHeading] = useState<number | null>(null);
    const [qiblaDirection, setQiblaDirection] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocalisation non supportee');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });
                setQiblaDirection(calculateQiblaDirection(latitude, longitude));
                setDistance(calculateDistance(latitude, longitude));
                setPermissionGranted(true);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Activez la localisation pour trouver la Qibla');
            }
        );
    }, []);

    // Get compass heading (device orientation)
    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            // For iOS, we need webkitCompassHeading
            // For Android, we use alpha
            let compassHeading = 0;

            if ('webkitCompassHeading' in event) {
                compassHeading = (event as any).webkitCompassHeading;
            } else if (event.alpha !== null) {
                compassHeading = 360 - event.alpha;
            }

            setHeading(compassHeading);
        };

        // Request permission for iOS 13+
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            // iOS requires user interaction to request permission
            // We'll show a button for this
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, []);

    const requestOrientationPermission = async () => {
        try {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission === 'granted') {
                window.addEventListener('deviceorientation', (event) => {
                    let compassHeading = 0;
                    if ('webkitCompassHeading' in event) {
                        compassHeading = (event as any).webkitCompassHeading;
                    } else if (event.alpha !== null) {
                        compassHeading = 360 - event.alpha;
                    }
                    setHeading(compassHeading);
                }, true);
            }
        } catch (err) {
            console.error('Orientation permission error:', err);
        }
    };

    // Calculate needle rotation
    const needleRotation = heading !== null
        ? qiblaDirection - heading
        : qiblaDirection;

    return (
        <div className="qibla-page">
            {/* Header */}
            <div className="qibla-header">
                <button className="qibla-header-btn" onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
                <span className="qibla-title">
                    <Compass size={20} />
                    Direction Qibla
                </span>
                <button className="qibla-header-btn" onClick={() => navigate('/')}>
                    <Home size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="qibla-content">
                {error ? (
                    <div className="qibla-error">
                        <AlertCircle size={48} />
                        <p>{error}</p>
                        <button
                            className="qibla-retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            Reessayer
                        </button>
                    </div>
                ) : !permissionGranted ? (
                    <div className="qibla-loading">
                        <Compass size={48} className="qibla-spinner" />
                        <p>Recherche de votre position...</p>
                    </div>
                ) : (
                    <>
                        {/* Compass */}
                        <div className="qibla-compass-container">
                            <div className="qibla-compass">
                                {/* Compass Ring */}
                                <svg className="compass-ring" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="95" fill="none" stroke="#333" strokeWidth="2" />
                                    <circle cx="100" cy="100" r="85" fill="none" stroke="#444" strokeWidth="1" />

                                    {/* Cardinal directions */}
                                    <text x="100" y="25" textAnchor="middle" fill="#c9a84c" fontSize="14" fontWeight="bold">N</text>
                                    <text x="175" y="105" textAnchor="middle" fill="#888" fontSize="12">E</text>
                                    <text x="100" y="185" textAnchor="middle" fill="#888" fontSize="12">S</text>
                                    <text x="25" y="105" textAnchor="middle" fill="#888" fontSize="12">W</text>

                                    {/* Degree markers */}
                                    {Array.from({ length: 72 }, (_, i) => {
                                        const angle = i * 5 * Math.PI / 180;
                                        const length = i % 6 === 0 ? 10 : 5;
                                        return (
                                            <line
                                                key={i}
                                                x1={100 + 85 * Math.sin(angle)}
                                                y1={100 - 85 * Math.cos(angle)}
                                                x2={100 + (85 - length) * Math.sin(angle)}
                                                y2={100 - (85 - length) * Math.cos(angle)}
                                                stroke={i % 6 === 0 ? '#666' : '#444'}
                                                strokeWidth="1"
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Qibla Needle */}
                                <div
                                    className="qibla-needle"
                                    style={{ transform: `rotate(${needleRotation}deg)` }}
                                >
                                    <Navigation size={40} />
                                </div>

                                {/* Center Kaaba icon */}
                                <div className="compass-center">
                                    <MapPin size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="qibla-info">
                            <div className="qibla-stat">
                                <span className="qibla-stat-value">{Math.round(qiblaDirection)}°</span>
                                <span className="qibla-stat-label">Direction</span>
                            </div>
                            <div className="qibla-stat">
                                <span className="qibla-stat-value">{distance.toLocaleString()}</span>
                                <span className="qibla-stat-label">km de la Kaaba</span>
                            </div>
                        </div>

                        {/* iOS Permission Button */}
                        {heading === null && typeof (DeviceOrientationEvent as any).requestPermission === 'function' && (
                            <button
                                className="qibla-permission-btn"
                                onClick={requestOrientationPermission}
                            >
                                Activer la boussole
                            </button>
                        )}

                        {/* Instructions */}
                        <div className="qibla-instructions">
                            <p>
                                {heading !== null
                                    ? 'Tournez-vous jusqu\'a ce que la fleche pointe vers le haut'
                                    : 'Tenez votre telephone a plat et faites un 8 pour calibrer'
                                }
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Kaaba decoration */}
            <div className="qibla-kaaba-bg">🕋</div>
        </div>
    );
}
