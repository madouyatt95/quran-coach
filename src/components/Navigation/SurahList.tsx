import { useEffect, useState } from 'react';
import { useOpenReader } from '../../hooks/useOpenReader';
import { useQuranStore } from '../../stores/quranStore';
import { fetchSurahs } from '../../lib/quranApi';
import type { Surah } from '../../types';
import './SurahList.css';

export function SurahList() {
    const openReader = useOpenReader('Sourates');
    const { surahs, setSurahs } = useQuranStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [_isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (surahs.length === 0) {
            setIsLoading(true);
            fetchSurahs()
                .then(setSurahs)
                .finally(() => setIsLoading(false));
        }
    }, [surahs.length, setSurahs]);

    const filteredSurahs = surahs.filter(surah =>
        surah.name.includes(searchQuery) ||
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.number.toString() === searchQuery
    );

    const handleSurahClick = (surah: Surah) => {
        openReader({ surah: surah.number, ayah: 1 });
    };

    return (
        <div className="surah-list">
            <div className="surah-search">
                <input
                    type="text"
                    className="surah-search__input"
                    placeholder="Rechercher une sourate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <h2 className="surah-list__header">Sourates ({filteredSurahs.length})</h2>

            {filteredSurahs.map((surah) => (
                <button
                    key={surah.number}
                    className="surah-item"
                    onClick={() => handleSurahClick(surah)}
                >
                    <span className="surah-item__number">{surah.number}</span>
                    <div className="surah-item__info">
                        <span className="surah-item__name-ar">{surah.name}</span>
                        <span className="surah-item__name-en">{surah.englishName}</span>
                    </div>
                    <div className="surah-item__meta">
                        <span className="surah-item__ayahs">{surah.numberOfAyahs} versets</span>
                        <span className="surah-item__type">
                            {surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
