/**
 * PrayerSettingsPage — Advanced prayer calculation settings.
 */

import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { usePrayerStore } from '../stores/prayerStore';
import { useNotificationStore } from '../stores/notificationStore';
import { ANGLE_PRESETS, DEFAULT_PRAYER_SETTINGS, type AnglePreset, type HighLatMode, SALAT_KEYS, PRAYER_NAMES_FR } from '../lib/prayerEngine';
import './PrayerSettingsPage.css';

const HIGH_LAT_OPTIONS: { value: HighLatMode; label: string }[] = [
    { value: 'NONE', label: 'Aucun' },
    { value: 'MIDDLE_OF_NIGHT', label: 'Milieu de la nuit' },
    { value: 'ONE_SEVENTH', label: '1/7 de la nuit' },
    { value: 'ANGLE_BASED', label: 'Basé sur l\'angle' },
    { value: 'ASTRO_MIDNIGHT', label: 'Minuit astronomique' },
];

const PRAYER_ADJ_KEYS = [
    { key: 'fajr', label: 'Fajr / Sobh' },
    { key: 'sunrise', label: 'Shuruq' },
    { key: 'dhuhr', label: 'Dhuhr' },
    { key: 'asr', label: 'Asr' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isha' },
] as const;

export function PrayerSettingsPage() {
    const navigate = useNavigate();
    const store = usePrayerStore();
    const notifStore = useNotificationStore();
    const s = store.settings;
    const nc = notifStore.prayerMinutesConfig;

    return (
        <div className="prayer-settings-page">
            {/* Header */}
            <div className="ps-header">
                <button className="ps-header__back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                </button>
                <span className="ps-header__title">Réglages Prières</span>
                <button
                    className="ps-header__reset"
                    onClick={() => {
                        store.updateAnglePreset(DEFAULT_PRAYER_SETTINGS.anglePreset);
                        store.updateAsrShadow(DEFAULT_PRAYER_SETTINGS.asrShadow);
                        store.updateIshaIkhtiyari(DEFAULT_PRAYER_SETTINGS.ishaIkhtiyari);
                        store.updateHighLatMode(DEFAULT_PRAYER_SETTINGS.highLatFajrIsha);
                        store.updateRounding(DEFAULT_PRAYER_SETTINGS.rounding);
                        store.updateFajrSafety(DEFAULT_PRAYER_SETTINGS.fajrSafetyMin);
                        store.updateAdjustments(DEFAULT_PRAYER_SETTINGS.adjustmentsMin);
                        store.updateSobhIkhtiyariRule(DEFAULT_PRAYER_SETTINGS.sobhIkhtiyariRule);
                        store.updateAsrIkhtiyariRule(DEFAULT_PRAYER_SETTINGS.asrIkhtiyariRule);
                    }}
                    title="Réinitialiser"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Angle Presets */}
            <div className="ps-section">
                <div className="ps-section__title">📐 Méthode de calcul</div>
                <div className="ps-section__desc">Choisissez le preset d'angles pour le Fajr et l'Isha</div>
                <div className="ps-presets">
                    {(Object.entries(ANGLE_PRESETS) as [AnglePreset, typeof ANGLE_PRESETS[AnglePreset]][]).map(([key, preset]) => (
                        <button
                            key={key}
                            className={`ps-preset ${s.anglePreset === key ? 'ps-preset--active' : ''}`}
                            onClick={() => store.updateAnglePreset(key)}
                        >
                            <div className="ps-preset__name">{preset.label}</div>
                            <div className="ps-preset__name-ar">{preset.labelAr}</div>
                            <div className="ps-preset__angles">Fajr {preset.fajrAngle}° / Isha {preset.ishaAngle}°</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Angles */}
            {s.anglePreset === 'CUSTOM' && (
                <div className="ps-section">
                    <div className="ps-section__title">🎛️ Angles personnalisés</div>
                    <div className="ps-row">
                        <label>Fajr (°)</label>
                        <input
                            type="number"
                            min="10"
                            max="25"
                            step="0.5"
                            value={s.fajrAngle}
                            onChange={(e) => store.updateCustomAngles(parseFloat(e.target.value), s.ishaAngle)}
                        />
                    </div>
                    <div className="ps-row">
                        <label>Isha (°)</label>
                        <input
                            type="number"
                            min="10"
                            max="25"
                            step="0.5"
                            value={s.ishaAngle}
                            onChange={(e) => store.updateCustomAngles(s.fajrAngle, parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            )}

            {/* Asr Shadow */}
            <div className="ps-section">
                <div className="ps-section__title">🌤️ Ombre Asr</div>
                <div className="ps-section__desc">Facteur d'ombre pour le calcul de l'Asr</div>
                <div className="ps-toggle-group">
                    <button
                        className={`ps-toggle ${s.asrShadow === 1 ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateAsrShadow(1)}
                    >
                        × 1 (Shafi'i / Maliki)
                    </button>
                    <button
                        className={`ps-toggle ${s.asrShadow === 2 ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateAsrShadow(2)}
                    >
                        × 2 (Hanafi)
                    </button>
                </div>
            </div>

            {/* Akhir Isha */}
            <div className="ps-section">
                <div className="ps-section__title">🌙 Akhir Isha (fin ikhtiyârî)</div>
                <div className="ps-section__desc">Proportion de la nuit légale pour la fin du temps de préférence</div>
                <div className="ps-toggle-group">
                    <button
                        className={`ps-toggle ${s.ishaIkhtiyari === 'THIRD_NIGHT' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateIshaIkhtiyari('THIRD_NIGHT')}
                    >
                        ⅓ nuit
                    </button>
                    <button
                        className={`ps-toggle ${s.ishaIkhtiyari === 'HALF_NIGHT' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateIshaIkhtiyari('HALF_NIGHT')}
                    >
                        ½ nuit
                    </button>
                </div>
            </div>

            {/* Sobh Ikhtiyari Rule */}
            <div className="ps-section">
                <div className="ps-section__title">🌅 Règle ikhtiyârî Sobh</div>
                <div className="ps-toggle-group">
                    <button
                        className={`ps-toggle ${s.sobhIkhtiyariRule.type === 'DEFAULT' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateSobhIkhtiyariRule({ type: 'DEFAULT' })}
                    >
                        Défaut (2/3)
                    </button>
                    <button
                        className={`ps-toggle ${s.sobhIkhtiyariRule.type === 'CUSTOM_OFFSET_MIN' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateSobhIkhtiyariRule({ type: 'CUSTOM_OFFSET_MIN', minutes: 30 })}
                    >
                        Offset (min)
                    </button>
                </div>
                {s.sobhIkhtiyariRule.type === 'CUSTOM_OFFSET_MIN' && (
                    <div className="ps-row" style={{ marginTop: 8 }}>
                        <label>Minutes avant le lever</label>
                        <input
                            type="number"
                            min="5"
                            max="120"
                            value={s.sobhIkhtiyariRule.minutes}
                            onChange={(e) => store.updateSobhIkhtiyariRule({ type: 'CUSTOM_OFFSET_MIN', minutes: parseInt(e.target.value) || 30 })}
                        />
                    </div>
                )}
            </div>

            {/* Asr Ikhtiyari Rule */}
            <div className="ps-section">
                <div className="ps-section__title">🌇 Règle ikhtiyârî Asr</div>
                <div className="ps-toggle-group">
                    <button
                        className={`ps-toggle ${s.asrIkhtiyariRule.type === 'DEFAULT' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateAsrIkhtiyariRule({ type: 'DEFAULT' })}
                    >
                        Défaut (2/3)
                    </button>
                    <button
                        className={`ps-toggle ${s.asrIkhtiyariRule.type === 'CUSTOM_OFFSET_MIN' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateAsrIkhtiyariRule({ type: 'CUSTOM_OFFSET_MIN', minutes: 30 })}
                    >
                        Offset (min)
                    </button>
                </div>
                {s.asrIkhtiyariRule.type === 'CUSTOM_OFFSET_MIN' && (
                    <div className="ps-row" style={{ marginTop: 8 }}>
                        <label>Minutes avant le Maghrib</label>
                        <input
                            type="number"
                            min="5"
                            max="120"
                            value={s.asrIkhtiyariRule.minutes}
                            onChange={(e) => store.updateAsrIkhtiyariRule({ type: 'CUSTOM_OFFSET_MIN', minutes: parseInt(e.target.value) || 30 })}
                        />
                    </div>
                )}
            </div>

            {/* High Latitude */}
            <div className="ps-section">
                <div className="ps-section__title">🌍 Haute latitude</div>
                <div className="ps-section__desc">Méthode de fallback pour les latitudes extrêmes ({'>'}48°)</div>
                <select
                    className="ps-select"
                    value={s.highLatFajrIsha}
                    onChange={(e) => store.updateHighLatMode(e.target.value as HighLatMode)}
                >
                    {HIGH_LAT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Adjustments */}
            <div className="ps-section">
                <div className="ps-section__title">⏱️ Ajustements (minutes)</div>
                <div className="ps-section__desc">Ajout/retrait de minutes à chaque horaire</div>
                {PRAYER_ADJ_KEYS.map(({ key, label }) => (
                    <div className="ps-row" key={key}>
                        <label>{label}</label>
                        <input
                            type="number"
                            min="-30"
                            max="30"
                            value={s.adjustmentsMin[key as keyof typeof s.adjustmentsMin]}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                store.updateAdjustments({
                                    ...s.adjustmentsMin,
                                    [key]: val,
                                });
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Rounding */}
            <div className="ps-section">
                <div className="ps-section__title">🔢 Arrondi</div>
                <div className="ps-toggle-group">
                    <button
                        className={`ps-toggle ${s.rounding === 'NONE' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateRounding('NONE')}
                    >
                        Aucun
                    </button>
                    <button
                        className={`ps-toggle ${s.rounding === 'NEAREST_MIN' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateRounding('NEAREST_MIN')}
                    >
                        ≈ minute
                    </button>
                    <button
                        className={`ps-toggle ${s.rounding === 'CEIL_MIN' ? 'ps-toggle--active' : ''}`}
                        onClick={() => store.updateRounding('CEIL_MIN')}
                    >
                        ↑ minute
                    </button>
                </div>
            </div>

            {/* Fajr Safety */}
            <div className="ps-section">
                <div className="ps-section__title">🛡️ Marge de sécurité Fajr</div>
                <div className="ps-section__desc">Minutes retranchées du Fajr par précaution</div>
                <div className="ps-row">
                    <label>Minutes</label>
                    <input
                        type="number"
                        min="0"
                        max="15"
                        value={s.fajrSafetyMin}
                        onChange={(e) => store.updateFajrSafety(parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>

            {/* Notification Delays */}
            <div className="ps-section">
                <div className="ps-section__title">🔔 Délais de notification (minutes avant)</div>
                <div className="ps-section__desc">Réglez le délai d'alerte individuellement pour chaque prière</div>
                {SALAT_KEYS.map((key) => (
                    <div className="ps-row" key={key}>
                        <label>{PRAYER_NAMES_FR[key]}</label>
                        <input
                            type="number"
                            min="0"
                            max="60"
                            value={nc[key] ?? 10}
                            onChange={(e) => notifStore.setPrayerMinuteFor(key, parseInt(e.target.value) || 0)}
                        />
                    </div>
                ))}
                {/* Affichage */}
                <div className="ps-section">
                    <div className="ps-section__title">👁️ Options d'affichage</div>
                    <div className="ps-section__desc">Afficher les temps de prières facultatifs</div>
                    <div className="ps-toggle-row">
                        <label className="ps-checkbox-label">
                            <input
                                type="checkbox"
                                checked={s.showTahajjud}
                                onChange={(e) => store.updateDisplaySettings({ showTahajjud: e.target.checked })}
                            />
                            <span>Afficher Tahajjud</span>
                        </label>
                    </div>
                    <div className="ps-toggle-row">
                        <label className="ps-checkbox-label">
                            <input
                                type="checkbox"
                                checked={s.showIshraq}
                                onChange={(e) => store.updateDisplaySettings({ showIshraq: e.target.checked })}
                            />
                            <span>Afficher Ishraq</span>
                        </label>
                    </div>
                </div>

                {/* Adhan Sound */}
                <div className="ps-section">
                    <div className="ps-section__title">🔊 Son de l'Adhan</div>
                    <div className="ps-section__desc">Choisir le muezzin pour les notifications</div>
                    <div className="ps-presets ps-presets--small">
                        {['Mecque', 'Médine', 'Al-Aqsa', 'Égypte', 'Turquie', 'Maroc'].map((sound) => (
                            <button
                                key={sound}
                                className={`ps-toggle ${notifStore.adhanSound === sound ? 'ps-toggle--active' : ''}`}
                                onClick={() => notifStore.setAdhanSound(sound)}
                            >
                                {sound}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
