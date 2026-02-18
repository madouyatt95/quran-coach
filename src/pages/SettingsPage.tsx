import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
    requestNotificationPermission,
    sendTestNotification,
    subscribeToPush,
    unsubscribeFromPush,
    updatePushPreferences,
} from '../lib/notificationService';
import { usePrayerStore } from '../stores/prayerStore';
import { resolveCoords } from '../lib/locationService';
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
    const prayerStore = usePrayerStore();
    const [testSent, setTestSent] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [permDenied, setPermDenied] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermDenied(Notification.permission === 'denied');
        }
    }, []);

    const handleToggleNotifications = async () => {
        if (!notif.enabled) {
            // Enabling — subscribe to Web Push
            setSubscribing(true);
            try {
                const perm = await requestNotificationPermission();
                if (perm === 'denied') {
                    setPermDenied(true);
                    setSubscribing(false);
                    return;
                }
                if (perm === 'granted') {
                    // Force resolve coords if missing
                    const coords = await resolveCoords();

                    const ok = await subscribeToPush({
                        prayerEnabled: notif.prayerEnabled,
                        prayerMinutesBefore: notif.prayerMinutesBefore,
                        prayerMinutesConfig: notif.prayerMinutesConfig,
                        hadithEnabled: notif.hadithEnabled,
                        challengeEnabled: notif.challengeEnabled,
                        daruriSobhEnabled: notif.daruriSobhEnabled,
                        daruriAsrEnabled: notif.daruriAsrEnabled,
                        akhirIshaEnabled: notif.akhirIshaEnabled,
                        latitude: coords.lat,
                        longitude: coords.lng,
                        prayerSettings: prayerStore.settings,
                    });
                    if (ok) {
                        notif.setEnabled(true);
                        notif.setPermission('granted');
                    }
                }
            } catch (err: any) {
                console.error('[Settings] Failed to enable notifications:', err);
            }
            setSubscribing(false);
        } else {
            // Disabling — unsubscribe
            await unsubscribeFromPush();
            notif.setEnabled(false);
        }
    };

    const handleTogglePrayer = async () => {
        const newVal = !notif.prayerEnabled;
        notif.setPrayerEnabled(newVal);
        await updatePushPreferences({ prayerEnabled: newVal });
    };

    const handleMinutesBefore = async (m: number) => {
        notif.setPrayerMinutesBefore(m);
        await updatePushPreferences({ prayerMinutesBefore: m });
    };

    const handleToggleHadith = async () => {
        const newVal = !notif.hadithEnabled;
        notif.setHadithEnabled(newVal);
        await updatePushPreferences({ hadithEnabled: newVal });
    };

    const handleToggleChallenge = async () => {
        const newVal = !notif.challengeEnabled;
        notif.setChallengeEnabled(newVal);
        await updatePushPreferences({ challengeEnabled: newVal });
    };

    const handleTest = async () => {
        try {
            const ok = await sendTestNotification();
            if (ok) {
                setTestSent(true);
                setTimeout(() => setTestSent(false), 3000);
            } else {
                alert("Vérifiez que les notifications sont autorisées dans votre navigateur.");
            }
        } catch (err) {
            console.error('[Settings] Test notification failed:', err);
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
                        {notif.enabled
                            ? <Bell size={18} style={{ marginRight: 8, color: '#4CAF50' }} />
                            : <BellOff size={18} style={{ marginRight: 8, color: '#999' }} />
                        }
                        <span className="settings-item__title">Activer les notifications</span>
                        <span className="settings-item__description">
                            {permDenied
                                ? 'Bloqué par le navigateur — active dans les paramètres'
                                : 'Rappels de prière, hadith du jour, défis'}
                        </span>
                    </div>
                    <button
                        className={`toggle ${notif.enabled ? 'active' : ''}`}
                        onClick={handleToggleNotifications}
                        disabled={permDenied || subscribing}
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
                                onClick={handleTogglePrayer}
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
                                            onClick={() => handleMinutesBefore(m)}
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
                                onClick={handleToggleHadith}
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
                                onClick={handleToggleChallenge}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>

                        <div className="settings-item">
                            <div className="settings-item__label">
                                <span className="settings-item__title">🧪 Tester</span>
                            </div>
                            <button
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
            {/* Footer / Build */}
            <div className="settings-footer">
                <p>Quran Coach App — Version 0.0.0 (Build b6819da)</p>
                <p>© 2026</p>
            </div>
        </div>
    );
}
