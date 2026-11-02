import {useEffect,useRef,useState} from 'react';
import {AudioLines,Repeat2,X} from 'lucide-react';
import {MUSHAF_RECITERS} from '../../../lib/quranApi';
import {audioTime} from '../../../lib/readerAudioPractice';
import type {Ayah} from '../../../types';
import type {MushafAudioState} from '../hooks/useMushafAudio';
import type {ReaderAudioPractice} from './useReaderAudioPractice';
import './ReaderAudioTools.css';

export function ReaderAudioTools({audio,practice,onCompare,compact=false}:{audio:MushafAudioState;practice:ReaderAudioPractice;onCompare:()=>void;compact?:boolean}){
    const latest=useRef(audio);latest.current=audio;
    const [clock,setClock]=useState({time:0,start:0,end:0});
    useEffect(()=>{
        const el=audio.audioRef.current;if(!el)return;
        const update=()=>{const bounds=latest.current.seekWindow();setClock({time:el.currentTime||0,start:bounds?.start||0,end:bounds?.end||0});};
        update();const events=['timeupdate','loadedmetadata','durationchange','seeked','emptied'];
        events.forEach(event=>el.addEventListener(event,update));
        const timer=audio.audioPlaying?setInterval(update,250):undefined;
        return()=>{events.forEach(event=>el.removeEventListener(event,update));if(timer)clearInterval(timer);};
    },[audio.audioRef,audio.currentPlayingAyah,audio.audioPlaying,audio.passage]);
    const range=audio.passage,position=`${audio.currentSurahRef.current}:${audio.currentAyahRef.current}`;
    return <section className={`iq-audio-tools ${compact?'is-compact':''}`} aria-label="Commandes audio du passage">
        {audio.audioActive&&<div className="iq-audio-clock">
            <label><span>Verset {position}{range&&` · ${range.iteration}/${range.repetitions}`}</span><span>{audioTime(clock.time-clock.start)} / {clock.end>clock.start?audioTime(clock.end-clock.start):'—:—'}</span>
                <input type="range" dir="ltr" aria-label={`Position audio du verset ${position}`} aria-valuetext={`${audioTime(clock.time-clock.start)} sur ${audioTime(clock.end-clock.start)}`} min={clock.start} max={clock.end>clock.start?clock.end:clock.start+1} step={.1} value={Math.max(clock.start,Math.min(clock.time,clock.end||clock.start))} disabled={clock.end<=clock.start||audio.passageComplete||!!audio.recitationPause} onChange={e=>{audio.seekTo(Number(e.target.value));setClock(c=>({...c,time:Number(e.target.value)}));}}/>
            </label>
        </div>}
        <div className="iq-audio-quick">
            <button className={practice.a?'is-marked':''} aria-label={practice.a?'Replacer le point A':'Placer le point A'} disabled={!audio.audioActive||audio.passageComplete||practice.busy} onClick={practice.markA}><Repeat2 size={15}/>{practice.a?'A ✓':'A'}</button>
            <button className={practice.b?'is-marked':''} aria-label="Placer le point B et répéter" disabled={!practice.a||!audio.audioActive||audio.passageComplete||practice.busy} onClick={()=>void practice.markB()}>{practice.busy?'…':practice.b?'B ✓':'B'}</button>
            {practice.a&&<><select aria-label="Répétitions A–B" value={practice.repetitions} onChange={e=>practice.changeRepetitions(Number(e.target.value))} disabled={practice.busy}>{[2,3,5,10,20].map(n=><option key={n} value={n}>×{n}</option>)}</select><button aria-label="Annuler les repères A–B" onClick={()=>{if(practice.b)audio.stopAudio();practice.cancel();}}><X size={15}/></button></>}
            <button className="iq-compare-shortcut" aria-label="Comparer les récitateurs" onClick={onCompare}><AudioLines size={16}/><span>Voix</span></button>
        </div>
        {practice.a&&!practice.b&&<small role="status">A · {practice.a.verse.surah}:{practice.a.verse.numberInSurah} à {audioTime(practice.a.offset)} — touchez B à la fin souhaitée.</small>}
        {practice.comparison&&<div className="iq-compare-status" role="status"><span>{MUSHAF_RECITERS.find(r=>r.id===practice.comparison!.voices[practice.comparison!.index])?.name} · {practice.comparison.index+1}/{practice.comparison.voices.length}</span><button onClick={practice.keepVoice}>Garder cette voix</button></div>}
        {practice.error&&<small role="alert">{practice.error}</small>}
    </section>;
}

export function ReaderVoiceChoices({verses,currentReciter,onStart}:{verses:Ayah[];currentReciter:string;onStart:(voices:string[],verses:Ayah[])=>void}){
    const [voices,setVoices]=useState(()=>[currentReciter,MUSHAF_RECITERS.find(r=>r.id!==currentReciter)!.id]);
    const first=verses[0],last=verses.at(-1);
    return <div className="iq-voice-choices"><p>{first?`Le même passage ${first.surah}:${first.numberInSurah}${last&&last.number!==first.number?`–${last.numberInSurah}`:''}, récité en entier par chaque voix choisie.`:'Sélectionnez un verset dans le Mushaf.'}</p><fieldset><legend>Choisir au moins deux récitateurs</legend>{MUSHAF_RECITERS.map(r=><label key={r.id}><input type="checkbox" checked={voices.includes(r.id)} onChange={()=>setVoices(v=>v.includes(r.id)?v.filter(id=>id!==r.id):[...v,r.id])}/><span>{r.name}</span><small>{voices.includes(r.id)?voices.indexOf(r.id)+1:''}</small></label>)}</fieldset><p className="iq-voice-note">Comparaison des versets entiers. Les repères au mot et la traduction suivent l’enregistrement de chaque récitateur.</p><button className="iq-primary" disabled={voices.length<2||!first} onClick={()=>onStart(voices,verses)}>Écouter les {voices.length} voix</button></div>;
}
