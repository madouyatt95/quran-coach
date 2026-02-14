import { NavLink } from 'react-router-dom';
import { X, Settings, Stars, Building2, Radio, BookOpen, Heart, Bookmark, Compass } from 'lucide-react';
import './SideMenu.css';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
    if (!isOpen) return null;

    const menuItems = [
        { path: '/tafsir', icon: BookOpen, label: 'Tafsir', color: '#58A6FF' },
        { path: '/themes', icon: Bookmark, label: 'Thèmes', color: '#d4af37' },
        { path: '/favorites', icon: Heart, label: 'Favoris', color: '#e74c3c' },
        { path: '/shazam', icon: Radio, label: 'Shazam (Bientôt)', color: '#FF6B6B', disabled: true },
        { path: '/mosques', icon: Building2, label: 'Mosquées', color: '#26C6DA' },
        { path: '/qibla', icon: Compass, label: 'Qibla', color: '#c9a84c' },
        { path: '/settings', icon: Settings, label: 'Réglages', color: '#888' },
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
                    {menuItems.map((item) => (
                        item.disabled ? (
                            <div key={item.path} className="side-menu-item disabled">
                                <item.icon size={22} style={{ color: item.color, opacity: 0.5 }} />
                                <span>{item.label}</span>
                            </div>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `side-menu-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <item.icon size={22} style={{ color: item.color }} />
                                <span>{item.label}</span>
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* Footer */}
                <div className="side-menu-footer">
                    <p>v1.1.0 | Made with ❤️</p>
                </div>
            </div>
        </>
    );
}
