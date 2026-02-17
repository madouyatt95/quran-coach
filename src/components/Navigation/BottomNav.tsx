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
    { path: '/hifdh', emoji: '🎧', label: 'Mémorisation' },
    { path: '/prophets', emoji: '📜', label: 'Prophètes' },
    { path: '/quiz', emoji: '⚔️', label: 'Quiz' },
];

export function BottomNav() {
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="bottom-nav__emoji">{item.emoji}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                    <span className="bottom-nav__dot" />
                </NavLink>
            ))}
        </nav>
    );
}
