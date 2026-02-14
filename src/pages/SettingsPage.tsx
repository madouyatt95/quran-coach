import { useSettingsStore } from '../stores/settingsStore';
import type { Theme, ArabicFontSize } from '../types';
import { Stars } from 'lucide-react';
import './SettingsPage.css';

const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Al-Afasy' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit Abdul Samad' },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
    { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi' },
];

export function SettingsPage() {
    const {
        theme,
        setTheme,
        arabicFontSize,
        setArabicFontSize,
        lineSpacing,
        setLineSpacing,
        tajwidEnabled,
        toggleTajwid,
        showTranslation,
        toggleTranslation,
        showTransliteration,
        toggleTransliteration,
        selectedReciter,
        setReciter,
        repeatCount,
        setRepeatCount,
        starryMode,
        setStarryMode,
    } = useSettingsStore();

    return (
        <div className="settings-page">
            <h1 className="settings-page__header">Réglages</h1>

            {/* Appearance */}
            <section className="settings-section">
                <h2 className="settings-section__title">Apparence</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Thème</span>
                    </div>
                    <div className="segment-control">
                        {(['dark', 'light', 'sepia'] as Theme[]).map((t) => (
                            <button
                                key={t}
                                className={`segment-control__btn ${theme === t ? 'active' : ''}`}
                                onClick={() => setTheme(t)}
                            >
                                {t === 'dark' ? 'Sombre' : t === 'light' ? 'Clair' : 'Sépia'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <Stars size={18} style={{ marginRight: 8, color: '#c9a84c' }} />
                        <span className="settings-item__title">Mode Nuit Étoilée</span>
                        <span className="settings-item__description">Fond animé avec étoiles scintillantes</span>
                    </div>
                    <button
                        className={`toggle ${starryMode ? 'active' : ''}`}
                        onClick={() => setStarryMode(!starryMode)}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>
            </section>

            {/* Reading */}
            <section className="settings-section">
                <h2 className="settings-section__title">Lecture</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Taille du texte arabe</span>
                    </div>
                    <div className="segment-control">
                        {(['sm', 'md', 'lg', 'xl'] as ArabicFontSize[]).map((size) => (
                            <button
                                key={size}
                                className={`segment-control__btn ${arabicFontSize === size ? 'active' : ''}`}
                                onClick={() => setArabicFontSize(size)}
                            >
                                {size.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Espacement</span>
                    </div>
                    <div className="slider-container">
                        <input
                            type="range"
                            className="slider"
                            min="1.8"
                            max="3"
                            step="0.2"
                            value={lineSpacing}
                            onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                        />
                        <span className="slider-value">{lineSpacing.toFixed(1)}</span>
                    </div>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Afficher les règles de Tajwîd</span>
                        <span className="settings-item__description">Coloriser le texte selon les règles</span>
                    </div>
                    <button
                        className={`toggle ${tajwidEnabled ? 'active' : ''}`}
                        onClick={toggleTajwid}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Afficher la traduction</span>
                    </div>
                    <button
                        className={`toggle ${showTranslation ? 'active' : ''}`}
                        onClick={toggleTranslation}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Phonétique</span>
                        <span className="settings-item__description">Prononciation en lettres latines</span>
                    </div>
                    <button
                        className={`toggle ${showTransliteration ? 'active' : ''}`}
                        onClick={toggleTransliteration}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>
            </section>

            {/* Audio */}
            <section className="settings-section">
                <h2 className="settings-section__title">Audio</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Récitateur</span>
                    </div>
                    <select
                        className="reciter-select"
                        value={selectedReciter}
                        onChange={(e) => setReciter(e.target.value)}
                    >
                        {RECITERS.map((reciter) => (
                            <option key={reciter.id} value={reciter.id}>
                                {reciter.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">Répétitions (Hifdh)</span>
                        <span className="settings-item__description">Nombre de répétitions par défaut</span>
                    </div>
                    <div className="slider-container">
                        <input
                            type="range"
                            className="slider"
                            min="1"
                            max="10"
                            step="1"
                            value={repeatCount}
                            onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                        />
                        <span className="slider-value">{repeatCount}x</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
