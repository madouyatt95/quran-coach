import {memo,useMemo} from 'react';
import {peopleMentions,type BookPerson} from '../../lib/bookPeople';
/** Keep every character of the source text; only wrap the first mention of each person. */
export const BookNames=memo(function BookNames({text,onPerson}:{text:string;onPerson:(person:BookPerson)=>void}){
 const matches=useMemo(()=>peopleMentions(text),[text]),seen=new Set<string>();let cursor=0;
 const parts=matches.map(m=>{const before=text.slice(cursor,m.start),name=text.slice(m.start,m.end);cursor=m.end;const first=!seen.has(m.person.id);seen.add(m.person.id);return <span key={m.start}>{before}{first?<button className="book-person-name" aria-label={`Qui est ${m.person.name} ?`} onClick={e=>{e.stopPropagation();onPerson(m.person);}}>{name}</button>:name}</span>;});
 return <>{parts}{text.slice(cursor)}</>;
});
