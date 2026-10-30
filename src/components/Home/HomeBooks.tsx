import {useMemo, useRef} from 'react';
import {Link} from 'react-router-dom';
import {BookCoverArt} from '../Books/BookCoverArt';
import {useBookCatalog} from '../../hooks/useBookCatalog';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {bookHref, recordingsForBook} from '../../lib/bookLibrary';
import {homeBookCategory, selectHomeBooks} from './homeBookSelection';
import './HomeHighlights.css';

export default function HomeBooks({date}: {date: Date}) {
    const dateKey = +new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selection = useMemo(() => selectHomeBooks(new Date(dateKey)), [dateKey]);
    const {items, loading} = useBookCatalog();
    const positions = useAudioLibraryStore(s => s.positions), reading = useAudioLibraryStore(s => s.bookReading);
    const rail = useRef<HTMLDivElement>(null);
    const move = (direction: number) => rail.current?.scrollBy({left: direction * rail.current.clientWidth * .8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    return <section className="home-books" aria-label="Une histoire à découvrir">
        <header><div><span className="home-highlight-eyebrow">LA SÉLECTION DU JOUR</span><h2>Une histoire à découvrir</h2></div><Link to="/listen/library">Tous les livres →</Link></header>
        <nav className="home-books-collections" aria-label="Collections de livres"><Link to="/prophets">📜 Prophètes</Link><Link to="/companions">Compagnons et compagnes</Link><Link to="/stories">Histoires et moralités</Link></nav>
        <div className="home-books-rail" ref={rail} aria-label="Livres à découvrir" tabIndex={0}>
            {selection.map(book => {
                const recordings = recordingsForBook(items, book);
                const duration = recordings.reduce((sum, item) => sum + item.duration, 0);
                const heard = recordings.reduce((sum, item) => sum + Math.min(item.duration, positions[item.id]?.seconds || 0), 0);
                const readChapter = book.chapters.findIndex(c => c.id === reading[book.id]);
                const hasAudio = recordings.length > 0;
                return <Link className="home-book" key={book.id} to={bookHref(book.id)} aria-label={`${book.title} · ${hasAudio ? 'Lire ou écouter' : 'Lire le livre'}`}>
                    <div className="home-book-jacket"><BookCoverArt bookId={book.id}/><div className="home-book-jacket-copy"><span>{homeBookCategory(book)}</span><h3>{book.title}</h3></div></div>
                    <p className="home-book-duration">{duration > 0 ? `${Math.ceil(duration / 60)} min d’écoute` : `${book.chapters.length} chapitres à lire`}</p>
                    <span className="home-book-action">{hasAudio ? 'Lire ou écouter' : 'Lire le livre'} <span aria-hidden="true">→</span></span>
                    {heard > 0 ? <div className="home-book-progress"><progress value={heard} max={duration} aria-label={`Progression d’écoute de ${book.title}`}/><small>{Math.round(heard / duration * 100)} % écouté</small></div> : readChapter >= 0 ? <small className="home-book-reading">Lecture · chapitre {readChapter + 1}/{book.chapters.length}</small> : <small className="home-book-reading">{loading ? 'Vérification de l’audio…' : hasAudio ? `${book.chapters.length} chapitres` : 'Version écrite'}</small>}
                </Link>;
            })}
        </div>
        <div className="home-books-controls"><span>Des récits à lire ou à écouter, à votre rythme.</span><button aria-label="Livres précédents" onClick={() => move(-1)}>←</button><button aria-label="Livres suivants" onClick={() => move(1)}>→</button></div>
    </section>;
}
