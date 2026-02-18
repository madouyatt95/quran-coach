import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Menu } from 'lucide-react';
import { BottomNav } from './components/Navigation/BottomNav';
import { ReadPage } from './pages/ReadPage';
import { SideMenu } from './components/Navigation/SideMenu';
import { MiniPlayer } from './components/MiniPlayer/MiniPlayer';
import { HomePage } from './pages/HomePage';
import { useSettingsStore } from './stores/settingsStore';
import { useQuranStore } from './stores/quranStore';
import { useStatsStore } from './stores/statsStore';
import { fetchSurahs } from './lib/quranApi';
import { unlockAudio, isIOSPWA, isAudioUnlocked } from './lib/audioUnlock';
import { InstallPrompt } from './components/InstallPrompt/InstallPrompt';
import { UpdateBanner } from './components/UpdateBanner';
import { updateLastVisit } from './lib/notificationService';
import { trackAppOpen, trackPageView } from './lib/analyticsService';
import './index.css';

// Lazy-loaded pages (code splitting)
const HifdhPage = lazy(() => import('./pages/HifdhPage').then(m => ({ default: m.HifdhPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimesPage').then(m => ({ default: m.PrayerTimesPage })));
const AdhkarPage = lazy(() => import('./pages/AdhkarPage').then(m => ({ default: m.AdhkarPage })));
const ListenPage = lazy(() => import('./pages/ListenPage').then(m => ({ default: m.ListenPage })));
const ReciterDetailPage = lazy(() => import('./pages/ReciterDetailPage').then(m => ({ default: m.ReciterDetailPage })));
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage').then(m => ({ default: m.PlaylistDetailPage })));
const AdminAssetsPage = lazy(() => import('./pages/AdminAssetsPage').then(m => ({ default: m.AdminAssetsPage })));
const TafsirPage = lazy(() => import('./pages/TafsirPage').then(m => ({ default: m.TafsirPage })));
const ShazamPage = lazy(() => import('./pages/ShazamPage').then(m => ({ default: m.ShazamPage })));
const ProphetsPage = lazy(() => import('./pages/ProphetsPage').then(m => ({ default: m.ProphetsPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const ThemesPage = lazy(() => import('./pages/ThemesPage').then(m => ({ default: m.ThemesPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then(m => ({ default: m.QuizPage })));
const HadithsPage = lazy(() => import('./pages/HadithsPage').then(m => ({ default: m.HadithsPage })));
const QiblaPage = lazy(() => import('./pages/QiblaPage').then(m => ({ default: m.QiblaPage })));
const PrayerSettingsPage = lazy(() => import('./pages/PrayerSettingsPage').then(m => ({ default: m.PrayerSettingsPage })));

// Minimal loading fallback
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--color-bg-tertiary)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ReadPage is always mounted, hidden when on other routes
// This preserves audio state, player UI, and reading tracking
function ReadPagePersistent() {
  const location = useLocation();
  const isActive = location.pathname === '/read';
  return (
    <div style={{ display: isActive ? 'contents' : 'none' }}>
      <ReadPage />
    </div>
  );
}

function AppContent() {
  const { theme, arabicFontSize } = useSettingsStore();
  const { surahs, setSurahs } = useQuranStore();
  const { startSession, endSession } = useStatsStore();
  const hasUnlockedAudio = useRef(false);
  const [showSideMenu, setShowSideMenu] = useState(false);

  // Track last visit for inactivity detection
  useEffect(() => {
    updateLastVisit();
    trackAppOpen();
  }, []);

  // Unlock audio on first user interaction (critical for iOS PWA)
  const handleFirstInteraction = useCallback(() => {
    if (hasUnlockedAudio.current || isAudioUnlocked()) return;
    hasUnlockedAudio.current = true;

    unlockAudio().then(success => {
      if (success) {
        console.log('[App] Audio unlocked on user interaction');
      }
    });

    // Remove listeners after first interaction
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('click', handleFirstInteraction);
  }, []);

  // Setup audio unlock listeners for iOS PWA
  useEffect(() => {
    if (isIOSPWA()) {
      console.log('[App] iOS PWA detected, setting up audio unlock');
      document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
      document.addEventListener('click', handleFirstInteraction);

      return () => {
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, [handleFirstInteraction]);

  // Apply theme on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply Arabic font size
  useEffect(() => {
    document.documentElement.setAttribute('data-arabic-size', arabicFontSize);
  }, [arabicFontSize]);

  // Prefetch surahs
  useEffect(() => {
    if (surahs.length === 0) {
      fetchSurahs().then(setSurahs).catch(console.error);
    }
  }, [surahs.length, setSurahs]);

  // Track reading session
  useEffect(() => {
    startSession();

    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [startSession, endSession]);

  const location = useLocation();
  const isLecturePage = location.pathname === '/read';

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      {/* Global burger menu button – hidden on Lecture (MushafPage has its own) */}
      {!isLecturePage && (
        <button
          className="global-menu-btn"
          onClick={() => setShowSideMenu(true)}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>
      )}

      <main style={{ flex: 1, paddingBottom: '80px' }}>
        {/* ReadPage always mounted to preserve audio state & tracking */}
        <ReadPagePersistent />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/read" element={null} />
            <Route path="/hifdh" element={<HifdhPage />} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/prayers" element={<PrayerTimesPage />} />
            <Route path="/prayer-settings" element={<PrayerSettingsPage />} />
            <Route path="/adhkar" element={<AdhkarPage />} />
            <Route path="/listen" element={<ListenPage />} />
            <Route path="/listen/:id" element={<ReciterDetailPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
            <Route path="/admin/assets" element={<AdminAssetsPage />} />
            <Route path="/tafsir" element={<TafsirPage />} />
            <Route path="/shazam" element={<ShazamPage />} />
            <Route path="/prophets" element={<ProphetsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/qibla" element={<QiblaPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/hadiths" element={<HadithsPage />} />
          </Routes>
        </Suspense>
      </main>
      <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
      <InstallPrompt />
      <UpdateBanner />
      <MiniPlayer />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

