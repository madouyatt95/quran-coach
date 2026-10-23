import type {BookAmbience} from './bookLibrary';
let player:HTMLAudioElement|undefined,timer:ReturnType<typeof setInterval>|undefined,revision=0;
/** Original non-musical sound textures; narration has an independent, unchanged signal. */
export function setBookAmbience(kind:BookAmbience,volume:number){
 const token=++revision;if(timer)clearInterval(timer);
 if(!player&&kind==='silence')return Promise.resolve();
 player??=new Audio();player.loop=true;player.preload='auto';
 const target=kind==='silence'?0:Math.max(0,Math.min(.25,volume));
 const next=kind==='silence'?'':new URL(`/audio/ambience/${kind}.mp3`,location.origin).href;
 if(next&&player.src!==next){player.src=next;player.volume=0;}
 const start=player.volume,started=performance.now();
 timer=setInterval(()=>{if(token!==revision||!player)return;const phase=Math.min(1,(performance.now()-started)/1600);player.volume=start+(target-start)*phase;if(phase===1){clearInterval(timer);timer=undefined;if(!target)player.pause();}},40);
 return target?player.play().catch(()=>{if(token===revision)stopBookAmbience();throw new Error('Touchez de nouveau Ambiance pour activer le son.');}):Promise.resolve();
}
export function stopBookAmbience(){revision++;if(timer)clearInterval(timer);timer=undefined;player?.pause();}
