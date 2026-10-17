import { FindButton } from './FindButton';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Bell, BellOff, BookOpen, ChevronDown, Headphones, Mic, Pencil, Search, Settings, Stars, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../stores/notificationStore';
import { usePrayerStore } from '../../stores/prayerStore';
import { useReadingBookmarkStore, resumeReadingBookmark } from '../../stores/readingBookmarkStore';
import { useQuranStore } from '../../stores/quranStore';
import { useListenStore } from '../../stores/listenStore';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { useHifdhJourneyStore } from '../../stores/hifdhJourneyStore';
import { useLearningStore } from '../../stores/learningStore';
import { useSRSStore } from '../../stores/srsStore';
import { localDay, passageUrl } from '../../lib/learning';
import { readHifdhSession } from '../../lib/hifdhSession';
import { menuResumeOptions, type MenuResume } from '../../lib/menuResume';
import { MENU_FAVORITES_KEY, MENU_SECTIONS_KEY, moveMenuFavorite, replaceMenuFavorite, type MenuSections, readMenuFavorites, readMenuSections, toggleMenuFavorite } from '../../lib/menuFavorites';
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush } from '../../lib/notificationService';
import { searchMenuDestinations } from '../../lib/menuSearch';
import { Capacitor } from '@capacitor/core';
import './SideMenu.css';

interface SideMenuProps { isOpen: boolean; onClose: () => void }
interface MenuDestination { path: string; icon: string; label: string }

function MenuSection({ title, count, expanded, onToggle, children }: {
    title: string; count: number; expanded: boolean; onToggle: (expanded: boolean) => void; children: React.ReactNode;
}) {
    return <details className="side-menu-section" open={expanded} onToggle={event => onToggle(event.currentTarget.open)}>
        <summary><span>{title}</span><small>{count}</small><ChevronDown size={17} aria-hidden="true" /></summary>
        <div className="side-menu-section-items">{children}</div>
    </details>;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const notif = useNotificationStore();
    const prayer = usePrayerStore();
    const bookmark = useReadingBookmarkStore(s => s.bookmark);
    const progress = useQuranStore(s => s.progress);
    const surahs = useQuranStore(s => s.surahs);
    const goToAyah = useQuranStore(s => s.goToAyah);
    const lastListened = useListenStore(s => s.lastListened);
    const resumeAudio = useAudioPlayerStore(s => s.resume);
    const journeyPlan = useHifdhJourneyStore(s => s.plan);
    const learningSession = useLearningStore(s => s.session);
    const learningMinutes = useLearningStore(s => s.minutes);
    const cards = useSRSStore(s => s.cards);
    const [isLoading, setIsLoading] = useState(false);
    const [notificationError, setNotificationError] = useState('');
    const [favorites, setFavorites] = useState(readMenuFavorites);
    useEffect(()=>{const refresh=()=>setFavorites(readMenuFavorites());window.addEventListener('storage',refresh);window.addEventListener('quran-menu-favorites',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('quran-menu-favorites',refresh);};},[]);
    const [sectionsOpen, setSectionsOpen] = useState(readMenuSections);
    const [editing, setEditing] = useState(false);
    const [query, setQuery] = useState('');
    const [replacing, setReplacing] = useState<string | null>(null);
    const [showActivities, setShowActivities] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const choicesRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const pickerDoneButtonRef = useRef<HTMLButtonElement>(null);
    const previousEditingRef = useRef(false);
    const reorderedRef = useRef<{ path: string; direction: -1 | 1 } | null>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) { setEditing(false); setQuery(''); setReplacing(null); setShowActivities(false); return; }
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return; }
            if (event.key !== 'Tab' || !menuRef.current) return;
            const focusable = Array.from(menuRef.current.querySelectorAll<HTMLElement>(
                'a[href], input:not([disabled]), button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
            )).filter(element => element.getClientRects().length > 0);
            if (!focusable.length) return;
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !menuRef.current.contains(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !menuRef.current.contains(document.activeElement))) {
                event.preventDefault(); first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen) { previousEditingRef.current = false; return; }
        if (previousEditingRef.current !== editing) {
            (editing ? pickerDoneButtonRef.current : editButtonRef.current)?.focus();
            previousEditingRef.current = editing;
        }
    }, [editing, isOpen]);
    useEffect(() => {
        const pending = reorderedRef.current;
        if (!pending || !editing) return;
        reorderedRef.current = null;
        const row = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('.side-menu-picked-row') || [])
            .find(element => element.dataset.path === pending.path);
        const target = row?.querySelector<HTMLButtonElement>(`button[data-direction="${pending.direction}"]:not(:disabled)`)
            || row?.querySelector<HTMLButtonElement>('button:not(:disabled)');
        target?.focus();
    }, [favorites, editing]);

    const sections: { id: keyof MenuSections; title: string; items: MenuDestination[] }[] = [
        { id: 'discover', title: t('sideMenu.discover'), items: [
            { path: '/prophets', icon: '📜', label: t('nav.prophets') },
            { path: '/stories', icon: '📚', label: t('sideMenu.stories') },
            { path: '/atlas', icon: '🗺️', label: t('sideMenu.atlas') },
            { path: '/themes', icon: '📖', label: t('sideMenu.themes') },
            { path: '/hadiths', icon: '✨', label: t('sideMenu.hadiths') },
            { path: '/tafsir', icon: '📘', label: t('sideMenu.tafsir') },
            { path: '/fahm', icon: '💡', label: t('sideMenu.fahm') },
        ] },
        { id: 'practice', title: t('sideMenu.practice'), items: [
            { path: '/quiz', icon: '🧠', label: t('sideMenu.quiz') },
            { path: '/test-memorization', icon: '🎓', label: t('sideMenu.testMe') },
            { path: '/academy', icon: '🎓', label: t('sideMenu.academy') },
            { path: '/circles', icon: '👥', label: t('sideMenu.circles') },
        ] },
        { id: 'daily', title: t('sideMenu.daily'), items: [
            { path: '/prayers', icon: '🌙', label: t('sideMenu.prayers') },
            { path: '/qibla', icon: '🧭', label: t('sideMenu.qibla') },
            { path: '/adhkar', icon: '🤲', label: t('sideMenu.adhkar') },
        ] },
        { id: 'progress', title: t('sideMenu.myProgress'), items: [
            { path: '/favorites', icon: '🔖', label: t('sideMenu.library') },
            { path: '/storage', icon: '📥', label: t('sideMenu.downloads') },
            { path: '/sentinel', icon: '🛡️', label: t('sideMenu.sentinel') },
            { path: '/dashboard', icon: '📊', label: t('sideMenu.dashboard') },
        ] },
    ];
    const allItems = sections.flatMap(section => section.items);

    const searchResults = searchMenuDestinations([...allItems,
        { path: '/', icon: '🏠', label: 'Accueil' }, { path: '/read', icon: '📖', label: 'Lecture' },
        { path: '/voice-search', icon: '🎙️', label: 'Identifier' }, { path: '/listen', icon: '🎧', label: 'Écoute' },
        { path: '/hifdh', icon: '🧠', label: 'Mémorisation' }, { path: '/learning', icon: '✦', label: 'Ma séance du jour' },
        { path: '/settings', icon: '⚙️', label: 'Réglages' },
    ], query);
    const surahName = (number: number) => surahs.find(surah => surah.number === number)?.englishName || `Sourate ${number}`;

    const updateFavorite = (path: string) => {
        const next = replacing ? replaceMenuFavorite(favorites, replacing, path) : toggleMenuFavorite(favorites, path);
        setReplacing(null);
        setFavorites(next);
        try { localStorage.setItem(MENU_FAVORITES_KEY, JSON.stringify(next)); window.dispatchEvent(new Event('quran-menu-favorites')); } catch { /* browsing still works */ }
    };
    const reorderFavorite = (path: string, direction: -1 | 1) => {
        reorderedRef.current = { path, direction };
        const next = moveMenuFavorite(favorites, path, direction);
        setFavorites(next);
        try { localStorage.setItem(MENU_FAVORITES_KEY, JSON.stringify(next)); window.dispatchEvent(new Event('quran-menu-favorites')); } catch { /* Browsing still works. */ }
    };
    const updateSection = (id: keyof MenuSections, expanded: boolean) => {
        const next = { ...sectionsOpen, [id]: expanded };
        setSectionsOpen(next);
        try { localStorage.setItem(MENU_SECTIONS_KEY, JSON.stringify(next)); } catch { /* Browsing still works. */ }
    };
    const resumes = menuResumeOptions({ bookmark, progress, lastListened, hifdhSession: readHifdhSession(localStorage), journeyPlan });
    const resume = resumes[0] || null;
    const todaySession = learningSession?.date === localDay() ? learningSession : null;
    const nextStep = todaySession?.steps.find(step => !todaySession.done.includes(step.id) && !todaySession.skipped.includes(step.id));
    const dueCount = Object.values(cards).filter(card => card.nextReviewDate <= localDay()).length;
    const handleResume = (resume: MenuResume | null) => {
        if (resume?.kind === 'listening') {
            const track = resume.track;
            const journey = track.playlist?.[track.playlistIndex || 0]?.journey;
            onClose();
            if (journey) navigate(`/listen/experience?journey=${encodeURIComponent(journey.id)}&voice=${encodeURIComponent(String(track.reciterId))}`);
            else { navigate('/listen'); resumeAudio(track); }
            return;
        }
        if (resume?.kind === 'memorizing') {
            onClose(); navigate(`/hifdh?resume=${resume.journey ? 'journey' : 'session'}`); return;
        }
        if (resume?.kind === 'reading' && resume.bookmark) resumeReadingBookmark(resume.bookmark);
        else if (progress) {
            sessionStorage.setItem('isSilentJump', 'true');
            sessionStorage.setItem('scrollToAyah', JSON.stringify({ surah: progress.lastSurah, ayah: progress.lastAyah }));
            goToAyah(progress.lastSurah, progress.lastAyah, progress.lastPage, { silent: false });
        }
        onClose(); navigate('/read');
    };
    const handleToggleNotifications = async () => {
        if (isLoading) return;
        setNotificationError('');
        try {
            setIsLoading(true);
            if (!Capacitor.isNativePlatform() && (!('serviceWorker' in navigator) || !('PushManager' in window))) {
                setNotificationError(t('sideMenu.notificationsUnavailable')); return;
            }
            if (notif.enabled) {
                await unsubscribeFromPush(); notif.setEnabled(false); return;
            }
            const permission = await requestNotificationPermission();
            if (permission !== 'granted') { setNotificationError(t('sideMenu.notificationsDenied')); return; }
            const ok = await subscribeToPush({
                prayerEnabled: notif.prayerEnabled, prayerMinutesBefore: notif.prayerMinutesBefore,
                prayerMinutesConfig: notif.prayerMinutesConfig, hadithEnabled: notif.hadithEnabled,
                challengeEnabled: notif.challengeEnabled, daruriSobhEnabled: notif.daruriSobhEnabled,
                daruriAsrEnabled: notif.daruriAsrEnabled, akhirIshaEnabled: notif.akhirIshaEnabled,
                prayerSettings: prayer.settings,
            });
            if (ok) { notif.setEnabled(true); notif.setPermission('granted'); }
            else setNotificationError(t('sideMenu.notificationsUnavailable'));
        } catch (error) {
            console.error('[SideMenu] Toggle error:', error);
            setNotificationError(t('sideMenu.notificationsUnavailable'));
        } finally { setIsLoading(false); }
    };

    if (!isOpen) return null;
    const sessionUrl = nextStep ? `${passageUrl(nextStep)}&step=${encodeURIComponent(nextStep.id)}` : '/learning';
    return <>
        <div className="side-menu-backdrop" aria-hidden="true" onClick={onClose} />
        <div className="side-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label={t('sideMenu.menuTitle')}>
            <header className="side-menu-header">
                <div className="side-menu-brand"><Stars size={22} aria-hidden="true" /><span>{t('app.name')}</span></div>
                <button ref={closeButtonRef} className="side-menu-close" type="button" aria-label={t('sideMenu.close')} onClick={onClose}><X size={22} aria-hidden="true" /></button>
            </header>
            <nav className="side-menu-nav" aria-label={t('sideMenu.menuTitle')}>
                {editing ? <div className="side-menu-picker">
                    <div className="side-menu-favorites-heading">
                        <h2>{t('sideMenu.chooseFavorites')}</h2>
                        <button ref={pickerDoneButtonRef} type="button" onClick={() => { setEditing(false); setReplacing(null); }}>{t('sideMenu.done')}</button>
                    </div>
                    <p className="side-menu-edit-help">{t('sideMenu.pickerHelp')}</p>
                    <div className="side-menu-picked" aria-label={t('sideMenu.selectedFavorites')}>
                        {favorites.map((path, index) => {
                            const item = allItems.find(candidate => candidate.path === path);
                            if (!item) return null;
                            return <div className="side-menu-picked-row" data-path={path} key={path}>
                                <span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong>
                                <button type="button" data-direction="-1" disabled={index === 0} onClick={() => reorderFavorite(path, -1)} aria-label={t('sideMenu.moveFavoriteUp', { name: item.label })}><ArrowUp size={17} aria-hidden="true" /></button>
                                <button type="button" data-direction="1" disabled={index === favorites.length - 1} onClick={() => reorderFavorite(path, 1)} aria-label={t('sideMenu.moveFavoriteDown', { name: item.label })}><ArrowDown size={17} aria-hidden="true" /></button>
                                <div className="side-menu-picked-actions">
                                    <button type="button" aria-label={t('sideMenu.replaceFavorite', { name: item.label })} onClick={() => { setReplacing(path); requestAnimationFrame(() => { choicesRef.current?.scrollIntoView({ block: 'nearest' }); choicesRef.current?.focus(); }); }}>{t('sideMenu.replace')}</button>
                                    <button type="button" aria-label={t('sideMenu.removeFavorite', { name: item.label })} onClick={() => { setReplacing(null); const next = toggleMenuFavorite(favorites, path); setFavorites(next); try { localStorage.setItem(MENU_FAVORITES_KEY, JSON.stringify(next)); window.dispatchEvent(new Event('quran-menu-favorites')); } catch { /* Local storage unavailable. */ } }}><X size={16} aria-hidden="true" /> Retirer</button>
                                </div>
                            </div>;
                        })}
                    </div>
                    <div ref={choicesRef} className="side-menu-replace-status" tabIndex={-1}>
                        {replacing && <><p role="status">{t('sideMenu.replaceHelp', { name: allItems.find(item => item.path === replacing)?.label })}</p><button type="button" onClick={() => setReplacing(null)}>{t('sideMenu.cancel')}</button></>}
                    </div>
                    {sections.map(section => <div className="side-menu-picker-group" key={section.id}>
                        <h3>{section.title}</h3>
                        {section.items.map(item => {
                            const selected = favorites.includes(item.path);
                            return <button type="button" key={item.path} aria-pressed={selected}
                                disabled={replacing ? selected : !selected && favorites.length >= 4} onClick={() => updateFavorite(item.path)}>
                                <span aria-hidden="true">{item.icon}</span><span>{item.label}</span><span aria-hidden="true">{selected ? '✓' : '+'}</span>
                            </button>;
                        })}
                    </div>)}
                </div> : <>
                <div className="side-menu-search">
                    <Search size={18} aria-hidden="true" />
                    <input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={t('sideMenu.searchMenu')} placeholder={t('sideMenu.searchPlaceholder')} />
                    {query && <button type="button" aria-label="Effacer la recherche" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={17} aria-hidden="true" /></button>}
                </div>
                {query.trim() ? <div className="side-menu-search-results">
                    <p role="status">{searchResults.length ? `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''}` : t('sideMenu.noResults')}</p>
                    {searchResults.map(item => <div className="side-menu-destination" key={item.path}><NavLink to={item.path} onClick={onClose}><span aria-hidden="true">{item.icon}</span><span>{item.label}</span></NavLink></div>)}
                    <FindButton expanded query={query} onClick={onClose} />
                </div> : <>
                <div className="side-menu-priority">
                    <button className="side-menu-resume" type="button" onClick={() => handleResume(resume)}>
                        {resume?.kind === 'listening' ? <Headphones size={21} aria-hidden="true" /> : resume?.kind === 'memorizing' ? <Mic size={21} aria-hidden="true" /> : <BookOpen size={21} aria-hidden="true" />}
                        <span><strong>{resume?.kind === 'listening' ? t('sideMenu.resumeListening') : resume?.kind === 'memorizing' ? t('sideMenu.resumeMemorizing') : resume ? t('sideMenu.resumeReading') : t('sideMenu.openReading')}</strong>
                            {resume?.kind === 'reading' && <small>{surahName(resume.surah)} · p. {resume.page} · {t('sideMenu.verse')} {resume.ayah}</small>}
                            {resume?.kind === 'listening' && <small>{resume.track.surahName} · {Math.floor(resume.track.position / 60)}:{String(Math.floor(resume.track.position % 60)).padStart(2, '0')}</small>}
                            {resume?.kind === 'memorizing' && <small>{surahName(resume.surah)} · {t('sideMenu.verse')} {resume.ayah}{resume.journey ? ` · ${t('sideMenu.guidedJourney')}` : ''}</small>}
                        </span><span aria-hidden="true">→</span>
                    </button>
                    {resumes.length > 1 && <button className="side-menu-activities-toggle" type="button" aria-expanded={showActivities} aria-controls="menu-other-activities" onClick={() => setShowActivities(value => !value)}>{t(showActivities ? 'sideMenu.hideActivities' : 'sideMenu.otherActivities')}<ChevronDown size={16} aria-hidden="true" /></button>}
                    {showActivities && <div id="menu-other-activities" className="side-menu-activities">
                        {resumes.slice(1).map(activity => <button type="button" key={activity.kind} onClick={() => handleResume(activity)}>
                            <span aria-hidden="true">{activity.kind === 'reading' ? '📖' : activity.kind === 'listening' ? '🎧' : '🧠'}</span>
                            <span><strong>{t(activity.kind === 'reading' ? 'sideMenu.resumeReading' : activity.kind === 'listening' ? 'sideMenu.resumeListening' : 'sideMenu.resumeMemorizing')}</strong>
                            <small>{activity.kind === 'listening' ? `${activity.track.surahName} · ${Math.floor(activity.track.position / 60)}:${String(Math.floor(activity.track.position % 60)).padStart(2, '0')}` : `${surahName(activity.surah)} · verset ${activity.ayah}`}</small></span><span aria-hidden="true">→</span>
                        </button>)}
                    </div>}
                    <NavLink className="side-menu-session" to={sessionUrl} onClick={onClose}>
                        <span aria-hidden="true">✦</span><span><strong>{t('sideMenu.todaySession')}</strong>
                            <small>{nextStep ? `${todaySession!.minutes} min · ${nextStep.label} ${nextStep.surah}:${nextStep.ayah}` : todaySession ? t('sideMenu.sessionComplete') : `${learningMinutes} min · ${dueCount ? t('sideMenu.reviewsDue', { count: dueCount }) : t('sideMenu.prepareSession')}`}</small>
                        </span><span aria-hidden="true">→</span>
                    </NavLink>
                    <FindButton expanded onClick={onClose} />
                </div>
                <div className="side-menu-favorites-heading">
                    <h2>{t('sideMenu.favorites')}</h2>
                    <button ref={editButtonRef} type="button" onClick={() => setEditing(true)}>
                        <Pencil size={14} aria-hidden="true" /> {t('sideMenu.edit')}
                    </button>
                </div>
                <div className="side-menu-favorites">
                    {favorites.map(path => {
                        const item = allItems.find(candidate => candidate.path === path);
                        if (!item) return null;
                        return <div className="side-menu-favorite" key={path}>
                            <NavLink to={path} onClick={onClose} aria-label={item.label}>
                                <span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong>
                            </NavLink>
                        </div>;
                    })}
                    {favorites.length < 4 && <button className="side-menu-empty-favorite" type="button" onClick={() => setEditing(true)}>＋ {t('sideMenu.addFavorite')}</button>}
                </div>
                <div className="side-menu-sections">
                    {sections.map(section => <MenuSection key={section.id} title={section.title} count={section.items.length}
                        expanded={sectionsOpen[section.id] ?? section.items.some(item => item.path === location.pathname)}
                        onToggle={expanded => updateSection(section.id, expanded)}>
                            {section.items.map(item => {
                                return <div className="side-menu-destination" key={item.path}>
                                    <NavLink to={item.path} onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
                                        <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                                    </NavLink>
                                </div>;
                            })}
                    </MenuSection>)}
                </div>
                </>}
                </>}
            </nav>
            <footer className="side-menu-footer">
                <div className="side-menu-notification-row">
                <button className="side-menu-notification" type="button" role="switch" aria-checked={notif.enabled}
                    aria-label={t('sideMenu.notifications')} disabled={isLoading} onClick={handleToggleNotifications}>
                    {notif.enabled ? <Bell size={19} aria-hidden="true" /> : <BellOff size={19} aria-hidden="true" />}
                    <span>{t('sideMenu.notifications')} <small>{notif.enabled ? t('sideMenu.enabled') : t('sideMenu.disabled')}</small></span>
                    <span className={'side-menu-switch' + (notif.enabled ? ' active' : '')} aria-hidden="true"><span /></span>
                </button>
                <NavLink to="/settings#notifications" onClick={onClose} className="side-menu-customize" aria-label={t('sideMenu.customizeNotifications')} title={t('sideMenu.customizeNotifications')}><Settings size={18} aria-hidden="true" /></NavLink>
                </div>
                {notificationError && <p role="alert" className="side-menu-error">{notificationError}</p>}
                <NavLink to="/settings" onClick={onClose}><Settings size={19} aria-hidden="true" />{t('sideMenu.settings')}<span aria-hidden="true">→</span></NavLink>
            </footer>
        </div>
    </>;
}
