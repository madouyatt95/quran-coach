import {Bookmark,MessageSquare,Layers} from 'lucide-react';
import {useReadingBookmarkStore,type ReadingBookmark} from '../../../stores/readingBookmarkStore';
import {useReaderNotesStore} from '../../../stores/readerNotesStore';
import './ReaderEdgeTabs.css';
export function ReaderEdgeTabs({page,onBookmark,onNotes,onPages}:{page:number;onBookmark:(bookmark:ReadingBookmark)=>void;onNotes:()=>void;onPages:()=>void}){
 const saved=useReadingBookmarkStore(s=>s.bookmarks),notes=useReaderNotesStore(s=>s.notes);
 const bookmarks=saved.filter(b=>b.view==='tajweed-interactive').slice(0,2);
 return <nav className="iq-edge-tabs" aria-label="Repères en marge" onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
 <button aria-label={`Feuilleter depuis la page ${page}`} onClick={onPages}><Layers size={14}/><small>{page}</small></button>{bookmarks.map(b=><button key={b.id||b.page} aria-label={`${b.label||'Signet'} · page ${b.page}`} aria-current={b.page===page?'page':undefined} onClick={()=>onBookmark(b)}><Bookmark size={14}/><small>{b.page}</small></button>)}{Object.keys(notes).length>0&&<button aria-label="Mes annotations du Mushaf" onClick={onNotes}><MessageSquare size={15}/></button>}
 </nav>;
}
