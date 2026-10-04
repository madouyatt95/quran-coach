import { cloneElement, useEffect, useMemo, useRef, type ReactElement } from 'react';
import { useLiveFollowStore } from '../../stores/liveFollowStore';
import { corpusWordOffset } from '../../lib/tilawa/feedback';
import { normalizeRecitationWord } from '../../lib/recitationMatching';

/** Align the displayed tokenization with the acoustic corpus, including basmala/waqf signs. */
export function liveWordIndex(display: string[], corpus: string[], surah: number, ayah: number, word: number): number | null {
    if (!Number.isInteger(word) || word < 0 || word >= corpus.length) return null;
    const indices = display.flatMap((text, index) => normalizeRecitationWord(text) ? [index] : []);
    const offset = corpusWordOffset(indices.map(index => display[index]), corpus, surah, ayah);
    return offset === null ? null : indices[word + offset] ?? null;
}

export function LiveFollowWords({ surah, ayah, words, children }: {
    surah: number; ayah: number; words: string[];
    children: ReactElement<{className?: string; 'data-live-word'?: boolean}>[];
}) {
    // Only the current/previous verse rerenders on acoustic updates, not the entire Mushaf.
    const position = useLiveFollowStore(s => s.position?.surah === surah && s.position.ayah === ayah ? s.position : null);
    const root = useRef<HTMLSpanElement>(null);
    const index = useMemo(() => position
        ? liveWordIndex(words, position.words, surah, ayah, position.wordIndex) : null,
    [position, words, surah, ayah]);
    useEffect(() => {
        if (index === null) return;
        const word = root.current?.querySelector<HTMLElement>('[data-live-word="true"]');
        const container = root.current?.closest('.mih-mushaf');
        if (!word || !container) return;
        const bounds = container.getBoundingClientRect(), rect = word.getBoundingClientRect();
        if (rect.top < bounds.top + 40 || rect.bottom > Math.min(bounds.bottom, window.innerHeight - 170))
            word.scrollIntoView({behavior:'auto', block:'center'});
    }, [index]);
    return <span ref={root}>{children.map((child, i) => i === index ? cloneElement(child, {
        className: `${child.props.className || ''} mih-word--live`, 'data-live-word': true,
    }) : child)}</span>;
}
