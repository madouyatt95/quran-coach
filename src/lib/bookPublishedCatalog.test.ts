import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {narrativeBooks} from '../data/narrativeBooks';
import {books,recordingsForBook,chapterForAudio} from './bookLibrary';
import {bookAudioMarks,bookPassages,audioAtPassage} from './bookPassages';
import type {LibraryAudio} from './audioProduction';
/** Optional audit of an explicitly fetched public catalogue, never a network call from tests. */
it.skipIf(!process.env.QC_CATALOG_AUDIT_FILE)('matches every published segment and paragraph to its real supplied timing',()=>{
 const catalog=JSON.parse(readFileSync(process.env.QC_CATALOG_AUDIT_FILE!,'utf8')) as LibraryAudio[];let inspected=0;
 for(const book of narrativeBooks){const parts=recordingsForBook(catalog,books.find(b=>b.id===book.id)!);expect(parts.length,book.id).toBeGreaterThan(0);for(const [i,chapter] of book.chapters.entries()){const recordings=parts.filter(p=>chapterForAudio(p)===i),marks=bookAudioMarks(book,chapter,recordings);expect(marks.length,`${book.id}/${chapter.id}`).toBe(recordings.reduce((n,r)=>n+r.sentences.length,0));for(const p of bookPassages(book,chapter))expect(audioAtPassage(p,marks),`${book.id}/${p.id}`).toBeDefined();inspected+=recordings.length;}}
 expect(inspected).toBe(catalog.length);
});
