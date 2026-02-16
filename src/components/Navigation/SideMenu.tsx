import { NavLink } from 'react-router-dom';
import { X, Stars, Bell, BellOff } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
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

    if (!isOpen) return null;

    const handleToggleNotifications = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent accidental close or navigation
        if (!notif.enabled) {
            const perm = await requestNotificationPermission();
            if (perm === 'granted') {
                const ok = await subscribeToPush({
                    prayerEnabled: notif.prayerEnabled,
                    prayerMinutesBefore: notif.prayerMinutesBefore,
                    hadithEnabled: notif.hadithEnabled,
                    challengeEnabled: notif.challengeEnabled,
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
    };

    const menuItems = [
        { path: '/listen', emoji: '🎧', label: 'Écoute', color: '#4CAF50' },
        { path: '/hadiths', emoji: '📜', label: 'Hadiths', color: '#c9a84c' },
        { path: '/tafsir', emoji: '📚', label: 'Tafsir', color: '#2196F3' },
        { path: '/shazam', emoji: '🔍', label: 'Shazam', color: '#9C27B0' },
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

                    {menuItems.map((item) => (
                        'disabled' in item && item.disabled ? (
                            <div key={item.path} className="side-menu-item disabled">
                                <span className="side-menu-emoji">{item.emoji}</span>
                                <span>{item.label}</span>
                            </div>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `side-menu-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className="side-menu-emoji">{item.emoji}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        )
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
