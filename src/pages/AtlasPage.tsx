import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, MapPin } from 'lucide-react';
import { stories, STORY_CATEGORIES, type StoryCategory, type Story } from '../data/storiesData';
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

export function AtlasPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<StoryCategory | 'all'>('all');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // Get stories with locations
  const storiesWithLocation = useMemo(() =>
    stories.filter(s => s.location),
    []
  );

  // Filter stories
  const filteredStories = useMemo(() =>
    activeFilter === 'all'
      ? storiesWithLocation
      : storiesWithLocation.filter(s => s.category === activeFilter),
    [activeFilter, storiesWithLocation]
  );

  // Handle story query param (from StoriesPage "Voir sur la carte")
  useEffect(() => {
    const storyId = searchParams.get('story');
    if (storyId) {
      const story = stories.find(s => s.id === storyId);
      if (story?.location) {
        setSelectedStory(story);
        setFlyTo({ lat: story.location.lat, lng: story.location.lng, zoom: 10 });
        // Open popup after fly animation
        setTimeout(() => {
          markerRefs.current[storyId]?.openPopup();
        }, 1600);
      }
    }
  }, [searchParams]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: storiesWithLocation.length };
    storiesWithLocation.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [storiesWithLocation]);

  const handleMarkerClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleListItemClick = (story: Story) => {
    if (story.location) {
      setSelectedStory(story);
      setFlyTo({ lat: story.location.lat, lng: story.location.lng, zoom: 10 });
      setTimeout(() => {
        markerRefs.current[story.id]?.openPopup();
      }, 1600);
    }
  };

  const handleReadStory = (story: Story) => {
    navigate(`/stories?story=${story.id}`);
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
          <div className="stat-value">{storiesWithLocation.length}</div>
          <div className="stat-label">Lieux</div>
        </div>
        <div className="atlas-stat">
          <div className="stat-value">{Object.keys(STORY_CATEGORIES).length}</div>
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
        {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={`atlas-filter-btn ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setActiveFilter(key as StoryCategory)}
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

          {/* Story markers */}
          {filteredStories.map(story => (
            story.location && (
              <Marker
                key={story.id}
                position={[story.location.lat, story.location.lng]}
                icon={createEmojiIcon(
                  story.icon,
                  STORY_CATEGORIES[story.category].color,
                  selectedStory?.id === story.id
                )}
                ref={(ref) => { if (ref) markerRefs.current[story.id] = ref; }}
                eventHandlers={{
                  click: () => handleMarkerClick(story),
                }}
              >
                <Popup className="atlas-popup" maxWidth={280}>
                  <div className="popup-content">
                    <div className="popup-header">
                      <span className="popup-emoji">{story.icon}</span>
                      <div className="popup-titles">
                        <div className="popup-title">{story.title}</div>
                        <div className="popup-title-ar">{story.titleAr}</div>
                      </div>
                    </div>
                    <span className="popup-category" style={{ background: STORY_CATEGORIES[story.category].color }}>
                      {STORY_CATEGORIES[story.category].icon} {STORY_CATEGORIES[story.category].label}
                    </span>
                    <div className="popup-location">
                      <MapPin size={12} /> {story.location.name} — {story.location.nameAr}
                    </div>
                    <div className="popup-summary">{story.summary}</div>
                    <button className="popup-btn" onClick={() => handleReadStory(story)}>
                      📖 Lire le récit
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Location list */}
      <div className="atlas-list">
        <h3>📍 {filteredStories.length} lieux sur la carte</h3>
        <div className="atlas-list-grid">
          {filteredStories.map(story => (
            <div
              key={story.id}
              className={`atlas-list-item ${selectedStory?.id === story.id ? 'active' : ''}`}
              onClick={() => handleListItemClick(story)}
            >
              <span className="item-emoji">{story.icon}</span>
              <div className="item-info">
                <div className="item-title">{story.title}</div>
                <div className="item-location">{story.location?.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AtlasPage;
