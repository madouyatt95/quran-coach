import {memo,useMemo} from 'react';
import {peopleMentions,type BookPerson} from '../../lib/bookPeople';
import {glossaryMentions,type BookTerm} from '../../data/bookGlossary';
/** Preserve the complete source string, including punctuation and diacritics. */
export const BookNames=memo(function BookNames({text,onPerson,onTerm}:{text:string;onPerson:(person:BookPerson)=>void;onTerm?:(term:BookTerm)=>void}){
 const matches=useMemo(()=>{
  const people=peopleMentions(text).map(m=>({...m,term:undefined as BookTerm|undefined}));
  const terms=onTerm?glossaryMentions(text).filter(t=>!people.some(p=>t.start<p.end&&t.end>p.start)).map(m=>({...m,person:undefined as BookPerson|undefined})):[];
  return [...people,...terms].sort((a,b)=>a.start-b.start);
 },[text,onTerm]);
 const seen=new Set<string>();let cursor=0;
 const parts=matches.map(m=>{
  const before=text.slice(cursor,m.start),name=text.slice(m.start,m.end);cursor=m.end;
  const id=m.person?.id||m.term!.id,first=!seen.has(id);seen.add(id);
  return <span key={m.start}>{before}{first?<button className={m.person?'book-person-name':'book-term-name'} aria-label={m.person?`Qui est ${m.person.name} ?`:`Comprendre : ${m.term!.label}`} onClick={e=>{e.stopPropagation();if(m.person)onPerson(m.person);else onTerm?.(m.term!);}}>{name}</button>:name}</span>;
 });
 return <>{parts}{text.slice(cursor)}</>;
});
