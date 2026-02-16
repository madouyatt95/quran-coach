import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useNotificationStore } from '../stores/notificationStore';
import { requestNotificationPermission, sendTestNotification, initNotifications, cancelAllNotifications, scheduleDailyHadith, scheduleDailyChallenge } from '../lib/notificationService';
import type { Theme, ArabicFontSize } from '../types';
import { Stars, Bell, BellOff } from 'lucide-react';
import './SettingsPage.css';

const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Al-Afasy' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit Abdul Samad' },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
    { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi' },
];

const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const MINUTES_OPTIONS = [5, 10, 15, 30];

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

    const notif = useNotificationStore();
    const [testSent, setTestSent] = useState(false);

    const handleToggleNotifications = async () => {
        if (!notif.enabled) {
            // Enabling
            const perm = await requestNotificationPermission();
            notif.setPermission(perm);
            if (perm === 'granted') {
                notif.setEnabled(true);
                initNotifications({
                    prayerEnabled: notif.prayerEnabled,
                    hadithEnabled: notif.hadithEnabled,
                    challengeEnabled: notif.challengeEnabled,
                    prayerMinutesBefore: notif.prayerMinutesBefore,
                });
            }
        } else {
            // Disabling
            notif.setEnabled(false);
            cancelAllNotifications();
        }
    };

    const handleTest = async () => {
        const ok = await sendTestNotification();
        if (ok) {
            setTestSent(true);
            setTimeout(() => setTestSent(false), 3000);
        }
    };

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

                {!isMobile && (
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
                )}

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

            {/* Notifications */}
            <section className="settings-section">
                <h2 className="settings-section__title">🔔 Notifications</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        {notif.enabled ? <Bell size={18} style={{ marginRight: 8, color: '#4CAF50' }} /> : <BellOff size={18} style={{ marginRight: 8, color: '#999' }} />}
                        <span className="settings-item__title">Activer les notifications</span>
                        <span className="settings-item__description">
                            {Notification.permission === 'denied'
                                ? 'Bloqué par le navigateur — active dans les paramètres'
                                : 'Rappels de prière, hadith du jour, défis'}
                        </span>
                    </div>
                    <button
                        className={`toggle ${notif.enabled ? 'active' : ''}`}
                        onClick={handleToggleNotifications}
                        disabled={Notification.permission === 'denied'}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>

                {notif.enabled && (
                    <>
                        <div className="settings-item">
                            <div className="settings-item__label">
                                <span className="settings-item__title">🕌 Rappels de prière</span>
                                <span className="settings-item__description">
                                    Notification avant chaque salat
                                </span>
                            </div>
                            <button
                                className={`toggle ${notif.prayerEnabled ? 'active' : ''}`}
                                onClick={() => notif.setPrayerEnabled(!notif.prayerEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>

                        {notif.prayerEnabled && (
                            <div className="settings-item">
                                <div className="settings-item__label">
                                    <span className="settings-item__title">Minutes avant</span>
                                </div>
                                <div className="segment-control">
                                    {MINUTES_OPTIONS.map((m) => (
                                        <button
                                            key={m}
                                            className={`segment-control__btn ${notif.prayerMinutesBefore === m ? 'active' : ''}`}
                                            onClick={() => notif.setPrayerMinutesBefore(m)}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="settings-item">
                            <div className="settings-item__label">
                                <span className="settings-item__title">📖 Hadith du jour</span>
                                <span className="settings-item__description">Chaque matin à 8h</span>
                            </div>
                            <button
                                className={`toggle ${notif.hadithEnabled ? 'active' : ''}`}
                                onClick={() => {
                                    const newVal = !notif.hadithEnabled;
                                    notif.setHadithEnabled(newVal);
                                    if (newVal) scheduleDailyHadith();
                                }}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>

                        <div className="settings-item">
                            <div className="settings-item__label">
                                <span className="settings-item__title">🏆 Défi quotidien</span>
                                <span className="settings-item__description">Rappel à midi chaque jour</span>
                            </div>
                            <button
                                className={`toggle ${notif.challengeEnabled ? 'active' : ''}`}
                                onClick={() => {
                                    const newVal = !notif.challengeEnabled;
                                    notif.setChallengeEnabled(newVal);
                                    if (newVal) scheduleDailyChallenge();
                                }}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>

                        <div className="settings-item">
                            <div className="settings-item__label">
                                <span className="settings-item__title">🧪 Tester les notifications</span>
                            </div>
                            <button
                                className="settings-test-btn"
                                onClick={handleTest}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: testSent ? '#4CAF50' : 'var(--color-bg-tertiary)',
                                    color: testSent ? 'white' : 'var(--color-text)',
                                    border: 'none',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {testSent ? '✅ Envoyée !' : '🔔 Envoyer un test'}
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
