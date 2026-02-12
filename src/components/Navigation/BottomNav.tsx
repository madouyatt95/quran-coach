import { NavLink } from 'react-router-dom';
import { Book, Headphones, ScrollText, BookHeart, BookOpen } from 'lucide-react';
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
    { path: '/tafsir', icon: <BookOpen />, label: 'Tafsir' },
    { path: '/adhkar', icon: <BookHeart />, label: 'Invocations' },
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
                    <span className="bottom-nav__icon">{item.icon}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
