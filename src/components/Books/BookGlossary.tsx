import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {type BookTerm} from '../../data/bookGlossary';
/** A compact overlay: never resizes the text or the upper Pupitre pane. */
export function BookGlossary({terms,initial,onClose}:{terms:BookTerm[];initial?:BookTerm;onClose:()=>void}){
 const returnFocus=useRef(document.activeElement as HTMLElement|null);
 const dialog=useRef<HTMLDialogElement>(null),[term,setTerm]=useState(initial||terms[0]);
 useEffect(()=>{
  const focus=returnFocus.current,el=dialog.current!;el.showModal();
  return()=>{el.close();focus?.focus({preventScroll:true});};
 },[]);
 return createPortal(<dialog ref={dialog} className="book-reference book-glossary" aria-label="Les mots du récit" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <header><h2>Les mots du récit</h2><button autoFocus aria-label="Fermer le glossaire" onClick={onClose}>✕</button></header>
  {terms.length>1&&<nav aria-label="Mots de ce chapitre">{terms.map(t=><button key={t.id} aria-pressed={term?.id===t.id} onClick={()=>setTerm(t)}>{t.label}</button>)}</nav>}
  {term?<><h3>{term.label}</h3><p>{term.meaning}</p><details><summary>Référence et contexte</summary><a href={term.reference.url} target="_blank" rel="noopener noreferrer">{term.reference.label} ↗</a><small>Explication pédagogique, distincte du texte cité.</small></details></>:<p>Aucun terme du glossaire dans ce chapitre.</p>}
  <footer><button onClick={onClose}>Reprendre mon passage</button></footer>
 </dialog>,document.body);
}
