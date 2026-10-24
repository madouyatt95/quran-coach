import {describe,it,expect} from 'vitest';
import {companionPortraits} from './companionPortraits';
import {companionLifeStories} from './companionLifeStories';
import {narrativeBooks} from './narrativeBooks';

describe('collection des compagnons',()=>{
 it('gives every person a life narrative rather than only an isolated episode',()=>{
  expect(companionPortraits).toHaveLength(42);
  expect(new Set(companionPortraits.map(p=>p.id)).size).toBe(42);
  for(const person of companionPortraits){
   const book=narrativeBooks.find(b=>b.id===person.bookId);
   if(book){
    expect(book.collection).toBe('companions');
    expect(book.companionIds).toContain(person.id);
    expect(book.scope?.kind).toBe('biography');
    expect(book.chapters[0].id).toBe('origines');
    expect(book.sources.some(s=>s.type==='history')).toBe(true);
   }else{
    const life=person.lifeSections;
    expect(life?.length).toBeGreaterThanOrEqual(3);
    expect(new Set(life?.map(s=>s.title)).size).toBe(life?.length);
    expect(life?.at(-1)?.text).toMatch(/mort|meurt|décès/u);
    expect(person.references.some(r=>r.url.includes('wikisource.org'))).toBe(true);
   }
   for(const ref of person.references)expect(new URL(ref.url).protocol).toBe('https:');
  }
 });
 it('keeps each historical notice attached to one existing person',()=>{
  for(const [id,life] of Object.entries(companionLifeStories)){
   const person=companionPortraits.find(p=>p.id===id);
   expect(person).toBeDefined();
   expect(person?.references.some(r=>decodeURI(r.url).endsWith(life.arabicNotice.replaceAll(' ','_')))).toBe(true);
  }
 });
});
