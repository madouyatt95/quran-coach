import {useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {FacingPage} from './FacingPage';
import {CHAPTERS,PAGE_MANIFEST} from '../../../lib/interactiveMushaf/model';
import {getJuzForPage} from '../../../data/juzData';
import {useReadingBookmarkStore} from '../../../stores/readingBookmarkStore';
import {useReadingSession} from './readingSession';
import type {PaperTheme} from '../../../lib/interactiveMushaf/service';
export function PageBrowseButton({page,onClick,onBrowse,label,children}:{page:number;onClick:()=>void;onBrowse:()=>void;label?:string;children?:ReactNode}){
    const timer=useRef<ReturnType<typeof setTimeout>|null>(null),held=useRef(false);
    const cancel=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;};
    useEffect(()=>cancel,[]);
    return <button className="iq-page-jump" aria-label={label??`Aller à une page, page actuelle ${page} sur 604`} title="Appui long : feuilleter avec aperçu" onContextMenu={e=>{e.preventDefault();cancel();held.current=true;onBrowse();}} onPointerDown={e=>{if(e.button!==0)return;cancel();held.current=false;timer.current=setTimeout(()=>{held.current=true;onBrowse();},450);}} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={()=>{cancel();held.current=true;}} onClick={()=>{if(held.current){held.current=false;return;}onClick();}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();onBrowse();}}}>{children??<>{page}<small>/604</small></>}</button>;
}
export function PagePreview({page,paper,onCommit}:{page:number;paper:PaperTheme;onCommit:(page:number)=>void}){
    const [target,setTarget]=useState(page),[preview,setPreview]=useState(page),[drag,setDrag]=useState(0);
    const stage=useRef<HTMLDivElement>(null),gesture=useRef<{id:number;x:number;y:number;dragging:boolean}|null>(null),swiped=useRef(false);
    const [size,setSize]=useState({width:340,height:430});
    const bookmarks=useReadingBookmarkStore(s=>s.bookmarks),bookmark=useReadingBookmarkStore(s=>s.bookmark);
    const session=useReadingSession(s=>s.session);
    useEffect(()=>{const timer=setTimeout(()=>setPreview(target),120);return()=>clearTimeout(timer);},[target]);
    useEffect(()=>{const el=stage.current;if(!el||typeof ResizeObserver==='undefined')return;const measure=()=>setSize({width:el.clientWidth,height:el.clientHeight});const observer=new ResizeObserver(measure);observer.observe(el);measure();return()=>observer.disconnect();},[]);
    const scale=Math.min(size.width*.84/600,size.height/860),step=600*scale+4;
    const keys=PAGE_MANIFEST[target].verseKeys,first=keys[0],last=keys.at(-1)!;
    const chapter=CHAPTERS[Number(first.split(':')[0])-1],lastChapter=CHAPTERS[Number(last.split(':')[0])-1];
    const pages=[preview-1,preview,preview+1].filter(p=>p>=1&&p<=604);
    const choose=(p:number)=>{const next=Math.max(1,Math.min(604,p));setTarget(next);setPreview(next);};
    const marks=[...new Map([...(bookmark?[bookmark]:[]),...bookmarks].map(b=>[b.page,b])).values()].sort((a,b)=>a.page-b.page);
    return <div className="iq-page-preview">
        <div className="iq-preview-origin"><span>Vous lisez page {page}</span><button disabled={target===page} onClick={()=>choose(page)}>Revenir ici</button></div>
        <div ref={stage} className={`iq-preview-stage iq-paper-${paper} ${drag?'is-dragging':''}`} role="region" aria-label="Pages à feuilleter" tabIndex={0}
            onKeyDown={e=>{swiped.current=false;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();choose(target+(e.key==='ArrowLeft'?1:-1));}}}
            onPointerDown={e=>{if(e.button!==0||gesture.current)return;swiped.current=false;gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:false};}}
            onPointerMove={e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.dragging&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){gesture.current=null;return;}if(!g.dragging&&Math.abs(dx)>8){g.dragging=true;e.currentTarget.setPointerCapture?.(e.pointerId);}if(g.dragging){const blocked=target===604&&dx>0||target===1&&dx<0;setDrag(Math.max(-step,Math.min(step,dx))*(blocked ? .2 : 1));}}}
            onPointerUp={e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x;swiped.current=g.dragging;if(g.dragging&&Math.abs(dx)>Math.min(60,step*.18))choose(target+(dx>0?1:-1));gesture.current=null;setDrag(0);}}
            onPointerCancel={()=>{gesture.current=null;swiped.current=true;setDrag(0);}}
            onClickCapture={e=>{if(swiped.current){e.preventDefault();e.stopPropagation();swiped.current=false;}}}>
            {pages.map(p=><button key={p} type="button" className={`iq-preview-card ${p===preview?'is-current':''}`} aria-label={p===target?`Ouvrir la page ${p}`:`Prévisualiser la page ${p}`} aria-current={p===target?'page':undefined}
                style={{width:600*scale,height:860*scale,'--preview-x':`${(preview-p)*step+drag}px`,'--preview-scale':p===preview?1:.98} as CSSProperties}
                onClick={()=>p===target?onCommit(p):choose(p)}><FacingPage page={p} paper={paper} scale={scale} decorative/></button>)}
        </div>
        <output aria-live="polite"><strong>Page {target} · {chapter.latin}{lastChapter.id!==chapter.id?` → ${lastChapter.latin}`:''}</strong><span>Versets {first} – {last} · Juz {getJuzForPage(target)?.number}</span></output>
        <div className="iq-preview-marks" aria-label="Mes repères">
            {marks.map(b=><button key={b.page} aria-pressed={target===b.page} onClick={()=>choose(b.page)}>Signet · p. {b.page}{b.label&&b.label!=='Reprendre ma lecture'?` · ${b.label}`:''}</button>)}
            {session&&!session.finishedAt&&<button aria-pressed={target===session.end} onClick={()=>choose(session.end)}>Fin de séance · p. {session.end}</button>}
        </div>
        <input type="range" min="1" max="604" value={target} aria-label="Aperçu des pages" onChange={e=>setTarget(Number(e.target.value))}/>
        <div className="iq-preview-actions"><button disabled={target<=1} onClick={()=>choose(target-1)}>Précédente</button><button disabled={target>=604} onClick={()=>choose(target+1)}>Suivante</button></div>
        <button className="iq-primary" onClick={()=>onCommit(target)}>Ouvrir la page {target}</button>
    </div>;
}
