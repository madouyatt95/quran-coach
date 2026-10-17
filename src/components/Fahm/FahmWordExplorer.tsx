import {useEffect,useRef,useState} from 'react';
import {loadHifdhStudyWords} from '../../lib/hifdhWordStudy';
import type {MushafWord} from '../../lib/interactiveMushaf/model';
import {FRENCH_SOURCE} from '../../lib/interactiveMushaf/french';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
export function FahmWordExplorer({surah,ayah,text}:{surah:number;ayah:number;text:string}){
 const [words,setWords]=useState<MushafWord[]>([]),[selected,setSelected]=useState<MushafWord|null>(null),[error,setError]=useState('');
 const audio=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>{let gone=false;void loadHifdhStudyWords(`${surah}:${ayah}`,text.trim().split(/\s+/)).then(items=>{if(!gone)setWords(items.map(i=>i.word));}).catch(()=>{if(!gone)setError('Le mot à mot est indisponible. Consultez la traduction du verset.');});return()=>{gone=true;audio.current?.pause();};},[surah,ayah,text]);
 const play=()=>{if(!selected?.audio)return;window.dispatchEvent(new Event('quran-stop-playback'));useAudioPlayerStore.getState().stop();audio.current?.pause();audio.current=new Audio(selected.audio);void audio.current.play().catch(()=>setError('La prononciation est indisponible. Réessayez.'));};
 return <div className="fahm-structure"><p>Touchez un mot pour son sens dans ce verset.</p><div className="fahm-structure__words" dir="rtl" lang="ar">{words.map(word=><button key={word.key} className="struct-word" aria-pressed={selected?.key===word.key} onClick={()=>setSelected(word)}>{word.text}</button>)}</div>{selected&&<div className="fahm-word-inline"><strong lang="ar" dir="rtl">{selected.text}</strong><p>{selected.french||'Consultez le sens dans la traduction complète.'}</p><p>{selected.transliteration}</p><button onClick={play} disabled={!selected.audio}>Écouter la prononciation</button></div>}{error&&<p role="alert">{error}</p>}<a href={FRENCH_SOURCE} target="_blank" rel="noreferrer">Français mot à mot · QUL</a></div>;
}
