import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, Repeat2, SkipBack, SkipForward, X } from 'lucide-react';
import type { MushafAudioState } from './hooks/useMushafAudio';
import type { Ayah } from '../../types';

export function MushafAudioPlayer({audio, ayahs}: {audio:MushafAudioState;ayahs:Ayah[]}) {
    const [open,setOpen] = useState(false);
    const [start,setStart] = useState('1');
    const [end,setEnd] = useState('1');
    const [count,setCount] = useState('3');
    const [error,setError] = useState('');
    const dialog = useRef<HTMLDialogElement>(null);
    const range = audio.passage;
    const verse = ayahs.find(a=>a.number === audio.currentPlayingAyah);
    const max = ayahs.at(-1)?.numberInSurah ?? 1;
    useEffect(()=>{
        if (!open) return;
        const previous = document.activeElement as HTMLElement | null;
        const element = dialog.current;
        element?.showModal();
        return ()=>{element?.close();previous?.focus({preventScroll:true});};
    },[open]);
    useEffect(()=>{if(!audio.audioActive)setOpen(false);},[audio.audioActive]);
    if (!audio.audioActive) return null;
    return <div className="mih-header-player text-audio-player">
        <div className="text-audio-player__info">
            <strong>Verset {audio.currentSurahRef.current}:{audio.currentAyahRef.current}</strong>
            <span role="status">{audio.audioError || (audio.passageComplete ? `Passage terminé · ${range?.repetitions} écoute${range?.repetitions === 1 ? '' : 's'}` : range ? `${range.startAyah}–${range.endAyah} · Écoute ${range.iteration}/${range.repetitions}` : audio.audioPlaying ? 'Lecture en cours' : 'En pause')}</span>
        </div>
        <div className="text-audio-player__controls">
            <button aria-label="Écouter le verset précédent" onClick={audio.playPrevAyah} disabled={audio.playingIndex<=0 || !!(range && verse && verse.numberInSurah<=range.startAyah)}><SkipBack size={17}/></button>
            <button className="text-audio-player__play" aria-label={audio.audioPlaying ? 'Mettre en pause' : audio.passageComplete ? 'Réécouter le passage' : 'Reprendre l’écoute'} onClick={audio.toggleAudio}>{audio.audioPlaying ? <Pause size={18}/> : <Play size={18}/>}</button>
            <button aria-label="Écouter le verset suivant" onClick={audio.playNextAyah} disabled={!!(range && verse && verse.numberInSurah>=range.endAyah && range.iteration>=range.repetitions) || (!range && audio.currentSurahRef.current===114 && audio.playingIndex>=ayahs.length-1)}><SkipForward size={17}/></button>
            <button aria-label={`Vitesse d’écoute : ${audio.playbackSpeed} fois`} onClick={()=>audio.setPlaybackSpeed(s=>s>=2?.5:s+.25)}>{audio.playbackSpeed}×</button>
            <button aria-label="Répéter un verset ou un passage" aria-pressed={!!range} onClick={()=>{const first=range?.startAyah??verse?.numberInSurah??1;setStart(String(first));setEnd(String(range?.endAyah??first));setCount(String(range?.repetitions??3));setError('');setOpen(true);}}><Repeat2 size={18}/></button>
            <button aria-label="Arrêter l’écoute" onClick={audio.stopAudio}><X size={17}/></button>
        </div>
        {open && createPortal(<dialog ref={dialog} className="text-reader-settings text-audio-settings" aria-labelledby="audio-passage-title" onCancel={()=>setOpen(false)} onKeyDown={e=>e.stopPropagation()}>
            <header><div><small>ÉCOUTE · SOURATE {verse?.surah}</small><h2 id="audio-passage-title">Répéter un passage</h2></div><button aria-label="Fermer les options audio" onClick={()=>setOpen(false)}><X size={20}/></button></header>
            <form onSubmit={e=>{e.preventDefault();if(audio.startPassage(Number(start),Number(end),Number(count)))setOpen(false);else setError(`Choisissez des versets de 1 à ${max}, dans l’ordre.`);}}>
                <div className="text-reader-settings__body">
                    <p>Le passage sera écouté en entier à chaque répétition, puis l’audio s’arrêtera.</p>
                    <div className="text-audio-fields"><label>Du verset<input autoFocus type="number" inputMode="numeric" min="1" max={max} required value={start} onChange={e=>setStart(e.target.value)}/></label><label>Au verset<input type="number" inputMode="numeric" min={Number(start)||1} max={max} required value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
                    <label className="text-audio-count">Nombre d’écoutes<select value={count} onChange={e=>setCount(e.target.value)}>{[1,2,3,5,10,20].map(n=><option key={n} value={n}>{n} fois</option>)}</select></label>
                    <p className="text-audio-hint">Pour répéter un seul verset, indiquez le même numéro dans les deux champs.</p>
                    {error && <p role="alert">{error}</p>}
                </div>
                <footer><button type="submit">Écouter le passage</button></footer>
            </form>
        </dialog>,document.body)}
    </div>;
}
