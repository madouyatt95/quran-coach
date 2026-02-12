import { NavLink } from 'react-router-dom';
import { X, Settings, Stars, Building2, Radio, BookOpen } from 'lucide-react';
import './SideMenu.css';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
    if (!isOpen) return null;

    const menuItems = [
        { path: '/tafsir', icon: BookOpen, label: 'Tafsir', color: '#58A6FF' },
        { path: '/shazam', icon: Radio, label: 'Shazam', color: '#FF6B6B' },
        { path: '/mosques', icon: Building2, label: 'Mosquées', color: '#26C6DA' },
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
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `side-menu-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <item.icon size={22} style={{ color: item.color }} />
                            <span>{item.label}</span>
                        </NavLink>
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
