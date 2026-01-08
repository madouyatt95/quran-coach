import { useSettingsStore } from '../../stores/settingsStore';
import './TajwidControls.css';

// Complete Tajwid rules matching Quran.com API class names
const TAJWID_RULES = [
    {
        id: 'madd',
        name: 'Madd',
        nameArabic: 'المد',
        color: '#FF6B6B',
        description: 'Prolongation de la voyelle (2-6 temps)'
    },
    {
        id: 'ghunnah',
        name: 'Ghunnah',
        nameArabic: 'الغنة',
        color: '#4ECDC4',
        description: 'Son nasal avec نّ ou مّ (2 temps)'
    },
    {
        id: 'qalqalah',
        name: 'Qalqalah',
        nameArabic: 'القلقلة',
        color: '#FFE66D',
        description: 'Rebond sonore sur ق ط ب ج د avec sukoon'
    },
    {
        id: 'idgham',
        name: 'Idgham',
        nameArabic: 'الإدغام',
        color: '#95E1D3',
        description: 'Fusion du ن/tanwin avec يرملون'
    },
    {
        id: 'ikhfa',
        name: 'Ikhfa',
        nameArabic: 'الإخفاء',
        color: '#DDA0DD',
        description: 'Dissimulation nasale du ن/tanwin (15 lettres)'
    },
    {
        id: 'iqlab',
        name: 'Iqlab',
        nameArabic: 'الإقلاب',
        color: '#87CEEB',
        description: 'Conversion du ن en م devant ب'
    },
    {
        id: 'izhar',
        name: 'Izhar',
        nameArabic: 'الإظهار',
        color: '#98D8C8',
        description: 'Prononciation claire du ن/tanwin (6 lettres gutturales)'
    }
];

export function TajwidControls() {
    const { tajwidEnabled, tajwidLayers, toggleTajwidLayer } = useSettingsStore();

    if (!tajwidEnabled) return null;

    return (
        <div className="tajwid-controls">
            <div className="tajwid-controls__header">
                <span className="tajwid-controls__title">Règles de Tajwîd</span>
                <span className="tajwid-controls__count">
                    {tajwidLayers.length} active{tajwidLayers.length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="tajwid-controls__layers">
                {TAJWID_RULES.map((rule) => (
                    <button
                        key={rule.id}
                        className={`tajwid-layer ${tajwidLayers.includes(rule.id) ? 'active' : ''}`}
                        onClick={() => toggleTajwidLayer(rule.id)}
                        title={rule.description}
                    >
                        <span
                            className="tajwid-layer__color"
                            style={{ backgroundColor: rule.color }}
                        />
                        <span className="tajwid-layer__name">{rule.name}</span>
                        <span className="tajwid-layer__arabic">{rule.nameArabic}</span>
                    </button>
                ))}
            </div>

            {tajwidLayers.length > 0 && (
                <div className="tajwid-legend">
                    <h4 className="tajwid-legend__title">Légende</h4>
                    {TAJWID_RULES
                        .filter(rule => tajwidLayers.includes(rule.id))
                        .map((rule) => (
                            <div key={rule.id} className="tajwid-legend__item">
                                <span
                                    className="tajwid-legend__color"
                                    style={{ backgroundColor: rule.color }}
                                />
                                <div className="tajwid-legend__text">
                                    <span className="tajwid-legend__name">
                                        {rule.name} ({rule.nameArabic})
                                    </span>
                                    <span className="tajwid-legend__desc">
                                        {rule.description}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
