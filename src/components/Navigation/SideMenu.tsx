import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Stars, Bell, BellOff } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { usePrayerStore } from '../../stores/prayerStore';
import {
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush
} from '../../lib/notificationService';
import './SideMenu.css';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
    const notif = useNotificationStore();
    const prayer = usePrayerStore();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleToggleNotifications = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        try {
            setIsLoading(true);

            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                return;
            }

            if (!notif.enabled) {
                const perm = await requestNotificationPermission();

                if (perm === 'granted') {
                    const ok = await subscribeToPush({
                        prayerEnabled: notif.prayerEnabled,
                        prayerMinutesBefore: notif.prayerMinutesBefore,
                        prayerMinutesConfig: notif.prayerMinutesConfig,
                        hadithEnabled: notif.hadithEnabled,
                        challengeEnabled: notif.challengeEnabled,
                        daruriSobhEnabled: notif.daruriSobhEnabled,
                        daruriAsrEnabled: notif.daruriAsrEnabled,
                        akhirIshaEnabled: notif.akhirIshaEnabled,
                        prayerSettings: prayer.settings,
                    });

                    if (ok) {
                        notif.setEnabled(true);
                        notif.setPermission('granted');
                    }
                }
            } else {
                await unsubscribeFromPush();
                notif.setEnabled(false);
            }
        } catch (err) {
            console.error('[SideMenu] Toggle error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const SHORTCUTS = [
        { path: '/quiz', emoji: '⚔️', label: 'Quiz', color: 'rgba(201,168,76,0.2)' },
        { path: '/qibla', emoji: '🧭', label: 'Qibla', color: 'rgba(201,168,76,0.2)' },
        { path: '/prayers', emoji: '🕌', label: 'Prières', color: 'rgba(255,152,0,0.2)' },
        { path: '/themes', emoji: '📚', label: 'Thèmes', color: 'rgba(88,166,255,0.2)' },
        { path: '/adhkar', emoji: '🤲', label: 'Adhkar', color: 'rgba(231,76,60,0.2)' },
        { path: '/listen', emoji: '🎧', label: 'Écoute', color: 'rgba(76,175,80,0.2)' },
        { path: '/hadiths', emoji: '📜', label: 'Hadiths', color: 'rgba(156,39,176,0.2)' },
        { path: '/tafsir', emoji: '📖', label: 'Tafsir', color: 'rgba(121,85,72,0.2)' },
    ];

    const TOOLS = [
        { path: '/shazam', emoji: '🔍', label: 'Recherche Vocale', color: '#9C27B0' },
        { path: '/settings', emoji: '⚙️', label: 'Réglages', color: '#607D8B' },
    ];
    return (
        <>
            {/* Backdrop */}
            <div className="side-menu-backdrop" onClick={onClose} />

            {/* Menu */}
            <div className="side-menu">
                {/* Header */}
                <div className="side-menu-header">
                    <div className="side-menu-brand">
                        <Stars size={24} />
                        <span>Quran Coach</span>
                    </div>
                    <button className="side-menu-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="side-menu-nav">
                    {/* Quick Access Notification Toggle */}
                    <div className="side-menu-item side-menu-toggle-item" onClick={handleToggleNotifications}>
                        <div className="side-menu-emoji">
                            {notif.enabled ? <Bell size={24} color="#4CAF50" /> : <BellOff size={24} color="var(--color-text-muted)" />}
                        </div>
                        <div className="side-menu-item-content">
                            <span>Notifications</span>
                            <span className="side-menu-item-subtitle">
                                {notif.enabled ? 'Activées' : 'Désactivées'}
                            </span>
                        </div>
                        <div className={`side-menu-switch ${notif.enabled ? 'active' : ''}`}>
                            <div className="side-menu-switch-knob" />
                        </div>
                    </div>

                    <div className="side-menu-separator" />

                    <div className="side-menu-section-title">Accès Rapide</div>
                    <div className="side-menu-shortcuts">
                        {SHORTCUTS.map(s => (
                            <NavLink
                                key={s.path}
                                to={s.path}
                                className={({ isActive }) => `side-menu-shortcut ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                                style={{ background: `linear-gradient(135deg, ${s.color}, rgba(255,255,255,0.02))` }}
                            >
                                <span className="side-menu-shortcut-emoji">{s.emoji}</span>
                                <span className="side-menu-shortcut-label">{s.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="side-menu-separator" />

                    <div className="side-menu-section-title">Outils</div>
                    {TOOLS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `side-menu-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className="side-menu-emoji">{item.emoji}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="side-menu-footer">
                    <p>v1.2.0 | Made with ❤️</p>
                </div>
            </div>
        </>
    );
}
