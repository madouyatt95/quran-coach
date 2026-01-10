import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useCallback, useRef } from 'react';
import { BottomNav } from './components/Navigation/BottomNav';
import { ReadPage } from './pages/ReadPage';
import { HifdhPage } from './pages/HifdhPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProgressPage } from './pages/ProgressPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrayerTimesPage } from './pages/PrayerTimesPage';
import { AdhkarPage } from './pages/AdhkarPage';
import { MosquesPage } from './pages/MosquesPage';
import { TafsirPage } from './pages/TafsirPage';
import { ShazamPage } from './pages/ShazamPage';
import { useSettingsStore } from './stores/settingsStore';
import { useQuranStore } from './stores/quranStore';
import { useStatsStore } from './stores/statsStore';
import { fetchSurahs } from './lib/quranApi';
import { unlockAudio, isIOSPWA, isAudioUnlocked } from './lib/audioUnlock';
import './index.css';

function AppContent() {
  const { theme, arabicFontSize } = useSettingsStore();
  const { surahs, setSurahs } = useQuranStore();
  const { startSession, endSession } = useStatsStore();
  const hasUnlockedAudio = useRef(false);

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

  return (
    <>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<ReadPage />} />
          <Route path="/read" element={<ReadPage />} />
          <Route path="/hifdh" element={<HifdhPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/stats" element={<ProgressPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/prayers" element={<PrayerTimesPage />} />
          <Route path="/adhkar" element={<AdhkarPage />} />
          <Route path="/mosques" element={<MosquesPage />} />
          <Route path="/tafsir" element={<TafsirPage />} />
          <Route path="/shazam" element={<ShazamPage />} />
        </Routes>
      </main>
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

