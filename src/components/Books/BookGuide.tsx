import {narrationSentences} from '../../lib/narrationText';
import {useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import {BookOpen,Headphones,X} from 'lucide-react';
import {bookDateAnchors} from '../../data/bookEditorial';
import {companionPortraits} from '../../data/companionPortraits';
import {peopleInText,type BookPerson} from '../../lib/bookPeople';
import {chapterNarrative,chapterSources,sourceLabel,sourceUrl,type NarrativeBook} from '../../lib/narrativeBooks';
import {bookHref,books} from '../../lib/bookLibrary';
import {BookCoverArt} from './BookCoverArt';
export type BookGuideTarget={kind:'timeline'}|{kind:'people';person?:BookPerson};
export function BookGuide({book,chapterIndex,target,onClose,onChapter,canListen}:{book:NarrativeBook;chapterIndex:number;target:BookGuideTarget;onClose:(resumeAudio?:boolean)=>void;onChapter:(index:number,listen:boolean)=>void;canListen:(index:number)=>boolean}){
 const dialog=useRef<HTMLDialogElement>(null),[person,setPerson]=useState(target.kind==='people'?target.person:undefined),[related,setRelated]=useState<NarrativeBook>();
 const chapter=book.chapters[chapterIndex],people=useMemo(()=>peopleInText(chapterNarrative(chapter)),[chapter]),portrait=companionPortraits.find(p=>p.id===person?.portraitId);
 useEffect(()=>{const focus=document.activeElement as HTMLElement|null,el=dialog.current!;el.showModal();return()=>{el.close();focus?.focus({preventScroll:true});};},[]);
 useEffect(()=>{let live=true;setRelated(undefined);if(person?.bookId)void import('../../data/narrativeBooks').then(m=>{if(live)setRelated(m.narrativeBooks.find(b=>b.id===person.bookId));}).catch(()=>{if(live)setRelated(undefined);});return()=>{live=false;};},[person]);
 const entry=related&&(related.chapters.find(c=>c.id===person?.chapterId)||related.chapters[0]),excerpt=entry?.scenes[0]?.paragraphs[0];
 const context=person?chapter.scenes.flatMap(s=>s.paragraphs).find(p=>peopleInText(p.text).some(x=>x.id===person.id)):undefined;
 const contextSentence=context&&person?narrationSentences(context.text).find(t=>peopleInText(t).some(x=>x.id===person.id)):undefined;
 const title=target.kind==='timeline'?(book.scope?.kind==='biography'?'Les repères de sa vie':'Le fil du récit'):person?.name||'Les personnes citées';
 return createPortal(<dialog className="book-reference book-guide" ref={dialog} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}}><header><div><span className="book-eyebrow">{book.title}</span><h2>{title}</h2></div><button autoFocus aria-label="Fermer les repères" onClick={()=>onClose()}><X size={20}/></button></header>
 {target.kind==='timeline'?<><p>Retrouvez une étape et ouvrez directement son chapitre.</p><ol className="book-life-timeline">{book.chapters.map((c,i)=>{
 const anchor=bookDateAnchors[book.id]?.[c.id],proof=anchor&&c.scenes.flatMap(s=>s.paragraphs).find(p=>p.text.includes(anchor.quote));
 return <li key={c.id} aria-current={i===chapterIndex?'step':undefined}><span className="book-life-dot">{String(i+1).padStart(2,'0')}</span><div><small>{proof?anchor!.label:`Chapitre ${i+1}`}{i===chapterIndex?' · Vous êtes ici':''}</small><h3>{c.title}</h3><p>{c.recap||narrationSentences(c.scenes[0]?.paragraphs[0]?.text||'')[0]}</p>{proof&&<details><summary>Le repère dans le texte</summary><p>{proof.text}</p><div className="book-guide-sources">{book.sources.filter(s=>proof.sources.includes(s.id)).map(s=><a key={s.id} href={sourceUrl(s)} target="_blank" rel="noopener noreferrer">{sourceLabel(s)} ↗</a>)}</div></details>}<div className="book-guide-actions"><button onClick={()=>onChapter(i,false)}><BookOpen size={16}/>Lire</button><button disabled={!canListen(i)} onClick={()=>onChapter(i,true)}><Headphones size={16}/>Écouter</button></div><details><summary>Sources du chapitre</summary><div className="book-guide-sources">{chapterSources(book,c).map(s=><a key={s.id} href={sourceUrl(s)} target="_blank" rel="noopener noreferrer">{sourceLabel(s)} ↗</a>)}</div></details></div></li>;
 })}</ol><p className="book-guide-note">Les étapes suivent l’ordre du livre. Les dates ne sont affichées que lorsqu’elles sont précisées dans le texte ; aucune date n’est déduite pour les autres étapes.</p></>:<>
 {people.length>0&&<nav className="book-people-list" aria-label="Personnes citées dans ce chapitre">{people.map(p=><button key={p.id} aria-pressed={person?.id===p.id} onClick={()=>setPerson(p)}>{p.name}</button>)}</nav>}
 {!person&&<p>{people.length?'Choisissez un nom pour retrouver sa présentation et ses références.':'Aucune fiche de personne n’est associée à ce chapitre.'}</p>}
 {person&&<section className="book-person-profile"><h3>{person.name}</h3>{portrait?.nameAr&&<p dir="rtl" lang="ar" className="book-person-arabic">{portrait.nameAr}</p>}
 {contextSentence&&<div className="book-person-context"><small>DANS CE CHAPITRE</small><blockquote>{contextSentence}</blockquote></div>}
 {excerpt?<><p>{excerpt.text}</p><details><summary>Références de cette présentation</summary><div className="book-guide-sources">{related!.sources.filter(s=>excerpt.sources.includes(s.id)).map(s=><a href={sourceUrl(s)} key={s.id} target="_blank" rel="noopener noreferrer">{sourceLabel(s)} ↗</a>)}</div></details></>:portrait?<><p>{portrait.paragraphs[0]}</p><details><summary>Références du portrait</summary><div className="book-guide-sources">{portrait.references.map((s,i)=><a href={s.url} key={i} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</div></details></>:<p role="status">Ouverture de la présentation…</p>}
 {person.bookId&&books.some(b=>b.id===person.bookId)&&person.bookId!==book.id&&<Link className="book-person-book" to={bookHref(person.bookId,person.chapterId)} state={{bookView:'read'}} onClick={()=>onClose(false)}><span className="book-person-cover"><BookCoverArt bookId={person.bookId}/></span><span><small>POURSUIVRE LA DÉCOUVERTE</small><strong>{books.find(b=>b.id===person.bookId)!.title}</strong>Ouvrir le livre →</span></Link>}
 </section>}
 </>}
 <footer><button onClick={()=>onClose()}>Revenir à mon passage</button></footer></dialog>,document.body);
}
