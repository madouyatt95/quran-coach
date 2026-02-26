import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

interface NavItem {
    path: string;
    emoji: string;
    labelKey: string;
}

const navItems: NavItem[] = [
    { path: '/', emoji: '🏠', labelKey: 'nav.home' },
    { path: '/read', emoji: '📖', labelKey: 'nav.read' },
    { path: '/listen', emoji: '🎧', labelKey: 'nav.listen' },
    { path: '/hifdh', emoji: '🎙️', labelKey: 'nav.memorize' },
    { path: '/prophets', emoji: '📜', labelKey: 'nav.prophets' },
];

export function BottomNav() {
    const { t } = useTranslation();
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
                    <span className="bottom-nav__label">{t(item.labelKey)}</span>
                    <span className="bottom-nav__dot" />
                </NavLink>
            ))}
        </nav>
    );
}

