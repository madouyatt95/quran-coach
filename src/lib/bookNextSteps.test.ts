import {it,expect} from 'vitest';
import {narrativeBooks} from '../data/narrativeBooks';
import {books} from './bookLibrary';
import {bookNextSteps} from './bookNextSteps';
it('offers valid distinct destinations without inventing chronological follow-ups',()=>{
 for(const book of narrativeBooks){
  const next=bookNextSteps(book);
  for(const link of [next.person,next.next])if(link){const id=new URL(link.href,'https://example.org').pathname.split('/')[2];expect(books.some(b=>b.id===id),book.id).toBe(true);expect(id).not.toBe(book.id);}
  if(next.person&&next.next)expect(next.person.href.split('?')[0]).not.toBe(next.next.href.split('?')[0]);
 }
 expect(bookNextSteps(narrativeBooks.find(b=>b.id==='umar-responsabilite')!).next).toMatchObject({label:'La période suivante',title:'Uthman ibn Affan'});
 expect(bookNextSteps(narrativeBooks.find(b=>b.id==='hamza-protection')!).next?.label).toBe('Un autre éclairage');
});
