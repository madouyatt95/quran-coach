import { useRef, useState, type RefObject } from 'react';
import { verseAtReadingLine } from './useVisibleReadingPosition';

export interface ReadingReturn {surah:number;ayah:number;page:number;offset?:number;khatm:boolean}
/** A temporary excursion origin, independent of persisted bookmarks and Khatm progress. */
export function useReadingReturn(container:RefObject<HTMLDivElement|null>, fallback:ReadingReturn) {
    const [origin,setOrigin] = useState<ReadingReturn|null>(null);
    const candidate = useRef<ReadingReturn|null>(null);
    const restore = useRef<ReadingReturn|null>(null);
    const capture = () => {
        if (origin) return;
        const element = container.current;
        const bounds = element?.getBoundingClientRect();
        const verse = element && bounds ? verseAtReadingLine(element.querySelectorAll<HTMLElement>('.mih-ayah'),bounds.top,bounds.height) : null;
        candidate.current = verse && bounds ? {surah:Number(verse.dataset.surah),ayah:Number(verse.dataset.ayah),page:Number(verse.dataset.page),offset:verse.getBoundingClientRect().top-bounds.top,khatm:fallback.khatm} : fallback;
    };
    const leave = () => {restore.current=null;setOrigin(current=>current??candidate.current??fallback);};
    const consume = () => {restore.current=origin;setOrigin(null);candidate.current=null;return origin;};
    const dismiss = () => {setOrigin(null);candidate.current=null;restore.current=null;};
    return {origin,restore,capture,leave,consume,dismiss};
}
