import type {LibraryAudio} from './audioProduction';
import {bookForAudio,books,chapterForAudio,recordingsForBook,recommendedBooks,type BookSummary} from './bookLibrary';

/** An incomplete publication must never start an apparently complete book. */
export function completeBookQueue(items:LibraryAudio[],book:BookSummary){
 const tracks=recordingsForBook(items,book);
 const complete=book.chapters.every((_,index)=>{
  const parts=tracks.filter(t=>chapterForAudio(t,book)===index);
  const markers=parts.map(t=>t.reference.match(/, segment (\d+)\/(\d+)/));
  const total=Number(markers[0]?.[2]);
  return total>0&&parts.length===total&&markers.every((m,i)=>!!m&&Number(m[1])===i+1&&Number(m[2])===total);
 });
 return complete?tracks:[];
}
export function isBookEnd(item:LibraryAudio){
 const book=bookForAudio(item),marker=item.reference.match(/, segment (\d+)\/(\d+)/);
 return !!book&&chapterForAudio(item,book)===book.chapters.length-1&&!!marker&&marker[1]===marker[2];
}
export function nextAudioBook(item:LibraryAudio,items:LibraryAudio[],visited:string[]){
 const current=bookForAudio(item);if(!current)return null;
 for(const book of recommendedBooks(current.id,items,true,books.length)){
  if(visited.includes(book.id))continue;
  const queue=completeBookQueue(items,book);
  if(queue.length)return {book,queue};
 }
 return null;
}
