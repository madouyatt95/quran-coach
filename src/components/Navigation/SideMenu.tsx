import { NavLink } from 'react-router-dom';
import { X, Book, Map, TreeDeciduous, Compass, Settings, Stars } from 'lucide-react';
import './SideMenu.css';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
    if (!isOpen) return null;

    const menuItems = [
        { path: '/mushaf3d', icon: Book, label: 'Mode Livre 3D', color: '#c9a84c' },
        { path: '/map', icon: Map, label: 'Carte du Coran', color: '#2196F3' },
        { path: '/tree', icon: TreeDeciduous, label: 'Arbre de Memorisation', color: '#4CAF50' },
        { path: '/qibla', icon: Compass, label: 'Direction Qibla', color: '#9C27B0' },
        { path: '/settings', icon: Settings, label: 'Reglages', color: '#888' },
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
                    <p>v1.0.0 | Made with ❤️</p>
                </div>
            </div>
        </>
    );
}
