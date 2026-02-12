import { NavLink } from 'react-router-dom';
import { Book, Headphones, ScrollText, BookHeart, BookOpen, Menu } from 'lucide-react';
import './BottomNav.css';

interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/', icon: <Book />, label: 'Lecture' },
    { path: '/hifdh', icon: <Headphones />, label: 'Hifdh' },
    { path: '/prophets', icon: <ScrollText />, label: 'Prophètes' },
    { path: '/adhkar', icon: <BookHeart />, label: 'Invocations' },
    { path: '/tafsir', icon: <BookOpen />, label: 'Tafsir' },
];

interface BottomNavProps {
    onMenuOpen?: () => void;
}

export function BottomNav({ onMenuOpen }: BottomNavProps) {
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
                    <span className="bottom-nav__icon">{item.icon}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
            {onMenuOpen && (
                <button className="bottom-nav__item bottom-nav__menu-btn" onClick={onMenuOpen}>
                    <span className="bottom-nav__icon"><Menu /></span>
                    <span className="bottom-nav__label">Menu</span>
                </button>
            )}
        </nav>
    );
}
