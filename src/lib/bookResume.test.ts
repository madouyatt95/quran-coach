import {expect,it} from 'vitest';
import {books} from './bookLibrary';
import {narrativeBooks} from '../data/narrativeBooks';
import {bookPassages} from './bookPassages';
import {bookResumePoint,bookRecap,bookResumeHref,type BookResumeState,type BookResumePoint} from './bookResume';
import {narrationSentences} from './narrationText';
import {chapterDrafts} from './narrativeBooks';
import type {LibraryAudio} from './audioProduction';
const book=books.find(b=>b.id==='adam')!,manuscript=narrativeBooks.find(b=>b.id===book.id)!,chapter=manuscript.chapters[0];
const items=chapterDrafts(manuscript,chapter,false,false).map((p,i)=>({id:`adam:${i}`,title:p.title,reference:p.reference,text:p.text,duration:500,sentences:narrationSentences(p.text).map((_,sentence)=>({sentence,start:sentence*5,end:sentence*5+4}))} as LibraryAudio));
const state:BookResumeState={bookReading:{},bookReadingUpdatedAt:{},positions:{}};
const passages=bookPassages(manuscript,chapter),now=10*86400000,updatedAt=now-3*86400000;
it('resumes the most recent activity with the exact paragraph or audio second',()=>{
 const saved={...state,bookReadingPoints:{adam:{chapterId:chapter.id,version:book.version,passageId:passages[2].id,updatedAt:20}},positions:{[items[0].id]:{seconds:45.25,updatedAt:10}}};
 const text=bookResumePoint(book,items,saved)!;expect(text.mode).toBe('read');expect(text.passageId).toBe(passages[2].id);expect(bookResumeHref(book,text)).toContain(encodeURIComponent(passages[2].id));
 const audio=bookResumePoint(book,items,{...saved,positions:{[items[0].id]:{seconds:46.5,updatedAt:30}}})!;expect(audio.mode).toBe('listen');expect(audio.seconds).toBe(46.5);
});
it('preserves legacy chapter bookmarks and discards obsolete edition paragraph IDs',()=>{
 const point=bookResumePoint(book,[],{...state,bookReading:{adam:chapter.id},bookReadingUpdatedAt:{adam:10},bookReadingPoints:{adam:{chapterId:chapter.id,version:'old',passageId:'obsolete',updatedAt:30}}});
 expect(point?.chapterId).toBe(chapter.id);expect(point?.passageId).toBeUndefined();expect(bookResumePoint(book,[],state)).toBeUndefined();
});
it('does not replay a completed book from the start',()=>{
 expect(bookResumePoint(book,[items[0]],{...state,positions:{[items[0].id]:{seconds:500,updatedAt:10}}})).toBeUndefined();
});
it('offers only completed audio sentences after two days, with no next sentence',()=>{
 const point:BookResumePoint={mode:'listen',chapterId:chapter.id,audioId:items[0].id,seconds:12,updatedAt};
 const sentences=narrationSentences(items[0].text);expect(bookRecap(manuscript,point,items,now)).toEqual(sentences.slice(0,2));
 expect(bookRecap(manuscript,{...point,updatedAt:now-3600000},items,now)).toEqual([]);
 expect(bookRecap(manuscript,{...point,seconds:2},items,now)).toEqual([]);
});
it('recalls only an observed previous paragraph, never inferring skipped chapters',()=>{
 const point:BookResumePoint={mode:'read',chapterId:chapter.id,passageId:passages[2].id,previousPassageId:passages[1].id,version:book.version,updatedAt};
 expect(bookRecap(manuscript,point,[],now)).toEqual(narrationSentences(passages[1].text).slice(0,2));
 expect(bookRecap(manuscript,{...point,previousPassageId:undefined},[],now)).toEqual([]);
 expect(bookRecap(manuscript,{...point,previousPassageId:passages[0].id},[],now)).toEqual([]);
 expect(bookRecap(manuscript,{...point,version:'obsolete'},[],now)).toEqual([]);
});
