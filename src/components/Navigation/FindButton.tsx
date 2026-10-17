import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import './FindButton.css';

export function FindButton({ className = '', expanded = false, query = '', onClick }: { className?: string; expanded?: boolean; query?: string; onClick?: () => void }) {
    const location = useLocation();
    // Capture the visible passage, not an old deep link that may precede scrolling.
    const reader = useQuranStore();
    const viewMode = useSettingsStore(s => s.viewMode);
    const returnTo = location.pathname === '/read'
        ? viewMode === 'mushaf' ? `/read?surah=${reader.currentSurah}&ayah=${reader.currentAyah}&page=${reader.currentPage}` : `/read?page=${reader.currentPage}`
        : location.pathname + location.search;
    return <Link to={query.trim() ? `/coach?q=${encodeURIComponent(query.trim())}` : '/coach'} className={`find-button ${expanded ? 'find-button--expanded' : ''} ${className}`}
        aria-label="Trouve : rechercher des textes, des cours et mes notes" title="Trouve"
        state={location.pathname === '/coach' ? location.state : { findReturn: { to: returnTo, state: location.state }, focusSearch: true }} onClick={onClick}>
        <Search size={20} aria-hidden="true" />
        {expanded && <span><strong>{query.trim() ? 'Chercher avec Trouve' : 'Trouve'}</strong><small>Textes, cours et mes notes</small></span>}
    </Link>;
}
