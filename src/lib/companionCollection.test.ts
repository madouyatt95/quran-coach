import {expect,it} from 'vitest';
import {companionPortraits,companionHref} from '../data/companionPortraits';
import {companions} from '../data/companions';
import {narrativeBooks,narrativeProductionBooks} from '../data/narrativeBooks';
import {books,bookEntryForOrigin,canonicalBookForSource,isSupersededBookAudio,bookForAudio,bookOrigins} from './bookLibrary';

const previous=['abu-bakr','umar','uthman','ali','talha','zubayr','abdurrahman','saad','said','abu-ubayda','bilal','khalid','abu-dharr','salman','ibn-masud','musab','hamza','jafar','abu-hurayra','khadija','aicha','fatima'];
it('replaces former biographies with unique sourced portraits and retains all original identifiers',()=>{
 expect(companionPortraits).toHaveLength(42);expect(new Set(companionPortraits.map(p=>p.id)).size).toBe(42);
 for(const id of previous)expect(companionPortraits.some(p=>p.id===id),id).toBe(true);
 expect(companions).toHaveLength(42);
 for(const p of companionPortraits){expect(p.references.length,p.id).toBeGreaterThan(0);for(const ref of p.references){expect(ref.description).not.toBe('');expect(ref.url).toMatch(/^https:\/\/(sunnah\.com|quran\.com|ar\.wikisource\.org)\//);}expect(companions.find(c=>c.id===p.id)?.summary).toBe(p.paragraphs.join('\n\n'));}
});
it('resolves companion origins and old shared links to the same complete manuscript',()=>{
 for(const p of companionPortraits.filter(p=>p.bookId)){expect(books.some(b=>b.id===p.bookId),p.id).toBe(true);expect(bookEntryForOrigin('companion',p.id)?.book.id).toBe(p.bookId);expect(bookEntryForOrigin('companion',p.id)?.chapter).toBe(books.find(b=>b.id===p.bookId)!.chapters[0].id);expect(canonicalBookForSource(companionHref(p.id))?.book.id).toBe(p.bookId);expect(canonicalBookForSource(`/prophets?companion=${p.id}`)?.book.id).toBe(p.bookId);}
 expect(bookEntryForOrigin('companion','absent')).toBeNull();
 expect(canonicalBookForSource('https://example.com/companions?companion=bilal')).toBeNull();
});
it('never mislabels an old manuscript version as a new recording or a standalone story',()=>{
 const book=books.find(b=>b.id==='bilal-dignite')!;
 expect(isSupersededBookAudio({title:'Ancien titre',reference:`Manuscrit ${book.id}-conte-2026-01-01-v1, chapitre appel, segment 1/1`})).toBe(true);
 const current={title:`${book.title} · 2. Une voix pour se retrouver`,reference:`Manuscrit ${book.version}, chapitre appel, segment 1/1`};
 expect(bookForAudio(current)?.id).toBe(book.id);expect(isSupersededBookAudio(current)).toBe(false);
});
it('links every new book to existing people and never invents a second biography identity',()=>{
 const additions=narrativeBooks.filter(b=>b.collection==='companions');expect(additions).toHaveLength(31);
 for(const book of additions){expect(book.companionIds?.length).toBeGreaterThan(0);for(const id of book.companionIds||[])expect(companionPortraits.some(p=>p.id===id&&p.bookId===book.id)).toBe(true);expect(bookOrigins[book.id].some(url=>url.startsWith('/companions?companion='))).toBe(true);}
});

it('uses the canonical written biography and rejects audio from an obsolete edition',()=>{
 for(const id of ['aicha-innocence','kaab-verite','abou-dharr-recherche','jabir-attention']){
  const prepared=narrativeProductionBooks.find(b=>b.id===id)!,active=narrativeBooks.find(b=>b.id===id)!;
  expect(active.version).toBe(prepared.version);
  expect(prepared.chapters.map(c=>c.id)).toEqual(active.chapters.map(c=>c.id));
  for(const [i,c] of prepared.chapters.entries())expect(c.scenes[0].paragraphs[0].text).toBe(active.chapters[i].scenes[0].paragraphs[0].text);
  const audio={title:`${prepared.title} · 1. ${prepared.chapters[0].title}`,reference:`Manuscrit ${prepared.version}, chapitre ${prepared.chapters[0].id}, segment 1/1`};
  expect(bookForAudio(audio)?.id).toBe(id);
  expect(bookForAudio({...audio,reference:`Manuscrit ${id}-obsolete-v1, chapitre ${prepared.chapters[0].id}, segment 1/1`})).toBeUndefined();
 }
});
