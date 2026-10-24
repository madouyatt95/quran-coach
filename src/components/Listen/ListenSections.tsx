import {Link} from 'react-router-dom';
import '../Books/Collections.css';
export function ListenSections({books=false}:{books?:boolean}){return <nav className="listen-sections" aria-label="Univers d’écoute"><Link to="/listen" aria-current={!books?'page':undefined}>Coran</Link><Link to="/listen/library" aria-current={books?'page':undefined}>Livres et récits</Link></nav>;}
