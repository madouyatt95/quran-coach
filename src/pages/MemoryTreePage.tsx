import { useNavigate } from 'react-router-dom';
import { X, Home, TreeDeciduous } from 'lucide-react';
import { useSRSStore } from '../stores/srsStore';
import { useQuranStore } from '../stores/quranStore';
import './MemoryTreePage.css';

// Surah groups for tree display
const SURAH_GROUPS = [
    { id: 'juz1', name: 'Juz 1-5', range: [1, 36] },
    { id: 'juz2', name: 'Juz 6-10', range: [37, 77] },
    { id: 'juz3', name: 'Juz 11-15', range: [78, 93] },
    { id: 'juz4', name: 'Juz 16-20', range: [94, 105] },
    { id: 'juz5', name: 'Juz 21-25', range: [106, 114] },
];

export function MemoryTreePage() {
    const navigate = useNavigate();
    const { cards } = useSRSStore();
    const { surahs } = useQuranStore();

    // Get memorized surahs (group cards by surah)
    const memorizedSurahs = new Map<number, number>();
    const cardsArray = Object.values(cards);
    cardsArray.forEach(card => {
        const count = memorizedSurahs.get(card.surah) || 0;
        memorizedSurahs.set(card.surah, count + 1);
    });

    // Calculate total progress
    const totalVerses = 6236;
    const memorizedVerses = cardsArray.length;
    const progressPercent = Math.round((memorizedVerses / totalVerses) * 100);

    // Get leaf color based on mastery
    const getLeafColor = (surahNum: number) => {
        const count = memorizedSurahs.get(surahNum) || 0;
        if (count === 0) return '#555'; // grey - not started
        if (count < 5) return '#8BC34A'; // light green - started
        if (count < 20) return '#4CAF50'; // green - progressing
        return '#2E7D32'; // dark green - mastered
    };

    const getSurahName = (num: number) => {
        const surah = surahs.find(s => s.number === num);
        return surah?.name || `Sourate ${num}`;
    };

    return (
        <div className="memory-tree-page">
            {/* Header */}
            <div className="memory-tree-header">
                <button className="memory-tree-header-btn" onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
                <span className="memory-tree-title">
                    <TreeDeciduous size={20} />
                    Arbre de Memorisation
                </span>
                <button className="memory-tree-header-btn" onClick={() => navigate('/')}>
                    <Home size={24} />
                </button>
            </div>

            {/* Progress Summary */}
            <div className="memory-tree-progress">
                <div className="progress-circle">
                    <svg viewBox="0 0 100 100">
                        <circle className="progress-bg" cx="50" cy="50" r="45" />
                        <circle
                            className="progress-fill"
                            cx="50" cy="50" r="45"
                            style={{
                                strokeDasharray: `${progressPercent * 2.83} 283`,
                            }}
                        />
                    </svg>
                    <div className="progress-text">
                        <span className="progress-percent">{progressPercent}%</span>
                        <span className="progress-label">Memoires</span>
                    </div>
                </div>
                <div className="progress-stats">
                    <div className="stat">
                        <span className="stat-value">{memorizedVerses}</span>
                        <span className="stat-label">Versets</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{memorizedSurahs.size}</span>
                        <span className="stat-label">Sourates</span>
                    </div>
                </div>
            </div>

            {/* Tree Visualization */}
            <div className="tree-container">
                <svg className="tree-svg" viewBox="0 0 400 500">
                    {/* Trunk */}
                    <rect x="185" y="350" width="30" height="150" fill="#8B4513" rx="5" />
                    <rect x="175" y="340" width="50" height="20" fill="#6B3E0A" rx="3" />

                    {/* Branches and Leaves */}
                    {SURAH_GROUPS.map((group, groupIndex) => {
                        const centerX = 200;
                        const baseY = 320 - groupIndex * 60;
                        const spreadX = 150 - groupIndex * 15;

                        return (
                            <g key={group.id}>
                                {/* Branch */}
                                <path
                                    d={`M200,${baseY + 30} Q${centerX - spreadX / 2},${baseY} ${centerX - spreadX},${baseY - 20}`}
                                    stroke="#8B4513"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <path
                                    d={`M200,${baseY + 30} Q${centerX + spreadX / 2},${baseY} ${centerX + spreadX},${baseY - 20}`}
                                    stroke="#8B4513"
                                    strokeWidth="8"
                                    fill="none"
                                />

                                {/* Leaves (Surahs in this group) */}
                                {Array.from({ length: group.range[1] - group.range[0] + 1 }, (_, i) => {
                                    const surahNum = group.range[0] + i;
                                    if (surahNum > 114) return null;

                                    const leafIndex = i - (group.range[1] - group.range[0]) / 2;
                                    const leafX = centerX + (leafIndex * (spreadX * 2) / (group.range[1] - group.range[0]));
                                    const leafY = baseY - 10 + Math.abs(leafIndex) * 3;

                                    return (
                                        <g key={surahNum} className="leaf-group">
                                            <circle
                                                cx={leafX}
                                                cy={leafY}
                                                r={8}
                                                fill={getLeafColor(surahNum)}
                                                className={memorizedSurahs.has(surahNum) ? 'leaf-active' : 'leaf-inactive'}
                                            />
                                            <title>{getSurahName(surahNum)}</title>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* Crown decoration */}
                    <circle cx="200" cy="40" r="35" fill="#2E7D32" opacity="0.8" />
                    <circle cx="160" cy="60" r="25" fill="#4CAF50" opacity="0.7" />
                    <circle cx="240" cy="60" r="25" fill="#4CAF50" opacity="0.7" />
                </svg>
            </div>

            {/* Legend */}
            <div className="tree-legend">
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#555' }}></span>
                    <span>Non commence</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#8BC34A' }}></span>
                    <span>Debut</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></span>
                    <span>En cours</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#2E7D32' }}></span>
                    <span>Maitrise</span>
                </div>
            </div>

            {/* Surah List */}
            <div className="memorized-list">
                <h3>Sourates en cours ({memorizedSurahs.size})</h3>
                <div className="surah-chips">
                    {Array.from(memorizedSurahs.entries()).map(([surahNum, count]) => (
                        <button
                            key={surahNum}
                            className="surah-chip"
                            onClick={() => navigate(`/hifdh?surah=${surahNum}`)}
                        >
                            <span className="chip-name">{getSurahName(surahNum)}</span>
                            <span className="chip-count">{count} versets</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
