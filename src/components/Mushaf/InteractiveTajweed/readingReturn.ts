import {PAGE_MANIFEST,isInteractivePage} from '../../../lib/interactiveMushaf/model';
import {captureReadingAnchor} from '../../Pupitre/usePupitreContinuity';
const STORAGE='quran-coach-reading-return';
export type ReadingReturn={page:number;surah:number;ayah:number;scroll:number;anchor:ReturnType<typeof captureReadingAnchor>};
export function readReadingReturn():ReadingReturn|null{
    try{const v=JSON.parse(sessionStorage.getItem(STORAGE)||'null') as ReadingReturn|null;
        if(!v||!isInteractivePage(v.page)||!PAGE_MANIFEST[v.page].verseKeys.includes(`${v.surah}:${v.ayah}`)||!Number.isFinite(v.scroll)||v.scroll<0)return null;
        if(v.anchor&&(v.anchor.attribute!=='data-word-key'||!/^\d+:\d+:\d+$/.test(v.anchor.key)||!Number.isFinite(v.anchor.offset)||!Number.isFinite(v.anchor.offsetX)))return null;
        return v;
    }catch{return null;}
}
export function saveReadingReturn(point:ReadingReturn|null){try{if(point)sessionStorage.setItem(STORAGE,JSON.stringify(point));else sessionStorage.removeItem(STORAGE);}catch{/* Optional local continuity. */}}
export function captureReadingReturn(viewport:HTMLElement,page:number,surah:number,ayah:number):ReadingReturn{
    const root=viewport.closest<HTMLElement>('.iq-reader');
    const anchor=root?captureReadingAnchor(root):null;
    const keys=PAGE_MANIFEST[page].verseKeys;
    const candidate=anchor?.key.split(':').slice(0,2).join(':');
    const key=candidate&&keys.includes(candidate)?candidate:keys.includes(`${surah}:${ayah}`)?`${surah}:${ayah}`:keys[0];
    const [s,a]=key.split(':').map(Number);
    return {page,surah:s,ayah:a,scroll:viewport.scrollTop,anchor};
}
