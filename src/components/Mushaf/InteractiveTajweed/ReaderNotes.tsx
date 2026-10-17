import {useState} from 'react';
import {MessageSquare,ArrowUpRight} from 'lucide-react';
import {NOTE_LABELS,useReaderNotesStore,type ReaderNote,type NoteKind} from '../../../stores/readerNotesStore';
import type {Ayah} from '../../../types';
export function NoteEditor({verse,onDone}:{verse:Ayah;onDone:()=>void}){
    const saved=useReaderNotesStore.getState().notes[`${verse.surah}:${verse.numberInSurah}`];
    const [kind,setKind]=useState<NoteKind>(saved?.kind||'personal'),[text,setText]=useState(saved?.text||'');
    return <form className="iq-note-editor" onSubmit={e=>{e.preventDefault();useReaderNotesStore.getState().save({surah:verse.surah,ayah:verse.numberInSurah,page:verse.page,kind,text});onDone();}}>
        <p>Verset {verse.surah}:{verse.numberInSurah} · page {verse.page}</p><fieldset><legend>Repère personnel</legend>{Object.entries(NOTE_LABELS).map(([value,label])=><label key={value}><input type="radio" name="note-kind" value={value} checked={kind===value} onChange={()=>setKind(value as NoteKind)}/>{label}</label>)}</fieldset>
        <label>Votre note<textarea aria-label="Votre note" rows={5} maxLength={2000} value={text} onChange={e=>setText(e.target.value)} placeholder="Ce que je souhaite retenir ou approfondir…"/></label><small>{text.length}/2000 · Enregistré sur cet appareil</small><button className="iq-primary" type="submit">Enregistrer</button>{saved&&<button type="button" onClick={()=>{useReaderNotesStore.getState().remove(`${verse.surah}:${verse.numberInSurah}`);onDone();}}>Retirer cette annotation</button>}
    </form>;
}
export function NotesNotebook({onOpen,onGo}:{onOpen:(n:ReaderNote)=>void;onGo:(n:ReaderNote)=>void}){
    const notes=useReaderNotesStore(s=>s.notes),[filter,setFilter]=useState('');
    const all=Object.values(notes).sort((a,b)=>a.page-b.page||a.ayah-b.ayah),visible=all.filter(n=>`${n.surah}:${n.ayah} ${n.text} ${NOTE_LABELS[n.kind]}`.toLowerCase().includes(filter.toLowerCase()));
    return <div className="iq-notebook"><label>Rechercher dans mes notes<input value={filter} onChange={e=>setFilter(e.target.value)} type="search"/></label>{!all.length?<p>Un appui long sur un verset, puis « Autres actions » → « Annoter », permet de garder une note dans sa marge.</p>:!visible.length?<p>Aucune note ne correspond à cette recherche.</p>:visible.map(n=><article key={`${n.surah}:${n.ayah}`}><button onClick={()=>onOpen(n)}><MessageSquare size={17}/><span><strong>{NOTE_LABELS[n.kind]} · {n.surah}:{n.ayah}</strong><p>{n.text||'Repère enregistré'}</p></span></button><button aria-label={`Rejoindre le verset ${n.surah}:${n.ayah}`} onClick={()=>onGo(n)}><ArrowUpRight size={18}/>p. {n.page}</button></article>)}</div>;
}
