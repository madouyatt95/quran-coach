import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { JUZ_DATA, getJuzForPage } from '../../data/juzData';
import { useQuranStore } from '../../stores/quranStore';
import { SURAH_NAMES_FR } from './mushafConstants';
import './MushafGestureNavigator.css';

export function MushafGestureNavigator() {
    const reducedMotion = useReducedMotion();
    const page = useQuranStore(s=>s.currentPage);
    const [draft,setDraft] = useState<number|null>(null);
    const [expanded,setExpanded] = useState(false);
    const pending = useRef<number|null>(null);
    const rail = useRef<HTMLElement>(null);
    const selectedPage = draft ?? page;
    const juz = getJuzForPage(selectedPage) || JUZ_DATA[0];
    const currentJuz = getJuzForPage(page) || JUZ_DATA[0];
    const commit = () => {
        const target = pending.current;
        pending.current = null;
        if (target !== null) {
            window.scrollTo({top:0,behavior:'auto'});
            sessionStorage.removeItem('scrollToAyah');
            sessionStorage.setItem('scrollToPage',String(target));
            sessionStorage.setItem('isSilentJump','true');
            useQuranStore.getState().goToPage(target,{silent:true});
        }
        setDraft(null);
    };
    const cancel = () => {pending.current = null;setDraft(null);};
    useEffect(() => {
        if (!expanded) return;
        const outside = (e:PointerEvent) => {if(!rail.current?.contains(e.target as Node)) {cancel();setExpanded(false);}};
        const escape = (e:KeyboardEvent) => {if(e.key === 'Escape') {cancel();setExpanded(false);}};
        document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
        return () => {document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
    }, [expanded]);
    return <nav ref={rail} className={`mushaf-gesture-nav ${expanded ? 'is-expanded' : ''}`} aria-label="Navigation du Mushaf par gestes" onKeyDown={e=>{if(e.key.startsWith('Arrow') || e.key==='Home' || e.key==='End') e.stopPropagation();}}>
        <div className="mushaf-juz-rail">
            {expanded && <div className="mushaf-juz-preview" aria-hidden="true" style={{top:`calc(36px + (100% - 100px) * ${(juz.number-1)/29})`}}><small>JUZ</small><strong>{juz.number}</strong></div>}
            <span className="mushaf-juz-rail__label">Juz</span><span aria-hidden="true">1</span>
            <input type="range" min="1" max="30" step="1" value={juz.number} aria-label="Parcourir les juz verticalement"
                aria-orientation="vertical" aria-valuetext={`Juz ${juz.number} · ${SURAH_NAMES_FR[juz.startSurah]} · page ${juz.startPage}`}
                onFocus={()=>setExpanded(true)} onPointerDown={()=>setExpanded(true)}
                onChange={e=>{const target=JUZ_DATA[Number(e.target.value)-1].startPage;pending.current=target;setDraft(target);setExpanded(true);}}
                onPointerUp={commit} onPointerCancel={cancel} onKeyUp={e=>{if(e.key!=='Escape')commit();}} onBlur={commit}/>
            <span aria-hidden="true">30</span><strong>{juz.number}</strong>
        </div>
        <AnimatePresence>
        {expanded && <motion.div className="mushaf-page-strip"
            initial={{opacity:0,y:reducedMotion?0:18,scale:reducedMotion?1:.98}}
            animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reducedMotion?0:8}}
            transition={{duration:reducedMotion?0:.24,ease:[.22,1,.36,1]}}>
            <header><div><strong>Juz {juz.number} · page {selectedPage}</strong><span>{SURAH_NAMES_FR[juz.startSurah]} {juz.startSurah}:{juz.startAyah} — {SURAH_NAMES_FR[juz.endSurah]}</span></div>
                <button aria-label="Fermer la navigation rapide" onClick={()=>{cancel();setExpanded(false);}}><X size={18}/></button></header>
            <div className="mushaf-page-ticks" aria-hidden="true">{Array.from({length:juz.endPage-juz.startPage+1},(_,i)=><i key={i} className={selectedPage===juz.startPage+i?'active':''}></i>)}</div>
            <input type="range" min={juz.startPage} max={juz.endPage} step="1" value={selectedPage} aria-label="Parcourir les pages du juz horizontalement"
                aria-valuetext={`Page ${selectedPage} du juz ${juz.number}`} dir="rtl"
                onChange={e=>{const target=Number(e.target.value);pending.current=target;setDraft(target);}}
                onPointerUp={commit} onPointerCancel={cancel} onKeyUp={e=>{if(e.key!=='Escape')commit();}} onBlur={commit}/>
            <footer><span>{juz.endPage}</span><span>Glissez, puis relâchez pour ouvrir</span><span>{juz.startPage}</span></footer>
            {draft !== null && currentJuz.number !== juz.number && <span className="mushaf-page-strip__preview" role="status">Juz {juz.number} · début page {juz.startPage}</span>}
        </motion.div>}
        </AnimatePresence>
    </nav>;
}
