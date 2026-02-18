import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export function UpdateBanner() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const checkForUpdates = async () => {
            try {
                const reg = await navigator.serviceWorker.getRegistration();
                if (!reg) return;

                // If there's already a waiting worker
                if (reg.waiting) {
                    setWaitingWorker(reg.waiting);
                    setShowUpdate(true);
                }

                // Listen for new updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New SW installed but waiting — show banner
                            setWaitingWorker(newWorker);
                            setShowUpdate(true);
                        }
                    });
                });

                // Also check for updates every 30 seconds
                const interval = setInterval(() => {
                    reg.update().catch(() => { });
                }, 30_000);

                return () => clearInterval(interval);
            } catch (err) {
                console.error('[UpdateBanner] Error:', err);
            }
        };

        checkForUpdates();

        // When the new SW takes over, reload
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }, []);

    const handleUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    if (!showUpdate) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '90vw',
            animation: 'slideUp 0.4s ease-out',
        }}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
            <span>🆕 Mise à jour disponible !</span>
            <button
                onClick={handleUpdate}
                style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                }}
            >
                <RefreshCw size={14} />
                Mettre à jour
            </button>
        </div>
    );
}
