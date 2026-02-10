import { useState } from 'react';
import { SideMenu } from '../components/Navigation/SideMenu';
import { MushafPage } from '../components/Mushaf/MushafPage';
import { SearchModal } from '../components/Navigation/SearchModal';
import { VoiceSearch } from '../components/VoiceSearch/VoiceSearch';
import { useQuranStore } from '../stores/quranStore';

export function ReadPage() {
    const [showSearch, setShowSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { setCurrentSurah, setCurrentAyah } = useQuranStore();

    const handleVoiceSearchResult = (surah: number, ayah: number) => {
        setCurrentSurah(surah);
        setCurrentAyah(ayah);
        setShowVoiceSearch(false);
    };

    return (
        <>
            <MushafPage />

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
