import { NavLink } from 'react-router-dom';
import './BottomNav.css';

interface NavItem {
    path: string;
    emoji: string;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/', emoji: '🏠', label: 'Accueil' },
    { path: '/read', emoji: '📖', label: 'Lecture' },
    { path: '/listen', emoji: '🎧', label: 'Écoute' },
    { path: '/hifdh', emoji: '🎙️', label: 'Mémorisation' },
    { path: '/prophets', emoji: '📜', label: 'Prophètes' },
];

export function BottomNav() {
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="bottom-nav__icon">{item.emoji}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                    <span className="bottom-nav__dot" />
                </NavLink>
            ))}
        </nav>
    );
}
