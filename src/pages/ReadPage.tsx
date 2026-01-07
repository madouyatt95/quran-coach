import { useState } from 'react';
import { Header } from '../components/Navigation/Header';
import { MushafPage } from '../components/Mushaf/MushafPage';
import { FocusMode } from '../components/Mushaf/FocusMode';
import { SearchModal } from '../components/Navigation/SearchModal';
import { TajwidControls } from '../components/Tajwid/TajwidControls';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useProgressStore } from '../stores/progressStore';

type ViewMode = 'mushaf' | 'focus';

export function ReadPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('mushaf');
    const [showSearch, setShowSearch] = useState(false);

    const { currentSurah, currentAyah, currentPage } = useQuranStore();
    const { tajwidEnabled } = useSettingsStore();
    const { addBookmark } = useProgressStore();

    const handleBookmarkClick = () => {
        addBookmark({
            surah: currentSurah,
            ayah: currentAyah,
            page: currentPage,
        });
    };

    const handleMenuClick = () => {
        setViewMode(prev => prev === 'mushaf' ? 'focus' : 'mushaf');
    };

    return (
        <>
            <Header
                onMenuClick={handleMenuClick}
                onSearchClick={() => setShowSearch(true)}
                onBookmarkClick={handleBookmarkClick}
            />

            {tajwidEnabled && viewMode === 'mushaf' && <TajwidControls />}

            {viewMode === 'mushaf' ? (
                <MushafPage />
            ) : (
                <FocusMode
                    surah={currentSurah}
                    startAyah={currentAyah}
                    onClose={() => setViewMode('mushaf')}
                />
            )}

            <SearchModal
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
            />
        </>
    );
}
