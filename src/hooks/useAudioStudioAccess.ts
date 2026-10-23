import {useEffect, useReducer, useState} from 'react';
import {audioAdmin} from '../lib/audioAdmin';
import {AUDIO_API} from '../lib/audioLibrary';
import {progressClient} from '../lib/progressVault';

/** A navigation hint only. Every studio request is independently authorized by the server. */
export function useAudioStudioAccess(enabled = true) {
 const [revision,refresh] = useReducer(value => value + 1,0);
 const [access,setAccess] = useState({revision:-1,allowed:false});
 useEffect(()=>{
  if(!AUDIO_API)return;
  // Keep the auth callback synchronous: awaiting another auth call here can deadlock.
  const {data} = progressClient().auth.onAuthStateChange(()=>refresh());
  return ()=>data.subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  if(!enabled||!AUDIO_API)return;
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),15000);
  void audioAdmin<{audioStudio:boolean}>('access',undefined,controller.signal)
   .then(result=>{if(!controller.signal.aborted)setAccess({revision,allowed:result.audioStudio===true});})
   .catch(()=>{if(!controller.signal.aborted)setAccess({revision,allowed:false});})
   .finally(()=>clearTimeout(timeout));
  return ()=>{controller.abort();clearTimeout(timeout);};
 },[enabled,revision]);
 return enabled&&access.revision===revision&&access.allowed;
}
