import { useEffect, useRef, useState, type RefObject } from 'react';
import { useQuranStore } from '../../../stores/quranStore';
import type { Ayah } from '../../../types';

/** Consume explicit navigation only once its exact verse is rendered. */
export function useVerseEntry(viewport: RefObject<HTMLDivElement | null>, verses: Ayah[], ready: boolean, visible: boolean, position = 0) {
    const { jumpSignal, currentSurah, currentAyah, currentPage } = useQuranStore();
    const [entry, setEntry] = useState<{ key: string; page: number } | null>(null);
    const consumed = useRef<number | null>(null);
    useEffect(() => {
        if (!visible || !ready || consumed.current === jumpSignal) return;
        let pending: { surah: number; ayah: number } | null = null;
        try { pending = JSON.parse(sessionStorage.getItem('scrollToAyah') || 'null'); } catch { return; }
        if (!pending || pending.surah !== currentSurah || pending.ayah !== currentAyah) return;
        const verse = verses.find(v => v.surah === pending.surah && v.numberInSurah === pending.ayah && v.page === currentPage);
        if (!verse) return;
        const key = `${verse.surah}:${verse.numberInSurah}`;
        const frame = requestAnimationFrame(() => {
            const root = viewport.current;
            const word = (position>0 ? root?.querySelector<HTMLElement>(`[data-word-key="${key}:${position}"]`) : null) || root?.querySelector<HTMLElement>(`[data-verse-key="${key}"]`);
            if (!root || !word) return;
            consumed.current = jumpSignal;
            sessionStorage.removeItem('scrollToAyah');
            setEntry({ key, page: currentPage });
            const bounds = root.getBoundingClientRect(), target = word.getBoundingClientRect();
            root.scrollBy({ top: (target.top + target.bottom - bounds.top - bounds.bottom) / 2, behavior: 'smooth' });
        });
        return () => cancelAnimationFrame(frame);
    }, [visible, ready, jumpSignal, currentSurah, currentAyah, currentPage, verses, viewport, position]);
    return entry?.page === currentPage && entry.key === `${currentSurah}:${currentAyah}` ? entry.key : null;
}
