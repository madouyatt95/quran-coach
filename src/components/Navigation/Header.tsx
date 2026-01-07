import { Menu, Search, Bookmark, Mic } from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import './Header.css';

interface HeaderProps {
    onMenuClick?: () => void;
    onSearchClick?: () => void;
    onBookmarkClick?: () => void;
    onVoiceSearchClick?: () => void;
    surahName?: string;
}

export function Header({ onMenuClick, onSearchClick, onBookmarkClick, onVoiceSearchClick, surahName }: HeaderProps) {
    const { currentPage, currentSurah, surahs } = useQuranStore();

    const currentSurahData = surahs.find(s => s.number === currentSurah);
    const displayName = surahName || currentSurahData?.name || '';

    return (
        <header className="header">
            <div className="header__left">
                <button className="header__btn" onClick={onMenuClick} aria-label="Menu">
                    <Menu size={22} />
                </button>
            </div>

            <div className="header__surah-info">
                {displayName && (
                    <span className="header__surah-name">{displayName}</span>
                )}
                <span className="header__page-info">
                    Page {currentPage} / 604
                </span>
            </div>

            <div className="header__right">
                <button className="header__btn" onClick={onVoiceSearchClick} aria-label="Recherche vocale">
                    <Mic size={22} />
                </button>
                <button className="header__btn" onClick={onSearchClick} aria-label="Rechercher">
                    <Search size={22} />
                </button>
                <button className="header__btn" onClick={onBookmarkClick} aria-label="Marque-page">
                    <Bookmark size={22} />
                </button>
            </div>
        </header>
    );
}

