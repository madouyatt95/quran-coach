import {Pause,Play,RotateCcw,RotateCw} from 'lucide-react';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {chapterPlayback} from '../../lib/bookLibrary';
const clock=(n:number)=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
/** The same player and chapter timeline as the mini-player; no second audio element. */
export function BookConsole({own,title,onStart,available,compact=false}:{own:boolean;title:string;onStart:()=>void;available:boolean;compact?:boolean}){
 const p=useLibraryPlayer();
 const progress=own&&p.item?chapterPlayback(p.item,p.queue,p.position):null;
 return <section className="pupitre-console" data-book-console-active={own?'true':'false'} aria-label="Console audio du livre">
  <div className="pupitre-console-title"><div><strong>{title}</strong><small>{own&&p.loading?'Chargement…':own&&p.playing?'Écoute en cours':'À votre rythme'}</small></div></div>
  <div className="pupitre-transport"><button disabled={!progress} aria-label="Reculer de 15 secondes" onClick={()=>progress&&p.seekChapter(progress.seconds-15)}><RotateCcw size={25}/><span>15 secondes</span></button><button className="pupitre-play" disabled={!own&&!available} onClick={own?p.toggle:onStart} aria-label={own&&p.playing?'Mettre le livre en pause':'Écouter ce chapitre'}>{own&&p.playing?<Pause/>:<Play/>}<span>{own&&p.playing?'Pause':own?'Reprendre':'Écouter'}</span></button><button disabled={!progress} aria-label="Avancer de 15 secondes" onClick={()=>progress&&p.seekChapter(progress.seconds+15)}><RotateCw size={25}/><span>15 secondes</span></button></div>
  <div className="pupitre-timeline"><input disabled={!progress} type="range" aria-label="Position dans le chapitre" min={0} max={progress?.duration||1} step={1} value={Math.min(progress?.seconds||0,progress?.duration||1)} onChange={e=>p.seekChapter(Number(e.target.value))}/><div><span>{clock(progress?.seconds||0)}</span><span>{clock(progress?.duration||0)}</span></div></div>
 {own&&p.nextBook&&<div className="book-console-next" role="status"><span>{p.nextBookAt?'Le prochain livre va commencer':'À suivre'} : <strong>{p.nextBook.book.title}</strong></span><button onClick={p.cancelNextBook} aria-label="Annuler le prochain livre">Annuler</button>{p.nextBookAt>0&&<button onClick={p.playNextBook}>Écouter maintenant</button>}</div>}
  {!compact&&<BookAudioSettings/>}
  {own&&p.error&&<p role="alert">{p.error}</p>}
 </section>;
}
export function BookAudioSettings(){const p=useLibraryPlayer(),autoNextBook=useAudioLibraryStore(s=>s.autoNextBook);return <><div className="pupitre-console-options"><label>Vitesse<select value={p.rate} aria-label="Vitesse de narration" onChange={e=>p.setRate(Number(e.target.value))}>{[.75,1,1.25,1.5,1.75,2].map(n=><option key={n} value={n}>{n} ×</option>)}</select></label><label>Minuterie<select aria-label="Minuterie du livre" value={p.deadline?'active':'0'} onChange={e=>p.sleep(Number(e.target.value))}>{p.deadline&&<option value="active">Arrêt programmé</option>}<option value="0">Sans minuterie</option>{[5,10,20,30].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></label></div><label><input type="checkbox" checked={p.stopAtChapter} onChange={e=>p.setStopAtChapter(e.target.checked)}/> Arrêter à la fin du chapitre</label><label><input type="checkbox" checked={autoNextBook} onChange={e=>p.setAutoNextBook(e.target.checked)}/> Enchaîner les livres</label></>;}
