import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { Ayah } from '../../types';
import { useVersePress } from '../Mushaf/hooks/useVersePress';
import { WordStudyCard } from '../Mushaf/InteractiveTajweed/WordStudyCard';
import { UNICODE_PAGE_FONT } from '../../lib/interactiveMushaf/service';
import { RULES } from '../../lib/interactiveMushaf/ruleLabels';
import { loadHifdhStudyWords, type HifdhStudyWord } from '../../lib/hifdhWordStudy';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import '../Mushaf/InteractiveTajweed/InteractiveTajweedPage.css';
import './HifdhWordStudy.css';

export function useHifdhWordStudy(scope: string, onOpen: () => void) {
    const navigate = useNavigate();
    const [target, setTarget] = useState<{ ayah: Ayah; index: number; displayed: string[]; scope: string } | null>(null);
    const [items, setItems] = useState<HifdhStudyWord[]>([]);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const opener = useRef<HTMLElement | null>(null);
    const stopOthers = () => {
        onOpen();
        const player = useAudioPlayerStore.getState();
        if (player.isPlaying) player.togglePlay();
        window.dispatchEvent(new Event('quran-stop-playback'));
    };
    const close = () => { setTarget(null); opener.current?.focus({ preventScroll: true }); };
    const open = (ayah: Ayah, index: number, displayed: string[]) => {
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        stopOthers(); setItems([]); setError(''); setTarget({ ayah, index, displayed, scope });
    };
    const press = useVersePress(() => {}, target?.ayah.number ?? 0);
    const targetAyah = target?.ayah, displayed = target?.displayed, targetScope = target?.scope;
    useEffect(() => {
        if (!targetAyah || !displayed || targetScope !== scope) return;
        let cancelled = false;
        void loadHifdhStudyWords(`${targetAyah.surah}:${targetAyah.numberInSurah}`, displayed).then(words => {
            if (!cancelled) setItems(words);
        }).catch(() => {
            if (!cancelled) setError('La fiche du mot n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.');
        });
        return () => { cancelled = true; };
    }, [targetAyah, displayed, targetScope, scope, retry]);
    useEffect(() => {
        if (!targetAyah || targetScope !== scope) return;
        const outside = (event: PointerEvent) => {
            if (event.target instanceof Element && !event.target.closest('.hifdh-word-study')) setTarget(null);
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setTarget(null); opener.current?.focus({ preventScroll: true }); }
        };
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
    }, [targetAyah, targetScope, scope]);
    const active = target?.scope === scope ? target : null;
    const item = active ? items[active.index] : undefined;
    const bind = (ayah: Ayah, index: number, displayed: string[], enabled = true): HTMLAttributes<HTMLElement> => {
        if (!enabled) return {};
        const show = () => open(ayah, index, displayed);
        const events = press(ayah, show);
        return { ...events, tabIndex: 0, role: 'button', 'aria-label': `${displayed[index]} · sens et prononciation`,
            title: 'Appui long : sens et prononciation',
            onDoubleClick: e => { e.preventDefault(); show(); },
            onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } else events.onKeyDown?.(e); },
        };
    };
    const card = active ? createPortal(<div className="hifdh-word-study">
        {item ? <WordStudyCard word={item.word} page={item.page} font={UNICODE_PAGE_FONT} paper="light" rules={RULES}
            previous={active.index > 0} next={active.index < items.length - 1}
            onAdjacent={delta => setTarget(current => current ? { ...current, index: Math.max(0, Math.min(items.length - 1, current.index + delta)) } : null)}
            onClose={close} onBeforePlay={stopOthers}
            onTranslation={() => { close(); navigate(`/passage?surah=${active.ayah.surah}&ayah=${active.ayah.numberInSurah}&from=hifdh`); }}/>
            : <aside className="iq-word-card" role="dialog" aria-label="Prononciation du mot"><button aria-label="Fermer la fiche du mot" onClick={close}>Fermer</button>
                <p role={error ? 'alert' : 'status'}>{error || 'Chargement du mot…'}</p>{error && <button onClick={() => { setError(''); setRetry(n => n + 1); }}>Réessayer</button>}</aside>}
    </div>, document.body) : null;
    return { bind, card };
}
