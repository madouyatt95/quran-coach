import {lazy,Suspense,useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,MapPin,Users,BookOpen} from 'lucide-react';
import {bookSceneCues,type BookPassage} from '../../lib/bookPassages';
import {journeyDate,scenePlaces} from '../../lib/bookJourney';
import {peopleInText,type BookPerson} from '../../lib/bookPeople';
import {sourceLabel,type NarrativeBook,type NarrativeChapter,type NarrativeSource} from '../../lib/narrativeBooks';
import type {LibraryAudio} from '../../lib/audioProduction';
import './BookJourney.css';
const JourneyMap=lazy(()=>import('./BookJourneyMap'));
export function BookJourney({book,chapter,recordings,active,onRead,onListen,onSource,onPerson}:{book:NarrativeBook;chapter:NarrativeChapter;recordings:LibraryAudio[];active:number;onRead:(p:BookPassage)=>void;onListen:(p:BookPassage)=>void;onSource:(s:NarrativeSource)=>void;onPerson:(p:BookPerson)=>void}){
 const cues=useMemo(()=>bookSceneCues(book,chapter,recordings),[book,chapter,recordings]);
 const [exploring,setExploring]=useState<number|null>(null),[topic,setTopic]=useState<'context'|'places'|'people'|'sources'>('context'),[chosenPlace,setChosenPlace]=useState<string|null>(null);
 const cue=cues[Math.min(Math.max(exploring??active,0),cues.length-1)];
 const places=useMemo(()=>cue?scenePlaces(cue.scene):[],[cue]);
 if(!cue)return null;
 const date=journeyDate(book,chapter),people=peopleInText(cue.scene.paragraphs.map(p=>p.text).join(' '));
 const sourceIds=new Set(cue.scene.paragraphs.flatMap(p=>p.sources)),sources=book.sources.filter(s=>sourceIds.has(s.id));
 const place=places.find(p=>p.id===chosenPlace),currentTopic=topic==='places'&&!places.length||topic==='people'&&!people.length?'context':topic;
 const step=(index:number)=>{setExploring(index);setChosenPlace(null);setTopic('context');};
 return <section className="book-journey" aria-label="Explorer le récit"><header><div><span className="book-eyebrow">{exploring===null?'AVEC VOTRE LECTURE':'EXPLORATION LIBRE'} · {cue.index+1}/{cues.length}</span><h3>{cue.scene.title}</h3></div>{exploring!==null&&<button onClick={()=>setExploring(null)}>Suivre ma lecture</button>}</header>
 <nav className="book-journey-topics" aria-label="Comprendre ce passage"><button aria-pressed={currentTopic==='context'} onClick={()=>setTopic('context')}><BookOpen size={16}/>Le contexte</button>{places.length>0&&<button aria-pressed={currentTopic==='places'} onClick={()=>setTopic('places')}><MapPin size={16}/>Les lieux</button>}{people.length>0&&<button aria-pressed={currentTopic==='people'} onClick={()=>setTopic('people')}><Users size={16}/>Les personnes</button>}<button aria-pressed={currentTopic==='sources'} onClick={()=>setTopic('sources')}>Sources · {sources.length}</button></nav>
 <article className="book-journey-detail" key={`${cue.scene.id}:${currentTopic}`}>
 {currentTopic==='context'&&<>{date&&<small>{date.label}</small>}<p>{cue.scene.studyNote}</p><details><summary>Relire l’extrait du récit</summary><blockquote>{cue.scene.paragraphs[0]?.text}</blockquote></details></>}
 {currentTopic==='places'&&<><Suspense fallback={<p role="status">Ouverture de la carte…</p>}><JourneyMap places={places} onChoose={setChosenPlace}/></Suspense><div className="book-passage-actions">{places.map(p=><button key={p.id} aria-pressed={chosenPlace===p.id} onClick={()=>setChosenPlace(p.id)}>{p.name}</button>)}</div><small>Villes évoquées dans le texte · repères actuels, sans itinéraire reconstitué.</small>{place&&<aside><blockquote>{place.evidence.text}</blockquote><a href={place.source} target="_blank" rel="noreferrer">Référence géographique ↗</a></aside>}</>}
 {currentTopic==='people'&&<div className="book-journey-people">{people.map(p=><button key={p.id} onClick={()=>onPerson(p)}>{p.name} ↗</button>)}</div>}
 {currentTopic==='sources'&&<div className="book-journey-sources">{sources.map(s=><button key={s.id} onClick={()=>onSource(s)}>{sourceLabel(s)} ↗</button>)}{!sources.length&&<p>Aucune référence liée à ce passage.</p>}</div>}
 </article><footer><button aria-label="Scène précédente" disabled={cue.index===0} onClick={()=>step(cue.index-1)}><ChevronLeft size={18}/></button><span>{cue.index+1} / {cues.length}</span><button aria-label="Scène suivante" disabled={cue.index===cues.length-1} onClick={()=>step(cue.index+1)}><ChevronRight size={18}/></button>{exploring!==null&&cue.passage&&<><button onClick={()=>{setExploring(null);onRead(cue.passage!);}}>Lire ce passage</button><button disabled={!cue.mark} onClick={()=>{setExploring(null);onListen(cue.passage!);}}>Écouter ici</button></>}</footer></section>;
}
