import {useCallback,useEffect,useState} from 'react';
export type ScreenAwakeStatus='off'|'requesting'|'active'|'paused'|'unavailable';
/** Own only this reader's lock; release it on navigation, backgrounding or disable. */
export function useReaderScreenAwake(enabled:boolean){
    const supported=typeof navigator!=='undefined'&&'wakeLock' in navigator;
    const [status,setStatus]=useState<ScreenAwakeStatus>('off');
    const [attempt,setAttempt]=useState(0);
    const retry=useCallback(()=>setAttempt(n=>n+1),[]);
    useEffect(()=>{
        if(!enabled){setStatus('off');return;}
        if(!supported){setStatus('unavailable');return;}
        let disposed=false,pending=false,lock:WakeLockSentinel|null=null;
        const release=()=>{const held=lock;lock=null;if(held)void held.release().catch(()=>{});};
        const request=async()=>{
            if(disposed||document.visibilityState!=='visible'||pending||lock&&!lock.released)return;
            pending=true;setStatus('requesting');
            try{
                const acquired=await navigator.wakeLock.request('screen');
                if(disposed||document.visibilityState!=='visible'){await acquired.release();return;}
                lock=acquired;
                acquired.addEventListener('release',()=>{
                    if(lock===acquired){lock=null;if(!disposed)setStatus('paused');}
                },{once:true});
                setStatus(acquired.released?'paused':'active');
            }catch{if(!disposed)setStatus('paused');}
            finally{pending=false;}
        };
        const visibility=()=>{if(document.visibilityState==='visible')void request();else{release();setStatus('paused');}};
        const pagehide=()=>{release();setStatus('paused');};
        document.addEventListener('visibilitychange',visibility);
        window.addEventListener('pagehide',pagehide);
        window.addEventListener('pageshow',visibility);
        visibility();
        return()=>{disposed=true;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',visibility);release();};
    },[enabled,supported,attempt]);
    return {status:enabled?status:'off' as ScreenAwakeStatus,supported,retry};
}
