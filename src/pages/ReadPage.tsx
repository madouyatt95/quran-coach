import { useState, useEffect, useRef, lazy, Suspense, type CSSProperties } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SideMenu } from '../components/Navigation/SideMenu';
import { MushafPage } from '../components/Mushaf/MushafPage';
import { SearchModal } from '../components/Navigation/SearchModal';
import { VoiceSearch } from '../components/VoiceSearch/VoiceSearch';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore } from '../stores/settingsStore';
import { fetchSurah } from '../lib/quranApi';
import { parsePassage } from '../lib/learning';
import { LiveFollowPanel } from '../components/Mushaf/LiveFollowPanel';
import { useLiveFollowStore } from '../stores/liveFollowStore';
import { MushafGestureNavigator } from '../components/Mushaf/MushafGestureNavigator';
import '../components/Mushaf/ReaderHeader.css';
import { Loader2 } from 'lucide-react';
import './ReadPage.css';

const TajweedImagePage = lazy(() => import('../components/Mushaf/TajweedImagePage').then(m => ({ default: m.TajweedImagePage })));
const MadinahImagePage = lazy(() => import('../components/Mushaf/MadinahImagePage').then(m => ({ default: m.MadinahImagePage })));

const InteractiveTajweedPage = lazy(() => import('../components/Mushaf/InteractiveTajweed/InteractiveTajweedPage').then(m => ({ default: m.InteractiveTajweedPage })));

export function ReadPage() {
    const [voiceHost, setVoiceHost] = useState<HTMLDivElement | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [entryStatus, setEntryStatus] = useState('');
    const [entryError, setEntryError] = useState(false);
    const [retry, setRetry] = useState(0);
    const entryRef = useRef<HTMLDivElement>(null);
    const [entryHeight, setEntryHeight] = useState(56);
    const { viewMode: preferredView } = useSettingsStore();
    const liveActive = useLiveFollowStore(s => s.active);
    const viewMode = liveActive && preferredView !== 'tajweed-interactive' ? 'mushaf' : preferredView;

    const { goToAyah, goToPage } = useQuranStore();

    useEffect(() => {
        // This page stays mounted on other routes: only apply an actual reading link.
        if (liveActive || location.pathname !== '/read') { setEntryStatus(''); setEntryError(false); return; }
        if (!searchParams.has('surah')) {
            const page = Number(searchParams.get('page'));
            if (Number.isInteger(page) && page >= 1 && page <= 604) {
                sessionStorage.removeItem('scrollToAyah');
                sessionStorage.setItem('isSilentJump', 'true');
                sessionStorage.setItem('scrollToPage', String(page));
                goToPage(page, { silent: true });
            }
            setEntryStatus(''); setEntryError(false); return;
        }
        const passage = parsePassage(searchParams);
        let cancelled = false;
        setEntryError(false);
        if(preferredView === 'tajweed-interactive') {
            void import('../lib/interactiveMushaf/model').then(({pageForVerse})=>{
                if(cancelled)return;
                const editionPage=pageForVerse(passage.surah,passage.ayah);
                if(editionPage){goToAyah(passage.surah,passage.ayah,editionPage,{silent:true});setEntryStatus('');}
                else {setEntryError(true);setEntryStatus('Ce passage ne correspond pas à cette édition.');}
            });
            return()=>{cancelled=true;};
        }
        const page = Number(searchParams.get('page'));
        if (Number.isInteger(page) && page >= 1 && page <= 604) {
            goToAyah(passage.surah, passage.ayah, page, { silent: true });
            setEntryStatus('');
            return;
        }
        setEntryStatus(`Ouverture du verset ${passage.surah}:${passage.ayah}…`);
        void fetchSurah(passage.surah).then(data => {
            const verse = data.ayahs.find(a => a.numberInSurah === passage.ayah);
            if (cancelled) return;
            if (!verse) throw new Error('Verse unavailable');
            goToAyah(passage.surah, passage.ayah, verse.page, { silent: true });
            setEntryStatus('');
        }).catch(() => {
            if (!cancelled) { setEntryError(true); setEntryStatus('Ce passage n’a pas pu être ouvert. Vérifiez la connexion ou téléchargez sa sourate.'); }
        });
        return () => { cancelled = true; };
    }, [location.pathname, location.key, searchParams, goToAyah, goToPage, liveActive, preferredView, retry]);

    const showEntry = location.pathname === '/read' && !liveActive && !!(entryStatus || location.state?.readerReturn);
    useEffect(() => {
        if (!showEntry || !entryRef.current || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(entries => setEntryHeight(entries[0].target.getBoundingClientRect().height));
        observer.observe(entryRef.current);
        return () => observer.disconnect();
    }, [showEntry]);

    const handleVoiceSearchResult = (surah: number, ayah: number) => {
        navigate(`/read?surah=${surah}&ayah=${ayah}`, { state: location.state });
        setShowVoiceSearch(false);
    };

    return (
        <div className="reader-route" style={{ '--reader-entry-space': `${showEntry ? entryHeight : 0}px` } as CSSProperties}>
            {location.pathname === '/read' && !liveActive && (entryStatus || location.state?.readerReturn) && <div className="reader-entry" ref={entryRef}>
                {location.state?.readerReturn?.to?.startsWith('/') && !location.state.readerReturn.to.startsWith('//') && <button onClick={() => navigate(location.state.readerReturn.to, { state: location.state.readerReturn.state })}>← {location.state.readerReturn.label || 'Retour'}</button>}
                {entryStatus && <span role={entryError ? 'alert' : 'status'}>{entryStatus}</span>}
                {entryError && <button onClick={() => setRetry(value => value + 1)}>Réessayer</button>}
            </div>}
            {viewMode === 'tajweed-interactive' ? (
                <Suspense fallback={<div role="status">Préparation du Mushaf…</div>}>
                    <InteractiveTajweedPage onVoiceHost={setVoiceHost} />
                </Suspense>
            ) : viewMode === 'tajweed' ? (
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 size={32} className="animate-spin" /></div>}>
                    <TajweedImagePage onVoiceHost={setVoiceHost} />
                </Suspense>
            ) : viewMode === 'madinah' ? (
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 size={32} className="animate-spin" /></div>}>
                    <MadinahImagePage onVoiceHost={setVoiceHost} />
                </Suspense>
            ) : (
                <MushafPage onVoiceHost={setVoiceHost} />
            )}

            {location.pathname === '/read' && <LiveFollowPanel host={voiceHost} />}
            {location.pathname === '/read' && !liveActive && viewMode !== 'tajweed-interactive' && <MushafGestureNavigator key={viewMode}/>}
            <SideMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

            <SearchModal
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
            />

            {showVoiceSearch && (
                <VoiceSearch
                    onResult={handleVoiceSearchResult}
                    onClose={() => setShowVoiceSearch(false)}
                />
            )}
        </div>
    );
}
