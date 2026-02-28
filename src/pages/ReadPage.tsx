import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SideMenu } from '../components/Navigation/SideMenu';
import { MushafPage } from '../components/Mushaf/MushafPage';
import { SearchModal } from '../components/Navigation/SearchModal';
import { VoiceSearch } from '../components/VoiceSearch/VoiceSearch';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Loader2 } from 'lucide-react';

const TajweedImagePage = lazy(() => import('../components/Mushaf/TajweedImagePage').then(m => ({ default: m.TajweedImagePage })));

export function ReadPage() {
    const [showSearch, setShowSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [searchParams] = useSearchParams();
    const { viewMode } = useSettingsStore();

    const { setCurrentSurah, setCurrentAyah } = useQuranStore();

    useEffect(() => {
        const surah = searchParams.get('surah');
        const ayah = searchParams.get('ayah');

        if (surah) {
            const s = parseInt(surah, 10);
            const a = ayah ? parseInt(ayah, 10) : 1;

            setCurrentSurah(s);
            setCurrentAyah(a);

            // Trigger scroll via existing sessionStorage mechanism
            sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: s, ayah: a }));
        }
    }, [searchParams, setCurrentSurah, setCurrentAyah]);

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

