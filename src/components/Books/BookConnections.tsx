import {useEffect,useState} from 'react';
import {BookOpen,Headphones,ArrowUpRight} from 'lucide-react';
import {connectionsForChapter,type BookConnection} from '../../data/bookConnections';
import type {NarrativeBook} from '../../lib/narrativeBooks';
import type {LibraryAudio} from '../../lib/audioProduction';
import {books,recordingsForBook,chapterForAudio} from '../../lib/bookLibrary';
import {bookPassages,bookAudioMarks,audioAtPassage} from '../../lib/bookPassages';
import {BookCoverArt} from './BookCoverArt';
export interface ResolvedBookConnection extends BookConnection {audio?:{item:LibraryAudio;seconds:number;queue:LibraryAudio[]}}
export function BookConnections({bookId,chapterId,items,onOpen}:{bookId:string;chapterId:string;items:LibraryAudio[];onOpen:(target:ResolvedBookConnection,view:'read'|'listen')=>void}){
 const [manuscripts,setManuscripts]=useState<NarrativeBook[]>([]);
 const events=connectionsForChapter(bookId,chapterId);
 useEffect(()=>{let live=true;if(events.length)void import('../../data/narrativeBooks').then(m=>{if(live)setManuscripts(m.narrativeBooks);}).catch(()=>{});return()=>{live=false;};},[bookId,chapterId]);
 if(!events.length||!manuscripts.length)return null;
 return <section className="book-connections" aria-label="Pendant ce temps, dans les autres biographies"><span className="book-eyebrow">DES VIES QUI SE CROISENT</span><h3>Pendant ce temps…</h3><p>Explorez un autre regard, puis retrouvez votre passage ici.</p>{events.map(event=><div key={event.id}><h4>{event.title}</h4><p>{event.context}</p><div className="book-connections-strip">{event.passages.map(target=>{
  const summary=books.find(b=>b.id===target.bookId),book=manuscripts.find(b=>b.id===target.bookId),index=book?.chapters.findIndex(c=>c.id===target.chapterId)??-1,chapter=book?.chapters[index];
  if(!book||!chapter||!summary)return null;
  const passage=bookPassages(book,chapter).find(p=>p.id===target.passageId);if(!passage)return null;
  const queue=recordingsForBook(items,summary),mark=audioAtPassage(passage,bookAudioMarks(book,chapter,queue.filter(r=>chapterForAudio(r)===index)));
  const resolved:ResolvedBookConnection={...target,...(mark?{audio:{item:mark.item,seconds:mark.seconds,queue}}:{})};
  return <article key={target.bookId} data-connected-book={target.bookId}><div className="book-connection-cover"><BookCoverArt bookId={target.bookId}/></div><div className="book-connection-copy"><strong>{summary.title}</strong><p>{target.perspective}</p><div><button onClick={()=>onOpen(resolved,'read')} aria-label={`Lire ce passage dans ${summary.title}`}><BookOpen size={15}/>Lire<ArrowUpRight size={13}/></button><button disabled={!mark} onClick={()=>onOpen(resolved,'listen')} aria-label={`Écouter ce passage dans ${summary.title}`}><Headphones size={15}/>{mark?'Écouter':'Audio indisponible'}</button></div></div></article>;
 })}</div></div>)}</section>;
}
