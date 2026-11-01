import {Pause,Play,Square,CarFront} from 'lucide-react';
import {useNativeCarPlayback,carPlaybackCommand} from '../../lib/nativeCarPlayback';
import './CarPlaybackBar.css';

export function CarPlaybackBar(){
 const state=useNativeCarPlayback();
 if(!state.active)return null;
 return <aside className="car-playback-bar" aria-label="Lecture CarPlay en cours"><CarFront size={21}/><div><strong>{state.title}</strong><small>{state.error||'Lecture CarPlay'}</small></div><button aria-label={state.playing?'Mettre CarPlay en pause':'Reprendre la lecture CarPlay'} onClick={()=>void carPlaybackCommand(state.playing?'pause':'play')}>{state.playing?<Pause size={21}/>:<Play size={21}/>}</button><button aria-label="Arrêter la lecture CarPlay" onClick={()=>void carPlaybackCommand('stop')}><Square size={18}/></button></aside>;
}
