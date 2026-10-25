import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {useNavigate} from 'react-router-dom';
import {Bookmark,X} from 'lucide-react';
import {useBookNotebook} from '../../stores/bookNotebookStore';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {bookHref,type BookSummary} from '../../lib/bookLibrary';
export default function BookBookmarks({book,onClose}:{book:BookSummary;onClose:()=>void}){
 const store=useBookNotebook(),dialog=useRef<HTMLDialogElement>(null),navigate=useNavigate();
 const entries=store.bookmarks.filter(e=>e.bookId===book.id);
 useEffect(()=>{const focus=document.activeElement as HTMLElement|null,el=dialog.current!;el.showModal();return()=>{el.close();focus?.focus({preventScroll:true});};},[]);
 return createPortal(<dialog ref={dialog} className="book-reference book-bookmarks" aria-label={`Marque-pages de ${book.title}`} onCancel={e=>{e.preventDefault();onClose();}}><header><div><span className="book-eyebrow">MES MARQUE-PAGES</span><h2>{book.title}</h2></div><button autoFocus aria-label="Fermer les marque-pages" onClick={onClose}><X size={20}/></button></header><p>Vos passages choisis restent ici, même lorsque votre lecture avance.</p>{!entries.length&&<p>Dans le texte, choisissez un paragraphe puis « Marquer ce passage ».</p>}{entries.map(e=>{
 const valid=e.version===book.version&&book.chapters.some(c=>c.id===e.chapterId);
 return <section key={e.id}><small>{book.chapters.find(c=>c.id===e.chapterId)?.title||'Passage conservé'}</small><blockquote>{e.text}</blockquote><label>Ma note<textarea aria-label={`Note du marque-page ${e.passageId}`} value={e.note} maxLength={2000} placeholder="À relire, à partager avec mes enfants…" onChange={event=>store.annotateBookmark(e.id,event.target.value)}/></label>{!valid&&<p>Ce passage appartient à une ancienne édition. Votre extrait et votre note sont conservés.</p>}<div className="book-guide-actions"><button disabled={!valid} onClick={()=>{useLibraryPlayer.getState().pause();onClose();navigate(`${bookHref(book.id,e.chapterId)}&passage=${encodeURIComponent(e.passageId)}`,{state:{bookView:'read',bookBookmark:e.id}});}}><Bookmark size={16}/>Retrouver ce passage</button><button onClick={()=>store.removeBookmark(e.id)}>Retirer ce marque-page</button></div></section>;})}<footer><button onClick={onClose}>Revenir au livre</button></footer></dialog>,document.body);
}
