import { NavLink, useLocation } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

interface NavItem {
    path: string;
    emoji: string;
    labelKey: string;
    label?: string;
}

const navItems: NavItem[] = [
    { path: '/', emoji: '🏠', labelKey: 'nav.home' },
    { path: '/read', emoji: '📖', labelKey: 'nav.read' },
    { path: '/voice-search', emoji: '🎤', labelKey: '', label: 'Identifier' },
    { path: '/hifdh', emoji: '🎙️', labelKey: 'nav.memorize' },
];

export function BottomNav() {
    const { t } = useTranslation();
    const location = useLocation();
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    state={item.path === '/voice-search' ? { startVoiceSearch: true, returnTo: location.pathname === '/voice-search' ? '/learning' : location.pathname + location.search } : undefined}
                    aria-label={item.path === '/voice-search' ? 'Identifier un verset avec le micro' : undefined}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'active' : ''} ${item.path === '/voice-search' ? 'bottom-nav__item--voice' : ''}`
                    }
                >
                    <span className="bottom-nav__icon">{item.path === '/voice-search' ? <Mic size={23} aria-hidden="true"/> : item.emoji}</span>
                    <span className="bottom-nav__label">{item.label || t(item.labelKey)}</span>
                    <span className="bottom-nav__dot" />
                </NavLink>
            ))}
        </nav>
    );
}

