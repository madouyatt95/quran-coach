import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Headphones, Mic, Scroll } from 'lucide-react';
import './BottomNav.css';

interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/', icon: <Home size={22} />, label: 'Accueil' },
    { path: '/read', icon: <BookOpen size={22} />, label: 'Lecture' },
    { path: '/listen', icon: <Headphones size={22} />, label: 'Écoute' },
    { path: '/hifdh', icon: <Mic size={22} />, label: 'Mémorisation' },
    { path: '/prophets', icon: <Scroll size={22} />, label: 'Prophètes' },
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
                    <span className="bottom-nav__icon">{item.icon}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                    <span className="bottom-nav__dot" />
                </NavLink>
            ))}
        </nav>
    );
}
