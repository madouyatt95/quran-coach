import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ArrowUpRight, Loader2 } from 'lucide-react';
import { fetchSurah, searchQuran } from '../../lib/quranApi';
import { SURAH_NAMES_FR, SURAH_START_PAGES } from './mushafConstants';
import type { Ayah, Surah } from '../../types';
import { formatDivineNames } from '../../lib/divineNames';
import './MushafSearchOverlay.css';

interface Props {
    surahs: Surah[];
    currentPage: number;
    goToSurah: (surah: number, options?: { silent?: boolean }) => void;
    goToPage: (page: number, options?: { silent?: boolean }) => void;
    goToAyah: (surah: number, ayah: number, page?: number, options?: { silent?: boolean }) => void;
    onClose: () => void;
}

export const normalizeMushafSearch = (value: string) => value.normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا')
    .toLowerCase().replace(/([a-z])\1+/g, '$1').replace(/[\s'’\-]/g, '');

export function MushafSearchOverlay({surahs,currentPage,goToSurah,goToPage,goToAyah,onClose}: Props) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [query,setQuery] = useState('');
    const [results,setResults] = useState<Ayah[]>([]);
    const [searching,setSearching] = useState(false);
    const [error,setError] = useState('');
    const [opening,setOpening] = useState(false);
    const [retry,setRetry] = useState(0);
    const alive = useRef(true);
    const clean = query.trim();
    const arabic = /[\u0600-\u06ff]/.test(clean);
    const page = /^\d+$/.test(clean) ? Number(clean) : 0;
    const reference = clean.match(/^(\d+)\s*[:\s-]\s*(\d+)$/);
    const referenceSurah = reference ? surahs.find(s=>s.number===Number(reference[1])) : undefined;
    const validReference = !!referenceSurah && Number(reference?.[2]) >= 1 && Number(reference?.[2]) <= referenceSurah.numberOfAyahs;
    const textSearch = clean.length >= 3 && !page && !reference;
    const filtered = surahs.filter(s=>!clean || (page ? s.number === page : [s.name,s.englishName,s.englishNameTranslation,SURAH_NAMES_FR[s.number],String(s.number)].some(name=>name && normalizeMushafSearch(name).includes(normalizeMushafSearch(clean)))));
    const currentSurah = SURAH_START_PAGES.reduce((found,p,i)=>p<=currentPage?i+1:found,1);

    useEffect(()=>{
        alive.current = true;
        const element = dialog.current!;
        element.showModal();
        const fit = () => {
            element.style.height = `${window.visualViewport?.height ?? window.innerHeight}px`;
            element.style.top = `${window.visualViewport?.offsetTop ?? 0}px`;
        };
        fit();window.visualViewport?.addEventListener('resize',fit);window.visualViewport?.addEventListener('scroll',fit);
        return ()=>{alive.current=false;window.visualViewport?.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('scroll',fit);element.close();};
    },[]);

    useEffect(()=>{
        let cancelled=false;
        setResults([]);setError('');setSearching(textSearch);
        if (!textSearch) return;
        const timer=setTimeout(async()=>{
            try {
                const matches=await searchQuran(clean,arabic?'ar.quran-uthmani':'fr.hamidullah');
                if (!cancelled) setResults(matches.slice(0,20));
            } catch {if(!cancelled)setError('La recherche de versets est indisponible. Les sourates restent accessibles.');}
            finally {if(!cancelled)setSearching(false);}
        },350);
        return ()=>{cancelled=true;clearTimeout(timer);};
    },[clean,arabic,textSearch,retry]);

    const openPage=(target:number)=>{
        sessionStorage.removeItem('scrollToAyah');sessionStorage.setItem('isSilentJump','true');sessionStorage.setItem('scrollToPage',String(target));
        goToPage(target,{silent:true});onClose();
    };
    const openVerse=async(surah:number,ayah:number)=>{
        if(opening)return;
        setOpening(true);setError('');
        try {
            const data=await fetchSurah(surah);
            const verse=data.ayahs.find(a=>a.numberInSurah===ayah);
            if(!verse)throw new Error('Verse unavailable');
            if(!alive.current)return;
            sessionStorage.removeItem('scrollToPage');sessionStorage.setItem('isSilentJump','true');sessionStorage.setItem('scrollToAyah',JSON.stringify({surah,ayah}));
            goToAyah(surah,ayah,verse.page,{silent:true});onClose();
        } catch {if(alive.current)setError('Impossible d’ouvrir ce verset. Vérifiez votre connexion et réessayez.');}
        finally {if(alive.current)setOpening(false);}
    };

    return createPortal(<dialog ref={dialog} className="reader-search" aria-labelledby="reader-search-title" onCancel={e=>{e.preventDefault();onClose();}}>
        <header className="reader-search__header">
            <div><h2 id="reader-search-title">Ouvrir un passage</h2><p>Sourate, page ou verset</p></div>
            <button autoFocus className="reader-search__close" aria-label="Fermer la recherche" onClick={onClose}><X size={21}/></button>
        </header>
        <div className="reader-search__field"><Search size={19} aria-hidden="true"/>
            <input aria-label="Rechercher une sourate, une page ou un verset" placeholder="Al-Kahf, 293, 18:10…" value={query} onChange={e=>setQuery(e.target.value)} type="search" autoComplete="off"/>
        </div>
        <p className="reader-search__hint">Nom ou texte en arabe / français · Référence : 18:10</p>
        <div className="reader-search__results" aria-busy={searching || opening}>
            {page>=1 && page<=604 && <button className="reader-search__row reader-search__direct" onClick={()=>openPage(page)}><span>Ouvrir la page {page}</span><ArrowUpRight size={19}/></button>}
            {validReference && <button disabled={opening} className="reader-search__row reader-search__direct" onClick={()=>void openVerse(Number(reference![1]),Number(reference![2]))}><span>{referenceSurah?.englishName} · verset {reference![2]}</span>{opening?<Loader2 size={19}/>:<ArrowUpRight size={19}/>}</button>}
            {!!reference && !validReference && <p className="reader-search__empty">Référence invalide. Exemple : 18:10.</p>}
            {!!page && page>604 && <p className="reader-search__empty">Choisissez une page entre 1 et 604.</p>}
            {filtered.length>0 && <><h3>{clean?'Sourates trouvées':`${surahs.length} sourates`}</h3>{filtered.map(s=><button key={s.number} className={`reader-search__row ${s.number===currentSurah?'is-current':''}`} onClick={()=>{
                sessionStorage.removeItem('scrollToAyah');sessionStorage.setItem('isSilentJump','true');sessionStorage.setItem('scrollToPage','0');goToSurah(s.number,{silent:true});onClose();
            }}><span className="reader-search__number">{s.number}</span><span className="reader-search__info"><strong>{s.englishName}</strong><small>{SURAH_NAMES_FR[s.number]} · {s.numberOfAyahs} versets</small></span><span className="reader-search__arabic" lang="ar" dir="rtl">{s.name}</span></button>)}</>}
            {textSearch && <><h3>Dans les versets</h3>{searching?<p className="reader-search__empty" role="status">Recherche en cours…</p>:results.map(v=><button key={v.number} disabled={opening} className="reader-search__verse" onClick={()=>void openVerse(v.surah,v.numberInSurah)}><strong>{surahs.find(s=>s.number===v.surah)?.englishName} · {v.surah}:{v.numberInSurah}</strong><span lang={arabic?'ar':'fr'} dir={arabic?'rtl':'ltr'}>{formatDivineNames(v.text)}</span></button>)}{!searching && !error && !results.length && <p className="reader-search__empty">Aucun verset trouvé. Essayez un autre mot.</p>}{results.length===20 && <p className="reader-search__hint">20 premiers résultats · Précisez votre recherche pour affiner.</p>}</>}
            {!textSearch && !filtered.length && !reference && !page && <p className="reader-search__empty">Aucune sourate trouvée. Saisissez au moins trois caractères pour rechercher dans les versets.</p>}
            {error && <div role="alert" className="reader-search__error">{error}{textSearch && <button onClick={()=>setRetry(v=>v+1)}>Réessayer</button>}</div>}
        </div>
    </dialog>,document.body);
}
