import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { BottomNav } from './components/Navigation/BottomNav';
import { ReadPage } from './pages/ReadPage';
import { HifdhPage } from './pages/HifdhPage';
import { CoachPage } from './pages/CoachPage';
import { MemorizePage } from './pages/MemorizePage';
import { StatsPage } from './pages/StatsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSettingsStore } from './stores/settingsStore';
import { useQuranStore } from './stores/quranStore';
import { useStatsStore } from './stores/statsStore';
import { fetchSurahs } from './lib/quranApi';
import './index.css';

function AppContent() {
  const { theme, arabicFontSize } = useSettingsStore();
  const { surahs, setSurahs } = useQuranStore();
  const { startSession, endSession } = useStatsStore();

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
          <Route path="/hifdh" element={<HifdhPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/memorize" element={<MemorizePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
