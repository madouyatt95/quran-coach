import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {BookMarked,GripVertical} from 'lucide-react';
import {useStudyNotebook,type StudyInput} from '../../stores/studyNotebookStore';
import './StudyNotebook.css';
// Drag only a dedicated handle: reading and one-finger scrolling remain native.
let pending:StudyInput|null=null;
export function SaveExcerpt({entry,onSaved}:{entry:StudyInput;onSaved?:()=>void}){
 const saved=useStudyNotebook(s=>s.entries.some(e=>e.id===entry.id)),save=useStudyNotebook(s=>s.save),drag=useRef<number|null>(null),[moving,setMoving]=useState(false);
 useEffect(()=>()=>{if(drag.current!==null){pending=null;document.documentElement.removeAttribute('data-excerpt-drag');}},[]);
 const keep=()=>{save(entry);document.dispatchEvent(new CustomEvent('qc-excerpt-saved',{detail:entry.id}));onSaved?.();};
 const end=(x:number,y:number)=>{const target=document.elementFromPoint(x,y)?.closest('[data-study-drop]');if(target){keep();}pending=null;drag.current=null;setMoving(false);document.documentElement.removeAttribute('data-excerpt-drag');};
 return <span className="study-save"><button onClick={keep}><BookMarked size={16}/>{saved?'Dans mon carnet':'Garder dans mon carnet'}</button><button className="study-drag" aria-label="Glisser cet extrait vers le carnet" title="Glisser vers le carnet, ou utiliser Garder" onPointerDown={e=>{if(e.button!==0)return;drag.current=e.pointerId;pending=entry;e.currentTarget.setPointerCapture(e.pointerId);setMoving(true);document.documentElement.dataset.excerptDrag='true';}} onPointerUp={e=>{if(drag.current===e.pointerId)end(e.clientX,e.clientY);}} onPointerCancel={()=>{pending=null;drag.current=null;setMoving(false);document.documentElement.removeAttribute('data-excerpt-drag');}} onLostPointerCapture={()=>{pending=null;drag.current=null;setMoving(false);document.documentElement.removeAttribute('data-excerpt-drag');}}><GripVertical size={17}/></button>{moving&&<span role="status">Déposez dans le carnet</span>}</span>;
}
export function StudyNotebook({compact=false}:{compact?:boolean}){
 const store=useStudyNotebook(),[chosen,setChosen]=useState<string|null>(null),[notice,setNotice]=useState('');
 useEffect(()=>{const saved=(event:Event)=>{setChosen((event as CustomEvent<string>).detail);setNotice('Extrait conservé.');};document.addEventListener('qc-excerpt-saved',saved);return()=>document.removeEventListener('qc-excerpt-saved',saved);},[]);
 const selected=store.entries.find(e=>e.id===chosen)||store.entries[0];
 return <section className={`study-notebook ${compact?'is-compact':''}`} data-study-drop aria-label="Mon carnet d’étude" onDragOver={e=>{if(pending)e.preventDefault();}} onDrop={e=>{e.preventDefault();if(pending){store.save(pending);setChosen(pending.id);pending=null;setNotice('Extrait conservé.');}}}>
 <header><BookMarked size={20}/><h3>Mon carnet d’étude</h3><span>{store.entries.length}</span></header><p className="study-drop-hint">Déposez un extrait ici, ou choisissez « Garder dans mon carnet ».</p>{notice&&<p role="status">{notice}</p>}
 {store.entries.length>0&&<><label>Mes passages<select value={selected?.id||''} onChange={e=>setChosen(e.target.value)}>{store.entries.map(e=><option key={e.id} value={e.id}>{e.title} · {e.reference}</option>)}</select></label>{selected&&<article key={selected.id}><small>{selected.reference}</small><blockquote>{selected.text}</blockquote><label>Ma réflexion<textarea maxLength={3000} value={selected.note} placeholder="Ce que je retiens, ce que je souhaite approfondir…" onChange={e=>store.annotate(selected.id,e.target.value)}/></label><small>Enregistré sur cet appareil.</small><footer><Link to={selected.href}>Retrouver le passage ↗</Link><button onClick={()=>{store.remove(selected.id);setChosen(null);}}>Retirer du carnet</button></footer></article>}</>}
 {!store.entries.length&&<p>Votre premier passage gardera son texte, sa référence et votre note personnelle.</p>}
 </section>;
}
export function StudyNotebookPage(){return <main className="study-notebook-page"><Link to="/">← Accueil</Link><h1>Mon carnet</h1><StudyNotebook/><Link to="/journeys/notebook">Retrouver mes autres carnets et parcours →</Link></main>;}
