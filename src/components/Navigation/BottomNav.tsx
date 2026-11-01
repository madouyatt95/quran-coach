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
    { path: '/listen', emoji: '🎧', labelKey: '', label: 'Écoute' },
    { path: '/hifdh', emoji: '🎙️', labelKey: 'nav.memorize' },
];

export function BottomNav() {
    const { t } = useTranslation();
    const location = useLocation();
    return (
        <nav className="bottom-nav" aria-label="Navigation principale">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    state={item.path === '/voice-search' ? { returnTo: location.pathname === '/voice-search' ? '/learning' : location.pathname + location.search } : undefined}
                    aria-label={item.path === '/voice-search' ? 'Identifier un verset avec le micro' : undefined}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive || (item.path === '/listen' && (location.pathname.startsWith('/listen/') || location.pathname.startsWith('/playlists/'))) ? 'active' : ''} ${item.path === '/voice-search' ? 'bottom-nav__item--voice' : ''}`
                    }
                >
                    <span className="bottom-nav__icon">{item.path === '/voice-search' ? <Mic size={23} aria-hidden="true"/> : item.emoji}</span>
                    <span className="bottom-nav__label">{item.label || t(item.labelKey)}</span>
                    <span className="bottom-nav__dot" />
                </NavLink>
            ))}
            <div className="bottom-nav__rail-extra">
                <NavLink to="/listen/library" className="bottom-nav__item"><span className="bottom-nav__icon" aria-hidden="true">📚</span><span className="bottom-nav__label">Bibliothèque</span></NavLink>
                <NavLink to="/academy" className="bottom-nav__item"><span className="bottom-nav__icon" aria-hidden="true">🎓</span><span className="bottom-nav__label">Académie</span></NavLink>
                <NavLink to="/prayers" className="bottom-nav__item"><span className="bottom-nav__icon" aria-hidden="true">🕌</span><span className="bottom-nav__label">Prières</span></NavLink>
            </div>
        </nav>
    );
}
