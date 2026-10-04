import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getTajweedCategories } from '../../lib/tajweedService';
import type { MaskMode } from './mushafConstants';
import type { ArabicFontFamily, ArabicFontSize } from '../../types';

const tajweedCategories = getTajweedCategories();
interface MushafToolbarProps {
    showToolbar: boolean;
    onClose: () => void;
    immersive: boolean;
    setImmersive: (enabled: boolean) => void;
    tajwidEnabled: boolean;
    toggleTajwid: () => void;
    tajwidLayers: string[];
    toggleTajwidLayer: (id: string) => void;
    showTranslation: boolean;
    toggleTranslation: () => void;
    showTransliteration: boolean;
    toggleTransliteration: () => void;
    arabicFontSize: ArabicFontSize;
    setArabicFontSize: (size: ArabicFontSize) => void;
    arabicFontFamily: ArabicFontFamily;
    setArabicFontFamily: (family: ArabicFontFamily) => void;
    maskMode: MaskMode;
    setMaskMode: (mode: MaskMode) => void;
}

export function MushafToolbar(p: MushafToolbarProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (!p.showToolbar) return;
        const element = dialog.current;
        const previous = document.activeElement as HTMLElement | null;
        element?.showModal();
        return () => { element?.close(); previous?.focus({preventScroll:true}); };
    }, [p.showToolbar]);
    if (!p.showToolbar) return null;
    return createPortal(<dialog ref={dialog} className="text-reader-settings" aria-labelledby="text-settings-title"
        onCancel={p.onClose} onKeyDown={e => e.stopPropagation()}
        onClick={e => {if(e.target === e.currentTarget) {const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) p.onClose();}}}>
        <header><div><small>MUSHAF TEXTE</small><h2 id="text-settings-title">Confort de lecture</h2></div><button aria-label="Fermer les réglages" onClick={p.onClose}><X size={20}/></button></header>
        <div className="text-reader-settings__body">
            <section aria-label="Présentation">
                <h3>Votre lecture</h3>
                <label className="text-settings-switch"><span>Traduction<small>Le sens de chaque verset en français</small></span><input type="checkbox" checked={p.showTranslation} onChange={p.toggleTranslation}/></label>
                <label className="text-settings-switch"><span>Phonétique<small>Une aide à la prononciation</small></span><input type="checkbox" checked={p.showTransliteration} onChange={p.toggleTransliteration}/></label>
                <label className="text-settings-switch"><span>Lecture immersive<small>Les commandes se réduisent au défilement</small></span><input type="checkbox" checked={p.immersive} onChange={e=>p.setImmersive(e.target.checked)}/></label>
            </section>
            <section aria-label="Texte arabe"><h3>Texte arabe</h3>
                <div className="text-settings-choices" role="group" aria-label="Taille du texte arabe">{(['sm','md','lg','xl'] as const).map((size,i)=><button key={size} aria-pressed={p.arabicFontSize===size} onClick={()=>p.setArabicFontSize(size)}>{['Petit','Moyen','Grand','Très grand'][i]}</button>)}</div>
                <div className="text-settings-choices" role="group" aria-label="Police arabe">{(['scheherazade','amiri'] as const).map(font=><button key={font} aria-pressed={p.arabicFontFamily===font} onClick={()=>p.setArabicFontFamily(font)}>{font==='amiri'?'Amiri':'Othman'}</button>)}</div>
            </section>
            <details><summary>Tajweed</summary>
                <label className="text-settings-switch"><span>Colorer les règles</span><input type="checkbox" checked={p.tajwidEnabled} onChange={p.toggleTajwid}/></label>
                <div className="text-settings-rules">{tajweedCategories.map(cat=><button key={cat.id} aria-pressed={p.tajwidLayers.includes(cat.id)} disabled={!p.tajwidEnabled} onClick={()=>p.toggleTajwidLayer(cat.id)}><i style={{background:cat.color}}/>{cat.name.split('(')[0].trim()}<span lang="ar">{cat.nameArabic}</span></button>)}</div>
            </details>
            <details><summary>Masquage pour réviser</summary><p>Choisissez la quantité de texte visible pendant votre révision.</p>
                <div className="text-settings-choices" role="group" aria-label="Masquage">{(['visible','hidden','partial','minimal'] as const).map((mode,i)=><button key={mode} aria-pressed={p.maskMode===mode} onClick={()=>p.setMaskMode(mode)}>{['Visible','Caché','Partiel','Flou'][i]}</button>)}</div>
            </details>
        </div>
        <footer><button onClick={p.onClose}>Reprendre la lecture</button></footer>
    </dialog>,document.body);
}
