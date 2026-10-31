import {Link} from 'react-router-dom';
import {ArrowRight,BookOpen,Headphones} from 'lucide-react';
import {BackButton} from '../components/Navigation/BackButton';
import {BookLandscape} from '../components/Books/BookLandscape';
import {BookResumeButton} from '../components/Books/BookResumeButton';
import {useBookCatalog} from '../hooks/useBookCatalog';
import {books,bookHref} from '../lib/bookLibrary';
import {prophetChronology,prophetRelatedBooks} from '../data/prophetCollection';
import {completeBookQueue} from '../lib/bookAutoplay';
import '../components/Books/Books.css';
import './ProphetLifePage.css';

export function ProphetLifePage(){
 const {items,error}=useBookCatalog();
 const related=prophetRelatedBooks.flatMap(id=>{const book=books.find(b=>b.id===id);return book?[book]:[];});
 return <div className="prophet-life-page">
  <BackButton fallback="/prophets" className="prophet-life-back"/>
  <header className="prophet-life-hero">
   <BookLandscape scene="desert"/>
   <div><span className="book-eyebrow">UNE VIE À DÉCOUVRIR</span><h1>Le Prophète <span lang="ar">ﷺ</span></h1>
   <p>Suivre son histoire, comprendre son époque et découvrir ses enseignements. Un même récit à lire ou à écouter, à votre rythme.</p>
   <a href="#prophet-chronology">Entrer dans le récit <ArrowRight size={18}/></a></div>
  </header>
  {error&&<p className="prophet-life-notice" role="status">Les audios ne sont pas accessibles pour le moment. Les récits restent disponibles à la lecture.</p>}
  <section id="prophet-chronology" aria-labelledby="prophet-chronology-title">
   <div className="prophet-life-section-heading"><span className="book-eyebrow">SON HISTOIRE</span><h2 id="prophet-chronology-title">Au fil de sa vie</h2></div>
   <ol className="prophet-life-chapters">{prophetChronology.map((entry,index)=>{
    const book=books.find(b=>b.id===entry.bookId);if(!book)return null;
    const recordings=completeBookQueue(items,book),seconds=recordings.reduce((sum,item)=>sum+item.duration,0);
    return <li key={entry.bookId}>
     <Link to={bookHref(book.id)} className="prophet-life-chapter">
      <span className="prophet-life-number">{String(index+1).padStart(2,'0')}</span>
      <div><span className="book-eyebrow">{entry.period}</span><h3>{entry.label}</h3><p>{book.subtitle}</p>
       <span className="prophet-life-format">{seconds>0?<><Headphones size={16}/>Lire ou écouter · {Math.ceil(seconds/60)} min</>:<><BookOpen size={16}/>Lire · {book.length.minMinutes}–{book.length.maxMinutes} min estimées</>}</span>
      </div><ArrowRight size={20}/>
     </Link><BookResumeButton book={book} items={items}/>
    </li>;
   })}</ol>
  </section>
  <section aria-labelledby="prophet-related-title"><div className="prophet-life-section-heading"><span className="book-eyebrow">POUR APPROFONDIR</span><h2 id="prophet-related-title">D’autres éclairages sur sa vie</h2><p>Des récits consacrés à des moments précis, à découvrir librement.</p></div>
   <div className="prophet-life-related">{related.map(book=><Link key={book.id} to={bookHref(book.id)}><BookOpen size={20}/><div><h3>{book.title}</h3><p>{book.subtitle}</p></div><ArrowRight size={17}/></Link>)}</div>
  </section>
  <details className="prophet-life-sources"><summary>Les sources des récits</summary><p>Le Coran et les références de hadiths accompagnent les passages concernés. Le Nectar cacheté apporte le cadre chronologique, confronté aux textes primaires. Les références exactes sont consultables dans chaque chapitre.</p><p>Les récits sont rédigés en français pour Quran Coach. Les notes du lecteur distinguent les sources historiques, les traditions rapportées et les explications pédagogiques.</p></details>
 </div>;
}
