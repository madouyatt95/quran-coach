import { useState, useEffect, useCallback } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuranStore } from '../../stores/quranStore';
import { searchQuran, fetchSurahs } from '../../lib/quranApi';
import type { Ayah, Surah } from '../../types';
import './SearchModal.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SearchTab = 'all' | 'surah' | 'ayah';

// Popular surahs for quick access
const POPULAR_SURAHS = [1, 2, 18, 36, 55, 67, 78, 112, 114];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const navigate = useNavigate();
    const { surahs, setSurahs, goToSurah, goToAyah } = useQuranStore();

    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('all');
    const [results, setResults] = useState<Ayah[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load surahs if not already loaded
    useEffect(() => {
        if (surahs.length === 0) {
            fetchSurahs().then(setSurahs);
        }
    }, [surahs.length, setSurahs]);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const searchResults = await searchQuran(searchQuery);
            setResults(searchResults.slice(0, 20)); // Limit to 20 results
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) performSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleSurahClick = (surahNum: number) => {
        goToSurah(surahNum);
        onClose();
        navigate('/');
    };

    const handleResultClick = (result: Ayah) => {
        goToAyah(result.surah, result.numberInSurah, result.page);
        onClose();
        navigate('/');
    };

    const getSurahName = (surahNum: number) => {
        return surahs.find(s => s.number === surahNum)?.name || '';
    };

    // Filter surahs based on query
    const filteredSurahs = query.length > 0
        ? surahs.filter(s =>
            s.name.includes(query) ||
            s.englishName.toLowerCase().includes(query.toLowerCase()) ||
            s.number.toString() === query
        )
        : [];

    const popularSurahsList = POPULAR_SURAHS
        .map(num => surahs.find(s => s.number === num))
        .filter((s): s is Surah => s !== undefined);

    if (!isOpen) return null;

    return (
        <div className="search-modal">
            <div className="search-modal__header">
                <button className="search-modal__close" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="search-modal__input-wrapper">
                    <Search size={18} className="search-modal__input-icon" />
                    <input
                        type="text"
                        className="search-modal__input"
                        placeholder="Rechercher sourate, verset, mot..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="search-modal__content">
                {/* Search Tabs */}
                <div className="search-tabs">
                    <button
                        className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tout
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'surah' ? 'active' : ''}`}
                        onClick={() => setActiveTab('surah')}
                    >
                        Sourates
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'ayah' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ayah')}
                    >
                        Versets
                    </button>
                </div>

                {/* No query - show popular surahs */}
                {query.length === 0 && (
                    <div className="search-modal__section">
                        <h3 className="search-modal__section-title">Accès rapide</h3>
                        <div className="surah-grid">
                            {popularSurahsList.map((surah) => (
                                <button
                                    key={surah.number}
                                    className="surah-grid__item"
                                    onClick={() => handleSurahClick(surah.number)}
                                >
                                    <span className="surah-grid__number">{surah.number}</span>
                                    <span className="surah-grid__name">{surah.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Surah results */}
                {(activeTab === 'all' || activeTab === 'surah') && filteredSurahs.length > 0 && (
                    <div className="search-modal__section">
                        <h3 className="search-modal__section-title">
                            Sourates ({filteredSurahs.length})
                        </h3>
                        {filteredSurahs.slice(0, 5).map((surah) => (
                            <div
                                key={surah.number}
                                className="search-result"
                                onClick={() => handleSurahClick(surah.number)}
                            >
                                <div className="search-result__header">
                                    <span className="search-result__title">
                                        {surah.number}. {surah.name}
                                    </span>
                                    <span className="search-result__meta">
                                        {surah.numberOfAyahs} versets
                                    </span>
                                </div>
                                <div className="search-result__meta">
                                    {surah.englishName} • {surah.englishNameTranslation}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Ayah results */}
                {(activeTab === 'all' || activeTab === 'ayah') && results.length > 0 && (
                    <div className="search-modal__section">
                        <h3 className="search-modal__section-title">
                            Versets ({results.length})
                        </h3>
                        {results.map((result) => (
                            <div
                                key={result.number}
                                className="search-result"
                                onClick={() => handleResultClick(result)}
                            >
                                <div className="search-result__header">
                                    <span className="search-result__title">
                                        {getSurahName(result.surah)} : {result.numberInSurah}
                                    </span>
                                    <span className="search-result__meta">
                                        Page {result.page}
                                    </span>
                                </div>
                                <div className="search-result__text">
                                    {result.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {query.length > 0 && !isSearching && results.length === 0 && filteredSurahs.length === 0 && (
                    <div className="search-modal__empty">
                        <BookOpen size={48} />
                        <p>Aucun résultat pour "{query}"</p>
                    </div>
                )}

                {/* Loading state */}
                {isSearching && (
                    <div className="search-modal__empty">
                        <p>Recherche en cours...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
