import {useState,useRef} from 'react';
import {Play,Pause,RotateCcw} from 'lucide-react';
export function AudioPlayer({url,onListened}:{url:string;onListened?:()=>void}){
 const ref=useRef<HTMLAudioElement>(null);const [playing,setPlaying]=useState(false),[error,setError]=useState(false),[loading,setLoading]=useState(true);
 const play=async()=>{const audio=ref.current;if(!audio)return;try{if(error){setError(false);setLoading(true);audio.load();}if(playing)audio.pause();else await audio.play();}catch{setError(true);setPlaying(false);}};
 return <section className="qx quiz-audio" style={{textAlign:'center',paddingBottom:12}}><audio key={url} ref={ref} src={url} preload="auto" onCanPlay={()=>setLoading(false)} onPlaying={()=>{setLoading(false);setPlaying(true);}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);onListened?.();}} onError={()=>{setError(true);setLoading(false);}}/><button aria-label={error?'Réessayer l’audio':playing?'Mettre en pause':'Écouter l’extrait'} onClick={()=>void play()}>{error?<RotateCcw size={26}/>:playing?<Pause size={26}/>:<Play size={26}/>}</button><p role="status">{error?'L’extrait n’a pas pu être chargé. Réessaie avec une connexion.':playing?'Écoute l’extrait…':loading?'Chargement de l’extrait…':'Appuie pour écouter'}</p></section>;
}
