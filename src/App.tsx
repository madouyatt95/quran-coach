import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu } from 'lucide-react';
import { BottomNav } from './components/Navigation/BottomNav';
import { ReadPage } from './pages/ReadPage';
import { HifdhPage } from './pages/HifdhPage';
import { SideMenu } from './components/Navigation/SideMenu';
import { MiniPlayer } from './components/MiniPlayer/MiniPlayer';

import { SettingsPage } from './pages/SettingsPage';
import { PrayerTimesPage } from './pages/PrayerTimesPage';
import { AdhkarPage } from './pages/AdhkarPage';
import { MosquesPage } from './pages/MosquesPage';
import { TafsirPage } from './pages/TafsirPage';
import { ShazamPage } from './pages/ShazamPage';
import { ProphetsPage } from './pages/ProphetsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ThemesPage } from './pages/ThemesPage';
import { QuizPage } from './pages/QuizPage';
import { HomePage } from './pages/HomePage';
import { QiblaPage } from './pages/QiblaPage';
import { useSettingsStore } from './stores/settingsStore';
import { useQuranStore } from './stores/quranStore';
import { useStatsStore } from './stores/statsStore';
import { fetchSurahs } from './lib/quranApi';
import { unlockAudio, isIOSPWA, isAudioUnlocked } from './lib/audioUnlock';
import { InstallPrompt } from './components/InstallPrompt/InstallPrompt';
import './index.css';

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
  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* Global burger menu button – hidden on Lecture (MushafPage has its own) */}
      {!isLecturePage && !isHomePage && (
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/read" element={null} />
          <Route path="/hifdh" element={<HifdhPage />} />

          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/prayers" element={<PrayerTimesPage />} />
          <Route path="/adhkar" element={<AdhkarPage />} />
          <Route path="/mosques" element={<MosquesPage />} />
          <Route path="/tafsir" element={<TafsirPage />} />
          <Route path="/shazam" element={<ShazamPage />} />
          <Route path="/prophets" element={<ProphetsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </main>
      <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
      <InstallPrompt />
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

