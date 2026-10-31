import {expect,it} from 'vitest';
import {prophetChronology} from '../data/prophetCollection';
import {narrativeBooks} from '../data/narrativeBooks';
import {chapterDrafts} from './narrativeBooks';
import {nextAudioBook} from './bookAutoplay';
import type {LibraryAudio} from './audioProduction';

function tracks(id:string):LibraryAudio[]{
 const book=narrativeBooks.find(b=>b.id===id)!;
 return book.chapters.flatMap(chapter=>chapterDrafts(book,chapter,false,chapter===book.chapters.at(-1)).map((s,i)=>({id:`${id}:${i}`,title:s.title,reference:s.reference,text:s.text,category:s.category,url:'https://audio.test/a.mp3',sourceUrl:s.source_url,narrator:'George',duration:100,bytes:100,sentences:[]})));
}
it('continues the Prophet chronology only with the complete immediate next period',()=>{
 const opening=tracks('prophete-la-mecque'),childhood=tracks('prophete-enfance'),home=tracks('prophete-foyer');
 const current=opening.at(-1)!;
 expect(nextAudioBook(current,[...home,...childhood],[])?.book.id).toBe('prophete-enfance');
 expect(nextAudioBook(current,[...home,...childhood.slice(1)],[])).toBeNull();
 expect(nextAudioBook(current,home,[])).toBeNull();
 expect(nextAudioBook(current,[...home,...childhood],['prophete-enfance'])).toBeNull();
});
it('does not loop back or switch to an older episode at the end of the available chronology',()=>{
 const last=tracks(prophetChronology.at(-1)!.bookId).at(-1)!;
 expect(nextAudioBook(last,[...tracks('prophete-la-mecque'),...tracks('revelation-lettre')],[])).toBeNull();
});

it('continues from Hira into the newly available period without skipping missing segments',()=>{
 const current=tracks('prophete-hira').at(-1)!;
 const next=tracks('prophete-premiers-croyants'),later=tracks('prophete-abyssinie');
 expect(nextAudioBook(current,[...later,...next],[])?.book.id).toBe('prophete-premiers-croyants');
 expect(nextAudioBook(current,[...later,...next.slice(1)],[])).toBeNull();
});

// Includes the four existing multi-chapter books reused in the new chronology.
it('connects every published period without skipping incomplete multi-chapter books',()=>{
 for(let i=0;i<prophetChronology.length-1;i++){
  const current=tracks(prophetChronology[i].bookId).at(-1)!;
  const target=prophetChronology[i+1].bookId,next=tracks(target);
  expect(nextAudioBook(current,next,[])?.book.id,target).toBe(target);
  expect(nextAudioBook(current,next.slice(1),[]),target).toBeNull();
 }
});
