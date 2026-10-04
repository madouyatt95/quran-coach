import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReadingBookmarkStore, resumeReadingBookmark, type BookmarkView } from '../../stores/readingBookmarkStore';
import { useQuranStore } from '../../stores/quranStore';
import { fetchPage } from '../../lib/quranApi';
import { SURAH_START_PAGES } from './mushafConstants';
import type { Ayah } from '../../types';
import './ReadingBookmark.css';

export function ReadingBookmarkControl({ view, page, ayahs = [] }: {view: BookmarkView; page: number; ayahs?: Ayah[]}) {
    const bookmark = useReadingBookmarkStore(s => s.bookmark);
    const save = useReadingBookmarkStore(s => s.save);
    const navigate = useNavigate();
    const dialog = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);
    const [choices, setChoices] = useState<Ayah[]>([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [targetPage, setTargetPage] = useState(page);
    useEffect(() => {
        if (open) dialog.current?.showModal();
        else dialog.current?.close();
    }, [open]);
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const quran = useQuranStore.getState();
        const loaded = ayahs.filter(a => a.page === targetPage);
        const apply = (verses: Ayah[]) => {
            if (cancelled) return;
            setChoices(verses);
            const current = verses.find(a => a.surah === quran.currentSurah && a.numberInSurah === quran.currentAyah) || verses[0];
            setSelected(current ? `${current.surah}:${current.numberInSurah}` : '');
            setLoading(false);
        };
        setLoading(true);
        void fetchPage(targetPage).then(apply).catch(() => apply(loaded));
        return () => { cancelled = true; };
        // Freeze the selected page/verse while the sheet is open.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, targetPage]);
    const close = () => setOpen(false);
    const mark = () => {
        const verse = choices.find(a => `${a.surah}:${a.numberInSurah}` === selected);
        save({page:targetPage, view, surah:verse?.surah || SURAH_START_PAGES.reduce((surah, start, index) => start <= targetPage ? index + 1 : surah, 1),
            ayah:verse?.numberInSurah || 1, precision:verse ? 'verse' : 'page'});
        setSaved(true); close();
    };
    return <>
        <button className="reading-bookmark-trigger" aria-label="Signet de lecture" title="Signet de lecture"
            onClick={() => {setTargetPage(page);setSaved(false);setOpen(true);}}>
            <Bookmark size={19} fill={bookmark?.page === page && bookmark.view === view ? 'currentColor' : 'none'}/>
        </button>
        {saved && <span className="reading-bookmark-toast" role="status"><Check size={16}/> Signet enregistré · page {targetPage}</span>}
        <dialog ref={dialog} className="reading-bookmark-dialog" aria-labelledby={`bookmark-title-${view}`}
            onCancel={close} onClose={close} onClick={e => {if(e.target === dialog.current) close();}}>
            <div className="reading-bookmark-sheet">
                <button className="reading-bookmark-close" aria-label="Fermer le signet" onClick={close}><X size={20}/></button>
                <h2 id={`bookmark-title-${view}`}>Mon signet de lecture</h2>
                <p>Page {targetPage} · {view === 'mushaf' ? 'Texte interactif' : view === 'madinah' ? 'Madinah' : 'Tajweed'}</p>
                {loading ? <p role="status">Chargement des versets…</p> : choices.length ? <>
                    <label htmlFor={`bookmark-verse-${view}`}>Je m’arrête au verset</label>
                    <select id={`bookmark-verse-${view}`} value={selected} onChange={e => setSelected(e.target.value)}>
                        {choices.map(a => <option key={a.number} value={`${a.surah}:${a.numberInSurah}`}>Sourate {a.surah} · verset {a.numberInSurah} — {a.text.slice(0,45)}</option>)}
                    </select>
                </> : <p>Texte indisponible : le signet conservera cette page.</p>}
                <button className="reading-bookmark-save" disabled={loading} onClick={mark}><Bookmark size={18}/> Marquer mon arrêt ici</button>
                <p className="reading-bookmark-help">Ce signet reste en place jusqu’à ce que vous le remplaciez.</p>
                {bookmark && <button className="reading-bookmark-resume" onClick={() => {
                    resumeReadingBookmark(bookmark); close(); navigate('/read');
                }}>Reprendre mon signet · page {bookmark.page}{bookmark.precision === 'verse' ? ` · ${bookmark.surah}:${bookmark.ayah}` : ''}</button>}
            </div>
        </dialog>
    </>;
}
