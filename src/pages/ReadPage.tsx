import { useState } from 'react';
import { Header } from '../components/Navigation/Header';
import { SideMenu } from '../components/Navigation/SideMenu';
import { MushafPage } from '../components/Mushaf/MushafPage';
import { FocusMode } from '../components/Mushaf/FocusMode';
import { SearchModal } from '../components/Navigation/SearchModal';
import { VoiceSearch } from '../components/VoiceSearch/VoiceSearch';
import { useQuranStore } from '../stores/quranStore';
import { useProgressStore } from '../stores/progressStore';

type ViewMode = 'mushaf' | 'focus';

export function ReadPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('mushaf');
    const [showSearch, setShowSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { currentSurah, currentAyah, currentPage, setCurrentSurah, setCurrentAyah } = useQuranStore();
    const { addBookmark } = useProgressStore();

    const handleBookmarkClick = () => {
        addBookmark({
            surah: currentSurah,
            ayah: currentAyah,
            page: currentPage,
        });
    };

    const handleVoiceSearchResult = (surah: number, ayah: number) => {
        setCurrentSurah(surah);
        setCurrentAyah(ayah);
        setShowVoiceSearch(false);
        // Switch to focus mode to show the verse
        setViewMode('focus');
    };

    return (
        <>
            <Header
                onMenuClick={() => setShowMenu(true)}
                onSearchClick={() => setShowSearch(true)}
                onBookmarkClick={handleBookmarkClick}
                onVoiceSearchClick={() => setShowVoiceSearch(true)}
            />

            {viewMode === 'mushaf' ? (
                <MushafPage />
            ) : (
                <FocusMode
                    surah={currentSurah}
                    startAyah={currentAyah}
                    onClose={() => setViewMode('mushaf')}
                />
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
