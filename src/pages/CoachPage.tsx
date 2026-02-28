import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { coachSearch, QUICK_TAGS, type SearchResult } from '../lib/coachSearch';
import './CoachPage.css';

export function CoachPage() {
    const navigate = useNavigate();
    const goToAyah = useQuranStore(s => s.goToAyah);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeTag, setActiveTag] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const doSearch = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const r = await coachSearch(q);
            setResults(r);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInput = useCallback((value: string) => {
        setQuery(value);
        setActiveTag('');

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 400);
    }, [doSearch]);

    const handleTag = useCallback((tag: typeof QUICK_TAGS[0]) => {
        const isActive = activeTag === tag.query;
        if (isActive) {
            setActiveTag('');
            setQuery('');
            setResults([]);
            setHasSearched(false);
        } else {
            setActiveTag(tag.query);
            setQuery(tag.label);
            doSearch(tag.query);
        }
    }, [activeTag, doSearch]);

    const handleCardClick = useCallback((r: SearchResult) => {
        if (r.type === 'verse' && r.source) {
            // Parse "Coran 2:45" → surah=2, ayah=45
            const match = r.source.match(/Coran\s+(\d+):(\d+)/);
            if (match) {
                const surah = parseInt(match[1], 10);
                const ayah = parseInt(match[2], 10);
                sessionStorage.setItem('isSilentJump', 'true');
                sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah, ayah }));
                goToAyah(surah, ayah, undefined, { silent: true });
                navigate('/read');
                return;
            }
        }
        // Use deep-link URL for hadiths and invocations
        if (r.link) {
            navigate(r.link);
            return;
        }
    }, [navigate, goToAyah]);

    const typeLabels: Record<string, string> = {
        hadith: 'Hadith',
        invocation: 'Invocation',
        verse: 'Verset',
        surah: 'Sourate',
    };

    return (
        <div className="coach-page">
            <div className="coach-header">
                <div className="coach-title">
                    🔍 Trouve
                </div>
                <div className="coach-subtitle">
                    Coran, Hadiths, Invocations — tout en un clic
                </div>
            </div>

            {/* Search Input */}
            <div className="coach-search-wrapper">
                <Search size={18} className="coach-search-icon" />
                <input
                    type="text"
                    className="coach-search"
                    placeholder="patience, prière, paradis, repentir..."
                    value={query}
                    onChange={e => handleInput(e.target.value)}
                />
            </div>

            {/* Quick Tags */}
            <div className="coach-tags">
                {QUICK_TAGS.map(tag => (
                    <button
                        key={tag.query}
                        className={`coach-tag ${activeTag === tag.query ? 'active' : ''}`}
                        onClick={() => handleTag(tag)}
                    >
                        <span>{tag.emoji}</span>
                        <span>{tag.label}</span>
                    </button>
                ))}
            </div>

            {/* Loading */}
            {isSearching && (
                <div className="coach-loading">
                    <div className="coach-spinner" />
                    Recherche en cours...
                </div>
            )}

            {/* Results */}
            {!isSearching && hasSearched && results.length > 0 && (
                <div className="coach-results">
                    <div className="coach-results-count">
                        {results.length} résultat{results.length > 1 ? 's' : ''}
                    </div>
                    {results.map((r, i) => (
                        <div
                            key={`${r.type}-${i}`}
                            className="coach-card"
                            style={{ animationDelay: `${i * 0.05}s` }}
                            onClick={() => handleCardClick(r)}
                        >
                            <div className="coach-card-header">
                                <span className="coach-card-emoji">{r.emoji}</span>
                                <span className="coach-card-type">{typeLabels[r.type] || r.type}</span>
                                <span className="coach-card-title">{r.title}</span>
                                <ExternalLink size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                            </div>
                            {r.textAr && (
                                <div className="coach-card-arabic">{r.textAr}</div>
                            )}
                            {r.textFr && (
                                <div className="coach-card-french">{r.textFr}</div>
                            )}
                            {r.source && (
                                <div className="coach-card-source">{r.source}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {!isSearching && hasSearched && results.length === 0 && (
                <div className="coach-no-results">
                    Aucun résultat pour « {query} »
                </div>
            )}

            {/* Empty State */}
            {!hasSearched && !isSearching && (
                <div className="coach-empty">
                    <div className="coach-empty-emoji">🕌</div>
                    <div className="coach-empty-text">
                        Tapez un mot ou cliquez sur un thème pour trouver des hadiths, invocations et versets.
                    </div>
                </div>
            )}
        </div>
    );
}
