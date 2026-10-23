import {expect,it} from 'vitest';
import {narrativeBooks} from '../data/narrativeBooks';
import {chapterDrafts} from './narrativeBooks';
import {narrationSentences} from './narrationText';
import {bookAudioMarks,bookPassages,passageAtAudio,audioAtPassage} from './bookPassages';
import {narratedChapterText} from './bookLibrary';
import type {LibraryAudio} from './audioProduction';
function recordings(book:typeof narrativeBooks[number],chapter:typeof book.chapters[number]){return chapterDrafts(book,chapter,false,chapter===book.chapters.at(-1)).map((script,i)=>({id:`${book.id}:${chapter.id}:${i}`,title:script.title,reference:script.reference,text:script.text,duration:1000,url:'https://test/audio',bytes:100,sourceUrl:script.source_url,category:script.category,narrator:'George',sentences:narrationSentences(script.text).map((_,sentence)=>({sentence,start:sentence*3,end:sentence*3+2}))} as LibraryAudio));}
it('maps every paragraph of all 17 manuscripts across technical recording boundaries',()=>{
 let count=0;
 for(const book of narrativeBooks)for(const chapter of book.chapters){const parts=recordings(book,chapter),passages=bookPassages(book,chapter),marks=bookAudioMarks(book,chapter,[...parts].reverse());
 expect(passages.length).toBe(chapter.scenes.reduce((n,s)=>n+s.paragraphs.length,0)+(book.chapters.at(-1)===chapter?1:0));
 for(const passage of passages){count++;expect(narratedChapterText(book,chapter).slice(passage.start,passage.end)).toBe(passage.text);const mark=audioAtPassage(passage,marks);expect(mark,passage.id).toBeDefined();expect(passageAtAudio(passages,marks,mark!.item.id,mark!.seconds+.1)?.id,passage.id).toBe(passage.id);}
 }
 expect(count).toBeGreaterThan(100);
});
it('never fabricates timing for missing, wrong-text or invalid marks',()=>{const book=narrativeBooks[0],chapter=book.chapters[0],parts=recordings(book,chapter),passages=bookPassages(book,chapter);expect(audioAtPassage(passages[0],[])).toBeUndefined();expect(bookAudioMarks(book,chapter,[{...parts[0],text:'wrong manuscript'}])).toEqual([]);expect(bookAudioMarks(book,chapter,[{...parts[0],sentences:[{sentence:99999,start:1,end:2},{sentence:0,start:NaN,end:2}]}])).toEqual([]);expect(passageAtAudio(passages,bookAudioMarks(book,chapter,parts),'another recording',8)).toBeUndefined();});
