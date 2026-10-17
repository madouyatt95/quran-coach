import {useCallback,useEffect,useRef,useState} from 'react';
import {getRecordedNarration,narrationSentenceAt} from '../../lib/recordedNarration';
import {type EditorialJourney,narrativeSentences} from '../../lib/editorialJourneys';
import {playTts,stopTts} from '../../lib/ttsService';
import {playMediaClip} from '../../lib/mediaPlayback';
import {getAudioUrl} from '../../lib/quranApi';
import chapters from '../../lib/interactiveMushaf/chapters.json';
import {useEditorialJourneyStore} from '../../stores/editorialJourneyStore';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {bindNarrationMedia,clearNarrationMedia,updateNarrationMedia} from '../../lib/narrationMediaSession';
export function useJourneyAudio(journey:EditorialJourney,onStep:(index:number)=>void,options?:{recordedOnly?:boolean}) {
 const [playing,setPlaying]=useState(false),[error,setError]=useState(''),[spoken,setSpoken]=useState(-1);
 const [position,setPosition]=useState(0),[duration,setDuration]=useState(0),[rate,setRate]=useState(1),[stopAfter,setStopAfterState]=useState('none');
 const controller=useRef<AbortController|null>(null),audio=useRef<HTMLAudioElement|null>(null),currentIndex=useRef(0),rateRef=useRef(1);
 const stopMode=useRef('none'),deadline=useRef(0),mediaId=`narration:${journey.id}`;
 const resume=useRef<()=>void>(()=>{}),currentRecording=useRef<Awaited<ReturnType<typeof getRecordedNarration>>>(null);
 const pause=useCallback(()=>{controller.current?.abort();controller.current=null;audio.current?.pause();stopTts();setPlaying(false);updateNarrationMedia(mediaId,false,audio.current?.currentTime||0,audio.current?.duration||0,rateRef.current);},[mediaId]);
 const clearSleep=useCallback(()=>{deadline.current=0;stopMode.current='none';setStopAfterState('none');},[]);
 const checkDeadline=useCallback(()=>{if(deadline.current&&Date.now()>=deadline.current){pause();clearSleep();return true;}return false;},[pause,clearSleep]);
 useEffect(()=>{const cancel=()=>{pause();clearNarrationMedia(mediaId);};window.addEventListener('quran-stop-playback',cancel);const timer=setInterval(checkDeadline,1000);return()=>{clearInterval(timer);pause();clearNarrationMedia(mediaId);window.removeEventListener('quran-stop-playback',cancel);};},[pause,checkDeadline,mediaId]);
 const setStopAfter=(mode:string)=>{stopMode.current=mode;deadline.current=/^\d+$/.test(mode)?Date.now()+Number(mode)*60000:0;setStopAfterState(mode);};
 const setSpeed=(value:number)=>{rateRef.current=value;setRate(value);if(audio.current)audio.current.playbackRate=value;};
 const update=(step:string,sentence=0,seconds=0,complete=false)=>{const store=useEditorialJourneyStore.getState(),old=store.progress[journey.id];store.saveProgress(journey.id,{step,sentence,seconds,completed:[...new Set([...(old?.completed||[]),...(complete?[step]:[])])],updatedAt:Date.now()});};
 const seek=(seconds:number,relative=false)=>{const player=audio.current;if(!player||!Number.isFinite(player.duration))return;player.currentTime=Math.max(0,Math.min(player.duration-.05,relative?player.currentTime+seconds:seconds));const step=journey.steps[currentIndex.current];const sentence=currentRecording.current?narrationSentenceAt(currentRecording.current,player.currentTime):0;setPosition(player.currentTime);setSpoken(currentRecording.current?sentence:-1);update(step.id,sentence,player.currentTime);player.dispatchEvent(new Event('timeupdate'));};
 const play=async(startIndex:number,startSentence?:number)=>{
  pause();window.dispatchEvent(new Event('quran-stop-playback'));const global=useAudioPlayerStore.getState();if(global.isPlaying)global.togglePlay();
  const c=new AbortController();controller.current=c;setPlaying(true);setError('');
  // Reuse one element across chapters and verses so mobile media controls keep their session.
  const player=audio.current??new Audio();audio.current=player;
  try{for(let i=startIndex;i<journey.steps.length&&!c.signal.aborted;i++){
   if(checkDeadline())break;
   const step=journey.steps[i];currentIndex.current=i;onStep(i);setSpoken(-1);setDuration(0);setPosition(0);
   const saved=useEditorialJourneyStore.getState().progress[journey.id];
   if(step.kind==='reflection'){update(step.id);break;}
   let url='',start=0;let recording:Awaited<ReturnType<typeof getRecordedNarration>>=null;
   if(step.kind==='narrative'){
    const sentences=narrativeSentences(step.text),begin=i===startIndex&&startSentence!==undefined?Math.max(0,Math.min(startSentence,sentences.length-1)):saved?.step===step.id?Math.min(saved.sentence,sentences.length-1):0;
    recording=await getRecordedNarration(step.text);if(c.signal.aborted)return;
    if(recording){url=recording.url;start=startSentence!==undefined&&i===startIndex?recording.sentences[begin]?.start||0:saved?.step===step.id?Math.min(saved.seconds||recording.sentences[begin]?.start||0,recording.duration):0;}
    else if(options?.recordedOnly)throw new Error('La narration préparée n’a pas pu être chargée. Réessayez avec une connexion.');
    else for(let n=begin;n<sentences.length&&!c.signal.aborted;n++){update(step.id,n);await playTts(sentences[n],{lang:'fr',rate:rateRef.current,signal:c.signal,onStart:()=>{if(!c.signal.aborted)setSpoken(n);}});}
   }else{url=getAudioUrl('ar.alafasy',chapters[step.surah!-1].offset+step.ayah!);start=saved?.step===step.id?saved.seconds:0;}
   currentRecording.current=recording;
   if(url&&!c.signal.aborted){
    const progress=()=>{if(c.signal.aborted||checkDeadline())return;const sentence=recording?narrationSentenceAt(recording,player.currentTime):0;setSpoken(recording?sentence:-1);setPosition(player.currentTime);setDuration(Number.isFinite(player.duration)?player.duration:recording?.duration||0);update(step.id,sentence,player.currentTime);updateNarrationMedia(mediaId,!player.paused,player.currentTime,player.duration,rateRef.current);};
    player.ontimeupdate=progress;
    bindNarrationMedia(mediaId,journey.title,step.title,{play:()=>resume.current(),pause,seek,artist:step.kind==='verse'?'Mishary Alafasy':'Quran Coach · Narration française'});
    const success=await playMediaClip(player,url,{signal:c.signal,start,rate:rateRef.current,onStarted:()=>{bindNarrationMedia(mediaId,journey.title,step.title,{play:()=>resume.current(),pause,seek,artist:step.kind==='verse'?'Mishary Alafasy':'Quran Coach · Narration française'});progress();}});
    player.ontimeupdate=null;
    if(!success&&!c.signal.aborted)throw new Error('La lecture n’a pas pu être chargée. Réessayez.');
   }
   if(!c.signal.aborted){update(step.id,0,0,true);if(stopMode.current==='chapter'){clearSleep();setDuration(0);setPosition(0);currentRecording.current=null;const next=Math.min(i+1,journey.steps.length-1);onStep(next);currentIndex.current=next;update(journey.steps[next].id);break;}}
  }}catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'Écoute indisponible. Réessayez.');}
  finally{if(controller.current===c){controller.current=null;setPlaying(false);setSpoken(-1);updateNarrationMedia(mediaId,false,player.currentTime,player.duration,rateRef.current);}}
 };
 useEffect(()=>{resume.current=()=>{if(!controller.current)void play(currentIndex.current);};});
 const selectStep=(index:number)=>{pause();clearNarrationMedia(mediaId);currentIndex.current=index;currentRecording.current=null;setPosition(0);setDuration(0);};
 return {playing,error,spoken,pause,play,selectStep,position,duration,rate,setSpeed,seek,stopAfter,setStopAfter};
}
