import { useState } from 'react';
import { Search, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { QURAN_THEMES, type QuranTheme } from '../data/themesData';
import { useOpenReader } from '../hooks/useOpenReader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDivineNames } from '../lib/divineNames';
import './ThemesPage.css';

export function ThemesPage() {
    const { t } = useTranslation();
    const [selectedTheme, setSelectedTheme] = useState<QuranTheme | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const openReader = useOpenReader('Thèmes');
    const navigate = useNavigate();

    const filteredThemes = QURAN_THEMES.filter(t =>
        t.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.includes(searchQuery)
    );

    const handleVerseClick = (surah: number, ayah: number) => {
        openReader({ surah, ayah });
    };

    if (selectedTheme) {
        return (
            <div className="themes-page">
                <div className="themes-header">
                    <button className="themes-back" onClick={() => setSelectedTheme(null)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="themes-title">
                        <span className="themes-title__icon">{selectedTheme.icon}</span>
                        {selectedTheme.nameFr}
                        <span className="themes-title__ar">{selectedTheme.name}</span>
                    </h1>
                </div>

                <div className="themes-verses">
                    {selectedTheme.verses.map((v, i) => (
                        <div
                            key={i}
                            className="themes-verse-card"
                            onClick={() => handleVerseClick(v.surah, v.ayah)}
                            style={{ borderLeftColor: selectedTheme.color }}
                        >
                            <div className="themes-verse-card__ref">
                                <BookOpen size={12} />
                                {t('mushaf.surah', 'Sourate')} {v.surah}, {t('mushaf.verse', 'Verset')} {v.ayah}
                            </div>
                            <div className="themes-verse-card__ar" dir="rtl">{formatDivineNames(v.textAr)}</div>
                            <div className="themes-verse-card__fr">{formatDivineNames(v.textFr)}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="themes-page">
            <div className="themes-header">
                <button className="themes-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="themes-title">
                    📚 {t('themes.title', 'Thèmes Coraniques')}
                </h1>
            </div>

            <div className="themes-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder={t('themes.search', 'Rechercher un thème...')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="themes-grid">
                {filteredThemes.map(theme => (
                    <div
                        key={theme.id}
                        className="themes-card"
                        onClick={() => setSelectedTheme(theme)}
                        style={{ borderColor: theme.color }}
                    >
                        <div className="themes-card__icon">{theme.icon}</div>
                        <div className="themes-card__name">{theme.nameFr}</div>
                        <div className="themes-card__name-ar">{theme.name}</div>
                        <div className="themes-card__count">{theme.verses.length} {t('themes.verses', 'versets')}</div>
                        <ChevronRight size={16} className="themes-card__arrow" style={{ color: theme.color }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
