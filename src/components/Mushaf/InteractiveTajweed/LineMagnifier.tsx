import {useVersePress,type VerseSelection} from '../hooks/useVersePress';
import type {Ayah} from '../../../types';
import {useEffect,useRef} from 'react';
import {ChevronLeft,ChevronRight,X} from 'lucide-react';
import {composePage,type MushafWord} from '../../../lib/interactiveMushaf/model';
import {fontPaletteName,unicodeWord} from '../../../lib/interactiveMushaf/fontResources';
import type {PageFont,PaperTheme} from '../../../lib/interactiveMushaf/service';
import {fallbackRuleColor} from './glyphStyle';
type Position=ReturnType<typeof composePage>[number];
export function LineMagnifier({positions,line,font,paper,tracked,following,onFollowing,onLine,onWord,onHold,verseFor,onClose}:{positions:Position[];line:number;font:PageFont;paper:PaperTheme;tracked:string|null;following:boolean;onFollowing:(v:boolean)=>void;onLine:(n:number)=>void;onWord:(w:MushafWord)=>void;onHold:(word:MushafWord,selection:VerseSelection)=>void;verseFor:(word:MushafWord)=>Ayah;onClose:()=>void}){
    const press=useVersePress(()=>{},line);
    const root=useRef<HTMLDivElement>(null),rows=[...new Set(positions.map(p=>p.word.line))].sort((a,b)=>a-b);
    const words=positions.filter(p=>p.word.line===line),left=Math.min(...words.map(p=>p.x)),right=Math.max(...words.map(p=>p.x+p.width));
    const factor=1.05,height=Math.max(52,...words.map(w=>w.fontSize*1.5))*factor;
    useEffect(()=>{const el=root.current;if(!el)return;const word=tracked?el.querySelector<HTMLElement>(`[data-magnified-word="${tracked}"]`):null;if(word){const a=el.getBoundingClientRect(),b=word.getBoundingClientRect();el.scrollBy({left:(b.left+b.right-a.left-a.right)/2,behavior:'smooth'});}else el.scrollLeft=el.scrollWidth;},[line,tracked]);
    return <section className="iq-line-loupe" aria-label="Loupe de lecture"><header><strong>Ligne {line}</strong><label><input type="checkbox" checked={following} onChange={e=>onFollowing(e.target.checked)}/>Suivre l’écoute</label><button aria-label="Fermer la loupe" onClick={onClose}><X size={17}/></button></header>
        <p className="iq-loupe-help">Touchez une ligne du Mushaf pour l’agrandir. Ici, touchez un mot pour l’écouter.</p><div ref={root} className="iq-loupe-scroll"><div className="iq-loupe-text" lang="ar" dir="rtl" style={{width:Math.max(1,right-left)*factor+28,height}}>{words.map(p=><span key={p.word.key} {...press(verseFor(p.word),selection=>onHold(p.word,selection))} role="button" tabIndex={0} data-magnified-word={p.word.key} className={`iq-word ${tracked===p.word.key?'iq-word-tracked':''}`} aria-label={`${p.word.text} · ${p.word.verseKey}`} style={{left:(p.x-left)*factor+14,top:0,width:p.width*factor,fontSize:p.fontSize*factor,fontFamily:font.family,fontPalette:font.mode==='colrv1'?fontPaletteName(font.family,paper):undefined}} onClick={()=>onWord(p.word)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onWord(p.word);}else if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();const r=e.currentTarget.getBoundingClientRect();onHold(p.word,{ayah:verseFor(p.word),x:r.left,y:r.top});}}}><span aria-hidden="true">{font.mode==='unicode'?(p.word.kind==='end'?unicodeWord(p.word):p.word.tajweedSegments.map((s,i)=><span key={i} style={{color:fallbackRuleColor(s.rule,paper)}}>{s.text}</span>)):p.word.glyph}</span></span>)}</div></div>
        <footer><button aria-label="Ligne précédente" disabled={rows.indexOf(line)<=0} onClick={()=>{onFollowing(false);onLine(rows[rows.indexOf(line)-1]);}}><ChevronLeft size={17}/></button><span>Faites glisser la ligne pour la parcourir</span><button aria-label="Ligne suivante" disabled={rows.indexOf(line)>=rows.length-1} onClick={()=>{onFollowing(false);onLine(rows[rows.indexOf(line)+1]);}}><ChevronRight size={17}/></button></footer>
    </section>;
}
