import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { useOpenReader } from '../hooks/useOpenReader';
import { coachSearch, QUICK_TAGS, type SearchKind, type SearchResult } from '../lib/coachSearch';
import './CoachPage.css';

export function CoachPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params, setParams] = useSearchParams();
    const openReader = useOpenReader('Trouve');
    const query = params.get('q') || '';
    const activeTag = params.get('tag') || '';
    const [category,setCategory]=useState<SearchKind|'all'>('all');
    const [studiedOnly,setStudiedOnly]=useState(false);
    const [unavailable,setUnavailable]=useState<string[]>([]);
    const [limit,setLimit]=useState(24);
    const [retry,setRetry]=useState(0);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const updateParams = (values: Record<string, string>) => {
        const next = new URLSearchParams(params);
        Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
        setParams(next, { replace: true, state: location.state });
    };
    const handleInput = (value: string) => updateParams({ q: value, tag: '' });
    const handleTag = (tag: typeof QUICK_TAGS[0]) => updateParams(activeTag === tag.query
        ? { q: '', tag: '' } : { q: tag.label, tag: tag.query });
    useEffect(() => {
        if (location.state?.focusSearch) inputRef.current?.focus();
    }, [location.key]);
    useEffect(() => {
        let cancelled = false;
        const controller=new AbortController();
        setUnavailable([]);setLimit(24);
        const term = activeTag || query;
        setResults([]);
        setSearchError(false);
        setHasSearched(false);
        setIsSearching(term.trim().length >= 2);
        if (term.trim().length < 2) return;
        const timer = setTimeout(() => {
            void coachSearch(term,{signal:controller.signal,localOnly:category!=='all'&&category!=='verse'}).then(result => {
                if (!cancelled) { setResults(result.results); setUnavailable(result.unavailable); setHasSearched(true); }
            }).catch(() => {
                if (!cancelled) setSearchError(true);
            }).finally(() => { if (!cancelled) setIsSearching(false); });
        }, 350);
        return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
    }, [query, activeTag, category, retry]);
    const handleCardClick = (r: SearchResult) => {
        if (r.type === 'verse' && r.source) {
            const match = r.source.match(/Coran\s+(\d+):(\d+)/);
            if (match) { openReader({ surah: Number(match[1]), ayah: Number(match[2]) }); return; }
        }
        if (r.link) navigate(r.link);
    };
    const filtered=results.filter(r=>(category==='all'||r.type===category)&&(!studiedOnly||r.studied));
    const returnTarget = location.state?.findReturn;

    const typeLabels: Record<string, string> = {
        hadith: 'Hadith',
        invocation: 'Invocation',
        verse: 'Verset',
        surah: 'Sourate', course:'Cours', arabic:'Arabe', story:'Récit', note:'Note personnelle',
    };

    return (
        <div className="coach-page">
            {returnTarget?.to?.startsWith('/') && !returnTarget.to.startsWith('//') && <button className="coach-return" onClick={() => navigate(returnTarget.to, { state: returnTarget.state })}>← Revenir à ma page</button>}
            <div className="coach-header">
                <div className="coach-title">
                    🔍 Trouve
                </div>
                <div className="coach-subtitle">
                    Textes, cours, récits et vos notes personnelles
                </div>
            </div>

            {/* Search Input */}
            <div className="coach-search-wrapper">
                <Search size={18} className="coach-search-icon" />
                <input
                    type="search"
                    ref={inputRef}
                    aria-label="Rechercher dans les textes, les cours et mes notes"
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

            <div className="coach-filters" role="group" aria-label="Types de résultats">{(['all','verse','hadith','invocation','course','arabic','story','note'] as const).map(type=><button key={type} aria-pressed={category===type} onClick={()=>{setCategory(type);setLimit(24);}}>{type==='all'?'Tout':typeLabels[type]}</button>)}</div>
            <label className="coach-studied"><input type="checkbox" checked={studiedOnly} onChange={e=>{setStudiedOnly(e.target.checked);setLimit(24);}}/> Déjà étudié ou annoté par vous</label>
            {category==='note'&&<p className="coach-card-source">Vos notes sont recherchées uniquement sur cet appareil.</p>}
            {unavailable.length>0&&<div className="coach-search-warning" role="status">Recherche partielle : {unavailable.join(', ')} indisponible. Les autres résultats restent accessibles. <button onClick={()=>setRetry(n=>n+1)}>Réessayer</button></div>}
            {/* Loading */}
            {isSearching && (
                <div className="coach-loading">
                    <div className="coach-spinner" />
                    Recherche en cours...
                </div>
            )}

            {/* Results */}
            {!isSearching && hasSearched && filtered.length > 0 && (
                <div className="coach-results">
                    <div className="coach-results-count">
                        {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                    </div>
                    {filtered.slice(0,limit).map((r, i) => (
                        <div
                            key={r.id}
                            className="coach-card"
                            role="button" tabIndex={0}
                            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleCardClick(r); } }}
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
                            {r.studied&&<span className="coach-studied-badge">Déjà étudié ou annoté</span>}
                            {r.source && (
                                <div className="coach-card-source">{r.source}</div>
                            )}
                        </div>
                    ))}
                    {filtered.length>limit&&<button className="coach-more" onClick={()=>setLimit(n=>n+24)}>Afficher la suite ({filtered.length-limit})</button>}
                </div>
            )}

            {searchError && <p role="alert">La recherche n’a pas abouti. Vérifiez votre connexion puis relancez une recherche.</p>}
            {/* No Results */}
            {!isSearching && hasSearched && filtered.length === 0 && (
                <div className="coach-no-results">
                    {unavailable.length?'Aucun résultat dans les sources disponibles':'Aucun résultat dans cette sélection'} pour « {query} »
                </div>
            )}

            {/* Empty State */}
            {!hasSearched && !isSearching && (
                <div className="coach-empty">
                    <div className="coach-empty-emoji">🕌</div>
                    <div className="coach-empty-text">
                        Retrouvez un texte, une explication, un récit ou une note. Essayez « patience », « intention » ou un mot arabe.
                    </div>
                </div>
            )}
        </div>
    );
}
