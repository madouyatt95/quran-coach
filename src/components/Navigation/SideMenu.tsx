import { NavLink } from 'react-router-dom';
import { X, Stars } from 'lucide-react';
import './SideMenu.css';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
    if (!isOpen) return null;

    const menuItems = [
        { path: '/listen', emoji: '🎧', label: 'Écoute', color: '#4CAF50' },
        { path: '/hadiths', emoji: '📜', label: 'Hadiths', color: '#c9a84c' },
        { path: '/prophets', emoji: '🕌', label: 'Prophètes', color: '#FF9800' },
        { path: '/tafsir', emoji: '📚', label: 'Tafsir', color: '#2196F3' },
        { path: '/shazam', emoji: '🔍', label: 'Shazam', color: '#9C27B0' },
        { path: '/admin/assets', emoji: '⚙️', label: 'Modération', color: '#607D8B' },
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
