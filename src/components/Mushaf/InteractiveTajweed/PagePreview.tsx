import {useEffect,useRef,useState,type ReactNode} from 'react';
import {FacingPage} from './FacingPage';
import {CHAPTERS,PAGE_MANIFEST} from '../../../lib/interactiveMushaf/model';
import type {PaperTheme} from '../../../lib/interactiveMushaf/service';
export function PageBrowseButton({page,onClick,onBrowse,label,children}:{page:number;onClick:()=>void;onBrowse:()=>void;label?:string;children?:ReactNode}){
    const timer=useRef<ReturnType<typeof setTimeout>|null>(null),held=useRef(false);
    const cancel=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;};
    useEffect(()=>cancel,[]);
    return <button className="iq-page-jump" aria-label={label??`Aller à une page, page actuelle ${page} sur 604`} title="Appui long : feuilleter avec aperçu" onContextMenu={e=>{e.preventDefault();cancel();held.current=true;onBrowse();}} onPointerDown={e=>{if(e.button!==0)return;cancel();held.current=false;timer.current=setTimeout(()=>{held.current=true;onBrowse();},450);}} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={()=>{cancel();held.current=true;}} onClick={()=>{if(held.current){held.current=false;return;}onClick();}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();onBrowse();}}}>{children??<>{page}<small>/604</small></>}</button>;
}
export function PagePreview({page,paper,onCommit}:{page:number;paper:PaperTheme;onCommit:(page:number)=>void}){
    const [target,setTarget]=useState(page),[preview,setPreview]=useState(page);
    useEffect(()=>{const timer=setTimeout(()=>setPreview(target),220);return()=>clearTimeout(timer);},[target]);
    const chapter=CHAPTERS[Number(PAGE_MANIFEST[target]?.verseKeys[0]?.split(':')[0])-1];
    const pages=[preview-1,preview,preview+1].filter(p=>p>=1&&p<=604);
    const commit=()=>onCommit(target);
    return <div className="iq-page-preview">
        <p>Feuilletez, puis relâchez le curseur pour ouvrir la page.</p>
        <div className={`iq-preview-strip iq-paper-${paper}`} aria-hidden="true">{pages.map(p=><div key={p} className={p===preview?'is-current':''}><FacingPage page={p} paper={paper} scale={.16} decorative/><small>{p}</small></div>)}</div>
        <output aria-live="polite">Page {target} · {chapter?.latin}</output>
        <input type="range" min="1" max="604" value={target} aria-label="Aperçu des pages" onChange={e=>setTarget(Number(e.target.value))} onPointerUp={commit} onPointerCancel={()=>setTarget(page)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit();}}}/>
        <div className="iq-preview-actions"><button disabled={target<=1} onClick={()=>setTarget(n=>Math.max(1,n-1))}>Précédente</button><button disabled={target>=604} onClick={()=>setTarget(n=>Math.min(604,n+1))}>Suivante</button></div>
        <button className="iq-primary" onClick={commit}>Ouvrir la page {target}</button>
    </div>;
}
