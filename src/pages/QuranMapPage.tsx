import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { X, Home, BookOpen } from 'lucide-react';
import { QURAN_LOCATIONS, LOCATION_CATEGORIES, type QuranLocation } from '../data/quranLocations';
import { useQuranStore } from '../stores/quranStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './QuranMapPage.css';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom marker icon
const createCustomIcon = (category: string) => {
    const colors: Record<string, string> = {
        city: '#c9a84c',
        mountain: '#4CAF50',
        sea: '#2196F3',
        region: '#9C27B0',
        prophet: '#FF9800',
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 24px;
            height: 24px;
            background: ${colors[category] || '#c9a84c'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Component to fly to location
function FlyToLocation({ coords }: { coords: [number, number] | null }) {
    const map = useMap();
    if (coords) {
        map.flyTo(coords, 8, { duration: 1 });
    }
    return null;
}

export function QuranMapPage() {
    const navigate = useNavigate();
    const { goToAyah } = useQuranStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<QuranLocation | null>(null);
    const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

    const filteredLocations = selectedCategory === 'all'
        ? QURAN_LOCATIONS
        : QURAN_LOCATIONS.filter(loc => loc.category === selectedCategory);

    const handleLocationClick = (location: QuranLocation) => {
        setSelectedLocation(location);
        setFlyToCoords(location.coords);
    };

    const handleVerseClick = (surah: number, ayah: number) => {
        goToAyah(surah, ayah);
        navigate('/read');
    };

    return (
        <div className="quran-map-page">
            {/* Header */}
            <div className="quran-map-header">
                <button className="quran-map-header-btn" onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
                <span className="quran-map-title">Carte du Coran</span>
                <button className="quran-map-header-btn" onClick={() => navigate('/')}>
                    <Home size={24} />
                </button>
            </div>

            {/* Category Filter */}
            <div className="quran-map-filters">
                {LOCATION_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Map */}
            <div className="quran-map-container">
                <MapContainer
                    center={[25, 40]}
                    zoom={4}
                    className="quran-map"
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FlyToLocation coords={flyToCoords} />

                    {filteredLocations.map(location => (
                        <Marker
                            key={location.id}
                            position={location.coords}
                            icon={createCustomIcon(location.category)}
                            eventHandlers={{
                                click: () => handleLocationClick(location),
                            }}
                        >
                            <Popup>
                                <div className="map-popup">
                                    <h3>{location.nameAr}</h3>
                                    <h4>{location.name}</h4>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Location Details Panel */}
            {selectedLocation && (
                <div className="location-panel">
                    <div className="location-panel-header">
                        <div>
                            <span className="location-panel-name-ar">{selectedLocation.nameAr}</span>
                            <span className="location-panel-name">{selectedLocation.name}</span>
                        </div>
                        <button onClick={() => setSelectedLocation(null)}>
                            <X size={20} />
                        </button>
                    </div>

                    <p className="location-panel-desc">{selectedLocation.description}</p>

                    <div className="location-panel-verses">
                        <h4><BookOpen size={16} /> Versets liés</h4>
                        {selectedLocation.verses.map((verse, i) => (
                            <button
                                key={i}
                                className="verse-link"
                                onClick={() => handleVerseClick(verse.surah, verse.ayah)}
                            >
                                <span className="verse-ref">{verse.surahName} ({verse.surah}:{verse.ayah})</span>
                                <span className="verse-excerpt">{verse.excerpt}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Location List */}
            <div className="location-list">
                {filteredLocations.map(location => (
                    <button
                        key={location.id}
                        className={`location-item ${selectedLocation?.id === location.id ? 'active' : ''}`}
                        onClick={() => handleLocationClick(location)}
                    >
                        <span className="location-item-name-ar">{location.nameAr}</span>
                        <span className="location-item-name">{location.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
