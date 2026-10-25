import {expect,it} from 'vitest';
import {bookEvents,connectionsForChapter} from '../data/bookConnections';
import {narrativeBooks} from '../data/narrativeBooks';
import {bookPassages,bookAudioMarks,audioAtPassage} from './bookPassages';
import {chapterDrafts} from './narrativeBooks';
import {narrationSentences} from './narrationText';
import type {LibraryAudio} from './audioProduction';
it('resolves every editorial connection to a sourced stable paragraph and a real sentence cue',()=>{
 for(const event of bookEvents){expect(event.passages.length).toBeGreaterThan(1);for(const target of event.passages){
  const book=narrativeBooks.find(b=>b.id===target.bookId)!,chapter=book.chapters.find(c=>c.id===target.chapterId)!;
  const passage=bookPassages(book,chapter).find(p=>p.id===target.passageId)!;expect(passage,event.id).toBeDefined();expect(passage.sources.length).toBeGreaterThan(0);expect(passage.sources.every(id=>book.sources.some(s=>s.id===id))).toBe(true);
  const recordings=chapterDrafts(book,chapter,false,false).map((part,i)=>({id:String(i),title:part.title,text:part.text,reference:part.reference,duration:1000,sentences:narrationSentences(part.text).map((_,sentence)=>({sentence,start:sentence*4,end:sentence*4+3}))} as LibraryAudio));
  const mark=audioAtPassage(passage,bookAudioMarks(book,chapter,recordings));expect(mark).toBeDefined();expect(mark!.start).toBeGreaterThanOrEqual(passage.start);expect(mark!.start).toBeLessThan(passage.end);
  expect(audioAtPassage(passage,bookAudioMarks(book,chapter,[]))).toBeUndefined();
  expect(connectionsForChapter(book.id,chapter.id).flatMap(e=>e.passages).every(p=>p.bookId!==book.id)).toBe(true);
 }}
});
it('does not suggest a shared event for an unrelated chapter',()=>{expect(connectionsForChapter('adam','names')).toEqual([]);expect(connectionsForChapter('nusayba-presence','origines')).toEqual([]);});
