import {memo} from 'react';
import {Link} from 'react-router-dom';
import {bookNextSteps} from '../../lib/bookNextSteps';
import {sourceLabel,type NarrativeBook,type NarrativeSource} from '../../lib/narrativeBooks';
export const BookEnding=memo(function BookEnding({book,onSource,onRead}:{book:NarrativeBook;onSource:(source:NarrativeSource)=>void;onRead:()=>void}){
 const {person,next}=bookNextSteps(book);
 return <section className="book-ending" aria-label="Après ce livre"><span className="book-eyebrow">APRÈS CE LIVRE</span><h2>Où ce récit vous mène-t-il ?</h2><div className="book-ending-choices">
 {person&&<Link to={person.href} state={{bookView:'read'}} onClick={onRead}><small>SUIVRE UNE PERSONNE</small><h3>{person.name}</h3><p>{person.reason}</p><span>Découvrir son livre →</span></Link>}
 {next&&<Link to={next.href} state={{bookView:'read'}} onClick={onRead}><small>{next.label.toLocaleUpperCase('fr')}</small><h3>{next.title}</h3><p>{next.reason}</p><span>Poursuivre la découverte →</span></Link>}
 <details><summary><small>APPROFONDIR</small><h3>Ce que ce récit nous apprend</h3><p>Revenir aux enseignements du livre et à leurs références.</p><span>Ouvrir les enseignements</span></summary><ul>{book.epilogue.lessons.map(l=><li key={l}>{l}</li>)}</ul><p>{book.epilogue.question}</p><div className="book-guide-actions">{book.sources.filter(s=>book.epilogue.sources.includes(s.id)).map(s=><button key={s.id} onClick={()=>onSource(s)}>{sourceLabel(s)}</button>)}</div></details>
 </div></section>;
});
