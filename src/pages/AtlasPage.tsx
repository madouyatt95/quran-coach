import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, MapPin, Layers, Clock, Compass, Target } from 'lucide-react';
import { stories, STORY_CATEGORIES, type Story } from '../data/storiesData';
import { prophets } from '../data/prophets';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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

const HIJRA_ROUTE: [number, number][] = [
  [21.42, 39.83],  // La Mecque
  [24.47, 39.61],  // Médine
];

const EXODUS_ROUTE: [number, number][] = [
  [30.79, 31.83],  // Égypte (Gosen)
  [29.97, 32.55],  // Traversée de la Mer Rouge
  [28.54, 33.97],  // Mont Sinaï
];

const IBRAHIM_ROUTE: [number, number][] = [
  [30.96, 46.10],  // Ur (Irak)
  [31.52, 35.10],  // Hébron (Palestine)
  [21.42, 39.83],  // La Mecque
];

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

const HD_SITES = [
  { id: 'hira', lat: 21.459, lng: 39.859, name: 'Grotte de Hira', icon: '⛰️', desc: 'Première révélation formelle (Surah Al-Alaq)' },
  { id: 'thawr', lat: 21.378, lng: 39.851, name: 'Grotte de Thawr', icon: '🕷️', desc: 'Refuge du Prophète ﷺ et d\'Abu Bakr pendant la Hijra' },
  { id: 'safa-marwa', lat: 21.423, lng: 39.827, name: 'Safa et Marwa', icon: '🏃', desc: 'Le parcours de Hajar cherchant de l\'eau' },
  { id: 'arafat', lat: 21.354, lng: 39.984, name: 'Mont Arafat', icon: '🤲', desc: 'Lieu du pardon, essentiel du Hajj' },
  { id: 'mina', lat: 21.413, lng: 39.888, name: 'Mina', icon: '⛺', desc: 'La vallée des tentes' },
  { id: 'aqsa', lat: 31.776, lng: 35.235, name: 'Mosquée Al-Aqsa', icon: '🕌', desc: 'Première Qibla et lieu du voyage nocturne' },
  { id: 'rock', lat: 31.778, lng: 35.235, name: 'Le Rocher (Mont du Temple)', icon: '🪨', desc: 'Lieu d\'Ascension (Mi\'raj) du Prophète ﷺ' },
];

function ZoomListener({ onZoom }: { onZoom: (zoom: number) => void }) {
  useMapEvents({
    zoomend: (e) => onZoom(e.target.getZoom()),
  });
  return null;
}

function QuizMapListener({ active, onMapClick }: { active: boolean; onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Era Constants
export type Era = 'pre-flood' | 'patriarchs' | 'exodus' | 'kings' | 'roman' | 'prophetic';

export const ERA_INFO: Record<Era | 'all', { label: string, color: string }> = {
  'all': { label: 'Toutes les époques', color: '#ffffff' },
  'pre-flood': { label: "L'Aube de l'Humanité", color: '#8D6E63' },
  'patriarchs': { label: 'L\'Ère des Patriarches', color: '#D4E157' },
  'exodus': { label: 'L\'Exode', color: '#FF7043' },
  'kings': { label: 'Le Royaume d\'Israël', color: '#AB47BC' },
  'roman': { label: 'L\'Ère Romaine', color: '#26C6DA' },
  'prophetic': { label: 'L\'Ère Prophétique', color: '#FFD700' },
};

function getEraForProphet(name: string): Era {
   const n = name.toLowerCase();
   if (['adam', 'idris', 'nuh'].some(x => n.includes(x))) return 'pre-flood';
   if (['musa', 'harun'].some(x => n.includes(x))) return 'exodus';
   if (['dawud', 'sulayman', 'ilyas', 'alyasa', 'yunus'].some(x => n.includes(x))) return 'kings';
   if (['zakariyya', 'yahya', 'isa'].some(x => n.includes(x))) return 'roman';
   if (['muhammad'].some(x => n.includes(x))) return 'prophetic';
   return 'patriarchs';
}

function getEraForStory(id: string): Era {
   if (id === 'caverne' || id === 'maryam') return 'roman';
   if (['elephant', 'isra-miraj', 'badr', 'uhud', 'khandaq', 'tabuk'].includes(id)) return 'prophetic';
   if (['pharaon', 'karun', 'vache', 'samiri'].includes(id)) return 'exodus';
   if (['talut-jalut', 'saba', 'huppe'].includes(id)) return 'kings';
   if (['aad', 'thamud', 'madyan', 'luqman', 'jardin', 'qabil-habil'].includes(id)) return 'patriarchs';
   return 'patriarchs'; // Default fallback 
}

// Map layer constants
const MAP_STYLES = {
  dark: { name: 'Thème Sombre', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  satellite: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  parchment: { name: 'Mappemonde', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}' }
};

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
  era: Era;
  imageUrl?: string;
};

export function AtlasPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeEra, setActiveEra] = useState<Era | 'all'>('all');
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('dark');
  const [currentZoom, setCurrentZoom] = useState(5);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizTarget, setQuizTarget] = useState<AtlasItem | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTurn, setQuizTurn] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<{message: string, success: boolean} | null>(null);
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
          era: getEraForStory(s.id),
          imageUrl: s.location?.imageUrl
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
          era: getEraForProphet(p.nameFr),
          imageUrl: p.location?.imageUrl
        });
      }
    });

    return items;
  }, []);

  const filteredItems = useMemo<AtlasItem[]>(() => {
    let result = atlasItems;
    if (activeFilter !== 'all') {
      result = result.filter((i: AtlasItem) => i.category === activeFilter);
    }
    if (activeEra !== 'all') {
      result = result.filter((i: AtlasItem) => i.era === activeEra);
    }
    return result;
  }, [activeFilter, activeEra, atlasItems]);

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

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: atlasItems.length };
    atlasItems.forEach((i: AtlasItem) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [atlasItems]);

  const startQuiz = () => {
    setIsQuizMode(true);
    setQuizScore(0);
    setQuizTurn(1);
    setQuizFeedback(null);
    setMapStyle('parchment'); 
    setFlyTo({ lat: 25, lng: 40, zoom: 4 });
    const candidates = atlasItems;
    setQuizTarget(candidates[Math.floor(Math.random() * candidates.length)]);
  };

  const stopQuiz = () => {
    setIsQuizMode(false);
    setQuizTarget(null);
    setQuizFeedback(null);
    setFlyTo({ lat: 25, lng: 40, zoom: 5 });
  };

  const handleQuizClick = (lat: number, lng: number) => {
    if (!quizTarget || quizFeedback) return;
    
    const dist = getDistance(lat, lng, quizTarget.location.lat, quizTarget.location.lng);
    const success = dist < 300; // tolérance
    
    if (success) {
      if (Capacitor.isNativePlatform()) Haptics.impact({ style: ImpactStyle.Medium });
      setQuizScore(s => s + 1);
      setQuizFeedback({ message: `Bravo ! Vous étiez à ${Math.round(dist)} km.`, success: true });
    } else {
      if (Capacitor.isNativePlatform()) Haptics.impact({ style: ImpactStyle.Light });
      setQuizFeedback({ message: `Raté ! La cible était à ${Math.round(dist)} km (${quizTarget.location.name}).`, success: false });
    }

    setFlyTo({ lat: quizTarget.location.lat, lng: quizTarget.location.lng, zoom: 6 });

    setTimeout(() => {
      if (quizTurn < 5) {
        setQuizTurn(t => t + 1);
        setQuizFeedback(null);
        const candidates = atlasItems;
        setQuizTarget(candidates[Math.floor(Math.random() * candidates.length)]);
      } else {
        alert(`Quiz terminé ! Score : ${success ? quizScore + 1 : quizScore}/5`);
        stopQuiz();
      }
    }, 4000);
  };

  const handleFindQibla = async () => {
    setIsLocating(true);
    
    try {
      const { resolveCoords } = await import('../lib/locationService');
      const coords = await resolveCoords();
      const loc: [number, number] = [coords.lat, coords.lng];
      setUserLocation(loc);
      setFlyTo({ lat: loc[0], lng: loc[1], zoom: 4 });
    } catch (e) {
      alert("Impossible de déterminer votre position. Veuillez autoriser la géolocalisation.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleMarkerClick = (item: AtlasItem) => {
    if (Capacitor.isNativePlatform()) Haptics.impact({ style: ImpactStyle.Light });
    setSelectedItem(item);
  };

  const handleListItemClick = (item: AtlasItem) => {
    if (Capacitor.isNativePlatform()) Haptics.impact({ style: ImpactStyle.Light });
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

  const handleGoToQuran = (surah: number, ayah?: number) => {
    navigate(`/read?surah=${surah}${ayah ? `&ayah=${ayah}` : ''}`);
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
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
          <button 
            className="qibla-btn"
            onClick={handleFindQibla}
            disabled={isLocating || isQuizMode}
            style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(201,168,76,0.15)', color: 'var(--color-accent)', border: '1px solid rgba(201,168,76,0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
          >
            <Compass size={18} /> {isLocating ? 'Recherche...' : userLocation ? 'Ma Qibla' : 'Afficher ma Qibla'}
          </button>
          {!isQuizMode && (
             <button 
               className="quiz-btn"
               onClick={startQuiz}
               style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
             >
               <Target size={18} /> Jouer au Quiz
             </button>
          )}
        </div>
      </div>

      {isQuizMode && quizTarget && (
        <div className="atlas-quiz-overlay" style={{ background: 'rgba(15,23,42,0.9)', padding: '15px 20px', borderRadius: '12px', margin: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',  border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', textAlign: 'center' }}>📌 Trouvez : <span style={{ color: 'var(--color-accent)' }}>{quizTarget.title}</span></h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Tour {quizTurn}/5 — Score: {quizScore}</p>
          {quizFeedback && (
            <div style={{ background: quizFeedback.success ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)', color: quizFeedback.success ? '#81C784' : '#E57373', padding: '10px', borderRadius: '8px', width: '100%', textAlign: 'center' }}>
              {quizFeedback.message}
            </div>
          )}
          <button onClick={stopQuiz} style={{ background: 'transparent', color: '#ccc', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', marginTop: '5px' }}>Quitter le Quiz</button>
        </div>
      )}

      {/* Stats */}
      {!isQuizMode && (
        <>
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

      {/* Timeline Filter */}
      <div className="atlas-timeline">
        <button
          className={`timeline-era-btn ${activeEra === 'all' ? 'active' : ''}`}
          onClick={() => setActiveEra('all')}
        >
          <Clock size={16} /> Chronologie (Toutes)
        </button>
        {(Object.keys(ERA_INFO) as Array<Era | 'all'>).filter(k => k !== 'all').map(era => (
          <button
            key={era}
            className={`timeline-era-btn ${activeEra === era ? 'active' : ''}`}
            onClick={() => setActiveEra(era)}
            style={{ color: activeEra === era ? '#fff' : ERA_INFO[era].color, borderColor: ERA_INFO[era].color }}
          >
            <div className="timeline-era-dot" style={{ background: ERA_INFO[era].color }}></div>
            {ERA_INFO[era].label}
          </button>
        ))}
      </div>
      </>
      )}

      {/* Map */}
      <div className="atlas-map-container" style={{ position: 'relative' }}>
        <div className="atlas-map-controls">
           {Object.entries(MAP_STYLES).map(([key, style]) => (
             <button
               key={key}
               className={`map-style-btn ${mapStyle === key ? 'active' : ''}`}
               onClick={() => setMapStyle(key as keyof typeof MAP_STYLES)}
             >
               <Layers size={14} /> {style.name}
             </button>
           ))}
        </div>
        <MapContainer
          center={[25, 40]}
          zoom={5}
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={mapStyle}
            url={MAP_STYLES[mapStyle].url}
            attribution='&copy; Atlas'
          />

          <ZoomListener onZoom={setCurrentZoom} />
          <QuizMapListener active={isQuizMode} onMapClick={handleQuizClick} />

          {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}

          {/* User Qibla Line */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={createEmojiIcon('📍', '#2196F3', false)}>
                <Popup className="atlas-popup">
                  <div className="popup-content" style={{ textAlign: 'center', padding: '10px' }}>
                    <strong>Votre position</strong>
                  </div>
                </Popup>
              </Marker>
              <Polyline 
                positions={[userLocation, [21.4225, 39.8262]]} 
                pathOptions={{ color: '#2196F3', weight: 3, dashArray: '5, 10', opacity: 0.8 }} 
              />
            </>
          )}

          {/* HD Markers (Zoom > 12) */}
          {currentZoom > 12 && HD_SITES.map(site => (
            <Marker key={site.id} position={[site.lat, site.lng]} icon={createEmojiIcon(site.icon, '#9C27B0', false)}>
              <Popup className="atlas-popup" maxWidth={250}>
                <div className="popup-content">
                  <div className="popup-header">
                    <span className="popup-emoji">{site.icon}</span>
                    <div className="popup-titles">
                      <div className="popup-title">{site.name}</div>
                      <div className="popup-category" style={{ background: '#9C27B0' }}>Lieu Saint (Vue HD)</div>
                    </div>
                  </div>
                  <div className="popup-summary" style={{ marginTop: '10px' }}>{site.desc}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Polylines for routes */}
          {(activeEra === 'all' || activeEra === 'prophetic') && (
            <>
              <Polyline positions={ISRA_MIRAJ_ROUTE} pathOptions={{ color: '#c9a84c', weight: 2, dashArray: '8, 8', opacity: 0.7 }} />
              <Polyline positions={HIJRA_ROUTE} pathOptions={{ color: '#FFD700', weight: 2, dashArray: '8, 8', opacity: 0.7 }} />
            </>
          )}

          {(activeEra === 'all' || activeEra === 'kings') && (
            <Polyline positions={HUPPE_ROUTE} pathOptions={{ color: '#33691E', weight: 2, dashArray: '8, 8', opacity: 0.7 }} />
          )}

          {(activeEra === 'all' || activeEra === 'exodus') && (
            <Polyline positions={EXODUS_ROUTE} pathOptions={{ color: '#FF7043', weight: 2, dashArray: '8, 8', opacity: 0.7 }} />
          )}

          {(activeEra === 'all' || activeEra === 'patriarchs') && (
            <Polyline positions={IBRAHIM_ROUTE} pathOptions={{ color: '#D4E157', weight: 2, dashArray: '8, 8', opacity: 0.7 }} />
          )}

          {/* Story and Prophet markers (Hidden during quiz except for feedback) */}
          {(!isQuizMode || quizFeedback) && filteredItems.map(item => (
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
                      <div className="popup-title-ar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.titleAr}
                        {item.category === 'duas' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); const u = new SpeechSynthesisUtterance(item.titleAr); u.lang='ar-SA'; window.speechSynthesis.speak(u); }} 
                            style={{ background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#00BCD4' }}
                            title="Écouter"
                          >
                            🔊
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="popup-category" style={{ background: item.color }}>
                    {item.categoryLabel}
                  </span>
                  
                  {/* Image Display Fixed */}
                  {item.location.imageUrl && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img 
                        src={item.location.imageUrl} 
                        alt={item.title} 
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="popup-location">
                    <MapPin size={12} /> {item.location.name} — {item.location.nameAr}
                  </div>
                  <div className="popup-summary">{item.summary}</div>
                  
                  <div className="popup-actions" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="popup-btn" onClick={() => handleReadStory(item)}>
                      {item.type === 'story' ? '📖 Lire le récit' : '📜 Voir la biographie'}
                    </button>
                    
                    {/* Redirection vers le Coran */}
                    {item.type === 'story' && (stories.find(s => s.id === item.originalId)?.surahs?.[0]) && (
                      <button 
                        className="popup-btn" 
                        style={{ background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
                        onClick={() => {
                          const s = stories.find(st => st.id === item.originalId);
                          if (s?.surahs?.[0]) {
                            handleGoToQuran(s.surahs[0].number, s.surahs[0].startAyah);
                          }
                        }}
                      >
                        📖 Lire le Verset Coranique
                      </button>
                    )}
                    
                    {item.type === 'prophet' && (prophets.find(p => p.id === item.originalId)?.surahs?.[0]) && (
                      <button 
                        className="popup-btn" 
                        style={{ background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
                        onClick={() => {
                          const p = prophets.find(pr => pr.id === item.originalId);
                          if (p?.surahs?.[0]) {
                            handleGoToQuran(p.surahs[0].number, p.surahs[0].startAyah);
                          }
                        }}
                      >
                        📖 Lire le Verset Coranique
                      </button>
                    )}
                  </div>
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
