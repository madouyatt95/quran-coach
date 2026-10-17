import { useState, useEffect, lazy, Suspense } from 'react';
const ProgressBackupPanel=lazy(()=>import('../components/Backup/ProgressBackupPanel').then(m=>({default:m.ProgressBackupPanel})));
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
import type { ArabicFontSize } from '../types';
import { APPEARANCES } from '../lib/appearance';
import { MUSHAF_RECITERS } from '../lib/quranApi';
import { Stars, Bell, BellOff, HardDrive, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import './SettingsPage.css';

const isMobile = typeof navigator !== 'undefined' && (
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  new RegExp(['A','n','d','r','o','i','d'].join(''), 'i').test(navigator.userAgent)
);

export function SettingsPage() {
    const { t } = useTranslation();
    const location = useLocation();
    useEffect(() => {
        const sectionId = location.hash.slice(1);
        if (!sectionId) return;
        const frame = requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ block: 'start' }));
        return () => cancelAnimationFrame(frame);
    }, [location.hash]);
    const navigate = useNavigate();
    const {
        theme,
        setTheme,
        arabicFontSize,
        setArabicFontSize,
        tajwidEnabled,
        toggleTajwid,
        showTranslation,
        toggleTranslation,
        showTransliteration,
        toggleTransliteration,
        selectedReciter,
        setReciter,
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
                alert(t('settings.testNotificationFailed', "Vérifiez que les notifications sont autorisées dans votre navigateur."));
            }
        } catch (err) {
            console.error('[Settings] Test notification failed:', err);
        }
    };

    return (
        <div className="settings-page">
            <header className="settings-page__intro">
                <p className="settings-page__eyebrow">VOTRE EXPÉRIENCE</p>
                <h1 className="settings-page__header">{t('settings.title', 'Réglages')}</h1>
                <p className="settings-page__subtitle">Choisissez comment lire, écouter et recevoir vos rappels.</p>
            </header>
            <nav className="settings-jump" aria-label="Sections des réglages">
                <a href="#appearance">Apparence</a>
                <a href="#reading">Lecture</a>
                <a href="#audio">Audio</a>
                <a href="#notifications">Notifications</a>
                <a href="#storage">Stockage</a><a href="#backup">Sauvegarde</a>
            </nav>

            {/* Appearance */}
            <section className="settings-section" id="appearance">
                <h2 className="settings-section__title">{t('settings.appearance', 'Apparence')}</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">{t('settings.theme', 'Thème')}</span>
                    </div>
                    <div className="appearance-options" role="group" aria-label="Choisir le thème">
                        {APPEARANCES.map((option) => (
                            <button
                                key={option.id}
                                className="appearance-option"
                                data-preview={option.id}
                                aria-pressed={theme === option.id}
                                onClick={() => setTheme(option.id)}
                            >
                                <span className="appearance-preview" aria-hidden="true"><span className="appearance-preview__title"/><span className="appearance-preview__card"><i/><i/></span><span className="appearance-preview__nav"><i/><i/><i/><i/></span></span>
                                <span className="appearance-option__name">{option.label}<span aria-hidden="true">{theme === option.id ? '✓' : ''}</span></span>
                                <small>{option.description}</small>
                            </button>
                        ))}
                    </div>
                    <details className="settings-theme-detail">
                        <summary>Agrandir l’aperçu du thème</summary>
                        <div className="appearance-option settings-theme-large" data-preview={theme}>
                            <span className="appearance-preview" aria-hidden="true"><span className="appearance-preview__title"/><span className="appearance-preview__card"><i/><i/></span><span className="appearance-preview__nav"><i/><i/><i/><i/></span></span>
                            <p>{APPEARANCES.find(option => option.id === theme)?.description}</p>
                        </div>
                    </details>
                </div>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <Stars size={18} style={{ marginRight: 8, color: '#c9a84c' }} />
                        <span className="settings-item__title">{t('settings.starryMode', 'Mode Nuit Étoilée')}</span>
                        <span className="settings-item__description">{t('settings.starryModeDesc', 'Fond animé avec étoiles scintillantes')}</span>
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
            <section className="settings-section" id="reading">
                <h2 className="settings-section__title">{t('settings.reading', 'Lecture')}</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <span className="settings-item__title">{t('settings.arabicFontSize', 'Taille du texte arabe')}</span>
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

                {!isMobile && (
                    <div className="settings-item">
                        <div className="settings-item__label">
                            <span className="settings-item__title">{t('settings.showTajweed', 'Afficher les règles de Tajwîd')}</span>
                            <span className="settings-item__description">{t('settings.tajweedDesc', 'Coloriser le texte selon les règles')}</span>
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
                        <span className="settings-item__title">{t('settings.showTranslation', 'Afficher la traduction')}</span>
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
                        <span className="settings-item__title">{t('settings.phonetics', 'Phonétique')}</span>
                        <span className="settings-item__description">{t('settings.phoneticsDesc', 'Prononciation en lettres latines')}</span>
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
            <section className="settings-section" id="audio">
                <h2 className="settings-section__title">Audio du mushaf</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        <label className="settings-item__title" htmlFor="mushaf-reciter">{t('settings.reciter', 'Récitateur')}</label>
                        <span className="settings-item__description">Voix utilisée lorsque vous écoutez un verset dans la lecture. L’onglet Écoute conserve son propre choix.</span>
                    </div>
                    <select
                        id="mushaf-reciter"
                        className="reciter-select"
                        value={selectedReciter}
                        onChange={(e) => setReciter(e.target.value)}
                    >
                        {MUSHAF_RECITERS.map((reciter) => (
                            <option key={reciter.id} value={reciter.id}>
                                {reciter.name}
                            </option>
                        ))}
                    </select>
                </div>

            </section>

            {/* Notifications */}
            <section className="settings-section" id="notifications" style={{ scrollMarginTop: 16 }}>
                <h2 className="settings-section__title">🔔 {t('settings.notifications', 'Notifications')}</h2>

                <div className="settings-item">
                    <div className="settings-item__label">
                        {notif.enabled
                            ? <Bell size={18} style={{ marginRight: 8, color: '#4CAF50' }} />
                            : <BellOff size={18} style={{ marginRight: 8, color: '#999' }} />
                        }
                        <span className="settings-item__title">{t('settings.enableNotifications', 'Activer les notifications')}</span>
                        <span className="settings-item__description">
                            {permDenied
                                ? t('settings.notifBlocked', 'Bloqué par le navigateur — active dans les paramètres')
                                : t('settings.notifDesc', 'Rappels de prière, hadith du jour, défis')}
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
                                <span className="settings-item__title">🕌 {t('settings.prayerReminders', 'Rappels de prière')}</span>
                                <span className="settings-item__description">
                                    {t('settings.prayerRemindersDesc', 'Notification avant chaque salat')}
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
                            <button className="settings-link" type="button" onClick={() => navigate('/prayer-settings')}>
                                <span className="settings-link__text">Régler le délai pour chaque prière</span>
                                <ChevronRight size={18} aria-hidden="true" />
                            </button>
                        )}

                        <div className="settings-item">
                            <div className="settings-item__label">
                                <span className="settings-item__title">📖 {t('settings.hadithOfDay', 'Hadith du jour')}</span>
                                <span className="settings-item__description">{t('settings.hadithDesc', 'Chaque matin à 8h')}</span>
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
                                <span className="settings-item__title">🏆 {t('settings.dailyChallenge', 'Défi quotidien')}</span>
                                <span className="settings-item__description">{t('settings.challengeDesc', 'Rappel à midi chaque jour')}</span>
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
                                <span className="settings-item__title">🧪 {t('settings.test', 'Tester')}</span>
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
                                {testSent ? `✅ ${t('settings.testSent', 'Envoyée !')}` : `🔔 ${t('settings.sendTest', 'Envoyer un test')}`}
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className="settings-section" id="storage">
                <h2 className="settings-section__title">Stockage et informations</h2>
                <button className="settings-link" type="button" onClick={() => navigate('/storage')}>
                    <span className="settings-link__icon"><HardDrive size={20} aria-hidden="true" /></span>
                    <span className="settings-link__text">Stockage hors ligne</span>
                    <ChevronRight size={18} aria-hidden="true" />
                </button>
            </section>

            <Suspense fallback={<p>Chargement de la sauvegarde…</p>}><ProgressBackupPanel/></Suspense>

            {/* Footer / Build */}
            <div className="settings-footer">
                <p>Quran Coach App — Version 0.0.0 (Build b6819da)</p>
                <p>© 2026</p>
            </div>
        </div >
    );
}
