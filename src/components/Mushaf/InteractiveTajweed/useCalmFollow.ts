import {useEffect,useRef,useState,type RefObject} from 'react';

export function followDistance(view:{top:number;bottom:number},word:{top:number;bottom:number}){
    const height=view.bottom-view.top;
    if(word.top<view.top+16)return word.top-view.top-32;
    if(word.bottom>view.bottom-Math.min(64,height*.15))return word.bottom-(view.top+height*.7);
    return 0;
}
/** Only deliberate input suspends follow; programmatic scroll events never do. */
export function useCalmFollow(viewport:RefObject<HTMLDivElement|null>,wordKey:string|null,active:boolean,options:{desk?:boolean;verseKey?:string|null;blocked?:boolean}={}){
    const {desk=false,verseKey=null,blocked=false}=options;
    const [paused,setPaused]=useState(false),[request,setRequest]=useState(0);
    const pointer=useRef<{x:number;y:number}|null>(null);
    useEffect(()=>{if(!active)setPaused(false);},[active]);
    useEffect(()=>{
        const root=viewport.current;if(!root)return;
        const pause=()=>{if(active)setPaused(true);};
        const down=(e:PointerEvent)=>{pointer.current={x:e.clientX,y:e.clientY};};
        const move=(e:PointerEvent)=>{const p=pointer.current;if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>12)pause();};
        const end=()=>{pointer.current=null;};
        const key=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))pause();};
        root.addEventListener('wheel',pause,{passive:true});root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move);window.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);root.addEventListener('keydown',key);
        return()=>{root.removeEventListener('wheel',pause);root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);root.removeEventListener('pointercancel',end);root.removeEventListener('keydown',key);};
    },[viewport,active]);
    useEffect(()=>{
        if(!active||paused||blocked)return;
        const root=viewport.current;if(!root)return;
        const follow=()=>{
            const word=wordKey?root.querySelector<HTMLElement>(`[data-word-key="${wordKey}"]`):verseKey?root.querySelector<HTMLElement>(`[data-verse-key="${verseKey}"]`):null;
            if(!word)return;
            const r=root.getBoundingClientRect(),w=word.getBoundingClientRect();
            // A line-sized comfort band avoids chasing every word on a short upper screen.
            const top=desk?followLineDistance(r,w):followDistance(r,w);
            const left=w.left<r.left?w.left-r.left-8:w.right>r.right?w.right-r.right+8:0;
            if(top||left)root.scrollBy({top,left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        };
        follow();
        const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(follow);
        observer?.observe(root);
        return()=>observer?.disconnect();
    },[viewport,wordKey,verseKey,paused,request,active,desk,blocked]);
    return {paused:active&&paused,resume:()=>{setPaused(false);setRequest(n=>n+1);}};
}

export function followLineDistance(view:{top:number;bottom:number},word:{top:number;bottom:number}){
    const height=view.bottom-view.top;
    const line=Math.max(20,word.bottom-word.top);
    const margin=Math.min(line,height*.18);
    if(word.top>=view.top+margin&&word.bottom<=view.bottom-margin)return 0;
    return (word.top+word.bottom)/2-(view.top+height*.45);
}
