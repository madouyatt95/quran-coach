import { startCarMediaBridge } from './lib/carExperience';
import { startActivityWidgetBridge } from './lib/widgetService';
import { useWidgetNavigation } from './hooks/useWidgetNavigation';
import { AdhanPlayer } from './components/Prayer/AdhanPlayer';
import { useRegularity } from './hooks/useRegularity';
import { useAutomaticMosque } from './hooks/useAutomaticMosque';
import { AutomaticMosqueContext } from './hooks/AutomaticMosqueContext';
import { usePrayerLocation } from './hooks/usePrayerLocation';
import { FindButton } from './components/Navigation/FindButton';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Menu } from 'lucide-react';
import { BottomNav } from './components/Navigation/BottomNav';
import { ReadPage } from './pages/ReadPage';
import { SideMenu } from './components/Navigation/SideMenu';
import { MiniPlayer } from './components/MiniPlayer/MiniPlayer';
import { LibraryPlayer } from './components/Listen/LibraryPlayer';
import { HomePage } from './pages/HomePage';
import { useSettingsStore } from './stores/settingsStore';
import { useQuranStore } from './stores/quranStore';
import { useStatsStore } from './stores/statsStore';
import { fetchSurahs } from './lib/quranApi';
import { unlockAudio, isIOSPWA, isAudioUnlocked } from './lib/audioUnlock';
import { InstallPrompt } from './components/InstallPrompt/InstallPrompt';
import { InvisibleCoachLayer } from './components/InvisibleCoach/InvisibleCoachLayer';
import { UpdateBanner } from './components/UpdateBanner';
import { KhatmCelebration } from './components/KhatmCelebration';
import { updateLastVisit } from './lib/notificationService';
import { trackAppOpen, trackPageView } from './lib/analyticsService';
import './index.css';
import './appearance.css';
import { applyAppearance } from './lib/appearance';

// Lazy-loaded pages (code splitting)
const HifdhPage = lazy(() => import('./pages/HifdhPage').then(m => ({ default: m.HifdhPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimesPage').then(m => ({ default: m.PrayerTimesPage })));
const AdhkarPage = lazy(() => import('./pages/AdhkarPage').then(m => ({ default: m.AdhkarPage })));
const ListeningExperiencePage = lazy(() => import('./pages/ListeningExperiencePage').then(m => ({ default: m.ListeningExperiencePage })));
const ListenPage = lazy(() => import('./pages/ListenPage').then(m => ({ default: m.ListenPage })));
const AudioLibraryPage = lazy(() => import('./pages/AudioLibraryPage').then(m => ({ default: m.AudioLibraryPage })));
const AudioStudioPage = lazy(() => import('./pages/AudioStudioPage').then(m => ({ default: m.AudioStudioPage })));
const ReciterDetailPage = lazy(() => import('./pages/ReciterDetailPage').then(m => ({ default: m.ReciterDetailPage })));
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage').then(m => ({ default: m.PlaylistDetailPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const TafsirPage = lazy(() => import('./pages/TafsirPage').then(m => ({ default: m.TafsirPage })));
const EditorialJourneyPage = lazy(() => import('./pages/EditorialJourneyPage').then(m => ({ default: m.EditorialJourneyPage })));
const JourneyNotebookPage = lazy(() => import('./pages/JourneyNotebookPage').then(m => ({ default: m.JourneyNotebookPage })));
const ProphetsPage = lazy(() => import('./pages/ProphetsPage').then(m => ({ default: m.ProphetsPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const ThemesPage = lazy(() => import('./pages/ThemesPage').then(m => ({ default: m.ThemesPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then(m => ({ default: m.QuizPage })));
const HadithsPage = lazy(() => import('./pages/HadithsPage').then(m => ({ default: m.HadithsPage })));
const QiblaPage = lazy(() => import('./pages/QiblaPage').then(m => ({ default: m.QiblaPage })));
const PrayerSettingsPage = lazy(() => import('./pages/PrayerSettingsPage').then(m => ({ default: m.PrayerSettingsPage })));
const SentinellePage = lazy(() => import('./pages/SentinellePage').then(m => ({ default: m.SentinellePage })));
const StoragePage = lazy(() => import('./pages/StoragePage').then(m => ({ default: m.StoragePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CoachPage = lazy(() => import('./pages/CoachPage').then(m => ({ default: m.CoachPage })));
const ArabicPage = lazy(() => import('./arabic/ArabicPage').then(m => ({ default: m.ArabicPage })));
const AcademyPage = lazy(() => import('./academy/components/AcademyHub').then(m => ({ default: m.AcademyHub })));
const CirclePage = lazy(() => import('./pages/CirclePage').then(m => ({ default: m.CirclePage })));
const StoriesPage = lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })));
const AtlasPage = lazy(() => import('./pages/AtlasPage').then(m => ({ default: m.AtlasPage })));
const LastNightsDashboard = lazy(() => import('./components/Home/LastNightsDashboard').then(m => ({ default: m.LastNightsDashboard })));
const FahmPage = lazy(() => import('./pages/FahmPage').then(m => ({ default: m.FahmPage })));
const FahmRecallPage = lazy(() => import('./pages/FahmRecallPage').then(m => ({ default: m.FahmRecallPage })));
const FahmLessonPage = lazy(() => import('./pages/FahmLessonPage').then(m => ({ default: m.FahmLessonPage })));
const VocabPage = lazy(() => import('./pages/VocabPage').then(m => ({ default: m.VocabPage })));

const LearningPage = lazy(() => import('./pages/LearningPage').then(m => ({ default: m.LearningPage })));
const PassagePage = lazy(() => import('./pages/PassagePage').then(m => ({ default: m.PassagePage })));
const SimilarPassagesPage = lazy(() => import('./pages/SimilarPassagesPage').then(m => ({ default: m.SimilarPassagesPage })));
const VoiceSearchPage = lazy(() => import('./pages/VoiceSearchPage').then(m => ({ default: m.VoiceSearchPage })));

const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const MemorizationTestPage = lazy(() => import('./pages/MemorizationTestPage').then(m => ({ default: m.MemorizationTestPage })));

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
  const { theme, arabicFontSize, arabicFontFamily } = useSettingsStore();
  const { surahs, setSurahs } = useQuranStore();
  useRegularity();
  useWidgetNavigation();
  useEffect(() => startCarMediaBridge(), []);
  useEffect(() => startActivityWidgetBridge(), []);
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
    applyAppearance(theme);
  }, [theme]);

  // Apply Arabic font size
  useEffect(() => {
    document.documentElement.setAttribute('data-arabic-size', arabicFontSize);
  }, [arabicFontSize]);

  // Apply Arabic font family
  useEffect(() => {
    const fontValue = arabicFontFamily === 'amiri'
      ? "'Amiri', 'Traditional Arabic', serif"
      : "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif";
    document.documentElement.style.setProperty('--font-arabic', fontValue);
  }, [arabicFontFamily]);

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
  usePrayerLocation(location.pathname === '/' || location.pathname === '/prayers');
  const automaticMosque=useAutomaticMosque(location.pathname === '/' || location.pathname === '/prayers');

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <AutomaticMosqueContext.Provider value={automaticMosque}>
      <AdhanPlayer />
      {/* Global burger menu button – hidden on Lecture and Lesson pages */}
      {!isLecturePage && (
        <div className="global-page-tools">
        {location.pathname !== '/coach' && <FindButton />}
        <button
          className="global-menu-btn"
          onClick={() => setShowSideMenu(true)}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>
        </div>
      )}

      <KhatmCelebration />
      <main className={isLecturePage ? undefined : "app-main--compact"} style={{ flex: 1, paddingBottom: 'var(--bottom-nav-height)' }}>
        {/* ReadPage always mounted to preserve audio state & tracking */}
        <ReadPagePersistent />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/read" element={null} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/test-memorization" element={<MemorizationTestPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/passage" element={<PassagePage />} />
            <Route path="/similar-passages" element={<SimilarPassagesPage />} />
            <Route path="/voice-search" element={<VoiceSearchPage />} />
            <Route path="/hifdh" element={<HifdhPage />} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/prayers" element={<PrayerTimesPage />} />
            <Route path="/prayer-settings" element={<PrayerSettingsPage />} />
            <Route path="/adhkar" element={<AdhkarPage />} />
            <Route path="/listen" element={<ListenPage />} />
            <Route path="/listen/library" element={<AudioLibraryPage />} />
            <Route path="/admin/audio" element={<AudioStudioPage />} />
            <Route path="/listen/experience" element={<ListeningExperiencePage key={location.search} />} />
            <Route path="/listen/:id" element={<ReciterDetailPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/tafsir" element={<TafsirPage />} />
            <Route path="/journeys/notebook" element={<JourneyNotebookPage />} />
            <Route path="/journeys/:kind/:id" element={<EditorialJourneyPage />} />
            <Route path="/prophets" element={<ProphetsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/qibla" element={<QiblaPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/hadiths" element={<HadithsPage />} />
            <Route path="/sentinel" element={<SentinellePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/academy/arabic" element={<ArabicPage />} />
            <Route path="/academy/arabic/:lessonId" element={<ArabicPage />} />
            <Route path="/circles" element={<CirclePage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/last-nights" element={<LastNightsDashboard />} />
            <Route path="/fahm" element={<FahmPage />} />
            <Route path="/fahm/review" element={<FahmRecallPage />} />
                        <Route path="/fahm/surah/:surah" element={<FahmLessonPage />} />
                        <Route path="/fahm/session" element={<FahmLessonPage />} />
            <Route path="/fahm/lesson/:pathId/:day" element={<FahmLessonPage />} />
            <Route path="/vocab" element={<VocabPage />} />
          </Routes>
        </Suspense>
      </main>
      <SideMenu isOpen={showSideMenu} onClose={() => setShowSideMenu(false)} />
      {location.pathname !== "/listen/experience" && location.pathname !== "/listen/library" && location.pathname !== "/admin/audio" && !location.pathname.startsWith("/journeys/") && !location.pathname.startsWith("/fahm/") && <InstallPrompt />}
      <UpdateBanner />
      <MiniPlayer />
      <LibraryPlayer />
      <InvisibleCoachLayer />
      <BottomNav />
    </AutomaticMosqueContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
