import {expect,it} from 'vitest';
import {narrativeBooks} from '../data/narrativeBooks';
import {chapterDrafts,chapterNarrative} from './narrativeBooks';
import {books,bookForAudio,chapterForAudio,recordingsForBook,bookEntryForOrigin,bookOrigins,resumeRecording,activeBookScene,narratedChapterText,canonicalBookForSource,isSupersededBookAudio} from './bookLibrary';
import type {LibraryAudio} from './audioProduction';
import {prophets} from '../data/prophets';
import {stories} from '../data/storiesData';
const recordings=narrativeBooks.flatMap(book=>book.chapters.flatMap(chapter=>chapterDrafts(book,chapter,false,chapter===book.chapters.at(-1)).map((script,i)=>({id:`${book.id}:${chapter.id}:${i}`,title:script.title,reference:script.reference,text:script.text,duration:100,sourceUrl:script.source_url,url:'https://audio.test/a.mp3',bytes:100,category:script.category,narrator:'George',sentences:[]} as LibraryAudio))));
it('maps every manuscript segment to its exact book and chapter, without loading editorial manuscripts in catalogues',()=>{
 expect(books).toHaveLength(narrativeBooks.length);
 for(const book of narrativeBooks){const summary=books.find(b=>b.id===book.id)!;expect(summary.chapters).toEqual(book.chapters.map(c=>({id:c.id,title:c.title})));const audio=recordingsForBook([...recordings].reverse(),summary);expect(audio.length).toBeGreaterThan(0);for(const [i,chapter] of book.chapters.entries()){const parts=audio.filter(a=>chapterForAudio(a,summary)===i);expect(parts.map(p=>p.text).join('')).toBe(narratedChapterText(book,chapter));}}
});
it('rejects similarly named pilot or unversioned recordings',()=>{expect(bookForAudio({title:'Adam · Un savoir reçu',reference:'2:30-34'})).toBeUndefined();});
it('requires the exact biography edition while allowing its production label',()=>{
 const current=recordings.find(r=>bookForAudio(r)?.id==='ali-proximite')!;
 expect(bookForAudio({...current,title:`Édition chronologique · ${current.title}`})?.id).toBe('ali-proximite');
 const stale={...current,reference:current.reference.replace(/-v4, chapitre/u,'-v3, chapitre')};
 expect(bookForAudio(stale)).toBeUndefined();
 expect(isSupersededBookAudio(stale)).toBe(true);
});
it('retains valid source destinations and resolves old entries to their specific chapter',()=>{
 for(const urls of Object.values(bookOrigins))for(const url of urls){const parsed=new URL(url,'https://quran-coach.fr');if(parsed.pathname==='/prophets')expect(prophets.some(p=>p.id===parsed.searchParams.get('prophet'))).toBe(true);if(parsed.pathname==='/stories')expect(stories.some(s=>s.id===parsed.searchParams.get('story'))).toBe(true);}
 expect(bookEntryForOrigin('prophet','adam')?.book.id).toBe('adam');
 expect(bookEntryForOrigin('story','deux-jardins')?.chapter).toBe('deux-jardins');
 expect(bookEntryForOrigin('prophet','salih')?.chapter).toBe('salih');
 expect(bookEntryForOrigin('prophet','idris')).toBeNull();
 expect(bookEntryForOrigin('story','hudaybiyya')?.book.id).toBe('hudaybiyya-pacte');
 expect(bookEntryForOrigin('story','ifk')?.book.id).toBe('aicha-innocence');
 expect(bookEntryForOrigin('prophet','ismail')?.book.id).toBe('hajar-zamzam');
 expect(bookEntryForOrigin('prophet','lut')?.book.id).toBe('lut');
});
it('routes legacy journey audio into its canonical book instead of listing it twice',()=>{
 expect(canonicalBookForSource('/journeys/prophet/adam')).toMatchObject({book:{id:'adam'},chapter:'names'});
 expect(canonicalBookForSource('/journeys/story/ifk')).toMatchObject({book:{id:'aicha-innocence'}});
 expect(canonicalBookForSource('/journeys/prophet/idris')).toBeNull();
 expect(canonicalBookForSource('https://example.com/journeys/prophet/adam')).toBeNull();
});
it('resumes the exact segment and proceeds after a completed segment',()=>{const list=recordingsForBook(recordings,books[0]);expect(resumeRecording(list,{})).toBe(list[0]);expect(resumeRecording(list,{[list[0].id]:{seconds:100,updatedAt:10}})).toBe(list[1]);expect(resumeRecording(list,{[list[1].id]:{seconds:14,updatedAt:11}})).toBe(list[1]);});
it('uses supplied timing markers and exact text offsets for scene changes',()=>{const book=narrativeBooks.find(b=>b.id==='biens-et-coeur')!,chapter=book.chapters[0],text=chapterNarrative(chapter);const item=recordings.find(r=>bookForAudio(r)?.id===book.id&&chapterForAudio(r)===0)!;const second=chapter.scenes[1].paragraphs[0].text;const offset=item.text.indexOf(second);expect(offset).toBeGreaterThan(0);const sentence=item.text.slice(0,offset).split(/(?<=[.!?])\s+/).filter(s=>s.trim()).length;expect(text.includes(item.text)).toBe(true);item.sentences=[{sentence,start:12,end:16}];expect(activeBookScene(book,chapter,item,13)).toBe(1);expect(activeBookScene(book,chapter,item,17)).toBe(1);});
