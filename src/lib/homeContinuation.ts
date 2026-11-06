import {books,recordingsForBook} from './bookLibrary';
import {bookResumePoint,bookResumeHref,type BookResumeState} from './bookResume';
import type {LibraryAudio} from './audioProduction';
export interface Continuation {kind:'reading'|'listening'|'memorizing'|'book'|'course';title:string;detail:string;updatedAt:number;href?:string;audioId?:string;seconds?:number;bookId?:string;remaining?:number}
/** Only dated, resumable activity participates; equal timestamps keep the existing priority. */
export function latestContinuation(values:Continuation[],now=Date.now()){
 return values.filter(v=>Number.isFinite(v.updatedAt)&&v.updatedAt>0&&v.updatedAt<=now+60_000).sort((a,b)=>b.updatedAt-a.updatedAt)[0];
}
export function bookContinuations(state:BookResumeState,items:LibraryAudio[]):Continuation[]{
 return books.flatMap(book=>{
  const point=bookResumePoint(book,items,state);if(!point)return [];
  const chapter=book.chapters.find(c=>c.id===point.chapterId);if(!chapter)return [];
  const tracks=recordingsForBook(items,book),index=tracks.findIndex(t=>t.id===point.audioId);
  const remaining=index>=0?Math.max(0,tracks.slice(index).reduce((n,t)=>n+t.duration,0)-(point.seconds||0)):undefined;
  return [{kind:'book',title:point.mode==='listen'?'Reprendre mon livre audio':'Reprendre mon livre',detail:`${book.title} · ${chapter.title}`,updatedAt:point.updatedAt,href:bookResumeHref(book,point),bookId:book.id,audioId:point.audioId,seconds:point.seconds,remaining}];
 });
}
