import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, RefreshCw, Building2 } from 'lucide-react';
import './MosquesPage.css';

interface Mosque {
    id: number;
    name: string;
    lat: number;
    lon: number;
    distance: number;
    address?: string;
}

export function MosquesPage() {
    const navigate = useNavigate();
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calculate distance between two coordinates in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Fetch mosques from Overpass API (OpenStreetMap)
    const fetchMosques = async (lat: number, lon: number) => {
        try {
            const radius = 10000; // 10km radius
            const query = `
                [out:json][timeout:25];
                (
                    node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
                    way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
                );
                out center;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query,
            });

            const data = await response.json();

            const mosquesList: Mosque[] = data.elements.map((element: any) => {
                const mosqueLat = element.lat || element.center?.lat;
                const mosqueLon = element.lon || element.center?.lon;
                const distance = calculateDistance(lat, lon, mosqueLat, mosqueLon);

                return {
                    id: element.id,
                    name: element.tags?.name || 'Mosquée',
                    lat: mosqueLat,
                    lon: mosqueLon,
                    distance,
                    address: element.tags?.['addr:street']
                        ? `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}, ${element.tags['addr:city'] || ''}`.trim()
                        : undefined,
                };
            });

            // Sort by distance
            mosquesList.sort((a, b) => a.distance - b.distance);
            setMosques(mosquesList);
        } catch (err) {
            console.error('Error fetching mosques:', err);
            setError('Impossible de charger les mosquées');
        }
    };

    // Get user location and fetch mosques
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await fetchMosques(latitude, longitude);
                setLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Impossible d\'accéder à votre position');
                setLoading(false);
            }
        );
    }, []);

    // Open directions in Google Maps
    const openDirections = (mosque: Mosque) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`;
        window.open(url, '_blank');
    };

    // Format distance
    const formatDistance = (km: number): string => {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`;
        }
        return `${km.toFixed(1)} km`;
    };

    if (loading) {
        return (
            <div className="mosques-page">
                <div className="mosques-header">
                    <button className="mosques-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="mosques-title">Mosquées</h1>
                    <div style={{ width: 44 }} />
                </div>
                <div className="mosques-loading">
                    <RefreshCw size={48} className="spin" />
                    <p>Recherche des mosquées...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mosques-page">
            <div className="mosques-header">
                <button className="mosques-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="mosques-title">Mosquées</h1>
                <div style={{ width: 44 }} />
            </div>

            <div className="mosques-subtitle">
                <MapPin size={16} />
                <span>À proximité de votre position</span>
            </div>

            {error ? (
                <div className="mosques-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Réessayer</button>
                </div>
            ) : mosques.length === 0 ? (
                <div className="mosques-empty">
                    <Building2 size={48} />
                    <p>Aucune mosquée trouvée dans un rayon de 10 km</p>
                </div>
            ) : (
                <div className="mosques-list">
                    {mosques.map((mosque) => (
                        <div key={mosque.id} className="mosque-card">
                            <div className="mosque-icon">
                                <Building2 size={24} />
                            </div>
                            <div className="mosque-info">
                                <h3 className="mosque-name">{mosque.name}</h3>
                                {mosque.address && (
                                    <p className="mosque-address">{mosque.address}</p>
                                )}
                                <span className="mosque-distance">
                                    <MapPin size={14} />
                                    {formatDistance(mosque.distance)}
                                </span>
                            </div>
                            <button
                                className="mosque-directions-btn"
                                onClick={() => openDirections(mosque)}
                            >
                                <Navigation size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mosques-footer">
                <p>Données : OpenStreetMap</p>
            </div>
        </div>
    );
}
