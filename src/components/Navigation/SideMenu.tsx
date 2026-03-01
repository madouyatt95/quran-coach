import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Stars, Bell, BellOff, ShieldCheck, Search, BarChart3, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
        { path: '/prophets', emoji: '📜', label: t('nav.prophets'), color: 'rgba(201,168,76,0.2)' },
        { path: '/qibla', emoji: '🧭', label: t('sideMenu.qibla'), color: 'rgba(201,168,76,0.2)' },
        { path: '/prayers', emoji: '🕌', label: t('sideMenu.prayers'), color: 'rgba(255,152,0,0.2)' },
        { path: '/themes', emoji: '📚', label: t('sideMenu.themes'), color: 'rgba(88,166,255,0.2)' },
        { path: '/adhkar', emoji: '🤲', label: t('sideMenu.adhkar'), color: 'rgba(231,76,60,0.2)' },
        { path: '/listen', emoji: '🎧', label: t('sideMenu.listen'), color: 'rgba(76,175,80,0.2)' },
        { path: '/hadiths', emoji: '📜', label: t('sideMenu.hadiths'), color: 'rgba(156,39,176,0.2)' },
        { path: '/tafsir', emoji: '📖', label: t('sideMenu.tafsir'), color: 'rgba(121,85,72,0.2)' },
        {
            path: '#',
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                alert("L'Académie est temporairement verrouillée pour une mise à jour. De retour très bientôt in sha Allah !");
            },
            emoji: '🔒',
            label: 'Académie (Verrouillé)',
            color: 'rgba(255,152,0,0.2)'
        },
        { path: '/circles', emoji: '👥', label: 'Cercle de Lecture', color: 'rgba(33,150,243,0.2)' },
    ];

    const TOOLS = [
        { path: '/sentinel', emoji: <ShieldCheck size={20} color="#c9a84c" />, label: t('sideMenu.sentinel'), color: 'rgba(201,168,76,0.1)' },
        { path: '/coach', emoji: <Search size={20} color="#4CAF50" />, label: 'Trouve', color: 'rgba(76,175,80,0.1)' },
        { path: '/dashboard', emoji: <BarChart3 size={20} color="#58A6FF" />, label: 'Tableau de bord', color: 'rgba(88,166,255,0.1)' },
        { path: '/settings', emoji: <Settings size={20} color="#607D8B" />, label: t('sideMenu.settings'), color: '#607D8B' },
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
                        <span>{t('app.name')}</span>
                    </div>
                    <button className="side-menu-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="side-menu-nav">
                    {/* Quick Access Notification Toggle + Language */}
                    <div className="side-menu-top-controls">
                        <div className="side-menu-item side-menu-toggle-item" onClick={handleToggleNotifications}>
                            <div className="side-menu-emoji">
                                {notif.enabled ? <Bell size={24} color="#4CAF50" /> : <BellOff size={24} color="var(--color-text-muted)" />}
                            </div>
                            <div className="side-menu-item-content">
                                <span>{t('sideMenu.notifications')}</span>
                                <span className="side-menu-item-subtitle">
                                    {notif.enabled ? t('sideMenu.enabled') : t('sideMenu.disabled')}
                                </span>
                            </div>
                            <div className={`side-menu-switch ${notif.enabled ? 'active' : ''}`}>
                                <div className="side-menu-switch-knob" />
                            </div>
                        </div>
                    </div>

                    <div className="side-menu-separator" />

                    <div className="side-menu-section-title">{t('sideMenu.quickAccess')}</div>
                    <div className="side-menu-shortcuts">
                        {SHORTCUTS.map(s => (
                            <NavLink
                                key={s.path + s.label}
                                to={s.path}
                                className={({ isActive }) => `side-menu-shortcut ${isActive ? 'active' : ''}`}
                                onClick={(e) => {
                                    if (s.onClick) {
                                        s.onClick(e);
                                    } else {
                                        onClose();
                                    }
                                }}
                                style={{ background: `linear-gradient(135deg, ${s.color}, rgba(255,255,255,0.02))` }}
                            >
                                <span className="side-menu-shortcut-emoji">{s.emoji}</span>
                                <span className="side-menu-shortcut-label">{s.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="side-menu-separator" />

                    <div className="side-menu-section-title">{t('sideMenu.tools')}</div>
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
                    <p>{t('app.version')} | {t('app.madeWith')}</p>
                </div>
            </div>
        </>
    );
}

