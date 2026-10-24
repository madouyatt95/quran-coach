import {expect,it} from 'vitest';
import {narrativeBooks} from '../data/narrativeBooks';
import {chapterDrafts} from './narrativeBooks';
import {narrationSentences} from './narrationText';
import {bookSceneCues,bookPassages,audioAtPassage,bookAudioMarks} from './bookPassages';
import type {LibraryAudio} from './audioProduction';
it('links every scene to its manuscript and uses only recorded sentence cues',()=>{
 const book=narrativeBooks.find(b=>b.id==='adam')!,chapter=book.chapters[0];
 const items=chapterDrafts(book,chapter,false,false).map((part,i)=>({id:String(i),text:part.text,title:part.title,reference:part.reference,duration:800,sentences:narrationSentences(part.text).map((_,sentence)=>({sentence,start:sentence*5,end:sentence*5+4}))} as LibraryAudio));
 const cues=bookSceneCues(book,chapter,items);expect(cues).toHaveLength(chapter.scenes.length);
 for(const cue of cues){expect(cue.passage?.scene).toBe(cue.index);expect(cue.mark).toEqual(audioAtPassage(cue.passage!,bookAudioMarks(book,chapter,items)));expect(cue.mark?.seconds).toBeGreaterThanOrEqual(0);}
 expect(bookPassages(book,chapter).some(p=>p.scene===0)).toBe(true);
 expect(bookSceneCues(book,chapter,[]).every(c=>c.passage&&!c.mark)).toBe(true);
 expect(bookSceneCues(book,chapter,items.map(i=>({...i,sentences:[]}))).every(c=>!c.mark)).toBe(true);
});
