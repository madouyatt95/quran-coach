import { NavLink } from 'react-router-dom';
import { Book, Headphones, Mic, BarChart2, Clock } from 'lucide-react';
import './BottomNav.css';

interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/', icon: <Book />, label: 'Lecture' },
    { path: '/hifdh', icon: <Headphones />, label: 'Hifdh' },
    { path: '/coach', icon: <Mic />, label: 'Coach' },
    { path: '/stats', icon: <BarChart2 />, label: 'Stats' },
    { path: '/prayers', icon: <Clock />, label: 'Prières' },
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
