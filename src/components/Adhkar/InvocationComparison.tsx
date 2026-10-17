import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {useEffect,useRef,useState} from 'react';
import type {Invocation} from '../../lib/adhkarExperience';
import {invocationRecording} from '../../lib/invocationLearning';
import {playMediaClip} from '../../lib/mediaPlayback';
import {playAdhkarAudio,stopAdhkarAudio} from '../../lib/adhkarAudioService';
export function InvocationComparison({invocation,referenceAudio,rate=1}:{invocation:Invocation;referenceAudio?:{url:string;ranges:number[][]};rate?:number}){
 const reference=referenceAudio||invocationRecording(invocation),[part,setPart]=useState(-1),[url,setUrl]=useState(''),[status,setStatus]=useState(''),[error,setError]=useState(''),[recording,setRecording]=useState(false),[busy,setBusy]=useState(false);
 const stream=useRef<MediaStream|null>(null),recorder=useRef<MediaRecorder|null>(null),objectUrl=useRef(''),epoch=useRef(0),clip=useRef<AbortController|null>(null),limit=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),mounted=useRef(true),awaitingMicrophone=useRef(false);
 const stop=()=>{epoch.current++;awaitingMicrophone.current=false;clearTimeout(limit.current);if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;clip.current?.abort();stopAdhkarAudio();if(mounted.current){setRecording(false);setBusy(false);}};
 useEffect(()=>{mounted.current=true;const cancel=()=>stop();window.addEventListener('quran-stop-playback',cancel);const hidden=()=>{if(document.hidden&&(awaitingMicrophone.current||recorder.current?.state==='recording'))stop();};document.addEventListener('visibilitychange',hidden);return()=>{mounted.current=false;stop();URL.revokeObjectURL(objectUrl.current);window.removeEventListener('quran-stop-playback',cancel);document.removeEventListener('visibilitychange',hidden);};},[]);
 const remove=()=>{stop();recorder.current=null;URL.revokeObjectURL(objectUrl.current);objectUrl.current='';setUrl('');setStatus('Enregistrement supprimé.');};
 const claimAudio=()=>{window.dispatchEvent(new Event('quran-stop-playback'));const player=useAudioPlayerStore.getState();if(player.isPlaying||player.isLoading)player.togglePlay();};
 const record=async()=>{
  claimAudio();const token=++epoch.current;setError('');setBusy(true);setStatus('Autorisez le microphone pour commencer.');
  try{
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('L’enregistrement n’est pas disponible dans ce navigateur.');
   awaitingMicrophone.current=true;const media=await navigator.mediaDevices.getUserMedia({audio:true});awaitingMicrophone.current=false;if(token!==epoch.current||!mounted.current){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;
   const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));const rec=new MediaRecorder(media,mime?{mimeType:mime}:undefined);recorder.current=rec;const chunks:Blob[]=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.onstop=()=>{media.getTracks().forEach(t=>t.stop());clearTimeout(limit.current);if(!mounted.current||recorder.current!==rec)return;const blob=new Blob(chunks,{type:rec.mimeType});if(!blob.size){setError('Aucun son enregistré. Réessayez.');return;}URL.revokeObjectURL(objectUrl.current);objectUrl.current=URL.createObjectURL(blob);setUrl(objectUrl.current);setStatus('Votre prise est prête. Elle reste sur cet appareil jusqu’à votre départ de cette page.');setRecording(false);setBusy(false);};
   rec.onerror=()=>{stop();setError('L’enregistrement a été interrompu. Réessayez.');};
   rec.start();setRecording(true);setBusy(false);setStatus('Enregistrement en cours…');limit.current=setTimeout(()=>stop(),180000);
  }catch(e){stop();setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Microphone non autorisé. Vous pouvez l’autoriser dans les réglages du navigateur.':e instanceof Error?e.message:'Microphone indisponible.');setStatus('');}
 };
 const listen=async(mode:'reference'|'mine'|'compare')=>{
  claimAudio();const c=new AbortController();clip.current=c;setBusy(true);setError('');
  try{const player=new Audio();if(mode!=='mine'){setStatus('Écoutez le modèle.');if(reference){const range=part<0?undefined:reference.ranges[part];if(!await playMediaClip(player,reference.url,{signal:c.signal,start:range?.[0],end:range?.[1],rate}))throw new Error('Lecture du modèle indisponible.');}else await playAdhkarAudio(invocation.arabic,invocation.id,invocation.categoryId,invocation.source);}
   if(c.signal.aborted)return;if(mode!=='reference'){setStatus('Écoutez votre récitation.');if(!await playMediaClip(player,url,{signal:c.signal}))throw new Error('Lecture de votre prise indisponible.');}if(!c.signal.aborted)setStatus('Vous pouvez réécouter ou refaire ce passage.');
  }catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'Lecture indisponible.');}finally{if(clip.current===c)setBusy(false);}
 };
 return <details className="inv-details"><summary>🎙️ Je récite, puis je compare</summary><div className="inv-details-body"><p>Écoutez le modèle, enregistrez-vous, puis comparez. Aucun son n’est envoyé et aucune note automatique n’est attribuée. La prise est limitée à 3 minutes et effacée en quittant cette page.</p>{reference&&reference.ranges.length>1&&<label>Passage à travailler <select aria-label="Passage à comparer" disabled={recording||busy} value={part} onChange={e=>{remove();setPart(Number(e.target.value));}}><option value={-1}>Invocation entière</option>{reference.ranges.map((_,n)=><option key={n} value={n}>Passage {n+1}</option>)}</select></label>}<div className="inv-comparison-actions"><button disabled={recording||busy} onClick={()=>void listen('reference')}>Écouter le modèle</button><button disabled={busy} onClick={()=>recording?stop():void record()}>{recording?'Terminer l’enregistrement':url?'Refaire ma prise':'M’enregistrer'}</button>{url&&<><button disabled={recording||busy} onClick={()=>void listen('mine')}>Ma récitation</button><button disabled={recording||busy} onClick={()=>void listen('compare')}>Comparer les deux</button><button disabled={recording||busy} onClick={remove}>Supprimer ma prise</button></>}{busy&&<button onClick={stop}>Arrêter</button>}</div><p role="status">{status}</p>{error&&<p role="alert">{error}</p>}</div></details>;
}
