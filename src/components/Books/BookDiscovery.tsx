import {BookCoverArt} from './BookCoverArt';
import {useEffect,useRef,useMemo,type ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {BookOpen,Headphones,ChevronLeft,ChevronRight} from 'lucide-react';
import {usePageState} from '../../hooks/usePageState';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {Pupitre,PupitreTop,PupitreBottom} from '../Pupitre/Pupitre';
import {bookHref,bookOrigins,isCompanionBook,recordingsForBook,resumeRecording,chapterForAudio,type BookSummary} from '../../lib/bookLibrary';
import type {LibraryAudio} from '../../lib/audioProduction';
import './BookDiscovery.css';

function BookRail({id,title,books,selected,onSelect,items}:{id:string;title:string;books:BookSummary[];selected:string;onSelect:(id:string)=>void;items:LibraryAudio[]}){
 const ref=useRef<HTMLDivElement>(null),[offset,setOffset]=usePageState(`rail-${id}`,0);
 const pendingOffset=useRef(offset),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>{if(ref.current)ref.current.scrollLeft=offset;return()=>{if(timer.current)clearTimeout(timer.current);setOffset(pendingOffset.current);};},[]); // Save after a swipe, never rerender every scroll event.
 const saveOffset=(value:number)=>{pendingOffset.current=value;if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setOffset(pendingOffset.current),150);};
 if(!books.length)return null;
 return <section className="book-rail"><header><h3>{title}</h3><div><button aria-label={`Faire défiler ${title} vers la gauche`} onClick={()=>ref.current?.scrollBy({left:-300,behavior:'smooth'})}><ChevronLeft size={18}/></button><button aria-label={`Faire défiler ${title} vers la droite`} onClick={()=>ref.current?.scrollBy({left:300,behavior:'smooth'})}><ChevronRight size={18}/></button></div></header><div ref={ref} className="book-rail-track" onScroll={e=>saveOffset(e.currentTarget.scrollLeft)}>{books.map((b,i)=>{const tracks=recordingsForBook(items,b),duration=tracks.reduce((n,t)=>n+t.duration,0);return <button key={b.id} className="book-jacket" aria-pressed={selected===b.id} aria-label={`Présenter ${b.title}`} onClick={()=>onSelect(b.id)}><BookCoverArt bookId={b.id}/><span className="book-jacket-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><span className="book-jacket-copy"><small>{b.chapters.length} CHAPITRES</small><strong>{b.title}</strong><span>{duration?`${Math.ceil(duration/60)} min · Audio & texte`:'Texte intégral'}</span></span></button>;})}</div></section>;
}
export function BookDiscovery({books,items,children,afterBooks,kind}:{books:BookSummary[];items:LibraryAudio[];children:ReactNode;afterBooks?:ReactNode;kind:string}){
 const hero=useRef<HTMLElement>(null);
 const choose=(id:string)=>{setSelection(id);if(hero.current?.closest('[data-pupitre-layout=plain]'))hero.current.scrollIntoView({block:'start',behavior:'smooth'});};
 const [selection,setSelection]=usePageState(`book-featured-${kind}`,''),navigate=useNavigate();
 const positions=useAudioLibraryStore(s=>s.positions),reading=useAudioLibraryStore(s=>s.bookReading);
 const selected=books.find(b=>b.id===selection)||books[0];
 const tracks=selected?recordingsForBook(items,selected):[],resume=resumeRecording(tracks,positions),duration=tracks.reduce((n,t)=>n+t.duration,0);
 const continued=useMemo(()=>books.filter(b=>reading[b.id]||recordingsForBook(items,b).some(t=>positions[t.id]?.seconds>0)),[books,items,reading,positions]);
 const companions=books.filter(isCompanionBook);
 const prophets=books.filter(b=>!companions.includes(b)&&bookOrigins[b.id]?.some(url=>url.startsWith('/prophets?prophet=')));
 const stories=books.filter(b=>!prophets.includes(b)&&!companions.includes(b));
 const short=books.filter(b=>{const t=recordingsForBook(items,b),d=t.reduce((n,t)=>n+t.duration,0);return d>0&&d<=20*60;});
 const enter=(mode:'read'|'listen')=>{if(!selected)return;let chapter=reading[selected.id];if(mode==='listen'){if(!resume)return;chapter=selected.chapters[chapterForAudio(resume,selected)]?.id;void useLibraryPlayer.getState().play(resume,{queue:tracks});}else useLibraryPlayer.getState().pause();navigate(bookHref(selected.id,chapter),{state:{bookView:mode}});};
 return <Pupitre title="Les livres de Quran Coach" activity="catalogue" className="book-discovery"><PupitreTop aria-label="Présentation du livre sélectionné">
 {selected?<section ref={hero} className="book-featured" aria-label="Livre sélectionné"><BookCoverArt key={selected.id} bookId={selected.id}/><div className="book-featured-copy"><span className="book-eyebrow">{selected.scope?.kind==='biography'?'UNE VIE À DÉCOUVRIR':'UNE HISTOIRE À VIVRE'}</span><h2>{selected.title}</h2><p>{selected.subtitle}</p><small>{selected.chapters.length} chapitres{duration>0?` · ${Math.ceil(duration/60)} minutes d’écoute`:''}</small><div className="book-featured-actions"><button onClick={()=>enter('read')}><BookOpen size={19}/>Lire</button><button disabled={!resume} onClick={()=>enter('listen')}><Headphones size={19}/>{resume&&positions[resume.id]?.seconds>2?'Reprendre l’écoute':'Écouter'}</button></div></div></section>:<p>Aucun livre ne correspond à cette recherche.</p>}
 </PupitreTop><PupitreBottom aria-label="Choisir votre prochaine histoire">{children}
 <BookRail id={`${kind}-continue`} title="Continuer votre voyage" books={continued} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-prophets`} title="Histoires des prophètes" books={prophets} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-companions`} title="Compagnons et compagnes" books={companions} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-stories`} title="Histoires et moralités" books={stories} selected={selected?.id||''} onSelect={choose} items={items}/>
 <BookRail id={`${kind}-short`} title="Un récit en moins de 20 minutes" books={short} selected={selected?.id||''} onSelect={choose} items={items}/>
 {afterBooks}</PupitreBottom></Pupitre>;
}
