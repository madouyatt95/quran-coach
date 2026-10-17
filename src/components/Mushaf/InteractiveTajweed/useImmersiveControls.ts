import {useCallback,useEffect,useState} from 'react';
export function useImmersiveControls(active:boolean,blocked:boolean){
    const [activity,setActivity]=useState(0);
    const [expired,setExpired]=useState<string|null>(null);
    const context=`${active}:${blocked}:${activity}`;
    const [lastContext,setLastContext]=useState(context);
    if(lastContext!==context){setLastContext(context);setExpired(null);}
    const wake=useCallback(()=>setActivity(value=>value+1),[]);
    useEffect(()=>{
        if(!active||blocked)return;
        const timer=setTimeout(()=>setExpired(context),4000);
        return()=>clearTimeout(timer);
    },[active,blocked,context]);
    return {hidden:active&&!blocked&&expired===context,wake};
}
