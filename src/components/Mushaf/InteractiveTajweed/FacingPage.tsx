import {BookRibbon} from './BookRibbon';
import {useReadingBookmarkStore} from '../../../stores/readingBookmarkStore';
import {useEffect,useMemo,useState} from 'react';
import {CHAPTERS,composePage,lineY,type InteractivePage,type MushafWord} from '../../../lib/interactiveMushaf/model';
import {loadInteractivePage,loadPageFont,pageFontSamples,UNICODE_PAGE_FONT,type PageFont,type PaperTheme} from '../../../lib/interactiveMushaf/service';
import {fontPaletteName,unicodeWord} from '../../../lib/interactiveMushaf/fontResources';
import {MessageSquare} from 'lucide-react';
import {useReaderNotesStore,type ReaderNote} from '../../../stores/readerNotesStore';
import {PageOrnaments} from './PageOrnaments';
import {fallbackRuleColor} from './glyphStyle';
import {useVersePress,type VerseSelection} from '../hooks/useVersePress';
export function FacingPage({page,paper,scale,onWord,onVerse,onNote,decorative=false}:{page:number;paper:PaperTheme;scale:number;onWord?:(word:MushafWord)=>void;onVerse?:(selection:VerseSelection,word:MushafWord)=>void;decorative?:boolean;onNote?:(note:ReaderNote)=>void}){
    const [bundle,setBundle]=useState<{data:InteractivePage;font:PageFont;opening:InteractivePage|null;openingFont:PageFont;settled:boolean}|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
    const bookmark=useReadingBookmarkStore(s=>s.bookmark);
    const notes=useReaderNotesStore(s=>s.notes);
    const hold=useVersePress(()=>{},page);
    useEffect(()=>{let cancelled=false;setBundle(null);setError(false);
        void (async()=>{const data=await loadInteractivePage(page);const opening=data.layout.some(l=>l.type==='basmala')?await loadInteractivePage(1):null;
            if(cancelled)return;setBundle({data,font:UNICODE_PAGE_FONT,opening,openingFont:UNICODE_PAGE_FONT,settled:false});
            const [font,openingFont]=await Promise.all([loadPageFont(page,paper,pageFontSamples(data.words)).catch(()=>UNICODE_PAGE_FONT),opening?loadPageFont(1,paper,pageFontSamples(opening.words)).catch(()=>UNICODE_PAGE_FONT):Promise.resolve(UNICODE_PAGE_FONT)]);
            if(!cancelled)setBundle({data,font,opening,openingFont,settled:true});
        })().catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};
    },[page,paper,retry]);
    const positions=useMemo(()=>{if(!bundle)return [];const ctx=document.createElement('canvas').getContext('2d');if(!ctx)return [];ctx.direction='rtl';return composePage(bundle.data,(glyph,size)=>{ctx.font=`${size}px ${bundle.font.family}`;return ctx.measureText(glyph).width;},bundle.font.mode==='unicode'?unicodeWord:w=>w.glyph);},[bundle]);
    return <div className="iq-scaled-page iq-facing-page" data-page-ready={bundle?.data.page===page&&bundle.settled&&positions.length>0?'true':undefined} style={{width:600*scale,height:860*scale}} inert={decorative} aria-hidden={decorative||undefined}>
        {!bundle?<div className="iq-facing-loading" role={decorative?undefined:'status'}>{error?<><span>Page {page} indisponible.</span><button onClick={()=>setRetry(v=>v+1)}>Réessayer</button></>:`Préparation de la page ${page}…`}</div>:<article className={`iq-paper ${page<3?'iq-paper-opening':''}`} aria-label={`Mushaf Tajwid interactif, page ${page}`} style={{transform:`scale(${scale})`}}>
            {!decorative&&bookmark?.page===page&&bookmark.view==='tajweed-interactive'&&<BookRibbon marked length={bookmark.ribbonLength} scale={scale} onSave={ribbonLength=>useReadingBookmarkStore.getState().save({...bookmark,ribbonLength})} onRemove={()=>useReadingBookmarkStore.getState().remove()}/>}
            <PageOrnaments opening={page<3}/><div className="iq-paper-meta"><span>الجزء {(bundle.data.verses[0]?.juz||1).toLocaleString('ar-EG')}</span><span>{CHAPTERS[(bundle.data.verses[0]?.surah||1)-1].name}</span></div>
            {bundle.data.layout.filter(l=>l.type==='surah').map(l=><h1 key={l.n} className={page<3?'iq-surah-title':'iq-surah-line'} style={page>=3?{top:lineY(page,l.n)}:undefined} dir="rtl" lang="ar">{CHAPTERS[(l.surah||1)-1].name}</h1>)}
            {bundle.data.layout.filter(l=>l.type==='basmala').map(l=><div key={l.n} className="iq-basmala" role="img" aria-label="Basmala" style={{top:lineY(page,l.n),fontFamily:bundle.openingFont.family,fontSize:page<3?43:32}}>{bundle.opening?.words.filter(w=>w.verseKey==='1:1'&&w.kind==='word').map(w=>bundle.openingFont.mode==='unicode'?w.text:w.glyph).join(bundle.openingFont.mode==='unicode'?' ':'')}</div>)}
            <div className="iq-words" dir="rtl" lang="ar">{positions.map(({word:w,x,y,width,fontSize})=>{const verse=bundle.data.verses.find(v=>`${v.surah}:${v.numberInSurah}`===w.verseKey)!;return <span key={w.key} {...hold(verse,selection=>onVerse?.(selection,w))} role="button" tabIndex={decorative?-1:0} className={`iq-word ${bundle.font.mode==='unicode'?'iq-word-unicode':''}`} data-line={w.line} data-word-key={w.key} aria-label={`${w.text} · ${w.verseKey} · ${w.kind==='end'?'Écouter depuis ce verset':`mot ${w.position}`}`} style={{left:x,top:y,width,fontSize,fontFamily:bundle.font.family,fontPalette:bundle.font.mode==='colrv1'?fontPaletteName(bundle.font.family,paper):undefined}}
                onClick={e=>{e.stopPropagation();onWord?.(w);}}
                onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onWord?.(w);}else if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();const r=e.currentTarget.getBoundingClientRect();onVerse?.({ayah:verse,x:r.left,y:r.top},w);}}}>
                <span aria-hidden="true">{bundle.font.mode==='unicode'?(w.kind==='end'?unicodeWord(w):w.tajweedSegments.map((s,i)=><span key={i} style={{color:fallbackRuleColor(s.rule,paper)}}>{s.text}</span>)):w.glyph}</span>
            </span>;})}</div><span className="iq-page-number">{page.toLocaleString('ar-EG')}</span><span className="iq-paper-edition">مصحف التجويد · حفص عن عاصم</span>
        </article>}
        {!decorative&&bundle&&<div className="iq-margin-notes">{Object.values(notes).filter(n=>n.page===page).map(n=>{const word=bundle.data.words.find(w=>w.verseKey===`${n.surah}:${n.ayah}`);return word?<button key={`${n.surah}:${n.ayah}`} aria-label={`Annotation du verset ${n.surah}:${n.ayah}`} style={{top:lineY(page,word.line)*scale}} onClick={e=>{e.stopPropagation();onNote?.(n);}}><MessageSquare size={15}/></button>:null;})}</div>}
    </div>;
}
