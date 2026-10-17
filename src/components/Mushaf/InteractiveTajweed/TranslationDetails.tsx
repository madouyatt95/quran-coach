import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import {X} from 'lucide-react';
import {CHAPTERS} from '../../../lib/interactiveMushaf/model';

/** The full translation floats above the reader and never changes its dimensions. */
export function TranslationDetails({surah,ayah,text,onClose}:{surah:number;ayah:number;text:string;onClose:()=>void}) {
    const dialog=useRef<HTMLDialogElement>(null);
    useEffect(()=>{dialog.current?.showModal();},[]);
    return createPortal(<dialog ref={dialog} className="iq-sheet iq-translation-details" aria-label="Traduction complète" onCancel={onClose} onClose={onClose} onClick={event=>{if(event.target===dialog.current)onClose();}}>
        <div className="iq-sheet-content">
            <header><h2>{CHAPTERS[surah-1]?.latin} · {surah}:{ayah}</h2><button aria-label="Fermer la traduction complète" onClick={onClose}><X size={20}/></button></header>
            <p lang="fr">{text}</p>
            <footer><small>Traduction : Muhammad Hamidullah</small><Link to={`/tafsir?surah=${surah}&ayah=${ayah}`}>Tafsir</Link></footer>
        </div>
    </dialog>,document.body);
}
