import {books,bookHref,recommendedBooks,recommendationReason} from './bookLibrary';
import {peopleInText} from './bookPeople';
import {chapterNarrative,type NarrativeBook} from './narrativeBooks';
// Explicit continuations only. All other books offer a related context, not an inferred chronology.
const continuations:Record<string,{id:string;reason:string}>={
 'abu-bakr-confiance':{id:'umar-responsabilite',reason:'Après le premier califat, découvrez les responsabilités confiées à Umar.'},
 'umar-responsabilite':{id:'uthman-transmission',reason:'Après la consultation de succession, découvrez le califat d’Uthman.'},
 'uthman-transmission':{id:'ali-proximite',reason:'Poursuivez avec Ali et les épreuves de la période suivante.'},
 'musa':{id:'musa-apres-la-mer',reason:'Poursuivez le parcours de Moussa après la traversée de la mer.'},
};
const cache=new WeakMap<NarrativeBook,ReturnType<typeof resolve>>();
function resolve(book:NarrativeBook){
 const people=peopleInText(book.chapters.map(c=>chapterNarrative(c)).join('\n'));
 const person=people.find(p=>p.bookId&&p.bookId!==book.id&&books.some(b=>b.id===p.bookId));
 const continuation=continuations[book.id],next=continuation?books.find(b=>b.id===continuation.id):recommendedBooks(book.id,[],false,6).find(b=>b.id!==person?.bookId);
 return {person:person?{name:person.name,href:bookHref(person.bookId!,person.chapterId),reason:`${person.name} apparaît dans ce récit. Découvrez son propre parcours.`}:undefined,next:next?{title:next.title,href:bookHref(next.id),label:continuation?'La période suivante':'Un autre éclairage',reason:continuation?.reason||recommendationReason(book.id,next.id)}:undefined};
}
export function bookNextSteps(book:NarrativeBook){let result=cache.get(book);if(!result){result=resolve(book);cache.set(book,result);}return result;}
