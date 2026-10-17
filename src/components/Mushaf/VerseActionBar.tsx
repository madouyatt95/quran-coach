import {lazy,Suspense} from 'react';
const StoryContextButton=lazy(()=>import('../Journeys/StoryContextButton'));
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Check, Play, Brain, X, MoreHorizontal, Heart, Lightbulb, Share2, MessageSquare, ScanLine, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReadingBookmarkStore, type BookmarkView } from '../../stores/readingBookmarkStore';
import type { VerseSelection } from './hooks/useVersePress';
import './VerseActionBar.css';

export function VerseActionBar({selection,view,onClose,onPlay,onContinue,onMore,onFavorite,onUnderstand,onAnnotate,favorite,onWord,onMagnify}: {
    onWord?:()=>void; onMagnify?:()=>void;
    selection: VerseSelection; view: BookmarkView; onClose:()=>void; onPlay:()=>void; onContinue?:()=>void; onMore?:()=>void; onFavorite?:()=>void; onUnderstand?:()=>void; favorite?:boolean; onAnnotate?:()=>void;
}) {
    const {ayah,x,y} = selection;
    const navigate = useNavigate();
    const menu = useRef<HTMLElement>(null);
    const [expanded,setExpanded] = useState(false);
    const [saved,setSaved] = useState(false);
    const bookmark=useReadingBookmarkStore(s=>s.bookmark);
    const marked=bookmark?.surah===ayah.surah&&bookmark.ayah===ayah.numberInSurah&&bookmark.view===view;
    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        menu.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
        const escape = (e:KeyboardEvent) => {if(e.key === 'Escape') onClose();};
        const outside = (e:PointerEvent) => {if(!menu.current?.contains(e.target as Node)) onClose();};
        document.addEventListener('keydown',escape);
        document.addEventListener('pointerdown',outside);
        return () => {document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);previous?.focus({preventScroll:true});};
    }, [onClose]);
    const top=Math.max(12,Math.min(y-115,window.innerHeight-(expanded ? 480 : onWord||onMagnify?350:250)));
    return createPortal(<section ref={menu} className="verse-action-bar" role="dialog" aria-label={`Actions du verset ${ayah.surah}:${ayah.numberInSurah}`}
        style={{left:Math.max(12,Math.min(x-160,window.innerWidth-332)),top,maxHeight:`calc(100dvh - ${top+12}px)`}}>
        <header><span>Verset {ayah.surah}:{ayah.numberInSurah}</span><button aria-label="Fermer les actions" onClick={onClose}><X size={16}/></button></header>
        <div className="verse-action-bar__actions">
            <button onClick={() => {if(marked){useReadingBookmarkStore.getState().remove();setSaved(false);return;}useReadingBookmarkStore.getState().save({surah:ayah.surah,ayah:ayah.numberInSurah,page:ayah.page,view,precision:'verse'});setSaved(true);}}>
                {saved ? <Check size={20}/> : <Bookmark size={20}/>}<span>{marked ? 'Retirer le signet' : 'Signet'}</span>
            </button>
            <button onClick={() => {onPlay();onClose();}}><Play size={20}/><span>{onContinue?'Ce verset seul':'Écouter'}</span></button>
            <button onClick={() => {onClose();navigate(`/hifdh?surah=${ayah.surah}&ayah=${ayah.numberInSurah}`);}}><Brain size={20}/><span>Mémoriser</span></button>
            <button className="verse-action-bar__more" aria-label="Autres actions" aria-expanded={onFavorite ? expanded : undefined} onClick={() => {if(onFavorite || !onMore) setExpanded(!expanded); else {onMore();onClose();}}}><MoreHorizontal size={20}/></button>
        </div>
        {onContinue&&<button className="verse-action-bar__continue" onClick={()=>{onContinue();onClose();}}><Play size={17}/>Lire à partir d’ici</button>}
        {(onWord||onMagnify)&&<div className="verse-action-bar__word-tools">{onWord&&<button onClick={()=>{onWord();onClose();}}><Type size={17}/>Mot : sens et prononciation</button>}{onMagnify&&<button onClick={()=>{onMagnify();onClose();}}><ScanLine size={17}/>Agrandir cette ligne</button>}</div>}
        <Suspense fallback={null}><StoryContextButton verseKey={`${ayah.surah}:${ayah.numberInSurah}`} onClose={onClose}/></Suspense>
        {expanded && <div className="verse-action-bar__secondary">
            <button onClick={() => {onClose();navigate(`/passage?surah=${ayah.surah}&ayah=${ayah.numberInSurah}&from=read`);}}><Brain size={17}/>Fiche du verset</button>
            {onFavorite && <button aria-pressed={favorite} onClick={onFavorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'}/>{favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</button>}
            {onUnderstand && <button onClick={() => {onUnderstand();onClose();}}><Lightbulb size={17}/>Comprendre</button>}
            {onAnnotate && <button onClick={()=>{onAnnotate();onClose();}}><MessageSquare size={17}/>Annoter</button>}
            {onMore && <button onClick={() => {onMore();onClose();}}><Share2 size={17}/>{onFavorite ? 'Partager' : 'Autres options'}</button>}
        </div>}
        {saved && <span role="status" className="verse-action-bar__saved">Signet enregistré · page {ayah.page}</span>}
    </section>,document.body);
}
