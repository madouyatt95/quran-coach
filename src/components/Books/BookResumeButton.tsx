import {lazy,Suspense,useState} from 'react';
import {Bookmark} from 'lucide-react';
import {useBookNotebook} from '../../stores/bookNotebookStore';
import {BookOpen,Headphones} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {bookResumePoint,bookResumeHref} from '../../lib/bookResume';
import {recordingsForBook,type BookSummary} from '../../lib/bookLibrary';
import type {LibraryAudio} from '../../lib/audioProduction';
const BookBookmarks=lazy(()=>import('./BookBookmarks'));
export function BookResumeButton({book,items,immersive=false}:{book:BookSummary;items:LibraryAudio[];immersive?:boolean}){
 const navigate=useNavigate(),[showBookmarks,setShowBookmarks]=useState(false);
 const bookmarkCount=useBookNotebook(s=>s.bookmarks.filter(e=>e.bookId===book.id).length);
 const positions=useAudioLibraryStore(s=>s.positions),bookReading=useAudioLibraryStore(s=>s.bookReading),bookReadingUpdatedAt=useAudioLibraryStore(s=>s.bookReadingUpdatedAt),bookReadingPoints=useAudioLibraryStore(s=>s.bookReadingPoints);
 const point=bookResumePoint(book,items,{positions,bookReading,bookReadingUpdatedAt,bookReadingPoints});
 if(!point&&!bookmarkCount)return null;
 const audio=point?.mode==='listen',chapter=book.chapters.findIndex(c=>c.id===point?.chapterId)+1;
 const label=audio?`${Math.floor((point?.seconds||0)/60)}:${String(Math.floor((point?.seconds||0)%60)).padStart(2,'0')}`:`Chap. ${chapter}`;
 return <>{bookmarkCount>0&&<button className="book-cover-ribbon" aria-label={`Mes ${bookmarkCount} marque-pages dans ${book.title}`} onClick={()=>{useLibraryPlayer.getState().pause();setShowBookmarks(true);}}><Bookmark size={18} fill="currentColor"/><span>{bookmarkCount}</span></button>}{showBookmarks&&<Suspense fallback={null}><BookBookmarks book={book} onClose={()=>setShowBookmarks(false)}/></Suspense>}{point&&<button type="button" className="book-cover-resume" aria-label={`Reprendre ${audio?'l’écoute':'la lecture'} de ${book.title}`} onClick={()=>{
  const player=useLibraryPlayer.getState(),queue=recordingsForBook(items,book),item=queue.find(i=>i.id===point.audioId);
  if(audio&&item)void player.play(item,{queue,startAt:point?.seconds||0});else player.pause();
  navigate(bookResumeHref(book,point),{state:{bookView:point.mode,bookImmersive:immersive,bookResume:point}});
 }}>{audio?<Headphones size={15}/>:<BookOpen size={15}/>}<span>Reprendre<small>{label}</small></span></button>}</>;
}
