import {useState} from 'react';
import {Play,Pause,X,ChevronUp,ChevronDown,RotateCcw,RotateCw} from 'lucide-react';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {mediaSessionOwner} from '../../lib/mediaSessionOwner';
import '../../pages/AudioLibrary.css';
const clock=(n:number)=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
export function LibraryPlayer(){
 const s=useLibraryPlayer(),[expanded,setExpanded]=useState(false);
 if(!s.item||mediaSessionOwner()!=='audio-library')return null;
 const current=s.item.sentences.find(mark=>s.position>=mark.start&&s.position<mark.end)?.sentence;
 const sentence=current===undefined?'':s.item.text.split(/(?<=[.!?])\s+/)[current];
 return <aside className="library-player" aria-label="Lecteur de la bibliothèque"><div className="library-player-bar"><button onClick={s.toggle} aria-label={s.playing?'Pause':'Lire'}>{s.playing?<Pause/>:<Play/>}</button><button className="library-player-title" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}><strong>{s.item.title}</strong><small>{s.loading?'Chargement…':`${clock(s.position)} / ${clock(s.duration)}`}</small></button><button onClick={()=>setExpanded(v=>!v)} aria-label={expanded?'Réduire':'Ouvrir les commandes'}>{expanded?<ChevronDown/>:<ChevronUp/>}</button><button aria-label="Fermer le lecteur" onClick={s.close}><X size={18}/></button></div>{s.error&&<p role="alert">{s.error}</p>}{expanded&&<div className="library-player-details"><input aria-label="Position de lecture" type="range" min="0" max={s.duration||1} value={Math.min(s.position,s.duration)} onChange={e=>s.seek(Number(e.target.value))}/><div className="audio-card-actions"><button aria-label="Reculer de 15 secondes" onClick={()=>s.seek(s.position-15)}><RotateCcw size={18}/> 15 s</button><button aria-label="Avancer de 15 secondes" onClick={()=>s.seek(s.position+15)}>15 s <RotateCw size={18}/></button><label>Vitesse<select value={s.rate} onChange={e=>s.setRate(Number(e.target.value))}>{[.75,1,1.25,1.5,1.75,2].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><label>Arrêt<select aria-label="Minuterie" value={s.deadline?'active':'0'} onChange={e=>s.sleep(Number(e.target.value))}>{s.deadline&&<option value="active">Programmé</option>}<option value="0">Fin de l’épisode</option>{[5,10,20,30].map(n=><option key={n} value={n}>{n} min</option>)}</select></label></div>{sentence&&<p className="audio-subtitle">{sentence}</p>}</div>}</aside>;
}
