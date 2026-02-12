import { useState, useEffect, useRef } from 'react';
import { X, Download, Monitor, Smartphone } from 'lucide-react';
import './InstallPrompt.css';

type Platform = 'ios' | 'android' | 'pc';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function detectPlatform(): Platform {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'pc';
}

function isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
        || (navigator as any).standalone === true;
}

export function InstallPrompt() {
    const [showModal, setShowModal] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [platform, setPlatform] = useState<Platform>('android');
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // Don't show if already installed as PWA
        if (isStandalone()) return;

        // Check if user dismissed recently
        const dismissed = localStorage.getItem('install-dismissed');
        if (dismissed) {
            const ts = parseInt(dismissed, 10);
            // Don't show again for 7 days
            if (Date.now() - ts < 7 * 24 * 60 * 60 * 1000) return;
        }

        // Detect platform and show banner after delay
        setPlatform(detectPlatform());

        const timer = setTimeout(() => {
            setShowBanner(true);
        }, 3000);

        // Listen for native beforeinstallprompt (Chrome/Edge Android)
        const handlePrompt = (e: Event) => {
            e.preventDefault();
            deferredPrompt.current = e as BeforeInstallPromptEvent;
        };
        window.addEventListener('beforeinstallprompt', handlePrompt);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handlePrompt);
        };
    }, []);

    const handleNativeInstall = async () => {
        if (!deferredPrompt.current) return;
        await deferredPrompt.current.prompt();
        const result = await deferredPrompt.current.userChoice;
        if (result.outcome === 'accepted') {
            setShowModal(false);
            setShowBanner(false);
        }
        deferredPrompt.current = null;
    };

    const dismiss = () => {
        setShowBanner(false);
        setShowModal(false);
        localStorage.setItem('install-dismissed', String(Date.now()));
    };

    const openModal = () => {
        setShowBanner(false);
        setShowModal(true);
    };

    if (isStandalone()) return null;

    return (
        <>
            {/* Floating banner */}
            {showBanner && !showModal && (
                <div className="install-banner" onClick={openModal}>
                    <div className="install-banner-text">
                        <Download size={20} />
                        Installer Quran Coach
                    </div>
                    <button
                        className="install-banner-close"
                        onClick={(e) => { e.stopPropagation(); dismiss(); }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Install modal */}
            {showModal && (
                <>
                    <div className="install-backdrop" onClick={() => setShowModal(false)} />
                    <div className="install-modal">
                        <div className="install-header">
                            <h2>Installer Quran Coach</h2>
                            <button className="install-close" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <p className="install-desc">
                            Installez l'application pour un accès rapide et une
                            meilleure expérience utilisateur.
                        </p>

                        {/* Platform tabs */}
                        <div className="install-tabs">
                            <button
                                className={`install-tab ${platform === 'ios' ? 'active' : ''}`}
                                onClick={() => setPlatform('ios')}
                            >
                                <span>🍎</span> iOS
                            </button>
                            <button
                                className={`install-tab ${platform === 'android' ? 'active' : ''}`}
                                onClick={() => setPlatform('android')}
                            >
                                <Smartphone size={16} /> Android
                            </button>
                            <button
                                className={`install-tab ${platform === 'pc' ? 'active' : ''}`}
                                onClick={() => setPlatform('pc')}
                            >
                                <Monitor size={16} /> PC
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="install-instructions">
                            {platform === 'ios' && (
                                <>
                                    <div className="install-platform-label">
                                        <span className="install-platform-icon">🍎</span>
                                        iPhone / iPad
                                    </div>
                                    <ol className="install-steps">
                                        <li>1. Ouvrez cette page dans <strong>Safari</strong></li>
                                        <li>2a. Appuyez sur le menu <strong>···</strong> (3 points)</li>
                                        <li>2b. Ou appuyez sur <strong>⬆ Partager</strong></li>
                                        <li>3. Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong></li>
                                        <li>4. Appuyez sur <strong>Ajouter</strong></li>
                                    </ol>
                                </>
                            )}

                            {platform === 'android' && (
                                <>
                                    <div className="install-platform-label">
                                        <span className="install-platform-icon">🤖</span>
                                        Android
                                    </div>
                                    <ol className="install-steps">
                                        <li>1. Appuyez sur le menu <strong>⋮</strong> (3 points)</li>
                                        <li>2. Appuyez sur <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></li>
                                        <li>3. Confirmez l'installation</li>
                                    </ol>

                                    {/* Native install button for Chrome */}
                                    {deferredPrompt.current && (
                                        <button className="install-native-btn" onClick={handleNativeInstall}>
                                            <Download size={20} />
                                            Installer maintenant
                                        </button>
                                    )}
                                </>
                            )}

                            {platform === 'pc' && (
                                <>
                                    <div className="install-platform-label">
                                        <span className="install-platform-icon">💻</span>
                                        PC / Mac
                                    </div>
                                    <ol className="install-steps">
                                        <li>1. Cliquez sur l'icône <strong>⊕</strong> dans la barre d'adresse</li>
                                        <li>2. Ou cliquez sur le menu <strong>⋮</strong> → <strong>"Installer Quran Coach"</strong></li>
                                        <li>3. Confirmez l'installation</li>
                                    </ol>

                                    {deferredPrompt.current && (
                                        <button className="install-native-btn" onClick={handleNativeInstall}>
                                            <Download size={20} />
                                            Installer maintenant
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
