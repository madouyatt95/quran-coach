import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Check, Play, Brain, X, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReadingBookmarkStore, type BookmarkView } from '../../stores/readingBookmarkStore';
import type { VerseSelection } from './hooks/useVersePress';
import './VerseActionBar.css';

export function VerseActionBar({selection,view,onClose,onPlay,onMore}: {
    selection: VerseSelection; view: BookmarkView; onClose:()=>void; onPlay:()=>void; onMore?:()=>void;
}) {
    const {ayah,x,y} = selection;
    const navigate = useNavigate();
    const menu = useRef<HTMLElement>(null);
    const [saved,setSaved] = useState(false);
    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        menu.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
        const escape = (e:KeyboardEvent) => {if(e.key === 'Escape') onClose();};
        const outside = (e:PointerEvent) => {if(!menu.current?.contains(e.target as Node)) onClose();};
        document.addEventListener('keydown',escape);
        document.addEventListener('pointerdown',outside);
        return () => {document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);previous?.focus({preventScroll:true});};
    }, [onClose]);
    return createPortal(<section ref={menu} className="verse-action-bar" role="dialog" aria-label={`Actions du verset ${ayah.surah}:${ayah.numberInSurah}`}
        style={{left:Math.max(12,Math.min(x-160,window.innerWidth-332)),top:Math.max(12,Math.min(y-115,window.innerHeight-250))}}>
        <header><span>Verset {ayah.surah}:{ayah.numberInSurah}</span><button aria-label="Fermer les actions" onClick={onClose}><X size={16}/></button></header>
        <div className="verse-action-bar__actions">
            <button onClick={() => {useReadingBookmarkStore.getState().save({surah:ayah.surah,ayah:ayah.numberInSurah,page:ayah.page,view,precision:'verse'});setSaved(true);}}>
                {saved ? <Check size={20}/> : <Bookmark size={20}/>}<span>{saved ? 'Enregistré' : 'Signet'}</span>
            </button>
            <button onClick={() => {onPlay();onClose();}}><Play size={20}/><span>Écouter</span></button>
            <button onClick={() => {onClose();navigate(`/hifdh?surah=${ayah.surah}&ayah=${ayah.numberInSurah}`);}}><Brain size={20}/><span>Mémoriser</span></button>
            {onMore && <button className="verse-action-bar__more" aria-label="Autres actions" onClick={() => {onMore();onClose();}}><MoreHorizontal size={20}/></button>}
        </div>
        {saved && <span role="status" className="verse-action-bar__saved">Signet enregistré · page {ayah.page}</span>}
    </section>,document.body);
}
