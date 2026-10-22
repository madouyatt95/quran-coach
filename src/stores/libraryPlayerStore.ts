import {create} from 'zustand';
import type {LibraryAudio} from '../lib/audioProduction';
import {libraryAudioSource} from '../lib/audioLibrary';
import {useAudioLibraryStore} from './audioLibraryStore';
import {useAudioPlayerStore} from './audioPlayerStore';
import {bindNarrationMedia,clearNarrationMedia,updateNarrationMedia} from '../lib/narrationMediaSession';
import {claimMediaSession} from '../lib/mediaSessionOwner';
import {unlockAudio} from '../lib/audioUnlock';
interface Player {item:LibraryAudio|null;playing:boolean;loading:boolean;position:number;duration:number;rate:number;error:string;deadline:number;play:(item:LibraryAudio)=>Promise<void>;toggle:()=>void;seek:(seconds:number)=>void;setRate:(rate:number)=>void;sleep:(minutes:number)=>void;close:()=>void}
let audio:HTMLAudioElement|undefined,sequence=0,blob:string|undefined,lastSave=0;
const owner='audio-library';
function save(){const s=useLibraryPlayer.getState();if(s.item&&audio)useAudioLibraryStore.getState().savePosition(s.item.id,audio.currentTime);}
function pause(){sequence++;audio?.pause();save();useLibraryPlayer.setState({playing:false,loading:false});}
function ensure(){
 if(audio)return audio;
 audio=new Audio();audio.preload='metadata';
 audio.addEventListener('timeupdate',()=>{
  const s=useLibraryPlayer.getState();if(!audio||!s.item)return;
  if(s.deadline&&Date.now()>=s.deadline){pause();useLibraryPlayer.setState({deadline:0});}
  const duration=Number.isFinite(audio.duration)?audio.duration:s.item.duration;
  useLibraryPlayer.setState({position:audio.currentTime,duration});updateNarrationMedia(owner,!audio.paused,audio.currentTime,duration,s.rate);
  if(Date.now()-lastSave>2500){save();lastSave=Date.now();}
 });
 audio.addEventListener('ended',()=>{save();useLibraryPlayer.setState({playing:false});updateNarrationMedia(owner,false,audio!.currentTime,audio!.duration,useLibraryPlayer.getState().rate);});
 audio.addEventListener('error',()=>{pause();useLibraryPlayer.setState({error:'Lecture interrompue. Réessayez ou téléchargez cet épisode.'});});
 audio.addEventListener('pause',()=>useLibraryPlayer.setState({playing:false}));
 window.addEventListener('quran-stop-playback',()=>{pause();clearNarrationMedia(owner);});
 window.addEventListener('pagehide',save);
 return audio;
}
function bind(item:LibraryAudio){claimMediaSession(owner);bindNarrationMedia(owner,'Bibliothèque Quran Coach',item.title,{artist:item.narrator,play:()=>useLibraryPlayer.getState().toggle(),pause,seek:(value,relative)=>useLibraryPlayer.getState().seek(relative?useLibraryPlayer.getState().position+value:value)});}
export const useLibraryPlayer=create<Player>((set,get)=>({item:null,playing:false,loading:false,position:0,duration:0,rate:1,error:'',deadline:0,
 play:async item=>{
  void unlockAudio();pause();window.dispatchEvent(new Event('quran-stop-playback'));const q=useAudioPlayerStore.getState();if(q.isPlaying)q.togglePlay();
  const token=++sequence,player=ensure();bind(item);set({item,loading:true,error:'',position:0,duration:item.duration});
  try{
   const source=await libraryAudioSource(item);if(token!==sequence){if(source.startsWith('blob:'))URL.revokeObjectURL(source);return;}
   if(blob)URL.revokeObjectURL(blob);blob=source.startsWith('blob:')?source:undefined;
   const saved=useAudioLibraryStore.getState().positions[item.id]?.seconds||0,start=saved<item.duration-2?saved:0;
   player.src=source;player.playbackRate=get().rate;
   player.onloadedmetadata=()=>{if(token===sequence)player.currentTime=Math.min(start,Number.isFinite(player.duration)?player.duration:0);};
   bind(item);await player.play();if(token!==sequence)return;set({playing:true,loading:false});
  }catch{if(token===sequence)set({error:'Lecture indisponible. Réessayez avec une connexion.',playing:false,loading:false});}
 },
 toggle:()=>{const s=get();if(s.loading){pause();return;}if(s.playing){pause();return;}if(!s.item)return;void s.play(s.item);},
 seek:seconds=>{if(audio&&get().item&&Number.isFinite(seconds)){audio.currentTime=Math.max(0,Math.min(seconds,get().duration));set({position:audio.currentTime});save();}},
 setRate:rate=>{if(![.75,1,1.25,1.5,1.75,2].includes(rate))return;if(audio)audio.playbackRate=rate;set({rate});},
 sleep:minutes=>set({deadline:minutes>0?Date.now()+minutes*60000:0}),
 close:()=>{pause();clearNarrationMedia(owner);if(audio){audio.removeAttribute('src');audio.load();audio.onloadedmetadata=null;}if(blob)URL.revokeObjectURL(blob);blob=undefined;set({item:null,deadline:0,error:''});}
}));
