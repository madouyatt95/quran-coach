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
    const { currentPage, currentSurah, currentAyah, setCurrentAyah, surahs } = useQuranStore();

    const currentSurahData = surahs.find(s => s.number === currentSurah);
    const displayName = surahName || currentSurahData?.name || '';
    const maxAyahs = currentSurahData?.numberOfAyahs || 7;

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
                <div className="header__nav-row">
                    <span className="header__page-info">
                        Page {currentPage} / 604
                    </span>
                    <select
                        className="header__verse-select"
                        value={currentAyah}
                        onChange={(e) => setCurrentAyah(parseInt(e.target.value))}
                        title="Aller au verset"
                    >
                        {Array.from({ length: maxAyahs }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>V.{n}</option>
                        ))}
                    </select>
                </div>
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
