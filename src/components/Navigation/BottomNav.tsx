import { NavLink } from 'react-router-dom';
import { Book, Headphones, ScrollText, BookHeart, Swords } from 'lucide-react';
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
    { path: '/quiz', icon: <Swords />, label: 'Quiz' },
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
