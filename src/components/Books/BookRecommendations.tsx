import {memo,useId,useRef,type MouseEvent} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {BookOpen,ChevronLeft,ChevronRight,Headphones} from 'lucide-react';
import {BookLandscape} from './BookLandscape';
import {bookHref,chapterForAudio,coverScene,isCompanionBook,recommendedBooks,recordingsForBook,resumeRecording,type BookSummary} from '../../lib/bookLibrary';
import type {LibraryAudio} from '../../lib/audioProduction';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';

export const BookRecommendations=memo(function BookRecommendations({book,items,mode,immersive}:{book:BookSummary;items:LibraryAudio[];mode:'read'|'listen';immersive:boolean}){
 const id=useId(),rail=useRef<HTMLDivElement>(null),navigate=useNavigate();
 const reading=useAudioLibraryStore(s=>s.bookReading);
 const suggestions=recommendedBooks(book.id,items,mode==='listen');
 const companions=isCompanionBook(book),prophets=!companions&&book.category==='prophet';
 const pauseForReading=(event:MouseEvent<HTMLAnchorElement>)=>{
  if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey)useLibraryPlayer.getState().pause();
 };
 const listen=(next:BookSummary)=>{
  const tracks=recordingsForBook(items,next),resume=resumeRecording(tracks,useAudioLibraryStore.getState().positions);
  if(!resume)return;
  void useLibraryPlayer.getState().play(resume,{queue:tracks});
  navigate(bookHref(next.id,next.chapters[chapterForAudio(resume,next)]?.id),{state:{bookView:'listen',bookImmersive:immersive}});
 };
 if(!suggestions.length)return null;
 return <section className="book-recommendations" aria-labelledby={id}>
  <header><div><span className="book-eyebrow">{companions?'COMPAGNONS ET COMPAGNES':prophets?'HISTOIRES DES PROPHÈTES':'HISTOIRES ET MORALITÉS'}</span><h2 id={id}>À découvrir ensuite</h2></div><Link to={companions?'/companions':prophets?'/prophets':'/stories'}>Tout voir →</Link></header>
  <div className="book-recommendations-navigation"><span>Choisissez votre prochain livre</span><div><button type="button" aria-label="Livres précédents dans les suggestions" onClick={()=>rail.current?.scrollBy({left:-rail.current.clientWidth*.8,behavior:'smooth'})}><ChevronLeft size={18}/></button><button type="button" aria-label="Livres suivants dans les suggestions" onClick={()=>rail.current?.scrollBy({left:rail.current.clientWidth*.8,behavior:'smooth'})}><ChevronRight size={18}/></button></div></div>
  <div className="book-recommendations-track" ref={rail}>{suggestions.map(next=>{
   const tracks=recordingsForBook(items,next),seconds=tracks.reduce((n,t)=>n+t.duration,0),destination=bookHref(next.id,reading[next.id]);
   const state={bookView:'read',bookImmersive:immersive};
   return <article className="book-recommendation" key={next.id}>
    <Link className="book-cover book-recommendation-cover" to={destination} state={state} onClick={pauseForReading} aria-label={`Lire ${next.title}`}><BookLandscape scene={coverScene(next.id)}/><span className="book-cover-content"><span className="book-eyebrow">{next.chapters.length} CHAPITRES{seconds>0&&` · ${Math.ceil(seconds/60)} MIN`}</span><h3>{next.title}</h3><p>{next.subtitle}</p></span></Link>
    <div className="book-recommendation-actions"><Link className={mode==='read'?'is-primary':undefined} to={destination} state={state} onClick={pauseForReading} aria-label={`Lire le livre ${next.title}`}><BookOpen size={16}/>Lire</Link><button type="button" className={mode==='listen'?'is-primary':undefined} disabled={!tracks.length} onClick={()=>listen(next)} aria-label={`Écouter le livre ${next.title}`}><Headphones size={16}/>Écouter</button></div>
   </article>;
  })}</div>
 </section>;
});
