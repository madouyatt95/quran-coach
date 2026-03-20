import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, MapPin } from 'lucide-react';
import { stories, STORY_CATEGORIES, type Story } from '../data/storiesData';
import { prophets } from '../data/prophets';
import 'leaflet/dist/leaflet.css';
import './AtlasPage.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create custom marker icon with emoji
function createEmojiIcon(emoji: string, color: string, isActive: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="atlas-marker ${isActive ? 'active' : ''}" style="background:${color}22;border-color:${color}">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// Component to fly to a location
function FlyToLocation({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }, [map, lat, lng, zoom]);
  return null;
}

// Isra & Mi'raj route
const ISRA_MIRAJ_ROUTE: [number, number][] = [
  [21.42, 39.83],  // La Mecque
  [31.78, 35.24],  // Jérusalem
];

// Huppe route (Jérusalem → Ma'rib)
const HUPPE_ROUTE: [number, number][] = [
  [31.78, 35.23],  // Jérusalem
  [15.42, 45.35],  // Ma'rib
];

type AtlasItem = {
  id: string;
  type: 'story' | 'prophet';
  title: string;
  titleAr: string;
  summary: string;
  icon: string;
  color: string;
  category: string;
  location: NonNullable<Story['location']>;
  originalId: string;
  categoryLabel: string;
  categoryIcon: string;
};

export function AtlasPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AtlasItem | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const atlasItems = useMemo<AtlasItem[]>(() => {
    const items: AtlasItem[] = [];
    
    stories.forEach(s => {
      if (s.location) {
        items.push({
          id: `story-${s.id}`,
          type: 'story',
          title: s.title,
          titleAr: s.titleAr,
          summary: s.summary,
          icon: s.icon,
          color: STORY_CATEGORIES[s.category].color,
          category: s.category,
          location: s.location,
          originalId: s.id,
          categoryLabel: STORY_CATEGORIES[s.category].label,
          categoryIcon: STORY_CATEGORIES[s.category].icon,
        });
      }
    });

    prophets.forEach(p => {
      if (p.location) {
        items.push({
          id: `prophet-${p.id}`,
          type: 'prophet',
          title: p.nameFr,
          titleAr: p.nameAr,
          summary: p.summary,
          icon: p.icon,
          color: p.color,
          category: 'prophetes',
          location: p.location,
          originalId: p.id,
          categoryLabel: 'Prophètes',
          categoryIcon: '📜',
        });
      }
    });

    return items;
  }, []);

  const filteredItems = useMemo(() =>
    activeFilter === 'all'
      ? atlasItems
      : atlasItems.filter(i => i.category === activeFilter),
    [activeFilter, atlasItems]
  );

  useEffect(() => {
    const storyId = searchParams.get('story');
    const prophetId = searchParams.get('prophet');
    let item: AtlasItem | undefined;

    if (storyId) {
      item = atlasItems.find(i => i.type === 'story' && i.originalId === storyId);
    } else if (prophetId) {
      item = atlasItems.find(i => i.type === 'prophet' && i.originalId === prophetId);
    }

    if (item) {
      setSelectedItem(item);
      setFlyTo({ lat: item.location.lat, lng: item.location.lng, zoom: 10 });
      setTimeout(() => {
        markerRefs.current[item!.id]?.openPopup();
      }, 1600);
    }
  }, [searchParams, atlasItems]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: atlasItems.length };
    atlasItems.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [atlasItems]);

  const handleMarkerClick = (item: AtlasItem) => {
    setSelectedItem(item);
  };

  const handleListItemClick = (item: AtlasItem) => {
    setSelectedItem(item);
    setFlyTo({ lat: item.location.lat, lng: item.location.lng, zoom: 10 });
    setTimeout(() => {
      markerRefs.current[item.id]?.openPopup();
    }, 1600);
  };

  const handleReadStory = (item: AtlasItem) => {
    if (item.type === 'story') {
      navigate(`/stories?story=${item.originalId}`);
    } else {
      navigate(`/prophets?prophet=${item.originalId}`);
    }
  };

  return (
    <div className="atlas-page">
      {/* Header */}
      <div className="atlas-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
            <ArrowLeft size={22} />
          </button>
          <h1>🗺️ Atlas du Coran</h1>
        </div>
        <div className="atlas-title-ar">أَطْلَسُ القُرْآن</div>
        <p>Découvrez les lieux des récits coraniques</p>
      </div>

      {/* Stats */}
      <div className="atlas-stats">
        <div className="atlas-stat">
          <div className="stat-value">{atlasItems.length}</div>
          <div className="stat-label">Lieux</div>
        </div>
        <div className="atlas-stat">
          <div className="stat-value">{Object.keys(STORY_CATEGORIES).length + 1}</div>
          <div className="stat-label">Catégories</div>
        </div>
        <div className="atlas-stat">
          <div className="stat-value">10+</div>
          <div className="stat-label">Pays</div>
        </div>
      </div>

      {/* Filters */}
      <div className="atlas-filters">
        <button
          className={`atlas-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          🌍 Tous <span className="count">{categoryCounts.all}</span>
        </button>
        <button
          className={`atlas-filter-btn ${activeFilter === 'prophetes' ? 'active' : ''}`}
          onClick={() => setActiveFilter('prophetes')}
          style={activeFilter === 'prophetes' ? {} : { borderColor: '#c9a84c66' }}
        >
          📜 Prophètes <span className="count">{categoryCounts['prophetes'] || 0}</span>
        </button>
        {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={`atlas-filter-btn ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setActiveFilter(key)}
            style={activeFilter === key ? {} : { borderColor: cat.color + '66' }}
          >
            {cat.icon} {cat.label} <span className="count">{categoryCounts[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="atlas-map-container">
        <MapContainer
          center={[25, 40]}
          zoom={5}
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}

          {/* Isra & Mi'raj route */}
          {(activeFilter === 'all' || activeFilter === 'evenements') && (
            <Polyline
              positions={ISRA_MIRAJ_ROUTE}
              pathOptions={{ color: '#c9a84c', weight: 2, dashArray: '8, 8', opacity: 0.7 }}
            />
          )}

          {/* Huppe route */}
          {(activeFilter === 'all' || activeFilter === 'divers') && (
            <Polyline
              positions={HUPPE_ROUTE}
              pathOptions={{ color: '#33691E', weight: 2, dashArray: '8, 8', opacity: 0.7 }}
            />
          )}

          {/* Story and Prophet markers */}
          {filteredItems.map(item => (
            <Marker
              key={item.id}
              position={[item.location.lat, item.location.lng]}
              icon={createEmojiIcon(
                item.icon,
                item.color,
                selectedItem?.id === item.id
              )}
              ref={(ref) => { if (ref) markerRefs.current[item.id] = ref; }}
              eventHandlers={{
                click: () => handleMarkerClick(item),
              }}
            >
              <Popup className="atlas-popup" maxWidth={280}>
                <div className="popup-content">
                  <div className="popup-header">
                    <span className="popup-emoji">{item.icon}</span>
                    <div className="popup-titles">
                      <div className="popup-title">{item.title}</div>
                      <div className="popup-title-ar">{item.titleAr}</div>
                    </div>
                  </div>
                  <span className="popup-category" style={{ background: item.color }}>
                    {item.categoryIcon} {item.categoryLabel}
                  </span>
                  <div className="popup-location">
                    <MapPin size={12} /> {item.location.name} — {item.location.nameAr}
                  </div>
                  <div className="popup-summary">{item.summary}</div>
                  <button className="popup-btn" onClick={() => handleReadStory(item)}>
                    {item.type === 'story' ? '📖 Lire le récit' : '📜 Voir la biographie'}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Location list */}
      <div className="atlas-list">
        <h3>📍 {filteredItems.length} lieux sur la carte</h3>
        <div className="atlas-list-grid">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`atlas-list-item ${selectedItem?.id === item.id ? 'active' : ''}`}
              onClick={() => handleListItemClick(item)}
            >
              <span className="item-emoji">{item.icon}</span>
              <div className="item-info">
                <div className="item-title">{item.title}</div>
                <div className="item-location">{item.location.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AtlasPage;
