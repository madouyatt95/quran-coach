import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { searchQuran } from '../../lib/quranApi';
import { SURAH_NAMES_FR, JUZ_START_PAGES } from './mushafConstants';
import type { Ayah } from '../../types';

interface SearchResult extends Ayah {
    translation?: string;
    page: number;
}

interface MushafSearchOverlayProps {
    surahs: Array<{ number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number; revelationType: string }>;
    currentPage: number;
    goToSurah: (num: number) => void;
    goToPage: (page: number) => void;
    scrollToVerse: (surah: number, ayah: number) => void;
    onClose: () => void;
}

export function MushafSearchOverlay({
    surahs,
    currentPage,
    goToSurah,
    goToPage,
    scrollToVerse,
    onClose,
}: MushafSearchOverlayProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [verseResults, setVerseResults] = useState<SearchResult[]>([]);
    const [isSearchingVerses, setIsSearchingVerses] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Filter surahs based on query
    const filteredSurahs = searchQuery
        ? surahs.filter(s => {
            const q = searchQuery.toLowerCase();
            return (
                s.englishName.toLowerCase().includes(q) ||
                s.name.includes(searchQuery) ||
                (s.englishNameTranslation && s.englishNameTranslation.toLowerCase().includes(q)) ||
                (SURAH_NAMES_FR[s.number] && SURAH_NAMES_FR[s.number].toLowerCase().includes(q)) ||
                s.number.toString() === searchQuery
            );
        })
        : surahs;

    // Verse search with debounce
    useEffect(() => {
        if (searchQuery.length >= 3 && !/^\d+$/.test(searchQuery)) {
            setIsSearchingVerses(true);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(async () => {
                try {
                    const arRes = await searchQuran(searchQuery);

                    // Also search French via alquran.cloud
                    let frenchResults: Array<{ number: number; text: string }> = [];
                    try {
                        const frResponse = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/fr.hamidullah`);
                        const frData = await frResponse.json();
                        if (frData.code === 200 && frData.data?.matches) {
                            frenchResults = frData.data.matches.map((m: any) => ({
                                number: m.number,
                                text: m.text,
                            }));
                        }
                    } catch { /* ignore French search errors */ }

                    const merged = new Map<number, SearchResult>();
                    for (const m of arRes) {
                        merged.set(m.number, { ...m, page: m.page || 0 });
                    }
                    for (const f of frenchResults) {
                        if (merged.has(f.number)) {
                            const existing = merged.get(f.number)!;
                            merged.set(f.number, { ...existing, translation: f.text });
                        }
                    }

                    const results = Array.from(merged.values()).slice(0, 20);
                    const needsPage = results.filter(r => !r.page || r.page <= 0);
                    if (needsPage.length > 0) {
                        const pagePromises = needsPage.map(async r => {
                            try {
                                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${r.number}`);
                                const data = await res.json();
                                if (data.code === 200 && data.data?.page) {
                                    r.page = data.data.page;
                                }
                            } catch { /* ignore */ }
                        });
                        await Promise.all(pagePromises);
                    }

                    setVerseResults(results);
                } catch {
                    setVerseResults([]);
                }
                setIsSearchingVerses(false);
            }, 400);
        } else {
            setVerseResults([]);
            setIsSearchingVerses(false);
        }

        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    const handleClose = useCallback(() => {
        setSearchQuery('');
        onClose();
    }, [onClose]);

    return (
        <div className="mih-search-overlay">
            <div className="mih-search-header">
                <input
                    className="mih-search-input"
                    placeholder="Nom arabe, français, anglais ou n° de page..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                />
                <button className="mih-search-cancel" onClick={handleClose}>
                    Annuler
                </button>
            </div>

            {/* Direct page input */}
            {/^\d+$/.test(searchQuery) && parseInt(searchQuery) >= 1 && parseInt(searchQuery) <= 604 && (
                <div
                    className="mih-search-item"
                    onClick={() => { goToPage(parseInt(searchQuery)); handleClose(); }}
                >
                    <div className="mih-search-item__icon"><Search size={18} /></div>
                    <div className="mih-search-item__info">
                        <div className="mih-search-item__name">Aller à la page {searchQuery}</div>
                    </div>
                </div>
            )}

            {/* Direct Verse Jump (Surah:Verse) */}
            {/^(\d+)\s*[:\s-]\s*(\d+)$/.test(searchQuery) && (
                (() => {
                    const match = searchQuery.match(/^(\d+)\s*[:\s-]\s*(\d+)$/);
                    if (!match) return null;
                    const surahNum = parseInt(match[1]);
                    const ayahNum = parseInt(match[2]);
                    const surah = surahs.find(s => s.number === surahNum);

                    if (surah && ayahNum >= 1 && ayahNum <= surah.numberOfAyahs) {
                        return (
                            <div
                                className="mih-search-item"
                                style={{ background: 'rgba(201, 168, 76, 0.12)' }}
                                onClick={async () => {
                                    try {
                                        // Fetch the ayah to find its page
                                        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}`);
                                        const data = await response.json();
                                        if (data.code === 200 && data.data.page) {
                                            sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: surahNum, ayah: ayahNum }));
                                            goToPage(data.data.page);
                                            handleClose();
                                        }
                                    } catch (e) { console.error('Verse jump failed', e); }
                                }}
                            >
                                <div className="mih-search-item__icon"><Search size={18} /></div>
                                <div className="mih-search-item__info">
                                    <div className="mih-search-item__name">Aller au verset {surahNum}:{ayahNum}</div>
                                    <div className="mih-search-item__detail">{surah.englishName} • {SURAH_NAMES_FR[surahNum]}</div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()
            )}

            {/* Juz Quick Navigation */}
            {!searchQuery && (
                <>
                    <div className="mih-search-label">Naviguer par Juz</div>
                    <div className="mih-juz-scroll">
                        {JUZ_START_PAGES.map((page, idx) => (
                            <button
                                key={idx}
                                className={`mih-juz-pill ${currentPage >= page && (idx === 29 || currentPage < JUZ_START_PAGES[idx + 1]) ? 'active' : ''}`}
                                onClick={() => { goToPage(page); handleClose(); }}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div className="mih-search-label">
                {searchQuery ? `${filteredSurahs.length} sourate(s)` : '114 sourates'}
            </div>

            <div className="mih-search-list">
                {filteredSurahs.map(s => (
                    <div
                        key={s.number}
                        className="mih-search-item"
                        onClick={() => { goToSurah(s.number); handleClose(); }}
                    >
                        <div className="mih-search-item__icon">{s.number}</div>
                        <div className="mih-search-item__info">
                            <div className="mih-search-item__name">{s.englishName} — {SURAH_NAMES_FR[s.number] || s.englishNameTranslation}</div>
                            <div className="mih-search-item__detail">
                                {s.englishNameTranslation && <>{s.englishNameTranslation} • </>}{s.numberOfAyahs} versets • {s.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Verse text search results */}
            {searchQuery.length >= 3 && !/^\d+$/.test(searchQuery) && (
                <>
                    <div className="mih-search-label" style={{ marginTop: 12 }}>
                        {isSearchingVerses
                            ? 'Recherche dans les versets...'
                            : `${verseResults.length} verset(s) trouvé(s)`
                        }
                    </div>
                    <div className="mih-search-list">
                        {verseResults.map(v => {
                            const surah = surahs.find(s => s.number === v.surah);
                            return (
                                <div
                                    key={v.number}
                                    className="mih-search-item"
                                    onClick={() => {
                                        if (v.page === currentPage) {
                                            scrollToVerse(v.surah, v.numberInSurah);
                                        } else {
                                            sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: v.surah, ayah: v.numberInSurah }));
                                            goToPage(v.page);
                                        }
                                        handleClose();
                                    }}
                                >
                                    <div className="mih-search-item__icon" style={{ fontSize: '0.7rem' }}>
                                        {v.surah}:{v.numberInSurah}
                                    </div>
                                    <div className="mih-search-item__info">
                                        {v.text && (
                                            <div className="mih-search-item__name" dir="rtl" style={{ fontFamily: 'var(--font-arabic)', fontSize: '0.95rem' }}>
                                                {v.text.length > 80 ? v.text.slice(0, 80) + '…' : v.text}
                                            </div>
                                        )}
                                        {v.translation && (
                                            <div className="mih-search-item__detail" style={{ fontStyle: 'italic' }}>
                                                {v.translation.length > 100 ? v.translation.slice(0, 100) + '…' : v.translation}
                                            </div>
                                        )}
                                        <div className="mih-search-item__detail" style={{ marginTop: 2 }}>
                                            {surah?.englishName} • Page {v.page}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
