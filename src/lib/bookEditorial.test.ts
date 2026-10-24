import {describe,it,expect} from 'vitest';
import {books,recommendedBooks} from './bookLibrary';
import {bookConnections,bookDateAnchors} from '../data/bookEditorial';
import {narrativeBooks} from '../data/narrativeBooks';
import {peopleMentions,bookPeople} from './bookPeople';
import {bookCoverIdentity} from '../components/Books/BookCoverArt';
describe('source-grounded book navigation',()=>{
 it('links only existing books and prioritises an explained cross-collection relation',()=>{
  for(const group of bookConnections)for(const id of group.ids)expect(books.some(b=>b.id===id),id).toBe(true);
  expect(recommendedBooks('hijra-route',[]).slice(0,2).map(b=>b.id)).toEqual(expect.arrayContaining(['abu-bakr-confiance','asma-liens']));
  for(const b of books){const list=recommendedBooks(b.id,[]);expect(list.some(x=>x.id===b.id)).toBe(false);expect(new Set(list.map(x=>x.id)).size).toBe(list.length);}
 });
 it('does not publish a date without a matching sourced manuscript passage',()=>{
  for(const [id,anchors] of Object.entries(bookDateAnchors))for(const [chapterId,anchor] of Object.entries(anchors)){
   const book=narrativeBooks.find(b=>b.id===id)!;
   const paragraph=book.chapters.find(c=>c.id===chapterId)?.scenes.flatMap(s=>s.paragraphs).find(p=>p.text.includes(anchor.quote));
   expect(paragraph,`${id}/${chapterId}`).toBeDefined();expect(paragraph!.sources.length).toBeGreaterThan(0);
   for(const source of paragraph!.sources)expect(book.sources.some(s=>s.id===source)).toBe(true);
  }
 });
 it('resolves full names before embedded relatives, without altering the text',()=>{
  const text='Aicha bint Abi Bakr écoute Abdullah ibn Umar, puis Umar et Ali ibn Abi Talib. Muhammad ibn Abu Bakr arrive.';
  const hits=peopleMentions(text);expect(hits.map(x=>x.person.id)).toEqual(['companion:aicha','companion:ibn-umar','companion:umar','companion:ali','companion:abu-bakr']);
  expect(peopleMentions('La qualité et la validation.')).toEqual([]);
  expect(peopleMentions('Abou Dharr retrouve Kaab.').map(x=>x.person.id)).toEqual(['companion:abu-dharr','companion:kaab-malik']);
  let cursor=0,reconstructed='';for(const hit of hits){reconstructed+=text.slice(cursor,hit.start)+text.slice(hit.start,hit.end);cursor=hit.end;}expect(reconstructed+text.slice(cursor)).toBe(text);
 });
 it('gives every published book its own cover identity and valid person destinations',()=>{
  expect(new Set(books.map(b=>JSON.stringify(bookCoverIdentity(b.id)))).size).toBe(books.length);
  for(const p of bookPeople)if(p.bookId){const b=books.find(b=>b.id===p.bookId);expect(b,p.id).toBeDefined();if(p.chapterId)expect(b!.chapters.some(c=>c.id===p.chapterId),p.id).toBe(true);}
 });
});
