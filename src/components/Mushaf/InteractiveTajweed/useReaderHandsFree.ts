import {useEffect,useId,useRef} from 'react';
import {claimMediaSession,mediaSessionOwner,releaseMediaSession} from '../../../lib/mediaSessionOwner';
import {readerShortcut} from '../../../lib/readerShortcuts';
import type {MushafAudioState} from '../hooks/useMushafAudio';
const actions:MediaSessionAction[]=['play','pause','stop','nexttrack','previoustrack','seekto','seekbackward','seekforward'];
export function useReaderHandsFree({audio,enabled,blocked,title,voice,next,previous,toggle,stop}:{audio:MushafAudioState;enabled:boolean;blocked:boolean;title:string;voice:string;next:()=>void;previous:()=>void;toggle:()=>void;stop:()=>void}){
    const id=useId(),owner=`mushaf-${id}`,latest=useRef({audio,enabled,blocked,next,previous,toggle,stop});latest.current={audio,enabled,blocked,next,previous,toggle,stop};
    useEffect(()=>{
        if(!enabled)return;
        const onKey=(event:KeyboardEvent)=>{
            const s=latest.current,action=readerShortcut(event,s.blocked||!!document.querySelector('dialog[open]'));
            if(!action)return;event.preventDefault();if(action==='next')s.next();else if(action==='previous')s.previous();else s.toggle();
        };
        window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
    },[enabled]);
    useEffect(()=>{
        const media=navigator.mediaSession;if(!media||!enabled||!audio.audioActive)return;
        claimMediaSession(owner);
        if(typeof MediaMetadata!=='undefined')media.metadata=new MediaMetadata({title,artist:voice,album:'Quran Coach · Mushaf'});
        const current=()=>latest.current;
        const running=()=>current().audio.audioPlaying||!!current().audio.recitationPause&&!current().audio.recitationPause!.paused;
        const handlers:Partial<Record<MediaSessionAction,MediaSessionActionHandler>>={
            play:()=>{if(!running())current().toggle();},pause:()=>{if(running())current().toggle();},stop:()=>current().stop(),
            nexttrack:()=>{if(!current().blocked)current().next();},previoustrack:()=>{if(!current().blocked)current().previous();},
            seekto:d=>{if(d.seekTime!==undefined)current().audio.seekTo(d.seekTime);},
            seekbackward:d=>current().audio.seekTo((current().audio.audioRef.current?.currentTime||0)-(d.seekOffset??5)),
            seekforward:d=>current().audio.seekTo((current().audio.audioRef.current?.currentTime||0)+(d.seekOffset??5)),
        };
        for(const action of actions)try{media.setActionHandler(action,handlers[action]!);}catch{/* Optional hardware/browser command. */}
        const element=audio.audioRef.current;
        const update=()=>{
            if(mediaSessionOwner()!==owner)return;
            media.playbackState=running()?'playing':'paused';
            if(element&&Number.isFinite(element.duration)&&element.duration>0)try{media.setPositionState?.({duration:element.duration,position:Math.max(0,Math.min(element.currentTime,element.duration)),playbackRate:element.playbackRate});}catch{/* File metadata is changing. */}
        };
        update();const events=['timeupdate','play','pause','durationchange','ratechange','seeked'];events.forEach(e=>element?.addEventListener(e,update));
        return()=>{
            events.forEach(e=>element?.removeEventListener(e,update));
            if(mediaSessionOwner()!==owner)return;
            releaseMediaSession(owner);for(const action of actions)try{media.setActionHandler(action,null);}catch{/* Unsupported. */}
            media.metadata=null;media.playbackState='none';try{media.setPositionState?.();}catch{/* Unsupported. */}
        };
    },[enabled,audio.audioActive,audio.audioPlaying,audio.recitationPause?.paused,audio.currentPlayingAyah,audio.audioRef,owner,title,voice]);
}
