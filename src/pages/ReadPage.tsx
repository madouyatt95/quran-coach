import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { SideMenu } from '../components/Navigation/SideMenu';
import { MushafPage } from '../components/Mushaf/MushafPage';
import { SearchModal } from '../components/Navigation/SearchModal';
import { VoiceSearch } from '../components/VoiceSearch/VoiceSearch';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { fetchSurah } from '../lib/quranApi';
import { parsePassage } from '../lib/learning';
import { Loader2 } from 'lucide-react';

const TajweedImagePage = lazy(() => import('../components/Mushaf/TajweedImagePage').then(m => ({ default: m.TajweedImagePage })));
const MadinahImagePage = lazy(() => import('../components/Mushaf/MadinahImagePage').then(m => ({ default: m.MadinahImagePage })));

export function ReadPage() {
    const [showSearch, setShowSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { viewMode } = useSettingsStore();

    const { setCurrentSurah, setCurrentAyah, goToAyah } = useQuranStore();

    useEffect(() => {
        // This page stays mounted on other routes: only apply an actual reading link.
        if (location.pathname !== '/read' || !searchParams.has('surah')) return;
        const passage = parsePassage(searchParams);
        let cancelled = false;
        goToAyah(passage.surah, passage.ayah, undefined, { silent: true });
        void fetchSurah(passage.surah).then(data => {
            const verse = data.ayahs.find(a => a.numberInSurah === passage.ayah);
            if (!cancelled && verse) goToAyah(passage.surah, passage.ayah, verse.page, { silent: true });
        }).catch(() => { /* Keep the verse reference when its page is unavailable offline. */ });
        return () => { cancelled = true; };
    }, [location.pathname, searchParams, goToAyah]);

    const handleVoiceSearchResult = (surah: number, ayah: number) => {
        setCurrentSurah(surah);
        setCurrentAyah(ayah);
        setShowVoiceSearch(false);
    };

    return (
        <>
            {viewMode === 'tajweed' ? (
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 size={32} className="animate-spin" /></div>}>
                    <TajweedImagePage />
                </Suspense>
            ) : viewMode === 'madinah' ? (
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 size={32} className="animate-spin" /></div>}>
                    <MadinahImagePage />
                </Suspense>
            ) : (
                <MushafPage />
            )}

            <SideMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

            <SearchModal
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
            />

            {showVoiceSearch && (
                <VoiceSearch
                    onResult={handleVoiceSearchResult}
                    onClose={() => setShowVoiceSearch(false)}
                />
            )}
        </>
    );
}

