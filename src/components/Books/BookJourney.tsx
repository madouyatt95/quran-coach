import {lazy,Suspense,useMemo,useState} from 'react';
import {BookOpen,Headphones,MapPin,Radio} from 'lucide-react';
import {bookSceneCues,type BookPassage} from '../../lib/bookPassages';
import {journeyDate,scenePlaces} from '../../lib/bookJourney';
import {peopleInText,type BookPerson} from '../../lib/bookPeople';
import {sourceLabel,type NarrativeBook,type NarrativeChapter,type NarrativeSource} from '../../lib/narrativeBooks';
import type {LibraryAudio} from '../../lib/audioProduction';
import './BookJourney.css';
const JourneyMap=lazy(()=>import('./BookJourneyMap'));
export function BookJourney({book,chapter,recordings,active,onRead,onListen,onSource,onPerson}:{book:NarrativeBook;chapter:NarrativeChapter;recordings:LibraryAudio[];active:number;onRead:(p:BookPassage)=>void;onListen:(p:BookPassage)=>void;onSource:(s:NarrativeSource)=>void;onPerson:(p:BookPerson)=>void}){
 const cues=useMemo(()=>bookSceneCues(book,chapter,recordings),[book,chapter,recordings]);
 const [exploring,setExploring]=useState<number|null>(null),[mapOpen,setMapOpen]=useState(false),[chosenPlace,setChosenPlace]=useState<string|null>(null);
 const cue=cues[Math.min(Math.max(exploring??active,0),cues.length-1)];
 const places=useMemo(()=>cue?scenePlaces(cue.scene):[],[cue]);
 if(!cue)return null;
 const date=journeyDate(book,chapter),people=peopleInText(cue.scene.paragraphs.map(p=>p.text).join(' '));
 const sourceIds=new Set(cue.scene.paragraphs.flatMap(p=>p.sources)),sources=book.sources.filter(s=>sourceIds.has(s.id));
 const place=places.find(p=>p.id===chosenPlace);
 return <section className="book-journey" aria-label="Parcours documentaire"><header><div><span className="book-eyebrow">PARCOURS DOCUMENTAIRE</span><h3>Dans les pas du récit</h3></div><button aria-pressed={exploring===null} onClick={()=>{setExploring(null);setChosenPlace(null);}}><Radio size={16}/>{exploring===null?'Suivi du passage':'Revenir au passage'}</button></header>
 <nav className="book-journey-timeline" aria-label="Scènes dans l’ordre du récit">{cues.map(c=><button key={c.scene.id} aria-current={cue.index===c.index?'step':undefined} onClick={()=>{setExploring(c.index);setChosenPlace(null);}}><span>{String(c.index+1).padStart(2,'0')}</span><strong>{c.scene.title}</strong>{active===c.index&&<small>Passage actuel</small>}</button>)}</nav>
 <article className="book-journey-detail"><span className="book-eyebrow">{date?date.label:`Chapitre ${book.chapters.indexOf(chapter)+1} · scène ${cue.index+1}`}</span><h4>{cue.scene.title}</h4>
 <div className="book-passage-actions"><button disabled={!cue.passage} onClick={()=>{setExploring(null);if(cue.passage)onRead(cue.passage);}}><BookOpen size={16}/>Lire ici</button><button disabled={!cue.mark||!cue.passage} onClick={()=>{setExploring(null);if(cue.passage)onListen(cue.passage);}}><Headphones size={16}/>Écouter ici</button></div>
 {places.length>0?<><button className="book-journey-map-toggle" aria-expanded={mapOpen} onClick={()=>setMapOpen(!mapOpen)}><MapPin size={16}/>{mapOpen?'Masquer la carte':'Situer les lieux évoqués'}</button>{mapOpen&&<Suspense fallback={<p role="status">Ouverture de la carte…</p>}><JourneyMap places={places} onChoose={setChosenPlace}/></Suspense>}<div className="book-passage-actions">{places.map(p=><button key={p.id} aria-pressed={chosenPlace===p.id} onClick={()=>setChosenPlace(chosenPlace===p.id?null:p.id)}>{p.name}</button>)}</div>{place&&<aside><blockquote>{place.evidence.text}</blockquote><a href={place.source} target="_blank" rel="noreferrer">Repère géographique · GeoNames ↗</a></aside>}<small>Villes citées dans ce passage, situées par leur centre actuel. Aucun itinéraire historique n’est reconstitué.</small></>:<p className="book-journey-empty">Ce passage ne dispose pas de lieu cartographié vérifié.</p>}
 {people.length>0&&<div className="book-passage-actions" aria-label="Personnes citées">{people.map(p=><button key={p.id} onClick={()=>onPerson(p)}>{p.name}</button>)}</div>}
 <details><summary>Les sources de cette scène · {sources.length}</summary>{date&&<blockquote>{date.quote}</blockquote>}<div className="book-passage-actions">{sources.map(s=><button key={s.id} onClick={()=>onSource(s)}>{sourceLabel(s)}</button>)}</div>{!sources.length&&<p>Aucune référence liée à cette scène.</p>}</details>
 </article></section>;
}
