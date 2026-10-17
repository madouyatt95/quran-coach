import {useCallback,useEffect,useRef,useState} from 'react';
export type RecitationDelay='duration'|5|10|20|30;
export interface RecitationPause {remaining:number;total:number;paused:boolean}
export function recitationSeconds(delay:RecitationDelay,duration:number,rate:number){
    return delay==='duration'?Math.max(5,Math.min(600,Math.ceil((Number.isFinite(duration)&&duration>0?duration:10)/(rate>0?rate:1)))):delay;
}
/** A silence belongs to one ended verse. Hidden documents pause it, never skip ahead. */
export function useRecitationPause(onContinue:()=>void){
    const [state,setState]=useState<RecitationPause|null>(null);
    const current=useRef<RecitationPause|null>(null),deadline=useRef(0);
    const callback=useRef(onContinue);callback.current=onContinue;
    const publish=useCallback((value:RecitationPause|null)=>{current.current=value;setState(value);},[]);
    const clear=useCallback(()=>publish(null),[publish]);
    const start=useCallback((seconds:number)=>{deadline.current=Date.now()+seconds*1000;publish({remaining:seconds,total:seconds,paused:document.hidden});},[publish]);
    const pause=useCallback(()=>{const value=current.current;if(value&&!value.paused)publish({...value,remaining:Math.max(0,(deadline.current-Date.now())/1000),paused:true});},[publish]);
    const toggle=useCallback(()=>{const value=current.current;if(!value)return;if(value.paused){deadline.current=Date.now()+value.remaining*1000;publish({...value,paused:false});}else pause();},[pause,publish]);
    const advance=useCallback(()=>{if(!current.current)return;clear();callback.current();},[clear]);
    useEffect(()=>{
        if(!state)return;
        const tick=setInterval(()=>{const value=current.current;if(!value||value.paused)return;if(document.hidden){pause();return;}const remaining=Math.max(0,(deadline.current-Date.now())/1000);if(remaining===0)advance();else publish({...value,remaining});},250);
        const hidden=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hidden);
        return()=>{clearInterval(tick);current.current=null;document.removeEventListener('visibilitychange',hidden);};
    },[!!state,advance,pause,publish]);
    return {state,current,start,clear,pause,toggle,advance};
}
