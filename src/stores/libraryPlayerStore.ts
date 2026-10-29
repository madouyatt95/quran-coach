import {create} from 'zustand';
import type {LibraryAudio} from '../lib/audioProduction';
import {libraryAudioSource,loadAudioLibrary} from '../lib/audioLibrary';
import {useAudioLibraryStore} from './audioLibraryStore';
import {useAudioPlayerStore} from './audioPlayerStore';
import {bindNarrationMedia,clearNarrationMedia,updateNarrationMedia} from '../lib/narrationMediaSession';
import {claimMediaSession} from '../lib/mediaSessionOwner';
import {unlockAudio} from '../lib/audioUnlock';
import {bookForAudio,chapterForAudio,chapterPlayback} from '../lib/bookLibrary';
import {isBookEnd,nextAudioBook} from '../lib/bookAutoplay';
interface PlayOptions {queue?:LibraryAudio[];fromStart?:boolean;startAt?:number;autoplay?:boolean;continueSeries?:boolean}
interface Player {autoAdvance:{from:string;to:string}|null;cancelledNextFor:string;nextBook:ReturnType<typeof nextAudioBook>;nextBookAt:number;visitedBooks:string[];cancelNextBook:()=>void;playNextBook:()=>void;setAutoNextBook:(enabled:boolean)=>void;queue:LibraryAudio[];stopAtChapter:boolean;completedChapter:string;setStopAtChapter:(value:boolean)=>void;item:LibraryAudio|null;playing:boolean;loading:boolean;position:number;duration:number;rate:number;error:string;deadline:number;play:(item:LibraryAudio,options?:PlayOptions)=>Promise<void>;pause:()=>void;toggle:()=>void;seek:(seconds:number)=>void;seekChapter:(seconds:number)=>void;setRate:(rate:number)=>void;sleep:(minutes:number)=>void;close:()=>void}
let audio:HTMLAudioElement|undefined,sequence=0,blob:string|undefined,lastSave=0;
const owner='audio-library';
let nextTimer:ReturnType<typeof setTimeout>|undefined,sleepTimer:ReturnType<typeof setTimeout>|undefined;
function clearNextBook(){clearTimeout(nextTimer);nextTimer=undefined;useLibraryPlayer.setState({nextBook:null,nextBookAt:0});}
function cancelNextBook(){const item=useLibraryPlayer.getState().item;clearNextBook();useLibraryPlayer.setState({cancelledNextFor:item?bookForAudio(item)?.id||'':''});}
function setAutoNextBook(enabled:boolean){useAudioLibraryStore.getState().setAutoNextBook(enabled);if(!enabled){cancelNextBook();return;}useLibraryPlayer.setState({cancelledNextFor:''});const item=useLibraryPlayer.getState().item;if(item)void prepareNextBook(item,sequence);}
async function prepareNextBook(item:LibraryAudio,token:number){
 try{const items=await loadAudioLibrary();const s=useLibraryPlayer.getState();if(token!==sequence||s.item?.id!==item.id)return;if(!useAudioLibraryStore.getState().autoNextBook||s.cancelledNextFor===bookForAudio(item)?.id)return;const nextBook=nextAudioBook(item,items,s.visitedBooks);useLibraryPlayer.setState({nextBook});}catch{/* A failed catalogue must not interrupt the current book. */}
}
function playNextBook(){const s=useLibraryPlayer.getState();if(!s.nextBook||!useAudioLibraryStore.getState().autoNextBook||s.stopAtChapter||(s.deadline&&Date.now()>=s.deadline)){clearNextBook();return;}const next=s.nextBook,from=bookForAudio(s.item!)?.id;if(!from)return;void s.play(next.queue[0],{queue:next.queue,fromStart:true,continueSeries:true});useLibraryPlayer.setState({autoAdvance:{from,to:next.book.id}});}
async function scheduleNextBook(item:LibraryAudio,token:number){
 const valid=()=>{const s=useLibraryPlayer.getState();return token===sequence&&s.item?.id===item.id&&s.cancelledNextFor!==bookForAudio(item)?.id&&!s.stopAtChapter&&useAudioLibraryStore.getState().autoNextBook&&(!s.deadline||Date.now()<s.deadline);};
 if(!valid())return;if(!useLibraryPlayer.getState().nextBook)await prepareNextBook(item,token);if(!valid()||!useLibraryPlayer.getState().nextBook)return;
 useLibraryPlayer.setState({nextBookAt:Date.now()+8000});clearTimeout(nextTimer);nextTimer=setTimeout(playNextBook,8000);
}

function save(){const s=useLibraryPlayer.getState();if(s.item&&audio)useAudioLibraryStore.getState().savePosition(s.item.id,audio.currentTime);}
function pause(){sequence++;clearNextBook();audio?.pause();save();useLibraryPlayer.setState({playing:false,loading:false});}
function ensure(){
 if(audio)return audio;
 audio=new Audio();audio.preload='metadata';
 audio.addEventListener('timeupdate',()=>{
  const s=useLibraryPlayer.getState();if(!audio||!s.item)return;
  if(s.deadline&&Date.now()>=s.deadline){pause();useLibraryPlayer.setState({deadline:0,queue:[]});return;}
  const duration=Number.isFinite(audio.duration)?audio.duration:s.item.duration;
  useLibraryPlayer.setState({position:audio.currentTime,duration});updateNarrationMedia(owner,!audio.paused,audio.currentTime,duration,s.rate);
  if(Date.now()-lastSave>2500){save();lastSave=Date.now();}
 });
 audio.addEventListener('ended',()=>{
  save();const s=useLibraryPlayer.getState(),index=s.queue.findIndex(i=>i.id===s.item?.id),next=index>=0?s.queue[index+1]:undefined;
  const sameChapter=!!next&&bookForAudio(next)?.id===bookForAudio(s.item!)?.id&&chapterForAudio(next)===chapterForAudio(s.item!);
  useLibraryPlayer.setState({playing:false,...(!sameChapter&&s.item?{completedChapter:s.item.id}:{})});
  updateNarrationMedia(owner,false,audio!.currentTime,audio!.duration,s.rate);
  if(next&&(!s.stopAtChapter||sameChapter)&&(!s.deadline||Date.now()<s.deadline))void s.play(next,{queue:s.queue,fromStart:true,continueSeries:true});
  else if(!next&&s.item&&isBookEnd(s.item))void scheduleNextBook(s.item,sequence);
 });
 audio.addEventListener('error',()=>{pause();useLibraryPlayer.setState({error:'Lecture interrompue. Réessayez ou téléchargez cet épisode.'});});
 audio.addEventListener('pause',()=>useLibraryPlayer.setState({playing:false}));
 window.addEventListener('quran-stop-playback',()=>{pause();clearNarrationMedia(owner);});
 window.addEventListener('pagehide',save);
 return audio;
}
function bind(item:LibraryAudio){claimMediaSession(owner);bindNarrationMedia(owner,'Bibliothèque Quran Coach',chapterPlayback(item,useLibraryPlayer.getState().queue,0).title,{artist:item.narrator,play:()=>useLibraryPlayer.getState().toggle(),pause,seek:(value,relative)=>useLibraryPlayer.getState().seek(relative?useLibraryPlayer.getState().position+value:value)});}
export const useLibraryPlayer=create<Player>((set,get)=>({autoAdvance:null,cancelledNextFor:'',nextBook:null,nextBookAt:0,visitedBooks:[],cancelNextBook,playNextBook,setAutoNextBook,queue:[],stopAtChapter:false,completedChapter:'',setStopAtChapter:stopAtChapter=>{if(stopAtChapter)clearNextBook();set({stopAtChapter});const item=get().item;if(!stopAtChapter&&item)void prepareNextBook(item,sequence);},item:null,playing:false,loading:false,position:0,duration:0,rate:1,error:'',deadline:0,
 play:async (item,options)=>{
  const queue=options?.queue||[],previousBook=get().item?bookForAudio(get().item!):undefined;
  void unlockAudio();pause();window.dispatchEvent(new Event('quran-stop-playback'));const q=useAudioPlayerStore.getState();if(q.isPlaying)q.togglePlay();
  const token=++sequence,player=ensure(),book=bookForAudio(item);bind(item);set({item,queue,loading:true,error:'',position:0,duration:item.duration,autoAdvance:options?.continueSeries?get().autoAdvance:null,cancelledNextFor:book&&previousBook?.id===book.id?get().cancelledNextFor:'',visitedBooks:book?(options?.continueSeries?[...new Set([...get().visitedBooks,book.id])]:[book.id]):[]});
  void prepareNextBook(item,token);
  try{
   const source=await libraryAudioSource(item);if(token!==sequence){if(source.startsWith('blob:'))URL.revokeObjectURL(source);return;}
   if(blob)URL.revokeObjectURL(blob);blob=source.startsWith('blob:')?source:undefined;
   const saved=options?.startAt??(options?.fromStart?0:useAudioLibraryStore.getState().positions[item.id]?.seconds||0),start=options?.startAt!==undefined?Math.max(0,Math.min(saved,item.duration)):saved<item.duration-2?saved:0;
   player.src=source;player.playbackRate=get().rate;
   player.onloadedmetadata=()=>{if(token===sequence)player.currentTime=Math.min(start,Number.isFinite(player.duration)?player.duration:0);};
   bind(item);if(options?.autoplay===false){set({position:start,playing:false,loading:false});useAudioLibraryStore.getState().savePosition(item.id,start);updateNarrationMedia(owner,false,start,item.duration,get().rate);return;}await player.play();if(token!==sequence)return;set({playing:true,loading:false});
  }catch{if(token===sequence)set({error:'Lecture indisponible. Réessayez avec une connexion.',playing:false,loading:false});}
 },
 pause,
 toggle:()=>{const s=get();if(s.loading){pause();return;}if(s.playing){pause();return;}if(!s.item)return;void s.play(s.item,{queue:s.queue,continueSeries:true});},
 seek:seconds=>{if(audio&&get().item&&Number.isFinite(seconds)){audio.currentTime=Math.max(0,Math.min(seconds,get().duration));set({position:audio.currentTime});save();}},
 seekChapter:seconds=>{const s=get();if(!s.item)return;const chapter=chapterPlayback(s.item,s.queue,s.position);let remaining=Math.max(0,Math.min(seconds,chapter.duration));for(const [i,part] of chapter.parts.entries()){if(remaining<part.duration||i===chapter.parts.length-1){if(part.id===s.item.id)s.seek(remaining);else void s.play(part,{queue:s.queue,startAt:remaining,continueSeries:true});break;}remaining-=part.duration;}},
 setRate:rate=>{if(![.75,1,1.25,1.5,1.75,2].includes(rate))return;if(audio)audio.playbackRate=rate;set({rate});},
 sleep:minutes=>{clearTimeout(sleepTimer);const deadline=Number.isFinite(minutes)&&minutes>0?Date.now()+minutes*60000:0;set({deadline});if(deadline)sleepTimer=setTimeout(()=>{pause();set({deadline:0,queue:[]});},Math.max(0,deadline-Date.now()));},
 close:()=>{pause();clearTimeout(sleepTimer);clearNarrationMedia(owner);if(audio){audio.removeAttribute('src');audio.load();audio.onloadedmetadata=null;}if(blob)URL.revokeObjectURL(blob);blob=undefined;set({item:null,queue:[],visitedBooks:[],autoAdvance:null,cancelledNextFor:'',deadline:0,error:'',completedChapter:''});}
}));
