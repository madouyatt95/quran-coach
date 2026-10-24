import {useEffect,useRef,type ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {BookOpen,Headphones,ChevronLeft,ChevronRight} from 'lucide-react';
import {usePageState} from '../../hooks/usePageState';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {Pupitre,PupitreTop,PupitreBottom} from '../Pupitre/Pupitre';
import {BookLandscape} from './BookLandscape';
import {bookHref,bookOrigins,coverScene,recordingsForBook,resumeRecording,chapterForAudio,type BookSummary} from '../../lib/bookLibrary';
import type {LibraryAudio} from '../../lib/audioProduction';
import './BookDiscovery.css';

function BookRail({id,title,books,selected,onSelect,items}:{id:string;title:string;books:BookSummary[];selected:string;onSelect:(id:string)=>void;items:LibraryAudio[]}){
 const ref=useRef<HTMLDivElement>(null),[offset,setOffset]=usePageState(`rail-${id}`,0);
 useEffect(()=>{if(ref.current)ref.current.scrollLeft=offset;},[]); // Restore only on entry, not during a swipe.
 if(!books.length)return null;
 return <section className="book-rail"><header><h3>{title}</h3><div><button aria-label={`Faire défiler ${title} vers la gauche`} onClick={()=>ref.current?.scrollBy({left:-300,behavior:'smooth'})}><ChevronLeft size={18}/></button><button aria-label={`Faire défiler ${title} vers la droite`} onClick={()=>ref.current?.scrollBy({left:300,behavior:'smooth'})}><ChevronRight size={18}/></button></div></header><div ref={ref} className="book-rail-track" onScroll={e=>setOffset(e.currentTarget.scrollLeft)}>{books.map((b,i)=>{const tracks=recordingsForBook(items,b),duration=tracks.reduce((n,t)=>n+t.duration,0);return <button key={b.id} className="book-jacket" aria-pressed={selected===b.id} aria-label={`Présenter ${b.title}`} onClick={()=>onSelect(b.id)}><BookLandscape scene={coverScene(b.id)}/><span className="book-jacket-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><span className="book-jacket-copy"><small>{b.chapters.length} CHAPITRES</small><strong>{b.title}</strong><span>{duration?`${Math.ceil(duration/60)} min · Audio & texte`:'Texte intégral'}</span></span></button>;})}</div></section>;
}
export function BookDiscovery({books,items,children,afterBooks,kind}:{books:BookSummary[];items:LibraryAudio[];children:ReactNode;afterBooks?:ReactNode;kind:string}){
 const hero=useRef<HTMLElement>(null);
 const choose=(id:string)=>{setSelection(id);if(hero.current?.closest('[data-pupitre-layout=plain]'))hero.current.scrollIntoView({block:'start',behavior:'smooth'});};
 const [selection,setSelection]=usePageState(`book-featured-${kind}`,''),navigate=useNavigate();
 const store=useAudioLibraryStore(),player=useLibraryPlayer();
 const selected=books.find(b=>b.id===selection)||books[0];
 const tracks=selected?recordingsForBook(items,selected):[],resume=resumeRecording(tracks,store.positions),duration=tracks.reduce((n,t)=>n+t.duration,0);
 const continued=books.filter(b=>store.bookReading[b.id]||recordingsForBook(items,b).some(t=>store.positions[t.id]?.seconds>0));
 const prophets=books.filter(b=>bookOrigins[b.id]?.some(url=>url.startsWith('/prophets')));
 const stories=books.filter(b=>!prophets.includes(b));
 const short=books.filter(b=>{const t=recordingsForBook(items,b),d=t.reduce((n,t)=>n+t.duration,0);return d>0&&d<=20*60;});
 const enter=(mode:'read'|'listen')=>{if(!selected)return;let chapter=store.bookReading[selected.id];if(mode==='listen'){if(!resume)return;chapter=selected.chapters[chapterForAudio(resume,selected)]?.id;void player.play(resume,{queue:tracks});}else player.pause();navigate(bookHref(selected.id,chapter),{state:{bookView:mode}});};
 return <Pupitre title="Les livres de Quran Coach" activity="catalogue" className="book-discovery"><PupitreTop aria-label="Présentation du livre sélectionné">
 {selected?<section ref={hero} className="book-featured" aria-label="Livre sélectionné"><BookLandscape key={selected.id} scene={coverScene(selected.id)}/><div className="book-featured-copy"><span className="book-eyebrow">UNE HISTOIRE À VIVRE</span><h2>{selected.title}</h2><p>{selected.subtitle}</p><small>{selected.chapters.length} chapitres{duration>0?` · ${Math.ceil(duration/60)} minutes d’écoute`:''}</small><div className="book-featured-actions"><button onClick={()=>enter('read')}><BookOpen size={19}/>Lire</button><button disabled={!resume} onClick={()=>enter('listen')}><Headphones size={19}/>{resume&&store.positions[resume.id]?.seconds>2?'Reprendre l’écoute':'Écouter'}</button></div></div></section>:<p>Aucun livre ne correspond à cette recherche.</p>}
 </PupitreTop><PupitreBottom aria-label="Choisir votre prochaine histoire">{children}
 <BookRail id={`${kind}-continue`} title="Continuer votre voyage" books={continued} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-prophets`} title="Histoires des prophètes" books={prophets} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-stories`} title="Histoires et moralités" books={stories} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-short`} title="Un récit en moins de 20 minutes" books={short} selected={selected?.id||''} onSelect={choose} items={items}/>
 {afterBooks}</PupitreBottom></Pupitre>;
}
