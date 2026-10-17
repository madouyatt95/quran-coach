import {useEffect,useState} from 'react';
export function useHomeClock(){
    const [now,setNow]=useState(()=>new Date());
    useEffect(()=>{
        const refresh=()=>setNow(previous=>Math.floor(previous.getTime()/60000)===Math.floor(Date.now()/60000)?previous:new Date());
        const timer=setInterval(refresh,1000);
        window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
        return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
    },[]);
    return now;
}
