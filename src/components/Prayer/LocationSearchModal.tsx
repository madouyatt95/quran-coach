import { refreshPrayerLocation } from '../../lib/locationService';
import React, { useState } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { usePrayerStore } from '../../stores/prayerStore';
import './LocationSearchModal.css';

interface LocationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    name: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        country?: string;
    };
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ isOpen, onClose }) => {
    const store = usePrayerStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAutoLocating, setIsAutoLocating] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error('Erreur recherche ville:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAutoLocate = async () => {
        setIsAutoLocating(true);
        try {
            store.setLocationMode('auto');
            await refreshPrayerLocation(true);
            if(usePrayerStore.getState().locationError)return;
            onClose();
        } catch (error) {
            console.error('Erreur auto geoloc:', error);
            alert("Impossible d'obtenir votre position. Vérifiez vos permissions.");
        } finally {
            setIsAutoLocating(false);
        }
    };

    const handleSelectResult = (r: NominatimResult) => {
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);

        let city = r.name;
        if (r.address) {
            city = r.address.city || r.address.town || r.address.village || city;
        }

        const country = r.address?.country || '';

        store.setLocationMode('fixed');
        store.updateCoords(lat, lon, city, country);
        onClose();
    };

    return (
        <div className="location-modal-overlay">
            <div className="location-modal">
                <div className="location-modal__header">
                    <h2>Changer de lieu</h2>
                    <button className="location-modal__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="location-modal__content">
                    {/* Auto Locate Button */}
                    <button
                        className="location-modal__auto-btn"
                        onClick={handleAutoLocate}
                        disabled={isAutoLocating}
                    >
                        {isAutoLocating ? <Loader2 className="spin" size={20} /> : <Navigation size={20} />}
                        Suivre ma position automatiquement
                    </button>

                    <p className="mosque-caption">Les horaires suivent vos déplacements lorsque l’application est ouverte. Une ville choisie ci-dessous reste fixe.</p>
                    {store.locationError && <p role="status">{store.locationError}</p>}
                    <div className="location-modal__divider">ou choisir une ville fixe</div>

                    {/* Search Form */}
                    <form className="location-modal__form" onSubmit={handleSearch}>
                        <div className="location-modal__input-wrapper">
                            <Search size={18} className="location-modal__search-icon" />
                            <input
                                type="text"
                                placeholder="Paris, Dubaï, Makkah..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={isSearching || !query.trim()} className="location-modal__submit">
                            {isSearching ? <Loader2 className="spin" size={18} /> : 'Rechercher'}
                        </button>
                    </form>

                    {/* Results */}
                    <div className="location-modal__results">
                        {results.map((r) => (
                            <button key={r.place_id} className="location-modal__result-item" onClick={() => handleSelectResult(r)}>
                                <MapPin size={18} className="result-icon" />
                                <div className="result-info">
                                    <span className="result-name">{r.name}</span>
                                    <span className="result-address">{r.display_name}</span>
                                </div>
                            </button>
                        ))}
                        {!isSearching && query && results.length === 0 && (
                            <div className="location-modal__empty">
                                Aucun résultat trouvé pour "{query}"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
