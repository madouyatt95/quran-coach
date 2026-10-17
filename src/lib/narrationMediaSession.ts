import {claimMediaSession,mediaSessionOwner,releaseMediaSession} from './mediaSessionOwner';
const actions:MediaSessionAction[]=['play','pause','stop','seekbackward','seekforward','seekto'];
export function bindNarrationMedia(id:string,title:string,chapter:string,controls:{artist?:string;play:()=>void;pause:()=>void;seek:(seconds:number,relative?:boolean)=>void}) {
 if(!navigator.mediaSession)return;
 claimMediaSession(id);
 if(typeof MediaMetadata!=='undefined')navigator.mediaSession.metadata=new MediaMetadata({title:chapter,artist:controls.artist||'Quran Coach · Narration française',album:title});
 const handlers:Partial<Record<MediaSessionAction,MediaSessionActionHandler>>={play:controls.play,pause:controls.pause,stop:controls.pause,seekbackward:d=>controls.seek(-(d.seekOffset??15),true),seekforward:d=>controls.seek(d.seekOffset??15,true),seekto:d=>{if(d.seekTime!==undefined)controls.seek(d.seekTime);}};
 for(const action of actions)try{navigator.mediaSession.setActionHandler(action,handlers[action]!);}catch{/* Optional browser action. */}
}
export function updateNarrationMedia(id:string,playing:boolean,time:number,duration:number,rate:number){
 if(!navigator.mediaSession||mediaSessionOwner()!==id)return;
 navigator.mediaSession.playbackState=playing?'playing':'paused';
 try{if(duration>0&&Number.isFinite(duration))navigator.mediaSession.setPositionState?.({duration,position:Math.max(0,Math.min(time,duration)),playbackRate:rate});}catch{/* Metadata in transition. */}
}
export function clearNarrationMedia(id:string){
 if(mediaSessionOwner()!==id)return;
 releaseMediaSession(id);
 if(!navigator.mediaSession)return;
 for(const action of actions)try{navigator.mediaSession.setActionHandler(action,null);}catch{/* Unsupported. */}
 navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';
 try{navigator.mediaSession.setPositionState?.();}catch{/* Unsupported. */}
}
