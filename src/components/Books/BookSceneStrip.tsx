import {useMemo} from 'react';
import {BookOpen,Headphones} from 'lucide-react';
import {bookSceneCues,type BookPassage} from '../../lib/bookPassages';
import {chapterPlayback,sceneTreatment} from '../../lib/bookLibrary';
import type {NarrativeBook,NarrativeChapter} from '../../lib/narrativeBooks';
import type {LibraryAudio} from '../../lib/audioProduction';
import {BookLandscape} from './BookLandscape';
const clock=(n:number)=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
export function BookSceneStrip({book,chapter,recordings,active,onRead,onListen}:{book:NarrativeBook;chapter:NarrativeChapter;recordings:LibraryAudio[];active:number;onRead:(passage:BookPassage)=>void;onListen:(passage:BookPassage)=>void}){
 const cues=useMemo(()=>bookSceneCues(book,chapter,recordings),[book,chapter,recordings]);
 return <section className="book-scene-browser" aria-label="Explorer les scènes du chapitre"><h3>Au fil du récit</h3><div className="book-scene-strip">{cues.map(({scene,index,passage,mark})=><article key={scene.id} className={active===index?'is-current':''}>
  <button className="book-scene-preview" disabled={!passage} aria-label={`Lire la scène ${index+1} : ${scene.title}`} aria-current={active===index?'step':undefined} onClick={()=>passage&&onRead(passage)}><BookLandscape scene={(scene.treatment||sceneTreatment(book.id,book.chapters.indexOf(chapter),index)).decor}/><span>{String(index+1).padStart(2,'0')}</span></button>
  <strong>{scene.title}</strong><div><button disabled={!passage} onClick={()=>passage&&onRead(passage)}><BookOpen size={14}/>Lire</button><button aria-label={`Écouter la scène ${index+1} : ${scene.title}`} disabled={!mark||!passage} onClick={()=>passage&&onListen(passage)}><Headphones size={14}/>{mark?clock(chapterPlayback(mark.item,recordings,mark.seconds).seconds):'Sans repère audio'}</button></div>
 </article>)}</div></section>;
}
