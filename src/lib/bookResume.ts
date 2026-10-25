import {books,bookHref,chapterForAudio,recordingsForBook,type BookSummary} from './bookLibrary';
import type {LibraryAudio} from './audioProduction';
import {bookPassages} from './bookPassages';
import {narrationSentences} from './narrationText';
import type {NarrativeBook} from './narrativeBooks';
export interface BookReadingPoint {chapterId:string;passageId:string;version:string;updatedAt:number;previousPassageId?:string}
export interface BookResumeState {bookReading:Record<string,string>;bookReadingUpdatedAt:Record<string,number>;bookReadingPoints?:Record<string,BookReadingPoint>;positions:Record<string,{seconds:number;updatedAt:number}>}
export interface BookResumePoint {chapterId:string;passageId?:string;previousPassageId?:string;version?:string;updatedAt:number;mode:'read'|'listen';audioId?:string;seconds?:number}
export function bookResumePoint(book:BookSummary,items:LibraryAudio[],state:BookResumeState):BookResumePoint|undefined {
 const exact=state.bookReadingPoints?.[book.id],valid=exact?.version===book.version&&book.chapters.some(c=>c.id===exact.chapterId)?exact:undefined;
 const chapterId=valid?.chapterId||state.bookReading[book.id];
 const reading:BookResumePoint|undefined=chapterId&&book.chapters.some(c=>c.id===chapterId)?{chapterId,mode:'read',updatedAt:valid?.updatedAt||state.bookReadingUpdatedAt[book.id]||0,...(valid?{passageId:valid.passageId,previousPassageId:valid.previousPassageId,version:valid.version}:{})}:undefined;
 const tracks=recordingsForBook(items,book);
 const audio=tracks.filter(t=>state.positions[t.id]?.seconds>2).sort((a,b)=>state.positions[b.id].updatedAt-state.positions[a.id].updatedAt)[0];
 if(!audio||reading&&reading.updatedAt>state.positions[audio.id].updatedAt)return reading;
 const saved=state.positions[audio.id],index=tracks.indexOf(audio);
 // Finishing a recording advances to the next one, never restarts a finished book.
 if(saved.seconds>=audio.duration-.5){const next=tracks[index+1];return next?{chapterId:book.chapters[chapterForAudio(next,book)].id,mode:'listen',audioId:next.id,seconds:0,updatedAt:saved.updatedAt}:reading;}
 return {chapterId:book.chapters[chapterForAudio(audio,book)].id,mode:'listen',audioId:audio.id,seconds:Math.min(saved.seconds,audio.duration),updatedAt:saved.updatedAt};
}
export function bookResumeHref(book:BookSummary,point:BookResumePoint){return bookHref(book.id,point.chapterId)+(point.passageId?`&passage=${encodeURIComponent(point.passageId)}`:'');}
export function bookRecap(book:NarrativeBook,point:BookResumePoint|undefined,items:LibraryAudio[],now=Date.now()):string[]{
 if(!point||!point.updatedAt||now-point.updatedAt<48*60*60_000)return [];
 if(point.mode==='listen'){
  const summary=books.find(b=>b.id===book.id);if(!summary)return [];const item=recordingsForBook(items,summary).find(i=>i.id===point.audioId);if(!item)return [];
  const sentences=narrationSentences(item.text);
  // Only complete sentences before the saved position; no preview of the next phrase.
  return item.sentences.filter(mark=>mark.end<=(point.seconds||0)&&mark.end>mark.start).slice(-2).map(mark=>sentences[mark.sentence]).filter(Boolean);
 }
 if(point.version!==book.version||!point.previousPassageId)return [];
 const chapter=book.chapters.find(c=>c.id===point.chapterId);if(!chapter)return [];
 const passages=bookPassages(book,chapter),index=passages.findIndex(p=>p.id===point.passageId);
 const previous=passages[index-1];if(!previous||previous.id!==point.previousPassageId)return [];
 return narrationSentences(previous.text).slice(0,2);
}
